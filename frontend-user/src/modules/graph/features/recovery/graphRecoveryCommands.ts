import { buildSnapshotListFailureState } from "../../lib/graphPersistenceState";

export type GraphReloadLatestSuccessPlan = {
  confirmDialogAction: "";
  saveState: "idle";
  statusMessage: string;
};

export function buildGraphReloadLatestSuccessPlan(input: {
  discardedDirtyChanges: boolean;
  snapshotsLoaded: boolean;
}): GraphReloadLatestSuccessPlan {
  const baseMessage = input.discardedDirtyChanges ? "已重新加载最新图谱，未保存更改已放弃" : "已重新加载最新图谱";
  return {
    confirmDialogAction: "",
    saveState: "idle",
    statusMessage: input.snapshotsLoaded
      ? baseMessage
      : `${baseMessage}；${buildSnapshotListFailureState().statusMessage}`
  };
}
