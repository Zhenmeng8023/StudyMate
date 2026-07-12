import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminModerationModule from "./AdminModerationModule.vue";

describe("AdminModerationModule", () => {
  it("renders moderation rows through the shared filter bar, filter select, data table, table head, moderation row, tags, status filter, and action bar", async () => {
    const wrapper = mount(AdminModerationModule, {
      props: {
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
      }
    });

    expect(wrapper.text()).toContain("Pending Post");
    expect(wrapper.find('[data-admin-filter-bar="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-admin-search-toolbar="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-admin-filter-select="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-admin-data-table="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-admin-data-card-header="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-admin-data-table-body="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-admin-table-head="true"]').exists()).toBe(true);
    expect(wrapper.findAll('[data-admin-table-head-cell="true"]')).toHaveLength(6);
    expect(wrapper.find('[data-admin-moderation-row="true"]').exists()).toBe(true);
    expect(wrapper.find('[data-admin-content-cell="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-content-cell-title="true"]').text()).toContain("Pending Post");
    expect(wrapper.get('[data-admin-content-cell-summary="true"]').text()).toContain("Needs review");
    expect(wrapper.findAll('[data-admin-tag="true"]')).toHaveLength(2);
    expect(wrapper.get('[data-admin-tag-tone="neutral"]').text()).toContain("帖子");
    expect(wrapper.get('[data-admin-tag-tone="status"]').text()).toContain("pending");
    expect(wrapper.find('[data-admin-action-bar="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-admin-data-card-header-title="true"]').text()).toContain("审核队列");
    expect(wrapper.get('input[placeholder="搜索标题、作者或状态"]').classes()).toContain("ds-input");
    expect(wrapper.get('[data-admin-search-toolbar-meta="true"]').text()).toContain("1 / 1");
    expect(wrapper.get('[data-moderation-status-filter="true"]').classes()).toContain("ds-select");
    expect(wrapper.get('[data-moderation-action="reject"]').classes()).toContain("danger");

    await wrapper.get('input[placeholder="搜索标题、作者或状态"]').setValue("alice");
    expect(wrapper.emitted("update:query")?.[0]).toEqual(["alice"]);

    await wrapper.get('[data-moderation-status-filter="true"]').setValue("pending");
    expect(wrapper.emitted("update:statusFilter")?.[0]).toEqual(["pending"]);

    await wrapper.get('[data-moderation-action="reject"]').trigger("click");
    expect(wrapper.emitted("requestAction")?.[0]?.[0]).toMatchObject({
      action: "reject",
      item: expect.objectContaining({ id: "post-1" })
    });
  });

  it("renders the shared loading state before moderation rows arrive", () => {
    const wrapper = mount(AdminModerationModule, {
      props: {
        dataState: {
          kind: "loading",
          title: "正在同步审核队列",
          description: "请稍候，最新待审核内容和状态正在加载。"
        },
        items: [],
        query: "",
        totalCount: 0
      }
    });

    expect(wrapper.text()).toContain("正在同步审核队列");
    expect(wrapper.text()).toContain("请稍候，最新待审核内容和状态正在加载。");
  });

  it("keeps rendering existing moderation rows while surfacing the shared stale state", () => {
    const wrapper = mount(AdminModerationModule, {
      props: {
        dataState: {
          kind: "stale",
          title: "审核队列需要刷新",
          description: "当前显示的是上一次同步结果，请刷新后再继续处理。"
        },
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
        totalCount: 1
      }
    });

    expect(wrapper.text()).toContain("审核队列需要刷新");
    expect(wrapper.text()).toContain("Pending Post");
    expect(wrapper.find('[data-moderation-action="approve"]').exists()).toBe(true);
  });

  it("hides moderation rows when the shared unauthorized state is active", () => {
    const wrapper = mount(AdminModerationModule, {
      props: {
        dataState: {
          kind: "unauthorized",
          title: "暂无审核权限",
          description: "当前账号没有查看审核队列的权限。"
        },
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
        totalCount: 1
      }
    });

    expect(wrapper.text()).toContain("暂无审核权限");
    expect(wrapper.text()).not.toContain("Pending Post");
    expect(wrapper.find('[data-moderation-action="approve"]').exists()).toBe(false);
  });
});
