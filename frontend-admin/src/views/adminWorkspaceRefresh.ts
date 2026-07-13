import type { AdminRouteKey } from "../router";

export function runAdminWorkspaceRefresh(
  plan: {
    nextView: AdminRouteKey;
    shouldLoadView: boolean;
  },
  options: {
    loadActiveView: (view: AdminRouteKey) => void;
  }
) {
  if (plan.shouldLoadView) {
    options.loadActiveView(plan.nextView);
  }
}
