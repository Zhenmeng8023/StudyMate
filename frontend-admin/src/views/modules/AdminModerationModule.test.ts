import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AdminModerationModule from "./AdminModerationModule.vue";

describe("AdminModerationModule", () => {
  it("renders moderation rows, updates query, and emits requested actions", async () => {
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
        totalCount: 1
      }
    });

    expect(wrapper.text()).toContain("Pending Post");
    expect(wrapper.get('input[placeholder="搜索标题、作者或状态"]').classes()).toContain("ds-input");
    expect(wrapper.get('[data-moderation-action="reject"]').classes()).toContain("danger");

    await wrapper.get('input[placeholder="搜索标题、作者或状态"]').setValue("alice");
    expect(wrapper.emitted("update:query")?.[0]).toEqual(["alice"]);

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

    expect(wrapper.text()).toContain("加载中");
    expect(wrapper.text()).toContain("正在同步审核队列");
    expect(wrapper.text()).not.toContain("当前没有匹配的待审核内容");
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

    expect(wrapper.text()).toContain("需要刷新");
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

    expect(wrapper.text()).toContain("需要登录");
    expect(wrapper.text()).toContain("暂无审核权限");
    expect(wrapper.text()).not.toContain("Pending Post");
    expect(wrapper.find('[data-moderation-action="approve"]').exists()).toBe(false);
  });
});
