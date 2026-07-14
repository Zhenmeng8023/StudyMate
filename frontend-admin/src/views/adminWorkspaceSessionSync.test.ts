import type { SessionInvalidationState } from "@studymate/api-client";
import { describe, expect, it, vi } from "vitest";
import type { AdminSessionPayload } from "../api/sessionStore";
import { getAdminSessionEndedNotice } from "./adminWorkspaceNotice";
import { runAdminWorkspaceSessionSync } from "./adminWorkspaceSessionSync";

describe("adminWorkspaceSessionSync", () => {
  it("syncs the latest session, invalidation, and profile without resetting the workspace when the session is still valid", () => {
    const session: AdminSessionPayload = {
      accessToken: "admin-token",
      refreshToken: "refresh-token",
      accessTokenExpiresAt: "2026-07-15T00:00:00Z",
      user: {
        id: "admin-1",
        username: "operator",
        email: "operator@example.test",
        displayName: "Operator",
        role: "admin"
      }
    };
    const invalidation: SessionInvalidationState = {
      kind: "refresh_failed",
      code: "session_refresh_failed",
      message: "会话已失效",
      status: 401,
      occurredAt: "2026-07-15T00:00:00Z"
    };

    const setSession = vi.fn();
    const setSessionInvalidation = vi.fn();
    const setProfile = vi.fn();
    const clearWorkspaceState = vi.fn();
    const setActiveView = vi.fn();
    const syncLocation = vi.fn();
    const clearError = vi.fn();
    const setNotice = vi.fn();

    runAdminWorkspaceSessionSync(session, invalidation, {
      clearError,
      clearWorkspaceState,
      setActiveView,
      setNotice,
      setProfile,
      setSession,
      setSessionInvalidation,
      syncLocation
    });

    expect(setSession).toHaveBeenCalledWith(session);
    expect(setSessionInvalidation).toHaveBeenCalledWith(invalidation);
    expect(setProfile).toHaveBeenCalledWith(session.user);
    expect(clearWorkspaceState).not.toHaveBeenCalled();
    expect(setActiveView).not.toHaveBeenCalled();
    expect(syncLocation).not.toHaveBeenCalled();
    expect(clearError).not.toHaveBeenCalled();
    expect(setNotice).not.toHaveBeenCalled();
  });

  it("resets the workspace and shows the session-ended notice when the session is cleared", () => {
    const invalidation: SessionInvalidationState = {
      kind: "session_rejected",
      code: "user_disabled",
      message: "当前账号已被禁用",
      status: 403,
      occurredAt: "2026-07-15T00:00:00Z"
    };
    const steps: string[] = [];

    runAdminWorkspaceSessionSync(null, invalidation, {
      clearError: vi.fn(() => {
        steps.push("error");
      }),
      clearWorkspaceState: vi.fn((keys?: string[]) => {
        steps.push(`reset:${keys ? keys.join(",") : "all"}`);
      }),
      setActiveView: vi.fn((view: string) => {
        steps.push(`view:${view}`);
      }),
      setNotice: vi.fn((notice: string) => {
        steps.push(`notice:${notice}`);
      }),
      setProfile: vi.fn((profile) => {
        steps.push(`profile:${profile === null ? "null" : "user"}`);
      }),
      setSession: vi.fn((session) => {
        steps.push(`session:${session === null ? "null" : "value"}`);
      }),
      setSessionInvalidation: vi.fn((reason) => {
        steps.push(`invalidation:${reason?.code ?? "null"}`);
      }),
      syncLocation: vi.fn((view: string, syncMode: string) => {
        steps.push(`sync:${view}:${syncMode}`);
      })
    });

    expect(steps).toEqual([
      "session:null",
      "invalidation:user_disabled",
      "profile:null",
      "reset:all",
      "view:dashboard",
      "sync:dashboard:replace",
      "error",
      `notice:${getAdminSessionEndedNotice("当前账号已被禁用，请联系其他管理员后重新登录。")}`
    ]);
  });
});
