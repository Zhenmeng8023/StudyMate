import { describe, expect, it, vi } from "vitest";
import {
  normalizeAdminWorkspaceLocation,
  resolveAdminWorkspaceLocationView,
  syncAdminWorkspaceLocation
} from "./adminWorkspaceLocation";

describe("adminWorkspaceLocation", () => {
  it("resolves the active admin view from the current pathname", () => {
    expect(resolveAdminWorkspaceLocationView(null)).toBe("dashboard");
    expect(resolveAdminWorkspaceLocationView({ pathname: "/admin/users" })).toBe("users");
    expect(resolveAdminWorkspaceLocationView({ pathname: "/unknown" })).toBe("dashboard");
  });

  it("normalizes the current admin pathname and replaces invalid paths", () => {
    const replaceState = vi.fn();

    expect(
      normalizeAdminWorkspaceLocation({ pathname: "/admin" }, { replaceState } as unknown as History)
    ).toBe("dashboard");
    expect(replaceState).toHaveBeenCalledWith({}, "", "/admin/dashboard");
  });

  it("syncs the target admin pathname without pushing duplicate history entries", () => {
    const pushState = vi.fn();
    const replaceState = vi.fn();
    const history = { pushState, replaceState } as unknown as History;

    syncAdminWorkspaceLocation("audit", { pathname: "/admin/dashboard" }, history);
    expect(pushState).toHaveBeenCalledWith({}, "", "/admin/audit");

    syncAdminWorkspaceLocation("audit", { pathname: "/admin/audit" }, history);
    expect(pushState).toHaveBeenCalledTimes(1);

    syncAdminWorkspaceLocation("dashboard", { pathname: "/admin/audit" }, history, "replace");
    expect(replaceState).toHaveBeenCalledWith({}, "", "/admin/dashboard");
  });
});
