import { describe, expect, it } from "vitest";
import {
  adminNavGroupsOrder,
  buildAdminNavItems,
  getAdminActiveCountLabel,
  getAdminViewDescription,
  groupAdminNavItems
} from "./adminViewMeta";

describe("adminViewMeta", () => {
  it("builds admin nav items with the shared badge and group metadata", () => {
    const items = buildAdminNavItems(3);

    expect(items[0]).toMatchObject({
      key: "dashboard",
      label: "概览",
      icon: "▦",
      group: "总览"
    });
    expect(items.find((item) => item.key === "moderation")).toMatchObject({
      key: "moderation",
      label: "内容审核",
      icon: "✓",
      group: "治理",
      badge: "3"
    });
    expect(items.find((item) => item.key === "audit")).toMatchObject({
      key: "audit",
      label: "审计日志",
      icon: "≡",
      group: "系统"
    });
  });

  it("groups admin nav items in the shared order", () => {
    const groups = groupAdminNavItems(buildAdminNavItems(0));

    expect(adminNavGroupsOrder).toEqual(["总览", "治理", "系统"]);
    expect(groups.map((group) => group.group)).toEqual(["总览", "治理", "系统"]);
    expect(groups[1]?.items.map((item) => item.key)).toEqual([
      "moderation",
      "materials",
      "community",
      "users",
      "graph"
    ]);
  });

  it("derives shared active descriptions and count labels", () => {
    expect(getAdminViewDescription("dashboard")).toBe("优先处理待审核内容，再查看用户、资料与图谱的总体变化。");
    expect(getAdminViewDescription("moderation")).toBe("快速判断内容风险与发布状态，所有操作都会保留可追溯线索。");
    expect(getAdminViewDescription("users", "按账号状态与角色查看用户资料。")).toBe("按账号状态与角色查看用户资料。");

    expect(getAdminActiveCountLabel("dashboard", 2, 5)).toBe("");
    expect(getAdminActiveCountLabel("moderation", 2, 5)).toBe("2 条待处理");
    expect(getAdminActiveCountLabel("users", 2, 5)).toBe("5 条记录");
  });
});
