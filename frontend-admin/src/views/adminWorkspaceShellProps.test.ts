import { describe, expect, it } from "vitest";
import { buildAdminWorkspaceShellProps } from "./adminWorkspaceShellProps";

describe("adminWorkspaceShellProps", () => {
  it("builds the shared AdminShellFrame props from shell state", () => {
    const props = buildAdminWorkspaceShellProps({
      activeDescription: "集中处理待审核内容与治理记录。",
      activeGroup: "治理",
      activeTitle: "审核队列",
      activeView: "moderation",
      countLabel: "2 条待处理",
      errorMessage: "审核队列刷新失败",
      loading: true,
      navGroups: [
        {
          group: "治理",
          items: [
            { key: "moderation", label: "审核队列", icon: "!", badge: "2" }
          ]
        }
      ],
      notice: "已同步最新审核数据。",
      profile: {
        displayName: "Operator",
        role: "admin"
      },
      profileInitial: "O"
    });

    expect(props).toEqual({
      activeDescription: "集中处理待审核内容与治理记录。",
      activeGroup: "治理",
      activeTitle: "审核队列",
      activeView: "moderation",
      countLabel: "2 条待处理",
      errorMessage: "审核队列刷新失败",
      loading: true,
      navGroups: [
        {
          group: "治理",
          items: [
            { key: "moderation", label: "审核队列", icon: "!", badge: "2" }
          ]
        }
      ],
      notice: "已同步最新审核数据。",
      profile: {
        displayName: "Operator",
        role: "admin"
      },
      profileInitial: "O"
    });
  });
});
