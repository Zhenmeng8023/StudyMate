import type { GraphNodeEmphasis, GraphNodePayload, GraphNodeTone } from "../../../api/client";
import {
  patchNodeAppearance,
  resizeNodeToPreset,
  type GraphNodeSizePreset
} from "../nodeAppearance";

function buildSelectedNodeSet(selectedNodeIds: string[]) {
  return new Set(selectedNodeIds);
}

export function applyGraphBatchTone(
  nodes: GraphNodePayload[],
  selectedNodeIds: string[],
  tone: GraphNodeTone
) {
  const selectedSet = buildSelectedNodeSet(selectedNodeIds);
  return nodes.map((node) => (selectedSet.has(node.id) ? patchNodeAppearance(node, { tone }) : node));
}

export function applyGraphBatchEmphasis(
  nodes: GraphNodePayload[],
  selectedNodeIds: string[],
  emphasis: GraphNodeEmphasis
) {
  const selectedSet = buildSelectedNodeSet(selectedNodeIds);
  return nodes.map((node) => (selectedSet.has(node.id) ? patchNodeAppearance(node, { emphasis }) : node));
}

export function applyGraphBatchSizePreset(
  nodes: GraphNodePayload[],
  selectedNodeIds: string[],
  preset: GraphNodeSizePreset
) {
  const selectedSet = buildSelectedNodeSet(selectedNodeIds);
  return nodes.map((node) => (selectedSet.has(node.id) ? resizeNodeToPreset(node, preset) : node));
}
