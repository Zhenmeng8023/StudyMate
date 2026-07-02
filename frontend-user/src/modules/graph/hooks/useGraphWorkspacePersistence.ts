import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  batchSaveGraph,
  listGraphSnapshots,
  restoreGraphSnapshot
} from "../../../api/client";
import type {
  AuthSession,
  GraphDetailPayload,
  GraphSnapshotPayload,
  GraphSummaryPayload
} from "../../../api/client";
import {
  markGraphHistorySaved,
  type GraphHistoryState
} from "../lib/graphHistory";
import {
  buildConcurrentEditingWarningState,
  buildConcurrentVersionAheadState,
  buildGraphSaveFailureState,
  buildGraphSaveSuccessState,
  buildSnapshotListFailureState,
  buildSnapshotRestoreBlockedDirtyState,
  buildSnapshotRestoreFailureState,
  buildSnapshotRestoreSuccessState,
  formatGraphSaveStateLabel
} from "../lib/graphPersistenceState";
import {
  normalizeDocument
} from "../lib/workspaceControllerHelpers";
import {
  buildGraphWorkspaceConcurrencyStorageKeyPrefix,
  clearGraphWorkspaceConcurrencySignal,
  getGraphWorkspaceConcurrencyStorage,
  parseGraphWorkspaceConcurrencySignal,
  persistGraphWorkspaceConcurrencySignal
} from "../lib/graphWorkspaceConcurrencySignal";
import {
  clearGraphWorkspaceLocalDraft,
  getGraphWorkspaceDraftStorage,
  persistGraphWorkspaceLocalDraft
} from "../lib/graphWorkspaceDraftRecovery";
import type { GraphWorkspaceSaveState } from "../state/types";
import { useGraphAutosaveLifecycle } from "./useGraphWorkspaceEffects";

type GraphWorkspacePersistenceOptions = {
  detailRef: RefObject<GraphDetailPayload | null>;
  dirty: boolean;
  graphDetail: GraphDetailPayload | null;
  historyRef: RefObject<GraphHistoryState>;
  onGraphDetailChange: (detail: GraphDetailPayload) => void;
  onHistoryChange: (history: GraphHistoryState) => void;
  onReplaceGraphSummary: (summary: GraphSummaryPayload) => void;
  onReloadLatestSuggestionChange: (suggested: boolean) => void;
  onResetHistory: (detail: GraphDetailPayload, label?: string) => void;
  onStatusMessage: (message: string) => void;
  session: AuthSession;
};

