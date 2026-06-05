import type { GraphWorkspaceSaveState } from "../state/types";

export type GraphPersistenceStatus = {
  saveState?: GraphWorkspaceSaveState;
  statusMessage: string;
};

export function buildGraphBeforeUnloadMessage(options: { dirty: boolean; saving: boolean }) {
  if (options.saving) {
    return "图谱正在保存，确定要离开吗？";
  }
  if (options.dirty) {
    return "图谱仍有未保存修改，确定要离开吗？";
  }
  return "";
}

export function buildGraphSaveSuccessState(): Required<GraphPersistenceStatus> {
  return {
    saveState: "saved",
    statusMessage: "图谱已保存"
  };
}

export function buildGraphSaveFailureState(error: unknown): Required<GraphPersistenceStatus> {
  return {
    saveState: "failed",
    statusMessage: getErrorMessage(error, "保存图谱失败")
  };
}

export function buildSnapshotRestoreSuccessState(versionNumber: number): Required<GraphPersistenceStatus> {
  return {
    saveState: "saved",
    statusMessage: `已恢复到快照版本 ${versionNumber}`
  };
}

export function buildSnapshotRestoreFailureState(error: unknown): Required<GraphPersistenceStatus> {
  return {
    saveState: "failed",
    statusMessage: getErrorMessage(error, "恢复图谱快照失败")
  };
}

export function buildSnapshotListFailureState(): GraphPersistenceStatus {
  return {
    statusMessage: "快照列表加载失败，可继续编辑但暂时无法恢复历史版本"
  };
}

export function formatGraphSaveStateLabel(saveState: GraphWorkspaceSaveState) {
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

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}
