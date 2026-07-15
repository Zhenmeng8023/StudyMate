<script setup lang="ts">
import "../components/admin/admin.css";
import { computed, onBeforeUnmount, onMounted } from "vue";
import type { ApiRequestInit } from "@studymate/api-client";
import { adminGet, adminPost } from "../api/client";
import {
  persistSession,
  readSession as readStoredAdminSession,
  readSessionInvalidation as readStoredSessionInvalidation,
  subscribeSession
} from "../api/sessionStore";
import type { AdminAuthUser } from "../api/sessionStore";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import AdminWorkspacePageSurface from "./AdminWorkspacePageSurface.vue";
import { createAdminWorkspaceConfirmAdapter } from "./adminWorkspaceConfirmAdapter";
import { createAdminWorkspaceInteractionAdapter } from "./adminWorkspaceInteractionAdapter";
import { getAdminRequestErrorMessage, getAdminRequestErrorStatus } from "./adminRequestError";
import {
  type AdminWorkspaceModerationItem
} from "./adminWorkspaceDerivedData";
import { resolveAdminWorkspaceLocationView, syncAdminWorkspaceLocation } from "./adminWorkspaceLocation";
import {
  getAdminGovernanceLoadedNotice,
  getAdminLoginSuccessNotice,
  getAdminLogoutNotice,
  getAdminModerationLoadedNotice,
} from "./adminWorkspaceNotice";
import { createAdminWorkspaceSurfaceAdapter } from "./adminWorkspaceSurfaceAdapter";
import { createAdminWorkspaceStateAdapter } from "./adminWorkspaceStateAdapter";
import { createAdminWorkspaceFeatureAdapter } from "./adminWorkspaceFeatureAdapter";

interface OverviewPayload {
  userCount: number;
  postCount: number;
  materialCount: number;
  graphCount: number;
  pendingModerationCount: number;
}

const initialAdminWorkspaceNotice = "\u767b\u5f55\u540e\u4f1a\u540c\u6b65\u5f53\u524d\u6cbb\u7406\u961f\u5217\u4e0e\u8fd0\u8425\u6570\u636e\u3002";

const workspaceState = createAdminWorkspaceStateAdapter<OverviewPayload>({
  initialNotice: initialAdminWorkspaceNotice,
  resolveLocationView: resolveAdminWorkspaceLocationView
});
const {
  activeView,
  aiTaskConfirmError,
  clearError,
  clearProfile,
  clearSessionInvalidation: clearAdminSessionInvalidation,
  clearSessionState,
  clearWorkspaceState,
  errorMessage,
  form,
  governanceErrorStatus,
  governanceRows,
  governanceRowsView,
  governanceStatusFilter,
  governanceSummary,
  loading,
  moderationConfirmError,
  moderationErrorStatus,
  moderationItems,
  moderationQuery,
  moderationStatusFilter,
  notice,
  overview,
  pendingAITaskAction,
  pendingModerationAction,
  pendingReportAction,
  pendingTemplateAction,
  pendingUserAction,
  profile,
  recordQuery,
  reportConfirmError,
  selectedRecord,
  session,
  sessionInvalidation,
  setAITaskAction,
  setAITaskError,
  setActiveView,
  setError,
  setGovernanceQuery,
  setGovernanceRows,
  setGovernanceRowsView,
  setGovernanceSelectedRecord,
  setGovernanceStatus,
  setGovernanceStatusFilter,
  setGovernanceSummary,
  setLoading,
  setLoginValue,
  setModerationAction,
  setModerationConfirmError,
  setModerationItems,
  setModerationQuery,
  setModerationStatus,
  setModerationStatusFilter,
  setNotice,
  setOverview,
  setPasswordValue,
  setProfile,
  setReportAction,
  setReportConfirmError,
  setSelectedRecord,
  setSession,
  setSessionInvalidation,
  setTemplateAction,
  setTemplateConfirmError,
  setUserAction,
  setUserConfirmError,
  templateConfirmError,
  userConfirmError
} = workspaceState;

const workspaceFeature = createAdminWorkspaceFeatureAdapter<
  AdminAuthUser,
  OverviewPayload,
  AdminWorkspaceModerationItem
