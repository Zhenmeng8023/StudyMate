import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import App from "./App.vue";

describe("admin app test harness", () => {
  it("renders the login form without an existing session", () => {
    const wrapper = mount(App);

    expect(wrapper.text()).toContain("StudyMate 管理后台");
    expect(wrapper.find("input[placeholder='用户名或邮箱']").exists()).toBe(true);
    expect(wrapper.find("input[type='password']").exists()).toBe(true);
  });
});
