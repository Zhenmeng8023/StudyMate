import {
  sanitizeGraphExportFilename,
  type GraphDocument,
  type GraphValidationIssue,
  validateGraphDocument
} from "@studymate/graph-core";
import type { GraphDetailPayload, GraphDocumentPayload } from "../../../api/client";
import { cloneDocument, normalizeDocument, rebuildDetail } from "./workspaceControllerHelpers";

export type GraphConflictReportArtifact = {
  content: string;
  filename: string;
  mimeType: string;
};

export type GraphConflictPortableArtifact = {
  content: string;
  filename: string;
  mimeType: string;
};

export type GraphConflictObjectDetail = {
  action: "added" | "updated" | "removed";
  id: string;
  kind: "node" | "edge" | "group";
  label: string;
};

export type GraphConflictObjectScope = "localDraft" | "latestHead";

export type GraphConflictResolutionChoice = "keep-local" | "keep-latest" | "review-later";

export type GraphConflictResolutionDraft = {
  decision: GraphConflictResolutionChoice;
  detail: GraphConflictObjectDetail;
  scope: GraphConflictObjectScope;
};

export type GraphConflictResolutionValidationIssue = Pick<
  GraphValidationIssue,
  "message" | "ruleType" | "severity" | "targetId"
>;

export type GraphConflictResolutionSuggestion = {
  choice: GraphConflictResolutionChoice;
  description: string;
  detail: GraphConflictObjectDetail;
  scope: GraphConflictObjectScope;
};

type GraphConflictChecklistInput = {
  changeDetails: GraphConflictObjectDetail[];
  changeSummary: string[];
  latestHeadDetails: GraphConflictObjectDetail[];
  latestHeadError?: string;
  latestHeadLoading?: boolean;
  latestHeadSummary: string[];
  resolutionDrafts: GraphConflictResolutionDraft[];
};

export function buildGraphUnsavedChangeSummary(
  current: GraphDetailPayload | null,
  baseline: GraphDetailPayload | null
): string[] {
  if (!current || !baseline) {
    return [];
  }

  const summary: string[] = [];
  if (current.title !== baseline.title) {
    summary.push(buildTextFieldSummary("标题", current.title, baseline.title));
  }
  if (current.description !== baseline.description) {
    summary.push(buildTextFieldSummary("说明", current.description, baseline.description));
  }

  const nodeDetails = buildCollectionDetails(
    "node",
    current.document.nodes,
    baseline.document.nodes,
    (node) => node.title?.trim() || node.id
  );
  const edgeDetails = buildCollectionDetails(
    "edge",
    current.document.edges,
    baseline.document.edges,
    (edge) => edge.label?.trim() || `${edge.sourceNodeId} -> ${edge.targetNodeId}`
  );
  const groupDetails = buildCollectionDetails(
    "group",
    current.document.groups,
    baseline.document.groups,
    (group) => group.title?.trim() || group.id
  );

  const nodeSummary = buildCollectionSummaryFromDetails("节点", nodeDetails);
  if (nodeSummary) {
    summary.push(nodeSummary);
  }

  const edgeSummary = buildCollectionSummaryFromDetails("连线", edgeDetails);
  if (edgeSummary) {
    summary.push(edgeSummary);
  }

  const groupSummary = buildCollectionSummaryFromDetails("分组", groupDetails);
  if (groupSummary) {
    summary.push(groupSummary);
  }

  if (!summary.length && hasViewportChange(current.document, baseline.document)) {
    summary.push("画布视口已调整");
  }

  return summary;
}

export function buildGraphConflictObjectDetails(
  current: GraphDetailPayload | null,
  baseline: GraphDetailPayload | null
): GraphConflictObjectDetail[] {
  if (!current || !baseline) {
    return [];
  }

  return [
    ...buildCollectionDetails("node", current.document.nodes, baseline.document.nodes, (node) => node.title?.trim() || node.id),
    ...buildCollectionDetails(
      "edge",
      current.document.edges,
      baseline.document.edges,
      (edge) => edge.label?.trim() || `${edge.sourceNodeId} -> ${edge.targetNodeId}`
    ),
    ...buildCollectionDetails("group", current.document.groups, baseline.document.groups, (group) => group.title?.trim() || group.id)
  ];
}

