import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminDataTable from "./AdminDataTable.vue";

describe("AdminDataTable", () => {
  it("renders the shared table shell with header, state, and slotted table content", () => {
    const wrapper = mount(AdminDataTable, {
      props: {
        cardClass: "admin-moderation-table",
        dataState: {
          kind: "stale",
          title: "需要刷新",
          description: "请先刷新后继续处理"
        },
        description: "列表说明",
        showTable: true,
        tableClass: "admin-table--moderation",
        title: "审核队列"
      },
      slots: {
        head: '<div data-slot-head="true">表头</div>',
        default: '<div data-slot-row="true">表格内容</div>'
      }
    });

    expect(wrapper.find('[data-admin-data-table="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-data-card-header-title="true"]').text()).toContain("审核队列");
    expect(wrapper.get('[data-admin-data-card-header-description="true"]').text()).toContain("列表说明");
    expect(wrapper.text()).toContain("需要刷新");
    expect(wrapper.find('[data-admin-data-table-body="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-slot-head="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-slot-row="true"]').exists()).toBe(true);
  });
});