>({
  action: {
    clearError,
    clearProfile,
    clearSessionInvalidation: clearAdminSessionInvalidation,
    clearSessionState,
    clearWorkspaceState,
    getLoginSuccessNotice: getAdminLoginSuccessNotice,
    getLogoutNotice: getAdminLogoutNotice,
    persistSession,
    post,
    readActiveView: () => activeView.value,
    readForm: () => form,
    resolveErrorMessage: getAdminRequestErrorMessage,
    setActiveView,
    setError,
    setLoading,
    setNotice,
    syncLocation: (view, syncMode) => {
      syncAdminWorkspaceLocation(view, window.location, window.history, syncMode);
    }
  },
  mutation: {
    hasSession: () => Boolean(session.value),
    post,
    readActiveView: () => activeView.value,
    readStatus: getAdminRequestErrorStatus,
    resolveErrorMessage: getAdminRequestErrorMessage,
    setAITaskAction,
    setAITaskError,
    setError,
    setGovernanceStatus,
    setLoading,
    setModerationAction,
    setModerationConfirmError,
    setNotice,
    setReportAction,
    setReportConfirmError,
    setTemplateAction,
    setTemplateConfirmError,
    setUserAction,
    setUserConfirmError
  },
  read: {
    get,
    getGovernanceLoadedNotice: getAdminGovernanceLoadedNotice,
    getModerationLoadedNotice: getAdminModerationLoadedNotice,
    hasSession: () => Boolean(session.value),
    readGovernanceRows: () => governanceRows.value,
    readGovernanceRowsView: () => governanceRowsView.value,
    readStatus: getAdminRequestErrorStatus,
    resolveErrorMessage: getAdminRequestErrorMessage,
    setError,
    setGovernanceRows,
    setGovernanceRowsView,
    setGovernanceSelectedRecord,
    setGovernanceStatus,
    setGovernanceSummary,
    setLoading,
    setModerationItems,
    setModerationStatus,
    setNotice,
    setOverview,
    setProfile
  },
  runtime: {
    clearError,
    clearWorkspaceState,
    hasSession: () => Boolean(session.value),
    readSession: readStoredAdminSession,
    readSessionInvalidation: readStoredSessionInvalidation,
    setActiveView,
    setNotice,
    setProfile,
    setSession,
    setSessionInvalidation,
    subscribeSession,
    syncLocation: (view, syncMode) => {
      syncAdminWorkspaceLocation(view, window.location, window.history, syncMode);
    },
    window
  }
});
const workspaceRead = workspaceFeature.read;
const workspaceMutations = workspaceFeature.mutations;
const workspaceActions = workspaceFeature.actions;

const workspaceConfirm = createAdminWorkspaceConfirmAdapter({
  applyAITaskAction: workspaceMutations.applyAITaskAction,
  applyModerationAction: workspaceMutations.applyModerationAction,
  applyReportAction: workspaceMutations.applyReportAction,
  applyTemplateAction: workspaceMutations.applyTemplateAction,
  applyUserAction: workspaceMutations.applyUserAction,
  readAITaskAction: () => pendingAITaskAction.value,
  readAITaskError: () => aiTaskConfirmError.value,
  readLoading: () => loading.value,
  readModerationAction: () => pendingModerationAction.value,
  readModerationError: () => moderationConfirmError.value,
  readReportAction: () => pendingReportAction.value,
  readReportError: () => reportConfirmError.value,
  readTemplateAction: () => pendingTemplateAction.value,
  readTemplateError: () => templateConfirmError.value,
  readUserAction: () => pendingUserAction.value,
  readUserError: () => userConfirmError.value,
  setAITaskAction,
  setAITaskError,
  setModerationAction,
  setModerationError: setModerationConfirmError,
  setReportAction,
  setReportError: setReportConfirmError,
  setTemplateAction,
  setTemplateError: setTemplateConfirmError,
  setUserAction,
  setUserError: setUserConfirmError
});
const workspaceInteractions = createAdminWorkspaceInteractionAdapter({
  clearWorkspaceState,
  loadActiveView: workspaceRead.loadActiveView,
  setActiveView,
  setSelectedRecord,
  syncLocation: (view, syncMode) => {
    syncAdminWorkspaceLocation(view, window.location, window.history, syncMode);
  }
});
const workspaceSurface = computed(() =>
  createAdminWorkspaceSurfaceAdapter({
    activeView: activeView.value,
    errorMessage: errorMessage.value,
    formLogin: form.login,
    formPassword: form.password,
    governanceErrorStatus: governanceErrorStatus.value,
    governanceQuery: recordQuery.value,
    governanceRows: governanceRows.value,
    governanceStatusFilter: governanceStatusFilter.value,
    governanceSummary: governanceSummary.value,
    initialNotice: initialAdminWorkspaceNotice,
    loading: loading.value,
    loggedIn: Boolean(session.value),
    moderationErrorStatus: moderationErrorStatus.value,
    moderationItems: moderationItems.value,
    moderationQuery: moderationQuery.value,
    moderationStatusFilter: moderationStatusFilter.value,
    notice: notice.value,
    overview: overview.value,
    profile: profile.value,
    requestGovernanceAction: workspaceMutations.requestGovernanceAction,
    requestModerationAction: workspaceMutations.requestModerationAction,
    selectedRecord: selectedRecord.value,
    sessionInvalidation: sessionInvalidation.value,
    setGovernanceQuery,
    setGovernanceStatusFilter,
    setLoginValue,
    setModerationQuery,
    setModerationStatusFilter,
    setPasswordValue,
    workspaceActions,
    workspaceConfirm,
    workspaceInteractions
  })
);

workspaceState.initializeResetController(workspaceConfirm.resetAll);

let stopRuntime: (() => void) | null = null;

onMounted(() => {
  stopRuntime = workspaceFeature.startRuntime();
});

onBeforeUnmount(() => {
  stopRuntime?.();
  stopRuntime = null;
});


async function get<T>(path: string, query?: { limit?: number }) {
  return adminGet<T>(path, session.value, query);
}

async function post<T>(path: string, body: ApiRequestInit["body"]) {
  return adminPost<T>(path, body, session.value);
}

</script>

<template>
  <AdminWorkspacePageSurface :surface="workspaceSurface" />
</template>
