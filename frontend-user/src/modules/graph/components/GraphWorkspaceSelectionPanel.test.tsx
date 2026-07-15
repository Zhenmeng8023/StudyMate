import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GraphEdgePayload, GraphGroupPayload, GraphNodePayload } from "../../../api/client";
import { GraphWorkspaceSelectionPanel } from "./GraphWorkspaceSelectionPanel";

const urlNode: GraphNodePayload = {
  id: "node-1",
  type: "url",
  title: "URL 节点",
  x: 100,
  y: 100,
  width: 250,
  height: 132,
  source: { type: "material", id: "material-1", label: "资料 A" },
  metadata: { content: { url: "https://old.example.test" } }
};

const edge: GraphEdgePayload = {
  id: "edge-1",
  kind: "straight",
  sourceNodeId: "node-1",
  targetNodeId: "node-2",
  label: ""
};

const groups: GraphGroupPayload[] = [
  {
    id: "group-1",
    title: "Group 1",
    nodeIds: ["node-1"],
    x: 0,
    y: 0,
    width: 320,
    height: 220,
    collapsed: false,
    metadata: {}
  }
];

function renderPanel(overrides: Partial<Parameters<typeof GraphWorkspaceSelectionPanel>[0]> = {}) {
  const props: Parameters<typeof GraphWorkspaceSelectionPanel>[0] = {
    batchEmphasis: "default",
    batchSizePreset: "default",
    batchTone: "neutral",
    groups: [],
    onAlignSelectedNodes: vi.fn(),
    onApplyBatchEmphasis: vi.fn(),
    onApplyBatchSizePreset: vi.fn(),
    onApplyBatchTone: vi.fn(),
    onClearNodeSelection: vi.fn(),
    onCreateGroupFromSelectedNode: vi.fn(),
    onCreateSourceGroupsFromSelection: vi.fn(),
    onCreateSourceSwimlanesFromSelection: vi.fn(),
    onDeleteSelectedNodes: vi.fn(),
    onDistributeSelectedNodes: vi.fn(),
    onEdgeKindChange: vi.fn(),
    onEdgeLabelChange: vi.fn(),
    onGroupTitleChange: vi.fn(),
    onNodeDetailChange: vi.fn(),
    onNodeEmphasisChange: vi.fn(),
    onNodeMetadataFieldChange: vi.fn(),
    onNodeSizePresetChange: vi.fn(),
    onNodeTitleChange: vi.fn(),
    onNodeToneChange: vi.fn(),
    onOpenReviewWorkspace: vi.fn(),
    onOpenSource: vi.fn(),
    onOrganizeSelectedNodesBySource: vi.fn(),
    onToggleGroupCollapse: vi.fn(),
    selectedEdge: null,
    selectedNode: null,
    selectedNodeIds: [],
    selectedNodeReviewFeedback: null,
    selectedNodeSourceBacklink: null,
    selectedNodes: [],
    selectedSourceSummary: [],
    ...overrides
  };
  render(<GraphWorkspaceSelectionPanel {...props} />);
  return props;
}

