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
import type { AiDraftPayload, AuthSession, GraphDetailPayload, GraphSummaryPayload } from "../api/client";
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

function makeCardDraft(overrides: Partial<AiDraftPayload> = {}): AiDraftPayload {
  return {
    id: "draft-card-1",
    taskId: "task-card-1",
    draftType: "card_draft",
    targetType: "deck",
    targetId: "deck-1",
    status: "pending",
    sourceType: "annotation",
    sourceId: "annotation-1",
    sourceLabel: "Card draft source",
    front: "What is a knowledge graph?",
    back: "A graph of connected concepts.",
    explanation: "draft explanation",
    createdAt: "2026-06-02T12:00:00Z",
    updatedAt: "2026-06-02T12:00:00Z",
    ...overrides
  };
}

function makeGraphDraft(overrides: Partial<AiDraftPayload> = {}): AiDraftPayload {
  return {
    id: "draft-graph-1",
    taskId: "task-graph-1",
    draftType: "graph_change",
    targetType: "graph",
    targetId: "graph-1",
    status: "pending",
    sourceType: "note",
    sourceId: "note-1",
    sourceLabel: "Graph draft source",
    front: "Add graph nodes",
    back: "Append related concepts.",
    explanation: "graph explanation",
    metadata: {
      summary: "graph summary",
      nodes: [
        { id: "node-a", title: "Node A", x: 120, y: 0, width: 240, height: 120 },
        { id: "node-b", title: "Node B", x: 360, y: 0, width: 240, height: 120 }
      ],
      edges: [{ id: "edge-1", label: "related", sourceNodeId: "node-a", targetNodeId: "node-b" }]
    },
    createdAt: "2026-06-02T12:00:00Z",
    updatedAt: "2026-06-02T12:00:00Z",
    ...overrides
  };
}

function makeGraphSummary(overrides: Partial<GraphSummaryPayload> = {}): GraphSummaryPayload {
  return {
    id: "graph-1",
    ownerUserId: "user-1",
    title: "Graph 1",
    description: "Graph summary",
    visibility: "private",
    status: "active",
    graphType: "knowledge",
    mode: "freeform",
    currentVersion: 1,
    nodeCount: 1,
    edgeCount: 0,
    createdAt: "2026-06-02T12:00:00Z",
    updatedAt: "2026-06-02T12:00:00Z",
    ...overrides
  };
}

function makeGraphDetail(overrides: Partial<GraphDetailPayload> = {}): GraphDetailPayload {
  return {
    ...makeGraphSummary(),
    document: {
      graphId: "graph-1",
      version: 1,
      schemaVersion: 1,
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [
        {
          id: "existing-node",
          type: "concept",
          title: "Existing concept",
          x: 0,
          y: 0,
          width: 240,
          height: 120
        }
      ],
      edges: [],
      groups: []
    },
    ...overrides
  };
}

