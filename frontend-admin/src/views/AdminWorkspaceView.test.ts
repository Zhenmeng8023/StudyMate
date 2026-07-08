import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import AdminWorkspaceView from "./AdminWorkspaceView.vue";

function apiPayload<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

describe("AdminWorkspaceView governance modules", () => {
  it("loads the real users governance API from an existing admin session", async () => {
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
    expect(wrapper.text()).toContain("alice");
    expect(wrapper.text()).toContain("1");
  });

  it("returns to the login screen when refresh fails during admin bootstrap", async () => {
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
  });
});
