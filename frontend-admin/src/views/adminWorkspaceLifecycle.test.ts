import { describe, expect, it } from "vitest";
import {
  buildAdminWorkspaceLogoutPlan,
  buildAdminWorkspaceMountPlan,
  buildAdminWorkspacePopstatePlan,
  buildAdminWorkspaceSessionClearedPlan,
  buildAdminWorkspaceViewSwitchPlan
} from "./adminWorkspaceLifecycle";

describe("adminWorkspaceLifecycle", () => {
  it("builds a mount plan that only loads data for existing sessions", () => {
    expect(buildAdminWorkspaceMountPlan("dashboard", true)).toEqual({
      nextView: "dashboard",
      shouldLoadView: true,
      shouldRefreshProfile: true
    });

    expect(buildAdminWorkspaceMountPlan("dashboard", false)).toEqual({
      nextView: "dashboard",
      shouldLoadView: false,
      shouldRefreshProfile: false
    });
  });

  it("builds a popstate plan that preserves only query reset and optional reload", () => {
    expect(buildAdminWorkspacePopstatePlan("users", true)).toEqual({
      nextView: "users",
      resetKeys: ["queries"],
      shouldLoadView: true
    });

    expect(buildAdminWorkspacePopstatePlan("users", false)).toEqual({
      nextView: "users",
      resetKeys: ["queries"],
      shouldLoadView: false
    });
  });

  it("builds switch, session-cleared and logout plans with shared reset semantics", () => {
    expect(buildAdminWorkspaceViewSwitchPlan("ai")).toEqual({
      nextView: "ai",
      resetKeys: ["queries", "filters", "confirmState"],
      shouldLoadView: true,
      syncMode: "push"
    });

    expect(buildAdminWorkspaceSessionClearedPlan("后台会话已失效，请重新登录")).toEqual({
      clearError: true,
      nextView: "dashboard",
      notice: "后台会话已失效，请重新登录",
      resetKeys: undefined,
      syncMode: "replace"
    });

    expect(buildAdminWorkspaceLogoutPlan("已退出后台登录")).toEqual({
      clearSessionInvalidation: true,
      nextView: "dashboard",
      notice: "已退出后台登录",
      resetKeys: undefined,
      syncMode: "replace"
    });
  });
});
