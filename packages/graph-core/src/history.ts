import type { GraphDocument, GraphHistoryCoreState } from "./model.ts";
import { cloneGraphDocument, graphHistoryLimit } from "./model.ts";

export function createGraphHistoryState(document: GraphDocument): GraphHistoryCoreState {
  return {
    past: [],
    present: cloneGraphDocument(document),
    future: [],
    dirty: false,
    lastLabel: "初始状态"
  };
}

export function withGraphHistoryChange(
  history: GraphHistoryCoreState,
  nextDocument: GraphDocument,
  label: string
): GraphHistoryCoreState {
  const entryLabel = label.trim() || "图谱变更";
  return {
    past: [...history.past.slice(-(graphHistoryLimit - 1)), { label: entryLabel, document: cloneGraphDocument(history.present) }],
    present: cloneGraphDocument(nextDocument),
    future: [],
    dirty: true,
    lastLabel: entryLabel
  };
}

export function markGraphHistoryClean(history: GraphHistoryCoreState, label = "保存图谱"): GraphHistoryCoreState {
  return {
    ...history,
    dirty: false,
    lastLabel: label
  };
}

export function undoGraphHistory(history: GraphHistoryCoreState): GraphHistoryCoreState | null {
  const previous = history.past.at(-1);
  if (!previous) {
    return null;
  }
  return {
    past: history.past.slice(0, -1),
    present: cloneGraphDocument(previous.document),
    future: [{ label: previous.label, document: cloneGraphDocument(history.present) }, ...history.future].slice(0, graphHistoryLimit),
    dirty: true,
    lastLabel: `撤销：${previous.label}`
  };
}

export function redoGraphHistory(history: GraphHistoryCoreState): GraphHistoryCoreState | null {
  const [next, ...future] = history.future;
  if (!next) {
    return null;
  }
  return {
    past: [...history.past.slice(-(graphHistoryLimit - 1)), { label: next.label, document: cloneGraphDocument(history.present) }],
    present: cloneGraphDocument(next.document),
    future,
    dirty: true,
    lastLabel: `重做：${next.label}`
  };
}
