import { useCallback, useMemo, useState, type RefObject } from "react";
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
  buildGraphSaveFailureState,
  buildGraphSaveSuccessState,
  buildSnapshotListFailureState,
  buildSnapshotRestoreFailureState,
  buildSnapshotRestoreSuccessState,
  formatGraphSaveStateLabel
} from "../lib/graphPersistenceState";
import {
  normalizeDocument
} from "../lib/workspaceControllerHelpers";
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
  onResetHistory: (detail: GraphDetailPayload, label?: string) => void;
  onStatusMessage: (message: string) => void;
  session: AuthSession;
};

export function useGraphWorkspacePersistence(options: GraphWorkspacePersistenceOptions) {
  const [snapshots, setSnapshots] = useState<GraphSnapshotPayload[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<GraphWorkspaceSaveState>("idle");
  const saveStateLabel = useMemo(() => formatGraphSaveStateLabel(saveState), [saveState]);

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
        options.onStatusMessage(
          snapshotsLoaded ? successState.statusMessage : buildSnapshotListFailureState().statusMessage
        );
      } catch (error) {
        const failedState = buildGraphSaveFailureState(error);
        setSaveState(failedState.saveState);
        options.onStatusMessage(failedState.statusMessage);
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
        options.onStatusMessage(
          snapshotsLoaded ? successState.statusMessage : buildSnapshotListFailureState().statusMessage
        );
      } catch (error) {
        const failedState = buildSnapshotRestoreFailureState(error);
        setSaveState(failedState.saveState);
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
