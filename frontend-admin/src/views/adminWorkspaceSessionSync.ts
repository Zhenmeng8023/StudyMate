import { getSessionInvalidationPrompt, type SessionInvalidationState } from "@studymate/api-client";
import type { AdminAuthUser, AdminSessionPayload } from "../api/sessionStore";
import type { AdminRouteKey } from "../router";
import { buildAdminWorkspaceSessionClearedPlan } from "./adminWorkspaceLifecycle";
import { getAdminSessionEndedNotice } from "./adminWorkspaceNotice";
import { runAdminWorkspaceSessionCleared } from "./adminWorkspaceSessionCleared";
import type { AdminWorkspaceResetKey } from "./adminWorkspaceState";

export function runAdminWorkspaceSessionSync(
  nextSession: AdminSessionPayload | null,
  nextInvalidation: SessionInvalidationState | null,
  options: {
    clearError: () => void;
    clearWorkspaceState: (keys?: AdminWorkspaceResetKey[]) => void;
    setActiveView: (view: AdminRouteKey) => void;
    setNotice: (notice: string) => void;
    setProfile: (profile: AdminAuthUser | null) => void;
    setSession: (session: AdminSessionPayload | null) => void;
    setSessionInvalidation: (reason: SessionInvalidationState | null) => void;
    syncLocation: (view: AdminRouteKey, syncMode: "push" | "replace") => void;
  }
) {
  options.setSession(nextSession);
  options.setSessionInvalidation(nextInvalidation);
  options.setProfile(nextSession?.user ?? null);

  if (nextSession) {
    return;
  }

  const plan = buildAdminWorkspaceSessionClearedPlan(
    getAdminSessionEndedNotice(getSessionInvalidationPrompt(nextInvalidation, "admin"))
  );
  runAdminWorkspaceSessionCleared(plan, {
    clearError: options.clearError,
    clearWorkspaceState: options.clearWorkspaceState,
    setActiveView: options.setActiveView,
    setNotice: options.setNotice,
    syncLocation: options.syncLocation
  });
}
