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
            key: "user",
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
    expect(wrapper.emitted("confirm")?.[0]).toEqual([{ key: "moderation", note: "" }]);

    await wrapper.get('[data-confirm-cancel="true"]').trigger("click");
    expect(wrapper.emitted("cancel")?.[0]).toEqual(["moderation"]);
  });

  it("keeps report notes when a failed confirmation returns an error state", async () => {
    const wrapper = mount(AdminConfirmStack, {
      props: {
        dialogs: [
          {
            key: "report",
            confirmLabel: "确认忽略",
            description: "备注会写入审计日志。",
            errorMessage: "",
            isOpen: true,
            noteLabel: "处理备注",
            noteMaxLength: 500,
            title: "确认忽略这条举报"
          }
        ]
      }
    });

    await wrapper.get('[data-confirm-note="true"]').setValue("重复举报，已合并处理");
    await wrapper.get('[data-confirm-submit="true"]').trigger("click");

    expect(wrapper.emitted("confirm")?.[0]).toEqual([{ key: "report", note: "重复举报，已合并处理" }]);

    await wrapper.setProps({
      dialogs: [
        {
          key: "report",
          confirmLabel: "确认忽略",
          description: "备注会写入审计日志。",
          errorMessage: "举报处理失败，请重试",
          isOpen: true,
          noteLabel: "处理备注",
          noteMaxLength: 500,
          title: "确认忽略这条举报"
        }
      ]
    });

    expect((wrapper.get('[data-confirm-note="true"]').element as HTMLTextAreaElement).value).toBe("重复举报，已合并处理");
    expect(wrapper.text()).toContain("举报处理失败，请重试");
  });
});
