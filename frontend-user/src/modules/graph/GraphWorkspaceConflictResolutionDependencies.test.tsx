import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  batchSaveGraph,
  getGraph,
  listDecks,
  listDiagramTemplates,
  listGraphSnapshots,
  listGraphs,
  listMaterials,
  listNotes,
  validateGraph
} from "../../api/client";
import type { AuthSession, GraphDetailPayload, GraphSummaryPayload } from "../../api/client";
import { GraphWorkspacePage } from "./GraphWorkspacePage";
import { buildGraphWorkspaceDraftStorageKey } from "./lib/graphWorkspaceDraftRecovery";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    batchSaveGraph: vi.fn(),
    getGraph: vi.fn(),
    listDecks: vi.fn(),
    listDiagramTemplates: vi.fn(),
    listGraphs: vi.fn(),
    listGraphSnapshots: vi.fn(),
    listMaterials: vi.fn(),
    listNotes: vi.fn(),
    validateGraph: vi.fn()
  };
});

const session: AuthSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-06-05T12:00:00Z",
  user: {
    id: "user-1",
    username: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    role: "student"
  }
};

const graphSummary: GraphSummaryPayload = {
  id: "graph-1",
  ownerUserId: "user-1",
  title: "Graph",
  description: "desc",
  visibility: "private",
  status: "active",
  graphType: "knowledge",
  mode: "free",
  currentVersion: 4,
  nodeCount: 0,
  edgeCount: 0,
  createdAt: "2026-06-05T08:00:00Z",
  updatedAt: "2026-06-05T08:00:00Z"
};

const graphDetail: GraphDetailPayload = {
  ...graphSummary,
  document: {
    graphId: "graph-1",
    version: 4,
    schemaVersion: 1,
    viewport: { x: 140, y: 120, zoom: 1 },
    nodes: [
      {
        id: "node-1",
        type: "text",
        title: "Graph root",
        x: 140,
        y: 120,
        width: 220,
        height: 132,
        source: null,
        metadata: {}
      }
    ],
    edges: [],
    groups: [],
    theme: {},
    metadata: {}
  }
};

const listGraphsMock = vi.mocked(listGraphs);
const getGraphMock = vi.mocked(getGraph);
const listDecksMock = vi.mocked(listDecks);
const listMaterialsMock = vi.mocked(listMaterials);
const listNotesMock = vi.mocked(listNotes);
const listDiagramTemplatesMock = vi.mocked(listDiagramTemplates);
const listGraphSnapshotsMock = vi.mocked(listGraphSnapshots);
const batchSaveGraphMock = vi.mocked(batchSaveGraph);
const validateGraphMock = vi.mocked(validateGraph);

function renderWorkspace() {
  return render(
    <MemoryRouter>
      <GraphWorkspacePage session={session} />
    </MemoryRouter>
  );
}

