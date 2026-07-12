import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminTableHead from "./AdminTableHead.vue";

describe("AdminTableHead", () => {
  it("renders the shared table head cells in order", () => {
    const wrapper = mount(AdminTableHead, {
      props: {
        columns: ["内容", "类型", "作者", "状态"]
      }
    });

    expect(wrapper.find('[data-admin-table-head="true"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-admin-table-head-cell="true"]')).toHaveLength(4);
    expect(wrapper.text()).toContain("内容");
    expect(wrapper.text()).toContain("状态");
  });
});
