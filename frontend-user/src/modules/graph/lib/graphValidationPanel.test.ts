import { describe, expect, it } from "vitest";
import type { GraphValidationIssuePayload } from "../../../api/client";
import { buildGraphValidationPanelSummary } from "./graphValidationPanel";

const issues: GraphValidationIssuePayload[] = [
  {
    ruleType: "dangling_edge",
    message: "连线终点不存在",
    severity: "error",
    targetId: "edge-1"
  },
  {
    ruleType: "missing_source",
    message: "节点缺少来源",
    severity: "warning",
    targetId: "node-1"
  },
  {
    ruleType: "missing_source",
    message: "节点缺少来源",
    severity: "warning",
    targetId: "node-2"
  },
  {
    ruleType: "isolated_node",
    message: "节点没有连线",
    severity: "info",
    targetId: "node-3"
  }
];

describe("buildGraphValidationPanelSummary", () => {
  it("groups validation issues by severity and rule type", () => {
    const summary = buildGraphValidationPanelSummary(issues);

    expect(summary.totalCount).toBe(4);
    expect(summary.severityCounts).toEqual({ error: 1, warning: 2, info: 1 });
    expect(summary.statusLabel).toBe("发现 1 个错误、2 个警告、1 条提示");
    expect(summary.ruleGroups.map((group) => [group.ruleType, group.count, group.severity])).toEqual([
      ["dangling_edge", 1, "error"],
      ["missing_source", 2, "warning"],
      ["isolated_node", 1, "info"]
    ]);
    expect(summary.ruleGroups[0]).toMatchObject({
      ruleLabel: "悬挂连线",
      severityLabel: "错误",
      impact: "保存和导入会被阻断，需要先修复结构。",
      fixHint: "删除这条连线，或重新连接到仍存在的节点。",
      targetSummary: "edge-1"
    });
    expect(summary.ruleGroups[1]).toMatchObject({
      ruleLabel: "缺少来源",
      severityLabel: "警告",
      fixHint: "为节点补充资料、笔记、卡片、批注或 AI 草稿来源，保留学习闭环反链。",
      targetSummary: "node-1、node-2"
    });
  });

  it("describes all productization validation rule types with repair guidance", () => {
    const productRules: GraphValidationIssuePayload[] = [
      { ruleType: "isolated_node", message: "isolated", severity: "info", targetId: "node-a" },
      { ruleType: "missing_source", message: "missing", severity: "warning", targetId: "node-b" },
      { ruleType: "duplicate_title", message: "duplicate", severity: "warning", targetId: "node-c" },
      { ruleType: "dangling_edge", message: "dangling", severity: "error", targetId: "edge-a" },
      { ruleType: "cross_collapsed_group_edge", message: "cross", severity: "warning", targetId: "edge-b" },
      { ruleType: "empty_group", message: "empty", severity: "warning", targetId: "group-a" },
      { ruleType: "invalid_node_size", message: "size", severity: "error", targetId: "node-d" },
      { ruleType: "invalid_source_target", message: "source", severity: "error", targetId: "node-e" },
      { ruleType: "invalid_group_node", message: "group", severity: "error", targetId: "group-b" },
      { ruleType: "duplicate_node_id", message: "id", severity: "error", targetId: "node-f" },
      { ruleType: "empty_node_title", message: "title", severity: "warning", targetId: "node-g" },
      { ruleType: "unknown_rule", message: "unknown", severity: "info", targetId: "item" }
    ];

    const summary = buildGraphValidationPanelSummary(productRules);

    expect(summary.ruleGroups).toHaveLength(12);
    expect(summary.ruleGroups.every((group) => group.ruleLabel && group.impact && group.fixHint)).toBe(true);
    expect(summary.ruleGroups.find((group) => group.ruleType === "invalid_source_target")).toMatchObject({
      ruleLabel: "无效来源目标",
      fixHint: "改为当前用户可访问的来源对象，或移除不完整的 source.type/source.id。"
    });
    expect(summary.ruleGroups.find((group) => group.ruleType === "unknown_rule")).toMatchObject({
      ruleLabel: "unknown_rule",
      impact: "这是图谱治理提示，不会自动修改画布。",
      fixHint: "根据提示检查目标对象。"
    });
  });

  it("reports a clean graph when no issues are present", () => {
    const summary = buildGraphValidationPanelSummary([]);

    expect(summary.totalCount).toBe(0);
    expect(summary.statusLabel).toBe("图谱结构暂未发现问题");
    expect(summary.ruleGroups).toEqual([]);
  });
});
