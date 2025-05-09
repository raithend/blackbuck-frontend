"use client";

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TreeNode } from '@/types/tree';
import { load } from 'js-yaml';
import treeDataYaml from '@/data/tree-data.yml';

export function PhylogeneticTree() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // YAMLデータをパース
    const treeData = load(treeDataYaml) as TreeNode;

    // SVGの設定
    const radius = 500;
    const innerRadius = 100;
    const labelOffset = 20;

    // 既存のSVG要素をクリア
    d3.select(svgRef.current).selectAll("*").remove();

    // SVGの作成
    const svg = d3.select(svgRef.current)
      .attr("width", radius * 2.5)
      .attr("height", radius * 2.5)
      .attr("viewBox", `0 0 ${radius * 2.5} ${radius * 2.5}`)
      .append("g")
      .attr("transform", `translate(${radius * 1.25},${radius * 1.25})`)
      .style("font", "20px sans-serif");

    // 色の設定
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // ノードの色を設定する関数
    function setColor(d: any) {
      d.color = d.parent ? d.parent.color : color(d.depth.toString());
      if (d.children) d.children.forEach(setColor);
    }

    // データの階層構造を作成
    const root = d3.hierarchy(treeData);
    
    // クラスターレイアウトの設定
    const cluster = d3.cluster()
      .size([360, radius - innerRadius])
      .separation((a, b) => {
        // すべてのノード間の距離を一定に設定
        return 1.0;
      });

    // レイアウトを適用
    cluster(root);
    
    // 色を設定
    setColor(root);

    // リンクの描画
    const links = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-width", 2.5)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("d", (d: any) => {
        const startAngle = (d.source.x - 90) / 180 * Math.PI;
        const endAngle = (d.target.x - 90) / 180 * Math.PI;
        const startRadius = d.source.y;
        const endRadius = d.target.y;
        
        const c0 = Math.cos(startAngle);
        const s0 = Math.sin(startAngle);
        const c1 = Math.cos(endAngle);
        const s1 = Math.sin(endAngle);
        
        return `M${startRadius * c0},${startRadius * s0}
                ${endAngle === startAngle ? "" : 
                  `A${startRadius},${startRadius} 0 0 ${endAngle > startAngle ? 1 : 0} ${startRadius * c1},${startRadius * s1}`}
                L${endRadius * c1},${endRadius * s1}`;
      })
      .attr("stroke", (d: any) => d.target.color)
      .attr("stroke-opacity", 0.4)
      .attr("id", (d: any, i: number) => `link-${i}`);

    // ノードの描画
    const node = svg.append("g")
      .selectAll("a")
      .data(root.descendants())
      .join("a")
      .attr("xlink:href", (d: any) => `https://ja.wikipedia.org/wiki/${d.data.name}`)
      .attr("target", "_blank")
      .attr("transform", (d: any) => `
        rotate(${d.x - 90})
        translate(${d.y},0)
      `);

    // ノードの円を描画
    node.append("circle")
      .attr("fill", (d: any) => d.color)
      .attr("r", 2.5);

    // 葉ノード（外側のノード）のみラベルを描画
    node.filter((d: any) => !d.children)
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d: any) => {
        const angle = d.x;
        const isRightSide = angle < 180;
        return isRightSide ? labelOffset : -labelOffset;
      })
      .attr("text-anchor", (d: any) => {
        const angle = d.x;
        return angle < 180 ? "start" : "end";
      })
      .attr("transform", (d: any) => {
        const angle = d.x;
        const isRightSide = angle < 180;
        const rotation = isRightSide ? 0 : 180;
        const translateX = isRightSide ? labelOffset : -labelOffset;
        return `rotate(${rotation}) translate(${translateX},0)`;
      })
      .text((d: any) => d.data.name)
      .style("fill", "white")
      .style("font-size", "24px")
      .on("mouseover", function(event: any, d: any) {
        // 現在のノードからルートまでのパスを強調
        let current = d;
        while (current.parent) {
          const link = links.filter((l: any) => l.target === current);
          link.attr("stroke-opacity", 1)
              .attr("stroke-width", 4);
          current = current.parent;
        }
      })
      .on("mouseout", function() {
        // すべてのパスを元の状態に戻す
        links.attr("stroke-opacity", 0.4)
             .attr("stroke-width", 2.5);
      });

  }, []);

  return (
    <svg ref={svgRef} className="w-full h-full"></svg>
  );
}