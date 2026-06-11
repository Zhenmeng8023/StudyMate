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
      : {
          past: [...history.past.slice(-(maxHistoryEntries - 1)), { label, document: cloneDocument(current.document) }],
          future: [],
          dirty: true,
          lastLabel: label
        };

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
  if (history.past.length === 0) {
    return null;
  }

  const previous = history.past[history.past.length - 1];
  return {
    detail: rebuildDetail(current, cloneDocument(previous.document)),
    history: {
      past: history.past.slice(0, -1),
      future: [{ label: previous.label, document: cloneDocument(current.document) }, ...history.future].slice(0, maxHistoryEntries),
      dirty: true,
      lastLabel: `撤销：${previous.label}`
    }
  };
}

export function redoGraphDocument(current: GraphDetailPayload, history: GraphHistoryState) {
  if (history.future.length === 0) {
    return null;
  }

  const [next, ...rest] = history.future;
  return {
    detail: rebuildDetail(current, cloneDocument(next.document)),
    history: {
      past: [...history.past.slice(-(maxHistoryEntries - 1)), { label: next.label, document: cloneDocument(current.document) }],
      future: rest,
      dirty: true,
      lastLabel: `重做：${next.label}`
    }
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
