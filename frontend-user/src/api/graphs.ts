import { request, withAuth } from "./core";
import type {
  AiDraftPayload,
  AiTaskPayload,
  AiUsageSummaryPayload,
  AuthPayload,
  AuthSession,
  CardDraftPayload,
  CardPayload,
  DeckPayload,
  DiagramTemplatePayload,
  FilePayload,
  GraphCardDraftPayload,
  GraphDetailPayload,
  GraphDocumentPayload,
  GraphLayoutMode,
  GraphLayoutPreviewPayload,
  GraphSnapshotPayload,
  GraphSummaryPayload,
  GraphValidationResponse,
  MaterialFavoritePayload,
  MaterialPayload,
  MaterialRatingPayload,
  NotePayload,
  NoteVersionPayload,
  PostDetailPayload,
  PostSummary,
  ProfilePayload,
  ReaderAnnotationPayload,
  ReaderStatePayload,
  ReviewQueuePayload,
  ReviewResultPayload,
  TogglePayload
} from "./types";

export async function listGraphs(session: AuthSession) {
  return request<GraphSummaryPayload[]>("/graphs", {
    headers: withAuth(session)
  });
}

export async function createGraph(
  session: AuthSession,
  input: {
    title: string;
    description: string;
    visibility: "private" | "public";
  }
) {
  return request<GraphDetailPayload>("/graphs", {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function getGraph(session: AuthSession, graphId: string) {
  return request<GraphDetailPayload>(`/graphs/${graphId}`, {
    headers: withAuth(session)
  });
}

export async function updateGraph(
  session: AuthSession,
  graphId: string,
  input: {
    title: string;
    description: string;
    visibility: "private" | "public";
  }
) {
  return request<GraphSummaryPayload>(`/graphs/${graphId}`, {
    method: "PUT",
    headers: withAuth(session),
    body: input
  });
}

export async function deleteGraph(session: AuthSession, graphId: string) {
  return request<{ message: string }>(`/graphs/${graphId}`, {
    method: "DELETE",
    headers: withAuth(session)
  });
}

export async function batchSaveGraph(
  session: AuthSession,
  graphId: string,
  input: {
    title: string;
    description: string;
    summary: string;
    document: GraphDocumentPayload;
  }
) {
  return request<GraphDetailPayload>(`/graphs/${graphId}/batch-save`, {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function listGraphSnapshots(session: AuthSession, graphId: string) {
  return request<GraphSnapshotPayload[]>(`/graphs/${graphId}/snapshots`, {
    headers: withAuth(session)
  });
}

export async function restoreGraphSnapshot(session: AuthSession, graphId: string, versionNumber: number) {
  return request<GraphDetailPayload>(`/graphs/${graphId}/restore`, {
    method: "POST",
    headers: withAuth(session),
    body: { versionNumber }
  });
}

export async function importGraphMarkdown(session: AuthSession, graphId: string, source: string) {
  return request<GraphDetailPayload>(`/graphs/${graphId}/import/markdown`, {
    method: "POST",
    headers: withAuth(session),
    body: { source }
  });
}

export async function importGraphMermaid(session: AuthSession, graphId: string, source: string) {
  return request<GraphDetailPayload>(`/graphs/${graphId}/import/mermaid`, {
    method: "POST",
    headers: withAuth(session),
    body: { source }
  });
}

export async function validateGraph(session: AuthSession, graphId: string) {
  return request<GraphValidationResponse>(`/graphs/${graphId}/validate`, {
    method: "POST",
    headers: withAuth(session)
  });
}

export async function previewGraphLayout(
  session: AuthSession,
  graphId: string,
  input: {
    mode: GraphLayoutMode;
    nodeIds: string[];
    document: GraphDocumentPayload;
  }
) {
  return request<GraphLayoutPreviewPayload>(`/graphs/${graphId}/layouts/preview`, {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function generateGraphCardDrafts(session: AuthSession, graphId: string, nodeIds: string[]) {
  return request<GraphCardDraftPayload[]>(`/graphs/${graphId}/ai/generate-cards`, {
    method: "POST",
    headers: withAuth(session),
    body: { nodeIds }
  });
}

export async function commitGraphCardDrafts(
  session: AuthSession,
  graphId: string,
  input: {
    deckId: string;
    drafts: GraphCardDraftPayload[];
  }
) {
  return request<CardPayload[]>(`/graphs/${graphId}/ai/commit-cards`, {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function listDiagramTemplates(session: AuthSession) {
  return request<DiagramTemplatePayload[]>("/diagram/templates", {
    headers: withAuth(session)
  });
}

export async function commitGraphChangeDrafts(session: AuthSession, graphId: string, draftIds: string[]) {
  return request<GraphDetailPayload>(`/graphs/${graphId}/ai/commit-changes`, {
    method: "POST",
    headers: withAuth(session),
    body: { draftIds }
  });
}

export async function commitGraphChangeDraftSelection(
  session: AuthSession,
  graphId: string,
  input: {
    draftIds: string[];
    nodeSelections: Array<{
      draftId: string;
      nodeIds: string[];
    }>;
  }
) {
  return request<GraphDetailPayload>(`/graphs/${graphId}/ai/commit-changes`, {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}
