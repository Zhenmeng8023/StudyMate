import { describe, expect, it, vi } from "vitest";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";
import { buildAdminWorkspaceModuleEvents } from "./adminWorkspaceModuleEvents";

describe("adminWorkspaceModuleEvents", () => {
  it("forwards dashboard, moderation, and governance module events through the shared shell callbacks", () => {
    const moderationItem: AdminWorkspaceModerationItem = {
      id: "post-1",
      type: "post",
      title: "Pending Post",
      summary: "",
      authorName: "Alice",
      status: "pending",
      createdAt: "",
      updatedAt: ""
    };
    const governanceRecord: GovernanceRecord = {
      id: "user-1",
      username: "alice",
      status: "active"
    };

    const switchView = vi.fn();
    const requestModerationAction = vi.fn();
    const requestGovernanceAction = vi.fn();
    const setModerationQuery = vi.fn();
    const setModerationStatusFilter = vi.fn();
    const setGovernanceQuery = vi.fn();
    const setGovernanceStatusFilter = vi.fn();
    const selectRecord = vi.fn();

    const events = buildAdminWorkspaceModuleEvents({
      requestGovernanceAction,
      requestModerationAction,
      selectRecord,
      setGovernanceQuery,
      setGovernanceStatusFilter,
      setModerationQuery,
      setModerationStatusFilter,
      switchView
    });

    events.dashboard.openModeration();
    events.moderation.requestAction({ action: "reject", item: moderationItem });
    events.moderation.updateQuery("post");
    events.moderation.updateStatusFilter("pending");
    events.governance.requestAction({ action: "disable", record: governanceRecord });
    events.governance.selectRecord(governanceRecord);
    events.governance.updateQuery("alice");
    events.governance.updateStatusFilter("active");

    expect(switchView).toHaveBeenCalledWith("moderation");
    expect(requestModerationAction).toHaveBeenCalledWith(moderationItem, "reject");
    expect(setModerationQuery).toHaveBeenCalledWith("post");
    expect(setModerationStatusFilter).toHaveBeenCalledWith("pending");
    expect(requestGovernanceAction).toHaveBeenCalledWith({
      action: "disable",
      record: governanceRecord
    });
    expect(selectRecord).toHaveBeenCalledWith(governanceRecord);
    expect(setGovernanceQuery).toHaveBeenCalledWith("alice");
    expect(setGovernanceStatusFilter).toHaveBeenCalledWith("active");
  });
});
