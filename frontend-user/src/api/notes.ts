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

export async function listNotes(session: AuthSession, materialId?: string) {
  const search = materialId ? `?materialId=${encodeURIComponent(materialId)}` : "";
  return request<NotePayload[]>(`/notes${search}`, {
    headers: withAuth(session)
  });
}

export async function getNote(session: AuthSession, noteId: string) {
  return request<NotePayload>(`/notes/${noteId}`, {
    headers: withAuth(session)
  });
}

export async function createNote(
  session: AuthSession,
  input: {
    title: string;
    summary: string;
    content: string;
    materialId: string;
    folderName: string;
    tags: string[];
  }
) {
  return request<NotePayload>("/notes", {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function updateNote(
  session: AuthSession,
  noteId: string,
  input: {
    title: string;
    summary: string;
    content: string;
    folderName: string;
    tags: string[];
  }
) {
  return request<NotePayload>(`/notes/${noteId}`, {
    method: "PUT",
    headers: withAuth(session),
    body: input
  });
}

export async function deleteNote(session: AuthSession, noteId: string) {
  return request<{ message: string }>(`/notes/${noteId}`, {
    method: "DELETE",
    headers: withAuth(session)
  });
}

export async function listNoteVersions(session: AuthSession, noteId: string) {
  return request<NoteVersionPayload[]>(`/notes/${noteId}/versions`, {
    headers: withAuth(session)
  });
}

export async function restoreNoteVersion(session: AuthSession, noteId: string, versionId: string) {
  return request<NotePayload>(`/notes/${noteId}/versions/${versionId}/restore`, {
    method: "POST",
    headers: withAuth(session)
  });
}

export async function generateNoteCardDrafts(session: AuthSession, noteId: string) {
  return request<CardDraftPayload[]>(`/notes/${noteId}/ai/generate-cards`, {
    method: "POST",
    headers: withAuth(session)
  });
}

export async function generateNoteGraphDrafts(session: AuthSession, noteId: string) {
  return request<AiDraftPayload[]>(`/notes/${noteId}/ai/generate-graph-drafts`, {
    method: "POST",
    headers: withAuth(session)
  });
}
