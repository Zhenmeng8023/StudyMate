import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listMaterials, listNotes, listPosts } from "../api/client";
import type { AuthSession } from "../api/client";
import { listAiDrafts, listAiTasks } from "../api/ai";
import { getReviewFeedback, getReviewInsights, getTodayReviewQueue } from "../api/review";
import { DashboardPage } from "./DashboardPage";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    listMaterials: vi.fn(),
    listNotes: vi.fn(),
    listPosts: vi.fn()
  };
});

vi.mock("../api/review", () => ({
  getReviewFeedback: vi.fn(),
  getReviewInsights: vi.fn(),
  getTodayReviewQueue: vi.fn()
}));

vi.mock("../api/ai", () => ({
  listAiDrafts: vi.fn(),
  listAiTasks: vi.fn()
}));

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

const listMaterialsMock = vi.mocked(listMaterials);
const listNotesMock = vi.mocked(listNotes);
const listPostsMock = vi.mocked(listPosts);
const getTodayReviewQueueMock = vi.mocked(getTodayReviewQueue);
const getReviewFeedbackMock = vi.mocked(getReviewFeedback);
const getReviewInsightsMock = vi.mocked(getReviewInsights);
const listAiDraftsMock = vi.mocked(listAiDrafts);
const listAiTasksMock = vi.mocked(listAiTasks);

