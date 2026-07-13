import {
  defaultAdminRouteKey,
  getAdminRoutePath,
  normalizeAdminRoutePath,
  parseAdminRoutePath,
  type AdminRouteKey
} from "../router";

export type AdminWorkspaceLocationLike = Pick<Location, "pathname"> | null | undefined;
export type AdminWorkspaceHistoryLike = Pick<History, "pushState" | "replaceState"> | null | undefined;
export type AdminWorkspaceHistoryMode = "push" | "replace";

export function resolveAdminWorkspaceLocationView(location: AdminWorkspaceLocationLike): AdminRouteKey {
  return parseAdminRoutePath(location?.pathname ?? "") ?? defaultAdminRouteKey;
}

export function normalizeAdminWorkspaceLocation(
  location: AdminWorkspaceLocationLike,
  history: AdminWorkspaceHistoryLike
): AdminRouteKey {
  if (!location) return defaultAdminRouteKey;

  const normalizedPath = normalizeAdminRoutePath(location.pathname);
  if (history && location.pathname !== normalizedPath) {
    history.replaceState({}, "", normalizedPath);
  }

  return parseAdminRoutePath(normalizedPath) ?? defaultAdminRouteKey;
}

export function syncAdminWorkspaceLocation(
  view: AdminRouteKey,
  location: AdminWorkspaceLocationLike,
  history: AdminWorkspaceHistoryLike,
  mode: AdminWorkspaceHistoryMode = "push"
) {
  if (!location || !history) return false;

  const nextPath = getAdminRoutePath(view);
  if (location.pathname === nextPath) return false;

  history[mode === "replace" ? "replaceState" : "pushState"]({}, "", nextPath);
  return true;
}
