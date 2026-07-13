import type { AdminRouteKey } from "../router";
import type { AdminWorkspaceResetKey } from "./adminWorkspaceState";

export function runAdminWorkspaceLogout(
  plan: {
    clearSessionInvalidation: boolean;
    nextView: AdminRouteKey;
    notice: string;
    resetKeys?: AdminWorkspaceResetKey[];
    syncMode: "push" | "replace";
  },
  options: {
    clearProfile: () => void;
    clearSessionInvalidation: () => void;
    clearSessionState: () => void;
    clearWorkspaceState: (keys?: AdminWorkspaceResetKey[]) => void;
    persistSession: (session: null) => void;
    setActiveView: (view: AdminRouteKey) => void;
    setNotice: (notice: string) => void;
    syncLocation: (view: AdminRouteKey, syncMode: "push" | "replace") => void;
  }
) {
  const {
    clearProfile,
    clearSessionInvalidation,
    clearSessionState,
    clearWorkspaceState,
    persistSession,
    setActiveView,
    setNotice,
    syncLocation
  } = options;

  clearSessionState();
  clearProfile();
  clearWorkspaceState(plan.resetKeys);
  setActiveView(plan.nextView);
  syncLocation(plan.nextView, plan.syncMode);
  if (plan.clearSessionInvalidation) {
    clearSessionInvalidation();
  }
  persistSession(null);
  setNotice(plan.notice);
}
