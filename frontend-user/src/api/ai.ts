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
  ReviewQueuePayload,
  ReviewResultPayload,
  TogglePayload
} from "./types";

export async function listAiTasks(session: AuthSession) {
  return request<AiTaskPayload[]>("/ai/tasks", {
    headers: withAuth(session)
  });
}

export async function getAiUsageSummary(session: AuthSession) {
  return request<AiUsageSummaryPayload>("/ai/usage", {
    headers: withAuth(session)
  });
}

export async function listAiDrafts(session: AuthSession) {
  const drafts = await request<AiDraftPayload[] | null>("/ai/drafts", {
    headers: withAuth(session)
  });
  return drafts ?? [];
}
