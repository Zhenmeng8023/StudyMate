import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminNavGroup from "./AdminNavGroup.vue";

describe("AdminNavGroup", () => {
  it("renders the shared nav group heading and slot content", () => {
    const wrapper = mount(AdminNavGroup, {
      props: {
        title: "治理"
      },
      slots: {
        default: '<button data-test-nav="moderation" type="button">内容审核</button>'
      }
    });

    expect(wrapper.find('[data-admin-nav-group="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-nav-group-title="true"]').text()).toContain("治理");
    expect(wrapper.get('[data-test-nav="moderation"]').text()).toContain("内容审核");
  });
});
