import { request, withAuth } from "./core";
import type {
  AiDraftPayload,
  AiTaskPayload,
  AiUsageSummaryPayload,
  AuthPayload,
  AuthSession,
  CardDraftPayload,
  CreateCardNoteResultPayload,
  CardPayload,
  DeckExportPayload,
  DeckImportPayload,
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
  ManagedCardNotePayload,
  NotePayload,
  NoteVersionPayload,
  PostDetailPayload,
  PostSummary,
  ProfilePayload,
  ReaderAnnotationPayload,
  ReaderStatePayload,
  ReviewQueuePayload,
  ReviewFeedbackPayload,
  ReviewInsightsPayload,
  ReviewResultPayload,
  SourceProfilePayload,
  UndoReviewResultPayload,
  TogglePayload
} from "./types";

export async function listDecks(session: AuthSession) {
  return request<DeckPayload[]>("/decks", {
    headers: withAuth(session)
  });
}

export async function createDeck(
  session: AuthSession,
  input: { title: string; description: string; visibility: "private" | "public" }
) {
  return request<DeckPayload>("/decks", {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function listDeckCards(
  session: AuthSession,
  deckId: string,
  filters?: {
    query?: string;
    status?: "all" | "active" | "suspended" | "buried";
    queueState?: "all" | "new" | "learning" | "review" | "relearning" | "suspended" | "buried";
    sourceType?: "all" | "none" | string;
    sourceId?: string;
    dueBucket?: "all" | "due" | "upcoming";
    tag?: string;
  }
) {
  const params = new URLSearchParams();
  if (filters?.query?.trim()) {
    params.set("q", filters.query.trim());
  }
  if (filters?.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters?.queueState && filters.queueState !== "all") {
    params.set("queueState", filters.queueState);
  }
  if (filters?.sourceType && filters.sourceType !== "all") {
    params.set("sourceType", filters.sourceType);
  }
  if (filters?.sourceId?.trim()) {
    params.set("sourceId", filters.sourceId.trim());
  }
  if (filters?.dueBucket && filters.dueBucket !== "all") {
    params.set("dueBucket", filters.dueBucket);
  }
  if (filters?.tag?.trim()) {
    params.set("tag", filters.tag.trim());
  }

  const path = params.size ? `/decks/${deckId}/cards?${params.toString()}` : `/decks/${deckId}/cards`;
  return request<CardPayload[]>(path, {
    headers: withAuth(session)
  });
}

export async function createDeckCard(
  session: AuthSession,
  deckId: string,
  input: {
    cardType: string;
    front: string;
    back: string;
    tags?: string[];
    sourceType?: string;
    sourceId?: string;
    sourceMetadata?: Record<string, unknown>;
  }
) {
  return request<CardPayload>(`/decks/${deckId}/cards`, {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function createDeckCardNote(
  session: AuthSession,
  deckId: string,
  input: {
    noteTypeCode: string;
    primarySourceLink?: {
      sourceType: string;
      sourceId: string;
      title?: string;
      excerpt?: string;
      locator?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    };
    sourceLinks?: Array<{
      sourceType: string;
      sourceId: string;
      title?: string;
      excerpt?: string;
      locator?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }>;
    fields: Record<string, string>;
    templateKeys?: string[];
  }
) {
  return request<CreateCardNoteResultPayload>(`/decks/${deckId}/card-notes`, {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function listCardNotes(session: AuthSession, filters?: { sourceType?: string; sourceId?: string }) {
  const params = new URLSearchParams();
  if (filters?.sourceType?.trim()) params.set("sourceType", filters.sourceType.trim());
  if (filters?.sourceId?.trim()) params.set("sourceId", filters.sourceId.trim());
  return request<ManagedCardNotePayload[]>(`/card-notes${params.size ? `?${params.toString()}` : ""}`, {
    headers: withAuth(session)
  });
}

export async function getCardNote(session: AuthSession, cardNoteId: string) {
  return request<ManagedCardNotePayload>(`/card-notes/${encodeURIComponent(cardNoteId)}`, { headers: withAuth(session) });
}

export async function deleteCard(session: AuthSession, cardId: string, input: { confirmDeleteHistory: boolean }) {
  return request<{ cardId: string; deckId: string; deletedReviewCount: number }>(`/cards/${encodeURIComponent(cardId)}`, {
    method: "DELETE", headers: withAuth(session), body: input
  });
}

export async function updateCardNote(
  session: AuthSession,
  cardNoteId: string,
  input: {
    fields?: Record<string, string>;
    primarySourceLink?: {
      sourceType: string;
      sourceId: string;
      title?: string;
      excerpt?: string;
      locator?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    };
    sourceLinks?: Array<{
      sourceType: string;
      sourceId: string;
      title?: string;
      excerpt?: string;
      locator?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }>;
    tags?: string[];
  }
) {
  return request<ManagedCardNotePayload>(`/card-notes/${cardNoteId}`, {
    method: "PATCH",
    headers: withAuth(session),
    body: input
  });
}

export async function bulkCreateDeckCards(
  session: AuthSession,
  deckId: string,
  cards: Array<{
    cardType: string;
    draftId?: string;
    front: string;
    back: string;
    tags?: string[];
    sourceType?: string;
    sourceId?: string;
    sourceMetadata?: Record<string, unknown>;
  }>
) {
  return request<CardPayload[]>(`/decks/${deckId}/cards/bulk`, {
    method: "POST",
    headers: withAuth(session),
    body: { cards }
  });
}

export async function exportDeckCards(
  session: AuthSession,
  deckId: string,
  format: "json" | "csv"
) {
  return request<DeckExportPayload>(`/decks/${deckId}/export?format=${format}`, {
    headers: withAuth(session)
  });
}

export async function importDeckCards(
  session: AuthSession,
  deckId: string,
  input: {
    filename: string;
    content: string;
    previewOnly?: boolean;
  }
) {
  return request<DeckImportPayload>(`/decks/${deckId}/import`, {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function getTodayReviewQueue(session: AuthSession) {
  return request<ReviewQueuePayload>("/review/today", {
    headers: withAuth(session)
  });
}

export async function getReviewFeedback(session: AuthSession) {
  return request<ReviewFeedbackPayload>("/review/feedback", {
    headers: withAuth(session)
  });
}

export async function getReviewInsights(session: AuthSession) {
  return request<ReviewInsightsPayload>("/review/insights", {
    headers: withAuth(session)
  });
}

export async function getSourceProfile(
  session: AuthSession,
  query: {
    sourceType: string;
    sourceId: string;
  }
) {
  const params = new URLSearchParams({
    sourceType: query.sourceType,
    sourceId: query.sourceId
  });
  return request<SourceProfilePayload>(`/review/source-profile?${params.toString()}`, {
    headers: withAuth(session)
  });
}

export async function reviewCard(
  session: AuthSession,
  cardId: string,
  input: {
    rating: "again" | "hard" | "good" | "easy";
    elapsedMs: number;
  }
) {
  return request<ReviewResultPayload>(`/cards/${cardId}/review`, {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function undoReviewCard(
  session: AuthSession,
  cardId: string,
  input: {
    reviewId: string;
    previousSchedule: {
      cardId: string;
      userId: string;
      dueAt: string;
      learningStep: number;
      intervalDays: number;
      easeFactor: number;
      repetitionCount: number;
      lapseCount: number;
      state: string;
      updatedAt: string;
    };
  }
) {
  return request<UndoReviewResultPayload>(`/cards/${cardId}/review/undo`, {
    method: "POST",
    headers: withAuth(session),
    body: input
  });
}

export async function updateCardStatus(
  session: AuthSession,
  cardId: string,
  input: {
    status: "active" | "suspended" | "buried";
  }
) {
  return request<CardPayload>(`/cards/${cardId}/status`, {
    method: "PATCH",
    headers: withAuth(session),
    body: input
  });
}

export async function updateCardTags(
  session: AuthSession,
  cardId: string,
  input: {
    tags: string[];
  }
) {
  return request<CardPayload>(`/cards/${cardId}/tags`, {
    method: "PATCH",
    headers: withAuth(session),
    body: input
  });
}
