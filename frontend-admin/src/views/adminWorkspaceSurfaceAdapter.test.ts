import { describe, expect, it, vi } from "vitest";
import { createAdminWorkspaceSurfaceAdapter } from "./adminWorkspaceSurfaceAdapter";

describe("adminWorkspaceSurfaceAdapter", () => {
  it("combines confirm, chrome and module bindings into a single surface", async () => {
    const cancelDialog = vi.fn();
    const confirmDialog = vi.fn(async () => {});
    const login = vi.fn();
    const logout = vi.fn();
    const refreshActiveView = vi.fn();
    const switchView = vi.fn();
    const selectRecord = vi.fn();
    const setLoginValue = vi.fn();
    const setPasswordValue = vi.fn();
    const setGovernanceQuery = vi.fn();
    const setGovernanceStatusFilter = vi.fn();
    const setModerationQuery = vi.fn();
    const setModerationStatusFilter = vi.fn();
    const requestGovernanceAction = vi.fn();
    const requestModerationAction = vi.fn();

    const surface = createAdminWorkspaceSurfaceAdapter({
      activeView: "users",
      errorMessage: "",
      formLogin: "operator@example.test",
      formPassword: "secret",
      governanceErrorStatus: null,
      governanceQuery: "alice",
      governanceRows: [
        {
          id: "user-1",
          username: "alice",
          email: "alice@example.test",
          role: "student",
          status: "active"
        }
      ],
      governanceStatusFilter: "all",
      governanceSummary: null,
      initialNotice: "Initial notice",
      loading: false,
      loggedIn: true,
      moderationErrorStatus: null,
      moderationItems: [
        {
          id: "post-1",
          type: "post",
          title: "待审帖子",
          summary: "等待人工审核",
          authorName: "Alice",
          status: "pending",
          createdAt: "2026-06-02T12:00:00Z",
          updatedAt: "2026-06-02T12:00:00Z"
        }
      ],
      moderationQuery: "待审",
      moderationStatusFilter: "pending",
      notice: "Loaded notice",
      overview: {
        userCount: 12,
        postCount: 4,
        materialCount: 5,
        graphCount: 6,
        pendingModerationCount: 1
      },
      profile: {
        id: "admin-1",
        username: "operator",
        email: "operator@example.test",
        displayName: "Operator",
        role: "admin"
      },
      requestGovernanceAction,
      requestModerationAction,
      selectedRecord: null,
      sessionInvalidation: null,
      setGovernanceQuery,
      setGovernanceStatusFilter,
      setLoginValue,
      setModerationQuery,
      setModerationStatusFilter,
      setPasswordValue,
      workspaceActions: {
        login,
        logout,
        refreshActiveView
      },
      workspaceConfirm: {
        buildDialogs: () => [
          {
            key: "moderation",
            title: "确认驳回这条内容",
            description: "desc",
            confirmLabel: "确认驳回",
            errorMessage: "",
            confirmTone: "danger",
            confirming: false,
            isOpen: true
          }
        ],
        cancelDialog,
        confirmDialog
      },
      workspaceInteractions: {
        selectRecord,
        switchView
      }
    });

    expect(surface.loggedIn).toBe(true);
    expect(surface.confirmDialogs).toHaveLength(1);
    expect(surface.loginPanelProps.loginValue).toBe("operator@example.test");
    expect(surface.loginPanelProps.passwordValue).toBe("secret");
    expect(surface.shellProps.activeView).toBe("users");
    expect(surface.moduleProps.governance.totalCount).toBe(1);
    expect(surface.moduleProps.moderation.totalCount).toBe(1);

    surface.loginPanelEvents.updateLoginValue("next@example.test");
    surface.loginPanelEvents.updatePasswordValue("next-secret");
    surface.loginPanelEvents.submit();
    surface.shellEvents.switchView("moderation");
    surface.shellEvents.refresh();
    surface.shellEvents.logout();
    surface.moduleEvents.governance.requestAction({
      action: "disable",
      record: {
        id: "user-1",
        username: "alice",
        email: "alice@example.test",
        role: "student",
        status: "active"
      }
    });
    surface.moduleEvents.governance.selectRecord({
      id: "user-1",
      username: "alice",
      email: "alice@example.test",
      role: "student",
      status: "active"
    });
    surface.moduleEvents.governance.updateQuery("bob");
    surface.moduleEvents.governance.updateStatusFilter("disabled");
    surface.moduleEvents.moderation.updateQuery("帖子");
    surface.moduleEvents.moderation.updateStatusFilter("approved");
    surface.cancelConfirmDialog("moderation");
    await surface.confirmConfirmDialog("moderation");

    expect(setLoginValue).toHaveBeenCalledWith("next@example.test");
    expect(setPasswordValue).toHaveBeenCalledWith("next-secret");
    expect(login).toHaveBeenCalledTimes(1);
    expect(switchView).toHaveBeenCalledWith("moderation");
    expect(refreshActiveView).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(requestGovernanceAction).toHaveBeenCalledWith({
      action: "disable",
      record: {
        id: "user-1",
        username: "alice",
        email: "alice@example.test",
        role: "student",
        status: "active"
      }
    });
    expect(selectRecord).toHaveBeenCalled();
    expect(setGovernanceQuery).toHaveBeenCalledWith("bob");
    expect(setGovernanceStatusFilter).toHaveBeenCalledWith("disabled");
    expect(setModerationQuery).toHaveBeenCalledWith("帖子");
    expect(setModerationStatusFilter).toHaveBeenCalledWith("approved");
    expect(cancelDialog).toHaveBeenCalledWith("moderation");
    expect(confirmDialog).toHaveBeenCalledWith("moderation");
  });
});
