import type { GraphNodePayload } from "../../../../api/client";
import {
  buildSourceLinkReadModel,
  buildSourceProfileTarget,
  type SourceLinkReadModel
} from "../../../../features/sources/sourceLinks";

export type GraphSourceProfileTargetPlan = {
  readModel: SourceLinkReadModel;
  target: string;
} | null;

export function buildGraphNodeSourceProfileTarget(input: {
  graphId?: string;
  node: Pick<GraphNodePayload, "id" | "metadata" | "source" | "title"> | null | undefined;
}): GraphSourceProfileTargetPlan {
  const node = input.node;
  if (!node) {
    return null;
  }

  const sourceReadModel = buildSourceLinkReadModel({
    sourceType: node.source?.type,
    sourceId: node.source?.id,
    sourceMetadata: node.metadata
  });
  const readModel =
    sourceReadModel ??
    buildSourceLinkReadModel({
      primarySourceLink: {
        sourceType: "graph-node",
        sourceId: node.id,
        title: node.title,
        locator: {
          ...(input.graphId ? { graphId: input.graphId } : {}),
          nodeId: node.id
        }
      }
    });
  const target = buildSourceProfileTarget(readModel);
  if (!readModel || !target) {
    return null;
  }

  return {
    readModel,
    target
  };
}
