<script setup lang="ts">
import "../components/admin/admin.css";
import { computed, onBeforeUnmount, onMounted, reactive, ref, type Ref } from "vue";
import type { ApiRequestInit } from "@studymate/api-client";
import { getSessionInvalidationPrompt } from "@studymate/api-client";
import { adminGet, adminPost } from "../api/client";
import type { AdminDataStatePayload } from "../components/admin/dataState";
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
import { getGovernanceColumns, type GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";
import { runAdminConfirmDialogHandler, type ConfirmDialogKey } from "./adminConfirmDialogState";
import { createAdminWorkspaceConfirmController } from "./adminWorkspaceConfirmController";
import { createAdminWorkspaceResetController } from "./adminWorkspaceResetController";
import { buildAdminWorkspaceLoginPanelEvents } from "./adminWorkspaceLoginPanelEvents";
import { buildAdminWorkspaceLoginPanelProps } from "./adminWorkspaceLoginPanelProps";
import { buildAdminWorkspaceModuleEvents } from "./adminWorkspaceModuleEvents";
import { buildAdminWorkspaceModuleProps } from "./adminWorkspaceModuleProps";
import { buildAdminWorkspaceShellEvents } from "./adminWorkspaceShellEvents";
import { buildAdminWorkspaceShellProps } from "./adminWorkspaceShellProps";
import {
  buildAdminNavItems,
  getAdminActiveCountLabel,
  getAdminViewDescription,
  groupAdminNavItems,
  type AdminNavItem
} from "./adminViewMeta";
import { buildAdminOverviewCards } from "./adminOverviewCards";
import { resolveGovernanceDataState, resolveModerationDataState } from "./adminViewDataState";
import { getAdminRequestErrorMessage, getAdminRequestErrorStatus } from "./adminRequestError";
import { createAdminWorkspaceActionAdapter } from "./adminWorkspaceActionAdapter";
import {
  runAdminWorkspaceGovernanceAction,
  runAdminWorkspaceModerationAction
} from "./adminWorkspaceMutationState";
import {
  requestAdminWorkspaceGovernanceAction,
  requestAdminWorkspaceModerationAction
} from "./adminWorkspacePendingAction";
import {
  buildGovernanceStatusOptions,
  buildModerationStatusOptions,
  filterGovernanceRows,
  filterModerationItems,
  splitModerationItems,
  type AdminWorkspaceModerationItem
} from "./adminWorkspaceDerivedData";
import { resolveAdminWorkspaceLocationView, syncAdminWorkspaceLocation } from "./adminWorkspaceLocation";
import { buildAdminWorkspaceViewSwitchPlan } from "./adminWorkspaceLifecycle";
import { runAdminWorkspaceViewSwitch } from "./adminWorkspaceViewSwitch";
import {
  getAdminGovernanceLoadedNotice,
  getAdminLoginSuccessNotice,
  getAdminLogoutNotice,
  getAdminModerationLoadedNotice,
} from "./adminWorkspaceNotice";
import {
  type AdminWorkspaceResetKey
} from "./adminWorkspaceState";
import {
  getGovernanceModuleConfig,
} from "./adminGovernanceConfig";
import type { GovernanceMutationKey } from "./adminGovernanceMutationMeta";
import { createAdminWorkspaceReadAdapter } from "./adminWorkspaceReadAdapter";
import { startAdminWorkspaceRuntime } from "./adminWorkspaceRuntime";
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

const loggedIn = computed(() => Boolean(session.value));
const moderationBuckets = computed(() => splitModerationItems(moderationItems.value));
const pendingPosts = computed(() => moderationBuckets.value.pendingPosts);
const pendingMaterials = computed(() => moderationBuckets.value.pendingMaterials);
const profileInitial = computed(() => profile.value?.displayName?.trim().slice(0, 1) || "A");
const confirmController = createAdminWorkspaceConfirmController({
  applyAITaskAction,
  applyModerationAction,
  applyReportAction,
  applyTemplateAction,
  applyUserAction,
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
const confirmDialogs = computed(() => confirmController.buildDialogs());

const navItems = computed<AdminNavItem[]>(() => buildAdminNavItems(moderationItems.value.length));
const navGroups = computed(() => groupAdminNavItems(navItems.value));
const activeMeta = computed(() => navItems.value.find((item) => item.key === activeView.value) ?? navItems.value[0]);
const loginPrompt = computed(() => getSessionInvalidationPrompt(sessionInvalidation.value, "admin"));
const loginNotice = computed(() => {
  if (loggedIn.value || loginPrompt.value || notice.value === initialAdminWorkspaceNotice) {
    return "";
  }
  return notice.value;
});
const loginPanelProps = computed(() =>
  buildAdminWorkspaceLoginPanelProps({
    errorMessage: errorMessage.value,
    loading: loading.value,
    loginPrompt: loginPrompt.value,
    loginValue: form.login,
    notice: loginNotice.value,
    passwordValue: form.password
  })
);
const loginPanelEvents = computed(() =>
  buildAdminWorkspaceLoginPanelEvents({
    login: () => workspaceActions.login(),
    setLoginValue: (value) => {
      form.login = value;
    },
    setPasswordValue: (value) => {
      form.password = value;
    }
  })
);
const activeDescription = computed(() => getAdminViewDescription(activeView.value, getGovernanceModuleConfig(activeView.value)?.description ?? ""));
const activeCountLabel = computed(() =>
  getAdminActiveCountLabel(activeView.value, moderationItems.value.length, governanceRows.value.length)
);
const shellProps = computed(() =>
  buildAdminWorkspaceShellProps({
    activeDescription: activeDescription.value,
    activeGroup: activeMeta.value.group,
    activeTitle: activeMeta.value.label,
    activeView: activeView.value,
    countLabel: activeCountLabel.value,
    errorMessage: errorMessage.value,
    loading: loading.value,
    navGroups: navGroups.value,
    notice: notice.value,
    profile: profile.value,
    profileInitial: profileInitial.value
  })
);
const shellEvents = computed(() =>
  buildAdminWorkspaceShellEvents({
    logout: () => workspaceActions.logout(),
    refreshActiveView: () => workspaceActions.refreshActiveView(),
    switchView
  })
);
const moderationDataState = computed<AdminDataStatePayload | null>(() =>
  resolveModerationDataState({
    errorMessage: errorMessage.value,
    errorStatus: moderationErrorStatus.value,
    loading: loading.value,
    rowCount: moderationItems.value.length
  })
);
const governanceDataState = computed<AdminDataStatePayload | null>(() => {
  if (activeView.value === "dashboard" || activeView.value === "moderation") return null;
  return resolveGovernanceDataState({
    activeLabel: activeMeta.value.label,
    errorMessage: errorMessage.value,
    errorStatus: governanceErrorStatus.value,
    loading: loading.value,
    rowCount: governanceRows.value.length
  });
});
const overviewCards = computed(() =>
  buildAdminOverviewCards({
    moderationItemsCount: moderationItems.value.length,
    overview: overview.value
  })
);
const moduleProps = computed(() =>
  buildAdminWorkspaceModuleProps({
    activeView: activeView.value,
    governance: {
      dataState: governanceDataState.value,
      query: recordQuery.value,
      rows: visibleGovernanceRows.value,
      selectedRecord: selectedRecord.value,
      statusFilter: governanceStatusFilter.value,
      statusOptions: governanceStatusOptions.value,
      summary: governanceSummary.value,
      totalCount: governanceRows.value.length
    },
    governanceColumns: governanceColumns.value,
    moderation: {
      dataState: moderationDataState.value,
      items: visibleModerationItems.value,
      query: moderationQuery.value,
      statusFilter: moderationStatusFilter.value,
      statusOptions: moderationStatusOptions.value,
      totalCount: moderationItems.value.length
    },
    overviewCards: overviewCards.value,
    pendingMaterialsCount: pendingMaterials.value.length,
    pendingPostsCount: pendingPosts.value.length,
    totalModerationCount: moderationItems.value.length
  })
);
const moduleEvents = computed(() =>
  buildAdminWorkspaceModuleEvents({
    requestGovernanceAction,
    requestModerationAction,
    selectRecord,
    setGovernanceQuery: (value) => {
      recordQuery.value = value;
    },
    setGovernanceStatusFilter: (value) => {
      governanceStatusFilter.value = value;
    },
    setModerationQuery: (value) => {
      moderationQuery.value = value;
    },
    setModerationStatusFilter: (value) => {
      moderationStatusFilter.value = value;
    },
    switchView
  })
);

const visibleModerationItems = computed(() => filterModerationItems(moderationItems.value, moderationQuery.value, moderationStatusFilter.value));
const moderationStatusOptions = computed(() => buildModerationStatusOptions(moderationItems.value));
const visibleGovernanceRows = computed(() => filterGovernanceRows(governanceRows.value, recordQuery.value, governanceStatusFilter.value));
const governanceStatusOptions = computed(() => buildGovernanceStatusOptions(governanceRows.value));
const governanceColumns = computed(() => getGovernanceColumns(governanceRows.value));

const confirmResetHandlers = confirmController.resetHandlers;
const confirmSubmitHandlers = confirmController.submitHandlers;
const workspaceResetController = createAdminWorkspaceResetController({
  governanceRows,
  governanceRowsView,
  governanceStatusFilter,
  governanceSummary,
  moderationItems,
  moderationQuery,
  moderationStatusFilter,
  overview,
  recordQuery,
  resetConfirmState: confirmController.resetAll,
  selectedRecord
});

const clearWorkspaceState = (keys?: AdminWorkspaceResetKey[]) => workspaceResetController.clearState(keys);
const workspaceRead = createAdminWorkspaceReadAdapter<
  AdminAuthUser,
  OverviewPayload,
  AdminWorkspaceModerationItem
>({
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
});

let stopRuntime: (() => void) | null = null;
const workspaceActions = createAdminWorkspaceActionAdapter({
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
  loadActiveView: workspaceRead.loadActiveView,
  persistSession,
  post,
  readActiveView: () => activeView.value,
  readForm: () => form,
  refreshProfile: workspaceRead.refreshProfile,
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
});

onMounted(() => {
  stopRuntime = startAdminWorkspaceRuntime({
    clearError: () => {
      errorMessage.value = "";
    },
    clearWorkspaceState,
    hasSession: () => Boolean(session.value),
    loadActiveView: workspaceRead.loadActiveView,
    readSession: readStoredAdminSession,
    readSessionInvalidation: readStoredSessionInvalidation,
    refreshProfile: workspaceRead.refreshProfile,
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
  });
});

onBeforeUnmount(() => {
  stopRuntime?.();
  stopRuntime = null;
});

async function applyModerationAction(item: AdminWorkspaceModerationItem, action: ModerationAction) {
  if (!session.value) return;
  await runAdminWorkspaceModerationAction(activeView.value, item, action, {
    loadGovernance: workspaceRead.loadGovernance,
    loadModeration: workspaceRead.loadModeration,
    loadOverview: workspaceRead.loadOverview,
    post: (path, body) => post<{ status: string }>(path, body),
    readStatus: getAdminRequestErrorStatus,
    resetDialog: () => {
      pendingModerationAction.value = null;
    },
    resolveErrorMessage: getAdminRequestErrorMessage,
    setConfirmError: (message) => {
      moderationConfirmError.value = message;
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
    setNotice: (nextNotice) => {
      notice.value = nextNotice;
    }
  });
}

async function applyGovernanceRecordAction(
  key: GovernanceMutationKey,
  record: GovernanceRecord,
  action: string,
  confirmError: Ref<string>
) {
  if (!session.value) return;
  await runAdminWorkspaceGovernanceAction(key, record, action, {
    readStatus: getAdminRequestErrorStatus,
    reloadView: workspaceRead.loadGovernance,
    request: (path) => post<{ status: string }>(path, {}),
    resetDialog: (dialogKey) => {
      runAdminConfirmDialogHandler(dialogKey, confirmResetHandlers);
    },
    resolveErrorMessage: (error, fallbackMessage) =>
      getAdminRequestErrorMessage(error, fallbackMessage),
    setConfirmError: (message) => {
      confirmError.value = message;
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
    setNotice: (nextNotice) => {
      notice.value = nextNotice;
    }
  });
}

async function applyReportAction(record: GovernanceRecord, action: ReportAction) {
  await applyGovernanceRecordAction("report", record, action, reportConfirmError);
}

async function applyUserAction(record: GovernanceRecord, action: UserAction) {
  await applyGovernanceRecordAction("user", record, action, userConfirmError);
}

async function applyAITaskAction(record: GovernanceRecord, action: AITaskAction) {
  await applyGovernanceRecordAction("aiTask", record, action, aiTaskConfirmError);
}

async function applyTemplateAction(record: GovernanceRecord, action: TemplateAction) {
  await applyGovernanceRecordAction("template", record, action, templateConfirmError);
}

function requestModerationAction(item: AdminWorkspaceModerationItem, action: ModerationAction) {
  requestAdminWorkspaceModerationAction(item, action, {
    setModerationAction: (value) => {
      pendingModerationAction.value = value;
    },
    setModerationError: (value) => {
      moderationConfirmError.value = value;
    }
  });
}

function requestGovernanceAction(payload: { action: string; record: GovernanceRecord }) {
  requestAdminWorkspaceGovernanceAction(activeView.value, payload, {
    clearAITaskError: () => {
      aiTaskConfirmError.value = "";
    },
    clearReportError: () => {
      reportConfirmError.value = "";
    },
    clearTemplateError: () => {
      templateConfirmError.value = "";
    },
    clearUserError: () => {
      userConfirmError.value = "";
    },
    invalidFallbackMessage: "\u65e0\u6cd5\u63d0\u4ea4\u6cbb\u7406\u52a8\u4f5c\u3002",
    requestModerationAction,
    setAITaskAction: (value) => {
      pendingAITaskAction.value = value;
    },
    setError: (message) => {
      errorMessage.value = message;
    },
    setReportAction: (value) => {
      pendingReportAction.value = value;
    },
    setTemplateAction: (value) => {
      pendingTemplateAction.value = value;
    },
    setUserAction: (value) => {
      pendingUserAction.value = value;
    }
  });
}

function handleConfirmDialogCancel(key: ConfirmDialogKey) {
  if (loading.value) return;
  runAdminConfirmDialogHandler(key, confirmResetHandlers);
}

async function handleConfirmDialogConfirm(key: ConfirmDialogKey) {
  await runAdminConfirmDialogHandler(key, confirmSubmitHandlers);
}

function switchView(view: AdminView) {
  const plan = buildAdminWorkspaceViewSwitchPlan(view);
  runAdminWorkspaceViewSwitch(plan, {
    clearWorkspaceState,
    loadActiveView: workspaceRead.loadActiveView,
    setActiveView: (nextView) => {
      activeView.value = nextView;
    },
    syncLocation: (nextView, syncMode) => {
      syncAdminWorkspaceLocation(nextView, window.location, window.history, syncMode);
    }
  });
}


async function get<T>(path: string, query?: { limit?: number }) {
  return adminGet<T>(path, session.value, query);
}

async function post<T>(path: string, body: ApiRequestInit["body"]) {
  return adminPost<T>(path, body, session.value);
}

function selectRecord(row: GovernanceRecord) {
  selectedRecord.value = row;
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
