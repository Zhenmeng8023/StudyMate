import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminDataCardHeader from "./AdminDataCardHeader.vue";

describe("AdminDataCardHeader", () => {
  it("renders title, description and optional actions through the shared data card header contract", () => {
    const wrapper = mount(AdminDataCardHeader, {
      props: {
        title: "审核队列",
        description: "按内容类型、作者、状态和创建时间快速定位待处理项目。"
      },
      slots: {
        actions: '<button data-test-action="more" type="button">更多</button>'
      }
    });

    expect(wrapper.find('[data-admin-data-card-header="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-data-card-header-title="true"]').text()).toContain("审核队列");
    expect(wrapper.get('[data-admin-data-card-header-description="true"]').text()).toContain("按内容类型");
    expect(wrapper.get('[data-admin-data-card-header-actions="true"]').find('[data-test-action="more"]').exists()).toBe(true);
  });
});
