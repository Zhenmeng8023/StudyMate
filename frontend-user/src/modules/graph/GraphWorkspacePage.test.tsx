import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  batchSaveGraph,
  createGraph,
  getGraph,
  listDecks,
  listDiagramTemplates,
  listGraphSnapshots,
  listGraphs,
  listMaterials,
  listNotes,
  restoreGraphSnapshot,
  validateGraph
} from "../../api/client";
import type { AuthSession, GraphDetailPayload, GraphSummaryPayload } from "../../api/client";
import { GraphWorkspacePage } from "./GraphWorkspacePage";

vi.mock("../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../api/client")>("../../api/client");
  return {
    ...actual,
    batchSaveGraph: vi.fn(),
    createGraph: vi.fn(),
    getGraph: vi.fn(),
    listDecks: vi.fn(),
    listDiagramTemplates: vi.fn(),
    listGraphs: vi.fn(),
    listGraphSnapshots: vi.fn(),
    listMaterials: vi.fn(),
    listNotes: vi.fn(),
    restoreGraphSnapshot: vi.fn(),
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
    nodes: [],
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
const restoreGraphSnapshotMock = vi.mocked(restoreGraphSnapshot);
const createGraphMock = vi.mocked(createGraph);
const validateGraphMock = vi.mocked(validateGraph);

function renderWorkspace() {
  return render(
    <MemoryRouter>
      <GraphWorkspacePage session={session} />
    </MemoryRouter>
  );
}

describe("GraphWorkspacePage persistence states", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    listGraphsMock.mockResolvedValue([graphSummary]);
    getGraphMock.mockResolvedValue(graphDetail);
    listDecksMock.mockResolvedValue([]);
    listMaterialsMock.mockResolvedValue([]);
    listNotesMock.mockResolvedValue([]);
    listDiagramTemplatesMock.mockResolvedValue([]);
    listGraphSnapshotsMock.mockResolvedValue([
      {
        id: "snapshot-1",
        graphId: "graph-1",
        versionNumber: 3,
        summary: "Before change",
        createdAt: "2026-06-05T08:30:00Z"
      }
    ]);
    batchSaveGraphMock.mockResolvedValue(graphDetail);
    restoreGraphSnapshotMock.mockResolvedValue(graphDetail);
    createGraphMock.mockResolvedValue(graphDetail);
    validateGraphMock.mockResolvedValue({ issues: [] });
  });

  it("shows a failed save state when batch save rejects", async () => {
    const user = userEvent.setup();
    batchSaveGraphMock.mockRejectedValueOnce(new Error("保存服务暂不可用"));

    renderWorkspace();

    await expect(screen.findByRole("button", { name: "保存" })).resolves.toBeInTheDocument();
    await user.click(screen.getByTitle("新建概念节点"));
    expect(screen.getByLabelText("图谱保存状态：有未保存修改")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "保存" }));

    await expect(screen.findByText("保存服务暂不可用")).resolves.toBeInTheDocument();
    expect(screen.getByLabelText("图谱保存状态：保存失败")).toBeInTheDocument();
  });

  it("shows a failed restore state when snapshot restore rejects", async () => {
    const user = userEvent.setup();
    restoreGraphSnapshotMock.mockRejectedValueOnce(new Error("快照恢复失败"));

    renderWorkspace();

    await expect(screen.findByText("Before change")).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "恢复" }));

    await expect(screen.findByText("快照恢复失败")).resolves.toBeInTheDocument();
    expect(screen.getByLabelText("图谱保存状态：保存失败")).toBeInTheDocument();
  });

  it("keeps editing available but reports snapshot list failures", async () => {
    listGraphSnapshotsMock.mockRejectedValueOnce(new Error("snapshot service down"));

    renderWorkspace();

    await expect(screen.findByText("快照列表加载失败，可继续编辑但暂时无法恢复历史版本")).resolves.toBeInTheDocument();
    expect(screen.getByTitle("新建概念节点")).toBeEnabled();
  });

  it("creates extended node types from the toolbar type selector", async () => {
    const user = userEvent.setup();

    renderWorkspace();

    await expect(screen.findByRole("button", { name: "保存" })).resolves.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "PDF 锚点" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("选择新建节点类型"), { target: { value: "url" } });
    await user.click(screen.getByRole("button", { name: "新建URL节点" }));

    expect(screen.getByText("URL 节点")).toBeInTheDocument();
    await user.type(screen.getByLabelText("URL 节点 URL"), "https://example.test/lesson");
    expect(screen.getByLabelText("图谱保存状态：有未保存修改")).toBeInTheDocument();
  });

  it("applies diagram templates as Mermaid import drafts", async () => {
    const user = userEvent.setup();
    listDiagramTemplatesMock.mockResolvedValueOnce([
      {
        id: "uml-class-diagram",
        name: "UML 类图",
        category: "uml",
        description: "梳理类、接口、属性、方法和依赖关系。",
        mode: "diagram",
        sampleLines: ["领域模型", "核心类", "接口契约"]
      }
    ]);

    const { container } = renderWorkspace();

    await expect(screen.findByRole("button", { name: /UML 类图/ })).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /UML 类图/ }));

    expect(screen.getByText("已把工程图模板“UML 类图”作为 Mermaid 草稿放入导入面板")).toBeInTheDocument();
    const importInput = container.querySelector<HTMLTextAreaElement>(".graph-import-input");
    expect(importInput?.value).toBe("flowchart TD\n  T1[领域模型] --> T2[核心类]\n  T2[核心类] --> T3[接口契约]");
    expect(screen.getByRole("button", { name: "Mermaid" })).toHaveClass("active");
  });

  it("reports JSON import validation errors without calling remote import endpoints", async () => {
    const user = userEvent.setup();

    const { container } = renderWorkspace();

    await expect(screen.findByRole("button", { name: "保存" })).resolves.toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "JSON" })[1]);
    const importInput = container.querySelector<HTMLTextAreaElement>(".graph-import-input");
    expect(importInput).not.toBeNull();
    fireEvent.change(
      importInput!,
      {
        target: {
          value:
      JSON.stringify({
        schemaVersion: 1,
        nodes: [
          {
            id: "node-1",
            type: "concept",
            title: "Broken import",
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            source: { type: "note", id: "note-1" }
          }
        ],
        edges: [{ id: "edge-1", sourceNodeId: "node-1", targetNodeId: "missing" }],
        groups: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        theme: {},
        metadata: {}
      })
        }
      }
    );

    await user.click(screen.getByRole("button", { name: "导入草稿" }));

    await expect(screen.findByText("导入 JSON 失败：发现 2 条结构错误")).resolves.toBeInTheDocument();
    expect(screen.getByLabelText("图谱保存状态：保存失败")).toBeInTheDocument();
    expect(batchSaveGraphMock).not.toHaveBeenCalled();
  });

  it("edits selected node detail fields and saves the updated document payload", async () => {
    const user = userEvent.setup();
    const detailWithNode: GraphDetailPayload = {
      ...graphDetail,
      nodeCount: 1,
      document: {
        ...graphDetail.document,
        nodes: [
          {
            id: "node-1",
            type: "url",
            title: "Original URL",
            x: 100,
            y: 100,
            width: 250,
            height: 132,
            source: { type: "material", id: "material-1", label: "资料 A" },
            metadata: { content: { url: "https://old.example.test" } }
          }
        ]
      }
    };
    listGraphsMock.mockResolvedValue([{ ...graphSummary, nodeCount: 1 }]);
    getGraphMock.mockResolvedValue(detailWithNode);
    batchSaveGraphMock.mockResolvedValue(detailWithNode);

    renderWorkspace();

    await user.click(await screen.findByRole("button", { name: /Original URL/ }));
    await user.clear(screen.getByLabelText("节点标题"));
    await user.type(screen.getByLabelText("节点标题"), "Updated URL");
    await user.clear(screen.getByLabelText("Updated URL URL"));
    await user.type(screen.getByLabelText("Updated URL URL"), "https://new.example.test/lesson");

    expect(screen.getByLabelText("图谱保存状态：有未保存修改")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(batchSaveGraphMock).toHaveBeenCalled());
    const saveInput = batchSaveGraphMock.mock.calls.at(-1)?.[2];
    expect(saveInput?.document.nodes[0]).toMatchObject({
      id: "node-1",
      title: "Updated URL",
      metadata: { content: { url: "https://new.example.test/lesson" } }
    });
  });

  it("edits selected edge label and curve style before saving", async () => {
    const user = userEvent.setup();
    const detailWithEdge: GraphDetailPayload = {
      ...graphDetail,
      nodeCount: 2,
      edgeCount: 1,
      document: {
        ...graphDetail.document,
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "Source",
            x: 100,
            y: 100,
            width: 220,
            height: 132,
            source: null,
            metadata: {}
          },
          {
            id: "node-2",
            type: "text",
            title: "Target",
            x: 420,
            y: 100,
            width: 220,
            height: 132,
            source: null,
            metadata: {}
          }
        ],
        edges: [{ id: "edge-1", kind: "straight", sourceNodeId: "node-1", targetNodeId: "node-2", label: "" }]
      }
    };
    listGraphsMock.mockResolvedValue([{ ...graphSummary, nodeCount: 2, edgeCount: 1 }]);
    getGraphMock.mockResolvedValue(detailWithEdge);
    batchSaveGraphMock.mockResolvedValue(detailWithEdge);

    const { container } = renderWorkspace();

    await screen.findByText("Source");
    fireEvent.click(container.querySelector(".graph-edge")!);
    await user.type(screen.getByLabelText("关系标签"), "前置关系");
    fireEvent.change(screen.getByLabelText("线条形态"), { target: { value: "curve" } });

    expect(screen.getByLabelText("图谱保存状态：有未保存修改")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "保存" }));

    await waitFor(() => expect(batchSaveGraphMock).toHaveBeenCalled());
    const saveInput = batchSaveGraphMock.mock.calls.at(-1)?.[2];
    expect(saveInput?.document.edges[0]).toMatchObject({
      id: "edge-1",
      kind: "curve",
      label: "前置关系"
    });
  });
});
