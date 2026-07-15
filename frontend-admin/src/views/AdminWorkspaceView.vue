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
import AdminConfirmStack from "../components/admin/AdminConfirmStack.vue";
import AdminLoginPanel from "../components/admin/AdminLoginPanel.vue";
import AdminShellFrame from "../components/admin/AdminShellFrame.vue";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import { type ConfirmDialogKey } from "./adminConfirmDialogState";
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
import AdminWorkspaceModuleHost from "./modules/AdminWorkspaceModuleHost.vue";

interface OverviewPayload {
  userCount: number;
  postCount: number;
  materialCount: number;
  graphCount: number;
  pendingModerationCount: number;
}

type AdminView = AdminRouteKey;
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
const confirmDialogs = computed(() => workspaceSurface.value.confirmDialogs);
const loggedIn = computed(() => workspaceSurface.value.loggedIn);
const loginPanelProps = computed(() => workspaceSurface.value.loginPanelProps);
const loginPanelEvents = computed(() => workspaceSurface.value.loginPanelEvents);
const shellProps = computed(() => workspaceSurface.value.shellProps);
const shellEvents = computed(() => workspaceSurface.value.shellEvents);
const moduleProps = computed(() => workspaceSurface.value.moduleProps);
const moduleEvents = computed(() => workspaceSurface.value.moduleEvents);

workspaceState.initializeResetController(workspaceConfirm.resetAll);

let stopRuntime: (() => void) | null = null;

onMounted(() => {
  stopRuntime = workspaceFeature.startRuntime();
});

onBeforeUnmount(() => {
  stopRuntime?.();
  stopRuntime = null;
});

function handleConfirmDialogCancel(key: ConfirmDialogKey) {
  workspaceSurface.value.cancelConfirmDialog(key);
}

async function handleConfirmDialogConfirm(key: ConfirmDialogKey) {
  await workspaceSurface.value.confirmConfirmDialog(key);
}


async function get<T>(path: string, query?: { limit?: number }) {
  return adminGet<T>(path, session.value, query);
}

async function post<T>(path: string, body: ApiRequestInit["body"]) {
  return adminPost<T>(path, body, session.value);
}

</script>

<template>
  <main>
    <AdminConfirmStack
      :dialogs="confirmDialogs"
      @cancel="handleConfirmDialogCancel($event as ConfirmDialogKey)"
      @confirm="handleConfirmDialogConfirm($event as ConfirmDialogKey)"
    />

    <AdminLoginPanel
      v-if="!loggedIn"
      :error-message="loginPanelProps.errorMessage"
      :loading="loginPanelProps.loading"
      :notice="loginPanelProps.notice"
      :login-prompt="loginPanelProps.loginPrompt"
      :login-value="loginPanelProps.loginValue"
      :password-value="loginPanelProps.passwordValue"
      @submit="loginPanelEvents.submit()"
      @update:login-value="loginPanelEvents.updateLoginValue($event)"
      @update:password-value="loginPanelEvents.updatePasswordValue($event)"
    />

    <AdminShellFrame
      v-else
      :active-description="shellProps.activeDescription"
      :active-group="shellProps.activeGroup"
      :active-title="shellProps.activeTitle"
      :active-view="shellProps.activeView"
      :count-label="shellProps.countLabel"
      :error-message="shellProps.errorMessage"
      :loading="shellProps.loading"
      :nav-groups="shellProps.navGroups"
      :notice="shellProps.notice"
      :profile="shellProps.profile"
      :profile-initial="shellProps.profileInitial"
      @logout="shellEvents.logout()"
      @refresh="shellEvents.refresh()"
      @switch-view="shellEvents.switchView($event as AdminView)"
    >
      <AdminWorkspaceModuleHost
        :active-view="activeView"
        :module-events="moduleEvents"
        :module-props="moduleProps"
      />
    </AdminShellFrame>
  </main>
</template>
