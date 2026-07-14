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

export async function listDeckCards(session: AuthSession, deckId: string) {
  return request<CardPayload[]>(`/decks/${deckId}/cards`, {
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

export async function updateCardStatus(
  session: AuthSession,
  cardId: string,
  input: {
    status: "active" | "suspended";
  }
) {
  return request<CardPayload>(`/cards/${cardId}/status`, {
    method: "PATCH",
    headers: withAuth(session),
    body: input
  });
}
