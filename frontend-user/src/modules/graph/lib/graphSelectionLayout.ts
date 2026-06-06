import type { GraphNodePayload } from "../../../api/client";
import { stageHeight, stageWidth } from "./workspaceControllerHelpers";

export type GraphNodeAlignment = "left" | "top" | "center" | "middle";
export type GraphNodeDistributionAxis = "horizontal" | "vertical";

function clampNodeX(node: GraphNodePayload, x: number) {
  return Math.max(0, Math.min(stageWidth - node.width, Number(x.toFixed(1))));
}

function clampNodeY(node: GraphNodePayload, y: number) {
  return Math.max(0, Math.min(stageHeight - node.height, Number(y.toFixed(1))));
}

function getSelectedNodes(nodes: GraphNodePayload[], selectedNodeIds: string[]) {
  const selectedSet = new Set(selectedNodeIds);
  return nodes.filter((node) => selectedSet.has(node.id));
}

export function alignSelectedGraphNodes(
  nodes: GraphNodePayload[],
  selectedNodeIds: string[],
  direction: GraphNodeAlignment
) {
  const selectedNodes = getSelectedNodes(nodes, selectedNodeIds);
  if (selectedNodes.length < 2) {
    return nodes;
  }
  const selectedSet = new Set(selectedNodeIds);

  if (direction === "left") {
    const anchor = Math.min(...selectedNodes.map((node) => node.x));
    return nodes.map((node) => (selectedSet.has(node.id) ? { ...node, x: clampNodeX(node, anchor) } : node));
  }

  if (direction === "top") {
    const anchor = Math.min(...selectedNodes.map((node) => node.y));
    return nodes.map((node) => (selectedSet.has(node.id) ? { ...node, y: clampNodeY(node, anchor) } : node));
  }

  if (direction === "center") {
    const center = selectedNodes.reduce((sum, node) => sum + node.x + node.width / 2, 0) / selectedNodes.length;
    return nodes.map((node) => (selectedSet.has(node.id) ? { ...node, x: clampNodeX(node, center - node.width / 2) } : node));
  }

  const middle = selectedNodes.reduce((sum, node) => sum + node.y + node.height / 2, 0) / selectedNodes.length;
  return nodes.map((node) => (selectedSet.has(node.id) ? { ...node, y: clampNodeY(node, middle - node.height / 2) } : node));
}

export function distributeSelectedGraphNodes(
  nodes: GraphNodePayload[],
  selectedNodeIds: string[],
  axis: GraphNodeDistributionAxis
) {
  const selectedNodes = getSelectedNodes(nodes, selectedNodeIds);
  if (selectedNodes.length < 3) {
    return nodes;
  }

  const ordered = [...selectedNodes].sort((left, right) => (axis === "horizontal" ? left.x - right.x : left.y - right.y));
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const span = axis === "horizontal" ? last.x - first.x : last.y - first.y;
  if (span <= 0) {
    return nodes;
  }

  const step = span / (ordered.length - 1);
  const positions = Object.fromEntries(
    ordered.map((node, index) => [
      node.id,
      axis === "horizontal"
        ? {
            x: clampNodeX(node, first.x + index * step)
          }
        : {
            y: clampNodeY(node, first.y + index * step)
          }
    ])
  );

  return nodes.map((node) => {
    const position = positions[node.id];
    return position ? { ...node, ...position } : node;
  });
}