export function buildGraphConflictObjectDecisionKey(scope: GraphConflictObjectScope, detail: GraphConflictObjectDetail) {
  return `${scope}:${detail.kind}:${detail.id}:${detail.action}`;
}

export function buildGraphConflictResolutionDrafts(input: {
  changeDetails: GraphConflictObjectDetail[];
  latestHeadDetails: GraphConflictObjectDetail[];
  selections: Record<string, GraphConflictResolutionChoice>;
}): GraphConflictResolutionDraft[] {
  return [
    ...buildResolutionDraftsForScope("localDraft", input.changeDetails, input.selections),
    ...buildResolutionDraftsForScope("latestHead", input.latestHeadDetails, input.selections)
  ];
}

export function applyGraphConflictResolutionSuggestions(input: {
  currentSelections: Record<string, GraphConflictResolutionChoice>;
  suggestions: GraphConflictResolutionSuggestion[];
}) {
  const nextSelections = { ...input.currentSelections };
  for (const suggestion of input.suggestions) {
    nextSelections[buildGraphConflictObjectDecisionKey(suggestion.scope, suggestion.detail)] = suggestion.choice;
  }
  return nextSelections;
}

export function buildGraphConflictResolutionOutcomeMessage(drafts: GraphConflictResolutionDraft[]) {
  if (!drafts.length) {
    return "已基于最新图谱生成合并草稿，请确认后保存";
  }

  const parts = buildGraphConflictResolutionDecisionSummary(drafts, { includeReviewLaterResolution: true });

  if (!parts.length) {
    return "已基于最新图谱生成合并草稿，请确认后保存";
  }

  return `已基于最新图谱生成合并草稿：${parts.join("，")}，请确认后保存`;
}

export function buildGraphConflictResolutionPreflightMessage(input: {
  blockingIssues: GraphConflictResolutionValidationIssue[];
  drafts: GraphConflictResolutionDraft[];
  unmarkedSummary?: string;
}) {
  if (!input.drafts.length) {
    return "";
  }

  const summary = buildGraphConflictResolutionDecisionSummary(input.drafts, { includeReviewLaterResolution: true });
  if (!summary.length) {
    return "";
  }
  const exampleSummary = buildGraphConflictResolutionDecisionExampleSummary(input.drafts);
  const exampleClause = exampleSummary ? `；${exampleSummary}` : "";
  const unmarkedClause = input.unmarkedSummary ? `；${input.unmarkedSummary}` : "";

  const withUnmarkedSummary = (message: string) => {
    if (!input.unmarkedSummary) {
      return message;
    }
    return `${message.slice(0, -1)}${unmarkedClause}。`;
  };

  if (input.blockingIssues.length > 0) {
    return withUnmarkedSummary(
      `如果现在应用：已标记取舍会被 ${input.blockingIssues.length} 个依赖问题阻断（${buildGraphConflictResolutionBlockingIssueSummary(input.blockingIssues)}）；当前计划${summary.join("，")}${exampleClause}。`
    );
  }

  return withUnmarkedSummary(`如果现在应用：${summary.join("，")}${exampleClause}。`);
}

export function buildGraphConflictResolutionUnmarkedSummary(input: {
  changeDetails: GraphConflictObjectDetail[];
  latestHeadDetails: GraphConflictObjectDetail[];
  resolutionSelections: Record<string, GraphConflictResolutionChoice>;
}) {
  const examples = [
    ...buildGraphConflictResolutionUnmarkedExamples("当前未保存修改", "localDraft", input.changeDetails, input.resolutionSelections),
    ...buildGraphConflictResolutionUnmarkedExamples(
      "与最新图谱相比",
      "latestHead",
      input.latestHeadDetails,
      input.resolutionSelections
    )
  ];

  if (!examples.length) {
    return "";
  }

  return `另外 ${examples.length} 个未标记对象会默认沿用最新图谱版本（${examples.join("、")}）`;
}

