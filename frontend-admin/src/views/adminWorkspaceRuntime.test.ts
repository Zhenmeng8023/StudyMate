import type { SessionInvalidationState } from "@studymate/api-client";
import { describe, expect, it, vi } from "vitest";
import type { AdminSessionPayload } from "../api/sessionStore";
import { startAdminWorkspaceRuntime } from "./adminWorkspaceRuntime";

function createSession(): AdminSessionPayload {
  return {
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
}

function createInvalidation(): SessionInvalidationState {
  return {
    kind: "session_rejected",
    code: "user_disabled",
    message: "Account disabled",
    status: 403,
    occurredAt: "2026-07-15T00:00:00Z"
  };
}

function createWindowStub(initialPathname = "/admin/dashboard") {
  const listeners = new Map<string, EventListener>();
  const location = { pathname: initialPathname };
  const history = {
    pushState: vi.fn((_state: unknown, _title: string, url?: string | URL | null) => {
      if (typeof url === "string") {
        location.pathname = url;
      }
    }),
    replaceState: vi.fn((_state: unknown, _title: string, url?: string | URL | null) => {
      if (typeof url === "string") {
        location.pathname = url;
      }
    })
  };
  const addEventListener = vi.fn((type: string, listener: EventListenerOrEventListenerObject) => {
    listeners.set(type, listener as EventListener);
  });
  const removeEventListener = vi.fn((type: string) => {
    listeners.delete(type);
  });

  return {
    addEventListener,
    history,
    listeners,
    location,
    removeEventListener,
    window: {
      addEventListener,
      history,
      location,
      removeEventListener
    } as Pick<Window, "addEventListener" | "removeEventListener" | "location" | "history">
  };
}

describe("adminWorkspaceRuntime", () => {
  it("mounts the resolved view, subscribes session changes, and cleans up listeners on stop", () => {
    const windowStub = createWindowStub("/admin/users");
    const refreshProfile = vi.fn(async () => {});
    const loadActiveView = vi.fn();
    const setActiveView = vi.fn();
    const unsubscribeSession = vi.fn();
    const subscribeSession = vi.fn(() => unsubscribeSession);

    const stop = startAdminWorkspaceRuntime({
      clearError: vi.fn(),
      clearWorkspaceState: vi.fn(),
      hasSession: () => true,
      loadActiveView,
      readSession: () => createSession(),
      readSessionInvalidation: () => null,
      refreshProfile,
      setActiveView,
      setNotice: vi.fn(),
      setProfile: vi.fn(),
      setSession: vi.fn(),
      setSessionInvalidation: vi.fn(),
      subscribeSession,
      syncLocation: vi.fn(),
      window: windowStub.window
    });

    expect(subscribeSession).toHaveBeenCalledTimes(1);
    expect(windowStub.addEventListener).toHaveBeenCalledWith("popstate", expect.any(Function));
    expect(setActiveView).toHaveBeenCalledWith("users");
    expect(refreshProfile).toHaveBeenCalledTimes(1);
    expect(loadActiveView).toHaveBeenCalledWith("users");

    stop();

    expect(windowStub.removeEventListener).toHaveBeenCalledWith(
      "popstate",
      windowStub.addEventListener.mock.calls[0]?.[1]
    );
    expect(unsubscribeSession).toHaveBeenCalledTimes(1);
  });

  it("replays session sync with the latest stored session values when the subscription fires", () => {
    const windowStub = createWindowStub();
    const setSession = vi.fn();
    const setSessionInvalidation = vi.fn();
    const setProfile = vi.fn();
    const clearWorkspaceState = vi.fn();
    const setActiveView = vi.fn();
    const syncLocation = vi.fn();
    const clearError = vi.fn();
    const setNotice = vi.fn();
    let nextSession: AdminSessionPayload | null = createSession();
    let nextInvalidation: SessionInvalidationState | null = null;

    const subscribeSession = vi.fn((listener: () => void) => {
      subscribeSession.listener = listener;
      return vi.fn();
    }) as typeof vi.fn & { listener?: () => void };

    startAdminWorkspaceRuntime({
      clearError,
      clearWorkspaceState,
      hasSession: () => true,
      loadActiveView: vi.fn(),
      readSession: () => nextSession,
      readSessionInvalidation: () => nextInvalidation,
      refreshProfile: vi.fn(async () => {}),
      setActiveView,
      setNotice,
      setProfile,
      setSession,
      setSessionInvalidation,
      subscribeSession,
      syncLocation,
      window: windowStub.window
    });

    setSession.mockClear();
    setSessionInvalidation.mockClear();
    setProfile.mockClear();
    clearWorkspaceState.mockClear();
    setActiveView.mockClear();
    syncLocation.mockClear();
    clearError.mockClear();
    setNotice.mockClear();

    subscribeSession.listener?.();

    expect(setSession).toHaveBeenCalledWith(nextSession);
    expect(setSessionInvalidation).toHaveBeenCalledWith(null);
    expect(setProfile).toHaveBeenCalledWith(nextSession?.user);
    expect(clearWorkspaceState).not.toHaveBeenCalled();
    expect(setActiveView).not.toHaveBeenCalled();
    expect(syncLocation).not.toHaveBeenCalled();
    expect(clearError).not.toHaveBeenCalled();
    expect(setNotice).not.toHaveBeenCalled();

    nextSession = null;
    nextInvalidation = createInvalidation();
    setSession.mockClear();
    setSessionInvalidation.mockClear();
    setProfile.mockClear();
    clearWorkspaceState.mockClear();
    setActiveView.mockClear();
    syncLocation.mockClear();
    clearError.mockClear();
    setNotice.mockClear();

    subscribeSession.listener?.();

    expect(setSession).toHaveBeenCalledWith(null);
    expect(setSessionInvalidation).toHaveBeenCalledWith(nextInvalidation);
    expect(setProfile).toHaveBeenCalledWith(null);
    expect(clearWorkspaceState).toHaveBeenCalledWith(undefined);
    expect(setActiveView).toHaveBeenCalledWith("dashboard");
    expect(syncLocation).toHaveBeenCalledWith("dashboard", "replace");
    expect(clearError).toHaveBeenCalledTimes(1);
    expect(setNotice).toHaveBeenCalledTimes(1);
  });

  it("recomputes the target view on popstate and reloads it when a session is present", () => {
    const windowStub = createWindowStub("/admin/dashboard");
    const clearWorkspaceState = vi.fn();
    const setActiveView = vi.fn();
    const loadActiveView = vi.fn();

    startAdminWorkspaceRuntime({
      clearError: vi.fn(),
      clearWorkspaceState,
      hasSession: () => true,
      loadActiveView,
      readSession: () => createSession(),
      readSessionInvalidation: () => null,
      refreshProfile: vi.fn(async () => {}),
      setActiveView,
      setNotice: vi.fn(),
      setProfile: vi.fn(),
      setSession: vi.fn(),
      setSessionInvalidation: vi.fn(),
      subscribeSession: vi.fn(() => vi.fn()),
      syncLocation: vi.fn(),
      window: windowStub.window
    });

    clearWorkspaceState.mockClear();
    setActiveView.mockClear();
    loadActiveView.mockClear();
    windowStub.location.pathname = "/admin/audit";

    windowStub.listeners.get("popstate")?.(new Event("popstate"));

    expect(clearWorkspaceState).toHaveBeenCalledWith(["queries"]);
    expect(setActiveView).toHaveBeenCalledWith("audit");
    expect(loadActiveView).toHaveBeenCalledWith("audit");
  });
});
