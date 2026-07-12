import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminRecordRow from "./AdminRecordRow.vue";

describe("AdminRecordRow", () => {
  it("renders the shared governance row shape and emits the selected record", async () => {
    const row = {
      id: "audit-1",
      action: "moderation.approve",
      status: "success"
    };

    const wrapper = mount(AdminRecordRow, {
      props: {
        columns: ["id", "action", "status"],
        row,
        rowKey: "audit-1",
        selected: true
      }
    });

    expect(wrapper.find('[data-admin-record-row="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-record-row="audit-1"]').classes()).toContain("is-selected");
    expect(wrapper.get('[data-admin-tag-tone="status"]').text()).toContain("success");

    await wrapper.get('[data-record-row="audit-1"]').trigger("click");
    expect(wrapper.emitted("press")?.[0]).toEqual([row]);
  });
});
