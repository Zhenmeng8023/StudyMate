import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GraphDetailPayload, GraphDocumentPayload, GraphNodePayload } from "../../../api/client";
import { cloneDocument, type FocusPreview } from "../lib/workspaceControllerHelpers";
import { useGraphViewportCamera } from "./useGraphViewportCamera";

function buildDocument(overrides?: Partial<GraphDocumentPayload>): GraphDocumentPayload {
  return {
    graphId: "graph-1",
    version: 1,
    schemaVersion: 1,
    viewport: { x: 140, y: 120, zoom: 1 },
    nodes: [
      {
        id: "node-1",
        type: "concept",
        title: "Target node",
        x: 420,
        y: 320,
        width: 220,
        height: 120
      }
    ],
    edges: [],
    groups: [],
    theme: {},
    metadata: {},
    ...overrides
  };
}

function buildDetail(document = buildDocument()): GraphDetailPayload {
  return {
    id: "graph-1",
    ownerUserId: "user-1",
    title: "Graph",
    description: "",
    visibility: "private",
    status: "active",
    graphType: "knowledge",
    mode: "free",
    currentVersion: document.version,
    nodeCount: document.nodes.length,
    edgeCount: document.edges.length,
    createdAt: "2026-06-05T08:00:00Z",
    updatedAt: "2026-06-05T08:00:00Z",
    document
  };
}

function CameraHarness(props: {
  requestedFocus?: FocusPreview | null;
  requestedFocusKey?: string;
  requestedGraphId?: string;
}) {
  const [detail, setDetail] = useState(() => buildDetail());
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [navigationTarget, setNavigationTarget] = useState("");
  const stageRef = useRef<HTMLDivElement | null>(null);
  const targetNode = detail.document.nodes[0] as GraphNodePayload;

  const camera = useGraphViewportCamera({
    graphDetail: detail,
    locationPathname: "/graph",
    locationSearch: "?graphId=graph-1&focusX=420&focusY=320&focusWidth=220&focusHeight=120&focusLabel=Linked+note",
    navigate: (target) => setNavigationTarget(`${target.pathname}${target.search}`),
    onPreviewViewport: (viewport, status) => {
      setDetail((current) => ({
        ...current,
        document: {
          ...current.document,
          viewport: {
            ...current.document.viewport,
            ...viewport
          }
        }
      }));
      setStatusMessage(status);
    },
    onSelectNode: setSelectedNodeId,
    onStatusMessage: setStatusMessage,
    onViewportDocumentChange: (mutator, options) => {
      setDetail((current) => {
        const document = cloneDocument(current.document);
        mutator(document);
        return { ...current, document };
      });
      setStatusMessage(options?.status ?? "");
    },
    requestedFocus: props.requestedFocus ?? null,
    requestedFocusKey: props.requestedFocusKey ?? "",
    requestedGraphId: props.requestedGraphId ?? "",
    stageRef,
    stageViewport: { width: 800, height: 600 }
  });

  return (
    <div>
      <div
        ref={(element) => {
          stageRef.current = element;
          if (element) {
            Object.defineProperty(element, "clientWidth", { configurable: true, value: 800 });
            Object.defineProperty(element, "clientHeight", { configurable: true, value: 600 });
          }
        }}
      />
      <button onClick={() => camera.focusNode(targetNode)} type="button">focus</button>
      <button onClick={() => camera.zoomGraph(0.1, "zoomed in")} type="button">zoom in</button>
      <button onClick={camera.resetViewport} type="button">reset</button>
      <div
        aria-label="wheel target"
        onWheel={(event) => camera.handleWheel(event)}
      >
        wheel target
      </div>
      <span>viewport:{`${detail.document.viewport.x},${detail.document.viewport.y},${detail.document.viewport.zoom}`}</span>
      <span>selected:{selectedNodeId}</span>
      <span>status:{statusMessage}</span>
      <span>minimap:{camera.minimapViewport ? "ready" : "none"}</span>
      <span>focus-preview:{camera.focusPreview?.label ?? ""}</span>
      <span>navigation:{navigationTarget}</span>
    </div>
  );
}

describe("useGraphViewportCamera", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("builds minimap viewport and focuses a node through viewport mutation", () => {
    render(<CameraHarness />);

    expect(screen.getByText("minimap:ready")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "focus" }));

    expect(screen.getByText("selected:node-1")).toBeInTheDocument();
    expect(screen.getByText("status:已定位到节点 Target node")).toBeInTheDocument();
    expect(screen.getByText(/^viewport:/)).not.toHaveTextContent("140,120,1");
  });

  it("zooms and resets the viewport from toolbar and wheel actions", () => {
    render(<CameraHarness />);

    fireEvent.click(screen.getByRole("button", { name: "zoom in" }));
    expect(screen.getByText("status:zoomed in")).toBeInTheDocument();
    expect(screen.getByText(/^viewport:/)).toHaveTextContent(",1.1");

    fireEvent.wheel(screen.getByLabelText("wheel target"), { deltaY: 100 });
    expect(screen.getByText("status:已调整缩放，等待保存")).toBeInTheDocument();
    expect(screen.getByText(/^viewport:/)).toHaveTextContent(",1.02");

    fireEvent.click(screen.getByRole("button", { name: "reset" }));
    expect(screen.getByText("status:已重置画布视野")).toBeInTheDocument();
    expect(screen.getByText("viewport:140,120,1")).toBeInTheDocument();
  });

  it("previews requested focus once, clears navigation state, and expires the preview", () => {
    render(
      <CameraHarness
        requestedFocus={{
          x: 420,
          y: 320,
          width: 220,
          height: 120,
          label: "Linked note",
        }}
        requestedFocusKey="focus-1"
        requestedGraphId="graph-1"
      />
    );

    expect(screen.getByText("focus-preview:Linked note")).toBeInTheDocument();
    expect(screen.getByText("status:已定位到 Linked note")).toBeInTheDocument();
    expect(screen.getByText("navigation:/graph")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2600);
    });

    expect(screen.getByText("focus-preview:")).toBeInTheDocument();
  });
});
