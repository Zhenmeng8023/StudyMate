import { useEffect, useState, type RefObject } from "react";
import type { GraphDetailPayload } from "../../../api/client";
import type { ContextMenuState } from "../lib/workspaceControllerHelpers";
import { autosaveDelayMs } from "../lib/workspaceControllerHelpers";
import { buildGraphBeforeUnloadMessage } from "../lib/graphPersistenceState";
import { shouldAutosaveGraph } from "./useGraphAutosaveBoundary";

export function useGraphContextMenuDismiss(contextMenu: ContextMenuState, onDismiss: () => void) {
  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    window.addEventListener("click", onDismiss);
    window.addEventListener("scroll", onDismiss, true);
    return () => {
      window.removeEventListener("click", onDismiss);
      window.removeEventListener("scroll", onDismiss, true);
    };
  }, [contextMenu, onDismiss]);
}

export function useGraphStageMeasurement(stageRef: RefObject<HTMLDivElement | null>) {
  const [stageViewport, setStageViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function measureStage() {
      if (!stageRef.current) {
        return;
      }
      setStageViewport({
        width: stageRef.current.clientWidth,
        height: stageRef.current.clientHeight
      });
    }

    measureStage();
    window.addEventListener("resize", measureStage);
    return () => window.removeEventListener("resize", measureStage);
  }, [stageRef]);

  return stageViewport;
}

export function useGraphAutosaveLifecycle(options: {
  dirty: boolean;
  graphDetail: GraphDetailPayload | null;
  onAutosave: () => void;
  saving: boolean;
}) {
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      const message = buildGraphBeforeUnloadMessage({ dirty: options.dirty, saving: options.saving });
      if (!message) {
        return;
      }
      event.preventDefault();
      event.returnValue = message;
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [options.dirty, options.saving]);

  useEffect(() => {
    if (!shouldAutosaveGraph(options.dirty, options.saving) || !options.graphDetail) {
      return;
    }

    const timer = window.setTimeout(options.onAutosave, autosaveDelayMs);
    return () => window.clearTimeout(timer);
  }, [options.dirty, options.graphDetail, options.onAutosave, options.saving]);
}
