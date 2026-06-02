import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bulkCreateDeckCards,
  commitGraphChangeDraftSelection,
  getAiUsageSummary,
  getGraph,
  listAiDrafts,
  listAiTasks,
  listDecks,
  listGraphs
} from "../api/client";
import type { AuthSession } from "../api/client";
import { AiPage } from "./AiPage";

vi.mock("../api/client", async () => {
  const actual = await vi.importActual<typeof import("../api/client")>("../api/client");
  return {
    ...actual,
    bulkCreateDeckCards: vi.fn(),
    commitGraphChangeDraftSelection: vi.fn(),
    getAiUsageSummary: vi.fn(),
    getGraph: vi.fn(),
    listAiDrafts: vi.fn(),
    listAiTasks: vi.fn(),
    listDecks: vi.fn(),
    listGraphs: vi.fn()
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

const listAiTasksMock = vi.mocked(listAiTasks);
const listAiDraftsMock = vi.mocked(listAiDrafts);
const getAiUsageSummaryMock = vi.mocked(getAiUsageSummary);
const listDecksMock = vi.mocked(listDecks);
const listGraphsMock = vi.mocked(listGraphs);
const bulkCreateDeckCardsMock = vi.mocked(bulkCreateDeckCards);

describe("AiPage", () => {
  beforeEach(() => {
    listAiTasksMock.mockReset();
    listAiDraftsMock.mockReset();
    getAiUsageSummaryMock.mockReset();
    listDecksMock.mockReset();
    listGraphsMock.mockReset();
    bulkCreateDeckCardsMock.mockReset();
    vi.mocked(commitGraphChangeDraftSelection).mockReset();
    vi.mocked(getGraph).mockReset();

    listAiTasksMock.mockResolvedValue([]);
    listAiDraftsMock
      .mockResolvedValueOnce([
        {
          id: "draft-1",
          taskId: "task-1",
          draftType: "card_draft",
          targetType: "deck",
          targetId: "deck-1",
          status: "pending",
          sourceType: "annotation",
          sourceId: "annotation-1",
          sourceLabel: "阅读批注",
          front: "什么是知识图谱？",
          back: "用节点和关系组织知识。",
          explanation: "来自阅读器批注。",
          createdAt: "2026-06-02T12:00:00Z",
          updatedAt: "2026-06-02T12:00:00Z"
        }
      ])
      .mockResolvedValueOnce([]);
    getAiUsageSummaryMock.mockResolvedValue({
      totalTasks: 1,
      completedTasks: 1,
      failedTasks: 0,
      totalInputTokens: 10,
      totalOutputTokens: 20,
      totalCostUnits: 0,
      lastTaskAt: "2026-06-02T12:00:00Z"
    });
    listDecksMock.mockResolvedValue([
      {
        id: "deck-1",
        ownerUserId: "user-1",
        title: "期末复习",
        description: "高频概念",
        visibility: "private",
        cardCount: 0,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    listGraphsMock.mockResolvedValue([]);
    bulkCreateDeckCardsMock.mockResolvedValue([
      {
        id: "card-1",
        deckId: "deck-1",
        ownerUserId: "user-1",
        cardType: "basic",
        front: "什么是知识图谱？",
        back: "用节点和关系组织知识。",
        sourceType: "annotation",
        sourceId: "annotation-1",
        status: "active",
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
  });

  it("confirms pending card drafts into the selected review deck", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AiPage session={session} />
      </MemoryRouter>
    );

    await expect(screen.findByText("什么是知识图谱？")).resolves.toBeInTheDocument();
    const commitButton = screen.getByRole("button", { name: "把 1 张待确认卡片草稿写入复习系统" });

    await user.click(commitButton);

    await waitFor(() => {
      expect(bulkCreateDeckCardsMock).toHaveBeenCalledWith(session, "deck-1", [
        expect.objectContaining({
          draftId: "draft-1",
          front: "什么是知识图谱？",
          back: "用节点和关系组织知识。",
          sourceType: "annotation",
          sourceId: "annotation-1"
        })
      ]);
    });
    expect(await screen.findByText("已把 1 张 AI 草稿写入复习系统。")).toBeInTheDocument();
  });
});
