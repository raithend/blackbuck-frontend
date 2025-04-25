"use client";

import { useEffect, useState } from "react";
import Tree from "react-d3-tree";

interface CladogramProps {
  speciesId: string;
}

const treeData = {
  name: "ネコ科",
  children: [
    {
      name: "ヒョウ属",
      children: [
        {
          name: "ライオン"
        },
        {
          name: "トラ"
        }
      ]
    },
    {
      name: "ネコ属",
      children: [
        {
          name: "イエネコ"
        }
      ]
    }
  ]
};

export function Cladogram({ speciesId }: CladogramProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const updateDimensions = () => {
      const container = document.getElementById("cladogram-container");
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  if (!isMounted) {
    return <div className="h-[400px] w-full" />;
  }

  return (
    <div id="cladogram-container" className="h-[400px] w-full">
      <Tree
        data={treeData}
        orientation="horizontal"
        pathFunc="step"
        separation={{ siblings: 1, nonSiblings: 1.5 }}
        dimensions={dimensions}
        nodeSize={{ x: 150, y: 100 }}
        renderCustomNodeElement={({ nodeDatum, toggleNode }) => (
          <g>
            <circle
              r={10}
              onClick={toggleNode}
              className="fill-primary stroke-background"
            />
            <text
              dy=".31em"
              x={20}
              className="fill-foreground text-sm"
            >
              {nodeDatum.name}
            </text>
          </g>
        )}
      />
    </div>
  );
} 