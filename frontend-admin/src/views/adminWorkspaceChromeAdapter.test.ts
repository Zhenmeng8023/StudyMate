import type { SessionInvalidationState } from "@studymate/api-client";
import { describe, expect, it, vi } from "vitest";
import { createAdminWorkspaceChromeAdapter } from "./adminWorkspaceChromeAdapter";

function createInvalidation(): SessionInvalidationState {
  return {
    kind: "session_rejected",
    code: "user_disabled",
    message: "Account disabled",
    status: 403,
    occurredAt: "2026-07-15T00:00:00Z"
  };
}

describe("adminWorkspaceChromeAdapter", () => {
  it("builds login panel props and events with invalidation prompt and notice fallback", async () => {
    const onLogin = vi.fn(async () => {});
    const setLoginValue = vi.fn();
    const setPasswordValue = vi.fn();

    const adapter = createAdminWorkspaceChromeAdapter({
      activeView: "dashboard",
      errorMessage: "登录失败",
      formLogin: "alice",
      formPassword: "secret",
      governanceRowCount: 0,
      initialNotice: "默认提示",
      loading: true,
      loggedIn: false,
      moderationItemCount: 3,
      notice: "已失效",
      onLogin,
      onLogout: vi.fn(),
      onRefreshActiveView: vi.fn(),
      onSwitchView: vi.fn(),
      profile: null,
      sessionInvalidation: createInvalidation(),
      setLoginValue,
      setPasswordValue
    });

    expect(adapter.loginPanelProps).toMatchObject({
      errorMessage: "登录失败",
      loading: true,
      loginPrompt: "当前账号已被禁用，请联系其他管理员后重新登录。",
      loginValue: "alice",
      notice: "",
      passwordValue: "secret"
    });

    await adapter.loginPanelEvents.submit();
    adapter.loginPanelEvents.updateLoginValue("bob");
    adapter.loginPanelEvents.updatePasswordValue("pw");

    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(setLoginValue).toHaveBeenCalledWith("bob");
    expect(setPasswordValue).toHaveBeenCalledWith("pw");
  });

  it("builds shell props and events from active view and navigation state", () => {
    const onLogout = vi.fn();
    const onRefreshActiveView = vi.fn();
    const onSwitchView = vi.fn();

    const adapter = createAdminWorkspaceChromeAdapter({
      activeView: "users",
      errorMessage: "",
      formLogin: "",
      formPassword: "",
      governanceRowCount: 4,
      initialNotice: "默认提示",
      loading: false,
      loggedIn: true,
      moderationItemCount: 2,
      notice: "同步完成",
      onLogin: vi.fn(),
      onLogout,
      onRefreshActiveView,
      onSwitchView,
      profile: {
        id: "admin-1",
        username: "operator",
        email: "operator@example.com",
        role: "admin",
        displayName: "Operator"
      },
      sessionInvalidation: null,
      setLoginValue: vi.fn(),
      setPasswordValue: vi.fn()
    });

    expect(adapter.shellProps).toMatchObject({
      activeView: "users",
      activeTitle: "用户治理",
      activeGroup: "治理",
      countLabel: "4 条记录",
      notice: "同步完成",
      profileInitial: "O"
    });
    expect(adapter.shellProps.navGroups).toHaveLength(3);

    adapter.shellEvents.logout();
    adapter.shellEvents.refresh();
    adapter.shellEvents.switchView("audit");

    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(onRefreshActiveView).toHaveBeenCalledTimes(1);
    expect(onSwitchView).toHaveBeenCalledWith("audit");
  });
});
