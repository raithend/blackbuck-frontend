"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '@/types/tree';
import { treeData } from '@/data/tree-data';

export function TreeOfLife() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // SVGの設定
    const width = 932;
    const height = 932;
    const radius = Math.min(width, height) / 2 - 40;

    // 既存のSVG要素をクリア
    d3.select(svgRef.current).selectAll("*").remove();

    // SVGの作成
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width/2},${height/2})`)
      .style("font", "10px sans-serif");

    // ツリーレイアウトの設定
    const treeLayout = d3.tree<TreeNode>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth);

    // データの階層構造を作成
    const root = d3.hierarchy(treeData);
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
        
        // 親ノードから子ノードへの直線的なパスを生成
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
      .attr("x", (d: any) => d.x < Math.PI ? 6 : -6)
      .attr("text-anchor", (d: any) => d.x < Math.PI ? "start" : "end")
      .attr("transform", (d: any) => d.x >= Math.PI ? "rotate(180)" : null)
      .text((d: any) => d.data.name)
      .clone(true)
      .lower()
      .attr("stroke", "white")
      .attr("stroke-width", 3);

  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900">
      <svg ref={svgRef} className="border border-gray-700 w-[932px] h-[932px]"></svg>
    </div>
  );
}