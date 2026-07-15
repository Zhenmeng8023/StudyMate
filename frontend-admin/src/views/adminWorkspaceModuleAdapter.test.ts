import { describe, expect, it, vi } from "vitest";
import { createAdminWorkspaceModuleAdapter } from "./adminWorkspaceModuleAdapter";

describe("adminWorkspaceModuleAdapter", () => {
  it("builds derived module props and events from shared workspace state", () => {
    const moderationItem = {
      id: "post-1",
      type: "post" as const,
      title: "Pending Post",
      summary: "summary",
      authorName: "Alice",
      status: "pending",
      createdAt: "",
      updatedAt: ""
    };
    const governanceRecord = {
      id: "user-1",
      username: "alice",
      status: "active",
      role: "user"
    };
    const requestGovernanceAction = vi.fn();
    const requestModerationAction = vi.fn();
    const selectRecord = vi.fn();
    const setGovernanceQuery = vi.fn();
    const setGovernanceStatusFilter = vi.fn();
    const setModerationQuery = vi.fn();
    const setModerationStatusFilter = vi.fn();
    const switchView = vi.fn();

    const adapter = createAdminWorkspaceModuleAdapter({
      activeLabel: "用户治理",
      activeView: "users",
      errorMessage: "冲突",
      governanceErrorStatus: 409,
      governanceQuery: "alice",
      governanceRows: [governanceRecord],
      governanceStatusFilter: "active",
      governanceSummary: { total: 1 },
      loading: false,
      moderationErrorStatus: null,
      moderationItems: [
        moderationItem,
        {
          id: "material-1",
          type: "material",
          title: "Doc",
          summary: "",
          authorName: "Bob",
          status: "approved",
          createdAt: "",
          updatedAt: ""
        }
      ],
      moderationQuery: "Pending",
      moderationStatusFilter: "pending",
      overview: {
        pendingModerationCount: 7,
        userCount: 10,
        materialCount: 6,
        graphCount: 3,
        postCount: 4
      },
      requestGovernanceAction,
      requestModerationAction,
      selectedRecord: governanceRecord,
      selectRecord,
      setGovernanceQuery,
      setGovernanceStatusFilter,
      setModerationQuery,
      setModerationStatusFilter,
      switchView
    });

    expect(adapter.moduleProps.dashboard).toMatchObject({
      moderationItemsCount: 2,
      pendingMaterialsCount: 1,
      pendingPostsCount: 1
    });
    expect(adapter.moduleProps.moderation).toMatchObject({
      totalCount: 2,
      query: "Pending",
      statusFilter: "pending",
      items: [expect.objectContaining({ id: "post-1" })]
    });
    expect(adapter.moduleProps.governance).toMatchObject({
      totalCount: 1,
      query: "alice",
      statusFilter: "active",
      selectedRecord: governanceRecord,
      dataState: {
        kind: "conflict",
        title: "治理动作存在冲突",
        description: "冲突"
      },
      rows: [governanceRecord]
    });

    adapter.moduleEvents.dashboard.openModeration();
    adapter.moduleEvents.moderation.requestAction({ action: "reject", item: moderationItem });
    adapter.moduleEvents.moderation.updateQuery("post");
    adapter.moduleEvents.moderation.updateStatusFilter("approved");
    adapter.moduleEvents.governance.requestAction({ action: "disable", record: governanceRecord });
    adapter.moduleEvents.governance.selectRecord(governanceRecord);
    adapter.moduleEvents.governance.updateQuery("bob");
    adapter.moduleEvents.governance.updateStatusFilter("disabled");

    expect(switchView).toHaveBeenCalledWith("moderation");
    expect(requestModerationAction).toHaveBeenCalledWith(moderationItem, "reject");
    expect(setModerationQuery).toHaveBeenCalledWith("post");
    expect(setModerationStatusFilter).toHaveBeenCalledWith("approved");
    expect(requestGovernanceAction).toHaveBeenCalledWith({
      action: "disable",
      record: governanceRecord
    });
    expect(selectRecord).toHaveBeenCalledWith(governanceRecord);
    expect(setGovernanceQuery).toHaveBeenCalledWith("bob");
    expect(setGovernanceStatusFilter).toHaveBeenCalledWith("disabled");
  });
});
