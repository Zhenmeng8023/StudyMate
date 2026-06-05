import type { GraphValidationIssuePayload } from "../../../api/client";

export type GraphValidationRuleGroup = {
  ruleType: string;
  severity: GraphValidationIssuePayload["severity"];
  count: number;
  targetIds: string[];
  messages: string[];
};

export type GraphValidationPanelSummary = {
  totalCount: number;
  statusLabel: string;
  severityCounts: Record<GraphValidationIssuePayload["severity"], number>;
  ruleGroups: GraphValidationRuleGroup[];
};

const severityOrder: Record<GraphValidationIssuePayload["severity"], number> = {
  error: 0,
  warning: 1,
  info: 2
};

export function buildGraphValidationPanelSummary(issues: GraphValidationIssuePayload[]): GraphValidationPanelSummary {
  const severityCounts = issues.reduce<Record<GraphValidationIssuePayload["severity"], number>>(
    (counts, issue) => ({
      ...counts,
      [issue.severity]: counts[issue.severity] + 1
    }),
    { error: 0, warning: 0, info: 0 }
  );
  const ruleGroupMap = new Map<string, GraphValidationRuleGroup>();

  for (const issue of issues) {
    const current = ruleGroupMap.get(issue.ruleType);
    if (current) {
      ruleGroupMap.set(issue.ruleType, {
        ...current,
        severity: severityOrder[issue.severity] < severityOrder[current.severity] ? issue.severity : current.severity,
        count: current.count + 1,
        targetIds: issue.targetId ? [...current.targetIds, issue.targetId] : current.targetIds,
        messages: current.messages.includes(issue.message) ? current.messages : [...current.messages, issue.message]
      });
      continue;
    }

    ruleGroupMap.set(issue.ruleType, {
      ruleType: issue.ruleType,
      severity: issue.severity,
      count: 1,
      targetIds: issue.targetId ? [issue.targetId] : [],
      messages: [issue.message]
    });
  }

  const ruleGroups = [...ruleGroupMap.values()].sort((left, right) => {
    const severityDiff = severityOrder[left.severity] - severityOrder[right.severity];
    return severityDiff === 0 ? left.ruleType.localeCompare(right.ruleType) : severityDiff;
  });

  return {
    totalCount: issues.length,
    statusLabel: buildValidationStatusLabel(severityCounts),
    severityCounts,
    ruleGroups
  };
}

function buildValidationStatusLabel(counts: Record<GraphValidationIssuePayload["severity"], number>) {
  if (counts.error === 0 && counts.warning === 0 && counts.info === 0) {
    return "图谱结构暂未发现问题";
  }

  return [
    counts.error ? `${counts.error} 个错误` : "",
    counts.warning ? `${counts.warning} 个警告` : "",
    counts.info ? `${counts.info} 条提示` : ""
  ]
    .filter(Boolean)
    .join("、")
    .replace(/^/, "发现 ");
}
