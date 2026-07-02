import type { GraphDocument, GraphHistoryCoreState } from "@studymate/graph-core";
import {
  redoGraphHistory,
  supportedGraphSchemaVersion,
  undoGraphHistory,
  withGraphHistoryChange
} from "@studymate/graph-core";
import type { GraphDetailPayload, GraphDocumentPayload } from "../../../api/client";
import type { GraphWorkspaceSaveState } from "../state/types";
import { cloneDocument, maxHistoryEntries, normalizeDocument, rebuildDetail } from "./workspaceControllerHelpers";

export type GraphHistoryEntry = {
  label: string;
  document: GraphDocumentPayload;
};

export type GraphHistoryState = {
  past: GraphHistoryEntry[];
  future: GraphHistoryEntry[];
  dirty: boolean;
  lastLabel: string;
};

export type GraphHistoryBoundarySummary = {
  lastChangeLabel: string;
  saveBoundaryLabel: string;
  undoRedoLabel: string;
  riskLabel: string;
};

export function createEmptyGraphHistoryState(): GraphHistoryState {
  return {
    past: [],
    future: [],
    dirty: false,
    lastLabel: "初始状态"
  };
}

export function resetGraphHistoryState(_: GraphHistoryState, label = "初始状态"): GraphHistoryState {
  return {
    ...createEmptyGraphHistoryState(),
    lastLabel: normalizeHistoryLabel(label)
  };
}

export function applyGraphDocumentChange(
  current: GraphDetailPayload,
  nextDocument: GraphDocumentPayload,
  history: GraphHistoryState,
  options?: { captureHistory?: boolean; label?: string }
) {
  const normalized = normalizeDocument(current.id, current.currentVersion, nextDocument);
  const label = normalizeHistoryLabel(options?.label);
  const nextHistory =
    options?.captureHistory === false
      ? {
          ...history,
          dirty: true,
          lastLabel: label
        }
      : fromCoreHistoryState(
          withGraphHistoryChange(toCoreHistoryState(current, history), toCoreGraphDocument(normalized), label)
        );

  return {
    detail: rebuildDetail(current, normalized),
    history: nextHistory
  };
}

export function markGraphHistorySaved(history: GraphHistoryState, label = "保存图谱"): GraphHistoryState {
  return {
    ...history,
    dirty: false,
    lastLabel: normalizeHistoryLabel(label)
  };
}

export function buildGraphHistoryBoundarySummary(options: {
  history: GraphHistoryState;
  saveState: GraphWorkspaceSaveState;
}): GraphHistoryBoundarySummary {
  const undoLabel = options.history.past.length > 0 ? `可撤销 ${options.history.past.length} 步` : "暂无可撤销";
  const redoLabel = options.history.future.length > 0 ? `可重做 ${options.history.future.length} 步` : "暂无可重做";
  return {
    lastChangeLabel: normalizeHistoryLabel(options.history.lastLabel),
    saveBoundaryLabel: formatHistorySaveBoundary(options.saveState),
    undoRedoLabel: `${undoLabel} / ${redoLabel}`,
    riskLabel: buildHistoryRiskLabel(options.saveState)
  };
}

export function undoGraphDocument(current: GraphDetailPayload, history: GraphHistoryState) {
  const nextHistory = undoGraphHistory(toCoreHistoryState(current, history));
  if (!nextHistory) {
    return null;
  }

  return {
    detail: rebuildDetail(current, fromCoreGraphDocument(nextHistory.present)),
    history: fromCoreHistoryState(nextHistory)
  };
}

export function redoGraphDocument(current: GraphDetailPayload, history: GraphHistoryState) {
  const nextHistory = redoGraphHistory(toCoreHistoryState(current, history));
  if (!nextHistory) {
    return null;
  }

  return {
    detail: rebuildDetail(current, fromCoreGraphDocument(nextHistory.present)),
    history: fromCoreHistoryState(nextHistory)
  };
}

function normalizeHistoryLabel(label: string | undefined) {
  const trimmed = label?.trim();
  return trimmed || "图谱变更";
}

function formatHistorySaveBoundary(saveState: GraphWorkspaceSaveState) {
  switch (saveState) {
    case "dirty":
      return "有未保存修改";
    case "pending":
      return "正在保存";
    case "saved":
      return "已保存";
    case "failed":
      return "保存失败";
    default:
      return "空闲";
  }
}

function buildHistoryRiskLabel(saveState: GraphWorkspaceSaveState) {
  switch (saveState) {
    case "failed":
      return "保存失败后不要静默离页，请手动保存或恢复快照。";
    case "pending":
      return "保存请求进行中，等待完成后再进行高风险操作。";
    case "dirty":
      return "离页前会提示，自动保存会继续尝试。";
    case "saved":
      return "当前历史点已保存，可以继续编辑或恢复快照。";
    default:
      return "当前没有待处理保存风险。";
  }
}

function toCoreHistoryState(current: GraphDetailPayload, history: GraphHistoryState): GraphHistoryCoreState {
  return {
    past: history.past.slice(-maxHistoryEntries).map((entry) => ({
      label: entry.label,
      document: toCoreGraphDocument(entry.document)
    })),
    present: toCoreGraphDocument(current.document),
    future: history.future.slice(0, maxHistoryEntries).map((entry) => ({
      label: entry.label,
      document: toCoreGraphDocument(entry.document)
    })),
    dirty: history.dirty,
    lastLabel: history.lastLabel
  };
}

function fromCoreHistoryState(history: GraphHistoryCoreState): GraphHistoryState {
  return {
    past: history.past.map((entry) => ({
      label: entry.label,
      document: fromCoreGraphDocument(entry.document)
    })),
    future: history.future.map((entry) => ({
      label: entry.label,
      document: fromCoreGraphDocument(entry.document)
    })),
    dirty: history.dirty,
    lastLabel: history.lastLabel
  };
}

function toCoreGraphDocument(document: GraphDocumentPayload): GraphDocument {
  const cloned = cloneDocument(document);
  return {
    id: cloned.graphId,
    version: cloned.version,
    schemaVersion: cloned.schemaVersion,
    viewport: { ...cloned.viewport },
    nodes: cloned.nodes,
    edges: cloned.edges,
    groups: cloned.groups,
    theme: cloned.theme ?? {},
    metadata: cloned.metadata ?? {}
  };
}

function fromCoreGraphDocument(document: GraphDocument): GraphDocumentPayload {
  return normalizeDocument(document.id, document.version, {
    graphId: document.id,
    version: document.version,
    schemaVersion: document.schemaVersion ?? supportedGraphSchemaVersion,
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
    theme: document.theme ?? {},
    metadata: document.metadata ?? {}
  });
}
