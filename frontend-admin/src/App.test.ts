import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import App from "./App.vue";
import { createAdminAppRouter } from "./router";

describe("admin app test harness", () => {
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
});
