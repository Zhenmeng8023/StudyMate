import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminFilterBar from "./AdminFilterBar.vue";

describe("AdminFilterBar", () => {
  it("renders the shared filter bar shell and emits search plus filter updates", async () => {
    const wrapper = mount(AdminFilterBar, {
      props: {
        countLabel: "1 / 2 条",
        filterOptions: [
          { label: "全部状态", value: "all" },
          { label: "成功", value: "success" }
        ],
        filterTestAttr: "data-governance-status-filter",
        filterValue: "all",
        placeholder: "搜索当前记录",
        query: ""
      }
    });

    expect(wrapper.find('[data-admin-filter-bar="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-admin-search-toolbar="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-admin-filter-select="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-search-toolbar-meta="true"]').text()).toContain("1 / 2");

    await wrapper.get('input[placeholder="搜索当前记录"]').setValue("success");
    expect(wrapper.emitted("update:query")?.[0]).toEqual(["success"]);

    await wrapper.get('[data-governance-status-filter="true"]').setValue("success");
    expect(wrapper.emitted("update:filterValue")?.[0]).toEqual(["success"]);
  });
});
