import { describe, expect, it } from "vitest";
import { buildGraphReloadLatestSuccessPlan } from "./graphRecoveryCommands";

describe("graphRecoveryCommands", () => {
  it("builds reload latest status when dirty changes were discarded", () => {
    expect(
      buildGraphReloadLatestSuccessPlan({
        discardedDirtyChanges: true,
        snapshotsLoaded: true
      })
    ).toEqual({
      confirmDialogAction: "",
      saveState: "idle",
      statusMessage: "已重新加载最新图谱，未保存更改已放弃"
    });
  });

  it("keeps snapshot load failure visible in the reload latest plan", () => {
    expect(
      buildGraphReloadLatestSuccessPlan({
        discardedDirtyChanges: false,
        snapshotsLoaded: false
      }).statusMessage
    ).toContain("快照列表加载失败");
  });
});
