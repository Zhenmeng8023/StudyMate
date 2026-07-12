import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminRecordInspector from "./AdminRecordInspector.vue";

describe("AdminRecordInspector", () => {
  it("renders shared inspector title, fields and actions", () => {
    const wrapper = mount(AdminRecordInspector, {
      props: {
        eyebrow: "记录详情",
        title: "audit-1",
        fields: [
          { label: "状态", value: "success" },
          { label: "操作", value: "moderation.approve" }
        ],
        emptyText: "从左侧表格选择一条记录，查看完整字段。"
      },
      slots: {
        actions: '<button data-test-action="resolve" type="button">处理</button>'
      }
    });

    expect(wrapper.find('[data-admin-record-inspector="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-record-inspector-eyebrow="true"]').text()).toContain("记录详情");
    expect(wrapper.get('[data-admin-record-inspector-title="true"]').text()).toContain("audit-1");
    expect(wrapper.text()).toContain("状态");
    expect(wrapper.text()).toContain("success");
    expect(wrapper.get('[data-admin-record-inspector-actions="true"]').find('[data-test-action="resolve"]').exists()).toBe(true);
  });

  it("renders the shared empty copy when no fields are available", () => {
    const wrapper = mount(AdminRecordInspector, {
      props: {
        eyebrow: "记录详情",
        title: "选择一条记录",
        fields: [],
        emptyText: "从左侧表格选择一条记录，查看完整字段。"
      }
    });

    expect(wrapper.get('[data-admin-record-inspector-empty="true"]').text()).toContain("从左侧表格选择一条记录");
  });
});
