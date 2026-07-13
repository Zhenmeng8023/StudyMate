import { describe, expect, it, vi } from "vitest";
import { runAdminWorkspaceLogout } from "./adminWorkspaceLogout";

describe("adminWorkspaceLogout", () => {
  it("clears workspace state, clears persisted session state, and sets the logout notice in order", () => {
    const steps: string[] = [];
    const clearWorkspaceState = vi.fn((keys?: string[]) => {
      steps.push(`reset:${keys?.join(",") ?? "all"}`);
    });
    const setActiveView = vi.fn((view: string) => {
      steps.push(`view:${view}`);
    });
    const clearSessionState = vi.fn(() => {
      steps.push("session");
    });
    const clearProfile = vi.fn(() => {
      steps.push("profile");
    });
    const syncLocation = vi.fn((view: string, syncMode: string) => {
      steps.push(`sync:${view}:${syncMode}`);
    });
    const clearSessionInvalidation = vi.fn(() => {
      steps.push("clear-invalidation");
    });
    const persistSession = vi.fn((session: null) => {
      steps.push(`persist:${session}`);
    });
    const setNotice = vi.fn((notice: string) => {
      steps.push(`notice:${notice}`);
    });

    runAdminWorkspaceLogout(
      {
        clearSessionInvalidation: true,
        nextView: "dashboard",
        notice: "后台会话已清空。",
        resetKeys: ["queries", "filters"],
        syncMode: "replace"
      },
      {
        clearProfile,
        clearSessionInvalidation,
        clearSessionState,
        clearWorkspaceState,
        persistSession,
        setActiveView,
        setNotice,
        syncLocation
      }
    );

    expect(steps).toEqual([
      "session",
      "profile",
      "reset:queries,filters",
      "view:dashboard",
      "sync:dashboard:replace",
      "clear-invalidation",
      "persist:null",
      "notice:后台会话已清空。"
    ]);
  });

  it("skips invalidation clearing when the logout plan disables it", () => {
    const clearSessionInvalidation = vi.fn();
    const persistSession = vi.fn();

    runAdminWorkspaceLogout(
      {
        clearSessionInvalidation: false,
        nextView: "dashboard",
        notice: "后台会话已清空。",
        resetKeys: undefined,
        syncMode: "replace"
      },
      {
        clearProfile: vi.fn(),
        clearSessionInvalidation,
        clearSessionState: vi.fn(),
        clearWorkspaceState: vi.fn(),
        persistSession,
        setActiveView: vi.fn(),
        setNotice: vi.fn(),
        syncLocation: vi.fn()
      }
    );

    expect(clearSessionInvalidation).not.toHaveBeenCalled();
    expect(persistSession).toHaveBeenCalledWith(null);
  });
});
