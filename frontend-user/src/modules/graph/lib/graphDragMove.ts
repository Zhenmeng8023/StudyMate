import type { GraphDocumentPayload, GraphNodePayload } from "../../../api/client";
import {
  buildCombinedBounds,
  buildNodeBounds,
  resolveAlignmentGuides,
  stageHeight,
  stageWidth,
  type AlignmentGuide,
  type DragState
} from "./workspaceControllerHelpers";

type NodeDragState = Extract<DragState, { kind: "node" | "multi-node" }>;

type GraphDragMoveInput = {
  clientX: number;
  clientY: number;
  document: GraphDocumentPayload;
  dragState: NodeDragState;
  hiddenNodeIds: Set<string>;
};

type GraphDragMoveResult = {
  alignmentGuides: AlignmentGuide[];
  nodes: GraphNodePayload[];
  status: string;
};

function clampNodeX(node: GraphNodePayload, x: number) {
  return Math.max(0, Math.min(stageWidth - node.width, Number(x.toFixed(1))));
}

function clampNodeY(node: GraphNodePayload, y: number) {
  return Math.max(0, Math.min(stageHeight - node.height, Number(y.toFixed(1))));
}

export function buildGraphDragMove(input: GraphDragMoveInput): GraphDragMoveResult {
  if (input.dragState.kind === "node") {
    return buildSingleNodeDragMove(input.document, input.dragState, input.clientX, input.clientY, input.hiddenNodeIds);
  }

  return buildMultiNodeDragMove(input.document, input.dragState, input.clientX, input.clientY, input.hiddenNodeIds);
}

function buildSingleNodeDragMove(
  document: GraphDocumentPayload,
  dragState: Extract<DragState, { kind: "node" }>,
  clientX: number,
  clientY: number,
  hiddenNodeIds: Set<string>
): GraphDragMoveResult {
  const rawDeltaX = (clientX - dragState.pointerX) / document.viewport.zoom;
  const rawDeltaY = (clientY - dragState.pointerY) / document.viewport.zoom;
  const movingNode = document.nodes.find((node) => node.id === dragState.nodeId);
  const stationaryNodes = document.nodes.filter((node) => node.id !== dragState.nodeId && !hiddenNodeIds.has(node.id));
  const snap =
    movingNode && stationaryNodes.length > 0
      ? resolveAlignmentGuides(
          buildNodeBounds({
            ...movingNode,
            x: dragState.originX + rawDeltaX,
            y: dragState.originY + rawDeltaY
          }),
          stationaryNodes
        )
      : { deltaX: 0, deltaY: 0, guides: [] };
  const nextX = dragState.originX + rawDeltaX + snap.deltaX;
  const nextY = dragState.originY + rawDeltaY + snap.deltaY;

  return {
    alignmentGuides: snap.guides,
    nodes: document.nodes.map((node) =>
      node.id === dragState.nodeId
        ? {
            ...node,
            x: clampNodeX(node, nextX),
            y: clampNodeY(node, nextY)
          }
        : node
    ),
    status: "正在调整节点位置"
  };
}

function buildMultiNodeDragMove(
  document: GraphDocumentPayload,
  dragState: Extract<DragState, { kind: "multi-node" }>,
  clientX: number,
  clientY: number,
  hiddenNodeIds: Set<string>
): GraphDragMoveResult {
  const rawDeltaX = (clientX - dragState.pointerX) / document.viewport.zoom;
  const rawDeltaY = (clientY - dragState.pointerY) / document.viewport.zoom;
  const movingNodes = document.nodes.filter((node) => Boolean(dragState.origins[node.id]));
  const stationaryNodes = document.nodes.filter((node) => !dragState.origins[node.id] && !hiddenNodeIds.has(node.id));
  const snap =
    movingNodes.length > 0 && stationaryNodes.length > 0
      ? resolveAlignmentGuides(
          buildCombinedBounds(
            movingNodes.map((node) => ({
              ...node,
              x: dragState.origins[node.id].x + rawDeltaX,
              y: dragState.origins[node.id].y + rawDeltaY
            }))
          ),
          stationaryNodes
        )
      : { deltaX: 0, deltaY: 0, guides: [] };
  const deltaX = rawDeltaX + snap.deltaX;
  const deltaY = rawDeltaY + snap.deltaY;

  return {
    alignmentGuides: snap.guides,
    nodes: document.nodes.map((node) => {
      const origin = dragState.origins[node.id];
      if (!origin) {
        return node;
      }
      return {
        ...node,
        x: clampNodeX(node, origin.x + deltaX),
        y: clampNodeY(node, origin.y + deltaY)
      };
    }),
    status: "正在批量调整节点位置"
  };
}
