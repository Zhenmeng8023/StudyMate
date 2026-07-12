import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminConfirmStack from "./AdminConfirmStack.vue";

describe("AdminConfirmStack", () => {
  it("renders the shared confirm dialog host and emits keyed confirm actions", async () => {
    const wrapper = mount(AdminConfirmStack, {
      props: {
        dialogs: [
          {
            key: "moderation",
            confirmLabel: "确认驳回",
            description: "驳回后会退出当前审核队列。",
            isOpen: true,
            title: "确认驳回这条内容"
          },
          {
            key: "users",
            confirmLabel: "确认禁用",
            isOpen: false,
            title: "确认禁用这个用户"
          }
        ]
      }
    });

    expect(wrapper.find('[data-admin-confirm-stack="true"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("确认驳回这条内容");
    expect(wrapper.text()).not.toContain("确认禁用这个用户");

    await wrapper.get('[data-confirm-submit="true"]').trigger("click");
    expect(wrapper.emitted("confirm")?.[0]).toEqual(["moderation"]);

    await wrapper.get('[data-confirm-cancel="true"]').trigger("click");
    expect(wrapper.emitted("cancel")?.[0]).toEqual(["moderation"]);
  });
});
