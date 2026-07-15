import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  bulkCreateDeckCards,
  createDeck,
  createDeckCard,
  exportDeckCards,
  getTodayReviewQueue,
  importDeckCards,
  listDeckCards,
  listDecks,
  reviewCard,
  undoReviewCard,
  updateCardStatus
} from "../../api/client";
import type { AuthSession } from "../../api/client";
import { ReviewWorkspacePage } from "./ReviewWorkspacePage";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    bulkCreateDeckCards: vi.fn(),
    createDeck: vi.fn(),
    createDeckCard: vi.fn(),
    exportDeckCards: vi.fn(),
    getTodayReviewQueue: vi.fn(),
    importDeckCards: vi.fn(),
    listDeckCards: vi.fn(),
    listDecks: vi.fn(),
    reviewCard: vi.fn(),
    undoReviewCard: vi.fn(),
    updateCardStatus: vi.fn()
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
const undoReviewCardMock = vi.mocked(undoReviewCard);
const updateCardStatusMock = vi.mocked(updateCardStatus);
const createDeckCardMock = vi.mocked(createDeckCard);
const bulkCreateDeckCardsMock = vi.mocked(bulkCreateDeckCards);
const exportDeckCardsMock = vi.mocked(exportDeckCards);
const importDeckCardsMock = vi.mocked(importDeckCards);

function renderPage(path = "/review") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ReviewWorkspacePage session={session} />
    </MemoryRouter>
  );
}

