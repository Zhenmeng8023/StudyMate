import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminWorkspaceView from "./AdminWorkspaceView.vue";

function apiPayload<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

describe("AdminWorkspaceView governance modules", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("loads the real users governance API from an existing admin session", async () => {
    window.history.replaceState({}, "", "/admin/users");
    window.localStorage.setItem(
      "studymate.admin.session",
      JSON.stringify({
        accessToken: "admin-token",
        refreshToken: "refresh-token",
        accessTokenExpiresAt: "2026-06-02T12:00:00Z",
        user: {
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        }
      })
    );

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/overview") {
        return apiPayload({
          userCount: 12,
          postCount: 4,
          materialCount: 5,
          graphCount: 6,
          pendingModerationCount: 1
        });
      }
      if (path === "/api/v1/admin/moderation") {
        return apiPayload([]);
      }
      if (path === "/api/v1/admin/users?limit=20") {
        expect(init?.headers).toMatchObject({
          Authorization: "Bearer admin-token"
        });
        return apiPayload([
          {
            id: "user-1",
            username: "alice",
            email: "alice@example.test",
            role: "student",
            status: "active"
          }
        ]);
      }
      return apiPayload([]);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    const usersButton = wrapper.find('[data-admin-view="users"]');
    expect(usersButton.exists()).toBe(true);
    await usersButton.trigger("click");
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/admin/users?limit=20",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
    expect(window.location.pathname).toBe("/admin/users");
    expect(wrapper.text()).toContain("alice");
    expect(wrapper.text()).toContain("1");
  });

  it("returns to the login screen when refresh fails during admin bootstrap", async () => {
    window.history.replaceState({}, "", "/admin/dashboard");
    window.localStorage.setItem(
      "studymate.admin.session",
      JSON.stringify({
        accessToken: "stale-admin-token",
        refreshToken: "refresh-token",
        accessTokenExpiresAt: "2026-06-02T12:00:00Z",
        user: {
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        }
      })
    );

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      const authorization = new Headers(init?.headers as HeadersInit).get("Authorization");

      if (path === "/api/v1/admin/me") {
        expect(authorization).toBe("Bearer stale-admin-token");
        return new Response(
          JSON.stringify({ success: false, error: { code: "token_expired", message: "访问令牌已过期" } }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      if (path === "/api/v1/auth/refresh") {
        expect(init?.method).toBe("POST");
        return new Response(
          JSON.stringify({ success: false, error: { code: "refresh_expired", message: "刷新令牌已失效" } }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Unexpected request: ${path} ${authorization}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/auth/refresh",
      expect.objectContaining({
        method: "POST"
      })
    );
    expect(window.localStorage.getItem("studymate.admin.session")).toBeNull();
    expect(wrapper.text()).toContain("进入管理后台");
    expect(wrapper.text()).toContain("后台会话已失效，请重新登录后继续治理工作。");
  });

  it("asks for confirmation before applying a moderation action", async () => {
    window.history.replaceState({}, "", "/admin/dashboard");
    window.localStorage.setItem(
      "studymate.admin.session",
      JSON.stringify({
        accessToken: "admin-token",
        refreshToken: "refresh-token",
        accessTokenExpiresAt: "2026-06-02T12:00:00Z",
        user: {
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        }
      })
    );

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const rejectPath = "/api/v1/admin/moderation/posts/post-1/reject";
    const moderationItem = {
      id: "post-1",
      type: "post" as const,
      title: "Pending Post",
      summary: "Needs moderation review",
      authorName: "Alice",
      status: "pending",
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    };

    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/overview") {
        return apiPayload({
          userCount: 12,
          postCount: 4,
          materialCount: 5,
          graphCount: 6,
          pendingModerationCount: 1
        });
      }
      if (path === "/api/v1/admin/moderation") {
        return apiPayload([moderationItem]);
      }
      if (path === rejectPath) {
        expect(init?.method).toBe("POST");
        return apiPayload({ status: "rejected" });
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    await wrapper.get('[data-admin-view="moderation"]').trigger("click");
    await flushPromises();

    await wrapper.get(".admin-row-actions .is-danger").trigger("click");

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("确认驳回这条内容");
    expect(fetchMock).not.toHaveBeenCalledWith(
      rejectPath,
      expect.objectContaining({
        method: "POST"
      })
    );

    await wrapper.get('[data-confirm-cancel="true"]').trigger("click");
    await flushPromises();

    expect(wrapper.text()).not.toContain("确认驳回这条内容");
    expect(fetchMock).not.toHaveBeenCalledWith(
      rejectPath,
      expect.objectContaining({
        method: "POST"
      })
    );

    await wrapper.get(".admin-row-actions .is-danger").trigger("click");
    await flushPromises();
    await wrapper.get('[data-confirm-submit="true"]').trigger("click");
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      rejectPath,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer admin-token"
        })
      })
    );
    confirmSpy.mockRestore();
  });

  it("updates the browser URL when switching admin modules", async () => {
    window.history.replaceState({}, "", "/admin/dashboard");
    window.localStorage.setItem(
      "studymate.admin.session",
      JSON.stringify({
        accessToken: "admin-token",
        refreshToken: "refresh-token",
        accessTokenExpiresAt: "2026-06-02T12:00:00Z",
        user: {
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        }
      })
    );

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const path = String(input);
      if (path === "/api/v1/admin/me") {
        return apiPayload({
          id: "admin-1",
          username: "operator",
          email: "operator@example.test",
          displayName: "Operator",
          role: "admin"
        });
      }
      if (path === "/api/v1/admin/overview") {
        return apiPayload({
          userCount: 12,
          postCount: 4,
          materialCount: 5,
          graphCount: 6,
          pendingModerationCount: 0
        });
      }
      if (path === "/api/v1/admin/moderation") {
        return apiPayload([]);
      }
      if (path === "/api/v1/admin/audit-logs?limit=20") {
        return apiPayload([
          {
            id: "audit-1",
            action: "moderation.approve",
            status: "success"
          }
        ]);
      }
      throw new Error(`Unexpected request: ${path}`);
    });

    const wrapper = mount(AdminWorkspaceView);
    await flushPromises();

    await wrapper.get('[data-admin-view="audit"]').trigger("click");
    await flushPromises();

    expect(window.location.pathname).toBe("/admin/audit");
    expect(wrapper.text()).toContain("audit-1");
  });
});
