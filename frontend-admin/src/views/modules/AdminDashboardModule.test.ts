import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminDashboardModule from "./AdminDashboardModule.vue";

describe("AdminDashboardModule", () => {
  it("renders shared overview metric cards and shared feature cards, then emits open-moderation", async () => {
    const wrapper = mount(AdminDashboardModule, {
      props: {
        overviewCards: [
          { label: "待处理", value: "3", helper: "需要处理的公开内容" },
          { label: "用户规模", value: "12", helper: "已注册学习者与管理员" }
        ],
        pendingMaterialsCount: 1,
        pendingPostsCount: 2,
        moderationItemsCount: 3
      }
    });

    expect(wrapper.text()).toContain("待处理");
    expect(wrapper.text()).toContain("用户规模");
    expect(wrapper.findAll('[data-admin-metric-card="true"]')).toHaveLength(2);
    expect(wrapper.findAll('[data-admin-feature-card="true"]')).toHaveLength(2);
    expect(wrapper.text()).toContain("2");
    expect(wrapper.text()).toContain("1");
    expect(wrapper.get('[data-dashboard-action="open-moderation"]').classes()).toContain("primary-button");

    await wrapper.get('[data-dashboard-action="open-moderation"]').trigger("click");
    expect(wrapper.emitted("openModeration")).toHaveLength(1);
  });
});
