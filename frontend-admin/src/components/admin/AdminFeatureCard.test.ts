import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminFeatureCard from "./AdminFeatureCard.vue";

describe("AdminFeatureCard", () => {
  it("renders shared split card copy and actions", () => {
    const wrapper = mount(AdminFeatureCard, {
      props: {
        eyebrow: "优先队列",
        title: "先处理内容审核",
        description: "审核队列中的资料和帖子会直接影响公开可见性。",
        variant: "split"
      },
      slots: {
        actions: '<button data-test-action="open" type="button">进入审核队列</button>'
      }
    });

    expect(wrapper.find('[data-admin-feature-card="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-feature-card-eyebrow="true"]').text()).toContain("优先队列");
    expect(wrapper.get('[data-admin-feature-card-title="true"]').text()).toContain("先处理内容审核");
    expect(wrapper.get('[data-admin-feature-card-description="true"]').text()).toContain("审核队列中的资料");
    expect(wrapper.get('[data-admin-feature-card-actions="true"]').find('[data-test-action="open"]').exists()).toBe(true);
    expect(wrapper.classes()).toContain("admin-priority-card");
  });

  it("renders the shared stacked card body slot", () => {
    const wrapper = mount(AdminFeatureCard, {
      props: {
        eyebrow: "当前数据",
        title: "审核概览",
        variant: "stacked"
      },
      slots: {
        default: '<ul data-test-list="true"><li>待审帖子</li></ul>'
      }
    });

    expect(wrapper.find('[data-test-list="true"]').exists()).toBe(true);
    expect(wrapper.classes()).toContain("admin-status-card");
  });
});
