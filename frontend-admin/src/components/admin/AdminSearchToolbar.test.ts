import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminSearchToolbar from "./AdminSearchToolbar.vue";

describe("AdminSearchToolbar", () => {
  it("renders the shared admin search toolbar contract", async () => {
    const wrapper = mount(AdminSearchToolbar, {
      props: {
        countLabel: "3 / 8 条",
        placeholder: "搜索当前记录",
        query: ""
      }
    });

    expect(wrapper.find('[data-admin-search-toolbar="true"]').exists()).toBe(true);
    expect(wrapper.get('input[placeholder="搜索当前记录"]').classes()).toContain("ds-input");
    expect(wrapper.get('[data-admin-search-toolbar-meta="true"]').text()).toContain("3 / 8 条");

    await wrapper.get('input[placeholder="搜索当前记录"]').setValue("audit");
    expect(wrapper.emitted("update:query")?.[0]).toEqual(["audit"]);
  });
});
