import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminLoginPanel from "./AdminLoginPanel.vue";

describe("AdminLoginPanel", () => {
  it("renders prompts and emits field updates plus submit", async () => {
    const wrapper = mount(AdminLoginPanel, {
      props: {
        errorMessage: "登录失败",
        loading: false,
        loginPrompt: "后台会话已失效，请重新登录",
        loginValue: "",
        passwordValue: ""
      }
    });

    expect(wrapper.text()).toContain("进入管理后台");
    expect(wrapper.text()).toContain("后台会话已失效，请重新登录");
    expect(wrapper.text()).toContain("登录失败");

    await wrapper.get('input[placeholder="用户名或邮箱"]').setValue("operator@example.test");
    expect(wrapper.emitted("update:loginValue")?.[0]).toEqual(["operator@example.test"]);

    await wrapper.get('input[type="password"]').setValue("secret");
    expect(wrapper.emitted("update:passwordValue")?.[0]).toEqual(["secret"]);

    await wrapper.get("form").trigger("submit.prevent");
    expect(wrapper.emitted("submit")).toHaveLength(1);
  });
});
