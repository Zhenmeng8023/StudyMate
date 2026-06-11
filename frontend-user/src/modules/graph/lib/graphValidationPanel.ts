import type { GraphValidationIssuePayload } from "../../../api/client";

export type GraphValidationRuleGroup = {
  ruleType: string;
  ruleLabel: string;
  severity: GraphValidationIssuePayload["severity"];
  severityLabel: string;
  count: number;
  impact: string;
  fixHint: string;
  targetSummary: string;
  targetIds: string[];
  messages: string[];
};

export type GraphValidationIssueDetail = GraphValidationIssuePayload & {
  fixHint: string;
  impact: string;
  ruleLabel: string;
  severityLabel: string;
  targetLabel: string;
};

export type GraphValidationPanelSummary = {
  totalCount: number;
  statusLabel: string;
  severityCounts: Record<GraphValidationIssuePayload["severity"], number>;
  issueDetails: GraphValidationIssueDetail[];
  ruleGroups: GraphValidationRuleGroup[];
};

const severityOrder: Record<GraphValidationIssuePayload["severity"], number> = {
  error: 0,
  warning: 1,
  info: 2
};

const severityLabels: Record<GraphValidationIssuePayload["severity"], string> = {
  error: "错误",
  warning: "警告",
  info: "提示"
};

type GraphValidationRuleDescriptor = {
  fixHint: string;
  ruleLabel: string;
};

const ruleDescriptors: Record<string, GraphValidationRuleDescriptor> = {
  missing_node_id: {
    ruleLabel: "缺少节点 ID",
    fixHint: "重新导入或修复节点 ID，确保每个节点都有稳定唯一标识。"
  },
  duplicate_node_id: {
    ruleLabel: "重复节点 ID",
    fixHint: "为重复节点生成新 ID，避免保存后覆盖同一对象。"
  },
  empty_node_title: {
    ruleLabel: "空节点标题",
    fixHint: "为节点补充可读标题，方便搜索、定位和卡片生成。"
  },
  invalid_node_size: {
    ruleLabel: "非法节点尺寸",
    fixHint: "把节点宽高调整回允许范围，避免画布渲染和导出异常。"
  },
  missing_source: {
    ruleLabel: "缺少来源",
    fixHint: "为节点补充资料、笔记、卡片、批注或 AI 草稿来源，保留学习闭环反链。"
  },
  invalid_source_target: {
    ruleLabel: "无效来源目标",
    fixHint: "改为当前用户可访问的来源对象，或移除不完整的 source.type/source.id。"
  },
  duplicate_title: {
    ruleLabel: "重复标题",
    fixHint: "为重复标题补充上下文，例如章节、来源或概念限定词。"
  },
  dangling_edge: {
    ruleLabel: "悬挂连线",
    fixHint: "删除这条连线，或重新连接到仍存在的节点。"
  },
  empty_group: {
    ruleLabel: "空分组",
    fixHint: "删除空分组，或把相关节点重新放回分组。"
  },
  invalid_group_node: {
    ruleLabel: "无效分组节点",
    fixHint: "从分组中移除不存在的节点引用，或恢复对应节点。"
  },
  cross_collapsed_group_edge: {
    ruleLabel: "跨折叠分组连线",
    fixHint: "展开相关分组、调整分组边界，或把跨组关系移到更高层级表达。"
  },
  isolated_node: {
    ruleLabel: "孤立节点",
    fixHint: "连接到相关概念、资料、笔记或卡片；如果是临时想法，可保留为提示。"
  }
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
  const issueDetails = issues.map((issue) => buildGraphValidationIssueDetail(issue));

  for (const issue of issues) {
    const descriptor = getRuleDescriptor(issue.ruleType);
    const current = ruleGroupMap.get(issue.ruleType);
    if (current) {
      const targetIds = issue.targetId ? [...current.targetIds, issue.targetId] : current.targetIds;
      const nextSeverity =
        severityOrder[issue.severity] < severityOrder[current.severity] ? issue.severity : current.severity;
      ruleGroupMap.set(issue.ruleType, {
        ...current,
        impact: buildSeverityImpact(nextSeverity),
        severity: nextSeverity,
        severityLabel: severityLabels[nextSeverity],
        count: current.count + 1,
        targetIds,
        targetSummary: formatTargetSummary(targetIds),
        messages: current.messages.includes(issue.message) ? current.messages : [...current.messages, issue.message]
      });
      continue;
    }

    ruleGroupMap.set(issue.ruleType, {
      ruleType: issue.ruleType,
      ruleLabel: descriptor.ruleLabel,
      severity: issue.severity,
      severityLabel: severityLabels[issue.severity],
      count: 1,
      impact: buildSeverityImpact(issue.severity),
      fixHint: descriptor.fixHint,
      targetIds: issue.targetId ? [issue.targetId] : [],
      targetSummary: formatTargetSummary(issue.targetId ? [issue.targetId] : []),
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
    issueDetails,
    severityCounts,
    ruleGroups
  };
}

function buildGraphValidationIssueDetail(issue: GraphValidationIssuePayload): GraphValidationIssueDetail {
  const descriptor = getRuleDescriptor(issue.ruleType);
  return {
    ...issue,
    fixHint: descriptor.fixHint,
    impact: buildSeverityImpact(issue.severity),
    ruleLabel: descriptor.ruleLabel,
    severityLabel: severityLabels[issue.severity],
    targetLabel: issue.targetId || "无指定目标"
  };
}

function getRuleDescriptor(ruleType: string): GraphValidationRuleDescriptor {
  return (
    ruleDescriptors[ruleType] ?? {
      ruleLabel: ruleType,
      fixHint: "根据提示检查目标对象。"
    }
  );
}

function buildSeverityImpact(severity: GraphValidationIssuePayload["severity"]) {
  switch (severity) {
    case "error":
      return "保存和导入会被阻断，需要先修复结构。";
    case "warning":
      return "不会阻断保存，但会降低来源追溯、阅读性或长期维护质量。";
    default:
      return "这是图谱治理提示，不会自动修改画布。";
  }
}

function formatTargetSummary(targetIds: string[]) {
  const uniqueTargetIds = [...new Set(targetIds.filter(Boolean))];
  if (uniqueTargetIds.length === 0) {
    return "无指定目标";
  }
  if (uniqueTargetIds.length <= 4) {
    return uniqueTargetIds.join("、");
  }
  return `${uniqueTargetIds.slice(0, 4).join("、")} 等 ${uniqueTargetIds.length} 个目标`;
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
