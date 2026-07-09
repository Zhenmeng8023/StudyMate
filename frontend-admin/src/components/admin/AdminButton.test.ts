import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminButton from "./AdminButton.vue";

describe("AdminButton", () => {
  it("keeps the shared button contract for Vue consumers", async () => {
    const wrapper = mount(AdminButton, {
      props: {
        active: true,
        danger: true,
        variant: "ghost"
      },
      slots: {
        default: "刷新"
      }
    });

    const button = wrapper.get("button");
    expect(button.attributes("type")).toBe("button");
    expect(button.classes()).toContain("ghost-button");
    expect(button.classes()).toContain("danger");
    expect(button.classes()).toContain("active");

    await button.trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });
});
