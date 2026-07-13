import { adminRoutes, type AdminRouteKey } from "../router";

export type AdminNavGroup = "总览" | "治理" | "系统";

export type AdminNavItem = {
  key: AdminRouteKey;
  label: string;
  icon: string;
  group: AdminNavGroup;
  badge?: string;
};

type AdminNavBlueprint = {
  key: AdminRouteKey;
  icon: string;
  group: AdminNavGroup;
};

const adminRouteLabelMap = new Map(adminRoutes.map((route) => [route.key, route.label]));

const adminNavBlueprints: AdminNavBlueprint[] = [
  { key: "dashboard", icon: "▦", group: "总览" },
  { key: "moderation", icon: "✓", group: "治理" },
  { key: "materials", icon: "▤", group: "治理" },
  { key: "community", icon: "⚑", group: "治理" },
  { key: "users", icon: "◉", group: "治理" },
  { key: "graph", icon: "◇", group: "治理" },
  { key: "ai", icon: "✦", group: "系统" },
  { key: "system", icon: "▣", group: "系统" },
  { key: "audit", icon: "≡", group: "系统" }
];

export const adminNavGroupsOrder: AdminNavGroup[] = ["总览", "治理", "系统"];

export function buildAdminNavItems(moderationCount: number): AdminNavItem[] {
  return adminNavBlueprints.map((item) => ({
    ...item,
    label: adminRouteLabelMap.get(item.key) ?? item.key,
    badge: item.key === "moderation" && moderationCount > 0 ? String(moderationCount) : ""
  }));
}

export function groupAdminNavItems(items: AdminNavItem[]) {
  return adminNavGroupsOrder.map((group) => ({
    group,
    items: items.filter((item) => item.group === group)
  }));
}

export function getAdminViewDescription(view: AdminRouteKey, governanceDescription = "") {
  if (view === "dashboard") {
    return "优先处理待审核内容，再查看用户、资料与图谱的总体变化。";
  }
  if (view === "moderation") {
    return "快速判断内容风险与发布状态，所有操作都会保留可追溯线索。";
  }
  return governanceDescription;
}

export function getAdminActiveCountLabel(
  view: AdminRouteKey,
  moderationCount: number,
  governanceCount: number
) {
  if (view === "dashboard") return "";
  if (view === "moderation") return `${moderationCount} 条待处理`;
  return `${governanceCount} 条记录`;
}
