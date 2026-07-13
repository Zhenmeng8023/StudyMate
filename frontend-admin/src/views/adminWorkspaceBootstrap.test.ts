import { describe, expect, it, vi } from "vitest";
import { runAdminWorkspaceLoginBootstrap } from "./adminWorkspaceBootstrap";

describe("adminWorkspaceBootstrap", () => {
  it("persists the session, refreshes the profile, and loads the active view in order", async () => {
    const steps: string[] = [];
    const session = {
      accessToken: "admin-token",
      refreshToken: "refresh-token",
      accessTokenExpiresAt: "2026-06-02T12:00:00Z",
      user: {
        id: "admin-1",
        username: "operator",
        email: "operator@example.test",
        displayName: "Operator",
        role: "admin"
      }
    };
    const authenticate = vi.fn(async () => {
      steps.push("authenticate");
      return session;
    });
    const persistSession = vi.fn((nextSession: typeof session) => {
      steps.push("persist");
      expect(nextSession).toBe(session);
    });
    const refreshProfile = vi.fn(async () => {
      steps.push("refresh");
    });
    const loadActiveView = vi.fn((view: string) => {
      steps.push(`load:${view}`);
    });

    const result = await runAdminWorkspaceLoginBootstrap("users", {
      authenticate,
      loadActiveView,
      persistSession,
      refreshProfile
    });

    expect(result).toBe(session);
    expect(steps).toEqual(["authenticate", "persist", "refresh", "load:users"]);
  });

  it("does not persist or load follow-up data when authentication fails", async () => {
    const authenticate = vi.fn(async () => {
      throw new Error("管理员登录失败");
    });
    const persistSession = vi.fn();
    const refreshProfile = vi.fn(async () => {});
    const loadActiveView = vi.fn();

    await expect(
      runAdminWorkspaceLoginBootstrap("dashboard", {
        authenticate,
        loadActiveView,
        persistSession,
        refreshProfile
      })
    ).rejects.toThrow("管理员登录失败");

    expect(persistSession).not.toHaveBeenCalled();
    expect(refreshProfile).not.toHaveBeenCalled();
    expect(loadActiveView).not.toHaveBeenCalled();
  });
});
