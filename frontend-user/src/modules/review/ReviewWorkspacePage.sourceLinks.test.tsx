import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTodayReviewQueue, listDeckCards, listDecks, reviewCard } from "../../api/client";
import type { AuthSession, CardPayload, DeckPayload, ReviewQueuePayload } from "../../api/client";
import { ReviewWorkspacePage } from "./ReviewWorkspacePage";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    getTodayReviewQueue: vi.fn(),
    listDeckCards: vi.fn(),
    listDecks: vi.fn(),
    reviewCard: vi.fn()
  };
});

const session: AuthSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-06-02T12:00:00Z",
  user: {
    id: "user-1",
    username: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    role: "student"
  }
};

const listDecksMock = vi.mocked(listDecks);
const listDeckCardsMock = vi.mocked(listDeckCards);
const getTodayReviewQueueMock = vi.mocked(getTodayReviewQueue);
const reviewCardMock = vi.mocked(reviewCard);

function buildDeck(): DeckPayload {
  return {
    id: "deck-1",
    ownerUserId: "user-1",
    title: "Linked sources",
    description: "Cards should link back to their learning sources",
    visibility: "private",
    cardCount: 1,
    createdAt: "2026-06-02T12:00:00Z",
    updatedAt: "2026-06-02T12:00:00Z"
  };
}

function buildCard(): CardPayload {
  return {
    id: "card-1",
    deckId: "deck-1",
    ownerUserId: "user-1",
    cardType: "basic",
    front: "Linked note card",
    back: "Return to the note workspace",
    sourceType: "note",
    sourceId: "note-1",
    status: "active",
    createdAt: "2026-06-02T12:00:00Z",
    updatedAt: "2026-06-02T12:00:00Z"
  };
}

function buildAnnotationCard(): CardPayload {
  return {
    id: "card-annotation-1",
    deckId: "deck-1",
    ownerUserId: "user-1",
    cardType: "basic",
    front: "Linked annotation card",
    back: "Return to the reader annotation context",
    sourceType: "annotation",
    sourceId: "annotation-1",
    sourceMetadata: {
      materialId: "material-1",
      annotationId: "annotation-1",
      page: 12
    },
    status: "active",
    createdAt: "2026-06-02T12:00:00Z",
    updatedAt: "2026-06-02T12:00:00Z"
  };
}

function buildQueue(card: CardPayload): ReviewQueuePayload {
  return {
    dueCount: 1,
    items: [
      {
        deckTitle: "Linked sources",
        card,
        schedule: {
          cardId: card.id,
          userId: "user-1",
          dueAt: "2026-06-02T12:00:00Z",
          intervalDays: 0,
          easeFactor: 2.5,
          repetitionCount: 0,
          lapseCount: 0,
          state: "new",
          updatedAt: "2026-06-02T12:00:00Z"
        }
      }
    ]
  };
}

function renderPage(path = "/review") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ReviewWorkspacePage session={session} />
    </MemoryRouter>
  );
}

describe("ReviewWorkspacePage source links", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    listDecksMock.mockReset();
    listDeckCardsMock.mockReset();
    getTodayReviewQueueMock.mockReset();
    reviewCardMock.mockReset();

    const deck = buildDeck();
    const card = buildCard();
    listDecksMock.mockResolvedValue([deck]);
    listDeckCardsMock.mockResolvedValue([card]);
    getTodayReviewQueueMock.mockResolvedValue(buildQueue(card));
  });

  it("renders note source links for the current card and the managed card list", async () => {
    const { container } = renderPage("/review?card=card-1");

    expect(await screen.findByText("Linked note card")).toBeInTheDocument();
    await waitFor(() => {
      expect(container.querySelectorAll('a[href="/notes?selected=note-1"]')).toHaveLength(2);
    });
  });

  it("renders annotation source links with reader page and annotation query context", async () => {
    const deck = buildDeck();
    const card = buildAnnotationCard();
    listDecksMock.mockResolvedValue([deck]);
    listDeckCardsMock.mockResolvedValue([card]);
    getTodayReviewQueueMock.mockResolvedValue(buildQueue(card));

    const { container } = renderPage("/review?card=card-annotation-1");

    expect(await screen.findByText("Linked annotation card")).toBeInTheDocument();
    await waitFor(() => {
      expect(container.querySelectorAll('a[href="/reader/material-1?page=12&annotation=annotation-1"]')).toHaveLength(2);
    });
  });
});
