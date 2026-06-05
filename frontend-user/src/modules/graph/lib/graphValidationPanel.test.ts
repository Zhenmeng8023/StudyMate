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
  });

  it("reports a clean graph when no issues are present", () => {
    const summary = buildGraphValidationPanelSummary([]);

    expect(summary.totalCount).toBe(0);
    expect(summary.statusLabel).toBe("图谱结构暂未发现问题");
    expect(summary.ruleGroups).toEqual([]);
  });
});
