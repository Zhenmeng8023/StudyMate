import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminNavItem from "./AdminNavItem.vue";

describe("AdminNavItem", () => {
  it("renders label, icon, badge and active state through the shared nav item contract", async () => {
    const wrapper = mount(AdminNavItem, {
      props: {
        active: true,
        badge: "3",
        icon: "✓",
        label: "内容审核",
        viewKey: "moderation"
      }
    });

    expect(wrapper.find('[data-admin-nav-item="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-nav-item-label="true"]').text()).toContain("内容审核");
    expect(wrapper.get('[data-admin-nav-item-icon="true"]').text()).toContain("✓");
    expect(wrapper.get('[data-admin-nav-item-badge="true"]').text()).toContain("3");
    expect(wrapper.attributes("aria-pressed")).toBe("true");
    expect(wrapper.classes()).toContain("active");

    await wrapper.trigger("click");
    expect(wrapper.emitted("press")?.[0]).toEqual(["moderation"]);
  });
});
