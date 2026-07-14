import { describe, expect, it, vi } from "vitest";
import { createAdminWorkspaceResetController } from "./adminWorkspaceResetController";

describe("adminWorkspaceResetController", () => {
  it("resets all workspace slices through a single controller entry", () => {
    const state = {
      governanceRows: { value: [{}] },
      governanceRowsView: { value: "users" },
      governanceStatusFilter: { value: "pending" },
      governanceSummary: { value: undefined as { id?: string } | null | undefined },
      moderationItems: { value: [{}] },
      moderationQuery: { value: "review" },
      moderationStatusFilter: { value: "rejected" },
      overview: { value: { userCount: 3 } },
      recordQuery: { value: "audit" },
      selectedRecord: { value: { id: "record-1" } }
    };
    const resetConfirmState = vi.fn();

    const controller = createAdminWorkspaceResetController({
      governanceRows: state.governanceRows,
      governanceRowsView: state.governanceRowsView,
      governanceStatusFilter: state.governanceStatusFilter,
      governanceSummary: state.governanceSummary,
      moderationItems: state.moderationItems,
      moderationQuery: state.moderationQuery,
      moderationStatusFilter: state.moderationStatusFilter,
      overview: state.overview,
      recordQuery: state.recordQuery,
      resetConfirmState,
      selectedRecord: state.selectedRecord
    });

    controller.clearState();

    expect(state.recordQuery.value).toBe("");
    expect(state.moderationQuery.value).toBe("");
    expect(state.moderationStatusFilter.value).toBe("all");
    expect(state.governanceStatusFilter.value).toBe("all");
    expect(state.moderationItems.value).toEqual([]);
    expect(state.overview.value).toBeNull();
    expect(state.governanceRows.value).toEqual([]);
    expect(state.governanceSummary.value).toBeNull();
    expect(state.governanceRowsView.value).toBeNull();
    expect(state.selectedRecord.value).toBeNull();
    expect(resetConfirmState).toHaveBeenCalledTimes(1);
  });

  it("supports clearing only selected workspace slices", () => {
    const state = {
      governanceRows: { value: [{}] },
      governanceRowsView: { value: "users" },
      governanceStatusFilter: { value: "pending" },
      governanceSummary: { value: undefined as { id?: string } | null | undefined },
      moderationItems: { value: [{}] },
      moderationQuery: { value: "review" },
      moderationStatusFilter: { value: "rejected" },
      overview: { value: { userCount: 3 } },
      recordQuery: { value: "audit" },
      selectedRecord: { value: { id: "record-1" } }
    };
    const resetConfirmState = vi.fn();

    const controller = createAdminWorkspaceResetController({
      governanceRows: state.governanceRows,
      governanceRowsView: state.governanceRowsView,
      governanceStatusFilter: state.governanceStatusFilter,
      governanceSummary: state.governanceSummary,
      moderationItems: state.moderationItems,
      moderationQuery: state.moderationQuery,
      moderationStatusFilter: state.moderationStatusFilter,
      overview: state.overview,
      recordQuery: state.recordQuery,
      resetConfirmState,
      selectedRecord: state.selectedRecord
    });

    controller.clearState(["queries", "confirmState"]);

    expect(state.recordQuery.value).toBe("");
    expect(state.moderationQuery.value).toBe("");
    expect(state.moderationStatusFilter.value).toBe("rejected");
    expect(state.governanceStatusFilter.value).toBe("pending");
    expect(state.moderationItems.value).toEqual([{}]);
    expect(state.governanceRows.value).toEqual([{}]);
    expect(resetConfirmState).toHaveBeenCalledTimes(1);
  });
});
