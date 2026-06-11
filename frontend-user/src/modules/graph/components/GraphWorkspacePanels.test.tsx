import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GraphValidationIssuePayload } from "../../../api/client";
import {
  GraphContextMenuPanel,
  GraphKeyboardGuidePanel,
  GraphSettingsPanel,
  GraphValidationIssueList
} from "./GraphWorkspacePanels";

describe("GraphWorkspacePanels", () => {
  it("renders the keyboard guide as a dismissible dialog", () => {
    const onClose = vi.fn();

    render(<GraphKeyboardGuidePanel onClose={onClose} />);

    expect(screen.getByRole("dialog", { name: "图谱快捷键" })).toBeInTheDocument();
    expect(screen.getByText("Ctrl/Cmd + Z / Y")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "关闭快捷键说明" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders node context actions and only shows open-source when available", () => {
    const actions = {
      onCreateCanvasMaterialNode: vi.fn(),
      onCreateCanvasNoteNode: vi.fn(),
      onCreateCanvasTextNode: vi.fn(),
      onCreateGroup: vi.fn(),
      onDeleteEdge: vi.fn(),
      onDeleteNode: vi.fn(),
      onDuplicateNode: vi.fn(),
      onExportPng: vi.fn(),
      onFocusNode: vi.fn(),
      onOpenSource: vi.fn(),
      onToggleEdgeKind: vi.fn(),
      onToggleLinkStart: vi.fn()
    };

    render(
      <GraphContextMenuPanel
        contextMenu={{ edgeId: "", nodeId: "node-1", x: 120, y: 80 }}
        hasSourceTarget
        isLinkStartSelected={false}
        {...actions}
      />
    );

    expect(screen.getByRole("menu", { name: "图谱上下文菜单" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "打开来源" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "删除节点" }));
    expect(actions.onDeleteNode).toHaveBeenCalledTimes(1);
  });

  it("renders validation issues and falls back to the empty-state copy", () => {
    const issues: GraphValidationIssuePayload[] = [
      {
        message: "连线终点不存在",
        ruleType: "dangling_edge",
        severity: "error",
        targetId: "edge-1"
      },
      {
        message: "节点缺少来源",
        ruleType: "missing_source",
        severity: "warning",
        targetId: "node-1"
      }
    ];

    const { rerender } = render(<GraphValidationIssueList issues={issues} />);
    expect(screen.getByText("发现 1 个错误、1 个警告")).toBeInTheDocument();
    expect(screen.getByText("悬挂连线 · 1")).toBeInTheDocument();
    expect(screen.getByText("缺少来源 · 1")).toBeInTheDocument();
    expect(screen.getByText("定位：edge-1")).toBeInTheDocument();
    expect(screen.getByText("修复建议：删除这条连线，或重新连接到仍存在的节点。")).toBeInTheDocument();
    expect(screen.getByText("连线终点不存在")).toBeInTheDocument();

    rerender(<GraphValidationIssueList issues={[]} />);
    expect(screen.getByText("验证结果")).toBeInTheDocument();
    expect(screen.getByText("这里会显示悬空连线、空标题等图谱结构问题。")).toBeInTheDocument();
  });

  it("renders settings sections as a compact panel", () => {
    render(
      <GraphSettingsPanel
        sections={[
          {
            key: "autosave",
            eyebrow: "自动保存",
            title: "保存状态",
            summary: "自动保存负责兜底，手动保存负责确认。",
            actions: [{ label: "dirty", state: "离页保护" }],
            items: ["自动保存间隔约 8 秒。"]
          },
          {
            key: "performance",
            eyebrow: "性能提示",
            title: "已达到基准规模",
            summary: "已进入 200/300/20 基准规模，请优先使用治理工具。",
            tone: "warning",
            actions: [{ label: "大图导航", state: "建议使用搜索/小地图" }],
            items: ["当前 200 节点 / 300 边 / 20 分组。"]
          }
        ]}
      />
    );

    expect(screen.getByRole("region", { name: "图谱设置" })).toBeInTheDocument();
    expect(screen.getByText("自动保存")).toBeInTheDocument();
    expect(screen.getByText("已达到基准规模")).toBeInTheDocument();
    expect(screen.getByText("自动保存负责兜底，手动保存负责确认。")).toBeInTheDocument();
    expect(screen.getByText("dirty · 离页保护")).toBeInTheDocument();
    expect(screen.getByText("大图导航 · 建议使用搜索/小地图")).toBeInTheDocument();
  });
});
