import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminActionBar from "./AdminActionBar.vue";

describe("AdminActionBar", () => {
  it("renders shared action buttons with compact layout and emits action keys", async () => {
    const wrapper = mount(AdminActionBar, {
      props: {
        actions: [
          { key: "approve", label: "通过", variant: "primary" },
          { key: "reject", label: "驳回", tone: "danger" }
        ],
        compact: true,
        namespace: "moderation"
      }
    });

    expect(wrapper.find('[data-admin-action-bar="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-action-bar-action="approve"]').classes()).toContain("primary-button");
    expect(wrapper.get('[data-admin-action-bar-action="reject"]').classes()).toContain("danger");
    expect(wrapper.get('[data-moderation-action="reject"]').text()).toContain("驳回");

    await wrapper.get('[data-admin-action-bar-action="approve"]').trigger("click");
    expect(wrapper.emitted("press")?.[0]).toEqual(["approve"]);
  });
});
