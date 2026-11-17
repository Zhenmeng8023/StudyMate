import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDeck,
  createDeckCard,
  exportDeckCards,
  getTodayReviewQueue,
  getReviewFeedback,
  importDeckCards,
  listCardNotes,
  listDeckCards,
  listDecks,
  reviewCard,
  undoReviewCard,
  updateCardNote,
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
    getReviewFeedback: vi.fn(),
    importDeckCards: vi.fn(),
    listCardNotes: vi.fn(),
    listDeckCards: vi.fn(),
    listDecks: vi.fn(),
    reviewCard: vi.fn(),
    undoReviewCard: vi.fn(),
    updateCardNote: vi.fn(),
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
const getReviewFeedbackMock = vi.mocked(getReviewFeedback);
const importDeckCardsMock = vi.mocked(importDeckCards);
const listCardNotesMock = vi.mocked(listCardNotes);
const listDeckCardsMock = vi.mocked(listDeckCards);
const listDecksMock = vi.mocked(listDecks);
const reviewCardMock = vi.mocked(reviewCard);
const undoReviewCardMock = vi.mocked(undoReviewCard);
const updateCardNoteMock = vi.mocked(updateCardNote);
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
    getReviewFeedbackMock.mockReset();
    getReviewFeedbackMock.mockResolvedValue({ dueCount: 0, learningCount: 0, weakCardCount: 0, weakCards: [], weakSources: [] });
    importDeckCardsMock.mockReset();
    listCardNotesMock.mockReset();
    listDeckCardsMock.mockReset();
    listDecksMock.mockReset();
    reviewCardMock.mockReset();
    undoReviewCardMock.mockReset();
    updateCardNoteMock.mockReset();
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
    listCardNotesMock.mockResolvedValue([
      {
        cardNote: {
          id: "note-1",
          deckId: "deck-1",
          ownerUserId: "user-1",
          noteTypeId: "note-type-basic",
          noteTypeCode: "basic",
          primarySourceLink: { sourceType: "note", sourceId: "source-note-1", title: "DFS 笔记" },
          sourceLinks: [{ sourceType: "note", sourceId: "source-note-1", title: "DFS 笔记" }],
          fields: { front: "DFS 的时间复杂度？", back: "O(V+E)" },
          generatedCardCount: 1,
          status: "active"
        },
        generatedCards: [
          {
            id: "card-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardNoteId: "note-1",
            templateId: "template-1",
            templateOrdinal: 0,
            cardType: "basic",
            front: "DFS 的时间复杂度？",
            back: "O(V+E)",
            tags: ["graph"],
            status: "active",
            schedule: {
              cardId: "card-1",
              userId: "user-1",
              dueAt: "2026-06-02T12:00:00Z",
              learningStep: 0,
              intervalDays: 0,
              easeFactor: 2.5,
              repetitionCount: 0,
              lapseCount: 0,
              state: "new",
              updatedAt: "2026-06-02T12:00:00Z"
            },
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        ],
        queueStates: { new: 1 },
        tags: ["graph"]
      }
    ]);
    getTodayReviewQueueMock.mockResolvedValue({
      dueCount: 1,
      newCount: 1,
      learningCount: 0,
      reviewCount: 0,
      relearningCount: 0,
      newLimit: 20,
      reviewLimit: 200,
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
    updateCardNoteMock.mockImplementation(async (_session, cardNoteId, input) => ({
      cardNote: {
        id: cardNoteId,
        deckId: "deck-1",
        ownerUserId: "user-1",
        noteTypeId: "note-type-basic",
        noteTypeCode: "basic",
        sourceLinks: [{ sourceType: "note", sourceId: "source-note-1", title: "DFS 笔记" }],
        fields: input.fields ?? { front: "DFS 的时间复杂度？", back: "O(V+E)" },
        generatedCardCount: 1,
        status: "active"
      },
      generatedCards: [
        {
          id: "card-1",
          deckId: "deck-1",
          ownerUserId: "user-1",
          cardNoteId: cardNoteId,
          templateId: "template-1",
          templateOrdinal: 0,
          cardType: "basic",
          front: input.fields?.front ?? "DFS 的时间复杂度？",
          back: input.fields?.back ?? "O(V+E)",
          tags: input.tags ?? ["graph"],
          status: "active",
          createdAt: "2026-06-02T12:00:00Z",
          updatedAt: "2026-06-02T12:00:00Z"
        }
      ],
      queueStates: { new: 1 },
      tags: input.tags ?? ["graph"]
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

  it("passes the formal queue state filter to the card browser request", async () => {
    const user = userEvent.setup();
    renderPage();

    await openCardBrowser(user);
    await user.selectOptions(screen.getByLabelText("Formal queue state filter"), "review");

    await waitFor(() => {
      expect(listDeckCardsMock).toHaveBeenLastCalledWith(
        session,
        "deck-1",
        expect.objectContaining({
          queueState: "review"
        })
      );
    });
  });

  it("manages card notes with generated cards from the Note view", async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByRole("button", { name: "Note 视图" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Note 视图" }));

    expect(screen.getByText("来源笔记与卡片")).toBeInTheDocument();
    expect(screen.getByText("CardNote note-1")).toBeInTheDocument();
    expect(screen.getByText("问答卡 · 1 张卡片")).toBeInTheDocument();
    expect(screen.getByText("来源：笔记")).toBeInTheDocument();
    expect(screen.getByText("新卡 1")).toBeInTheDocument();
    expect(screen.getByText("生成卡片")).toBeInTheDocument();

    const frontInput = screen.getByLabelText("编辑 CardNote note-1 Front");
    await user.clear(frontInput);
    await user.type(frontInput, "Updated DFS front");
    const tagInput = screen.getByLabelText("编辑 CardNote note-1 标签");
    await user.clear(tagInput);
    await user.type(tagInput, "graph, weak");
    await user.click(screen.getByRole("button", { name: "保存并更新未学习卡片" }));

    await waitFor(() => {
      expect(updateCardNoteMock).toHaveBeenCalledWith(
        session,
        "note-1",
        expect.objectContaining({
          fields: { front: "Updated DFS front", back: "O(V+E)" },
          tags: ["graph", "weak"],
          sourceLinks: [{ sourceType: "note", sourceId: "source-note-1", title: "DFS 笔记" }]
        })
      );
    });
    expect(await screen.findByText("CardNote 已更新，未开始复习的 GeneratedCards 已重新生成。")).toBeInTheDocument();
  });

  it("refreshes deck totals after regeneration without discarding another note's unsaved edits", async () => {
    const user = userEvent.setup();
    const [note] = await listCardNotesMock(session);
    const decks = await listDecksMock(session);
    listCardNotesMock.mockResolvedValue([note, { ...note, cardNote: { ...note.cardNote, id: "note-2" } }]);
    const updated = {
      ...note, cardNote: { ...note.cardNote, fields: { ...note.cardNote.fields, front: "更新后的内容" }, generatedCardCount: 2 },
      generatedCards: [...note.generatedCards, { ...note.generatedCards[0], id: "card-2" }],
      regeneration: { createdCount: 1, updatedCount: 1, removedCount: 0, preservedCount: 0 }
    };
    updateCardNoteMock.mockResolvedValue(updated);
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Note 视图" }));
    listDecksMock.mockResolvedValue(decks.map((deck) => ({ ...deck, cardCount: 2 })));
    await user.type(screen.getByLabelText("编辑 CardNote note-2 Front"), "未保存修改");
    await user.clear(screen.getByLabelText("编辑 CardNote note-1 Front"));
    await user.type(screen.getByLabelText("编辑 CardNote note-1 Front"), "更新后的内容");
    const firstNote = screen.getByText("CardNote note-1").closest("article");
    if (!firstNote) throw new Error("missing note card");
    await user.click(within(firstNote).getByRole("button", { name: "保存并更新未学习卡片" }));
    await waitFor(() => expect(within(firstNote).getByRole("status")).toHaveTextContent("新增 1 张"));
    expect(screen.getByLabelText("编辑 CardNote note-2 Front")).toHaveValue("DFS 的时间复杂度？未保存修改");
    await user.click(screen.getByRole("button", { name: "卡组" }));
    expect(await screen.findByRole("button", { name: /期末复习2 张卡片/ })).toBeInTheDocument();
  });

  it("resynchronizes the queue when pausing a managed card outside today's queue", async () => {
    const user = userEvent.setup();
    const notes = await listCardNotesMock(session);
    listCardNotesMock.mockResolvedValue(notes.map((note) => ({
      ...note, generatedCards: note.generatedCards.map((card) => ({ ...card, id: "future-card" }))
    })));
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Note 视图" }));
    await user.click(screen.getByRole("button", { name: "暂停" }));
    await waitFor(() => expect(updateCardStatusMock).toHaveBeenCalledWith(session, "future-card", { status: "suspended" }));
    await waitFor(() => expect(getTodayReviewQueueMock).toHaveBeenCalledTimes(2));
    expect(screen.getByLabelText("复习进度")).toHaveTextContent("1 到期");
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

  it("shows the daily learning plan, current queue metadata, and session summary", async () => {
    const user = userEvent.setup();
    const weakSource = {
      sourceType: "note", sourceId: "note-existing", totalCardCount: 2, reviewCardCount: 0,
      masteredCardCount: 0, masteryScore: 0, weakCardCount: 2, dueCount: 1, learningCount: 2, maxLapseCount: 1
    };
    getReviewFeedbackMock.mockResolvedValue({ dueCount: 3, learningCount: 2, weakCardCount: 2, weakCards: [], weakSources: [weakSource, weakSource] });
    getTodayReviewQueueMock.mockResolvedValueOnce({
      dueCount: 3,
      newCount: 1,
      learningCount: 1,
      reviewCount: 1,
      relearningCount: 0,
      newLimit: 20,
      reviewLimit: 200,
      items: [
        {
          deckTitle: "期末复习",
          card: {
            id: "card-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardNoteId: "note-1",
            templateId: "template-1",
            templateOrdinal: 0,
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
            learningStep: 1,
            intervalDays: 0,
            easeFactor: 2.5,
            repetitionCount: 0,
            lapseCount: 0,
            state: "learning",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        }
      ]
    });

    renderPage();

    expect(await screen.findByText("今日学习计划")).toBeInTheDocument();
    expect(screen.getByText("新卡 1 / 20")).toBeInTheDocument();
    expect(screen.getByText("预计用时 2 分钟")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("当前薄弱来源（全部卡片）").parentElement).toHaveTextContent("1"));

    await startReview(user);

    expect(screen.getByText("当前队列：learning")).toBeInTheDocument();
    expect(screen.getByText("learningStep 1")).toBeInTheDocument();
    expect(screen.getByText("CardNote note-1")).toBeInTheDocument();
    expect(screen.getByText("模板 #1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "显示答案" }));
    await user.click(screen.getByRole("button", { name: "Again 重来" }));

    expect(await screen.findByText("本次复习总结")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "阅读新资料" })).toHaveAttribute("href", "/reader");
    expect(screen.getByText("完成 1 张")).toBeInTheDocument();
    expect(screen.getByText("Again 1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回首页" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "查看薄弱节点" })).toHaveAttribute("href", "/graph?learningFilter=weak");
    expect(screen.getByRole("link", { name: "继续阅读制卡" })).toHaveAttribute("href", "/reader");
  });

  it("surfaces a graph backlink after rating a graph-sourced card", async () => {
    const user = userEvent.setup();
    listDeckCardsMock.mockResolvedValueOnce([
      {
        id: "card-graph-1",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "Binary tree traversal",
        back: "Visit left subtree before right subtree.",
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
      }
    ]);
    getTodayReviewQueueMock.mockResolvedValueOnce({
      dueCount: 1,
      items: [
        {
          deckTitle: "期末复习",
          card: {
            id: "card-graph-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "Binary tree traversal",
            back: "Visit left subtree before right subtree.",
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
          },
          schedule: {
            cardId: "card-graph-1",
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

    renderPage();

    await user.click(screen.getByRole("button", { name: "开始复习" }));
    await screen.findByText("Binary tree traversal");
    await user.click(screen.getByRole("button", { name: "显示答案" }));
    await user.click(screen.getByRole("button", { name: "Good 记得" }));

    const backlink = await screen.findByRole("link", { name: "回到图谱查看反馈" });
    expect(backlink).toHaveAttribute(
      "href",
      "/graph?graphId=graph-1&focusX=420&focusY=320&focusWidth=220&focusHeight=120&focusLabel=Binary+Tree"
    );
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