export function buildGraphConflictResolutionSuggestionOutcomeMessage(input: {
  blockingIssues: GraphConflictResolutionValidationIssue[];
  suggestions: GraphConflictResolutionSuggestion[];
}) {
  if (!input.suggestions.length) {
    return "当前没有可批量应用的联动取舍建议";
  }

  const keepLocalCount = input.suggestions.filter((suggestion) => suggestion.choice === "keep-local").length;
  const keepLatestCount = input.suggestions.filter((suggestion) => suggestion.choice === "keep-latest").length;
  const reviewLaterCount = input.suggestions.filter((suggestion) => suggestion.choice === "review-later").length;
  const parts = [
    keepLocalCount > 0 ? `保留本地 ${keepLocalCount} 项` : "",
    keepLatestCount > 0 ? `保留服务端 ${keepLatestCount} 项` : "",
    reviewLaterCount > 0 ? `稍后处理 ${reviewLaterCount} 项` : ""
  ].filter(Boolean);
  const summary = parts.length
    ? `已批量标记 ${input.suggestions.length} 条联动取舍建议（${parts.join("，")}）`
    : `已批量标记 ${input.suggestions.length} 条联动取舍建议`;

  if (input.blockingIssues.length > 0) {
    return `${summary}，但仍有 ${input.blockingIssues.length} 个依赖问题待处理：${buildGraphConflictResolutionBlockingIssueSummary(input.blockingIssues)}，请继续调整后再应用`;
  }

  return `${summary}，当前已解除依赖阻断，可继续应用已标记取舍`;
}

export function buildGraphConflictResolutionBlockingIssueSummary(
  issues: GraphConflictResolutionValidationIssue[],
  limit = 2
) {
  if (!issues.length) {
    return "无阻断问题";
  }

  const labels = issues
    .slice(0, limit)
    .map((issue) => issue.targetId?.trim() || issue.ruleType)
    .filter(Boolean);

  if (issues.length <= limit) {
    return labels.join("、");
  }

  return `${labels.join("、")} 等 ${issues.length} 项`;
}

export function applyGraphConflictResolutionDrafts(input: {
  current: GraphDetailPayload;
  drafts: GraphConflictResolutionDraft[];
  latestHead: GraphDetailPayload;
}) {
  const mergedDocument = cloneDocument(input.latestHead.document);
  mergedDocument.viewport = { ...input.current.document.viewport };
  mergedDocument.theme = input.current.document.theme ? { ...input.current.document.theme } : {};
  mergedDocument.metadata = input.current.document.metadata ? { ...input.current.document.metadata } : {};

  for (const draft of input.drafts) {
    if (draft.decision !== "keep-local") {
      continue;
    }
    applyKeepLocalDecision(mergedDocument, input.current.document, draft.detail);
  }

  const normalized = normalizeDocument(input.latestHead.id, input.latestHead.currentVersion, mergedDocument);
  return rebuildDetail(
    {
      ...input.latestHead,
      description: input.current.description,
      title: input.current.title
    },
    normalized
  );
}

export function validateGraphConflictResolutionDrafts(input: {
  current: GraphDetailPayload;
  drafts: GraphConflictResolutionDraft[];
  latestHead: GraphDetailPayload;
}) {
  const merged = applyGraphConflictResolutionDrafts(input);
  const latestIssues = buildBlockingValidationIssueMap(validateGraphDocument(toCoreGraphDocument(input.latestHead.document)));
  const blockingIssues = validateGraphDocument(toCoreGraphDocument(merged.document))
    .filter((issue) => issue.severity === "error")
    .filter((issue) => consumeValidationIssue(latestIssues, issue) === false)
    .map((issue) => ({
      ...issue,
      message: buildResolutionBlockingIssueMessage(issue, merged.document)
    }));

  return {
    blockingIssues,
    merged
  };
}

