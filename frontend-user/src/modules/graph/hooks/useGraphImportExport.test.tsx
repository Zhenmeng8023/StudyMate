import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useMemo, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  importGraphMarkdown,
  importGraphMermaid
} from "../../../api/client";
import type {
  AuthSession,
  GraphDetailPayload,
  GraphDocumentPayload,
  GraphValidationIssuePayload,
  MaterialPayload,
  NotePayload
} from "../../../api/client";
import type { GraphWorkspaceSaveState } from "../state/types";
import type { ImportMode } from "../lib/workspaceControllerHelpers";
import { useGraphImportExport } from "./useGraphImportExport";

vi.mock("../../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../../api/client")>("../../../api/client");
  return {
    ...actual,
    importGraphMarkdown: vi.fn(),
    importGraphMermaid: vi.fn()
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

function buildDocument(overrides?: Partial<GraphDocumentPayload>): GraphDocumentPayload {
  return {
    graphId: "graph-1",
    version: 4,
    schemaVersion: 1,
    viewport: { x: 140, y: 120, zoom: 1 },
    nodes: [
      {
        id: "node-1",
        type: "note",
        title: "Retrieval",
        x: 0,
        y: 0,
        width: 240,
        height: 120,
        source: { type: "note", id: "note-1", label: "Note" }
      }
    ],
    edges: [],
    groups: [],
    theme: {},
    metadata: {},
    ...overrides
  };
}

function buildDetail(overrides?: Partial<GraphDetailPayload>): GraphDetailPayload {
  const document = overrides?.document ?? buildDocument();
  return {
    id: "graph-1",
    ownerUserId: "user-1",
    title: 'Study: Graph<>"/bad',
    description: "desc",
    visibility: "private",
    status: "active",
    graphType: "knowledge",
    mode: "free",
    currentVersion: document.version,
    nodeCount: document.nodes.length,
    edgeCount: document.edges.length,
    createdAt: "2026-06-05T08:00:00Z",
    updatedAt: "2026-06-05T08:00:00Z",
    document,
    ...overrides
  };
}

const material: MaterialPayload = {
  id: "material-1",
  ownerUserId: "user-1",
  ownerName: "Alice",
  title: "Material",
  description: "",
  category: "article",
  tags: [],
  coverFileId: "",
  attachmentFileId: "",
  attachmentName: "",
  attachmentMime: "",
  status: "ready",
  favoritesCount: 0,
  averageRating: 0,
  createdAt: "2026-06-05T08:00:00Z",
  updatedAt: "2026-06-05T08:00:00Z"
};

const note: NotePayload = {
  id: "note-1",
  ownerUserId: "user-1",
  materialId: "material-1",
  title: "Note",
  summary: "",
  content: "content",
  folderName: "",
  tags: [],
  versionNumber: 1,
  createdAt: "2026-06-05T08:00:00Z",
  updatedAt: "2026-06-05T08:00:00Z"
};

const importGraphMarkdownMock = vi.mocked(importGraphMarkdown);
const importGraphMermaidMock = vi.mocked(importGraphMermaid);

function ImportExportHarness(props: {
  importMode?: ImportMode;
  importSource?: string;
  pngRenderer?: () => Promise<Blob>;
  textDownloader?: (filename: string, content: string, mimeType: string) => void;
}) {
  const [detail, setDetail] = useState(buildDetail());
  const [statusMessage, setStatusMessage] = useState("");
  const [saveState, setSaveState] = useState<GraphWorkspaceSaveState>("idle");
  const [saving, setSaving] = useState(false);
  const [validationIssues, setValidationIssues] = useState<GraphValidationIssuePayload[]>([]);
  const [appliedLabel, setAppliedLabel] = useState("");
  const [resetLabel, setResetLabel] = useState("");
  const [downloaded, setDownloaded] = useState("");
  const [snapshotLoads, setSnapshotLoads] = useState(0);
  const nodeMap = useMemo(() => new Map(detail.document.nodes.map((node) => [node.id, node])), [detail.document.nodes]);

  const actions = useGraphImportExport({
    blobDownloader: (filename) => setDownloaded(filename),
    graphDetail: detail,
    hiddenNodeIds: new Set<string>(),
    importMode: props.importMode ?? "json",
    importSource: props.importSource ?? "",
    loadSnapshots: async () => {
      setSnapshotLoads((current) => current + 1);
      return true;
    },
    materials: [material],
    nodeMap,
    notes: [note],
    onApplyDocument: (document, options) => {
      setDetail((current) => ({ ...current, document }));
      setAppliedLabel(options?.label ?? "");
      setStatusMessage(options?.status ?? "");
    },
    onResetHistory: (nextDetail, label) => {
      setDetail(nextDetail);
      setResetLabel(label ?? "");
    },
    onSaveStateChange: setSaveState,
    onSavingChange: setSaving,
    onStatusMessage: setStatusMessage,
    onValidationIssuesChange: setValidationIssues,
    pngRenderer: props.pngRenderer ?? (async () => new Blob(["png"], { type: "image/png" })),
    session,
    textDownloader: props.textDownloader ?? ((filename) => setDownloaded(filename))
  });

  return (
    <div>
      <button onClick={() => void actions.importGraph()} type="button">import graph</button>
      <button onClick={() => void actions.exportPng()} type="button">export png</button>
      <button onClick={actions.exportSvg} type="button">export svg</button>
      <button onClick={actions.exportJson} type="button">export json</button>
      <span>status:{statusMessage}</span>
      <span>save-state:{saveState}</span>
      <span>saving:{String(saving)}</span>
      <span>issues:{validationIssues.length}</span>
      <span>applied:{appliedLabel}</span>
      <span>reset:{resetLabel}</span>
      <span>downloaded:{downloaded}</span>
      <span>snapshots:{snapshotLoads}</span>
      <span>nodes:{detail.document.nodes.length}</span>
    </div>
  );
}

describe("useGraphImportExport", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    importGraphMarkdownMock.mockResolvedValue(buildDetail({ title: "Markdown graph", currentVersion: 5 }));
    importGraphMermaidMock.mockResolvedValue(buildDetail({ title: "Mermaid graph", currentVersion: 6 }));
  });

  it("imports valid StudyMate JSON through validation and history", async () => {
    const imported = JSON.stringify({
      schemaVersion: 1,
      nodes: [
        {
          id: "node-2",
          type: "concept",
          title: "Imported",
          x: 0,
          y: 0,
          width: 240,
          height: 120,
          source: { type: "note", id: "note-1" }
        }
      ],
      edges: [],
      groups: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      theme: {},
      metadata: {}
    });

    render(<ImportExportHarness importMode="json" importSource={imported} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "import graph" }));
    });

    expect(screen.getByText("applied:导入 StudyMate 图谱 JSON")).toBeInTheDocument();
    expect(screen.getByText("status:已导入 JSON，另有 1 条校验提示")).toBeInTheDocument();
    expect(screen.getByText("save-state:idle")).toBeInTheDocument();
    expect(screen.getByText("issues:1")).toBeInTheDocument();
    expect(importGraphMarkdownMock).not.toHaveBeenCalled();
    expect(importGraphMermaidMock).not.toHaveBeenCalled();
  });

  it("reports blocking JSON import errors without applying the document", async () => {
    const imported = JSON.stringify({
      schemaVersion: 1,
      nodes: [
        {
          id: "node-2",
          type: "concept",
          title: "Broken",
          x: 0,
          y: 0,
          width: 10,
          height: 10,
          source: { type: "note", id: "missing-note" }
        }
      ],
      edges: [{ id: "edge-1", sourceNodeId: "node-2", targetNodeId: "missing-node" }],
      groups: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      theme: {},
      metadata: {}
    });

    render(<ImportExportHarness importMode="json" importSource={imported} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "import graph" }));
    });

    expect(screen.getByText("save-state:failed")).toBeInTheDocument();
    expect(screen.getByText("issues:3")).toBeInTheDocument();
    expect(screen.getByText("applied:")).toBeInTheDocument();
    expect(screen.getByText("status:导入 JSON 失败：发现 3 条结构错误")).toBeInTheDocument();
  });

  it("imports Markdown through the graph API and refreshes snapshots", async () => {
    render(<ImportExportHarness importMode="markdown" importSource="# Outline" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "import graph" }));
    });

    await waitFor(() => expect(importGraphMarkdownMock).toHaveBeenCalledWith(session, "graph-1", "# Outline"));
    expect(screen.getByText("reset:导入 Markdown 大纲")).toBeInTheDocument();
    expect(screen.getByText("save-state:saved")).toBeInTheDocument();
    expect(screen.getByText("status:已导入 Markdown 大纲")).toBeInTheDocument();
    expect(screen.getByText("snapshots:1")).toBeInTheDocument();
  });

  it("exports StudyMate JSON, SVG, and PNG with safe filenames", async () => {
    render(<ImportExportHarness />);

    fireEvent.click(screen.getByRole("button", { name: "export json" }));
    expect(screen.getByText("downloaded:Study- Graph-bad.smtg")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "export svg" }));
    expect(screen.getByText("downloaded:Study- Graph-bad.svg")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "export png" }));
    });

    expect(screen.getByText("downloaded:Study- Graph-bad.png")).toBeInTheDocument();
    expect(screen.getByText("status:已导出 PNG 图谱")).toBeInTheDocument();
  });

  it("reports export and empty import failures as explicit UI statuses", async () => {
    render(
      <ImportExportHarness
        importMode="json"
        importSource=" "
        pngRenderer={async () => {
          throw new Error("png failed");
        }}
        textDownloader={() => {
          throw new Error("download failed");
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "import graph" }));
    expect(screen.getByText("status:先填写 Markdown、Mermaid 或 StudyMate JSON 内容")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "export json" }));
    expect(screen.getByText("status:导出 StudyMate JSON 失败")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "export svg" }));
    expect(screen.getByText("status:导出 SVG 失败")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "export png" }));
    });

    expect(screen.getByText("status:导出 PNG 失败")).toBeInTheDocument();
  });
});
