import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect, useRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  batchSaveGraph,
  listGraphSnapshots,
  restoreGraphSnapshot
} from "../../../api/client";
import type {
  AuthSession,
  GraphDetailPayload,
  GraphSnapshotPayload,
  GraphSummaryPayload
} from "../../../api/client";
import {
  createEmptyGraphHistoryState,
  resetGraphHistoryState,
  type GraphHistoryState
} from "../lib/graphHistory";
import { buildGraphWorkspaceConcurrencyStorageKey } from "../lib/graphWorkspaceConcurrencySignal";
import { useGraphWorkspacePersistence } from "./useGraphWorkspacePersistence";

vi.mock("../../../api/client", async () => {
  const actual = await vi.importActual<typeof import("../../../api/client")>("../../../api/client");
  return {
    ...actual,
    batchSaveGraph: vi.fn(),
    listGraphSnapshots: vi.fn(),
    restoreGraphSnapshot: vi.fn()
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

const graphDetail: GraphDetailPayload = {
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
  updatedAt: "2026-06-05T08:00:00Z",
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

const snapshot: GraphSnapshotPayload = {
  id: "snapshot-1",
  graphId: "graph-1",
  versionNumber: 4,
  summary: "Before save",
  createdAt: "2026-06-05T08:30:00Z"
};

const batchSaveGraphMock = vi.mocked(batchSaveGraph);
const listGraphSnapshotsMock = vi.mocked(listGraphSnapshots);
const restoreGraphSnapshotMock = vi.mocked(restoreGraphSnapshot);

function PersistenceHarness(props: { initialDirty?: boolean } = {}) {
  const [detail, setDetail] = useState<GraphDetailPayload | null>(graphDetail);
  const [history, setHistory] = useState<GraphHistoryState>(() => ({
    ...resetGraphHistoryState(createEmptyGraphHistoryState(), "加载图谱"),
    dirty: props.initialDirty ?? false
  }));
  const [reloadLatestSuggested, setReloadLatestSuggested] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [replacedTitle, setReplacedTitle] = useState("");
  const detailRef = useRef<GraphDetailPayload | null>(detail);
  const historyRef = useRef<GraphHistoryState>(history);

  useEffect(() => {
    detailRef.current = detail;
  }, [detail]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const persistence = useGraphWorkspacePersistence({
    detailRef,
    dirty: history.dirty,
    graphDetail: detail,
    historyRef,
    onGraphDetailChange: setDetail,
    onHistoryChange: setHistory,
    onReloadLatestSuggestionChange: setReloadLatestSuggested,
    onReplaceGraphSummary: (summary: GraphSummaryPayload) => setReplacedTitle(summary.title),
    onResetHistory: (nextDetail, label) => {
      setDetail(nextDetail);
      const nextHistory = resetGraphHistoryState(historyRef.current, label);
      historyRef.current = nextHistory;
      setHistory(nextHistory);
    },
    onStatusMessage: setStatusMessage,
    session
  });

  return (
    <div>
      <button onClick={() => void persistence.loadSnapshots("graph-1")} type="button">
        load snapshots
      </button>
      <button onClick={() => void persistence.saveCurrentGraph("Manual save")} type="button">
        save graph
      </button>
      <button onClick={() => void persistence.restoreSnapshot(3)} type="button">
        restore snapshot
      </button>
      <span>save-state:{persistence.saveState}</span>
      <span>snapshots:{persistence.snapshots.length}</span>
      <span>dirty:{String(history.dirty)}</span>
      <span>title:{detail?.title}</span>
      <span>history-label:{history.lastLabel}</span>
      <span>reload-suggested:{String(reloadLatestSuggested)}</span>
      <span>replaced:{replacedTitle}</span>
      <span>status:{statusMessage}</span>
    </div>
  );
}

describe("useGraphWorkspacePersistence", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    batchSaveGraphMock.mockResolvedValue({
      ...graphDetail,
      title: "Graph saved",
      currentVersion: 5,
      updatedAt: "2026-06-05T09:00:00Z"
    });
    listGraphSnapshotsMock.mockResolvedValue([snapshot]);
    restoreGraphSnapshotMock.mockResolvedValue({
      ...graphDetail,
      title: "Graph restored",
      currentVersion: 3
    });
  });

  it("saves the current graph, marks history saved, and refreshes snapshots", async () => {
    render(<PersistenceHarness />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "save graph" }));
    });

    await waitFor(() => expect(batchSaveGraphMock).toHaveBeenCalledWith(
      session,
      "graph-1",
      expect.objectContaining({ summary: "Manual save" })
    ));
    expect(await screen.findByText("save-state:saved")).toBeInTheDocument();
    expect(screen.getByText("snapshots:1")).toBeInTheDocument();
    expect(screen.getByText("dirty:false")).toBeInTheDocument();
    expect(screen.getByText("replaced:Graph saved")).toBeInTheDocument();
  });

  it("restores a snapshot through the shared reset history path", async () => {
    render(<PersistenceHarness />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "restore snapshot" }));
    });

    expect(await screen.findByText("save-state:saved")).toBeInTheDocument();
    expect(screen.getByText("title:Graph restored")).toBeInTheDocument();
    expect(screen.getByText("history-label:恢复历史快照")).toBeInTheDocument();
  });

  it("keeps editing state available when snapshot APIs fail", async () => {
    listGraphSnapshotsMock.mockRejectedValueOnce(new Error("snapshot list down"));
    restoreGraphSnapshotMock.mockRejectedValueOnce(new Error("restore down"));

    render(<PersistenceHarness />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "load snapshots" }));
    });

    expect(await screen.findByText("snapshots:0")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "restore snapshot" }));
    });

    expect(await screen.findByText("save-state:failed")).toBeInTheDocument();
    expect(screen.getByText("status:restore down")).toBeInTheDocument();
  });

  it("keeps dirty edits visible when batch save reports a version conflict", async () => {
    batchSaveGraphMock.mockRejectedValueOnce(new Error("图谱已被其他窗口更新，请刷新当前图谱后再保存。"));

    render(<PersistenceHarness initialDirty />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "save graph" }));
    });

    expect(await screen.findByText("save-state:failed")).toBeInTheDocument();
    expect(screen.getByText("dirty:true")).toBeInTheDocument();
    expect(screen.getByText("reload-suggested:true")).toBeInTheDocument();
    expect(screen.getByText("status:图谱已被其他窗口更新，请刷新当前图谱后再保存。")).toBeInTheDocument();
  });

  it("warns when another window is still editing the same graph", async () => {
    render(<PersistenceHarness />);

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: buildGraphWorkspaceConcurrencyStorageKey("graph-1", "other-session"),
          newValue: JSON.stringify({
            currentVersion: 4,
            dirty: true,
            graphId: "graph-1",
            sessionId: "other-session",
            updatedAt: "2026-07-01T20:05:00Z"
          }),
          storageArea: window.localStorage
        })
      );
    });

    expect(
      await screen.findByText("status:检测到另一个窗口正在编辑当前图谱，请保存前确认最新版本。")
    ).toBeInTheDocument();
    expect(screen.getByText("reload-suggested:false")).toBeInTheDocument();
  });

  it("warns when another window has already saved a newer graph version", async () => {
    render(<PersistenceHarness />);

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: buildGraphWorkspaceConcurrencyStorageKey("graph-1", "other-session"),
          newValue: JSON.stringify({
            currentVersion: 5,
            dirty: false,
            graphId: "graph-1",
            sessionId: "other-session",
            updatedAt: "2026-07-01T20:06:00Z"
          }),
          storageArea: window.localStorage
        })
      );
    });

    expect(
      await screen.findByText("status:另一窗口已保存更高版本，请刷新图谱后再继续编辑。")
    ).toBeInTheDocument();
    expect(screen.getByText("reload-suggested:true")).toBeInTheDocument();
  });
});
