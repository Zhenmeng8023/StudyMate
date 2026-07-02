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
        alignmentHintLabels={["左对齐", "顶部对齐"]}
        graphDetail={graphDetail}
        loading={false}
        onStatusAction={onStatusAction}
        selectedNodeCount={2}
        statusActionLabel="重新加载最新图谱"
        statusMessage="已保存"
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("已保存");
    expect(screen.getByLabelText("对齐参考线")).toHaveTextContent("左对齐");
    expect(screen.getByText("版本 4 · 2 节点 · 1 连线 · 已选 2 个节点")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "重新加载最新图谱" }));
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

    expect(screen.getByLabelText("图谱小地图")).toBeInTheDocument();
    expect(container.querySelector(".graph-minimap-group.collapsed")).not.toBeNull();
    expect(container.querySelector(".graph-minimap-node.active")).not.toBeNull();
    expect(container.querySelector(".graph-minimap-viewport")).not.toBeNull();
  });

  it("offers conflict helpers and disposal guidance for dirty conflicts", () => {
    const onExportConflictBundle = vi.fn();
    const onDeferManualMerge = vi.fn();
    const onReloadLatest = vi.fn();
    const onCopyLatestJson = vi.fn();
    const onCopySummaryReport = vi.fn();
    const onExportSummaryReport = vi.fn();
    const onExportLatestJson = vi.fn();
    const onCopyDraftJson = vi.fn();
    const onExportDraftJson = vi.fn();

    render(
      <GraphConflictAssistCard
        changeSummary={["标题已修改", "节点：新增 1 个"]}
        latestHeadAvailable
        latestHeadSummary={["标题已修改", "节点：新增 1 个，删除 1 个"]}
        manualMergeDeferred
        materialsCaptured
        onDeferManualMerge={onDeferManualMerge}
        onExportConflictBundle={onExportConflictBundle}
        onReloadLatest={onReloadLatest}
        onCopyLatestJson={onCopyLatestJson}
        onCopySummaryReport={onCopySummaryReport}
        onCopyDraftJson={onCopyDraftJson}
        onExportLatestJson={onExportLatestJson}
        onExportSummaryReport={onExportSummaryReport}
        onExportDraftJson={onExportDraftJson}
      />
    );

    expect(screen.getByLabelText("图谱冲突辅助")).toHaveTextContent("先留存当前草稿，再决定是否重载");
    expect(screen.getByText("已留存冲突材料，可安全重载最新图谱")).toBeInTheDocument();
    expect(screen.getByText("已标记为稍后人工合并，当前继续保留本地草稿")).toBeInTheDocument();
    expect(screen.getByText("如果确认放弃本地修改：可直接重载最新图谱")).toBeInTheDocument();
    expect(screen.getByText("如果打算稍后人工合并：先导出冲突处理包，再重载最新图谱")).toBeInTheDocument();
    expect(screen.getAllByText("标题已修改")).toHaveLength(2);
    expect(screen.getByText("节点：新增 1 个，删除 1 个")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "复制冲突摘要" }));
    fireEvent.click(screen.getByRole("button", { name: "导出冲突摘要" }));
    fireEvent.click(screen.getByRole("button", { name: "复制最新图谱 JSON" }));
    fireEvent.click(screen.getByRole("button", { name: "导出最新图谱 JSON" }));
    fireEvent.click(screen.getByRole("button", { name: "导出冲突处理包" }));
    fireEvent.click(screen.getByRole("button", { name: "先保留本地，稍后人工合并" }));
    fireEvent.click(screen.getByRole("button", { name: "复制当前草稿 JSON" }));
    fireEvent.click(screen.getByRole("button", { name: "导出当前草稿 JSON" }));
    fireEvent.click(screen.getByRole("button", { name: "放弃本地并重载最新图谱" }));
    expect(onExportConflictBundle).toHaveBeenCalled();
    expect(onDeferManualMerge).toHaveBeenCalled();
    expect(onReloadLatest).toHaveBeenCalled();
    expect(onCopyLatestJson).toHaveBeenCalled();
    expect(onExportLatestJson).toHaveBeenCalled();
    expect(onCopySummaryReport).toHaveBeenCalled();
    expect(onExportSummaryReport).toHaveBeenCalled();
    expect(onCopyDraftJson).toHaveBeenCalled();
    expect(onExportDraftJson).toHaveBeenCalled();
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
