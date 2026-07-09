import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminShellFrame from "./AdminShellFrame.vue";

describe("AdminShellFrame", () => {
  it("renders shell metadata and emits navigation actions", async () => {
    const wrapper = mount(AdminShellFrame, {
      props: {
        activeGroup: "治理",
        activeTitle: "审计日志",
        activeDescription: "查看关键治理操作的可追溯记录。",
        activeView: "audit",
        countLabel: "1 条记录",
        errorMessage: "载入失败",
        loading: false,
        navGroups: [
          {
            group: "系统",
            items: [{ key: "audit", label: "审计日志", icon: "•" }]
          }
        ],
        notice: "已加载 1 条治理记录。",
        profile: {
          displayName: "Operator",
          role: "admin"
        },
        profileInitial: "O"
      },
      slots: {
        default: '<div data-test-slot="content">content</div>'
      }
    });

    expect(wrapper.text()).toContain("审计日志");
    expect(wrapper.text()).toContain("已加载 1 条治理记录。");
    expect(wrapper.text()).toContain("载入失败");
    expect(wrapper.get('[data-test-slot="content"]').text()).toBe("content");
    expect(wrapper.get('button[data-admin-refresh="true"]').classes()).toContain("secondary-button");
    expect(wrapper.get('button[data-admin-logout="true"]').classes()).toContain("ghost-button");

    await wrapper.get('[data-admin-view="audit"]').trigger("click");
    expect(wrapper.emitted("switchView")?.[0]).toEqual(["audit"]);

    await wrapper.get('button[data-admin-refresh="true"]').trigger("click");
    expect(wrapper.emitted("refresh")).toHaveLength(1);

    await wrapper.get('button[data-admin-logout="true"]').trigger("click");
    expect(wrapper.emitted("logout")).toHaveLength(1);
  });
});