function renderPage(path = "/ai") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AiPage session={session} />
    </MemoryRouter>
  );
}

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
      .mockResolvedValueOnce([makeCardDraft()])
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
        title: "Deck 1",
        description: "High frequency concepts",
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
        front: "What is a knowledge graph?",
        back: "A graph of connected concepts.",
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
    const { container } = renderPage();

    expect(await screen.findByText("Card draft source")).toBeInTheDocument();
    const commitButton = container.querySelector<HTMLButtonElement>(".ai-panel-actions .primary-button");
    expect(commitButton).not.toBeNull();

    await user.click(commitButton!);

    await waitFor(() => {
      expect(bulkCreateDeckCardsMock).toHaveBeenCalledWith(session, "deck-1", [
        expect.objectContaining({
          draftId: "draft-card-1",
          front: "What is a knowledge graph?",
          back: "A graph of connected concepts.",
          sourceType: "annotation",
          sourceId: "annotation-1"
        })
      ]);
    });
  });

  it("renders the shared error state when the ai workspace bootstrap fails", async () => {
    listAiTasksMock.mockRejectedValueOnce(new Error("workspace bootstrap failed"));

    renderPage();

    expect(await screen.findByText("workspace bootstrap failed")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.queryAllByRole("combobox")).toHaveLength(0);
  });

  it("keeps rendering the current drafts while surfacing a shared stale state after a commit refresh fails", async () => {
    listAiDraftsMock.mockReset();
    listAiDraftsMock
      .mockResolvedValueOnce([
        makeCardDraft({
          id: "draft-stale-1",
          sourceLabel: "Stale draft source",
          front: "Stale card draft",
          back: "Stale card answer"
        })
      ])
      .mockRejectedValueOnce(new Error("ai draft refresh failed"));

    const user = userEvent.setup();
    const { container } = renderPage();

    expect(await screen.findByText("Stale draft source")).toBeInTheDocument();
    const commitButton = container.querySelector<HTMLButtonElement>(".ai-panel-actions .primary-button");
    expect(commitButton).not.toBeNull();

    await user.click(commitButton!);

    expect(await screen.findByText("ai draft refresh failed")).toBeInTheDocument();
    expect(screen.getByText("Stale card draft")).toBeInTheDocument();
  });

  it("confirms selected graph change drafts into the target graph", async () => {
    listAiDraftsMock.mockReset();
    listAiDraftsMock
      .mockResolvedValueOnce([
        makeGraphDraft({
          id: "graph-draft-1",
          sourceLabel: "Graph note"
        })
      ])
      .mockResolvedValueOnce([]);
    listGraphsMock.mockResolvedValue([makeGraphSummary()]);
    getGraphMock.mockResolvedValue(makeGraphDetail());
    commitGraphChangeDraftSelectionMock.mockResolvedValue({
      ...makeGraphDetail(),
      currentVersion: 2,
      nodeCount: 3,
      updatedAt: "2026-06-02T12:10:00Z"
    });

    const user = userEvent.setup();
    const { container } = renderPage();

    expect(await screen.findByText("Graph note")).toBeInTheDocument();
    expect(await screen.findByText("Node A")).toBeInTheDocument();
    const commitButton = container.querySelector<HTMLButtonElement>(".ai-panel-actions .primary-button");
    expect(commitButton).not.toBeNull();

    await user.click(commitButton!);

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
  });

  it("renders shared select controls for ai workspace filters and target pickers", async () => {
    listAiDraftsMock.mockReset();
    listAiDraftsMock.mockResolvedValue([
      makeCardDraft(),
      makeGraphDraft()
    ]);
    listGraphsMock.mockResolvedValue([makeGraphSummary()]);
    getGraphMock.mockResolvedValue(makeGraphDetail());

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByRole("combobox")).toHaveLength(4);
    });
    screen.getAllByRole("combobox").forEach((combobox) => {
      expect(combobox).toHaveClass("ds-select");
      expect(combobox).toHaveClass("select-field");
    });
  });

  it("prioritizes the requested ai draft from the query string", async () => {
    listAiDraftsMock.mockReset();
    listAiDraftsMock.mockResolvedValue([
      makeCardDraft({
        id: "draft-card-1",
        sourceLabel: "Older draft source",
        front: "Older draft front"
      }),
      makeCardDraft({
        id: "draft-card-2",
        sourceLabel: "Focused draft source",
        front: "Focused draft front",
        updatedAt: "2026-06-03T12:00:00Z"
      })
    ]);

    const { container } = renderPage("/ai?draft=draft-card-2");

    expect(await screen.findByText("已定位指定 AI 草稿，可直接确认或回看来源。")).toBeInTheDocument();
    const draftCards = container.querySelectorAll(".ai-task-list .ai-task-card strong");
    expect(draftCards.item(0)?.textContent).toContain("Focused draft source");
  });

  it("prioritizes the requested ai task from the query string", async () => {
    listAiTasksMock.mockResolvedValue([
      {
        id: "task-1",
        userId: "user-1",
        taskType: "Older task",
        sourceType: "note",
        sourceId: "note-1",
        status: "completed",
        model: "local-draft-engine",
        inputTokens: 12,
        outputTokens: 24,
        costUnits: 0,
        createdAt: "2026-06-02T12:00:00Z",
        updatedAt: "2026-06-02T12:00:00Z"
      },
      {
        id: "task-2",
        userId: "user-1",
        taskType: "Focused task",
        sourceType: "material",
        sourceId: "material-1",
        status: "completed",
        model: "local-draft-engine",
        inputTokens: 12,
        outputTokens: 24,
        costUnits: 0,
        createdAt: "2026-06-03T12:00:00Z",
        updatedAt: "2026-06-03T12:00:00Z"
      }
    ]);

    const { container } = renderPage("/ai?task=task-2");

    expect(await screen.findByText("已定位指定 AI 任务，可先查看结果后再决定是否继续确认。")).toBeInTheDocument();
    const taskSections = container.querySelectorAll(".ai-task-list");
    const taskCards = taskSections.item(1)?.querySelectorAll(".ai-task-card strong") ?? [];
    expect(taskCards.item(0)?.textContent).toContain("Focused task");
  });
});
