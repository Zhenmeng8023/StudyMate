import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminMetricGrid from "./AdminMetricGrid.vue";

describe("AdminMetricGrid", () => {
  it("renders the shared metric grid with ordered metric cards", () => {
    const wrapper = mount(AdminMetricGrid, {
      props: {
        cards: [
          { label: "待处理", value: "3", helper: "需要处理的公开内容" },
          { label: "用户规模", value: "12", helper: "已注册学习者与管理员" }
        ],
        gridClass: "admin-metric-grid--summary"
      }
    });

    expect(wrapper.find('[data-admin-metric-grid="true"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-admin-metric-card="true"]')).toHaveLength(2);
    expect(wrapper.text()).toContain("待处理");
    expect(wrapper.text()).toContain("用户规模");
  });
});
