import type { ApiRequestInit } from "@studymate/api-client";
import type { AdminSessionPayload } from "../api/sessionStore";
import { describe, expect, it, vi } from "vitest";
import { createAdminWorkspaceActionAdapter } from "./adminWorkspaceActionAdapter";
import { runAdminWorkspaceLoginBootstrap } from "./adminWorkspaceBootstrap";
import { runAdminWorkspaceLogin } from "./adminWorkspaceLogin";

const loginSuccessNotice = "\u5df2\u8fdb\u5165\u7ba1\u7406\u540e\u53f0\u3002";
const logoutNotice = "\u540e\u53f0\u4f1a\u8bdd\u5df2\u6e05\u7a7a\u3002";
const loginFailureMessage = "\u767b\u5f55\u5931\u8d25";
const loginFallbackMessage = "\u7ba1\u7406\u5458\u767b\u5f55\u5931\u8d25";

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

describe("adminWorkspaceActionAdapter", () => {
  it("wires the login action through the shared login and bootstrap runners", async () => {
    const form = { login: "operator@example.test", password: "secret" };
    const postMock = vi.fn(async (_path: string, _body: ApiRequestInit["body"]) => createSession());
    const post = <T,>(path: string, body: ApiRequestInit["body"]) => postMock(path, body) as Promise<T>;
    const persistSession = vi.fn();
    const refreshProfile = vi.fn(async () => {});
    const loadActiveView = vi.fn();
    const clearError = vi.fn();
    const clearSessionInvalidation = vi.fn();
    const setError = vi.fn();
    const setLoading = vi.fn();
    const setNotice = vi.fn();

    const runLoginBootstrapMock = vi.fn(async (_view, options) => {
      await options.authenticate();
      options.persistSession(createSession());
      await options.refreshProfile();
      options.loadActiveView("users");
      return createSession();
    });
    const runLoginBootstrap: typeof runAdminWorkspaceLoginBootstrap = (view, options) =>
      runLoginBootstrapMock(view, options);

    const runLoginMock = vi.fn(async (view, options) => {
      await options.bootstrap(view);
      options.clearError();
      options.clearSessionInvalidation();
      options.setLoading(true);
      options.setNotice(options.getSuccessNotice());
    });
    const runLogin: typeof runAdminWorkspaceLogin = (view, options) => runLoginMock(view, options);

    const actions = createAdminWorkspaceActionAdapter({
      clearError,
      clearProfile: vi.fn(),
      clearSessionInvalidation,
      clearSessionState: vi.fn(),
      clearWorkspaceState: vi.fn(),
      getLoginSuccessNotice: () => loginSuccessNotice,
      getLogoutNotice: () => logoutNotice,
      loadActiveView,
      persistSession,
      post,
      readActiveView: () => "users",
      readForm: () => form,
      refreshProfile,
      resolveErrorMessage: vi.fn(() => loginFailureMessage),
      runners: {
        buildLogoutPlan: vi.fn(),
        buildRefreshPlan: vi.fn(),
        runLogin,
        runLoginBootstrap,
        runLogout: vi.fn(),
        runRefresh: vi.fn()
      },
      setActiveView: vi.fn(),
      setError,
      setLoading,
      setNotice,
      syncLocation: vi.fn()
    });

    await actions.login();

    expect(runLoginMock).toHaveBeenCalledWith(
      "users",
      expect.objectContaining({
        fallbackMessage: loginFallbackMessage
      })
    );
    expect(runLoginBootstrapMock).toHaveBeenCalledWith(
      "users",
      expect.objectContaining({
        loadActiveView,
        persistSession,
        refreshProfile
      })
    );
    expect(postMock).toHaveBeenCalledWith("/api/v1/admin/login", form);
  });

  it("wires the refresh action through the shared refresh plan and runner", () => {
    const plan = { nextView: "audit", shouldLoadView: true } as const;
    const buildRefreshPlan = vi.fn(() => plan);
    const runRefresh = vi.fn();
    const loadActiveView = vi.fn();

    const actions = createAdminWorkspaceActionAdapter({
      clearError: vi.fn(),
      clearProfile: vi.fn(),
      clearSessionInvalidation: vi.fn(),
      clearSessionState: vi.fn(),
      clearWorkspaceState: vi.fn(),
      getLoginSuccessNotice: () => loginSuccessNotice,
      getLogoutNotice: () => logoutNotice,
      loadActiveView,
      persistSession: vi.fn(),
      post: vi.fn(),
      readActiveView: () => "audit",
      readForm: () => ({ login: "", password: "" }),
      refreshProfile: vi.fn(async () => {}),
      resolveErrorMessage: vi.fn(),
      runners: {
        buildLogoutPlan: vi.fn(),
        buildRefreshPlan,
        runLogin: vi.fn(),
        runLoginBootstrap: vi.fn(),
        runLogout: vi.fn(),
        runRefresh
      },
      setActiveView: vi.fn(),
      setError: vi.fn(),
      setLoading: vi.fn(),
      setNotice: vi.fn(),
      syncLocation: vi.fn()
    });

    actions.refreshActiveView();

    expect(buildRefreshPlan).toHaveBeenCalledWith("audit");
    expect(runRefresh).toHaveBeenCalledWith(plan, { loadActiveView });
  });

  it("wires the logout action through the shared logout plan and runner", () => {
    const plan = {
      clearSessionInvalidation: true,
      nextView: "dashboard",
      notice: logoutNotice,
      resetKeys: undefined,
      syncMode: "replace"
    } as const;
    const buildLogoutPlan = vi.fn(() => plan);
    const runLogout = vi.fn();
    const clearProfile = vi.fn();
    const clearSessionState = vi.fn();
    const clearSessionInvalidation = vi.fn();
    const clearWorkspaceState = vi.fn();
    const setActiveView = vi.fn();
    const syncLocation = vi.fn();
    const persistSession = vi.fn();
    const setNotice = vi.fn();

    const actions = createAdminWorkspaceActionAdapter({
      clearError: vi.fn(),
      clearProfile,
      clearSessionInvalidation,
      clearSessionState,
      clearWorkspaceState,
      getLoginSuccessNotice: () => loginSuccessNotice,
      getLogoutNotice: () => logoutNotice,
      loadActiveView: vi.fn(),
      persistSession,
      post: vi.fn(),
      readActiveView: () => "users",
      readForm: () => ({ login: "", password: "" }),
      refreshProfile: vi.fn(async () => {}),
      resolveErrorMessage: vi.fn(),
      runners: {
        buildLogoutPlan,
        buildRefreshPlan: vi.fn(),
        runLogin: vi.fn(),
        runLoginBootstrap: vi.fn(),
        runLogout,
        runRefresh: vi.fn()
      },
      setActiveView,
      setError: vi.fn(),
      setLoading: vi.fn(),
      setNotice,
      syncLocation
    });

    actions.logout();

    expect(buildLogoutPlan).toHaveBeenCalledWith(logoutNotice);
    expect(runLogout).toHaveBeenCalledWith(
      plan,
      expect.objectContaining({
        clearProfile,
        clearSessionInvalidation,
        clearSessionState,
        clearWorkspaceState,
        persistSession,
        setActiveView,
        setNotice,
        syncLocation
      })
    );
  });
});
