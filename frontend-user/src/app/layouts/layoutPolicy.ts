export type AppLayoutMode = "standard" | "studio" | "canvas" | "focus";

/**
 * Maps a route to the workspace density it needs. Keep this policy free of
 * React concerns so page routing and visual regression tests can share it.
 */
export function resolveAppLayoutMode(pathname: string): AppLayoutMode {
  if (pathname.startsWith("/graph")) {
    return "canvas";
  }

  if (pathname.startsWith("/reader") || pathname.startsWith("/notes")) {
    return "studio";
  }

  if (pathname.startsWith("/review")) {
    return "focus";
  }

  return "standard";
}

export function layoutUsesCompactNavigation(mode: AppLayoutMode) {
  return mode === "studio" || mode === "canvas";
}

export function layoutShowsGlobalContext(mode: AppLayoutMode) {
  return mode === "standard";
}

export function layoutShowsGlobalSearch(mode: AppLayoutMode) {
  return mode === "standard" || mode === "studio";
}
