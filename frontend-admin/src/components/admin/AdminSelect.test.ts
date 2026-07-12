import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminSelect from "./AdminSelect.vue";

describe("AdminSelect", () => {
  it("renders the shared select contract and emits value changes", async () => {
    const wrapper = mount(AdminSelect, {
      props: {
        modelValue: "all"
      },
      slots: {
        default: `
          <option value="all">全部状态</option>
          <option value="pending">待处理</option>
        `
      }
    });

    const select = wrapper.get("select");
    expect(select.classes()).toContain("ds-select");

    await select.setValue("pending");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["pending"]);
  });

  it("marks invalid state through shared classes and aria semantics", () => {
    const wrapper = mount(AdminSelect, {
      props: {
        invalid: true,
        modelValue: "all"
      },
      slots: {
        default: '<option value="all">全部状态</option>'
      }
    });

    const select = wrapper.get("select");
    expect(select.classes()).toContain("is-invalid");
    expect(select.attributes("aria-invalid")).toBe("true");
  });
});
