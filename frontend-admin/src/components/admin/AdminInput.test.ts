import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminInput from "./AdminInput.vue";

describe("AdminInput", () => {
  it("keeps the shared input contract for Vue consumers", async () => {
    const wrapper = mount(AdminInput, {
      props: {
        invalid: true,
        modelValue: ""
      },
      attrs: {
        placeholder: "搜索治理记录"
      }
    });

    const input = wrapper.get("input");
    expect(input.attributes("type")).toBe("text");
    expect(input.attributes("aria-invalid")).toBe("true");
    expect(input.classes()).toContain("ds-input");
    expect(input.classes()).toContain("is-invalid");

    await input.setValue("report");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["report"]);
  });
});
