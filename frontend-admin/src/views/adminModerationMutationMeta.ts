import type { AdminRouteKey } from "../router";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";

export function resolveAdminModerationMutationMeta(
  activeView: AdminRouteKey,
  item: AdminWorkspaceModerationItem,
  action: "approve" | "reject" | "hide"
) {
  const isMaterialGovernanceAction = activeView === "materials" && item.type === "material";
  const markGovernanceConflictOnStatus: number[] = [409];

  return {
    clearGovernanceConflictBeforeSubmit: isMaterialGovernanceAction,
    errorFallbackMessage: "更新审核状态失败",
    markGovernanceConflictOnStatus,
    path: `/api/v1/admin/moderation/${item.type === "post" ? "posts" : "materials"}/${item.id}/${action}`,
    reloadGovernanceView: isMaterialGovernanceAction ? "materials" : null,
    successNotice: `“${item.title}” 已更新为 {status}。`
  } as const;
}
