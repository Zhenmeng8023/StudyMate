export type AdminRouteKey = "dashboard" | "moderation" | "materials" | "community" | "users" | "graph" | "ai" | "system" | "audit";

export const defaultAdminRouteKey: AdminRouteKey = "dashboard";

export const adminRoutes: Array<{ key: AdminRouteKey; label: string; path: string }> = [
  { key: "dashboard", label: "概览", path: "/admin/dashboard" },
  { key: "moderation", label: "内容审核", path: "/admin/moderation" },
  { key: "materials", label: "资料治理", path: "/admin/materials" },
  { key: "community", label: "举报处理", path: "/admin/community" },
  { key: "users", label: "用户治理", path: "/admin/users" },
  { key: "graph", label: "标签治理", path: "/admin/graph" },
  { key: "ai", label: "AI 任务", path: "/admin/ai" },
  { key: "system", label: "文件治理", path: "/admin/system" },
  { key: "audit", label: "审计日志", path: "/admin/audit" }
];

const adminRouteMap = new Map(adminRoutes.map((route) => [route.key, route.path]));

export function isAdminRouteKey(value: string): value is AdminRouteKey {
  return adminRouteMap.has(value as AdminRouteKey);
}

export function getAdminRoutePath(key: AdminRouteKey) {
  return adminRouteMap.get(key) ?? adminRouteMap.get(defaultAdminRouteKey)!;
}

export function parseAdminRoutePath(pathname: string): AdminRouteKey | null {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/" || normalizedPath === "/admin") {
    return defaultAdminRouteKey;
  }

  const segments = normalizedPath.split("/").filter(Boolean);
  if (segments.length !== 2 || segments[0] !== "admin") {
    return null;
  }

  return isAdminRouteKey(segments[1]) ? segments[1] : null;
}

export function normalizeAdminRoutePath(pathname: string) {
  return getAdminRoutePath(parseAdminRoutePath(pathname) ?? defaultAdminRouteKey);
}
