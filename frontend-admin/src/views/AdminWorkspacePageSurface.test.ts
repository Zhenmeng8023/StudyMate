import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import type { AdminConfirmDialogItem } from "./adminConfirmDialogs";
import type { createAdminWorkspaceSurfaceAdapter } from "./adminWorkspaceSurfaceAdapter";
import AdminWorkspacePageSurface from "./AdminWorkspacePageSurface.vue";

type AdminWorkspaceSurface = ReturnType<typeof createAdminWorkspaceSurfaceAdapter>;

function createPageSurface(overrides: Partial<AdminWorkspaceSurface> = {}): AdminWorkspaceSurface {
  const confirmDialogs: AdminConfirmDialogItem[] = [
    {
      key: "moderation",
      title: "确认驳回这条内容",
      description: "请确认是否继续。",
      confirmLabel: "确认驳回",
      errorMessage: "",
      confirmTone: "danger",
      confirming: false,
      isOpen: true
    }
  ];

  return {
    cancelConfirmDialog: vi.fn(),
    confirmConfirmDialog: vi.fn().mockResolvedValue(undefined),
    confirmDialogs,
    loggedIn: false,
    loginPanelEvents: {
      submit: vi.fn(),
      updateLoginValue: vi.fn(),
      updatePasswordValue: vi.fn()
    },
    loginPanelProps: {
      errorMessage: "登录失败",
      loading: false,
      notice: "后台会话已清空。",
      loginPrompt: "后台会话已失效，请重新登录",
      loginValue: "",
      passwordValue: ""
    },
    moduleEvents: {
      dashboard: {
        openModeration: vi.fn()
      },
      moderation: {
        requestAction: vi.fn(),
        updateQuery: vi.fn(),
        updateStatusFilter: vi.fn()
      },
      governance: {
        requestAction: vi.fn(),
        selectRecord: vi.fn(),
        updateQuery: vi.fn(),
        updateStatusFilter: vi.fn()
      }
    },
    moduleProps: {
      dashboard: {
        moderationItemsCount: 3,
        overviewCards: [{ label: "待处理", value: "3", helper: "需要处理的公开内容" }],
        pendingMaterialsCount: 1,
        pendingPostsCount: 2
      },
      moderation: {
        dataState: null,
        items: [
          {
            id: "post-1",
            type: "post",
            title: "Pending Post",
            summary: "Needs review",
            authorName: "Alice",
            status: "pending",
            createdAt: "2026-06-02T12:00:00Z",
            updatedAt: "2026-06-02T12:00:00Z"
          }
        ],
        query: "",
        statusFilter: "all",
        statusOptions: [
          { label: "全部状态", value: "all" },
          { label: "待处理", value: "pending" }
        ],
        totalCount: 1
      },
      governance: {
        actions: [{ key: "resolve", label: "标记已处理" }],
        columns: ["id", "action", "status"],
        dataState: null,
        emptyText: "暂无记录",
        query: "",
        rows: [
          {
            id: "audit-1",
            action: "moderation.approve",
            status: "success"
          }
        ],
        selectedRecord: {
          id: "audit-1",
          action: "moderation.approve",
          status: "success"
        },
        statusFilter: "all",
        statusOptions: [
          { label: "全部状态", value: "all" },
          { label: "成功", value: "success" }
        ],
        summary: { total: 1 },
        totalCount: 1
      }
    },
    shellEvents: {
      logout: vi.fn(),
      refresh: vi.fn(),
      switchView: vi.fn()
    },
    shellProps: {
      activeDescription: "查看关键治理操作的可追溯记录。",
      activeGroup: "系统",
      activeTitle: "审计日志",
      activeView: "audit",
      countLabel: "1 条记录",
      errorMessage: "载入失败",
      loading: false,
      navGroups: [
        {
          group: "系统",
          items: [{ key: "audit", label: "审计日志", icon: "◉" }]
        }
      ],
      notice: "已加载 1 条治理记录。",
      profile: {
        displayName: "Operator",
        role: "admin"
      },
      profileInitial: "O"
    },
    ...overrides
  };
}

describe("AdminWorkspacePageSurface", () => {
  it("renders the login branch and forwards confirm plus login events", async () => {
    const surface = createPageSurface();
    const wrapper = mount(AdminWorkspacePageSurface, {
      props: {
        surface
      }
    });

    expect(wrapper.text()).toContain("进入管理后台");
    expect(wrapper.find('[data-admin-command-bar="true"]').exists()).toBe(false);
    expect(wrapper.find('[data-admin-confirm-stack="true"]').exists()).toBe(true);

    await wrapper.get('[data-confirm-cancel="true"]').trigger("click");
    await wrapper.get('[data-confirm-submit="true"]').trigger("click");
    await wrapper.get('input[placeholder="用户名或邮箱"]').setValue("operator@example.test");
    await wrapper.get('input[type="password"]').setValue("secret");
    await wrapper.get("form").trigger("submit.prevent");

    expect(surface.cancelConfirmDialog).toHaveBeenCalledWith("moderation");
    expect(surface.confirmConfirmDialog).toHaveBeenCalledWith("moderation");
    expect(surface.loginPanelEvents.updateLoginValue).toHaveBeenCalledWith("operator@example.test");
    expect(surface.loginPanelEvents.updatePasswordValue).toHaveBeenCalledWith("secret");
    expect(surface.loginPanelEvents.submit).toHaveBeenCalledTimes(1);
  });

  it("renders the shell branch and forwards shell plus module events", async () => {
    const surface = createPageSurface({ loggedIn: true });
    const wrapper = mount(AdminWorkspacePageSurface, {
      props: {
        surface
      }
    });

    expect(wrapper.find('[data-admin-command-bar="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-dashboard-action="open-moderation"]').exists()).toBe(false);
    expect(wrapper.find('[data-record-row="audit-1"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("审计日志");

    await wrapper.get('[data-admin-nav-item-view="audit"]').trigger("click");
    await wrapper.get('button[data-admin-refresh="true"]').trigger("click");
    await wrapper.get('button[data-admin-logout="true"]').trigger("click");
    await wrapper.get('input[placeholder="搜索当前记录"]').setValue("success");
    await wrapper.get('[data-governance-action="resolve"]').trigger("click");

    expect(surface.shellEvents.switchView).toHaveBeenCalledWith("audit");
    expect(surface.shellEvents.refresh).toHaveBeenCalledTimes(1);
    expect(surface.shellEvents.logout).toHaveBeenCalledTimes(1);
    expect(surface.moduleEvents.governance.updateQuery).toHaveBeenCalledWith("success");
    expect(surface.moduleEvents.governance.requestAction).toHaveBeenCalledWith({
      action: "resolve",
      record: expect.objectContaining({ id: "audit-1" })
    });
  });
});
