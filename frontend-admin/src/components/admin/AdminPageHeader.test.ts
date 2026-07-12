import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminPageHeader from "./AdminPageHeader.vue";

describe("AdminPageHeader", () => {
  it("renders the shared page header contract with optional actions", () => {
    const wrapper = mount(AdminPageHeader, {
      props: {
        eyebrow: "治理",
        title: "审计日志",
        description: "查看关键治理操作的可追溯记录。"
      },
      slots: {
        actions: '<span data-test-header-action="count">1 条记录</span>'
      }
    });

    expect(wrapper.find('[data-admin-page-header="true"]').exists()).toBe(true);
    expect(wrapper.get(".eyebrow").text()).toBe("治理");
    expect(wrapper.get("h1").text()).toBe("审计日志");
    expect(wrapper.text()).toContain("查看关键治理操作的可追溯记录。");
    expect(wrapper.get('[data-admin-page-header-actions="true"]').text()).toContain("1 条记录");
  });

  it("omits the actions container when no header actions are provided", () => {
    const wrapper = mount(AdminPageHeader, {
      props: {
        eyebrow: "系统",
        title: "文件治理",
        description: "查看上传文件与存储治理信息。"
      }
    });

    expect(wrapper.find('[data-admin-page-header-actions="true"]').exists()).toBe(false);
  });
});
