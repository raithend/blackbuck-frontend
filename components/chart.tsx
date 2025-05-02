"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '@/types/tree';
import treeData from '@/data/tree-data.json';

export function TreeOfLife() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // SVGの設定
    const radius = 500;

    // 既存のSVG要素をクリア
    d3.select(svgRef.current).selectAll("*").remove();

    // SVGの作成
    const svg = d3.select(svgRef.current)
      .attr("width", radius * 2)
      .attr("height", radius * 2)
      .attr("viewBox", `0 0 ${radius * 2} ${radius * 2}`)
      .append("g")
      .attr("transform", `translate(${radius},${radius})`)
      .style("font", "20px sans-serif");

    // ツリーレイアウトの設定
    const treeLayout = d3.tree<TreeNode>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => {
        // ノード間の間隔を調整
        if (a.parent === b.parent) {
          // 同じ親を持つノード間の間隔を広げる
          return 1.5;
        }
        // 異なる親を持つノード間の間隔
        return 2.5;
      });

    // データの階層構造を作成
    const root = d3.hierarchy(treeData);
    d3.cluster().size([2 * Math.PI, radius])(root);
    const treeNodes = treeLayout(root);

    // リンクの描画
    svg.append("g")
      .selectAll("path")
      .data(treeNodes.links())
      .join("path")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .attr("d", (d: any) => {
        const source = d.source;
        const target = d.target;
        const sourceAngle = source.x;
        const targetAngle = target.x;
        const sourceRadius = source.y;
        const targetRadius = target.y;
        
        return `M${sourceRadius * Math.cos(sourceAngle - Math.PI/2)},${sourceRadius * Math.sin(sourceAngle - Math.PI/2)}
                L${sourceRadius * Math.cos(targetAngle - Math.PI/2)},${sourceRadius * Math.sin(targetAngle - Math.PI/2)}
                L${targetRadius * Math.cos(targetAngle - Math.PI/2)},${targetRadius * Math.sin(targetAngle - Math.PI/2)}`;
      });

    // ノードの描画
    const node = svg.append("g")
      .selectAll("a")
      .data(treeNodes.descendants())
      .join("a")
      .attr("xlink:href", (d: any) => `https://en.wikipedia.org/wiki/${d.data.name}`)
      .attr("target", "_blank")
      .attr("transform", (d: any) => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${d.y},0)
      `);

    // ノードの円を描画
    node.append("circle")
      .attr("fill", "#999")
      .attr("r", 2.5);

    // 葉ノード（外側のノード）のみラベルを描画
    node.filter((d: any) => !d.children)
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d: any) => {
        // ラベルの位置を調整
        const angle = d.x;
        const isRightSide = angle < Math.PI;
        return isRightSide ? 8 : -8; // 左右の余白を増やす
      })
      .attr("text-anchor", (d: any) => d.x < Math.PI ? "start" : "end")
      .attr("transform", (d: any) => {
        const angle = d.x;
        const isRightSide = angle < Math.PI;
        return isRightSide ? null : "rotate(180)";
      })
      .text((d: any) => d.data.name)
      .clone(true)
      .lower()
      .attr("stroke", "white")
      .attr("stroke-width", 3);

  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
      <svg ref={svgRef} className="w-[700px] h-[700px]"></svg>
    </div>
  );
}