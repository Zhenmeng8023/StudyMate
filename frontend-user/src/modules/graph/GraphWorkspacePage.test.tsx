import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
import { buildGraphWorkspaceConcurrencyStorageKey } from "./lib/graphWorkspaceConcurrencySignal";
import { buildGraphWorkspaceDraftStorageKey } from "./lib/graphWorkspaceDraftRecovery";

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
const clipboardWriteTextMock = vi.fn();
const createObjectUrlMock = vi.fn();
const revokeObjectUrlMock = vi.fn();

function renderWorkspace() {
  return render(
    <MemoryRouter>
      <GraphWorkspacePage session={session} />
    </MemoryRouter>
  );
}

async function openResourceTab(user: ReturnType<typeof userEvent.setup>, name: "图谱" | "来源" | "模板") {
  const toggle = await screen.findByLabelText("打开资源面板");
  await user.click(toggle);
  await user.click(await screen.findByRole("button", { name }));
}

async function openInspectorTab(
  user: ReturnType<typeof userEvent.setup>,
  name: "概览" | "属性" | "来源" | "历史" | "导入"
) {
  const toggle = screen.queryByLabelText("打开检查器");
  if (toggle) {
    await user.click(toggle);
  }
  await user.click(await screen.findByRole("button", { name }));
}

