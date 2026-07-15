import type { ApiRequestInit } from "@studymate/api-client";
import type { AdminSessionPayload } from "../api/sessionStore";
import type { AdminRouteKey } from "../router";
import {
  buildAdminWorkspaceLogoutPlan,
  buildAdminWorkspaceRefreshPlan,
  type AdminWorkspaceLogoutPlan,
  type AdminWorkspaceRefreshPlan
} from "./adminWorkspaceLifecycle";
import { runAdminWorkspaceLoginBootstrap } from "./adminWorkspaceBootstrap";
import { runAdminWorkspaceLogin } from "./adminWorkspaceLogin";
import { runAdminWorkspaceLogout } from "./adminWorkspaceLogout";
import { runAdminWorkspaceRefresh } from "./adminWorkspaceRefresh";
import type { AdminWorkspaceResetKey } from "./adminWorkspaceState";

type AdminWorkspaceSyncMode = "push" | "replace";

interface AdminWorkspaceActionAdapterRunners {
  buildLogoutPlan: (notice: string) => AdminWorkspaceLogoutPlan;
  buildRefreshPlan: (view: AdminRouteKey) => AdminWorkspaceRefreshPlan;
  runLogin: typeof runAdminWorkspaceLogin;
  runLoginBootstrap: typeof runAdminWorkspaceLoginBootstrap;
  runLogout: typeof runAdminWorkspaceLogout;
  runRefresh: typeof runAdminWorkspaceRefresh;
}

interface CreateAdminWorkspaceActionAdapterOptions {
  clearError: () => void;
  clearProfile: () => void;
  clearSessionInvalidation: () => void;
  clearSessionState: () => void;
  clearWorkspaceState: (keys?: AdminWorkspaceResetKey[]) => void;
  getLoginSuccessNotice: () => string;
  getLogoutNotice: () => string;
  loadActiveView: (view: AdminRouteKey) => void;
  persistSession: (session: AdminSessionPayload | null) => void;
  post: <T>(path: string, body: ApiRequestInit["body"]) => Promise<T>;
  readActiveView: () => AdminRouteKey;
  readForm: () => ApiRequestInit["body"];
  refreshProfile: () => Promise<void>;
  resolveErrorMessage: (error: unknown, fallbackMessage: string) => string;
  runners?: Partial<AdminWorkspaceActionAdapterRunners>;
  setActiveView: (view: AdminRouteKey) => void;
  setError: (message: string) => void;
  setLoading: (loading: boolean) => void;
  setNotice: (notice: string) => void;
  syncLocation: (view: AdminRouteKey, syncMode: AdminWorkspaceSyncMode) => void;
}

export function createAdminWorkspaceActionAdapter(options: CreateAdminWorkspaceActionAdapterOptions) {
  const runners: AdminWorkspaceActionAdapterRunners = {
    buildLogoutPlan: options.runners?.buildLogoutPlan ?? buildAdminWorkspaceLogoutPlan,
    buildRefreshPlan: options.runners?.buildRefreshPlan ?? buildAdminWorkspaceRefreshPlan,
    runLogin: options.runners?.runLogin ?? runAdminWorkspaceLogin,
    runLoginBootstrap: options.runners?.runLoginBootstrap ?? runAdminWorkspaceLoginBootstrap,
    runLogout: options.runners?.runLogout ?? runAdminWorkspaceLogout,
    runRefresh: options.runners?.runRefresh ?? runAdminWorkspaceRefresh
  };

  return {
    async login() {
      const activeView = options.readActiveView();
      const form = options.readForm();

      await runners.runLogin(activeView, {
        bootstrap: (view) =>
          runners.runLoginBootstrap(view, {
            authenticate: () => options.post<AdminSessionPayload>("/api/v1/admin/login", form),
            loadActiveView: options.loadActiveView,
            persistSession: options.persistSession,
            refreshProfile: options.refreshProfile
          }),
        clearError: options.clearError,
        clearSessionInvalidation: options.clearSessionInvalidation,
        fallbackMessage: "管理员登录失败",
        getSuccessNotice: options.getLoginSuccessNotice,
        resolveErrorMessage: options.resolveErrorMessage,
        setError: options.setError,
        setLoading: options.setLoading,
        setNotice: options.setNotice
      });
    },

    refreshActiveView() {
      runners.runRefresh(runners.buildRefreshPlan(options.readActiveView()), {
        loadActiveView: options.loadActiveView
      });
    },

    logout() {
      const plan = runners.buildLogoutPlan(options.getLogoutNotice());
      runners.runLogout(plan, {
        clearProfile: options.clearProfile,
        clearSessionInvalidation: options.clearSessionInvalidation,
        clearSessionState: options.clearSessionState,
        clearWorkspaceState: options.clearWorkspaceState,
        persistSession: options.persistSession,
        setActiveView: options.setActiveView,
        setNotice: options.setNotice,
        syncLocation: options.syncLocation
      });
    }
  };
}
