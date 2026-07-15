import type { SessionInvalidationState } from "@studymate/api-client";
import { describe, expect, it, vi } from "vitest";
import type { AdminSessionPayload } from "../api/sessionStore";
import { createAdminWorkspaceFeatureAdapter } from "./adminWorkspaceFeatureAdapter";

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

describe("adminWorkspaceFeatureAdapter", () => {
  it("wires action and mutation adapters through the shared read adapter", () => {
    const readAdapter = {
      loadActiveView: vi.fn(),
      loadGovernance: vi.fn(),
      loadModeration: vi.fn(),
      loadOverview: vi.fn(),
      refreshProfile: vi.fn(async () => {})
    };
    const actions = { login: vi.fn(), logout: vi.fn(), refreshActiveView: vi.fn() };
    const mutations = {
      applyAITaskAction: vi.fn(),
      applyModerationAction: vi.fn(),
      applyReportAction: vi.fn(),
      applyTemplateAction: vi.fn(),
      applyUserAction: vi.fn(),
      requestGovernanceAction: vi.fn(),
      requestModerationAction: vi.fn()
    };
    const createReadAdapter = vi.fn(() => readAdapter);
    const createActionAdapter = vi.fn(() => actions);
    const createMutationAdapter = vi.fn(() => mutations);

    const feature = createAdminWorkspaceFeatureAdapter({
      action: {
        clearError: vi.fn(),
        clearProfile: vi.fn(),
        clearSessionInvalidation: vi.fn(),
        clearSessionState: vi.fn(),
        clearWorkspaceState: vi.fn(),
        getLoginSuccessNotice: vi.fn(),
        getLogoutNotice: vi.fn(),
        persistSession: vi.fn(),
        post: vi.fn(),
        readActiveView: () => "dashboard",
        readForm: () => ({ login: "", password: "" }),
        resolveErrorMessage: vi.fn(),
        setActiveView: vi.fn(),
        setError: vi.fn(),
        setLoading: vi.fn(),
        setNotice: vi.fn(),
        syncLocation: vi.fn()
      },
      mutation: {
        hasSession: () => true,
        post: vi.fn(),
        readActiveView: () => "users",
        readStatus: vi.fn(),
        resolveErrorMessage: vi.fn(),
        setAITaskAction: vi.fn(),
        setAITaskError: vi.fn(),
        setError: vi.fn(),
        setGovernanceStatus: vi.fn(),
        setLoading: vi.fn(),
        setModerationAction: vi.fn(),
        setModerationConfirmError: vi.fn(),
        setNotice: vi.fn(),
        setReportAction: vi.fn(),
        setReportConfirmError: vi.fn(),
        setTemplateAction: vi.fn(),
        setTemplateConfirmError: vi.fn(),
        setUserAction: vi.fn(),
        setUserConfirmError: vi.fn()
      },
      read: {
        get: vi.fn(),
        getGovernanceLoadedNotice: vi.fn(),
        getModerationLoadedNotice: vi.fn(),
        hasSession: () => true,
        readGovernanceRows: () => [],
        readGovernanceRowsView: () => null,
        readStatus: vi.fn(),
        resolveErrorMessage: vi.fn(),
        setError: vi.fn(),
        setGovernanceRows: vi.fn(),
        setGovernanceRowsView: vi.fn(),
        setGovernanceSelectedRecord: vi.fn(),
        setGovernanceStatus: vi.fn(),
        setGovernanceSummary: vi.fn(),
        setLoading: vi.fn(),
        setModerationItems: vi.fn(),
        setModerationStatus: vi.fn(),
        setNotice: vi.fn(),
        setOverview: vi.fn(),
        setProfile: vi.fn()
      },
      runtime: {
        clearError: vi.fn(),
        clearWorkspaceState: vi.fn(),
        hasSession: () => true,
        readSession: () => createSession(),
        readSessionInvalidation: () => null,
        setActiveView: vi.fn(),
        setNotice: vi.fn(),
        setProfile: vi.fn(),
        setSession: vi.fn(),
        setSessionInvalidation: vi.fn(),
        subscribeSession: vi.fn(() => vi.fn()),
        syncLocation: vi.fn(),
        window: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          history: {} as Window["history"],
          location: { pathname: "/admin/dashboard" } as Window["location"]
        }
      },
      runners: {
        createActionAdapter,
        createMutationAdapter,
        createReadAdapter,
        startRuntime: vi.fn(() => vi.fn())
      }
    });

    expect(createReadAdapter).toHaveBeenCalledTimes(1);
    expect(createActionAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        loadActiveView: readAdapter.loadActiveView,
        refreshProfile: readAdapter.refreshProfile
      })
    );
    expect(createMutationAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        loadGovernance: readAdapter.loadGovernance,
        loadModeration: readAdapter.loadModeration,
        loadOverview: readAdapter.loadOverview
      })
    );
    expect(feature.read).toBe(readAdapter);
    expect(feature.actions).toBe(actions);
    expect(feature.mutations).toBe(mutations);
  });

  it("starts runtime with the read adapter loaders and refresh hook", () => {
    const readAdapter = {
      loadActiveView: vi.fn(),
      loadGovernance: vi.fn(),
      loadModeration: vi.fn(),
      loadOverview: vi.fn(),
      refreshProfile: vi.fn(async () => {})
    };
    const stopRuntime = vi.fn();
    const startRuntime = vi.fn(() => stopRuntime);
    const readSession = vi.fn(() => createSession());
    const readSessionInvalidation = vi.fn(() => null as SessionInvalidationState | null);

    const feature = createAdminWorkspaceFeatureAdapter({
      action: {
        clearError: vi.fn(),
        clearProfile: vi.fn(),
        clearSessionInvalidation: vi.fn(),
        clearSessionState: vi.fn(),
        clearWorkspaceState: vi.fn(),
        getLoginSuccessNotice: vi.fn(),
        getLogoutNotice: vi.fn(),
        persistSession: vi.fn(),
        post: vi.fn(),
        readActiveView: () => "dashboard",
        readForm: () => ({ login: "", password: "" }),
        resolveErrorMessage: vi.fn(),
        setActiveView: vi.fn(),
        setError: vi.fn(),
        setLoading: vi.fn(),
        setNotice: vi.fn(),
        syncLocation: vi.fn()
      },
      mutation: {
        hasSession: () => true,
        post: vi.fn(),
        readActiveView: () => "users",
        readStatus: vi.fn(),
        resolveErrorMessage: vi.fn(),
        setAITaskAction: vi.fn(),
        setAITaskError: vi.fn(),
        setError: vi.fn(),
        setGovernanceStatus: vi.fn(),
        setLoading: vi.fn(),
        setModerationAction: vi.fn(),
        setModerationConfirmError: vi.fn(),
        setNotice: vi.fn(),
        setReportAction: vi.fn(),
        setReportConfirmError: vi.fn(),
        setTemplateAction: vi.fn(),
        setTemplateConfirmError: vi.fn(),
        setUserAction: vi.fn(),
        setUserConfirmError: vi.fn()
      },
      read: {
        get: vi.fn(),
        getGovernanceLoadedNotice: vi.fn(),
        getModerationLoadedNotice: vi.fn(),
        hasSession: () => true,
        readGovernanceRows: () => [],
        readGovernanceRowsView: () => null,
        readStatus: vi.fn(),
        resolveErrorMessage: vi.fn(),
        setError: vi.fn(),
        setGovernanceRows: vi.fn(),
        setGovernanceRowsView: vi.fn(),
        setGovernanceSelectedRecord: vi.fn(),
        setGovernanceStatus: vi.fn(),
        setGovernanceSummary: vi.fn(),
        setLoading: vi.fn(),
        setModerationItems: vi.fn(),
        setModerationStatus: vi.fn(),
        setNotice: vi.fn(),
        setOverview: vi.fn(),
        setProfile: vi.fn()
      },
      runtime: {
        clearError: vi.fn(),
        clearWorkspaceState: vi.fn(),
        hasSession: () => true,
        readSession,
        readSessionInvalidation,
        setActiveView: vi.fn(),
        setNotice: vi.fn(),
        setProfile: vi.fn(),
        setSession: vi.fn(),
        setSessionInvalidation: vi.fn(),
        subscribeSession: vi.fn(() => vi.fn()),
        syncLocation: vi.fn(),
        window: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          history: {} as Window["history"],
          location: { pathname: "/admin/dashboard" } as Window["location"]
        }
      },
      runners: {
        createActionAdapter: vi.fn(() => ({ login: vi.fn(), logout: vi.fn(), refreshActiveView: vi.fn() })),
        createMutationAdapter: vi.fn(() => ({
          applyAITaskAction: vi.fn(),
          applyModerationAction: vi.fn(),
          applyReportAction: vi.fn(),
          applyTemplateAction: vi.fn(),
          applyUserAction: vi.fn(),
          requestGovernanceAction: vi.fn(),
          requestModerationAction: vi.fn()
        })),
        createReadAdapter: vi.fn(() => readAdapter),
        startRuntime
      }
    });

    const stop = feature.startRuntime();

    expect(startRuntime).toHaveBeenCalledWith(
      expect.objectContaining({
        loadActiveView: readAdapter.loadActiveView,
        readSession,
        readSessionInvalidation,
        refreshProfile: readAdapter.refreshProfile
      })
    );
    expect(stop).toBe(stopRuntime);
  });
});