export function useGraphWorkspacePersistence(options: GraphWorkspacePersistenceOptions) {
  const [snapshots, setSnapshots] = useState<GraphSnapshotPayload[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<GraphWorkspaceSaveState>("idle");
  const saveStateLabel = useMemo(() => formatGraphSaveStateLabel(saveState), [saveState]);
  const sessionIdRef = useRef(
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `graph-session-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  );

  useEffect(() => {
    const current = options.graphDetail;
    const storage = getGraphWorkspaceDraftStorage();
    if (!current || !storage) {
      return;
    }

    if (options.dirty) {
      persistGraphWorkspaceLocalDraft(storage, current);
      return;
    }

    clearGraphWorkspaceLocalDraft(storage, current.id);
  }, [options.dirty, options.graphDetail]);

  useEffect(() => {
    const current = options.graphDetail;
    const storage = getGraphWorkspaceConcurrencyStorage();
    if (!current || !storage) {
      return;
    }

    persistGraphWorkspaceConcurrencySignal(storage, {
      currentVersion: current.currentVersion,
      dirty: options.dirty,
      graphId: current.id,
      sessionId: sessionIdRef.current,
      updatedAt: new Date().toISOString()
    });

    return () => {
      clearGraphWorkspaceConcurrencySignal(storage, current.id, sessionIdRef.current);
    };
  }, [options.dirty, options.graphDetail]);

  useEffect(() => {
    const currentGraphId = options.graphDetail?.id;
    if (!currentGraphId) {
      return;
    }

    const keyPrefix = buildGraphWorkspaceConcurrencyStorageKeyPrefix(currentGraphId);
    function handleStorage(event: StorageEvent) {
      if (!event.key || !event.key.startsWith(keyPrefix)) {
        return;
      }

      const signal = parseGraphWorkspaceConcurrencySignal(event.newValue);
      if (!signal || signal.sessionId === sessionIdRef.current || signal.graphId !== currentGraphId) {
        return;
      }

      if (signal.dirty) {
        options.onStatusMessage(buildConcurrentEditingWarningState().statusMessage);
        options.onReloadLatestSuggestionChange(false);
        return;
      }

      const currentVersion = options.detailRef.current?.currentVersion ?? 0;
      if (signal.currentVersion > currentVersion) {
        options.onStatusMessage(buildConcurrentVersionAheadState().statusMessage);
        options.onReloadLatestSuggestionChange(true);
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [options.detailRef, options.graphDetail?.id, options.onReloadLatestSuggestionChange, options.onStatusMessage]);

  const loadSnapshots = useCallback(
    async (graphId: string) => {
      try {
        const payload = await listGraphSnapshots(options.session, graphId);
        setSnapshots(payload);
        return true;
      } catch {
        setSnapshots([]);
        const snapshotState = buildSnapshotListFailureState();
        options.onStatusMessage(snapshotState.statusMessage);
        return false;
      }
    },
    [options]
  );

  const saveCurrentGraph = useCallback(
    async (summary: string) => {
      const current = options.detailRef.current;
      if (!current || saving) {
        return;
      }

      setSaving(true);
      setSaveState("pending");
      options.onReloadLatestSuggestionChange(false);
      options.onStatusMessage("正在保存图谱...");
      try {
        const payload = await batchSaveGraph(options.session, current.id, {
          title: current.title,
          description: current.description,
          summary,
          document: normalizeDocument(current.id, current.currentVersion, current.document)
        });
        const normalized = {
          ...payload,
          document: normalizeDocument(payload.id, payload.currentVersion, payload.document)
        };
        options.detailRef.current = normalized;
        options.onGraphDetailChange(normalized);
        options.onReplaceGraphSummary(normalized);
        const nextHistory = markGraphHistorySaved(options.historyRef.current, summary);
        options.historyRef.current = nextHistory;
        options.onHistoryChange(nextHistory);
        const snapshotsLoaded = await loadSnapshots(normalized.id);
        const successState = buildGraphSaveSuccessState();
        setSaveState(successState.saveState);
        options.onReloadLatestSuggestionChange(false);
        options.onStatusMessage(
          snapshotsLoaded ? successState.statusMessage : buildSnapshotListFailureState().statusMessage
        );
      } catch (error) {
        const failedState = buildGraphSaveFailureState(error);
        setSaveState(failedState.saveState);
        options.onStatusMessage(failedState.statusMessage);
        options.onReloadLatestSuggestionChange(isGraphVersionConflictError(error));
      } finally {
        setSaving(false);
      }
    },
    [loadSnapshots, options, saving]
  );

  const restoreSnapshot = useCallback(
    async (versionNumber: number) => {
      if (!options.graphDetail) {
        return;
      }
      if (options.dirty) {
        const blockedState = buildSnapshotRestoreBlockedDirtyState();
        setSaveState(blockedState.saveState);
        options.onReloadLatestSuggestionChange(false);
        options.onStatusMessage(blockedState.statusMessage);
        return;
      }

      setSaving(true);
      try {
        const payload = await restoreGraphSnapshot(options.session, options.graphDetail.id, versionNumber);
        const normalized = {
          ...payload,
          document: normalizeDocument(payload.id, payload.currentVersion, payload.document)
        };
        options.onResetHistory(normalized, "恢复历史快照");
        const snapshotsLoaded = await loadSnapshots(normalized.id);
        const successState = buildSnapshotRestoreSuccessState(versionNumber);
        setSaveState(successState.saveState);
        options.onReloadLatestSuggestionChange(false);
        options.onStatusMessage(
          snapshotsLoaded ? successState.statusMessage : buildSnapshotListFailureState().statusMessage
        );
      } catch (error) {
        const failedState = buildSnapshotRestoreFailureState(error);
        setSaveState(failedState.saveState);
        options.onReloadLatestSuggestionChange(false);
        options.onStatusMessage(failedState.statusMessage);
      } finally {
        setSaving(false);
      }
    },
    [loadSnapshots, options]
  );

  useGraphAutosaveLifecycle({
    dirty: options.dirty,
    graphDetail: options.graphDetail,
    saving,
    onAutosave: () => void saveCurrentGraph("自动保存")
  });

  return {
    loadSnapshots,
    restoreSnapshot,
    saveCurrentGraph,
    saveState,
    saveStateLabel,
    saving,
    setSaveState,
    setSaving,
    snapshots
  };
}

function isGraphVersionConflictError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("graph_version_conflict") || error.message.includes("刷新当前图谱后再保存");
}