export function buildGraphConflictResolutionSuggestions(input: {
  blockingIssues: GraphConflictResolutionValidationIssue[];
  changeDetails: GraphConflictObjectDetail[];
  current: GraphDetailPayload;
  latestHeadDetails?: GraphConflictObjectDetail[];
  resolutionSelections: Record<string, GraphConflictResolutionChoice>;
}): GraphConflictResolutionSuggestion[] {
  const suggestions = new Map<string, GraphConflictResolutionSuggestion>();
  const findSuggestionDetail = (kind: GraphConflictObjectDetail["kind"], id: string) => {
    const localDetail = input.changeDetails.find((detail) => detail.kind === kind && detail.id === id);
    if (localDetail) {
      return { detail: localDetail, scope: "localDraft" as const };
    }
    const latestHeadDetail = input.latestHeadDetails?.find((detail) => detail.kind === kind && detail.id === id);
    if (latestHeadDetail) {
      return { detail: latestHeadDetail, scope: "latestHead" as const };
    }
    return null;
  };

  const pushSuggestion = (
    suggestionTarget: { detail: GraphConflictObjectDetail; scope: GraphConflictObjectScope } | null,
    choice: GraphConflictResolutionChoice,
    description: string
  ) => {
    if (!suggestionTarget) {
      return;
    }
    const { detail, scope } = suggestionTarget;
    if (input.resolutionSelections[buildGraphConflictObjectDecisionKey(scope, detail)] === choice) {
      return;
    }
    const key = `${scope}:${detail.kind}:${detail.id}:${detail.action}:${choice}`;
    if (suggestions.has(key)) {
      return;
    }
    suggestions.set(key, {
      choice,
      description,
      detail,
      scope
    });
  };

  for (const issue of input.blockingIssues) {
    if (issue.ruleType === "dangling_edge") {
      const edge = input.current.document.edges.find((item) => item.id === issue.targetId);
      if (!edge) {
        continue;
      }
      pushSuggestion(
        findSuggestionDetail("node", edge.sourceNodeId),
        "keep-local",
        "补齐这条依赖需要同时保留相关节点。"
      );
      pushSuggestion(
        findSuggestionDetail("node", edge.targetNodeId),
        "keep-local",
        "补齐这条依赖需要同时保留相关节点。"
      );
      pushSuggestion(
        findSuggestionDetail("edge", edge.id),
        "keep-latest",
        "如果不打算保留这个对象，可改为保留服务端版本。"
      );
      continue;
    }

    if (issue.ruleType === "invalid_group_node") {
      const group = input.current.document.groups.find((item) => item.id === issue.targetId);
      if (!group) {
        continue;
      }
      for (const nodeId of group.nodeIds) {
        pushSuggestion(
          findSuggestionDetail("node", nodeId),
          "keep-local",
          "补齐这条依赖需要同时保留相关节点。"
        );
      }
      pushSuggestion(
        findSuggestionDetail("group", group.id),
        "keep-latest",
        "如果不打算保留这个对象，可改为保留服务端版本。"
      );
    }
    if (issue.ruleType === "invalid_source_target") {
      pushSuggestion(
        findSuggestionDetail("node", issue.targetId ?? ""),
        "keep-latest",
        "This node has incomplete source information. If you do not want to fix it now, keep the latest server version instead. source.type/source.id must exist together."
      );
    }

    if (issue.ruleType === "invalid_node_size") {
      pushSuggestion(
        findSuggestionDetail("node", issue.targetId ?? ""),
        "keep-latest",
        "This node size is outside the allowed range. If you do not want to fix it now, keep the latest server version instead."
      );
    }
  }

  return [...suggestions.values()];
}

export function buildGraphConflictReportArtifact(
  input: {
    changeDetails: GraphConflictObjectDetail[];
    changeSummary: string[];
    current: GraphDetailPayload;
    latestHeadDetails: GraphConflictObjectDetail[];
    latestHeadError?: string;
    latestHeadLoading?: boolean;
    latestHeadSummary: string[];
    resolutionDrafts: GraphConflictResolutionDraft[];
  },
  exportedAt = new Date().toISOString()
): GraphConflictReportArtifact {
  const manualMergeChecklist = buildGraphManualMergeChecklist(input);

  return {
    filename: `${sanitizeGraphExportFilename(input.current.title, "graph")}-conflict-summary.md`,
    mimeType: "text/markdown;charset=utf-8",
    content: [
      "# StudyMate 图谱冲突摘要",
      "",
      `- 导出时间：${exportedAt}`,
      `- 图谱标题：${input.current.title.trim() || "未命名图谱"}`,
      `- 图谱 ID：${input.current.id}`,
      `- 当前版本：${input.current.currentVersion}`,
      "",
      "## 当前未保存修改",
      ...buildConflictReportSection(input.changeSummary, "当前没有可归纳的未保存修改摘要"),
      "",
      "## 与最新图谱相比",
      ...buildLatestHeadReportSection(input),
      "",
      "## 建议优先核对的对象",
      "### 当前未保存修改",
      ...buildConflictObjectSection(input.changeDetails, "当前没有可优先核对的节点、连线或分组对象"),
      "",
      "### 与最新图谱相比",
      ...buildLatestHeadObjectSection(input),
      "",
      "## 当前人工取舍草稿",
      ...buildConflictResolutionSection(input.resolutionDrafts, "当前尚未标记对象级取舍草稿"),
      "",
      "## 建议的人工合并步骤",
      ...manualMergeChecklist.map((item) => `- ${item}`)
    ].join("\n")
  };
}