describe("ReviewWorkspacePage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    bulkCreateDeckCardsMock.mockReset();
    vi.mocked(createDeck).mockReset();
    vi.mocked(createDeckCard).mockReset();
    exportDeckCardsMock.mockReset();
    importDeckCardsMock.mockReset();
    listDecksMock.mockReset();
    listDeckCardsMock.mockReset();
    getTodayReviewQueueMock.mockReset();
    reviewCardMock.mockReset();
    undoReviewCardMock.mockReset();
    updateCardStatusMock.mockReset();
    createDeckCardMock.mockReset();

    listDecksMock.mockResolvedValue([
      {
        id: "deck-1",
        ownerUserId: "user-1",
        title: "期末复习",
        description: "高频概念",
        visibility: "private",
        cardCount: 1,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    listDeckCardsMock.mockResolvedValue([
      {
        id: "card-1",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "什么是图谱？",
        back: "节点和关系。",
        status: "active",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    getTodayReviewQueueMock.mockResolvedValue({
      dueCount: 1,
      items: [
        {
          deckTitle: "期末复习",
          card: {
            id: "card-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "什么是图谱？",
            back: "节点和关系。",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-1",
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
    });
    reviewCardMock.mockResolvedValue({
      reviewId: "review-1",
      schedule: {
        cardId: "card-1",
        userId: "user-1",
        dueAt: "2026-06-03T12:00:00Z",
        intervalDays: 1,
        easeFactor: 2.5,
        repetitionCount: 1,
        lapseCount: 0,
        state: "review",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    });
    undoReviewCardMock.mockResolvedValue({
      schedule: {
        cardId: "card-1",
        userId: "user-1",
        dueAt: "2026-06-02T12:00:00Z",
        intervalDays: 0,
        easeFactor: 2.5,
        repetitionCount: 0,
        lapseCount: 0,
        state: "new",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    });
    updateCardStatusMock.mockImplementation(async (_session, cardId, input) => ({
      id: cardId,
      deckId: "deck-1",
      ownerUserId: "user-1",
      cardType: "basic",
      front: "什么是图谱？",
      back: "节点和关系。",
      status: input.status,
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    }));
    createDeckCardMock.mockResolvedValue({
      id: "card-created-1",
      deckId: "deck-1",
      ownerUserId: "user-1",
      cardType: "basic",
      front: "Created card",
      back: "Created answer",
      tags: ["graph"],
      status: "active",
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    });
    bulkCreateDeckCardsMock.mockResolvedValue([
      {
        id: "card-imported-1",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "Imported card",
        back: "Imported answer",
        tags: ["graph"],
        status: "active",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    exportDeckCardsMock.mockResolvedValue({
      format: "json",
      filename: "deck-cards.json",
      mimeType: "application/json;charset=utf-8",
      content: "{\"cards\":[]}",
      cardCount: 1,
      exportedAt: "2026-06-02T12:00:00Z"
    });
    importDeckCardsMock.mockResolvedValue({
      preview: false,
      totalCount: 1,
      readyCount: 1,
      importedCount: 1,
      duplicateCount: 0,
      failedCount: 0,
      statusMessage: "已导入 1 张卡片到当前卡组。"
    });

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:review-export")
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn()
    });
  });

  it("shows the due card and writes back a review rating", async () => {
    const user = userEvent.setup();
    renderPage();

    await expect(screen.findByText("什么是图谱？")).resolves.toBeInTheDocument();
    expect(screen.getByText("1 张仍待完成")).toBeInTheDocument();
    expect(within(screen.getByLabelText("复习进度")).getByText(/到期/)).toHaveTextContent("1 到期");

    await user.click(screen.getByRole("button", { name: /显示答案/ }));
    expect(screen.getAllByText("节点和关系。").length).toBeGreaterThanOrEqual(1);

    await user.click(screen.getByRole("button", { name: "Good 记得" }));

    await waitFor(() => {
      expect(reviewCardMock).toHaveBeenCalledWith(
        session,
        "card-1",
        expect.objectContaining({
          rating: "good"
        })
      );
    });
    expect(await screen.findByText(/已记录复习，下次/)).toBeInTheDocument();
    expect(screen.getByText("今天的队列已经清空")).toBeInTheDocument();
  });

  it("undoes the last submitted review and restores the card to today's queue", async () => {
    const user = userEvent.setup();
    renderPage();

    await expect(screen.findByText("什么是图谱？")).resolves.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /显示答案/ }));
    await user.click(screen.getByRole("button", { name: "Good 记得" }));

    expect(await screen.findByText(/已记录复习，下次/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "撤销上一次评分" }));

    await waitFor(() => {
      expect(undoReviewCardMock).toHaveBeenCalledWith(
        session,
        "card-1",
        expect.objectContaining({
          reviewId: "review-1",
          previousSchedule: expect.objectContaining({
            cardId: "card-1",
            state: "new"
          })
        })
      );
    });
    expect(await screen.findByText("已撤销上一条评分，卡片已回到今日队列。")).toBeInTheDocument();
    expect(screen.getByText("什么是图谱？")).toBeInTheDocument();
    expect(screen.getByText("1 张仍待完成")).toBeInTheDocument();
  });

  it("skips the current card and moves it to the end of the in-memory queue", async () => {
    getTodayReviewQueueMock.mockResolvedValueOnce({
      dueCount: 2,
      items: [
        {
          deckTitle: "期末复习",
          card: {
            id: "card-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "First queued card",
            back: "First queued answer",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-1",
            userId: "user-1",
            dueAt: "2026-06-02T12:00:00Z",
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            lapseCount: 0,
            state: "new",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        },
        {
          deckTitle: "期末复习",
          card: {
            id: "card-2",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "Second queued card",
            back: "Second queued answer",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-2",
            userId: "user-1",
            dueAt: "2026-06-02T12:30:00Z",
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            lapseCount: 0,
            state: "new",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        }
      ]
    });

    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("First queued card")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "跳过当前卡片" }));

    expect(await screen.findByText("Second queued card")).toBeInTheDocument();
    expect(screen.getByText("已跳过当前卡片，稍后会回到这张卡。")).toBeInTheDocument();
    expect(screen.getByText("2 张仍待完成")).toBeInTheDocument();
  });

  it("suspends the current card and removes it from today's active queue", async () => {
    getTodayReviewQueueMock.mockResolvedValueOnce({
      dueCount: 2,
      items: [
        {
          deckTitle: "期末复习",
          card: {
            id: "card-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "First queued card",
            back: "First queued answer",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-1",
            userId: "user-1",
            dueAt: "2026-06-02T12:00:00Z",
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            lapseCount: 0,
            state: "new",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        },
        {
          deckTitle: "期末复习",
          card: {
            id: "card-2",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "Second queued card",
            back: "Second queued answer",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-2",
            userId: "user-1",
            dueAt: "2026-06-02T12:30:00Z",
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            lapseCount: 0,
            state: "new",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        }
      ]
    });

    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("First queued card")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "暂停当前卡片" }));

    await waitFor(() => {
      expect(updateCardStatusMock).toHaveBeenCalledWith(session, "card-1", { status: "suspended" });
    });
    expect(await screen.findByText("Second queued card")).toBeInTheDocument();
    expect(screen.getByText("已暂停当前卡片，可在管理面板恢复。")).toBeInTheDocument();
    expect(screen.getByText("1 张仍待完成")).toBeInTheDocument();
  });

  it("buries the current card and keeps it out of today's queue until restored", async () => {
    getTodayReviewQueueMock.mockResolvedValueOnce({
      dueCount: 2,
      items: [
        {
          deckTitle: "期末复习",
          card: {
            id: "card-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "First queued card",
            back: "First queued answer",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-1",
            userId: "user-1",
            dueAt: "2026-06-02T12:00:00Z",
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            lapseCount: 0,
            state: "new",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        },
        {
          deckTitle: "期末复习",
          card: {
            id: "card-2",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "Second queued card",
            back: "Second queued answer",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-2",
            userId: "user-1",
            dueAt: "2026-06-02T12:30:00Z",
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            lapseCount: 0,
            state: "new",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        }
      ]
    });

    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("First queued card")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "埋藏当前卡片" }));

    await waitFor(() => {
      expect(updateCardStatusMock).toHaveBeenCalledWith(session, "card-1", { status: "buried" });
    });
    expect(await screen.findByText("Second queued card")).toBeInTheDocument();
    expect(screen.getByText("已埋藏当前卡片，今天不会再出现。")).toBeInTheDocument();
    expect(screen.getByText("1 张仍待完成")).toBeInTheDocument();
  });

  it("restores a suspended card from review management", async () => {
    listDeckCardsMock.mockResolvedValueOnce([
      {
        id: "card-1",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "Suspended card",
        back: "Bring it back to today's queue",
        status: "suspended",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    getTodayReviewQueueMock.mockResolvedValueOnce({
      dueCount: 0,
      items: []
    });
    listDeckCardsMock.mockResolvedValueOnce([
      {
        id: "card-1",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "Suspended card",
        back: "Bring it back to today's queue",
        status: "active",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    getTodayReviewQueueMock.mockResolvedValueOnce({
      dueCount: 1,
      items: [
        {
          deckTitle: "期末复习",
          card: {
            id: "card-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "Suspended card",
            back: "Bring it back to today's queue",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-1",
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
    });

    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("今天的队列已经清空")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "卡片" }));
    await user.click(screen.getByRole("button", { name: "恢复卡片" }));

    await waitFor(() => {
      expect(updateCardStatusMock).toHaveBeenCalledWith(session, "card-1", { status: "active" });
    });
    expect(await screen.findByText("已恢复卡片，今日队列已同步更新。")).toBeInTheDocument();
    expect(screen.getByText("1 张仍待完成")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "暂停卡片" })).toBeInTheDocument();
  });

  it("filters cards locally inside the deck browser by keyword, status, and source", async () => {
    const allCards = [
      {
        id: "card-1",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "Graph node card",
        back: "Belongs to graph",
        sourceType: "graph",
        sourceId: "graph-1",
        tags: ["graph", "core"],
        status: "active",
        schedule: {
          cardId: "card-1",
          userId: "user-1",
          dueAt: "2026-06-15T08:00:00Z",
          intervalDays: 0,
          easeFactor: 2.5,
          repetitionCount: 0,
          lapseCount: 0,
          state: "review",
          updatedAt: "2026-06-02T12:00:00Z"
        },
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      },
      {
        id: "card-2",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "Note summary card",
        back: "Belongs to note",
        sourceType: "note",
        sourceId: "note-1",
        tags: ["note", "summary"],
        status: "suspended",
        schedule: {
          cardId: "card-2",
          userId: "user-1",
          dueAt: "2026-06-20T08:00:00Z",
          intervalDays: 3,
          easeFactor: 2.5,
          repetitionCount: 1,
          lapseCount: 0,
          state: "learning",
          updatedAt: "2026-06-02T12:00:00Z"
        },
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      },
      {
        id: "card-3",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "Detached fact",
        back: "No source linked",
        tags: ["fact"],
        status: "buried",
        schedule: {
          cardId: "card-3",
          userId: "user-1",
          dueAt: "2026-06-18T08:00:00Z",
          intervalDays: 2,
          easeFactor: 2.5,
          repetitionCount: 1,
          lapseCount: 0,
          state: "new",
          updatedAt: "2026-06-02T12:00:00Z"
        },
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ];
    listDeckCardsMock.mockImplementation(async (_session, _deckId, filters) => {
      if (filters?.query === "note") {
        return [allCards[1]];
      }
      if (filters?.status === "buried") {
        return [allCards[2]];
      }
      if (filters?.sourceType === "none") {
        return [allCards[2]];
      }
      if (filters?.dueBucket === "upcoming") {
        return [allCards[1], allCards[2]];
      }
      if (filters?.tag === "graph") {
        return [allCards[0]];
      }
      return allCards;
    });

    const user = userEvent.setup();
    renderPage();

    await expect(screen.findByRole("button", { expanded: false })).resolves.toBeInTheDocument();

    await user.click(screen.getByRole("button", { expanded: false }));
    await user.click(within(screen.getByRole("navigation")).getByRole("button", { name: "\u5361\u7247" }));

    const keywordInput = screen.getByLabelText("\u7b5b\u9009\u5361\u7247\u5173\u952e\u8bcd");
    const statusFilter = screen.getByLabelText("\u5361\u7247\u72b6\u6001\u7b5b\u9009");
    const sourceFilter = screen.getByLabelText("\u5361\u7247\u6765\u6e90\u7c7b\u578b\u7b5b\u9009");
    const dueFilter = screen.getByLabelText("\u5230\u671f\u65f6\u95f4\u7b5b\u9009");
    const tagFilter = screen.getByLabelText("\u5361\u7247\u6807\u7b7e\u7b5b\u9009");

    expect(screen.getAllByText("3 张卡片").length).toBeGreaterThan(0);

    await user.type(keywordInput, "note");

    await waitFor(() => {
      expect(listDeckCardsMock).toHaveBeenLastCalledWith(session, "deck-1", expect.objectContaining({ query: "note" }));
    });
    expect(await screen.findByText("Note summary card")).toBeInTheDocument();
    expect(screen.queryByText("Graph node card")).not.toBeInTheDocument();
    expect(screen.queryByText("Detached fact")).not.toBeInTheDocument();
    expect(screen.getAllByText("1 张卡片").length).toBeGreaterThan(0);

    await user.clear(keywordInput);
    await user.selectOptions(statusFilter, "buried");

    await waitFor(() => {
      expect(listDeckCardsMock).toHaveBeenLastCalledWith(session, "deck-1", expect.objectContaining({ status: "buried" }));
    });
    expect(await screen.findByText("Detached fact")).toBeInTheDocument();
    expect(screen.queryByText("Graph node card")).not.toBeInTheDocument();
    expect(screen.queryByText("Note summary card")).not.toBeInTheDocument();

    await user.selectOptions(statusFilter, "all");
    await user.selectOptions(sourceFilter, "none");

    await waitFor(() => {
      expect(listDeckCardsMock).toHaveBeenLastCalledWith(session, "deck-1", expect.objectContaining({ sourceType: "none" }));
    });
    expect(await screen.findByText("Detached fact")).toBeInTheDocument();
    expect(screen.queryByText("Graph node card")).not.toBeInTheDocument();
    expect(screen.queryByText("Note summary card")).not.toBeInTheDocument();

    await user.selectOptions(sourceFilter, "all");
    await user.selectOptions(dueFilter, "upcoming");

    await waitFor(() => {
      expect(listDeckCardsMock).toHaveBeenLastCalledWith(session, "deck-1", expect.objectContaining({ dueBucket: "upcoming" }));
    });
    expect(await screen.findByText("Note summary card")).toBeInTheDocument();
    expect(screen.getByText("Detached fact")).toBeInTheDocument();
    expect(screen.queryByText("Graph node card")).not.toBeInTheDocument();

    await user.selectOptions(dueFilter, "all");
    await user.selectOptions(tagFilter, "graph");

    await waitFor(() => {
      expect(listDeckCardsMock).toHaveBeenLastCalledWith(session, "deck-1", expect.objectContaining({ tag: "graph" }));
    });
    expect(await screen.findByText("Graph node card")).toBeInTheDocument();
    expect(screen.queryByText("Note summary card")).not.toBeInTheDocument();
    expect(screen.queryByText("Detached fact")).not.toBeInTheDocument();
  });

  it("submits tags when creating a card from review management", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("什么是图谱？")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "打开卡组管理" }));
    await user.click(screen.getByRole("button", { name: "卡片" }));

    await user.type(screen.getByLabelText("卡片问题"), "Tagged card");
    await user.type(screen.getByLabelText("卡片答案"), "Card with tags");
    await user.type(screen.getByLabelText("卡片标签"), "graph, core");
    await user.click(screen.getByRole("button", { name: /添加卡片/ }));

    await waitFor(() => {
      expect(createDeckCardMock).toHaveBeenCalledWith(
        session,
        "deck-1",
        expect.objectContaining({
          front: "Tagged card",
          back: "Card with tags",
          tags: ["graph", "core"]
        })
      );
    });
  });

  it("prechecks a local json card file before importing it into the selected deck", async () => {
    const user = userEvent.setup();
    importDeckCardsMock
      .mockResolvedValueOnce({
        preview: true,
        totalCount: 3,
        readyCount: 1,
        importedCount: 0,
        duplicateCount: 1,
        failedCount: 1,
        duplicateSamples: [{ rowNumber: 1, front: "Existing front", message: "与当前卡组中的现有卡片重复" }],
        failureSamples: [{ rowNumber: 3, front: "Broken front", message: "缺少 front 或 back" }],
        statusMessage: "预检完成：可导入 1 张，已发现 1 张重复、1 行失败。"
      })
      .mockResolvedValueOnce({
        preview: false,
        totalCount: 3,
        readyCount: 1,
        importedCount: 1,
        duplicateCount: 1,
        failedCount: 1,
        duplicateSamples: [{ rowNumber: 1, front: "Existing front", message: "与当前卡组中的现有卡片重复" }],
        failureSamples: [{ rowNumber: 3, front: "Broken front", message: "缺少 front 或 back" }],
        statusMessage: "已导入 1 张卡片到当前卡组，已跳过 1 张重复卡片和 1 行无效内容。"
      });
    renderPage();

    expect(await screen.findByText("什么是图谱？")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "打开卡组管理" }));
    await user.click(screen.getByRole("button", { name: "卡片" }));

    const input = screen.getByLabelText("导入卡片文件");
    await user.upload(
      input,
      new File(
        [
          JSON.stringify({
            app: "StudyMate",
            kind: "deck-cards",
            cards: [
              {
                front: "Imported front",
                back: "Imported back",
                cardType: "basic",
                tags: ["graph", "imported"]
              }
            ]
          })
        ],
        "cards.json",
        { type: "application/json" }
      )
    );

    await waitFor(() => {
      expect(importDeckCardsMock).toHaveBeenCalledWith(
        session,
        "deck-1",
        expect.objectContaining({
          filename: "cards.json",
          content: expect.stringContaining("Imported front"),
          previewOnly: true
        })
      );
    });
    expect(await screen.findByText("确认导入 1 张卡片？")).toBeInTheDocument();
    expect(screen.getAllByText("预检完成：可导入 1 张，已发现 1 张重复、1 行失败。").length).toBeGreaterThanOrEqual(1);

    await user.click(screen.getByRole("button", { name: "确认导入" }));

    await waitFor(() => {
      expect(importDeckCardsMock).toHaveBeenNthCalledWith(
        2,
        session,
        "deck-1",
        expect.objectContaining({
          filename: "cards.json",
          content: expect.stringContaining("Imported front"),
          previewOnly: false
        })
      );
    });
    expect(await screen.findByText("已导入 1 张卡片到当前卡组，已跳过 1 张重复卡片和 1 行无效内容。")).toBeInTheDocument();
  });

  it("exports the selected deck cards as json", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("什么是图谱？")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "打开卡组管理" }));
    await user.click(screen.getByRole("button", { name: "卡片" }));
    await user.click(screen.getByRole("button", { name: "导出 JSON" }));

    await waitFor(() => {
      expect(exportDeckCardsMock).toHaveBeenCalledWith(session, "deck-1", "json");
    });
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(await screen.findByText("已导出 1 张卡片到 JSON。")).toBeInTheDocument();
  });

  it("batch updates the selected cards from the deck browser", async () => {
    listDeckCardsMock.mockResolvedValueOnce([
      {
        id: "card-1",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "First queued card",
        back: "First queued answer",
        status: "active",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      },
      {
        id: "card-2",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "Second queued card",
        back: "Second queued answer",
        status: "active",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      },
      {
        id: "card-3",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "Already buried card",
        back: "Already outside today's queue",
        status: "buried",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    getTodayReviewQueueMock.mockResolvedValueOnce({
      dueCount: 2,
      items: [
        {
          deckTitle: "Queue deck",
          card: {
            id: "card-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "First queued card",
            back: "First queued answer",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-1",
            userId: "user-1",
            dueAt: "2026-06-02T12:00:00Z",
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            lapseCount: 0,
            state: "new",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        },
        {
          deckTitle: "Queue deck",
          card: {
            id: "card-2",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "Second queued card",
            back: "Second queued answer",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-2",
            userId: "user-1",
            dueAt: "2026-06-02T12:30:00Z",
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            lapseCount: 0,
            state: "new",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        }
      ]
    });

    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText("First queued card")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { expanded: false }));
    await user.click(within(screen.getByRole("navigation")).getByRole("button", { name: "\u5361\u7247" }));
    await user.click(screen.getByLabelText("\u9009\u62e9\u5361\u7247 First queued card"));
    await user.click(screen.getByLabelText("\u9009\u62e9\u5361\u7247 Second queued card"));
    await user.click(screen.getByRole("button", { name: "\u6279\u91cf\u6682\u505c\u9009\u4e2d\u5361\u7247" }));

    await waitFor(() => {
      expect(updateCardStatusMock).toHaveBeenCalledWith(session, "card-1", { status: "suspended" });
      expect(updateCardStatusMock).toHaveBeenCalledWith(session, "card-2", { status: "suspended" });
    });
    expect(await screen.findByText("\u5df2\u6279\u91cf\u6682\u505c 2 \u5f20\u5361\u7247\uff0c\u4eca\u65e5\u961f\u5217\u5df2\u540c\u6b65\u79fb\u9664\u3002")).toBeInTheDocument();
    expect(screen.getByText("0 \u5f20\u4ecd\u5f85\u5b8c\u6210")).toBeInTheDocument();
    expect(screen.getAllByText("\u5df2\u6682\u505c").length).toBeGreaterThanOrEqual(2);
  });

  it("renders the shared error state when the initial review workspace bootstrap fails", async () => {
    listDecksMock.mockRejectedValueOnce(new Error("复习工作台加载失败"));
    getTodayReviewQueueMock.mockRejectedValueOnce(new Error("复习工作台加载失败"));

    renderPage();

    expect(await screen.findByRole("heading", { level: 2, name: "复习工作台暂时不可用" })).toBeInTheDocument();
    expect(screen.getByText("复习工作台加载失败")).toBeInTheDocument();
  });

  it("keeps rendering the current card while surfacing a shared stale state after refresh fails", async () => {
    const user = userEvent.setup();
    renderPage();

    await expect(screen.findByText("什么是图谱？")).resolves.toBeInTheDocument();

    listDecksMock.mockRejectedValueOnce(new Error("复习队列刷新失败"));
    getTodayReviewQueueMock.mockRejectedValueOnce(new Error("复习队列刷新失败"));

    await user.click(screen.getByRole("button", { name: /刷新/ }));

    expect(await screen.findByRole("heading", { level: 2, name: "复习队列需要刷新" })).toBeInTheDocument();
    expect(screen.getByText("复习队列刷新失败")).toBeInTheDocument();
    expect(screen.getByText("什么是图谱？")).toBeInTheDocument();
  });

  it("uses the shared select when creating a deck from review management", async () => {
    vi.mocked(createDeck).mockResolvedValueOnce({
      id: "deck-2",
      ownerUserId: "user-1",
      title: "Public deck",
      description: "Shared deck",
      visibility: "public",
      cardCount: 0,
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    });

    const user = userEvent.setup();
    renderPage();

    await expect(screen.findByText("什么是图谱？")).resolves.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "打开卡组管理" }));
    await user.click(screen.getByRole("button", { name: "新建" }));

    const visibilitySelect = screen.getByRole("combobox");
    expect(visibilitySelect).toHaveClass("ds-select");

    await user.type(screen.getByLabelText("卡组标题"), "Public deck");
    await user.selectOptions(visibilitySelect, "public");
    await user.click(screen.getByRole("button", { name: /创建卡组/ }));

    await waitFor(() => {
      expect(vi.mocked(createDeck)).toHaveBeenCalledWith(
        session,
        expect.objectContaining({
          title: "Public deck",
          visibility: "public"
        })
      );
    });
  });

  it("prioritizes the requested source card from the route query", async () => {
    listDecksMock.mockResolvedValueOnce([
      {
        id: "deck-1",
        ownerUserId: "user-1",
        title: "鏈熸湯澶嶄範",
        description: "楂橀姒傚康",
        visibility: "private",
        cardCount: 1,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      },
      {
        id: "deck-2",
        ownerUserId: "user-1",
        title: "Source revisit",
        description: "Focus a linked source card",
        visibility: "private",
        cardCount: 1,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    getTodayReviewQueueMock.mockResolvedValueOnce({
      dueCount: 2,
      items: [
        {
          deckTitle: "鏈熸湯澶嶄範",
          card: {
            id: "card-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "First queued card",
            back: "First queued answer",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-1",
            userId: "user-1",
            dueAt: "2026-06-02T12:00:00Z",
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            lapseCount: 0,
            state: "new",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        },
        {
          deckTitle: "Source revisit",
          card: {
            id: "card-2",
            deckId: "deck-2",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "Requested source card",
            back: "Focus the linked card first",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          },
          schedule: {
            cardId: "card-2",
            userId: "user-1",
            dueAt: "2026-06-02T12:00:00Z",
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            lapseCount: 0,
            state: "review",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        }
      ]
    });

    renderPage("/review?card=card-2");

    expect(await screen.findByText("Requested source card")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "关闭卡组管理" })).toHaveLength(2);
  });
});
