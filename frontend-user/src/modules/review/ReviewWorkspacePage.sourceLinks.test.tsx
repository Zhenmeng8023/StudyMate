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

function buildPdfAnchorCard(): CardPayload {
  return {
    id: "card-pdf-anchor-1",
    deckId: "deck-1",
    ownerUserId: "user-1",
    cardType: "basic",
    front: "Linked PDF anchor card",
    back: "Return to the anchored PDF context",
    sourceType: "pdf-anchor",
    sourceId: "anchor-1",
    sourceMetadata: {
      materialId: "material-1",
      page: 8,
      anchorId: "anchor-1"
    },
    status: "active",
    createdAt: "2026-06-02T12:00:00Z",
    updatedAt: "2026-06-02T12:00:00Z"
  };
}

function buildGraphCard(): CardPayload {
  return {
    id: "card-graph-1",
    deckId: "deck-1",
    ownerUserId: "user-1",
    cardType: "basic",
    front: "Linked graph card",
    back: "Return to the graph workspace focus",
    sourceType: "graph",
    sourceId: "node-1",
    sourceMetadata: {
      graphId: "graph-1",
      focusX: 420,
      focusY: 320,
      focusWidth: 220,
      focusHeight: 120,
      focusLabel: "Binary Tree"
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

    renderPage("/review?card=card-annotation-1");

    expect(await screen.findByText("Linked annotation card")).toBeInTheDocument();
    await waitFor(() => {
      const links = screen.getAllByRole("link", { name: "回到批注" });
      expect(links).toHaveLength(2);
      for (const link of links) {
        expect(link).toHaveAttribute("href", "/reader/material-1?page=12&annotation=annotation-1");
      }
    });
  });

  it("renders pdf anchor source links with reader page and anchor query context", async () => {
    const deck = buildDeck();
    const card = buildPdfAnchorCard();
    listDecksMock.mockResolvedValue([deck]);
    listDeckCardsMock.mockResolvedValue([card]);
    getTodayReviewQueueMock.mockResolvedValue(buildQueue(card));

    renderPage("/review?card=card-pdf-anchor-1");

    expect(await screen.findByText("Linked PDF anchor card")).toBeInTheDocument();
    await waitFor(() => {
      const links = screen.getAllByRole("link", { name: "回到 PDF 页" });
      expect(links).toHaveLength(2);
      for (const link of links) {
        expect(link).toHaveAttribute("href", "/reader/material-1?page=8&anchor=anchor-1");
      }
    });
  });

  it("renders graph source links with graph focus query context", async () => {
    const deck = buildDeck();
    const card = buildGraphCard();
    listDecksMock.mockResolvedValue([deck]);
    listDeckCardsMock.mockResolvedValue([card]);
    getTodayReviewQueueMock.mockResolvedValue(buildQueue(card));

    renderPage("/review?card=card-graph-1");

    expect(await screen.findByText("Linked graph card")).toBeInTheDocument();
    await waitFor(() => {
      const links = screen.getAllByRole("link", { name: "回到图谱" });
      expect(links).toHaveLength(2);
      for (const link of links) {
        expect(link).toHaveAttribute(
          "href",
          "/graph?graphId=graph-1&focusX=420&focusY=320&focusWidth=220&focusHeight=120&focusLabel=Binary+Tree"
        );
      }
    });
  });
});
