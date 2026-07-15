import { computed } from "vue";
import type { ApiRequestInit } from "@studymate/api-client";
import { adminGet, adminPost } from "../api/client";
import {
  persistSession,
  readSession as readStoredAdminSession,
  readSessionInvalidation as readStoredSessionInvalidation,
  subscribeSession
} from "../api/sessionStore";
import type { AdminAuthUser } from "../api/sessionStore";
import { createAdminWorkspaceConfirmAdapter } from "./adminWorkspaceConfirmAdapter";
import { createAdminWorkspaceFeatureAdapter } from "./adminWorkspaceFeatureAdapter";
import { createAdminWorkspaceInteractionAdapter } from "./adminWorkspaceInteractionAdapter";
import { getAdminRequestErrorMessage, getAdminRequestErrorStatus } from "./adminRequestError";
import type { AdminWorkspaceModerationItem } from "./adminWorkspaceDerivedData";
import { resolveAdminWorkspaceLocationView, syncAdminWorkspaceLocation } from "./adminWorkspaceLocation";
import {
  getAdminGovernanceLoadedNotice,
  getAdminLoginSuccessNotice,
  getAdminLogoutNotice,
  getAdminModerationLoadedNotice
} from "./adminWorkspaceNotice";
import { createAdminWorkspaceStateAdapter } from "./adminWorkspaceStateAdapter";
import { createAdminWorkspaceSurfaceAdapter } from "./adminWorkspaceSurfaceAdapter";

interface AdminWorkspacePageFeatureFactories {
  createConfirmAdapter: typeof createAdminWorkspaceConfirmAdapter;
  createFeatureAdapter: typeof createAdminWorkspaceFeatureAdapter;
  createInteractionAdapter: typeof createAdminWorkspaceInteractionAdapter;
  createStateAdapter: typeof createAdminWorkspaceStateAdapter;
  createSurfaceAdapter: typeof createAdminWorkspaceSurfaceAdapter;
}

export interface CreateAdminWorkspacePageFeatureOptions {
  initialNotice: string;
  runners?: Partial<AdminWorkspacePageFeatureFactories>;
}

