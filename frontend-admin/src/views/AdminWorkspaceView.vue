<script setup lang="ts">
import "../components/admin/admin.css";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import type { ApiRequestInit } from "@studymate/api-client";
import { adminGet, adminPost } from "../api/client";
import {
  clearSessionInvalidation,
  persistSession,
  readSession as readStoredAdminSession,
  readSessionInvalidation as readStoredSessionInvalidation,
  subscribeSession
} from "../api/sessionStore";
import type { AdminAuthUser, AdminSessionPayload } from "../api/sessionStore";
import AdminConfirmStack from "../components/admin/AdminConfirmStack.vue";
import AdminLoginPanel from "../components/admin/AdminLoginPanel.vue";
import AdminShellFrame from "../components/admin/AdminShellFrame.vue";
import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import { type ConfirmDialogKey } from "./adminConfirmDialogState";
import { createAdminWorkspaceConfirmAdapter } from "./adminWorkspaceConfirmAdapter";
import { createAdminWorkspaceChromeAdapter } from "./adminWorkspaceChromeAdapter";
import { createAdminWorkspaceModuleAdapter } from "./adminWorkspaceModuleAdapter";
import { createAdminWorkspaceResetController } from "./adminWorkspaceResetController";
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
import {
  type AdminWorkspaceResetKey
} from "./adminWorkspaceState";
import { createAdminWorkspaceFeatureAdapter } from "./adminWorkspaceFeatureAdapter";
import AdminDashboardModule from "./modules/AdminDashboardModule.vue";
import AdminGovernanceModule from "./modules/AdminGovernanceModule.vue";
import AdminModerationModule from "./modules/AdminModerationModule.vue";

interface OverviewPayload {
  userCount: number;
  postCount: number;
  materialCount: number;
  graphCount: number;
  pendingModerationCount: number;
}

type AdminView = AdminRouteKey;
type ModerationAction = "approve" | "reject" | "hide";
type ReportAction = "resolve" | "dismiss";
type UserAction = "disable" | "activate";
type AITaskAction = "retry" | "cancel";
type TemplateAction = "publish" | "unpublish";
const initialAdminWorkspaceNotice = "\u767b\u5f55\u540e\u4f1a\u540c\u6b65\u5f53\u524d\u6cbb\u7406\u961f\u5217\u4e0e\u8fd0\u8425\u6570\u636e\u3002";

const form = reactive({ login: "", password: "" });
const session = ref<AdminSessionPayload | null>(readStoredAdminSession());
const sessionInvalidation = ref(readStoredSessionInvalidation());
const profile = ref<AdminAuthUser | null>(session.value?.user ?? null);
const moderationItems = ref<AdminWorkspaceModerationItem[]>([]);
const overview = ref<OverviewPayload | null>(null);
const governanceRows = ref<GovernanceRecord[]>([]);
const governanceSummary = ref<GovernanceRecord | null>(null);
const governanceRowsView = ref<Exclude<AdminView, "dashboard" | "moderation"> | null>(null);
const selectedRecord = ref<GovernanceRecord | null>(null);
const loading = ref(false);
const errorMessage = ref("");
const moderationErrorStatus = ref<number | null>(null);
const governanceErrorStatus = ref<number | null>(null);
const notice = ref(initialAdminWorkspaceNotice);
const activeView = ref<AdminView>(
  resolveAdminWorkspaceLocationView(typeof window === "undefined" ? null : window.location)
);
const recordQuery = ref("");
const moderationQuery = ref("");
const moderationStatusFilter = ref("all");
const governanceStatusFilter = ref("all");
const pendingModerationAction = ref<{ action: ModerationAction; item: AdminWorkspaceModerationItem } | null>(null);
const moderationConfirmError = ref("");
const pendingReportAction = ref<{ action: ReportAction; record: GovernanceRecord } | null>(null);
const reportConfirmError = ref("");
const pendingUserAction = ref<{ action: UserAction; record: GovernanceRecord } | null>(null);
const userConfirmError = ref("");
const pendingAITaskAction = ref<{ action: AITaskAction; record: GovernanceRecord } | null>(null);
const aiTaskConfirmError = ref("");
const pendingTemplateAction = ref<{ action: TemplateAction; record: GovernanceRecord } | null>(null);
const templateConfirmError = ref("");
let workspaceResetController: ReturnType<typeof createAdminWorkspaceResetController> | null = null;
const clearWorkspaceState = (keys?: AdminWorkspaceResetKey[]) => {
  workspaceResetController?.clearState(keys);
};
const workspaceFeature = createAdminWorkspaceFeatureAdapter<
  AdminAuthUser,
  OverviewPayload,
  AdminWorkspaceModerationItem