export function buildGraphConflictBundleArtifact(
  input: {
    changeDetails: GraphConflictObjectDetail[];
    changeSummary: string[];
    current: GraphDetailPayload;
    currentDraftArtifact: GraphConflictPortableArtifact;
    latestHeadArtifact: GraphConflictPortableArtifact | null;
    latestHeadDetails: GraphConflictObjectDetail[];
    latestHeadError?: string;
    latestHeadLoading?: boolean;
    latestHeadSummary: string[];
    reportArtifact: GraphConflictPortableArtifact;
    resolutionDrafts: GraphConflictResolutionDraft[];
  },
  exportedAt = new Date().toISOString()
): GraphConflictPortableArtifact {
  return {
    filename: `${sanitizeGraphExportFilename(input.current.title, "graph")}-conflict-bundle.json`,
    mimeType: "application/json;charset=utf-8",
    content: JSON.stringify(
      {
        kind: "studymate-graph-conflict-bundle",
        exportedAt,
        graph: {
          id: input.current.id,
          title: input.current.title,
          currentVersion: input.current.currentVersion
        },
        localDraft: {
          summary: input.changeSummary,
          details: input.changeDetails,
          artifact: input.currentDraftArtifact
        },
        latestHead: input.latestHeadArtifact
          ? {
              summary: input.latestHeadSummary,
              details: input.latestHeadDetails,
              artifact: input.latestHeadArtifact
            }
          : null,
        resolutionDraft: input.resolutionDrafts,
        manualMergeChecklist: buildGraphManualMergeChecklist(input),
        report: {
          artifact: input.reportArtifact
        }
      },
      null,
      2
    )
  };
}

function buildGraphManualMergeChecklist(input: GraphConflictChecklistInput): string[] {
  const checklist = [
    "先留存当前草稿 JSON，避免后续重载或误操作覆盖本地修改。",
    "对照“当前未保存修改”摘要，确认这次本地草稿里需要保留的节点、连线和分组。"
  ];

  if (input.changeDetails.length) {
    checklist.push("优先核对上方列出的关键对象明细，逐项确认哪些节点、连线或分组需要保留。");
  }
  if (input.resolutionDrafts.length) {
    checklist.push("优先按照“当前人工取舍草稿”里已标记的对象级取舍执行；未标记项如果直接应用，会默认沿用最新图谱版本，建议继续逐项人工确认。");
  }

  if (input.latestHeadLoading) {
    checklist.push("等待最新图谱差异拉取完成后，再决定是否做人工合并。");
  } else if (input.latestHeadError) {
    checklist.push("先重新获取最新图谱差异或最新图谱 JSON，再开始人工合并，避免只按本地草稿做判断。");
  } else if (input.latestHeadSummary.length) {
    checklist.push("对照“与最新图谱相比”摘要，确认服务端最新版本里需要补回或保留的改动。");
    if (input.latestHeadDetails.length) {
      checklist.push("结合最新版本的关键对象明细，逐项确认哪些节点、连线或分组需要从服务端保留。");
    }
    checklist.push("如果要在外部工具中比对，优先同时使用当前草稿 JSON、最新图谱 JSON 和这份冲突摘要。");
  } else {
    checklist.push("当前尚未归纳出与最新图谱的差异，可结合最新图谱 JSON 再做一次人工核对。");
  }

  checklist.push("完成取舍后，再决定是重载最新图谱，还是继续保留本地草稿整理后再保存。");
  return checklist;
}

function buildTextFieldSummary(label: string, current: string, baseline: string) {
  return `${label}已修改（当前：${truncateSummaryValue(current)}；基线：${truncateSummaryValue(baseline)}）`;
}

