import { describe, expect, it, vi } from "vitest";
import { buildAdminWorkspaceShellEvents } from "./adminWorkspaceShellEvents";

describe("adminWorkspaceShellEvents", () => {
  it("forwards refresh, logout, and switch-view events through the shared shell callbacks", () => {
    const logout = vi.fn();
    const refreshActiveView = vi.fn();
    const switchView = vi.fn();

    const events = buildAdminWorkspaceShellEvents({
      logout,
      refreshActiveView,
      switchView
    });

    events.logout();
    events.refresh();
    events.switchView("audit");

    expect(logout).toHaveBeenCalledTimes(1);
    expect(refreshActiveView).toHaveBeenCalledTimes(1);
    expect(switchView).toHaveBeenCalledWith("audit");
  });
});
