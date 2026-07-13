import type { AdminRouteKey } from "../router";
import type { AdminWorkspaceResetKey } from "./adminWorkspaceState";

export function runAdminWorkspaceViewSwitch(
  plan: {
    nextView: AdminRouteKey;
    resetKeys: AdminWorkspaceResetKey[];
    shouldLoadView: boolean;
    syncMode: "push" | "replace";
  },
  options: {
    clearWorkspaceState: (keys?: AdminWorkspaceResetKey[]) => void;
    loadActiveView: (view: AdminRouteKey) => void;
    setActiveView: (view: AdminRouteKey) => void;
    syncLocation: (view: AdminRouteKey, syncMode: "push" | "replace") => void;
  }
) {
  const { clearWorkspaceState, loadActiveView, setActiveView, syncLocation } = options;

  clearWorkspaceState(plan.resetKeys);
  setActiveView(plan.nextView);
  syncLocation(plan.nextView, plan.syncMode);
  if (plan.shouldLoadView) {
    loadActiveView(plan.nextView);
  }
}
