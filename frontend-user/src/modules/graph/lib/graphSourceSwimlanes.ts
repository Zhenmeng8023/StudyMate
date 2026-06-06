import { buildSourceSwimlaneLayout } from "@studymate/graph-core";
import type { GraphDocumentPayload } from "../../../api/client";
import {
  isGeneratedSourceSwimlaneGroup,
  stageHeight,
  stageWidth
} from "./workspaceControllerHelpers";

type BuildGraphSourceSwimlaneDocumentOptions = {
  makeGroupId: (sourceKey: string, index: number) => string;
};

type BuildGraphSourceSwimlaneDocumentResult = {
  document: GraphDocumentPayload;
  selectedNodeIds: string[];
  status: string;
};

export function buildGraphSourceSwimlaneDocument(
  document: GraphDocumentPayload,
  selectedNodeIds: string[],
  options: BuildGraphSourceSwimlaneDocumentOptions
): BuildGraphSourceSwimlaneDocumentResult {
  const selectedSet = new Set(selectedNodeIds);
  const selectedNodes = document.nodes.filter((node) => selectedSet.has(node.id));
  if (selectedNodes.length < 2) {
    return {
      document,
      selectedNodeIds: [],
      status: ""
    };
  }

  const anchorX = Math.min(...selectedNodes.map((node) => node.x));
  const anchorY = Math.min(...selectedNodes.map((node) => node.y));
  const layout = buildSourceSwimlaneLayout(selectedNodes, {
    anchorX,
    anchorY,
    makeGroupId: options.makeGroupId,
    stageHeight,
    stageWidth
  });
  const layoutNodes = new Map(layout.nodes.map((node) => [node.id, node]));
  const nextDocument: GraphDocumentPayload = {
    ...document,
    nodes: document.nodes.map((node) => {
      const nextNode = layoutNodes.get(node.id);
      return nextNode ? { ...node, x: nextNode.x, y: nextNode.y } : node;
    }),
    groups: [
      ...document.groups.filter(
        (group) => !(isGeneratedSourceSwimlaneGroup(group) && group.nodeIds.some((nodeId) => selectedSet.has(nodeId)))
      ),
      ...layout.groups.map((group) => ({
        ...group,
        nodeIds: [...group.nodeIds],
        metadata: group.metadata ? { ...group.metadata } : undefined
      }))
    ]
  };

  return {
    document: nextDocument,
    selectedNodeIds: layout.nodes.map((node) => node.id),
    status: `已生成 ${layout.laneCount} 条来源泳道`
  };
}
