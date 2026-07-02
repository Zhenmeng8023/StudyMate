import type { GraphNode, GraphSelectionRect, GraphSelectionState } from "./model.ts";

export function createGraphSelectionState(): GraphSelectionState {
  return {
    selectedNodeId: "",
    selectedNodeIds: []
  };
}

export function setGraphNodeSelection(_: GraphSelectionState, nodeId: string): GraphSelectionState {
  if (!nodeId.trim()) {
    return createGraphSelectionState();
  }
  return {
    selectedNodeId: nodeId,
    selectedNodeIds: [nodeId]
  };
}

export function clearGraphNodeSelection(_: GraphSelectionState): GraphSelectionState {
  return createGraphSelectionState();
}

export function replaceGraphNodeSelection(
  _: GraphSelectionState,
  nodeIds: string[],
  options: {
    activeNodeId?: string;
  } = {}
): GraphSelectionState {
  const normalizedNodeIds = [...new Set(nodeIds.map((nodeId) => nodeId.trim()).filter(Boolean))];
  if (normalizedNodeIds.length === 0) {
    return createGraphSelectionState();
  }

  const hasExplicitActiveNodeId = Object.prototype.hasOwnProperty.call(options, "activeNodeId");
  const activeNodeId = options.activeNodeId?.trim() ?? "";
  return {
    selectedNodeId: hasExplicitActiveNodeId
      ? activeNodeId
        ? normalizedNodeIds.includes(activeNodeId)
          ? activeNodeId
          : normalizedNodeIds[0]
        : ""
      : normalizedNodeIds[0],
    selectedNodeIds: normalizedNodeIds
  };
}

export function toggleGraphNodeSelection(selection: GraphSelectionState, nodeId: string): GraphSelectionState {
  if (!nodeId.trim()) {
    return {
      selectedNodeId: selection.selectedNodeId,
      selectedNodeIds: [...selection.selectedNodeIds]
    };
  }

  if (selection.selectedNodeIds.includes(nodeId)) {
    const selectedNodeIds = selection.selectedNodeIds.filter((item) => item !== nodeId);
    return {
      selectedNodeId: selectedNodeIds[0] ?? "",
      selectedNodeIds
    };
  }

  return {
    selectedNodeId: nodeId,
    selectedNodeIds: [...selection.selectedNodeIds, nodeId]
  };
}

export function selectGraphNodesInRect(nodes: GraphNode[], rect: GraphSelectionRect): string[] {
  const left = Math.min(rect.left, rect.right);
  const right = Math.max(rect.left, rect.right);
  const top = Math.min(rect.top, rect.bottom);
  const bottom = Math.max(rect.top, rect.bottom);
  return nodes
    .filter((node) => !rect.hiddenNodeIds?.has(node.id))
    .filter((node) => node.x < right && node.x + node.width > left && node.y < bottom && node.y + node.height > top)
    .map((node) => node.id);
}
