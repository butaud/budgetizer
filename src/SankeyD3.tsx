import { schemeCategory10, scaleOrdinal } from "d3";
import { sankey, sankeyCenter, sankeyLinkHorizontal } from "d3-sankey";
import { FC } from "react";

import "./SankeyD3.css";
import { SankeyFlow } from "./schema";

export type SankeyD3Props = {
  data: {
    nodes: { id: string }[];
    links: SankeyFlow[];
  };
};

export const SankeyD3: FC<SankeyD3Props> = ({ data }) => {
  const width = Math.min(
    window.innerWidth,
    document.documentElement.clientWidth,
    document.body.clientWidth,
    1000
  );
  const height = 500;
  const colorScale = scaleOrdinal(schemeCategory10);
  const sankeyGenerator = sankey<{ id: string }, {}>()
    .nodeWidth(26)
    .nodePadding(29)
    .extent([
      [1, 1],
      [width - 1, height - 5],
    ])
    .nodeId((d) => d.id)
    .nodeAlign(sankeyCenter);
  const { nodes, links } = sankeyGenerator(data);

  const allNodes = nodes.map((node) => (
    <g key={node.index}>
      <rect
        height={(node.y1 ?? 0) - (node.y0 ?? 0)}
        width={sankeyGenerator.nodeWidth()}
        x={node.x0}
        y={node.y0}
        stroke={"black"}
        fill={colorScale(node.id) ?? "#000"}
        fillOpacity={0.8}
        rx={0.9}
        className="node"
      />
    </g>
  ));

  const allLinks = links.map((link, i) => {
    const linkGenerator = sankeyLinkHorizontal();
    const path = linkGenerator(link);

    const color =
      typeof link.source === "string"
        ? colorScale(link.source)
        : typeof link.source === "number"
        ? colorScale(link.source.toString())
        : colorScale(link.source.id);

    return (
      <path
        key={i}
        d={path ?? undefined}
        stroke={color}
        fill="none"
        strokeOpacity={0.3}
        strokeWidth={link.width}
        className="link"
      />
    );
  });

  const allLabels = nodes.map((node, i) => {
    return (
      <text
        key={i}
        x={(node.x0 ?? 0) < width / 2 ? (node.x1 ?? 0) + 6 : (node.x0 ?? 0) - 6}
        y={((node.y1 ?? 0) + (node.y0 ?? 0)) / 2}
        dy="0.35rem"
        textAnchor={
          (node.x0 ?? 0) < width / 4
            ? "start"
            : (node.x0 ?? 0) > width * 0.75
            ? "end"
            : "middle"
        }
        fontSize={14}
        fontWeight="bold"
      >
        {node.id}: $
        {node.value?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </text>
    );
  });

  return (
    <div>
      <svg width={width} height={height}>
        {allNodes}
        {allLinks}
        {allLabels}
      </svg>
    </div>
  );
};