function buildConflictReportSection(items: string[], fallback: string) {
  return items.length ? items.map((item) => `- ${item}`) : [`- ${fallback}`];
}

function buildLatestHeadReportSection(input: GraphConflictChecklistInput) {
  if (input.latestHeadLoading) {
    return ["- 正在比对服务端最新图谱差异"];
  }
  if (input.latestHeadError) {
    return [`- ${input.latestHeadError}`];
  }
  return buildConflictReportSection(input.latestHeadSummary, "当前没有可归纳的最新图谱差异摘要");
}

function buildConflictObjectSection(details: GraphConflictObjectDetail[], fallback: string) {
  return details.length ? details.map((item) => `- ${formatGraphConflictObjectDetail(item)}`) : [`- ${fallback}`];
}

function buildConflictResolutionSection(drafts: GraphConflictResolutionDraft[], fallback: string) {
  return drafts.length ? drafts.map((item) => `- ${formatGraphConflictResolutionDraft(item)}`) : [`- ${fallback}`];
}

function buildLatestHeadObjectSection(input: GraphConflictChecklistInput) {
  if (input.latestHeadLoading) {
    return ["- 正在准备最新图谱的对象级差异明细"];
  }
  if (input.latestHeadError) {
    return ["- 暂时无法生成最新图谱的对象级差异明细"];
  }
  return buildConflictObjectSection(input.latestHeadDetails, "当前没有可优先核对的最新版本对象");
}

function buildCollectionDetails<T extends { id: string }>(
  kind: GraphConflictObjectDetail["kind"],
  currentItems: T[],
  baselineItems: T[],
  selectLabel: (item: T) => string
) {
  const baselineMap = new Map(baselineItems.map((item) => [item.id, item]));
  const currentMap = new Map(currentItems.map((item) => [item.id, item]));
  const details: GraphConflictObjectDetail[] = [];

  for (const current of currentItems) {
    const baseline = baselineMap.get(current.id);
    if (!baseline) {
      details.push({
        kind,
        action: "added",
        id: current.id,
        label: selectLabel(current)
      });
      continue;
    }
    if (JSON.stringify(current) !== JSON.stringify(baseline)) {
      details.push({
        kind,
        action: "updated",
        id: current.id,
        label: selectLabel(current)
      });
    }
  }

  for (const baseline of baselineItems) {
    if (!currentMap.has(baseline.id)) {
      details.push({
        kind,
        action: "removed",
        id: baseline.id,
        label: selectLabel(baseline)
      });
    }
  }

  return details;
}

function buildCollectionSummaryFromDetails(label: string, details: GraphConflictObjectDetail[]) {
  const detailsForLabel = details.filter((item) => getConflictKindLabel(item.kind) === label);
  const parts = [
    buildCollectionPart("新增", detailsForLabel.filter((item) => item.action === "added").map((item) => item.label)),
    buildCollectionPart("修改", detailsForLabel.filter((item) => item.action === "updated").map((item) => item.label)),
    buildCollectionPart("删除", detailsForLabel.filter((item) => item.action === "removed").map((item) => item.label))
  ].filter(Boolean);

  return parts.length ? `${label}：${parts.join("，")}` : "";
}

function buildCollectionPart(action: "新增" | "修改" | "删除", labels: string[]) {
  if (!labels.length) {
    return "";
  }
  return `${action} ${labels.length} 个（${formatLabelExamples(labels)}）`;
}

function formatLabelExamples(labels: string[]) {
  const uniqueLabels = [...new Set(labels.map((label) => label.trim()).filter(Boolean))];
  if (!uniqueLabels.length) {
    return "";
  }
  const samples = uniqueLabels.slice(0, 2);
  return `${samples.join("、")}${uniqueLabels.length > 2 ? " 等" : ""}`;
}

