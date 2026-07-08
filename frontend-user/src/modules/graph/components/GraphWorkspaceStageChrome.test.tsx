import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GraphDetailPayload, GraphDocumentPayload, GraphNodePayload } from "../../../api/client";
import {
  GraphConflictAssistCard,
  GraphStageCanvas,
  GraphStageEmptyState,
  GraphStageMinimap,
  GraphStageStatus
} from "./GraphWorkspaceStageChrome";

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
  nodeCount: 2,
  edgeCount: 1,
  createdAt: "2026-06-05T00:00:00Z",
  updatedAt: "2026-06-05T00:00:00Z",
  document: {
    graphId: "graph-1",
    version: 4,
    schemaVersion: 1,
    viewport: { x: 0, y: 0, zoom: 1 },
    nodes: [],
    edges: [],
    groups: [],
    theme: {},
    metadata: {}
  }
};

const document: GraphDocumentPayload = {
  graphId: "graph-1",
  version: 4,
  schemaVersion: 1,
  viewport: { x: 0, y: 0, zoom: 1 },
  nodes: [],
  edges: [
    {
      id: "edge-1",
      kind: "straight",
      sourceNodeId: "node-1",
      targetNodeId: "node-2",
      label: "supports",
      metadata: {}
    }
  ],
  groups: [
    {
      id: "group-1",
      title: "Group",
      nodeIds: ["node-1"],
      x: 10,
      y: 12,
      width: 120,
      height: 90,
      collapsed: true,
      metadata: {}
    }
  ],
  theme: {},
  metadata: {}
};

const visibleNodes: GraphNodePayload[] = [
  {
    id: "node-1",
    type: "text",
    title: "Concept",
    x: 20,
    y: 32,
    width: 160,
    height: 88,
    metadata: {}
  },
  {
    id: "node-2",
    type: "card",
    title: "Card",
    x: 260,
    y: 80,
    width: 150,
    height: 80,
    metadata: {}
  }
];

