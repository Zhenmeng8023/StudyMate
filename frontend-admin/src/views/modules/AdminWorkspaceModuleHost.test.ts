import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import AdminWorkspaceModuleHost from "./AdminWorkspaceModuleHost.vue";

function createModuleHostBindings() {
  const dashboardOpenModeration = vi.fn();
  const moderationRequestAction = vi.fn();
  const moderationUpdateQuery = vi.fn();
  const moderationUpdateStatusFilter = vi.fn();
  const governanceRequestAction = vi.fn();
  const governanceSelectRecord = vi.fn();
  const governanceUpdateQuery = vi.fn();
  const governanceUpdateStatusFilter = vi.fn();

  const governanceRow = {
    id: "audit-1",
    action: "moderation.approve",
    status: "success"
  };

  return {
    moduleEvents: {
      dashboard: {
        openModeration: dashboardOpenModeration
      },
      moderation: {
        requestAction: moderationRequestAction,
        updateQuery: moderationUpdateQuery,
        updateStatusFilter: moderationUpdateStatusFilter
      },
      governance: {
        requestAction: governanceRequestAction,
        selectRecord: governanceSelectRecord,
        updateQuery: governanceUpdateQuery,
        updateStatusFilter: governanceUpdateStatusFilter
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
            type: "post" as const,
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
        actions: [
          { key: "resolve", label: "标记已处理" },
          { key: "dismiss", label: "忽略举报", tone: "danger" as const }
        ],
        columns: ["id", "action", "status"],
        dataState: null,
        emptyText: "暂无记录",
        query: "",
        rows: [governanceRow],
        selectedRecord: governanceRow,
        statusFilter: "all",
        statusOptions: [
          { label: "全部状态", value: "all" },
          { label: "成功", value: "success" }
        ],
        summary: { total: 1 },
        totalCount: 1
      }
    },
    spies: {
      dashboardOpenModeration,
      governanceRequestAction,
      governanceSelectRecord,
      governanceUpdateQuery,
      governanceUpdateStatusFilter,
      moderationRequestAction,
      moderationUpdateQuery,
      moderationUpdateStatusFilter
    }
  };
}

describe("AdminWorkspaceModuleHost", () => {
  it("renders the dashboard module and forwards its action", async () => {
    const bindings = createModuleHostBindings();
    const wrapper = mount(AdminWorkspaceModuleHost, {
      props: {
        activeView: "dashboard",
        moduleEvents: bindings.moduleEvents,
        moduleProps: bindings.moduleProps
      }
    });

    expect(wrapper.find('[data-dashboard-action="open-moderation"]').exists()).toBe(true);
    expect(wrapper.find('[data-admin-moderation-row="true"]').exists()).toBe(false);
    expect(wrapper.find('[data-record-row="audit-1"]').exists()).toBe(false);

    await wrapper.get('[data-dashboard-action="open-moderation"]').trigger("click");

    expect(bindings.spies.dashboardOpenModeration).toHaveBeenCalledTimes(1);
  });

  it("renders the moderation module and forwards query, filter, and action events", async () => {
    const bindings = createModuleHostBindings();
    const wrapper = mount(AdminWorkspaceModuleHost, {
      props: {
        activeView: "moderation",
        moduleEvents: bindings.moduleEvents,
        moduleProps: bindings.moduleProps
      }
    });

    expect(wrapper.find('[data-admin-moderation-row="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-dashboard-action="open-moderation"]').exists()).toBe(false);
    expect(wrapper.find('[data-record-row="audit-1"]').exists()).toBe(false);

    await wrapper.get('input[placeholder="搜索标题、作者或状态"]').setValue("alice");
    await wrapper.get('[data-moderation-status-filter="true"]').setValue("pending");
    await wrapper.get('[data-moderation-action="reject"]').trigger("click");

    expect(bindings.spies.moderationUpdateQuery).toHaveBeenCalledWith("alice");
    expect(bindings.spies.moderationUpdateStatusFilter).toHaveBeenCalledWith("pending");
    expect(bindings.spies.moderationRequestAction).toHaveBeenCalledWith({
      action: "reject",
      item: expect.objectContaining({ id: "post-1" })
    });
  });

  it("renders the governance module for non-dashboard views and forwards its events", async () => {
    const bindings = createModuleHostBindings();
    const wrapper = mount(AdminWorkspaceModuleHost, {
      props: {
        activeView: "users",
        moduleEvents: bindings.moduleEvents,
        moduleProps: bindings.moduleProps
      }
    });

    expect(wrapper.find('[data-record-row="audit-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-dashboard-action="open-moderation"]').exists()).toBe(false);
    expect(wrapper.find('[data-admin-moderation-row="true"]').exists()).toBe(false);

    await wrapper.get('input[placeholder="搜索当前记录"]').setValue("success");
    await wrapper.get('[data-governance-status-filter="true"]').setValue("success");
    await wrapper.get('[data-record-row="audit-1"]').trigger("click");
    await wrapper.get('[data-governance-action="resolve"]').trigger("click");

    expect(bindings.spies.governanceUpdateQuery).toHaveBeenCalledWith("success");
    expect(bindings.spies.governanceUpdateStatusFilter).toHaveBeenCalledWith("success");
    expect(bindings.spies.governanceSelectRecord).toHaveBeenCalledWith(
      expect.objectContaining({ id: "audit-1" })
    );
    expect(bindings.spies.governanceRequestAction).toHaveBeenCalledWith({
      action: "resolve",
      record: expect.objectContaining({ id: "audit-1" })
    });
  });
});
