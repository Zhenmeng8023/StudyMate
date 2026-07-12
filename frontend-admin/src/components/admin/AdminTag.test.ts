import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminTag from "./AdminTag.vue";

describe("AdminTag", () => {
  it("keeps the shared admin tag tone contract for Vue consumers", () => {
    const wrapper = mount(AdminTag, {
      props: {
        label: "pending",
        tone: "status"
      }
    });

    expect(wrapper.find('[data-admin-tag="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-tag="true"]').classes()).toContain("admin-status-badge");
    expect(wrapper.get('[data-admin-tag-tone="status"]').text()).toContain("pending");
  });
});
