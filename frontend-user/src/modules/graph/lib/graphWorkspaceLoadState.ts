import type { DeckPayload, GraphDetailPayload, GraphSummaryPayload } from "../../../api/types";
import { buildSnapshotListFailureState } from "./graphPersistenceState";
import { createEmptyDocument, normalizeDocument } from "./workspaceControllerHelpers";

export type GraphWorkspaceLoadStatusKind = "created" | "loaded" | "opened";

export interface GraphWorkspaceResourceInput {
  graphs: GraphSummaryPayload[];
  decks: DeckPayload[];
}

export function buildGraphWorkspaceResourceState(
  input: GraphWorkspaceResourceInput,
  requestedGraphId: string,
  currentDraftDeckId = ""
) {
  const requestedExists = requestedGraphId && input.graphs.some((graph) => graph.id === requestedGraphId);
  return {
    initialGraphId: requestedExists ? requestedGraphId : input.graphs[0]?.id ?? "",
    selectedDraftDeckId: currentDraftDeckId || input.decks[0]?.id || ""
  };
}

export function normalizeGraphWorkspaceDetail(detail: GraphDetailPayload): GraphDetailPayload {
  const baseDocument = detail.document.graphId
    ? detail.document
    : createEmptyDocument(detail.id, detail.currentVersion);

  return {
    ...detail,
    document: normalizeDocument(detail.id, detail.currentVersion, baseDocument)
  };
}

export function buildGraphWorkspaceLoadedStatus(kind: GraphWorkspaceLoadStatusKind, snapshotsLoaded: boolean) {
  if (!snapshotsLoaded) {
    return buildSnapshotListFailureState().statusMessage;
  }

  if (kind === "created") {
    return "已创建第一张图谱";
  }

  if (kind === "opened") {
    return "已切换到目标图谱";
  }

  return "图谱工作台已就绪";
}
