import { scaleOrdinal } from "d3";
import { sankey, sankeyCenter, sankeyLinkHorizontal } from "d3-sankey";
import { FC } from "react";

import "./SankeyD3.css";
import { SankeyFlow } from "../data/items";

const colorScheme = [
  "#1f77b4",
  "#ff7f0e",
  // Remove green and red since we use them for
  // shortfall and surplus
  // "#2ca02c",
  // "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];

export type SankeyD3Props = {
  data: {
    nodes: { id: string; color?: string }[];
    links: SankeyFlow[];
  };
  width: number;
  height: number;
};

const dollarFormat = (value: number | undefined) => {
  if (value === undefined) {
    return "$0.00";
  }
  if (value > 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  } else {
    return `$${value.toFixed(2)}`;
  }
};

export const SankeyD3: FC<SankeyD3Props> = ({ data, width, height }) => {
  const responsiveWidth = Math.min(
    window.innerWidth,
    document.documentElement.clientWidth,
    document.body.clientWidth,
    width
  );
  const colorScale = scaleOrdinal(colorScheme);
  const sankeyGenerator = sankey<{ id: string; color?: string }, {}>()
    .nodeWidth(26)
    .nodePadding(29)
    .extent([
      [1, 1],
      [responsiveWidth - 1, height - 5],
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
        fill={node.color ?? colorScale(node.id) ?? "#000"}
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
        : link.source.color ?? colorScale(link.source.id);

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
        x={
          (node.x0 ?? 0) < responsiveWidth / 2
            ? (node.x1 ?? 0) + 6
            : (node.x0 ?? 0) - 6
        }
        y={((node.y1 ?? 0) + (node.y0 ?? 0)) / 2}
        dy="0.35rem"
        textAnchor={
          (node.x0 ?? 0) < responsiveWidth / 4
            ? "start"
            : (node.x0 ?? 0) > responsiveWidth * 0.75
            ? "end"
            : "middle"
        }
        fontSize={14}
        fontWeight="bold"
      >
        {node.id}: {dollarFormat(node.value)}
      </text>
    );
  });

  return (
    <div>
      <svg width={responsiveWidth} height={height}>
        {allNodes}
        {allLinks}
        {allLabels}
      </svg>
    </div>
  );
};
