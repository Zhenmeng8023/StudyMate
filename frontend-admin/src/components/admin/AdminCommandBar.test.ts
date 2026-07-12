import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminCommandBar from "./AdminCommandBar.vue";

describe("AdminCommandBar", () => {
  it("renders breadcrumb, status and actions through the shared admin topbar contract", () => {
    const wrapper = mount(AdminCommandBar, {
      props: {
        crumb: "运营中心",
        title: "审计日志",
        statusLabel: "数据已连接"
      },
      slots: {
        actions: '<button data-test-action="refresh" type="button">刷新数据</button>'
      }
    });

    expect(wrapper.find('[data-admin-command-bar="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-command-bar-crumb="true"]').text()).toContain("运营中心");
    expect(wrapper.get('[data-admin-command-bar-title="true"]').text()).toContain("审计日志");
    expect(wrapper.get('[data-admin-command-bar-status="true"]').text()).toContain("数据已连接");
    expect(wrapper.get('[data-admin-command-bar-actions="true"]').find('[data-test-action="refresh"]').exists()).toBe(true);
  });

  it("marks the status region as loading when requested", () => {
    const wrapper = mount(AdminCommandBar, {
      props: {
        crumb: "运营中心",
        title: "用户治理",
        statusLabel: "同步中",
        statusLoading: true
      }
    });

    expect(wrapper.get('[data-admin-command-bar-status="true"]').classes()).toContain("is-loading");
  });
});
