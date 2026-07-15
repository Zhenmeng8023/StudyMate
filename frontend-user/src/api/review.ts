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
    sourceType?: "all" | "none" | string;
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
  if (filters?.sourceType && filters.sourceType !== "all") {
    params.set("sourceType", filters.sourceType);
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

export async function getTodayReviewQueue(session: AuthSession) {
  return request<ReviewQueuePayload>("/review/today", {
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
