import { describe, expect, it, vi } from "vitest";
import { createAdminWorkspaceResetController } from "./adminWorkspaceResetController";

describe("adminWorkspaceResetController", () => {
  it("resets all workspace slices through a single controller entry", () => {
    const state = {
      governanceRows: [{}],
      governanceRowsView: "users",
      governanceStatusFilter: "pending",
      moderationItems: [{}],
      moderationQuery: "review",
      moderationStatusFilter: "rejected",
      overview: { userCount: 3 },
      recordQuery: "audit",
      selectedRecord: { id: "record-1" }
    };
    const resetConfirmState = vi.fn();

    const controller = createAdminWorkspaceResetController({
      resetConfirmState,
      setGovernanceRows: (value) => {
        state.governanceRows = value;
      },
      setGovernanceRowsView: (value) => {
        state.governanceRowsView = value;
      },
      setGovernanceStatusFilter: (value) => {
        state.governanceStatusFilter = value;
      },
      setGovernanceSummary: (value) => {
        state.governanceSummary = value;
      },
      setModerationItems: (value) => {
        state.moderationItems = value;
      },
      setModerationQuery: (value) => {
        state.moderationQuery = value;
      },
      setModerationStatusFilter: (value) => {
        state.moderationStatusFilter = value;
      },
      setOverview: (value) => {
        state.overview = value;
      },
      setRecordQuery: (value) => {
        state.recordQuery = value;
      },
      setSelectedRecord: (value) => {
        state.selectedRecord = value;
      }
    });

    controller.clearState();

    expect(state.recordQuery).toBe("");
    expect(state.moderationQuery).toBe("");
    expect(state.moderationStatusFilter).toBe("all");
    expect(state.governanceStatusFilter).toBe("all");
    expect(state.moderationItems).toEqual([]);
    expect(state.overview).toBeNull();
    expect(state.governanceRows).toEqual([]);
    expect(state.governanceSummary).toBeNull();
    expect(state.governanceRowsView).toBeNull();
    expect(state.selectedRecord).toBeNull();
    expect(resetConfirmState).toHaveBeenCalledTimes(1);
  });

  it("supports clearing only selected workspace slices", () => {
    const state = {
      governanceRows: [{}],
      governanceRowsView: "users",
      governanceStatusFilter: "pending",
      moderationItems: [{}],
      moderationQuery: "review",
      moderationStatusFilter: "rejected",
      overview: { userCount: 3 },
      recordQuery: "audit",
      selectedRecord: { id: "record-1" }
    };
    const resetConfirmState = vi.fn();

    const controller = createAdminWorkspaceResetController({
      resetConfirmState,
      setGovernanceRows: (value) => {
        state.governanceRows = value;
      },
      setGovernanceRowsView: (value) => {
        state.governanceRowsView = value;
      },
      setGovernanceStatusFilter: (value) => {
        state.governanceStatusFilter = value;
      },
      setGovernanceSummary: (value) => {
        state.governanceSummary = value;
      },
      setModerationItems: (value) => {
        state.moderationItems = value;
      },
      setModerationQuery: (value) => {
        state.moderationQuery = value;
      },
      setModerationStatusFilter: (value) => {
        state.moderationStatusFilter = value;
      },
      setOverview: (value) => {
        state.overview = value;
      },
      setRecordQuery: (value) => {
        state.recordQuery = value;
      },
      setSelectedRecord: (value) => {
        state.selectedRecord = value;
      }
    });

    controller.clearState(["queries", "confirmState"]);

    expect(state.recordQuery).toBe("");
    expect(state.moderationQuery).toBe("");
    expect(state.moderationStatusFilter).toBe("rejected");
    expect(state.governanceStatusFilter).toBe("pending");
    expect(state.moderationItems).toEqual([{}]);
    expect(state.governanceRows).toEqual([{}]);
    expect(resetConfirmState).toHaveBeenCalledTimes(1);
  });
});
