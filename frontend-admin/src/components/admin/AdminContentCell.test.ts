import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminContentCell from "./AdminContentCell.vue";

describe("AdminContentCell", () => {
  it("renders the shared moderation-style title and summary cell", () => {
    const wrapper = mount(AdminContentCell, {
      props: {
        title: "Pending Post",
        summary: "Needs review"
      }
    });

    expect(wrapper.find('[data-admin-content-cell="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-content-cell-title="true"]').text()).toContain("Pending Post");
    expect(wrapper.get('[data-admin-content-cell-summary="true"]').text()).toContain("Needs review");
  });
});