function toCoreGraphDocument(document: GraphDocumentPayload): GraphDocument {
  return {
    id: document.graphId,
    version: document.version,
    schemaVersion: document.schemaVersion,
    viewport: { ...document.viewport },
    nodes: document.nodes.map((node) => ({
      ...node,
      source: node.source
        ? {
            type: node.source.type ?? "",
            id: node.source.id ?? "",
            label: node.source.label,
            excerpt: node.source.excerpt
          }
        : null,
      metadata: node.metadata ? { ...node.metadata } : undefined
    })),
    edges: document.edges.map((edge) => ({
      ...edge,
      metadata: edge.metadata ? { ...edge.metadata } : undefined
    })),
    groups: document.groups.map((group) => ({
      ...group,
      nodeIds: [...group.nodeIds],
      metadata: group.metadata ? { ...group.metadata } : undefined
    })),
    theme: document.theme ? { ...document.theme } : {},
    metadata: document.metadata ? { ...document.metadata } : {}
  };
}

function buildBlockingValidationIssueMap(issues: GraphValidationIssue[]) {
  const counts = new Map<string, number>();
  for (const issue of issues) {
    if (issue.severity !== "error") {
      continue;
    }
    const key = buildValidationIssueKey(issue);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function consumeValidationIssue(issueMap: Map<string, number>, issue: GraphValidationIssue) {
  const key = buildValidationIssueKey(issue);
  const count = issueMap.get(key) ?? 0;
  if (count <= 0) {
    return false;
  }
  if (count === 1) {
    issueMap.delete(key);
    return true;
  }
  issueMap.set(key, count - 1);
  return true;
}

function buildValidationIssueKey(issue: GraphValidationIssue) {
  return `${issue.severity}:${issue.ruleType}:${issue.targetId ?? ""}:${issue.message}`;
}

function buildResolutionBlockingIssueMessage(issue: GraphValidationIssue, document: GraphDocumentPayload) {
  if (issue.ruleType === "dangling_edge") {
    const edge = document.edges.find((item) => item.id === issue.targetId);
    const label = edge?.label?.trim() || issue.targetId || "该连线";
    return `连线“${label}”会引用未保留的节点，请先同步保留相关节点或改为保留服务端。`;
  }
  if (issue.ruleType === "invalid_group_node") {
    const group = document.groups.find((item) => item.id === issue.targetId);
    const label = group?.title?.trim() || issue.targetId || "该分组";
    return `分组“${label}”仍引用未保留的节点，请先同步保留相关节点或改为保留服务端。`;
  }
  if (issue.ruleType === "invalid_source_target") {
    const node = document.nodes.find((item) => item.id === issue.targetId);
    const label = node?.title?.trim() || issue.targetId || "node";
    return `Node "${label}" has incomplete source information. Fix source.type/source.id or keep the latest server version.`;
  }
  if (issue.ruleType === "invalid_node_size") {
    const node = document.nodes.find((item) => item.id === issue.targetId);
    const label = node?.title?.trim() || issue.targetId || "node";
    return `Node "${label}" is outside the allowed size range. Resize it or keep the latest server version.`;
  }
  return issue.message;
}

export function formatGraphConflictObjectDetail(detail: GraphConflictObjectDetail) {
  return `${getConflictKindLabel(detail.kind)}｜${getConflictActionLabel(detail.action)}｜${detail.label}`;
}

export function formatGraphConflictResolutionDraft(draft: GraphConflictResolutionDraft) {
  return `${getGraphConflictScopeLabel(draft.scope)}｜${formatGraphConflictObjectDetail(draft.detail)}｜${getGraphConflictResolutionChoiceLabel(draft.decision)}`;
}

function buildResolutionDraftsForScope(
  scope: GraphConflictObjectScope,
  details: GraphConflictObjectDetail[],
  selections: Record<string, GraphConflictResolutionChoice>
) {
  return details.flatMap((detail) => {
    const decision = selections[buildGraphConflictObjectDecisionKey(scope, detail)];
    return decision ? [{ scope, detail, decision }] : [];
  });
}

function buildGraphConflictResolutionDecisionSummary(
  drafts: GraphConflictResolutionDraft[],
  options?: { includeReviewLaterResolution?: boolean }
) {
  const keepLocalCount = drafts.filter((draft) => draft.decision === "keep-local").length;
  const keepLatestCount = drafts.filter((draft) => draft.decision === "keep-latest").length;
  const reviewLaterCount = drafts.filter((draft) => draft.decision === "review-later").length;

  return [
    keepLocalCount > 0 ? `保留本地 ${keepLocalCount} 项` : "",
    keepLatestCount > 0 ? `保留服务端 ${keepLatestCount} 项` : "",
    reviewLaterCount > 0
      ? options?.includeReviewLaterResolution
        ? `稍后处理 ${reviewLaterCount} 项（已沿用最新版本）`
        : `稍后处理 ${reviewLaterCount} 项`
      : ""
  ].filter(Boolean);
}

function buildGraphConflictResolutionDecisionExampleSummary(drafts: GraphConflictResolutionDraft[]) {
  const examples = [
    buildGraphConflictResolutionDecisionExample(drafts, "keep-local", "保留本地"),
    buildGraphConflictResolutionDecisionExample(drafts, "keep-latest", "保留服务端"),
    buildGraphConflictResolutionDecisionExample(drafts, "review-later", "稍后处理")
  ].filter(Boolean);

  if (!examples.length) {
    return "";
  }

  return `例如${examples.join("，")}`;
}

function buildGraphConflictResolutionDecisionExample(
  drafts: GraphConflictResolutionDraft[],
  decision: GraphConflictResolutionChoice,
  label: string
) {
  const match = drafts.find((draft) => draft.decision === decision);
  if (!match) {
    return "";
  }
  return `${label}：${match.detail.label}`;
}

function buildGraphConflictResolutionUnmarkedExamples(
  prefix: string,
  scope: GraphConflictObjectScope,
  details: GraphConflictObjectDetail[],
  selections: Record<string, GraphConflictResolutionChoice>
) {
  return details
    .filter((detail) => selections[buildGraphConflictObjectDecisionKey(scope, detail)] === undefined)
    .map((detail) => `${prefix}：${formatGraphConflictObjectDetail(detail)}`);
}

function applyKeepLocalDecision(
  target: GraphDocumentPayload,
  source: GraphDocumentPayload,
  detail: GraphConflictObjectDetail
) {
  if (detail.kind === "node") {
    target.nodes = detail.action === "removed"
      ? removeCollectionItemById(target.nodes, detail.id)
      : upsertCollectionItem(target.nodes, source.nodes.find((node) => node.id === detail.id));
    return;
  }
  if (detail.kind === "edge") {
    target.edges = detail.action === "removed"
      ? removeCollectionItemById(target.edges, detail.id)
      : upsertCollectionItem(target.edges, source.edges.find((edge) => edge.id === detail.id));
    return;
  }
  target.groups = detail.action === "removed"
    ? removeCollectionItemById(target.groups, detail.id)
    : upsertCollectionItem(target.groups, source.groups.find((group) => group.id === detail.id));
}

function upsertCollectionItem<T extends { id: string }>(items: T[], item: T | undefined) {
  if (!item) {
    return items;
  }
  const next = [...items];
  const index = next.findIndex((entry) => entry.id === item.id);
  if (index >= 0) {
    next[index] = item;
    return next;
  }
  next.push(item);
  return next;
}

function removeCollectionItemById<T extends { id: string }>(items: T[], id: string) {
  return items.filter((item) => item.id !== id);
}

function getGraphConflictScopeLabel(scope: GraphConflictObjectScope) {
  return scope === "localDraft" ? "当前未保存修改" : "与最新图谱相比";
}

function getConflictKindLabel(kind: GraphConflictObjectDetail["kind"]) {
  if (kind === "node") {
    return "节点";
  }
  if (kind === "edge") {
    return "连线";
  }
  return "分组";
}

function getConflictActionLabel(action: GraphConflictObjectDetail["action"]) {
  if (action === "added") {
    return "新增";
  }
  if (action === "updated") {
    return "修改";
  }
  return "删除";
}

export function getGraphConflictResolutionChoiceLabel(choice: GraphConflictResolutionChoice) {
  if (choice === "keep-local") {
    return "保留本地";
  }
  if (choice === "keep-latest") {
    return "保留服务端";
  }
  return "稍后处理";
}

function truncateSummaryValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "空";
  }
  return trimmed.length > 24 ? `${trimmed.slice(0, 24)}...` : trimmed;
}

function hasViewportChange(current: GraphDocumentPayload, baseline: GraphDocumentPayload) {
  return JSON.stringify(current.viewport) !== JSON.stringify(baseline.viewport);
}
