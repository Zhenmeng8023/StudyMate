import type { AdminRouteKey } from "../router";

export function buildAdminWorkspaceShellEvents(input: {
  logout: () => void;
  refreshActiveView: () => void;
  switchView: (view: AdminRouteKey) => void;
}) {
  return {
    logout: () => {
      input.logout();
    },
    refresh: () => {
      input.refreshActiveView();
    },
    switchView: (view: AdminRouteKey) => {
      input.switchView(view);
    }
  };
}