describe("GraphWorkspacePage conflict dependency guard", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    listGraphsMock.mockResolvedValue([graphSummary]);
    getGraphMock.mockResolvedValue(graphDetail);
    listDecksMock.mockResolvedValue([]);
    listMaterialsMock.mockResolvedValue([]);
    listNotesMock.mockResolvedValue([]);
    listDiagramTemplatesMock.mockResolvedValue([]);
    listGraphSnapshotsMock.mockResolvedValue([]);
    batchSaveGraphMock.mockResolvedValue(graphDetail);
    validateGraphMock.mockResolvedValue({ issues: [] });
  });

  it("blocks applying marked resolutions when they would leave a dangling local edge", async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem(
      buildGraphWorkspaceDraftStorageKey("graph-1"),
      JSON.stringify({
        currentVersion: 4,
        description: "local draft",
        document: {
          ...graphDetail.document,
          nodes: [
            ...graphDetail.document.nodes,
            {
              id: "node-local",
              type: "concept",
              title: "Local concept",
              x: 420,
              y: 120,
              width: 220,
              height: 132,
              source: null,
              metadata: {}
            }
          ],
          edges: [
            {
              id: "edge-local",
              kind: "curve",
              sourceNodeId: "node-1",
              targetNodeId: "node-local",
              label: "Local edge",
              metadata: {}
            }
          ],
          groups: []
        },
        graphId: "graph-1",
        savedAt: "2026-07-01T20:10:00Z",
        title: "Recovered graph"
      })
    );
    batchSaveGraphMock.mockRejectedValueOnce(new Error("graph_version_conflict"));
    getGraphMock.mockReset();
    getGraphMock
      .mockResolvedValueOnce(graphDetail)
      .mockResolvedValueOnce({
        ...graphDetail,
        currentVersion: 5,
        updatedAt: "2026-07-01T20:20:00Z",
        document: {
          ...graphDetail.document,
          version: 5
        }
      });

    renderWorkspace();

    await expect(screen.findByRole("button", { name: "保存修改" })).resolves.toBeInTheDocument();
    expect(screen.getByLabelText("图谱保存状态：有未保存修改")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "保存修改" }));

    await expect(screen.findByLabelText("图谱冲突辅助")).resolves.toBeInTheDocument();
    const localEdgeRow = screen.getByText("连线｜新增｜Local edge").closest("li");
    expect(localEdgeRow).not.toBeNull();
    await user.click(within(localEdgeRow as HTMLElement).getAllByRole("button")[0]);

    expect(screen.getByLabelText("取舍依赖校验问题")).toBeInTheDocument();
    expect(screen.getByText("当前仍阻断：edge-local。请先调整标记后再应用。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "应用已标记取舍到当前草稿" })).toBeDisabled();
    expect(screen.getByText("Local edge")).toBeInTheDocument();
    expect(screen.getByLabelText("图谱保存状态：保存失败")).toBeInTheDocument();
  });

  it("offers linked resolution actions that can clear dependency blockers", async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem(
      buildGraphWorkspaceDraftStorageKey("graph-1"),
      JSON.stringify({
        currentVersion: 4,
        description: "local draft",
        document: {
          ...graphDetail.document,
          nodes: [
            ...graphDetail.document.nodes,
            {
              id: "node-local",
              type: "concept",
              title: "Local concept",
              x: 420,
              y: 120,
              width: 220,
              height: 132,
              source: null,
              metadata: {}
            }
          ],
          edges: [
            {
              id: "edge-local",
              kind: "curve",
              sourceNodeId: "node-1",
              targetNodeId: "node-local",
              label: "Local edge",
              metadata: {}
            }
          ],
          groups: []
        },
        graphId: "graph-1",
        savedAt: "2026-07-01T20:10:00Z",
        title: "Recovered graph"
      })
    );
    batchSaveGraphMock.mockRejectedValueOnce(new Error("graph_version_conflict"));
    getGraphMock.mockReset();
    getGraphMock
      .mockResolvedValueOnce(graphDetail)
      .mockResolvedValueOnce({
        ...graphDetail,
        currentVersion: 5,
        updatedAt: "2026-07-01T20:20:00Z",
        document: {
          ...graphDetail.document,
          version: 5
        }
      });

    renderWorkspace();

    await expect(screen.findByRole("button", { name: "保存修改" })).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "保存修改" }));
    await expect(screen.findByLabelText("图谱冲突辅助")).resolves.toBeInTheDocument();

    const localEdgeRow = screen.getByText("连线｜新增｜Local edge").closest("li");
    expect(localEdgeRow).not.toBeNull();
    await user.click(within(localEdgeRow as HTMLElement).getAllByRole("button")[0]);

    await expect(screen.findByLabelText("联动取舍建议")).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "联动保留本地：节点｜新增｜Local concept" }));

    expect(screen.queryByLabelText("取舍依赖校验问题")).toBeNull();
    expect(screen.getByRole("button", { name: "应用已标记取舍到当前草稿" })).toBeEnabled();
  });

  it("includes unmarked-object fallback guidance in the apply preflight summary", async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem(
      buildGraphWorkspaceDraftStorageKey("graph-1"),
      JSON.stringify({
        currentVersion: 4,
        description: "local draft",
        document: {
          ...graphDetail.document,
          nodes: [
            ...graphDetail.document.nodes,
            {
              id: "node-local",
              type: "concept",
              title: "Local concept",
              x: 420,
              y: 120,
              width: 220,
              height: 132,
              source: null,
              metadata: {}
            }
          ],
          edges: [
            {
              id: "edge-local",
              kind: "curve",
              sourceNodeId: "node-1",
              targetNodeId: "node-local",
              label: "Local edge",
              metadata: {}
            }
          ],
          groups: []
        },
        graphId: "graph-1",
        savedAt: "2026-07-01T20:10:00Z",
        title: "Recovered graph"
      })
    );
    batchSaveGraphMock.mockRejectedValueOnce(new Error("graph_version_conflict"));
    getGraphMock.mockReset();
    getGraphMock
      .mockResolvedValueOnce(graphDetail)
      .mockResolvedValueOnce({
        ...graphDetail,
        currentVersion: 5,
        updatedAt: "2026-07-01T20:20:00Z",
        document: {
          ...graphDetail.document,
          version: 5
        }
      });

    renderWorkspace();

    await expect(screen.findByRole("button", { name: "保存修改" })).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "保存修改" }));
    await expect(screen.findByLabelText("图谱冲突辅助")).resolves.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /保留本地.*Local edge/ }));

    await expect(screen.findByLabelText("取舍应用预检")).resolves.toHaveTextContent(
      "例如保留本地：Local edge"
    );
    await expect(screen.findByLabelText("取舍应用预检")).resolves.toHaveTextContent(
      "另外 1 个未标记对象会默认沿用最新图谱版本"
    );
  });

  it("can batch-apply linked resolution suggestions to clear dependency blockers", async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem(
      buildGraphWorkspaceDraftStorageKey("graph-1"),
      JSON.stringify({
        currentVersion: 4,
        description: "local draft",
        document: {
          ...graphDetail.document,
          nodes: [
            ...graphDetail.document.nodes,
            {
              id: "node-local",
              type: "concept",
              title: "Local concept",
              x: 420,
              y: 120,
              width: 220,
              height: 132,
              source: null,
              metadata: {}
            }
          ],
          edges: [
            {
              id: "edge-local",
              kind: "curve",
              sourceNodeId: "node-1",
              targetNodeId: "node-local",
              label: "Local edge",
              metadata: {}
            }
          ],
          groups: []
        },
        graphId: "graph-1",
        savedAt: "2026-07-01T20:10:00Z",
        title: "Recovered graph"
      })
    );
    batchSaveGraphMock.mockRejectedValueOnce(new Error("graph_version_conflict"));
    getGraphMock.mockReset();
    getGraphMock
      .mockResolvedValueOnce(graphDetail)
      .mockResolvedValueOnce({
        ...graphDetail,
        currentVersion: 5,
        updatedAt: "2026-07-01T20:20:00Z",
        document: {
          ...graphDetail.document,
          version: 5
        }
      });

    renderWorkspace();

    await expect(screen.findByRole("button", { name: "保存修改" })).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "保存修改" }));
    await expect(screen.findByLabelText("图谱冲突辅助")).resolves.toBeInTheDocument();

    const localEdgeRow = screen.getByText("连线｜新增｜Local edge").closest("li");
    expect(localEdgeRow).not.toBeNull();
    await user.click(within(localEdgeRow as HTMLElement).getAllByRole("button")[0]);

    await expect(screen.findByLabelText("联动取舍建议")).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "一键应用 2 项联动取舍建议" }));

    await expect(
      screen.findByText("已批量标记 2 条联动取舍建议（保留本地 1 项，保留服务端 1 项），当前已解除依赖阻断，可继续应用已标记取舍")
    ).resolves.toBeInTheDocument();
    expect(screen.queryByLabelText("取舍依赖校验问题")).toBeNull();
    expect(screen.getByRole("button", { name: "应用已标记取舍到当前草稿" })).toBeEnabled();
  });
});
