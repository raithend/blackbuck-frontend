"use client";

import { safeYamlParse } from "@/app/lib/yaml-utils";
import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { TreeNode } from "../../types/types";
import { useGeologicalAge } from "../geological/geological-context";
import { processTreeData } from "./tree-data-processor";

// d3の階層ノードの型を拡張
interface ExtendedHierarchyNode extends d3.HierarchyNode<TreeNode> {
	color: string; // undefinedを許容しない
	x: number;
	y: number;
}

interface PhylogeneticTreeProps {
	customTreeFile?: string;
	customTreeContent?: string;
	onError?: (error: string) => void;
}

export function PhylogeneticTree({
	customTreeFile,
	customTreeContent,
	onError,
}: PhylogeneticTreeProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const { selectedAgeIds } = useGeologicalAge();
			const { theme, resolvedTheme } = useTheme();
	const [customTreeData, setCustomTreeData] = useState<TreeNode | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// カスタムツリーファイルまたはコンテンツの読み込み
	useEffect(() => {
		if (!customTreeFile && !customTreeContent) {
			setCustomTreeData(null);
			return;
		}

		const loadCustomTreeData = async () => {
			setIsLoading(true);
			try {
				let data: TreeNode | null = null;

				if (customTreeContent) {
					// データベースから直接コンテンツを読み込み（YAML形式）
					try {
						const parsedData = safeYamlParse(customTreeContent);
						if (
							parsedData &&
							typeof parsedData === "object" &&
							"name" in parsedData
						) {
							data = parsedData as TreeNode;
						}
					} catch (yamlError) {
						console.warn(
							"YAMLデータの解析に失敗しました（無視されます）:",
							yamlError,
						);
						if (onError) {
							onError("YAMLの構文エラーがあります。無効な部分は無視されます。");
						}
					}
				} else if (customTreeFile) {
					// ファイルURLから読み込み（YAML形式）
					try {
						const response = await fetch(customTreeFile);
						if (!response.ok) {
							throw new Error("Failed to load custom tree data");
						}
						const text = await response.text();
						const parsedData = safeYamlParse(text);
						if (
							parsedData &&
							typeof parsedData === "object" &&
							"name" in parsedData
						) {
							data = parsedData as TreeNode;
						}
					} catch (yamlError) {
						console.warn(
							"YAMLファイルの解析に失敗しました（無視されます）:",
							yamlError,
						);
					}
				}

				setCustomTreeData(data);
			} catch (error) {
				console.error("カスタムツリーデータの読み込みに失敗しました:", error);
				setCustomTreeData(null);
			} finally {
				setIsLoading(false);
			}
		};

		loadCustomTreeData();
	}, [customTreeFile, customTreeContent, onError]);

	useEffect(() => {
		if (!svgRef.current || isLoading) return;



		// データの処理
		let processedData: TreeNode | null;

		if (customTreeData) {
			// カスタムツリーデータを使用（地質時代によるフィルタリングを適用）
			processedData = processTreeData(selectedAgeIds, customTreeData);
		} else {
			// デフォルトのツリーデータを使用
			processedData = processTreeData(selectedAgeIds);
		}



		if (!processedData) {
			return;
		}

		// SVGの設定
		const radius = 500;
		const innerRadius = 100;
		const labelOffset = 20;

		// 既存のSVG要素をクリア
		d3.select(svgRef.current).selectAll("*").remove();

		// SVGの作成
		const svg = d3
			.select(svgRef.current)
			.attr("width", radius * 2.5)
			.attr("height", radius * 2.5)
			.attr("viewBox", `0 0 ${radius * 2.5} ${radius * 2.5}`)
			.append("g")
			.attr("transform", `translate(${radius * 1.25},${radius * 1.25})`)
			.style("font", "20px sans-serif");

		// 色の設定
		const color = d3.scaleOrdinal(d3.schemeCategory10);

		// データの階層構造を作成
		const root = d3.hierarchy<TreeNode>(processedData) as ExtendedHierarchyNode;

		// クラスターレイアウトの設定
		const cluster = d3
			.cluster<TreeNode>()
			.size([360, radius - innerRadius])
			.separation((a, b) => {
				// すべてのノード間の距離を一定に設定
				return 1.0;
			});

		// レイアウトを適用
		cluster(root);

		// ノードの色を設定する関数
		const setColor = (d: ExtendedHierarchyNode) => {
			d.color = d.parent
				? (d.parent as ExtendedHierarchyNode).color
				: color(d.depth.toString());
			if (d.children) d.children.forEach(setColor);
		};

		// 色を設定
		setColor(root);

		// リンクの描画
		const links = svg
			.append("g")
			.attr("fill", "none")
			.attr("stroke", (resolvedTheme || theme) === "dark" ? "#555" : "#999")
			.attr("stroke-width", 2.5)
			.selectAll("path")
			.data(root.links())
			.join("path")
			.attr("d", (d: d3.HierarchyLink<TreeNode>) => {
				const source = d.source as ExtendedHierarchyNode;
				const target = d.target as ExtendedHierarchyNode;
				const startAngle = ((source.x - 90) / 180) * Math.PI;
				const endAngle = ((target.x - 90) / 180) * Math.PI;
				const startRadius = source.y;
				const endRadius = target.y;

				const c0 = Math.cos(startAngle);
				const s0 = Math.sin(startAngle);
				const c1 = Math.cos(endAngle);
				const s1 = Math.sin(endAngle);

				return `M${startRadius * c0},${startRadius * s0}
                ${
									endAngle === startAngle
										? ""
										: `A${startRadius},${startRadius} 0 0 ${endAngle > startAngle ? 1 : 0} ${startRadius * c1},${startRadius * s1}`
								}
                L${endRadius * c1},${endRadius * s1}`;
			})
			.attr(
				"stroke",
				(d: d3.HierarchyLink<TreeNode>) =>
					(d.target as ExtendedHierarchyNode).color || ((resolvedTheme || theme) === "dark" ? "#555" : "#999"),
			)
			.attr("stroke-opacity", 0.4)
			.attr("id", (d: d3.HierarchyLink<TreeNode>, i: number) => `link-${i}`);

		// ノードの描画
		const node = svg
			.append("g")
			.selectAll("a")
			.data(root.descendants())
			.join("a")
			.attr(
				"xlink:href",
				(d: ExtendedHierarchyNode) =>
					`/classifications/${encodeURIComponent(d.data.name ?? "")}`,
			)
			.attr("target", "_blank")
			.attr(
				"transform",
				(d: ExtendedHierarchyNode) => `
        rotate(${d.x - 90})
        translate(${d.y},0)
      `,
			);

		// ノードの円を描画
		node
			.append("circle")
			.attr("fill", (d: ExtendedHierarchyNode) => d.color || "#555")
			.attr("r", 2.5);

		// 葉ノードのみラベルを描画
		node
			.filter((d: ExtendedHierarchyNode) => !d.children)
			.append("text")
			.attr("dy", "0.31em")
			.attr("x", (d: ExtendedHierarchyNode) => {
				const angle = d.x;
				const isRightSide = angle < 180;
				return isRightSide ? labelOffset : -labelOffset;
			})
			.attr("text-anchor", (d: ExtendedHierarchyNode) => {
				const angle = d.x;
				return angle < 180 ? "start" : "end";
			})
			.attr("transform", (d: ExtendedHierarchyNode) => {
				const angle = d.x;
				const isRightSide = angle < 180;
				const rotation = isRightSide ? 0 : 180;
				const translateX = isRightSide ? labelOffset : -labelOffset;
				return `rotate(${rotation}) translate(${translateX},0)`;
			})
			.text((d: ExtendedHierarchyNode) => d.data.name ?? "")
			.style("fill", (resolvedTheme || theme) === "dark" ? "white" : "black")
			.style("font-size", "24px")

			.on("mouseover", (event: MouseEvent, d: ExtendedHierarchyNode) => {
				// 現在のノードからルートまでのパスを強調
				let current = d;
				while (current.parent) {
					const link = links.filter(
						(l: d3.HierarchyLink<TreeNode>) => l.target === current,
					);
					link.attr("stroke-opacity", 1).attr("stroke-width", 4);
					current = current.parent as ExtendedHierarchyNode;
				}
			})
			.on("mouseout", () => {
				// すべてのパスを元の状態に戻す
				links.attr("stroke-opacity", 0.4).attr("stroke-width", 2.5);
			});
	}, [selectedAgeIds, customTreeData, isLoading, theme, resolvedTheme]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-lg">系統樹を読み込み中...</div>
			</div>
		);
	}

	return <svg ref={svgRef} className="w-full h-full" />;
}
