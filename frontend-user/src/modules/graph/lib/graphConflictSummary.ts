import { sanitizeGraphExportFilename } from "@studymate/graph-core";
import type { GraphDetailPayload, GraphDocumentPayload } from "../../../api/client";

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

  const nodeSummary = buildCollectionSummary(
    "节点",
    current.document.nodes,
    baseline.document.nodes,
    (node) => node.title?.trim() || node.id
  );
  if (nodeSummary) {
    summary.push(nodeSummary);
  }

  const edgeSummary = buildCollectionSummary(
    "连线",
    current.document.edges,
    baseline.document.edges,
    (edge) => edge.label?.trim() || `${edge.sourceNodeId} -> ${edge.targetNodeId}`
  );
  if (edgeSummary) {
    summary.push(edgeSummary);
  }

  const groupSummary = buildCollectionSummary(
    "分组",
    current.document.groups,
    baseline.document.groups,
    (group) => group.title?.trim() || group.id
  );
  if (groupSummary) {
    summary.push(groupSummary);
  }

  if (!summary.length && hasViewportChange(current.document, baseline.document)) {
    summary.push("画布视口已调整");
  }

  return summary;
}

export function buildGraphConflictReportArtifact(
  input: {
    changeSummary: string[];
    current: GraphDetailPayload;
    latestHeadError?: string;
    latestHeadLoading?: boolean;
    latestHeadSummary: string[];
  },
  exportedAt = new Date().toISOString()
): GraphConflictReportArtifact {
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
      ...buildLatestHeadReportSection(input)
    ].join("\n")
  };
}

export function buildGraphConflictBundleArtifact(
  input: {
    changeSummary: string[];
    current: GraphDetailPayload;
    currentDraftArtifact: GraphConflictPortableArtifact;
    latestHeadArtifact: GraphConflictPortableArtifact | null;
    latestHeadSummary: string[];
    reportArtifact: GraphConflictPortableArtifact;
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
          artifact: input.currentDraftArtifact
        },
        latestHead: input.latestHeadArtifact
          ? {
              summary: input.latestHeadSummary,
              artifact: input.latestHeadArtifact
            }
          : null,
        report: {
          artifact: input.reportArtifact
        }
      },
      null,
      2
    )
  };
}

function buildTextFieldSummary(label: string, current: string, baseline: string) {
  return `${label}已修改（当前：${truncateSummaryValue(current)}；基线：${truncateSummaryValue(baseline)}）`;
}

function buildConflictReportSection(items: string[], fallback: string) {
  return items.length ? items.map((item) => `- ${item}`) : [`- ${fallback}`];
}

function buildLatestHeadReportSection(input: {
  latestHeadError?: string;
  latestHeadLoading?: boolean;
  latestHeadSummary: string[];
}) {
  if (input.latestHeadLoading) {
    return ["- 正在比对服务端最新图谱差异"];
  }
  if (input.latestHeadError) {
    return [`- ${input.latestHeadError}`];
  }
  return buildConflictReportSection(input.latestHeadSummary, "当前没有可归纳的最新图谱差异摘要");
}

function buildCollectionSummary<T extends { id: string }>(
  label: string,
  currentItems: T[],
  baselineItems: T[],
  selectLabel: (item: T) => string
) {
  const baselineMap = new Map(baselineItems.map((item) => [item.id, item]));
  const currentMap = new Map(currentItems.map((item) => [item.id, item]));
  const addedLabels: string[] = [];
  const removedLabels: string[] = [];
  const updatedLabels: string[] = [];

  for (const current of currentItems) {
    const baseline = baselineMap.get(current.id);
    if (!baseline) {
      addedLabels.push(selectLabel(current));
      continue;
    }
    if (JSON.stringify(current) !== JSON.stringify(baseline)) {
      updatedLabels.push(selectLabel(current));
    }
  }

  for (const baseline of baselineItems) {
    if (!currentMap.has(baseline.id)) {
      removedLabels.push(selectLabel(baseline));
    }
  }

  const parts = [
    buildCollectionPart("新增", addedLabels),
    buildCollectionPart("修改", updatedLabels),
    buildCollectionPart("删除", removedLabels)
  ].filter(Boolean);

  return parts.length ? `${label}：${parts.join("，")}` : "";
}

function buildCollectionPart(action: "新增" | "修改" | "删除", labels: string[]) {
  if (!labels.length) {
    return "";
  }
  return `${action} ${labels.length} 个${formatLabelExamples(labels)}`;
}

function formatLabelExamples(labels: string[]) {
  const uniqueLabels = [...new Set(labels.map((label) => label.trim()).filter(Boolean))];
  if (!uniqueLabels.length) {
    return "";
  }
  const samples = uniqueLabels.slice(0, 2);
  return `（${samples.join("、")}${uniqueLabels.length > 2 ? " 等" : ""}）`;
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