>({
  action: {
    clearError: () => {
      errorMessage.value = "";
    },
    clearProfile: () => {
      profile.value = null;
    },
    clearSessionInvalidation: () => {
      sessionInvalidation.value = null;
      clearSessionInvalidation();
    },
    clearSessionState: () => {
      session.value = null;
    },
    clearWorkspaceState,
    getLoginSuccessNotice: getAdminLoginSuccessNotice,
    getLogoutNotice: getAdminLogoutNotice,
    persistSession,
    post,
    readActiveView: () => activeView.value,
    readForm: () => form,
    resolveErrorMessage: getAdminRequestErrorMessage,
    setActiveView: (view) => {
      activeView.value = view;
    },
    setError: (message) => {
      errorMessage.value = message;
    },
    setLoading: (nextLoading) => {
      loading.value = nextLoading;
    },
    setNotice: (nextNotice) => {
      notice.value = nextNotice;
    },
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
    setAITaskAction: (value) => {
      pendingAITaskAction.value = value;
    },
    setAITaskError: (value) => {
      aiTaskConfirmError.value = value;
    },
    setError: (message) => {
      errorMessage.value = message;
    },
    setGovernanceStatus: (status) => {
      governanceErrorStatus.value = status;
    },
    setLoading: (nextLoading) => {
      loading.value = nextLoading;
    },
    setModerationAction: (value) => {
      pendingModerationAction.value = value;
    },
    setModerationConfirmError: (value) => {
      moderationConfirmError.value = value;
    },
    setNotice: (nextNotice) => {
      notice.value = nextNotice;
    },
    setReportAction: (value) => {
      pendingReportAction.value = value;
    },
    setReportConfirmError: (value) => {
      reportConfirmError.value = value;
    },
    setTemplateAction: (value) => {
      pendingTemplateAction.value = value;
    },
    setTemplateConfirmError: (value) => {
      templateConfirmError.value = value;
    },
    setUserAction: (value) => {
      pendingUserAction.value = value;
    },
    setUserConfirmError: (value) => {
      userConfirmError.value = value;
    }
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
    setError: (message) => {
      errorMessage.value = message;
    },
    setGovernanceRows: (rows) => {
      governanceRows.value = rows;
    },
    setGovernanceRowsView: (view) => {
      governanceRowsView.value = view;
    },
    setGovernanceSelectedRecord: (record) => {
      selectedRecord.value = record;
    },
    setGovernanceStatus: (status) => {
      governanceErrorStatus.value = status;
    },
    setGovernanceSummary: (summary) => {
      governanceSummary.value = summary;
    },
    setLoading: (nextLoading) => {
      loading.value = nextLoading;
    },
    setModerationItems: (items) => {
      moderationItems.value = items;
    },
    setModerationStatus: (status) => {
      moderationErrorStatus.value = status;
    },
    setNotice: (nextNotice) => {
      notice.value = nextNotice;
    },
    setOverview: (nextOverview) => {
      overview.value = nextOverview;
    },
    setProfile: (nextProfile) => {
      profile.value = nextProfile;
    }
  },
  runtime: {
    clearError: () => {
      errorMessage.value = "";
    },
    clearWorkspaceState,
    hasSession: () => Boolean(session.value),
    readSession: readStoredAdminSession,
    readSessionInvalidation: readStoredSessionInvalidation,
    setActiveView: (view) => {
      activeView.value = view;
    },
    setNotice: (nextNotice) => {
      notice.value = nextNotice;
    },
    setProfile: (nextProfile) => {
      profile.value = nextProfile;
    },
    setSession: (nextValue) => {
      session.value = nextValue;
    },
    setSessionInvalidation: (nextValue) => {
      sessionInvalidation.value = nextValue;
    },
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

const loggedIn = computed(() => Boolean(session.value));
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
  setAITaskAction: (value) => {
    pendingAITaskAction.value = value;
  },
  setAITaskError: (value) => {
    aiTaskConfirmError.value = value;
  },
  setModerationAction: (value) => {
    pendingModerationAction.value = value;
  },
  setModerationError: (value) => {
    moderationConfirmError.value = value;
  },
  setReportAction: (value) => {
    pendingReportAction.value = value;
  },
  setReportError: (value) => {
    reportConfirmError.value = value;
  },
  setTemplateAction: (value) => {
    pendingTemplateAction.value = value;
  },
  setTemplateError: (value) => {
    templateConfirmError.value = value;
  },
  setUserAction: (value) => {
    pendingUserAction.value = value;
  },
  setUserError: (value) => {
    userConfirmError.value = value;
  }
});
const confirmDialogs = computed(() => workspaceConfirm.buildDialogs());
const workspaceInteractions = createAdminWorkspaceInteractionAdapter({
  clearWorkspaceState,
  loadActiveView: workspaceRead.loadActiveView,
  setActiveView: (view) => {
    activeView.value = view;
  },
  setSelectedRecord: (record) => {
    selectedRecord.value = record;
  },
  syncLocation: (view, syncMode) => {
    syncAdminWorkspaceLocation(view, window.location, window.history, syncMode);
  }
});
const chromeBindings = computed(() =>
  createAdminWorkspaceChromeAdapter({
    activeView: activeView.value,
    errorMessage: errorMessage.value,
    formLogin: form.login,
    formPassword: form.password,
    governanceRowCount: governanceRows.value.length,
    initialNotice: initialAdminWorkspaceNotice,
    loading: loading.value,
    loggedIn: loggedIn.value,
    moderationItemCount: moderationItems.value.length,
    notice: notice.value,
    onLogin: () => workspaceActions.login(),
    onLogout: () => workspaceActions.logout(),
    onRefreshActiveView: () => workspaceActions.refreshActiveView(),
    onSwitchView: workspaceInteractions.switchView,
    profile: profile.value,
    sessionInvalidation: sessionInvalidation.value,
    setLoginValue: (value: string) => {
      form.login = value;
    },
    setPasswordValue: (value: string) => {
      form.password = value;
    }
  })
);
const loginPanelProps = computed(() => chromeBindings.value.loginPanelProps);
const loginPanelEvents = computed(() => chromeBindings.value.loginPanelEvents);
const shellProps = computed(() => chromeBindings.value.shellProps);
const shellEvents = computed(() => chromeBindings.value.shellEvents);
const moduleBindings = computed(() =>
  createAdminWorkspaceModuleAdapter({
    activeLabel: shellProps.value.activeTitle,
    activeView: activeView.value,
    errorMessage: errorMessage.value,
    governanceErrorStatus: governanceErrorStatus.value,
    governanceQuery: recordQuery.value,
    governanceRows: governanceRows.value,
    governanceStatusFilter: governanceStatusFilter.value,
    governanceSummary: governanceSummary.value,
    loading: loading.value,
    moderationErrorStatus: moderationErrorStatus.value,
    moderationItems: moderationItems.value,
    moderationQuery: moderationQuery.value,
    moderationStatusFilter: moderationStatusFilter.value,
    overview: overview.value,
    requestGovernanceAction: workspaceMutations.requestGovernanceAction,
    requestModerationAction: workspaceMutations.requestModerationAction,
    selectedRecord: selectedRecord.value,
    selectRecord: workspaceInteractions.selectRecord,
    setGovernanceQuery: (value: string) => {
      recordQuery.value = value;
    },
    setGovernanceStatusFilter: (value: string) => {
      governanceStatusFilter.value = value;
    },
    setModerationQuery: (value: string) => {
      moderationQuery.value = value;
    },
    setModerationStatusFilter: (value: string) => {
      moderationStatusFilter.value = value;
    },
    switchView: workspaceInteractions.switchView
  })
);
const moduleProps = computed(() => moduleBindings.value.moduleProps);
const moduleEvents = computed(() => moduleBindings.value.moduleEvents);

workspaceResetController = createAdminWorkspaceResetController({
  governanceRows,
  governanceRowsView,
  governanceStatusFilter,
  governanceSummary,
  moderationItems,
  moderationQuery,
  moderationStatusFilter,
  overview,
  recordQuery,
  resetConfirmState: workspaceConfirm.resetAll,
  selectedRecord
});

let stopRuntime: (() => void) | null = null;

onMounted(() => {
  stopRuntime = workspaceFeature.startRuntime();
});

onBeforeUnmount(() => {
  stopRuntime?.();
  stopRuntime = null;
});

function handleConfirmDialogCancel(key: ConfirmDialogKey) {
  workspaceConfirm.cancelDialog(key);
}

async function handleConfirmDialogConfirm(key: ConfirmDialogKey) {
  await workspaceConfirm.confirmDialog(key);
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
      <AdminDashboardModule
        v-if="activeView === 'dashboard'"
        :moderation-items-count="moduleProps.dashboard.moderationItemsCount"
        :overview-cards="moduleProps.dashboard.overviewCards"
        :pending-materials-count="moduleProps.dashboard.pendingMaterialsCount"
        :pending-posts-count="moduleProps.dashboard.pendingPostsCount"
        @open-moderation="moduleEvents.dashboard.openModeration()"
      />

      <AdminModerationModule
        v-else-if="activeView === 'moderation'"
        :data-state="moduleProps.moderation.dataState"
        :items="moduleProps.moderation.items"
        :query="moduleProps.moderation.query"
        :status-filter="moduleProps.moderation.statusFilter"
        :status-options="moduleProps.moderation.statusOptions"
        :total-count="moduleProps.moderation.totalCount"
        @request-action="moduleEvents.moderation.requestAction($event)"
        @update:query="moduleEvents.moderation.updateQuery($event)"
        @update:status-filter="moduleEvents.moderation.updateStatusFilter($event)"
      />

      <AdminGovernanceModule
        v-else
        :actions="moduleProps.governance.actions"
        :columns="moduleProps.governance.columns"
        :data-state="moduleProps.governance.dataState"
        :empty-text="moduleProps.governance.emptyText"
        :query="moduleProps.governance.query"
        :rows="moduleProps.governance.rows"
        :selected-record="moduleProps.governance.selectedRecord"
        :status-filter="moduleProps.governance.statusFilter"
        :status-options="moduleProps.governance.statusOptions"
        :summary="moduleProps.governance.summary"
        :total-count="moduleProps.governance.totalCount"
        @request-action="moduleEvents.governance.requestAction($event)"
        @select-record="moduleEvents.governance.selectRecord($event)"
        @update:query="moduleEvents.governance.updateQuery($event)"
        @update:status-filter="moduleEvents.governance.updateStatusFilter($event)"
      />
    </AdminShellFrame>
  </main>
</template>
