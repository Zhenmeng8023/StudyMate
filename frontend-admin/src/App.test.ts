import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App.vue";
import { createAdminAppRouter } from "./router/appRouter";

function apiPayload<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

describe("admin app test harness", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders the admin workspace through router-view and redirects / to /admin/dashboard", async () => {
    window.history.replaceState({}, "", "/");
    const router = createAdminAppRouter();
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });

    await router.isReady();
    await flushPromises();

    expect(window.location.pathname).toBe("/admin/dashboard");
    expect(wrapper.text()).toContain("StudyMate 管理后台");
    expect(wrapper.find('[data-admin-login-panel="true"]').exists()).toBe(true);
    expect(wrapper.find("input[type='password']").exists()).toBe(true);
  });

  it("loads the users module only once after router navigation switches to /admin/users", async () => {
    window.history.replaceState({}, "", "/");
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

    let usersRequests = 0;
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
          pendingModerationCount: 1
        });
      }
      if (path === "/api/v1/admin/moderation") {
        return apiPayload([]);
      }
      if (path === "/api/v1/admin/users?limit=20") {
        usersRequests += 1;
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
      throw new Error(`Unexpected request: ${path}`);
    });

    const router = createAdminAppRouter();
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    });

    await router.isReady();
    await flushPromises();

    await wrapper.get('[data-admin-nav-item-view="users"]').trigger("click");
    await flushPromises();

    expect(window.location.pathname).toBe("/admin/users");
    expect(usersRequests).toBe(1);
    expect(wrapper.text()).toContain("alice");
  });
});
