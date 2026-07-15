import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listMaterials, listNotes, listPosts } from "../api/client";
import type { AuthSession } from "../api/client";
import { listAiDrafts, listAiTasks } from "../api/ai";
import { getTodayReviewQueue } from "../api/review";
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
    listAiDraftsMock.mockReset();
    listAiTasksMock.mockReset();

    listMaterialsMock.mockResolvedValue([]);
    listNotesMock.mockResolvedValue([]);
    listPostsMock.mockResolvedValue([]);
    getTodayReviewQueueMock.mockResolvedValue({
      dueCount: 0,
      items: []
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
    expect(screen.getByText("DFS 的时间复杂度？")).toBeInTheDocument();
    expect(screen.getByText("1 条草稿待确认")).toBeInTheDocument();
    expect(screen.getByText("什么时候使用 DFS？")).toBeInTheDocument();
    expect(screen.getByText("笔记生成卡片草稿")).toBeInTheDocument();
    expect(screen.getByText("进行中")).toBeInTheDocument();
  });
});
