import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminFilterSelect from "./AdminFilterSelect.vue";

describe("AdminFilterSelect", () => {
  it("renders the shared filter select shell and emits value updates", async () => {
    const wrapper = mount(AdminFilterSelect, {
      props: {
        modelValue: "all",
        options: [
          { label: "全部状态", value: "all" },
          { label: "成功", value: "success" }
        ],
        testAttr: "data-governance-status-filter"
      }
    });

    expect(wrapper.find('[data-admin-filter-select="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-governance-status-filter="true"]').exists()).toBe(true);
    expect(wrapper.get("option[value='success']").text()).toContain("成功");

    await wrapper.get('[data-governance-status-filter="true"]').setValue("success");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["success"]);
  });
});
