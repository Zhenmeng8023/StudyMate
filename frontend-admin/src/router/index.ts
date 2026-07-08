export type AdminRouteKey = "dashboard" | "moderation" | "materials" | "community" | "users" | "graph" | "ai" | "system" | "audit";

export const adminRoutes: Array<{ key: AdminRouteKey; label: string }> = [
  { key: "dashboard", label: "概览" },
  { key: "moderation", label: "内容审核" },
  { key: "materials", label: "资料治理" },
  { key: "community", label: "举报处理" },
  { key: "users", label: "用户治理" },
  { key: "graph", label: "标签治理" },
  { key: "ai", label: "AI 任务" },
  { key: "system", label: "文件治理" },
  { key: "audit", label: "审计日志" }
];