describe("DashboardPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    listMaterialsMock.mockReset();
    listNotesMock.mockReset();
    listPostsMock.mockReset();
    getTodayReviewQueueMock.mockReset();
    getReviewFeedbackMock.mockReset();
    getReviewInsightsMock.mockReset();
    listAiDraftsMock.mockReset();
    listAiTasksMock.mockReset();

    listMaterialsMock.mockResolvedValue([]);
    listNotesMock.mockResolvedValue([]);
    listPostsMock.mockResolvedValue([]);
    getTodayReviewQueueMock.mockResolvedValue({
      dueCount: 0,
      items: []
    });
    getReviewFeedbackMock.mockResolvedValue({
      dueCount: 0,
      learningCount: 0,
      weakCardCount: 0,
      weakCards: []
    });
    getReviewInsightsMock.mockResolvedValue({
      days: Array.from({ length: 7 }, (_, index) => ({
        date: `2026-07-${String(12 + index).padStart(2, "0")}`,
        reviewCount: 0,
        ratingCounts: { again: 0, hard: 0, good: 0, easy: 0 },
        weakNewCount: 0,
        weakCarryCount: 0
      })),
      sourceTrends: []
    });
    listAiDraftsMock.mockResolvedValue([]);
    listAiTasksMock.mockResolvedValue([]);
  });

  it("renders a shared loading state while recent materials are bootstrapping", async () => {
    listMaterialsMock.mockReturnValue(new Promise(() => {}) as Promise<never>);

    render(
      <MemoryRouter>
        <DashboardPage session={null} />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 2, name: "正在加载最近资料" })).toBeInTheDocument();
  });

  it("renders a shared error state when recent materials fail to load", async () => {
    listMaterialsMock.mockRejectedValueOnce(new Error("资料首页加载失败"));

    render(
      <MemoryRouter>
        <DashboardPage session={session} />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 2, name: "最近资料暂时不可用" })).toBeInTheDocument();
    expect(screen.getByText("资料首页加载失败")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重新加载" })).toBeInTheDocument();
  });

  it("renders a shared unauthorized state for personal notes when signed out", async () => {
    render(
      <MemoryRouter>
        <DashboardPage session={null} />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 2, name: "登录后查看个人笔记" })).toBeInTheDocument();
    expect(screen.getByText("登录后继续回到你最近的阅读笔记与整理上下文。")).toBeInTheDocument();
    expect(listNotesMock).not.toHaveBeenCalled();
    expect(getTodayReviewQueueMock).not.toHaveBeenCalled();
    expect(getReviewFeedbackMock).not.toHaveBeenCalled();
    expect(listAiDraftsMock).not.toHaveBeenCalled();
    expect(listAiTasksMock).not.toHaveBeenCalled();
  });

  it("surfaces today's review queue and AI work items for signed-in users", async () => {
    listNotesMock.mockResolvedValue([
      {
        id: "note-1",
        ownerUserId: "user-1",
        title: "深度优先搜索",
        summary: "整理 DFS 与回溯的差异。",
        content: "note content",
        materialId: "material-1",
        folderName: "算法",
        tags: ["graph"],
        versionNumber: 1,
        createdAt: "2026-07-15T08:00:00Z",
        updatedAt: "2026-07-15T08:00:00Z"
      }
    ]);
    getTodayReviewQueueMock.mockResolvedValue({
      dueCount: 2,
      items: [
        {
          deckTitle: "算法基础",
          card: {
            id: "card-1",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "DFS 的时间复杂度？",
            back: "O(V+E)",
            sourceType: "note",
            sourceId: "note-1",
            status: "active",
            createdAt: "2026-07-15T08:00:00Z",
            updatedAt: "2026-07-15T08:00:00Z"
          },
          schedule: {
            cardId: "card-1",
            userId: "user-1",
            dueAt: "2026-07-15T08:00:00Z",
            intervalDays: 1,
            easeFactor: 2.5,
            repetitionCount: 1,
            lapseCount: 0,
            state: "review",
            updatedAt: "2026-07-15T08:00:00Z"
          }
        },
        {
          deckTitle: "算法基础",
          card: {
            id: "card-2",
            deckId: "deck-1",
            ownerUserId: "user-1",
            cardType: "basic",
            front: "BFS 的典型用途？",
            back: "最短路径",
            sourceType: "note",
            sourceId: "note-1",
            status: "active",
            createdAt: "2026-07-15T08:05:00Z",
            updatedAt: "2026-07-15T08:05:00Z"
          },
          schedule: {
            cardId: "card-2",
            userId: "user-1",
            dueAt: "2026-07-15T08:05:00Z",
            intervalDays: 3,
            easeFactor: 2.5,
            repetitionCount: 2,
            lapseCount: 0,
            state: "review",
            updatedAt: "2026-07-15T08:05:00Z"
          }
        }
      ]
    });
    getReviewFeedbackMock.mockResolvedValue({
      dueCount: 2,
      learningCount: 1,
      weakCardCount: 2,
      weakCards: [
        {
          cardId: "card-1",
          deckId: "deck-1",
          deckTitle: "算法基础",
          front: "DFS 的时间复杂度？",
          sourceType: "note",
          sourceId: "note-1",
          state: "relearning",
          lapseCount: 2,
          repetitionCount: 1,
          dueAt: "2026-07-15T08:00:00Z"
        },
        {
          cardId: "card-2",
          deckId: "deck-1",
          deckTitle: "算法基础",
          front: "BFS 的典型用途？",
          sourceType: "note",
          sourceId: "note-1",
          state: "learning",
          lapseCount: 0,
          repetitionCount: 0,
          dueAt: "2026-07-15T08:05:00Z"
        }
      ]
    });
    listAiDraftsMock.mockResolvedValue([
      {
        id: "draft-1",
        taskId: "task-1",
        draftType: "card",
        targetType: "note",
        targetId: "note-1",
        status: "pending",
        sourceType: "note",
        sourceId: "note-1",
        sourceLabel: "深度优先搜索",
        front: "什么时候使用 DFS？",
        back: "需要回溯或深度探索时",
        explanation: "来自整理中的笔记草稿",
        createdAt: "2026-07-15T08:10:00Z",
        updatedAt: "2026-07-15T08:10:00Z"
      }
    ]);
    listAiTasksMock.mockResolvedValue([
      {
        id: "task-1",
        userId: "user-1",
        taskType: "note.generate_cards",
        sourceType: "note",
        sourceId: "note-1",
        status: "processing",
        model: "gpt-5",
        inputTokens: 120,
        outputTokens: 60,
        costUnits: 2,
        createdAt: "2026-07-15T08:12:00Z",
        updatedAt: "2026-07-15T08:12:00Z"
      }
    ]);

    render(
      <MemoryRouter>
        <DashboardPage session={session} />
      </MemoryRouter>
    );

    expect(await screen.findByText("2 张卡片等待复习")).toBeInTheDocument();
    expect(screen.getAllByText("DFS 的时间复杂度？").length).toBeGreaterThan(0);
    expect(screen.getByText("1 条草稿待确认")).toBeInTheDocument();
    expect(screen.getByText("什么时候使用 DFS？")).toBeInTheDocument();
    expect(screen.getByText("笔记生成卡片草稿")).toBeInTheDocument();
    expect(screen.getByText("进行中")).toBeInTheDocument();
    expect(screen.getByText("2 张卡片需要回补")).toBeInTheDocument();
    expect(screen.getAllByText("DFS 的时间复杂度？").length).toBeGreaterThan(1);
    expect(screen.getAllByText("BFS 的典型用途？").length).toBeGreaterThan(1);
  });

  it("renders the dashboard command center with source-level feedback and a 7-day trend", async () => {
    getTodayReviewQueueMock.mockResolvedValue({
      dueCount: 4,
      newCount: 1,
      learningCount: 2,
      reviewCount: 1,
      relearningCount: 1,
      items: []
    });
    getReviewFeedbackMock.mockResolvedValue({
      dueCount: 4,
      learningCount: 2,
      weakCardCount: 3,
      weakCards: [],
      weakSources: [
        {
          sourceType: "note",
          sourceId: "note-1",
          primarySourceLink: {
            sourceType: "note",
            sourceId: "note-1",
            title: "DFS 笔记"
          },
          totalCardCount: 5,
          reviewCardCount: 2,
          masteredCardCount: 2,
          masteryLevel: "weak",
          masteryScore: 45,
          weakCardCount: 3,
          dueCount: 2,
          learningCount: 1,
          maxLapseCount: 2,
          sampleCardFronts: ["DFS 的时间复杂度？"]
        },
        {
          sourceType: "graph",
          sourceId: "node-1",
          sourceMetadata: {
            graphId: "graph-1",
            focusLabel: "Binary Tree"
          },
          totalCardCount: 4,
          reviewCardCount: 4,
          masteredCardCount: 4,
          masteryLevel: "solid",
          masteryScore: 100,
          weakCardCount: 0,
          dueCount: 0,
          learningCount: 0,
          maxLapseCount: 0
        }
      ],
      sourceSummaries: []
    });
    getReviewInsightsMock.mockResolvedValue({
      days: [
        { date: "2026-07-12", reviewCount: 0, ratingCounts: { again: 0, hard: 0, good: 0, easy: 0 }, weakNewCount: 0, weakCarryCount: 0 },
        { date: "2026-07-13", reviewCount: 1, ratingCounts: { again: 0, hard: 1, good: 0, easy: 0 }, weakNewCount: 1, weakCarryCount: 0 },
        { date: "2026-07-14", reviewCount: 0, ratingCounts: { again: 0, hard: 0, good: 0, easy: 0 }, weakNewCount: 0, weakCarryCount: 0 },
        { date: "2026-07-15", reviewCount: 2, ratingCounts: { again: 1, hard: 0, good: 1, easy: 0 }, weakNewCount: 0, weakCarryCount: 1 },
        { date: "2026-07-16", reviewCount: 0, ratingCounts: { again: 0, hard: 0, good: 0, easy: 0 }, weakNewCount: 0, weakCarryCount: 0 },
        { date: "2026-07-17", reviewCount: 1, ratingCounts: { again: 1, hard: 0, good: 0, easy: 0 }, weakNewCount: 0, weakCarryCount: 1 },
        { date: "2026-07-18", reviewCount: 4, ratingCounts: { again: 3, hard: 0, good: 1, easy: 0 }, weakNewCount: 0, weakCarryCount: 1 }
      ],
      sourceTrends: [{ date: "2026-07-18", sourceType: "note", sourceId: "note-1", masteryScore: 45 }]
    });

    render(
      <MemoryRouter>
        <DashboardPage session={session} />
      </MemoryRouter>
    );

    expect(await screen.findByText("今日学习状态")).toBeInTheDocument();
    expect(screen.getByText("今日待复习 4")).toBeInTheDocument();
    expect(screen.getByText("学习中 2")).toBeInTheDocument();
    expect(screen.getByText("薄弱来源 1")).toBeInTheDocument();
    expect(screen.getByText("已掌握来源 1")).toBeInTheDocument();
    expect(screen.getByText("薄弱知识点 / 薄弱来源")).toBeInTheDocument();
    expect(screen.getByText("DFS 笔记")).toBeInTheDocument();
    expect(screen.getByText("笔记 · 掌握度 45%")).toBeInTheDocument();
    expect(screen.getByText(/待回补 3 张/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "去复习" })).toHaveAttribute("href", "/review?sourceType=note&sourceId=note-1");
    expect(screen.getByRole("link", { name: "回到来源" })).toHaveAttribute("href", "/notes?selected=note-1");
    expect(screen.getByRole("link", { name: "来源档案" })).toHaveAttribute("href", "/sources?sourceType=note&sourceId=note-1");
    expect(screen.getByText("7 天学习趋势")).toBeInTheDocument();
    expect(screen.getByText("今日 4 张复习")).toBeInTheDocument();
    expect(screen.getByText(/Again 3 次/)).toBeInTheDocument();
    expect(screen.getByText("近 7 天 8 张")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "最近七天每日学习记录" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /2026-07-13 1 0 1 0/ })).toBeInTheDocument();
    expect(screen.getAllByText(/掌握度 45%/).length).toBeGreaterThanOrEqual(2);
  });

  it("keeps today's pending cards separate from completed reviews", async () => {
    getTodayReviewQueueMock.mockResolvedValue({ dueCount: 7, items: [] });
    getReviewInsightsMock.mockResolvedValue({
      days: [{ date: "2026-07-18", reviewCount: 2, ratingCounts: { again: 0 }, weakNewCount: 0, weakCarryCount: 0 }]
    });
    render(<MemoryRouter><DashboardPage session={session} /></MemoryRouter>);
    expect(await screen.findByText("今日待复习 7")).toBeInTheDocument();
    expect(screen.getByText("今日 2 张复习")).toBeInTheDocument();
  });
});
