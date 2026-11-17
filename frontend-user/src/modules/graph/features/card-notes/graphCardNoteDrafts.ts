import type { GraphNodePayload, SourceLinkPayload } from "../../../../api/client";
import type { CardNoteComposerDraft } from "../../../../features/card-notes/CardNoteComposer";
import { getNodeDetail } from "../../nodeAppearance";

export type GraphCardNoteDraft = CardNoteComposerDraft & {
  sourceLinks: SourceLinkPayload[];
};

export function buildGraphCardNoteDrafts(graphId: string, nodes: GraphNodePayload[]): GraphCardNoteDraft[] {
  return nodes.map((node) => {
    const detail = getNodeDetail(node).trim();
    const title = node.title.trim() || "未命名节点";
    const sourceLink = buildGraphNodeSourceLink(graphId, node, detail);
    return {
      id: node.id,
      title,
      excerpt: detail,
      locatorLabel: `图谱 ${graphId} / 节点 ${node.id}`,
      front: title,
      back: detail || title,
      explanation: "从图谱节点生成，保留 graph-node SourceLink 以便复习后回到图谱。",
      sourceLinks: [sourceLink]
    };
  });
}

export function buildGraphNodeSourceLink(graphId: string, node: GraphNodePayload, excerpt?: string): SourceLinkPayload {
  return {
    sourceType: "graph-node",
    sourceId: node.id,
    title: node.title.trim() || "未命名节点",
    excerpt: excerpt?.trim() || getNodeDetail(node).trim() || undefined,
    locator: {
      graphId,
      nodeId: node.id,
      focusX: node.x,
      focusY: node.y,
      focusWidth: node.width,
      focusHeight: node.height
    },
    metadata: {
      sourceType: node.type
    }
  };
}
