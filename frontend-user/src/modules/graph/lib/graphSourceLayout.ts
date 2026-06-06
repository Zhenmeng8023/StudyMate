import type { GraphGroupPayload, GraphNodePayload } from "../../../api/client";
import {
  buildSourceGroupDefinitions,
  stageHeight,
  stageWidth,
  type SourceOrganizerMode
} from "./workspaceControllerHelpers";

type OrganizeGraphNodesBySourceResult = {
  nodes: GraphNodePayload[];
  status: string;
};

type BuildGraphSourceGroupsOptions = {
  makeGroupId: (index: number) => string;
};

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

export function organizeGraphNodesBySource(
  nodes: GraphNodePayload[],
  selectedNodeIds: string[],
  mode: SourceOrganizerMode
): OrganizeGraphNodesBySourceResult {
  const selectedNodes = getSelectedNodes(nodes, selectedNodeIds);
  if (selectedNodes.length < 2) {
    return {
      nodes,
      status: mode === "type-columns" ? "已按来源类型分列整理选中节点" : "已按来源类型分行整理选中节点"
    };
  }

  const grouped = buildSourceGroupDefinitions(selectedNodes)
    .map((group) => ({
      ...group,
      nodes: selectedNodes
        .filter((node) => group.nodeIds.includes(node.id))
        .sort((left, right) => {
          const sourceLabelDiff = (left.source?.label || left.title).localeCompare(right.source?.label || right.title, "zh-CN");
          return sourceLabelDiff === 0 ? left.title.localeCompare(right.title, "zh-CN") : sourceLabelDiff;
        })
    }))
    .filter((group) => group.nodes.length > 0);

  if (grouped.length === 0) {
    return {
      nodes,
      status: mode === "type-columns" ? "已按来源类型分列整理选中节点" : "已按来源类型分行整理选中节点"
    };
  }

  const anchorLeft = Math.min(...selectedNodes.map((node) => node.x));
  const anchorTop = Math.min(...selectedNodes.map((node) => node.y));
  const laneGap = 72;
  const itemGap = 24;
  const placements = new Map<string, { x: number; y: number }>();
  let laneOffset = 0;

  for (const group of grouped) {
    if (mode === "type-columns") {
      let columnHeight = 0;
      let columnWidth = 0;
      for (const node of group.nodes) {
        placements.set(node.id, {
          x: anchorLeft + laneOffset,
          y: anchorTop + columnHeight
        });
        columnHeight += node.height + itemGap;
        columnWidth = Math.max(columnWidth, node.width);
      }
      laneOffset += columnWidth + laneGap;
      continue;
    }

    let rowWidth = 0;
    let rowHeight = 0;
    for (const node of group.nodes) {
      placements.set(node.id, {
        x: anchorLeft + rowWidth,
        y: anchorTop + laneOffset
      });
      rowWidth += node.width + itemGap;
      rowHeight = Math.max(rowHeight, node.height);
    }
    laneOffset += rowHeight + laneGap;
  }

  return {
    nodes: nodes.map((node) => {
      const placement = placements.get(node.id);
      if (!placement) {
        return node;
      }
      return {
        ...node,
        x: clampNodeX(node, placement.x),
        y: clampNodeY(node, placement.y)
      };
    }),
    status: mode === "type-columns" ? "已按来源类型分列整理选中节点" : "已按来源类型分行整理选中节点"
  };
}

export function buildGraphSourceGroups(
  nodes: GraphNodePayload[],
  selectedNodeIds: string[],
  options: BuildGraphSourceGroupsOptions
) {
  const selectedNodes = getSelectedNodes(nodes, selectedNodeIds);
  const sourceGroups = buildSourceGroupDefinitions(selectedNodes).filter((group) => group.nodeIds.length > 0);
  const groups: GraphGroupPayload[] = [];

  sourceGroups.forEach((sourceGroup, index) => {
    const groupNodes = nodes.filter((node) => sourceGroup.nodeIds.includes(node.id));
    if (groupNodes.length === 0) {
      return;
    }
    const left = Math.min(...groupNodes.map((node) => node.x));
    const top = Math.min(...groupNodes.map((node) => node.y));
    const right = Math.max(...groupNodes.map((node) => node.x + node.width));
    const bottom = Math.max(...groupNodes.map((node) => node.y + node.height));
    groups.push({
      collapsed: false,
      height: Math.min(stageHeight, bottom - top + 78),
      id: options.makeGroupId(index),
      nodeIds: [...sourceGroup.nodeIds],
      title: sourceGroup.title,
      width: Math.min(stageWidth, right - left + 56),
      x: Math.max(0, left - 28),
      y: Math.max(0, top - 40)
    });
  });

  return { groups };
}
