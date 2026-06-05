import type { GraphDetailPayload, GraphDocumentPayload } from "../../../api/client";
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
