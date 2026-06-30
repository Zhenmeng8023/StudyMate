import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GraphDetailPayload } from "../../../api/client";
import { graphNodeTypeOptions } from "../lib/graphNodeTypes";
import { GraphWorkspaceHeader, GraphWorkspaceSourceRail, GraphWorkspaceToolbar } from "./GraphWorkspaceShell";

const graphDetail: GraphDetailPayload = {
  id: "graph-1",
  ownerUserId: "user-1",
  title: "Graph",
  description: "desc",
  visibility: "private",
  status: "active",
  graphType: "knowledge",
  mode: "free",
  currentVersion: 1,
  nodeCount: 1,
  edgeCount: 0,
  createdAt: "2026-06-05T00:00:00Z",
  updatedAt: "2026-06-05T00:00:00Z",
  document: {
    graphId: "graph-1",
    version: 1,
    schemaVersion: 1,
    viewport: { x: 0, y: 0, zoom: 1 },
    nodes: [],
    edges: [],
    groups: [],
    theme: {},
    metadata: {}
  }
};

describe("GraphWorkspaceShell components", () => {
  afterEach(() => cleanup());

  it("renders save state with accessible label", () => {
    render(
      <GraphWorkspaceHeader
        graphDetail={graphDetail}
        onCreateGraph={vi.fn()}
        onSave={vi.fn()}
        saveState="dirty"
        saveStateLabel="有未保存修改"
        saving={false}
      />
    );

    expect(screen.getByLabelText("图谱保存状态：有未保存修改")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeEnabled();
  });

  it("exposes toolbar actions and node type changes", () => {
    const onQuickNodeTypeChange = vi.fn();
    const onLocateNode = vi.fn();
    const onSearchChange = vi.fn();

    render(
      <GraphWorkspaceToolbar
        graphDetail={graphDetail}
        graphSearch="heap"
        hasSelectedEdge={false}
        historyFutureCount={0}
        historyPastCount={1}
        isLinking={false}
        nodeTypeOptions={graphNodeTypeOptions}
        onCreateGroup={vi.fn()}
        onCreateNode={vi.fn()}
        onDeleteSelection={vi.fn()}
        onExportJson={vi.fn()}
        onExportPng={vi.fn()}
        onExportSvg={vi.fn()}
        onLocateNode={onLocateNode}
        onQuickNodeTypeChange={onQuickNodeTypeChange}
        onRedo={vi.fn()}
        onSearchChange={onSearchChange}
        onToggleKeyboardGuide={vi.fn()}
        onToggleLinkMode={vi.fn()}
        onUndo={vi.fn()}
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        quickNodeType="text"
        quickNodeTypeLabel="概念"
        selectedNodeCount={1}
        showKeyboardGuide={false}
      />
    );

    fireEvent.change(screen.getByLabelText("选择新建节点类型"), { target: { value: "pdf-anchor" } });
    expect(onQuickNodeTypeChange).toHaveBeenCalledWith("pdf-anchor");
    expect(screen.getByRole("option", { name: "工程图" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("选择新建节点类型"), { target: { value: "diagram" } });
    expect(onQuickNodeTypeChange).toHaveBeenCalledWith("diagram");

    fireEvent.keyDown(screen.getByPlaceholderText("搜索节点"), { key: "Enter" });
    expect(onLocateNode).toHaveBeenCalled();
    expect(screen.getByLabelText("图谱工具栏")).toBeInTheDocument();
  });

  it("renders diagram template mode and sample preview in the source rail", () => {
    const onApplyTemplate = vi.fn();

    render(
      <GraphWorkspaceSourceRail
        diagramTemplates={[
          {
            id: "uml-class-diagram",
            name: "UML 类图",
            category: "uml",
            description: "梳理类、接口、属性、方法和依赖关系。",
            mode: "diagram",
            sampleLines: ["领域模型", "核心类", "接口契约", "依赖关系"]
          }
        ]}
        graphDetail={graphDetail}
        graphs={[graphDetail]}
        materials={[]}
        notes={[]}
        onAddMaterialNode={vi.fn()}
        onAddNoteNode={vi.fn()}
        onApplyTemplate={onApplyTemplate}
        onOpenGraph={vi.fn()}
      />
    );

    expect(screen.getByText("工程图 / uml")).toBeInTheDocument();
    expect(screen.getByText("领域模型 → 核心类 → 接口契约")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /UML 类图/ }));
    expect(onApplyTemplate).toHaveBeenCalledWith(expect.objectContaining({ id: "uml-class-diagram" }));
  });
});
