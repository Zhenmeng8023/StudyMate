import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import App from "./App.vue";

describe("admin app test harness", () => {
  it("normalizes the default admin URL to /admin/dashboard", () => {
    window.history.replaceState({}, "", "/");
    const wrapper = mount(App);

    expect(window.location.pathname).toBe("/admin/dashboard");
    expect(wrapper.text()).toContain("StudyMate 管理后台");
    expect(wrapper.find("input[placeholder='用户名或邮箱']").exists()).toBe(true);
    expect(wrapper.find("input[type='password']").exists()).toBe(true);
  });
});
