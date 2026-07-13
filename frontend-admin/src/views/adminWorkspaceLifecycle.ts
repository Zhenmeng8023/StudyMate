import { defaultAdminRouteKey, type AdminRouteKey } from "../router";
import type { AdminWorkspaceResetKey } from "./adminWorkspaceState";

type AdminWorkspaceSyncMode = "push" | "replace";

type AdminWorkspaceBasePlan = {
  nextView: AdminRouteKey;
};

type AdminWorkspaceLoadPlan = AdminWorkspaceBasePlan & {
  shouldLoadView: boolean;
};

export type AdminWorkspaceMountPlan = AdminWorkspaceLoadPlan & {
  shouldRefreshProfile: boolean;
};

export type AdminWorkspacePopstatePlan = AdminWorkspaceLoadPlan & {
  resetKeys: AdminWorkspaceResetKey[];
};

export type AdminWorkspaceViewSwitchPlan = AdminWorkspaceLoadPlan & {
  resetKeys: AdminWorkspaceResetKey[];
  syncMode: AdminWorkspaceSyncMode;
};

export type AdminWorkspaceSessionClearedPlan = AdminWorkspaceBasePlan & {
  clearError: boolean;
  notice: string;
  resetKeys?: AdminWorkspaceResetKey[];
  syncMode: AdminWorkspaceSyncMode;
};

export type AdminWorkspaceLogoutPlan = AdminWorkspaceBasePlan & {
  clearSessionInvalidation: boolean;
  notice: string;
  resetKeys?: AdminWorkspaceResetKey[];
  syncMode: AdminWorkspaceSyncMode;
};

export function buildAdminWorkspaceMountPlan(
  view: AdminRouteKey,
  hasSession: boolean
): AdminWorkspaceMountPlan {
  return {
    nextView: view,
    shouldLoadView: hasSession,
    shouldRefreshProfile: hasSession
  };
}

export function buildAdminWorkspacePopstatePlan(
  view: AdminRouteKey,
  hasSession: boolean
): AdminWorkspacePopstatePlan {
  return {
    nextView: view,
    resetKeys: ["queries"],
    shouldLoadView: hasSession
  };
}

export function buildAdminWorkspaceViewSwitchPlan(view: AdminRouteKey): AdminWorkspaceViewSwitchPlan {
  return {
    nextView: view,
    resetKeys: ["queries", "filters", "confirmState"],
    shouldLoadView: true,
    syncMode: "push"
  };
}

export function buildAdminWorkspaceSessionClearedPlan(notice: string): AdminWorkspaceSessionClearedPlan {
  return {
    clearError: true,
    nextView: defaultAdminRouteKey,
    notice,
    resetKeys: undefined,
    syncMode: "replace"
  };
}

export function buildAdminWorkspaceLogoutPlan(notice: string): AdminWorkspaceLogoutPlan {
  return {
    clearSessionInvalidation: true,
    nextView: defaultAdminRouteKey,
    notice,
    resetKeys: undefined,
    syncMode: "replace"
  };
}
