import type { AdminRouteKey } from "../router";
import type { AdminWorkspaceResetKey } from "./adminWorkspaceState";

export function runAdminWorkspaceSessionCleared(
  plan: {
    clearError: boolean;
    nextView: AdminRouteKey;
    notice: string;
    resetKeys?: AdminWorkspaceResetKey[];
    syncMode: "push" | "replace";
  },
  options: {
    clearError: () => void;
    clearWorkspaceState: (keys?: AdminWorkspaceResetKey[]) => void;
    setActiveView: (view: AdminRouteKey) => void;
    setNotice: (notice: string) => void;
    syncLocation: (view: AdminRouteKey, syncMode: "push" | "replace") => void;
  }
) {
  const { clearError, clearWorkspaceState, setActiveView, setNotice, syncLocation } = options;

  clearWorkspaceState(plan.resetKeys);
  setActiveView(plan.nextView);
  syncLocation(plan.nextView, plan.syncMode);
  if (plan.clearError) {
    clearError();
  }
  setNotice(plan.notice);
}
