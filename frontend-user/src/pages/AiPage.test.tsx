import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
const commitGraphChangeDraftSelectionMock = vi.mocked(commitGraphChangeDraftSelection);
const getGraphMock = vi.mocked(getGraph);

describe("AiPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    listAiTasksMock.mockReset();
    listAiDraftsMock.mockReset();
    getAiUsageSummaryMock.mockReset();
    listDecksMock.mockReset();
    listGraphsMock.mockReset();
    bulkCreateDeckCardsMock.mockReset();
    commitGraphChangeDraftSelectionMock.mockReset();
    getGraphMock.mockReset();

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

  it("confirms selected graph change drafts into the target graph", async () => {
    const graphDetail = {
      id: "graph-1",
      ownerUserId: "user-1",
      title: "知识图谱",
      description: "课程知识结构",
      visibility: "private",
      status: "active",
      graphType: "knowledge",
      mode: "freeform",
      currentVersion: 1,
      nodeCount: 1,
      edgeCount: 0,
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z",
      document: {
        graphId: "graph-1",
        version: 1,
        schemaVersion: 1,
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: [
          {
            id: "existing-node",
            type: "concept",
            title: "已有概念",
            x: 0,
            y: 0,
            width: 240,
            height: 120
          }
        ],
        edges: [],
        groups: []
      }
    };

    listAiDraftsMock.mockReset();
    listAiDraftsMock
      .mockResolvedValueOnce([
        {
          id: "graph-draft-1",
          taskId: "task-2",
          draftType: "graph_change",
          targetType: "graph",
          targetId: "graph-1",
          status: "pending",
          sourceType: "note",
          sourceId: "note-1",
          sourceLabel: "图谱笔记",
          front: "新增两个图谱节点",
          back: "补充概念关系。",
          explanation: "来自笔记摘要。",
          metadata: {
            summary: "把笔记里的概念追加到目标图谱。",
            nodes: [
              { id: "node-a", title: "概念 A", x: 120, y: 0, width: 240, height: 120 },
              { id: "node-b", title: "概念 B", x: 360, y: 0, width: 240, height: 120 }
            ],
            edges: [{ id: "edge-1", label: "关联", sourceNodeId: "node-a", targetNodeId: "node-b" }]
          },
          createdAt: "2026-06-02T12:00:00Z",
          updatedAt: "2026-06-02T12:00:00Z"
        }
      ])
      .mockResolvedValueOnce([]);
    listGraphsMock.mockResolvedValue([
      {
        id: "graph-1",
        ownerUserId: "user-1",
        title: "知识图谱",
        description: "课程知识结构",
        visibility: "private",
        status: "active",
        graphType: "knowledge",
        mode: "freeform",
        currentVersion: 1,
        nodeCount: 1,
        edgeCount: 0,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      }
    ]);
    getGraphMock.mockResolvedValue(graphDetail);
    commitGraphChangeDraftSelectionMock.mockResolvedValue({
      ...graphDetail,
      currentVersion: 2,
      nodeCount: 3,
      updatedAt: "2026-06-02T12:10:00Z"
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AiPage session={session} />
      </MemoryRouter>
    );

    await expect(screen.findByText("图谱笔记")).resolves.toBeInTheDocument();
    expect(await screen.findByText("概念 A")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "把 1 条图谱变更写入所选图谱" }));

    await waitFor(() => {
      expect(commitGraphChangeDraftSelectionMock).toHaveBeenCalledWith(session, "graph-1", {
        draftIds: ["graph-draft-1"],
        nodeSelections: [
          {
            draftId: "graph-draft-1",
            nodeIds: ["node-a", "node-b"]
          }
        ]
      });
    });
    expect(await screen.findByText("已把 1 条图谱变更写入《知识图谱》。")).toBeInTheDocument();
  });
});