describe("GraphWorkspacePage persistence states", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    clipboardWriteTextMock.mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: clipboardWriteTextMock
      }
    });
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectUrlMock.mockReturnValue("blob:conflict")
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectUrlMock
    });
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

    await expect(screen.findByRole("button", { name: /保存/ })).resolves.toBeInTheDocument();
    await user.click(screen.getByTitle("新建概念节点"));
    expect(screen.getByLabelText("图谱保存状态：有未保存修改")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /保存/ }));

    await expect(screen.findByText("保存服务暂不可用")).resolves.toBeInTheDocument();
    expect(screen.getByLabelText("图谱保存状态：保存失败")).toBeInTheDocument();
  });

  it("offers reloading the latest graph after a version conflict and confirms discarding dirty edits", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    batchSaveGraphMock.mockRejectedValueOnce(new Error("图谱已被其他窗口更新，请刷新当前图谱后再保存。"));
    getGraphMock.mockReset();
    getGraphMock
      .mockResolvedValueOnce(graphDetail)
      .mockResolvedValueOnce({
        ...graphDetail,
        title: "Graph on server",
        currentVersion: 5,
        updatedAt: "2026-07-01T20:20:00Z",
        document: {
          ...graphDetail.document,
          version: 5
        }
      })
      .mockResolvedValueOnce({
        ...graphDetail,
        title: "Graph on server",
        currentVersion: 5,
        updatedAt: "2026-07-01T20:20:00Z",
        document: {
          ...graphDetail.document,
          version: 5
        }
      });

    renderWorkspace();

    await expect(screen.findByRole("button", { name: /保存/ })).resolves.toBeInTheDocument();
    await user.click(screen.getByTitle("新建概念节点"));
    await user.click(screen.getByRole("button", { name: /保存/ }));

    await expect(screen.findByText("图谱已被其他窗口更新，请刷新当前图谱后再保存。")).resolves.toBeInTheDocument();
    expect(screen.getByLabelText("图谱冲突辅助")).toHaveTextContent("先留存当前草稿，再决定是否重载");
    expect(screen.getByText("如果确认放弃本地修改：可直接重载最新图谱")).toBeInTheDocument();
    expect(screen.getByText("如果打算稍后人工合并：先导出冲突处理包，再重载最新图谱")).toBeInTheDocument();
    expect(screen.getAllByText("节点：新增 1 个（新概念）")).toHaveLength(2);
    expect(screen.getByText("建议优先核对的对象")).toBeInTheDocument();
    expect(screen.getAllByText("节点｜新增｜新概念")).toHaveLength(2);
    await expect(screen.findByText("标题已修改（当前：Graph；基线：Graph on server）")).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "保留本地（当前未保存修改）：节点｜新增｜新概念" }));
    await expect(screen.findByText("已标记对象级取舍：保留本地（节点｜新增｜新概念）")).resolves.toBeInTheDocument();
    expect(screen.getByText("已标记：保留本地")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "复制冲突摘要" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "导出冲突摘要" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "复制最新图谱 JSON" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "导出最新图谱 JSON" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "导出冲突处理包" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "复制当前草稿 JSON" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "导出当前草稿 JSON" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "复制冲突摘要" }));

    await expect(screen.findByText("已复制图谱冲突摘要，可在重载前同步当前取舍信息")).resolves.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "复制最新图谱 JSON" }));

    await expect(screen.findByText("已复制最新图谱 JSON，可与本地草稿配合人工比对")).resolves.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "导出冲突处理包" }));

    await expect(screen.findByText("已导出冲突处理包，可稍后人工比对本地与最新版本")).resolves.toBeInTheDocument();
    expect(screen.getByText("已留存冲突材料，可安全重载最新图谱")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "先保留本地，稍后人工合并" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "先保留本地，稍后人工合并" }));

    await expect(screen.findAllByText("已标记为稍后人工合并，当前继续保留本地草稿")).resolves.toHaveLength(2);
    expect(confirmSpy).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "复制当前草稿 JSON" }));

    await expect(
      screen.findByText(/已复制当前草稿 JSON，可在重载前留存本地修改|当前环境不支持复制当前草稿 JSON，请改用导出。/)
    ).resolves.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /重载最新图谱/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "放弃本地并重载最新图谱" }));

    expect(confirmSpy).toHaveBeenCalledWith("重新加载最新图谱会丢弃当前未保存修改，确定继续吗？");
    await expect(screen.findByText("已重新加载最新图谱，未保存更改已放弃")).resolves.toBeInTheDocument();
    expect(screen.getByLabelText("图谱保存状态：空闲")).toBeInTheDocument();
    expect(screen.getByText(/版本 5 · 0 节点 · 0 连线/)).toBeInTheDocument();
    confirmSpy.mockRestore();
  });

  it("shows a failed restore state when snapshot restore rejects", async () => {
    const user = userEvent.setup();
    restoreGraphSnapshotMock.mockRejectedValueOnce(new Error("快照恢复失败"));

    renderWorkspace();

    await openInspectorTab(user, "历史");
    await expect(screen.findByText("Before change")).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "恢复" }));

    await expect(screen.findByText("快照恢复失败")).resolves.toBeInTheDocument();
    expect(screen.getByLabelText("图谱保存状态：保存失败")).toBeInTheDocument();
  });

  it("blocks snapshot restore when the graph still has unsaved edits", async () => {
    const user = userEvent.setup();

    renderWorkspace();

    await expect(screen.findByRole("button", { name: /保存/ })).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /新建.*节点/ }));
    expect(screen.getByLabelText(/图谱保存状态：有未保存修改/)).toBeInTheDocument();

    await openInspectorTab(user, "历史");
    await user.click(screen.getByRole("button", { name: /恢复/ }));

    await expect(screen.findByText(/未保存修改，请先保存后再恢复快照/)).resolves.toBeInTheDocument();
    expect(screen.getByLabelText(/图谱保存状态：有未保存修改/)).toBeInTheDocument();
    expect(restoreGraphSnapshotMock).not.toHaveBeenCalled();
  });

  it("restores a same-version local draft when reopening the same graph workspace", async () => {
    const user = userEvent.setup();

    renderWorkspace();

    await expect(screen.findByRole("button", { name: /保存/ })).resolves.toBeInTheDocument();
    await user.click(screen.getByTitle("新建概念节点"));
    expect(screen.getByLabelText("图谱保存状态：有未保存修改")).toBeInTheDocument();
    expect(window.sessionStorage.getItem(buildGraphWorkspaceDraftStorageKey("graph-1"))).not.toBeNull();

    cleanup();

    renderWorkspace();

    await expect(screen.findByText("已恢复本地未保存草稿，请尽快保存图谱")).resolves.toBeInTheDocument();
    expect(screen.getByLabelText("图谱保存状态：有未保存修改")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /新概念/ })).toBeInTheDocument();
  });

  it("offers reloading the latest graph when another window has already saved a newer version", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    getGraphMock.mockReset();
    getGraphMock
      .mockResolvedValueOnce(graphDetail)
      .mockResolvedValueOnce({
        ...graphDetail,
        currentVersion: 5,
        updatedAt: "2026-07-01T20:22:00Z",
        document: {
          ...graphDetail.document,
          version: 5
        }
      })
      .mockResolvedValueOnce({
        ...graphDetail,
        currentVersion: 5,
        updatedAt: "2026-07-01T20:22:00Z",
        document: {
          ...graphDetail.document,
          version: 5
        }
      });

    renderWorkspace();

    await expect(screen.findByRole("button", { name: /保存/ })).resolves.toBeInTheDocument();
    await user.click(screen.getByTitle("新建概念节点"));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: buildGraphWorkspaceConcurrencyStorageKey("graph-1", "other-session"),
        newValue: JSON.stringify({
          currentVersion: 5,
          dirty: false,
          graphId: "graph-1",
          sessionId: "other-session",
          updatedAt: "2026-07-01T20:21:00Z"
        }),
        storageArea: window.localStorage
      })
    );

    await expect(screen.findByText("另一窗口已保存更高版本，请刷新图谱后再继续编辑。")).resolves.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "查看冲突处理" }));
    await user.click(screen.getByRole("button", { name: "放弃本地并重载最新图谱" }));

    expect(confirmSpy).toHaveBeenCalledWith("重新加载最新图谱会丢弃当前未保存修改，确定继续吗？");
    await expect(screen.findByText("已重新加载最新图谱，未保存更改已放弃")).resolves.toBeInTheDocument();
    expect(screen.getByLabelText("图谱保存状态：空闲")).toBeInTheDocument();
    confirmSpy.mockRestore();
  });

  it("explains when a stale local draft is discarded in favor of the latest graph head", async () => {
    window.sessionStorage.setItem(
      buildGraphWorkspaceDraftStorageKey("graph-1"),
      JSON.stringify({
        currentVersion: 4,
        description: "stale draft",
        document: {
          ...graphDetail.document,
          nodes: [
            {
              id: "node-stale",
              type: "concept",
              title: "Stale recovered node",
              x: 120,
              y: 140,
              width: 220,
              height: 132,
              source: null,
              metadata: {}
            }
          ]
        },
        graphId: "graph-1",
        savedAt: "2026-07-01T20:10:00Z",
        title: "Stale draft graph"
      })
    );
    getGraphMock.mockResolvedValueOnce({
      ...graphDetail,
      currentVersion: 5,
      updatedAt: "2026-07-01T20:11:00Z",
      document: {
        ...graphDetail.document,
        version: 5
      }
    });

    renderWorkspace();

    await expect(screen.findByText("检测到本地草稿基于旧版本，已放弃恢复并加载最新图谱")).resolves.toBeInTheDocument();
    expect(screen.getByLabelText("图谱保存状态：空闲")).toBeInTheDocument();
    expect(window.sessionStorage.getItem(buildGraphWorkspaceDraftStorageKey("graph-1"))).toBeNull();
    expect(screen.getByText(/版本 5 · 0 节点 · 0 连线/)).toBeInTheDocument();
    expect(screen.queryByText("Stale recovered node")).toBeNull();
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

    await expect(screen.findByRole("button", { name: /保存/ })).resolves.toBeInTheDocument();
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

    await openResourceTab(user, "模板");
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

    await expect(screen.findByRole("button", { name: /保存/ })).resolves.toBeInTheDocument();
    await openInspectorTab(user, "导入");
    const inspector = screen.getByLabelText("图谱检查器");
    await user.click(within(inspector).getByRole("button", { name: "JSON" }));
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
    await user.click(screen.getByRole("button", { name: /保存/ }));

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
    await user.click(screen.getByRole("button", { name: /保存/ }));

    await waitFor(() => expect(batchSaveGraphMock).toHaveBeenCalled());
    const saveInput = batchSaveGraphMock.mock.calls.at(-1)?.[2];
    expect(saveInput?.document.edges[0]).toMatchObject({
      id: "edge-1",
      kind: "curve",
      label: "前置关系"
    });
  });
});
