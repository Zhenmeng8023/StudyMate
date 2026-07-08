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
  PdfRectPayload,
  ReviewQueuePayload,
  ReviewResultPayload,
  TogglePayload
} from "./types";

export async function getReaderState(session: AuthSession, materialId: string) {
  return request<ReaderStatePayload>(`/materials/${materialId}/reader`, {
    headers: withAuth(session)
  });
}

export async function updateReaderProgress(
  session: AuthSession,
  materialId: string,
  input: {
    currentPage: number;
    totalPages: number;
    progressPercent: number;
    bookmarks: number[];
  }
) {
  return request<ReaderStatePayload>(`/materials/${materialId}/reader/progress`, {
    method: "PUT",
    headers: withAuth(session),
    body: input
  });
}

export async function createReaderAnnotation(
  session: AuthSession,
  materialId: string,
  input: {
    page: number;
    quote: string;
    comment: string;
    color: string;
    rects?: PdfRectPayload[];
  }
) {
  return request<ReaderAnnotationPayload>(`/materials/${materialId}/reader/annotations`, {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function deleteReaderAnnotation(
  session: AuthSession,
  materialId: string,
  annotationId: string
) {
  return request<{ message: string }>(
    `/materials/${materialId}/reader/annotations/${annotationId}`,
    {
      method: "DELETE",
      headers: withAuth(session)
    }
  );
}

export async function generateAnnotationCardDrafts(
  session: AuthSession,
  materialId: string,
  annotationIds: string[]
) {
  return request<CardDraftPayload[]>(`/materials/${materialId}/reader/annotations/generate-cards`, {
    method: "POST",
    headers: withAuth(session),
    body: { annotationIds }
  });
}

export async function generateAnnotationGraphDrafts(
  session: AuthSession,
  materialId: string,
  annotationIds: string[]
) {
  return request<AiDraftPayload[]>(`/materials/${materialId}/reader/annotations/generate-graph-drafts`, {
    method: "POST",
    headers: withAuth(session),
    body: { annotationIds }
  });
}
