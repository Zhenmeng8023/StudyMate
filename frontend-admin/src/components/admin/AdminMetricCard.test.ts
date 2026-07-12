import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminMetricCard from "./AdminMetricCard.vue";

describe("AdminMetricCard", () => {
  it("renders label, value and helper through the shared metric card contract", () => {
    const wrapper = mount(AdminMetricCard, {
      props: {
        label: "待处理",
        value: "3",
        helper: "需要处理的公开内容"
      }
    });

    expect(wrapper.find('[data-admin-metric-card="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-metric-card-label="true"]').text()).toContain("待处理");
    expect(wrapper.get('[data-admin-metric-card-value="true"]').text()).toContain("3");
    expect(wrapper.get('[data-admin-metric-card-helper="true"]').text()).toContain("需要处理的公开内容");
    expect(wrapper.classes()).toContain("metric-card");
  });
});
