import type { SessionInvalidationState } from "@studymate/api-client";
import type { AdminAuthUser, AdminSessionPayload } from "../api/sessionStore";
import type { AdminRouteKey } from "../router";
import {
  buildAdminWorkspaceMountPlan,
  buildAdminWorkspacePopstatePlan
} from "./adminWorkspaceLifecycle";
import { normalizeAdminWorkspaceLocation } from "./adminWorkspaceLocation";
import { runAdminWorkspaceMountBootstrap } from "./adminWorkspaceMountBootstrap";
import { runAdminWorkspacePopstate } from "./adminWorkspacePopstate";
import { runAdminWorkspaceSessionSync } from "./adminWorkspaceSessionSync";
import type { AdminWorkspaceResetKey } from "./adminWorkspaceState";

type AdminWorkspaceWindowLike = Pick<
  Window,
  "addEventListener" | "removeEventListener" | "location" | "history"
>;

export interface StartAdminWorkspaceRuntimeOptions {
  clearError: () => void;
  clearWorkspaceState: (keys?: AdminWorkspaceResetKey[]) => void;
  hasSession: () => boolean;
  loadActiveView: (view: AdminRouteKey) => void;
  readSession: () => AdminSessionPayload | null;
  readSessionInvalidation: () => SessionInvalidationState | null;
  refreshProfile: () => Promise<void>;
  setActiveView: (view: AdminRouteKey) => void;
  setNotice: (notice: string) => void;
  setProfile: (profile: AdminAuthUser | null) => void;
  setSession: (session: AdminSessionPayload | null) => void;
  setSessionInvalidation: (reason: SessionInvalidationState | null) => void;
  subscribeSession: (listener: () => void) => () => void;
  syncLocation: (view: AdminRouteKey, syncMode: "push" | "replace") => void;
  window: AdminWorkspaceWindowLike;
}

export function startAdminWorkspaceRuntime(options: StartAdminWorkspaceRuntimeOptions) {
  const syncSession = () => {
    runAdminWorkspaceSessionSync(options.readSession(), options.readSessionInvalidation(), {
      clearError: options.clearError,
      clearWorkspaceState: options.clearWorkspaceState,
      setActiveView: options.setActiveView,
      setNotice: options.setNotice,
      setProfile: options.setProfile,
      setSession: options.setSession,
      setSessionInvalidation: options.setSessionInvalidation,
      syncLocation: options.syncLocation
    });
  };

  const handlePopstate = () => {
    const plan = buildAdminWorkspacePopstatePlan(
      normalizeAdminWorkspaceLocation(options.window.location, options.window.history),
      options.hasSession()
    );
    runAdminWorkspacePopstate(plan, {
      clearWorkspaceState: options.clearWorkspaceState,
      loadActiveView: options.loadActiveView,
      setActiveView: options.setActiveView
    });
  };

  const unsubscribeSession = options.subscribeSession(syncSession);
  options.window.addEventListener("popstate", handlePopstate);

  const mountPlan = buildAdminWorkspaceMountPlan(
    normalizeAdminWorkspaceLocation(options.window.location, options.window.history),
    options.hasSession()
  );
  runAdminWorkspaceMountBootstrap(mountPlan, {
    loadActiveView: options.loadActiveView,
    refreshProfile: options.refreshProfile,
    setActiveView: options.setActiveView
  });

  return () => {
    options.window.removeEventListener("popstate", handlePopstate);
    unsubscribeSession();
  };
}