describe("GraphWorkspaceStageChrome components", () => {
  afterEach(() => cleanup());

  it("renders status, graph counts, and alignment hints accessibly", () => {
    const onStatusAction = vi.fn();
    render(
      <GraphStageStatus
        alignmentHintLabels={["snap-left", "snap-top"]}
        graphDetail={graphDetail}
        loading={false}
        onStatusAction={onStatusAction}
        selectedNodeCount={2}
        statusActionLabel="reload latest"
        statusMessage="saved"
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("saved");
    expect(screen.getByText("snap-left")).toBeInTheDocument();
    expect(screen.getByText("snap-top")).toBeInTheDocument();
    expect(screen.getByText(/4/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "reload latest" }));
    expect(onStatusAction).toHaveBeenCalled();
  });

  it("renders minimap groups, active nodes, and viewport bounds", () => {
    const { container } = render(
      <GraphStageMinimap
        document={document}
        minimapViewport={{ left: 1, top: 2, width: 30, height: 20 }}
        scale={0.1}
        selectedNodeIds={["node-1"]}
        stageHeight={800}
        stageWidth={1200}
        visibleNodes={visibleNodes}
      />
    );

    expect(container.querySelector(".graph-minimap-group.collapsed")).not.toBeNull();
    expect(container.querySelector(".graph-minimap-node.active")).not.toBeNull();
    expect(container.querySelector(".graph-minimap-viewport")).not.toBeNull();
  });

  it("shows blocking dependency warnings and disables apply when marked resolutions are unsafe", () => {
    const onChooseResolution = vi.fn();

    render(
      <GraphConflictAssistCard
        changeDetails={[
          { action: "added", id: "node-2", kind: "node", label: "Local node" },
          { action: "updated", id: "group-1", kind: "group", label: "Local group" }
        ]}
        changeSummary={["local change"]}
        latestHeadAvailable
        latestHeadDetails={[{ action: "removed", id: "edge-legacy", kind: "edge", label: "Server edge" }]}
        latestHeadSummary={["server change"]}
        manualMergeDeferred
        materialsCaptured
        resolutionBlockingIssues={[
          {
            ruleType: "dangling_edge",
            severity: "error",
            message: "连线“Local edge”会引用未保留的节点，请先同步保留相关节点或改为保留服务端。",
            targetId: "edge-legacy"
          }
        ]}
        resolutionSuggestions={[
          {
            choice: "keep-local",
            description: "补齐这条依赖需要同时保留相关节点。",
            detail: { action: "updated", id: "group-1", kind: "group", label: "Local group" },
            scope: "localDraft"
          }
        ]}
        resolutionPreflightMessage="如果现在应用：已标记取舍会被 1 个依赖问题阻断（连线“Local edge”会引用未保留的节点）；当前计划保留本地 1 项，保留服务端 1 项。"
        resolutionSelections={{
          "localDraft:node:node-2:added": "keep-local",
          "latestHead:edge:edge-legacy:removed": "keep-latest"
        }}
        resolutionDraftCount={2}
        onApplyResolutionDrafts={vi.fn()}
        onApplyResolutionSuggestions={vi.fn()}
        onChooseResolution={onChooseResolution}
        onDeferManualMerge={vi.fn()}
        onExportConflictBundle={vi.fn()}
        onReloadLatest={vi.fn()}
        onCopyLatestJson={vi.fn()}
        onCopySummaryReport={vi.fn()}
        onCopyDraftJson={vi.fn()}
        onExportLatestJson={vi.fn()}
        onExportSummaryReport={vi.fn()}
        onExportDraftJson={vi.fn()}
      />
    );

    expect(screen.getByText("local change")).toBeInTheDocument();
    expect(screen.getByText("server change")).toBeInTheDocument();
    expect(screen.getByText("节点｜新增｜Local node")).toBeInTheDocument();
    expect(screen.getByText("连线｜删除｜Server edge")).toBeInTheDocument();
    expect(screen.getByLabelText("未标记对象提示")).toHaveTextContent("还有 1 个对象尚未标记取舍");
    expect(
      screen.getByText("如果现在应用已标记取舍，未标记对象会默认沿用最新图谱版本。建议继续逐项确认后再应用。")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("取舍应用预检")).toHaveTextContent(
      "如果现在应用：已标记取舍会被 1 个依赖问题阻断（连线“Local edge”会引用未保留的节点）；当前计划保留本地 1 项，保留服务端 1 项。"
    );
    expect(screen.getByText("当前未保存修改：分组｜修改｜Local group")).toBeInTheDocument();
    expect(screen.getByLabelText("取舍依赖校验问题")).toBeInTheDocument();
    expect(screen.getByText("当前仍阻断：连线“Local edge”会引用未保留的节点。请先调整标记后再应用。")).toBeInTheDocument();
    expect(screen.getByText("连线“Local edge”")).toBeInTheDocument();
    expect(screen.getByText("连线“Local edge”会引用未保留的节点，请先同步保留相关节点或改为保留服务端。")).toBeInTheDocument();
    expect(screen.getByLabelText("联动取舍建议")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "联动保留本地：分组｜修改｜Local group" }));
    expect(onChooseResolution).toHaveBeenCalledWith(
      "localDraft",
      { action: "updated", id: "group-1", kind: "group", label: "Local group" },
      "keep-local"
    );
    expect(screen.getByRole("button", { name: "应用已标记取舍到当前草稿" })).toBeDisabled();
  });

  it("offers a bulk action for linked resolution suggestions", () => {
    const onApplyResolutionSuggestions = vi.fn();

    render(
      <GraphConflictAssistCard
        changeDetails={[]}
        changeSummary={[]}
        latestHeadAvailable
        latestHeadDetails={[]}
        latestHeadSummary={[]}
        resolutionBlockingIssues={[
          {
            ruleType: "dangling_edge",
            severity: "error",
            message: "dangling-edge",
            targetId: "edge-legacy"
          }
        ]}
        resolutionSuggestions={[
          {
            choice: "keep-local",
            description: "补齐本地节点",
            detail: { action: "added", id: "node-local", kind: "node", label: "Local node" },
            scope: "localDraft"
          },
          {
            choice: "keep-latest",
            description: "回退服务端连线",
            detail: { action: "removed", id: "edge-legacy", kind: "edge", label: "Server edge" },
            scope: "latestHead"
          }
        ]}
        resolutionPreflightMessage=""
        resolutionSelections={{}}
        resolutionDraftCount={0}
        onApplyResolutionDrafts={vi.fn()}
        onApplyResolutionSuggestions={onApplyResolutionSuggestions}
        onChooseResolution={vi.fn()}
        onDeferManualMerge={vi.fn()}
        onExportConflictBundle={vi.fn()}
        onReloadLatest={vi.fn()}
        onCopyLatestJson={vi.fn()}
        onCopySummaryReport={vi.fn()}
        onCopyDraftJson={vi.fn()}
        onExportLatestJson={vi.fn()}
        onExportSummaryReport={vi.fn()}
        onExportDraftJson={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "一键应用 2 项联动取舍建议" }));
    expect(onApplyResolutionSuggestions).toHaveBeenCalled();
  });

  it("delegates canvas node, edge, and group interactions", () => {
    const onEdgeSelect = vi.fn();
    const onNodeClick = vi.fn();
    const onToggleGroupCollapse = vi.fn();
    const nodeMap = new Map(visibleNodes.map((node) => [node.id, node]));

    const { container } = render(
      <GraphStageCanvas
        alignmentGuides={[]}
        document={document}
        focusPreview={null}
        graphDetail={graphDetail}
        hiddenNodeIds={new Set()}
        linkFromNodeId=""
        minimapViewport={null}
        nodeMap={nodeMap}
        onCanvasContextMenu={vi.fn()}
        onCanvasPointerDown={vi.fn()}
        onEdgeContextMenu={vi.fn()}
        onEdgeSelect={onEdgeSelect}
        onNodeClick={onNodeClick}
        onNodeContextMenu={vi.fn()}
        onNodePointerDown={vi.fn()}
        onToggleGroupCollapse={onToggleGroupCollapse}
        onWheel={vi.fn()}
        scale={0.1}
        selectedEdgeId=""
        selectedNodeIds={["node-1"]}
        selectionBox={null}
        stageHeight={800}
        stageRef={createRef<HTMLDivElement>()}
        stageWidth={1200}
        visibleNodes={visibleNodes}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Concept/ }));
    expect(onNodeClick).toHaveBeenCalledWith(expect.any(Object), visibleNodes[0]);

    fireEvent.click(screen.getByRole("button", { name: "展开" }));
    expect(onToggleGroupCollapse).toHaveBeenCalledWith("group-1");

    const edgePath = container.querySelector(".graph-edge");
    expect(edgePath).not.toBeNull();
    fireEvent.click(edgePath as Element);
    expect(onEdgeSelect).toHaveBeenCalledWith(expect.any(Object), document.edges[0]);
  });

  it("renders the empty stage fallback", () => {
    render(<GraphStageEmptyState />);

    expect(screen.getByText("正在准备图谱画布...")).toBeInTheDocument();
  });
});
