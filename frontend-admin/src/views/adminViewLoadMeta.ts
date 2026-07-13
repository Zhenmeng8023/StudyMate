import type { AdminRouteKey } from "../router";
import type { GovernanceModuleView } from "./adminGovernanceConfig";

export type AdminViewLoadPlan =
  | { kind: "dashboard" }
  | { kind: "moderation" }
  | { kind: "governance"; view: GovernanceModuleView; summaryEndpoint: string | null };

export function resolveAdminViewLoadPlan(view: AdminRouteKey): AdminViewLoadPlan {
  if (view === "dashboard") {
    return { kind: "dashboard" };
  }
  if (view === "moderation") {
    return { kind: "moderation" };
  }
  return {
    kind: "governance",
    view,
    summaryEndpoint: view === "ai" ? "/api/v1/admin/ai/usage" : null
  };
}

export function shouldPreserveGovernanceRows(
  currentView: GovernanceModuleView | null,
  nextView: GovernanceModuleView,
  rowCount: number
) {
  return currentView === nextView && rowCount > 0;
}
