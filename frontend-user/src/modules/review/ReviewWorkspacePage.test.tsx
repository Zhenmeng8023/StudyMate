import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
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

const createDeckMock = vi.mocked(createDeck);
const createDeckCardMock = vi.mocked(createDeckCard);
const exportDeckCardsMock = vi.mocked(exportDeckCards);
const getTodayReviewQueueMock = vi.mocked(getTodayReviewQueue);
const importDeckCardsMock = vi.mocked(importDeckCards);
const listDeckCardsMock = vi.mocked(listDeckCards);
const listDecksMock = vi.mocked(listDecks);
const reviewCardMock = vi.mocked(reviewCard);
const undoReviewCardMock = vi.mocked(undoReviewCard);
const updateCardStatusMock = vi.mocked(updateCardStatus);

function renderPage(path = "/review") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ReviewWorkspacePage session={session} />
    </MemoryRouter>
  );
}

async function openCardBrowser(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "卡片" }));
  await screen.findByLabelText("筛选卡片关键词");
}

async function startReview(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "开始复习" }));
  await screen.findByText("什么是图谱？");
}

describe("ReviewWorkspacePage", () => {
  beforeEach(() => {
    createDeckMock.mockReset();
    createDeckCardMock.mockReset();
    exportDeckCardsMock.mockReset();
    getTodayReviewQueueMock.mockReset();
    importDeckCardsMock.mockReset();
    listDeckCardsMock.mockReset();
    listDecksMock.mockReset();
    reviewCardMock.mockReset();
    undoReviewCardMock.mockReset();
    updateCardStatusMock.mockReset();

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
        tags: ["graph"],
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
    createDeckMock.mockResolvedValue({
      id: "deck-2",
      ownerUserId: "user-1",
      title: "新牌组",
      description: "新的上下文",
      visibility: "private",
      cardCount: 0,
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    });
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

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:review-export")
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn()
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders the review workspace first and exposes Anki-style operations before focus mode", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByRole("button", { name: "开始复习" })).toBeInTheDocument();
    expect(screen.queryByText("什么是图谱？")).not.toBeInTheDocument();
    expect(screen.getByText(/复习页不再默认直接进入答题舞台/)).toBeInTheDocument();

    await openCardBrowser(user);

    expect(screen.getByLabelText("筛选卡片关键词")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "批量暂停选中卡片" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "导出 JSON" })).toBeInTheDocument();
    expect(screen.getByLabelText("导入卡片文件")).toBeInTheDocument();
  });

  it("starts review only after clicking start and then writes back a rating", async () => {
    const user = userEvent.setup();
    renderPage();

    await startReview(user);

    expect(within(screen.getByLabelText("复习进度")).getByText(/到期/)).toHaveTextContent("1 到期");
    await user.click(screen.getByRole("button", { name: "显示答案" }));
    expect(screen.getByText("节点和关系。")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Good 记得" }));

    await waitFor(() => {
      expect(reviewCardMock).toHaveBeenCalledWith(
        session,
        "card-1",
        expect.objectContaining({ rating: "good" })
      );
    });
    expect(await screen.findByText(/已记录复习，下次/)).toBeInTheDocument();
    expect(screen.getByText("今天的队列已经清空")).toBeInTheDocument();
  });

  it("undoes the last submitted review after returning to the workspace", async () => {
    const user = userEvent.setup();
    renderPage();

    await startReview(user);
    await user.click(screen.getByRole("button", { name: "显示答案" }));
    await user.click(screen.getByRole("button", { name: "Good 记得" }));
    await screen.findByText(/已记录复习，下次/);

    await user.click(screen.getByRole("button", { name: "撤销上一次评分" }));

    await waitFor(() => {
      expect(undoReviewCardMock).toHaveBeenCalledWith(
        session,
        "card-1",
        expect.objectContaining({
          reviewId: "review-1",
          previousSchedule: expect.objectContaining({ cardId: "card-1", state: "new" })
        })
      );
    });
    expect(await screen.findByText("已撤销上一条评分，卡片已回到今日队列。")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "返回工作台" }).length).toBeGreaterThan(0);
    expect(screen.getByText("什么是图谱？")).toBeInTheDocument();
  });

  it("keeps the focused card visible while surfacing a stale state after refresh fails", async () => {
    const user = userEvent.setup();
    renderPage();

    await startReview(user);

    listDecksMock.mockRejectedValueOnce(new Error("复习队列刷新失败"));
    getTodayReviewQueueMock.mockRejectedValueOnce(new Error("复习队列刷新失败"));

    await user.click(screen.getByRole("button", { name: "刷新" }));

    expect(await screen.findByRole("heading", { level: 2, name: "复习队列需要刷新" })).toBeInTheDocument();
    expect(screen.getByText("复习队列刷新失败")).toBeInTheDocument();
    expect(screen.getByText("什么是图谱？")).toBeInTheDocument();
  });

  it("opens the workspace card browser with source-level filters from the route query", async () => {
    listDecksMock.mockResolvedValueOnce([
      {
        id: "deck-1",
        ownerUserId: "user-1",
        title: "通用牌组",
        description: "不含目标来源",
        visibility: "private",
        cardCount: 1,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      },
      {
        id: "deck-2",
        ownerUserId: "user-1",
        title: "图谱反馈牌组",
        description: "含有目标来源卡片",
        visibility: "private",
        cardCount: 1,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    listDeckCardsMock.mockImplementation(async (_session, deckId, filters) => {
      if (deckId === "deck-1" && filters?.sourceType === "graph" && filters?.sourceId === "node-2") {
        return [];
      }
      if (deckId === "deck-2" && filters?.sourceType === "graph" && filters?.sourceId === "node-2") {
        return [
          {
            id: "card-2",
            deckId: "deck-2",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "Focused source card",
            back: "Only cards for the requested graph node",
            sourceType: "graph",
            sourceId: "node-2",
            status: "active",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        ];
      }
      return [
        {
          id: "card-1",
          deckId,
          ownerUserId: "user-1",
          cardType: "basic",
          front: "Fallback card",
          back: "Fallback answer",
          status: "active",
          createdAt: "2026-06-02T12:00:00Z",
          updatedAt: "2026-06-02T12:00:00Z"
        }
      ];
    });

    renderPage("/review?sourceType=graph&sourceId=node-2");

    await waitFor(() => {
      expect(listDeckCardsMock).toHaveBeenCalledWith(
        session,
        "deck-2",
        expect.objectContaining({
          sourceType: "graph",
          sourceId: "node-2"
        })
      );
    });
    expect(await screen.findByText("Focused source card")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始复习" })).toBeInTheDocument();
  });

  it("prechecks and confirms import from the workspace card browser", async () => {
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

    const user = userEvent.setup();
    renderPage();

    await openCardBrowser(user);

    await user.upload(
      screen.getByLabelText("导入卡片文件"),
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
      expect(importDeckCardsMock).toHaveBeenNthCalledWith(
        1,
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

  it("prioritizes a requested queue card and enters focus mode directly", async () => {
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
          deckTitle: "Source revisit",
          card: {
            id: "card-2",
            deckId: "deck-1",
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
            dueAt: "2026-06-02T12:30:00Z",
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
    expect(screen.getAllByRole("button", { name: "返回工作台" }).length).toBeGreaterThan(0);
  });

  it("renders the shared error state when the workspace bootstrap fails", async () => {
    listDecksMock.mockRejectedValueOnce(new Error("复习工作台加载失败"));
    getTodayReviewQueueMock.mockRejectedValueOnce(new Error("复习工作台加载失败"));

    renderPage();

    expect(await screen.findByRole("heading", { level: 2, name: "复习工作台暂时不可用" })).toBeInTheDocument();
    expect(screen.getByText("复习工作台加载失败")).toBeInTheDocument();
  });
});
