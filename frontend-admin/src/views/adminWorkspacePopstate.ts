import type { AdminRouteKey } from "../router";
import type { AdminWorkspaceResetKey } from "./adminWorkspaceState";

export function runAdminWorkspacePopstate(
  plan: {
    nextView: AdminRouteKey;
    resetKeys: AdminWorkspaceResetKey[];
    shouldLoadView: boolean;
  },
  options: {
    clearWorkspaceState: (keys?: AdminWorkspaceResetKey[]) => void;
    loadActiveView: (view: AdminRouteKey) => void;
    setActiveView: (view: AdminRouteKey) => void;
  }
) {
  const { clearWorkspaceState, loadActiveView, setActiveView } = options;

  clearWorkspaceState(plan.resetKeys);
  setActiveView(plan.nextView);
  if (plan.shouldLoadView) {
    loadActiveView(plan.nextView);
  }
}
