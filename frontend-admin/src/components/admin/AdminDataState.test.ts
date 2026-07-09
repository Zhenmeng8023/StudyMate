import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminDataState from "./AdminDataState.vue";

describe("AdminDataState", () => {
  it("renders shared data-state labels for admin views", async () => {
    const wrapper = mount(AdminDataState, {
      props: {
        kind: "loading",
        title: "正在同步后台数据",
        description: "请稍候，最新治理记录正在载入。"
      }
    });

    expect(wrapper.text()).toContain("加载中");
    expect(wrapper.text()).toContain("正在同步后台数据");

    await wrapper.setProps({
      kind: "unauthorized",
      title: "需要重新登录",
      description: "当前后台会话已失效，请重新登录后继续。"
    });

    expect(wrapper.text()).toContain("需要登录");
    expect(wrapper.text()).toContain("需要重新登录");
  });
});