describe("GraphWorkspaceSelectionPanel", () => {
  afterEach(() => cleanup());

  it("renders node metadata editors and delegates node edits", async () => {
    const props = renderPanel({
      selectedNode: urlNode,
      selectedNodes: [urlNode],
      selectedNodeIds: [urlNode.id],
      selectedNodeSourceBacklink: {
        target: "/reader/material-1",
        actionLabel: "回到阅读器",
        sourceTypeLabel: "资料",
        sourceId: "material-1",
        learningStepLabel: "资料阅读",
        description: "回到原始资料确认上下文，再从图谱节点生成卡片草稿进入复习。"
      }
    });

    fireEvent.change(screen.getByLabelText("节点标题"), { target: { value: "新标题" } });
    expect(props.onNodeTitleChange).toHaveBeenLastCalledWith("新标题");

    fireEvent.change(screen.getByLabelText("URL 节点 URL"), { target: { value: "https://new.example.test" } });
    expect(props.onNodeMetadataFieldChange).toHaveBeenLastCalledWith("url", "https://new.example.test");

    const user = userEvent.setup();
    expect(screen.getByText("学习闭环")).toBeInTheDocument();
    expect(screen.getAllByText("资料 / material-1").length).toBeGreaterThan(0);
    expect(screen.getByText("资料阅读")).toBeInTheDocument();
    expect(screen.getByText("回到原始资料确认上下文，再从图谱节点生成卡片草稿进入复习。")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "回到阅读器" }));
    expect(props.onOpenSource).toHaveBeenCalledWith("/reader/material-1");
  });

  it("renders source-linked review feedback for the selected node", async () => {
    const user = userEvent.setup();
    const props = renderPanel({
      selectedNode: urlNode,
      selectedNodes: [urlNode],
      selectedNodeIds: [urlNode.id],
      selectedNodeSourceBacklink: {
        target: "/reader/material-1",
        actionLabel: "回到阅读器",
        sourceTypeLabel: "资料",
        sourceId: "material-1",
        learningStepLabel: "资料阅读",
        description: "回到原始资料确认上下文，再从图谱节点生成卡片草稿进入复习。"
      },
      selectedNodeReviewFeedback: {
        weakCardCount: 2,
        dueCount: 1,
        learningCount: 2,
        maxLapseCount: 3,
        sampleCardFronts: ["资料卡片 A", "资料卡片 B"]
      }
    });

    expect(screen.getByText("复习反馈")).toBeInTheDocument();
    expect(screen.getByText("关联 2 张待回补卡片，其中 1 张已经到期。")).toBeInTheDocument();
    expect(screen.getByText("2 张仍在学习中")).toBeInTheDocument();
    expect(screen.getByText("最高遗忘 3 次")).toBeInTheDocument();
    expect(screen.getByText("资料卡片 A")).toBeInTheDocument();
    expect(screen.getByText("资料卡片 B")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "打开复习工作台" }));
    expect(props.onOpenReviewWorkspace).toHaveBeenCalledWith({
      sourceType: "material",
      sourceId: "material-1"
    });
  });

  it("delegates edge label and kind editing", async () => {
    const props = renderPanel({ selectedEdge: edge });

    fireEvent.change(screen.getByLabelText("关系标签"), { target: { value: "前置" } });
    expect(props.onEdgeLabelChange).toHaveBeenLastCalledWith("前置");
    expect(screen.getByLabelText("线条形态")).toHaveClass("ds-select");
    fireEvent.change(screen.getByLabelText("线条形态"), { target: { value: "curve" } });
    expect(props.onEdgeKindChange).toHaveBeenCalledWith("curve");
  });

  it("renders structured metadata editors for card nodes", () => {
    const cardNode: GraphNodePayload = {
      ...urlNode,
      id: "card-node",
      type: "card",
      title: "复习卡片",
      source: { type: "card", id: "card-1", label: "卡片 A" },
      metadata: { content: { cardId: "card-1", deckId: "deck-1" } }
    };
    const props = renderPanel({
      selectedNode: cardNode,
      selectedNodes: [cardNode],
      selectedNodeIds: [cardNode.id],
      selectedNodeSourceBacklink: null
    });

    expect(screen.getByLabelText("复习卡片 卡片 ID")).toHaveValue("card-1");
    expect(screen.getByLabelText("复习卡片 卡组 ID")).toHaveValue("deck-1");

    fireEvent.change(screen.getByLabelText("复习卡片 卡片 ID"), { target: { value: "card-2" } });
    expect(props.onNodeMetadataFieldChange).toHaveBeenLastCalledWith("cardId", "card-2");
  });

  it("renders a structured mode selector for diagram nodes", () => {
    const diagramNode: GraphNodePayload = {
      ...urlNode,
      id: "diagram-node",
      type: "diagram",
      title: "ERD 模型",
      source: null,
      metadata: { content: { diagramKind: "erd", diagramShape: "entity" } }
    };
    const props = renderPanel({
      selectedNode: diagramNode,
      selectedNodes: [diagramNode],
      selectedNodeIds: [diagramNode.id],
      selectedNodeSourceBacklink: null
    });

    const modeSelect = screen.getByLabelText("ERD 模型 工程图类型");
    expect(modeSelect).toHaveValue("erd");
    expect(modeSelect).toHaveClass("ds-select");
    expect(screen.getByRole("option", { name: "C4" })).toBeInTheDocument();

    fireEvent.change(modeSelect, { target: { value: "c4" } });
    expect(props.onNodeMetadataFieldChange).toHaveBeenLastCalledWith("diagramKind", "c4");
  });

  it("renders multi-select actions and group editing", async () => {
    const user = userEvent.setup();
    const props = renderPanel({
      groups,
      selectedNodeIds: ["node-1", "node-2", "node-3"],
      selectedNodes: [
        urlNode,
        { ...urlNode, id: "node-2", title: "节点 2" },
        { ...urlNode, id: "node-3", title: "节点 3" }
      ],
      selectedSourceSummary: [{ label: "资料", count: 3 }]
    });

    await user.click(screen.getByRole("button", { name: "横向均分" }));
    expect(props.onDistributeSelectedNodes).toHaveBeenCalledWith("horizontal");
    await user.click(screen.getByRole("button", { name: "生成来源泳道" }));
    expect(props.onCreateSourceSwimlanesFromSelection).toHaveBeenCalled();

    fireEvent.change(screen.getByDisplayValue("Group 1"), { target: { value: "新分组" } });
    expect(props.onGroupTitleChange).toHaveBeenLastCalledWith("group-1", "新分组");
  });

  it("renders operation guidance when nothing is selected", () => {
    renderPanel();

    expect(screen.getByText("操作提示")).toBeInTheDocument();
    expect(screen.getByText(/点击节点可编辑标题/)).toBeInTheDocument();
  });
});
