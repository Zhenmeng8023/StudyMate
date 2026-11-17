import type { GraphDetailPayload, GraphDocumentPayload } from "../../../../api/client";
import { normalizeDocument } from "../../lib/workspaceControllerHelpers";

export type GraphBatchSaveCommand = {
  description: string;
  document: GraphDocumentPayload;
  summary: string;
  title: string;
};

export function buildGraphBatchSaveCommand(detail: GraphDetailPayload, summary: string): GraphBatchSaveCommand {
  return {
    title: detail.title,
    description: detail.description,
    summary,
    document: stripGraphRuntimeReviewFeedback(
      normalizeDocument(detail.id, detail.currentVersion, detail.document)
    )
  };
}

export function stripGraphRuntimeReviewFeedback(document: GraphDocumentPayload): GraphDocumentPayload {
  return {
    ...document,
    nodes: document.nodes.map((node) => {
      if (!node.metadata || !("reviewFeedback" in node.metadata)) {
        return node;
      }
      const { reviewFeedback: _reviewFeedback, ...metadata } = node.metadata;
      return {
        ...node,
        metadata: Object.keys(metadata).length ? metadata : undefined
      };
    })
  };
}
