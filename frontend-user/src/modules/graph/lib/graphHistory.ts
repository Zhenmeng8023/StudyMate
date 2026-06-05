import type { GraphDetailPayload, GraphDocumentPayload } from "../../../api/client";
import { cloneDocument, maxHistoryEntries, normalizeDocument, rebuildDetail } from "./workspaceControllerHelpers";

export type GraphHistoryState = {
  past: GraphDocumentPayload[];
  future: GraphDocumentPayload[];
  dirty: boolean;
};

export function createEmptyGraphHistoryState(): GraphHistoryState {
  return {
    past: [],
    future: [],
    dirty: false
  };
}

export function resetGraphHistoryState(_: GraphHistoryState): GraphHistoryState {
  return createEmptyGraphHistoryState();
}

export function applyGraphDocumentChange(
  current: GraphDetailPayload,
  nextDocument: GraphDocumentPayload,
  history: GraphHistoryState,
  options?: { captureHistory?: boolean }
) {
  const normalized = normalizeDocument(current.id, current.currentVersion, nextDocument);
  const nextHistory =
    options?.captureHistory === false
      ? {
          ...history,
          dirty: true
        }
      : {
          past: [...history.past.slice(-(maxHistoryEntries - 1)), cloneDocument(current.document)],
          future: [],
          dirty: true
        };

  return {
    detail: rebuildDetail(current, normalized),
    history: nextHistory
  };
}

export function markGraphHistorySaved(history: GraphHistoryState): GraphHistoryState {
  return {
    ...history,
    dirty: false
  };
}

export function undoGraphDocument(current: GraphDetailPayload, history: GraphHistoryState) {
  if (history.past.length === 0) {
    return null;
  }

  const previous = history.past[history.past.length - 1];
  return {
    detail: rebuildDetail(current, cloneDocument(previous)),
    history: {
      past: history.past.slice(0, -1),
      future: [cloneDocument(current.document), ...history.future].slice(0, maxHistoryEntries),
      dirty: true
    }
  };
}

export function redoGraphDocument(current: GraphDetailPayload, history: GraphHistoryState) {
  if (history.future.length === 0) {
    return null;
  }

  const [next, ...rest] = history.future;
  return {
    detail: rebuildDetail(current, cloneDocument(next)),
    history: {
      past: [...history.past.slice(-(maxHistoryEntries - 1)), cloneDocument(current.document)],
      future: rest,
      dirty: true
    }
  };
}
