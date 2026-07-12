import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminModerationRow from "./AdminModerationRow.vue";

describe("AdminModerationRow", () => {
  it("renders the shared moderation row shape and emits moderation actions", async () => {
    const item = {
      id: "post-1",
      type: "post" as const,
      title: "Pending Post",
      summary: "Needs review",
      authorName: "Alice",
      status: "pending",
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:00:00Z"
    };

    const wrapper = mount(AdminModerationRow, {
      props: {
        actions: [
          { key: "approve", label: "通过", variant: "primary" },
          { key: "reject", label: "驳回", tone: "danger" }
        ],
        item
      }
    });

    expect(wrapper.find('[data-admin-moderation-row="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-moderation-row="post-1"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-content-cell-title="true"]').text()).toContain("Pending Post");
    expect(wrapper.get('[data-admin-tag-tone="neutral"]').text()).toContain("帖子");
    expect(wrapper.get('[data-admin-tag-tone="status"]').text()).toContain("pending");

    await wrapper.get('[data-moderation-action="reject"]').trigger("click");
    expect(wrapper.emitted("press")?.[0]?.[0]).toEqual({
      action: "reject",
      item
    });
  });
});
