export type AdminRouteKey = "dashboard" | "moderation" | "materials" | "community" | "users" | "graph" | "ai" | "system" | "audit";

export const adminRoutes: Array<{ key: AdminRouteKey; label: string }> = [
  { key: "dashboard", label: "??" },
  { key: "moderation", label: "????" },
  { key: "materials", label: "????" },
  { key: "community", label: "????" },
  { key: "users", label: "????" },
  { key: "graph", label: "????" },
  { key: "ai", label: "AI ??" },
  { key: "system", label: "????" },
  { key: "audit", label: "????" }
];
