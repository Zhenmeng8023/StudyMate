import { describe, expect, it } from "vitest";
import {
  buildGraphBeforeUnloadMessage,
  buildGraphSaveFailureState,
  buildGraphSaveSuccessState,
  formatGraphSaveStateLabel,
  buildSnapshotListFailureState,
  buildSnapshotRestoreFailureState,
  buildSnapshotRestoreSuccessState
} from "./graphPersistenceState";

describe("graphPersistenceState", () => {
  it("blocks navigation while the graph is dirty or saving", () => {
    expect(buildGraphBeforeUnloadMessage({ dirty: false, saving: false })).toBe("");
    expect(buildGraphBeforeUnloadMessage({ dirty: true, saving: false })).toContain("未保存修改");
    expect(buildGraphBeforeUnloadMessage({ dirty: false, saving: true })).toContain("正在保存");
  });

  it("normalizes save success and failure state", () => {
    expect(buildGraphSaveSuccessState()).toEqual({
      saveState: "saved",
      statusMessage: "图谱已保存"
    });
    expect(buildGraphSaveFailureState(new Error("network down"))).toEqual({
      saveState: "failed",
      statusMessage: "network down"
    });
    expect(buildGraphSaveFailureState("bad")).toEqual({
      saveState: "failed",
      statusMessage: "保存图谱失败"
    });
  });

  it("formats save state labels for toolbar and aria copy", () => {
    expect(formatGraphSaveStateLabel("idle")).toBe("空闲");
    expect(formatGraphSaveStateLabel("dirty")).toBe("有未保存修改");
    expect(formatGraphSaveStateLabel("pending")).toBe("正在保存");
    expect(formatGraphSaveStateLabel("saved")).toBe("已保存");
    expect(formatGraphSaveStateLabel("failed")).toBe("保存失败");
  });

  it("normalizes snapshot restore and snapshot list failure states", () => {
    expect(buildSnapshotRestoreSuccessState(7)).toEqual({
      saveState: "saved",
      statusMessage: "已恢复到快照版本 7"
    });
    expect(buildSnapshotRestoreFailureState(new Error("restore failed"))).toEqual({
      saveState: "failed",
      statusMessage: "restore failed"
    });
    expect(buildSnapshotListFailureState()).toEqual({
      statusMessage: "快照列表加载失败，可继续编辑但暂时无法恢复历史版本"
    });
  });
});
