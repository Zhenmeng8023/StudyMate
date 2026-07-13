import type { AdminRouteKey } from "../router";

export function runAdminWorkspaceMountBootstrap(
  plan: {
    nextView: AdminRouteKey;
    shouldRefreshProfile: boolean;
    shouldLoadView: boolean;
  },
  options: {
    setActiveView: (view: AdminRouteKey) => void;
    refreshProfile: () => Promise<void>;
    loadActiveView: (view: AdminRouteKey) => void;
  }
) {
  const { loadActiveView, refreshProfile, setActiveView } = options;

  setActiveView(plan.nextView);
  if (plan.shouldRefreshProfile) {
    void refreshProfile();
  }
  if (plan.shouldLoadView) {
    loadActiveView(plan.nextView);
  }
}