export function createAdminWorkspacePageFeature<Overview>(
  options: CreateAdminWorkspacePageFeatureOptions
) {
  const factories: AdminWorkspacePageFeatureFactories = {
    createConfirmAdapter: options.runners?.createConfirmAdapter ?? createAdminWorkspaceConfirmAdapter,
    createFeatureAdapter: options.runners?.createFeatureAdapter ?? createAdminWorkspaceFeatureAdapter,
    createInteractionAdapter:
      options.runners?.createInteractionAdapter ?? createAdminWorkspaceInteractionAdapter,
    createStateAdapter: options.runners?.createStateAdapter ?? createAdminWorkspaceStateAdapter,
    createSurfaceAdapter: options.runners?.createSurfaceAdapter ?? createAdminWorkspaceSurfaceAdapter
  };

  const state = factories.createStateAdapter<Overview>({
    initialNotice: options.initialNotice,
    resolveLocationView: resolveAdminWorkspaceLocationView
  });

  const feature = factories.createFeatureAdapter<
    AdminAuthUser,
    Overview,
    AdminWorkspaceModerationItem
  >({
    action: {
      clearError: state.clearError,
      clearProfile: state.clearProfile,
      clearSessionInvalidation: state.clearSessionInvalidation,
      clearSessionState: state.clearSessionState,
      clearWorkspaceState: state.clearWorkspaceState,
      getLoginSuccessNotice: getAdminLoginSuccessNotice,
      getLogoutNotice: getAdminLogoutNotice,
      persistSession,
      post,
      readActiveView: () => state.activeView.value,
      readForm: () => state.form,
      resolveErrorMessage: getAdminRequestErrorMessage,
      setActiveView: state.setActiveView,
      setError: state.setError,
      setLoading: state.setLoading,
      setNotice: state.setNotice,
      syncLocation: (view, syncMode) => {
        syncAdminWorkspaceLocation(view, window.location, window.history, syncMode);
      }
    },
    mutation: {
      hasSession: () => Boolean(state.session.value),
      post,
      readActiveView: () => state.activeView.value,
      readStatus: getAdminRequestErrorStatus,
      resolveErrorMessage: getAdminRequestErrorMessage,
      setAITaskAction: state.setAITaskAction,
      setAITaskError: state.setAITaskError,
      setError: state.setError,
      setGovernanceStatus: state.setGovernanceStatus,
      setLoading: state.setLoading,
      setModerationAction: state.setModerationAction,
      setModerationConfirmError: state.setModerationConfirmError,
      setNotice: state.setNotice,
      setReportAction: state.setReportAction,
      setReportConfirmError: state.setReportConfirmError,
      setTemplateAction: state.setTemplateAction,
      setTemplateConfirmError: state.setTemplateConfirmError,
      setUserAction: state.setUserAction,
      setUserConfirmError: state.setUserConfirmError
    },
    read: {
      get,
      getGovernanceLoadedNotice: getAdminGovernanceLoadedNotice,
      getModerationLoadedNotice: getAdminModerationLoadedNotice,
      hasSession: () => Boolean(state.session.value),
      readGovernanceRows: () => state.governanceRows.value,
      readGovernanceRowsView: () => state.governanceRowsView.value,
      readStatus: getAdminRequestErrorStatus,
      resolveErrorMessage: getAdminRequestErrorMessage,
      setError: state.setError,
      setGovernanceRows: state.setGovernanceRows,
      setGovernanceRowsView: state.setGovernanceRowsView,
      setGovernanceSelectedRecord: state.setGovernanceSelectedRecord,
      setGovernanceStatus: state.setGovernanceStatus,
      setGovernanceSummary: state.setGovernanceSummary,
      setLoading: state.setLoading,
      setModerationItems: state.setModerationItems,
      setModerationStatus: state.setModerationStatus,
      setNotice: state.setNotice,
      setOverview: state.setOverview,
      setProfile: state.setProfile
    },
    runtime: {
      clearError: state.clearError,
      clearWorkspaceState: state.clearWorkspaceState,
      hasSession: () => Boolean(state.session.value),
      readSession: readStoredAdminSession,
      readSessionInvalidation: readStoredSessionInvalidation,
      setActiveView: state.setActiveView,
      setNotice: state.setNotice,
      setProfile: state.setProfile,
      setSession: state.setSession,
      setSessionInvalidation: state.setSessionInvalidation,
      subscribeSession,
      syncLocation: (view, syncMode) => {
        syncAdminWorkspaceLocation(view, window.location, window.history, syncMode);
      },
      window
    }
  });

  const confirm = factories.createConfirmAdapter({
    applyAITaskAction: feature.mutations.applyAITaskAction,
    applyModerationAction: feature.mutations.applyModerationAction,
    applyReportAction: feature.mutations.applyReportAction,
    applyTemplateAction: feature.mutations.applyTemplateAction,
    applyUserAction: feature.mutations.applyUserAction,
    readAITaskAction: () => state.pendingAITaskAction.value,
    readAITaskError: () => state.aiTaskConfirmError.value,
    readLoading: () => state.loading.value,
    readModerationAction: () => state.pendingModerationAction.value,
    readModerationError: () => state.moderationConfirmError.value,
    readReportAction: () => state.pendingReportAction.value,
    readReportError: () => state.reportConfirmError.value,
    readTemplateAction: () => state.pendingTemplateAction.value,
    readTemplateError: () => state.templateConfirmError.value,
    readUserAction: () => state.pendingUserAction.value,
    readUserError: () => state.userConfirmError.value,
    setAITaskAction: state.setAITaskAction,
    setAITaskError: state.setAITaskError,
    setModerationAction: state.setModerationAction,
    setModerationError: state.setModerationConfirmError,
    setReportAction: state.setReportAction,
    setReportError: state.setReportConfirmError,
    setTemplateAction: state.setTemplateAction,
    setTemplateError: state.setTemplateConfirmError,
    setUserAction: state.setUserAction,
    setUserError: state.setUserConfirmError
  });

  const interactions = factories.createInteractionAdapter({
    clearWorkspaceState: state.clearWorkspaceState,
    loadActiveView: feature.read.loadActiveView,
    setActiveView: state.setActiveView,
    setSelectedRecord: state.setSelectedRecord,
    syncLocation: (view, syncMode) => {
      syncAdminWorkspaceLocation(view, window.location, window.history, syncMode);
    }
  });

  const surface = computed(() =>
    factories.createSurfaceAdapter({
      activeView: state.activeView.value,
      errorMessage: state.errorMessage.value,
      formLogin: state.form.login,
      formPassword: state.form.password,
      governanceErrorStatus: state.governanceErrorStatus.value,
      governanceQuery: state.recordQuery.value,
      governanceRows: state.governanceRows.value,
      governanceStatusFilter: state.governanceStatusFilter.value,
      governanceSummary: state.governanceSummary.value,
      initialNotice: options.initialNotice,
      loading: state.loading.value,
      loggedIn: Boolean(state.session.value),
      moderationErrorStatus: state.moderationErrorStatus.value,
      moderationItems: state.moderationItems.value,
      moderationQuery: state.moderationQuery.value,
      moderationStatusFilter: state.moderationStatusFilter.value,
      notice: state.notice.value,
      overview: state.overview.value,
      profile: state.profile.value,
      requestGovernanceAction: feature.mutations.requestGovernanceAction,
      requestModerationAction: feature.mutations.requestModerationAction,
      selectedRecord: state.selectedRecord.value,
      sessionInvalidation: state.sessionInvalidation.value,
      setGovernanceQuery: state.setGovernanceQuery,
      setGovernanceStatusFilter: state.setGovernanceStatusFilter,
      setLoginValue: state.setLoginValue,
      setModerationQuery: state.setModerationQuery,
      setModerationStatusFilter: state.setModerationStatusFilter,
      setPasswordValue: state.setPasswordValue,
      workspaceActions: feature.actions,
      workspaceConfirm: confirm,
      workspaceInteractions: interactions
    })
  );

  state.initializeResetController(confirm.resetAll);

  return {
    startRuntime: feature.startRuntime,
    surface
  };

  async function get<T>(path: string, query?: { limit?: number }) {
    return adminGet<T>(path, state.session.value, query);
  }

  async function post<T>(path: string, body: ApiRequestInit["body"]) {
    return adminPost<T>(path, body, state.session.value);
  }
}
