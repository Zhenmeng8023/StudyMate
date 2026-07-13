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
import { defaultAdminRouteKey } from "../router";
import type { AdminRouteKey } from "../router";
import {
  resetAdminConfirmDialogState,
  runAdminConfirmDialogHandler,
  type ConfirmDialogHandlerMap,
  type ConfirmDialogKey
} from "./adminConfirmDialogState";
import { buildAdminWorkspaceConfirmDialogs } from "./adminWorkspaceConfirmDialogs";
import {
  buildAdminWorkspaceConfirmResetHandlers,
  buildAdminWorkspaceConfirmSubmitHandlers
} from "./adminWorkspaceConfirmState";
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
import { runAdminWorkspaceLoginBootstrap } from "./adminWorkspaceBootstrap";
import {
  runAdminWorkspaceGovernanceLoad,
  runAdminWorkspaceModerationLoad,
  runAdminWorkspaceOverviewLoad,
  runAdminWorkspaceProfileRefresh
} from "./adminWorkspaceDataLoad";
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
import {
  normalizeAdminWorkspaceLocation,
  resolveAdminWorkspaceLocationView,
  syncAdminWorkspaceLocation
} from "./adminWorkspaceLocation";
import {
  buildAdminWorkspaceLogoutPlan,
  buildAdminWorkspaceMountPlan,
  buildAdminWorkspacePopstatePlan,
  buildAdminWorkspaceRefreshPlan,
  buildAdminWorkspaceSessionClearedPlan,
  buildAdminWorkspaceViewSwitchPlan
} from "./adminWorkspaceLifecycle";
import { runAdminWorkspaceViewLoad } from "./adminWorkspaceViewLoad";
import { runAdminWorkspaceMountBootstrap } from "./adminWorkspaceMountBootstrap";
import { runAdminWorkspacePopstate } from "./adminWorkspacePopstate";
import { runAdminWorkspaceRefresh } from "./adminWorkspaceRefresh";
import { runAdminWorkspaceLogin } from "./adminWorkspaceLogin";
import { runAdminWorkspaceLogout } from "./adminWorkspaceLogout";
import { runAdminWorkspaceSessionCleared } from "./adminWorkspaceSessionCleared";
import { runAdminWorkspaceViewSwitch } from "./adminWorkspaceViewSwitch";
import {
  getAdminGovernanceLoadedNotice,
  getAdminLoginSuccessNotice,
  getAdminLogoutNotice,
  getAdminModerationLoadedNotice,
  getAdminSessionEndedNotice
} from "./adminWorkspaceNotice";
import {
  resetAdminWorkspaceState,
  type AdminWorkspaceResetHandlers,
  type AdminWorkspaceResetKey
} from "./adminWorkspaceState";
import {
  getGovernanceModuleConfig,
  getGovernanceActions
} from "./adminGovernanceConfig";
import type { GovernanceMutationKey } from "./adminGovernanceMutationMeta";
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
const initialAdminWorkspaceNotice = "登录后会同步当前治理队列与运营数据。";

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
const governanceActions = computed(() => getGovernanceActions(activeView.value, selectedRecord.value));
const confirmDialogs = computed(() =>
  buildAdminWorkspaceConfirmDialogs({
    loading: loading.value,
    moderation: {
      errorMessage: moderationConfirmError.value,
      pending: pendingModerationAction.value
    },
    report: {
      errorMessage: reportConfirmError.value,
      pending: pendingReportAction.value
    },
    aiTask: {
      errorMessage: aiTaskConfirmError.value,
      pending: pendingAITaskAction.value
    },
    template: {
      errorMessage: templateConfirmError.value,
      pending: pendingTemplateAction.value
    },
    user: {
      errorMessage: userConfirmError.value,
      pending: pendingUserAction.value
    }
  })
);

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
const activeDescription = computed(() => getAdminViewDescription(activeView.value, getGovernanceModuleConfig(activeView.value)?.description ?? ""));
const activeCountLabel = computed(() =>
  getAdminActiveCountLabel(activeView.value, moderationItems.value.length, governanceRows.value.length)
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

const visibleModerationItems = computed(() => filterModerationItems(moderationItems.value, moderationQuery.value, moderationStatusFilter.value));
const moderationStatusOptions = computed(() => buildModerationStatusOptions(moderationItems.value));
const visibleGovernanceRows = computed(() => filterGovernanceRows(governanceRows.value, recordQuery.value, governanceStatusFilter.value));
const governanceStatusOptions = computed(() => buildGovernanceStatusOptions(governanceRows.value));
const governanceColumns = computed(() => getGovernanceColumns(governanceRows.value));

const confirmResetHandlers: ConfirmDialogHandlerMap<() => void> =
  buildAdminWorkspaceConfirmResetHandlers({
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

const confirmSubmitHandlers: ConfirmDialogHandlerMap<() => Promise<void>> =
  buildAdminWorkspaceConfirmSubmitHandlers({
    applyAITaskAction,
    applyModerationAction,
    applyReportAction,
    applyTemplateAction,
    applyUserAction,
    readAITaskAction: () => pendingAITaskAction.value,
    readModerationAction: () => pendingModerationAction.value,
    readReportAction: () => pendingReportAction.value,
    readTemplateAction: () => pendingTemplateAction.value,
    readUserAction: () => pendingUserAction.value
  });

function clearPendingConfirmState() {
  resetAdminConfirmDialogState(confirmResetHandlers);
}

const workspaceResetHandlers: AdminWorkspaceResetHandlers = {
  queries: () => {
    recordQuery.value = "";
    moderationQuery.value = "";
  },
  filters: () => {
    moderationStatusFilter.value = "all";
    governanceStatusFilter.value = "all";
  },
  moderationData: () => {
    moderationItems.value = [];
    overview.value = null;
  },
  governanceData: () => {
    governanceRows.value = [];
    governanceSummary.value = null;
    governanceRowsView.value = null;
    selectedRecord.value = null;
  },
  confirmState: () => {
    clearPendingConfirmState();
  }
};

function clearWorkspaceState(keys?: AdminWorkspaceResetKey[]) {
  resetAdminWorkspaceState(workspaceResetHandlers, keys);
}

function loadActiveView(view: AdminView) {
  void runAdminWorkspaceViewLoad(view, {
    loadGovernance,
    loadModeration,
    loadOverview
  });
}

function handleAdminPopstate() {
  const plan = buildAdminWorkspacePopstatePlan(
    normalizeAdminWorkspaceLocation(window.location, window.history),
    Boolean(session.value)
  );
  runAdminWorkspacePopstate(plan, {
    clearWorkspaceState,
    loadActiveView,
    setActiveView: (view) => {
      activeView.value = view;
    }
  });
}

const unsubscribeSession = subscribeSession(() => {
  const nextSession = readStoredAdminSession();
  session.value = nextSession;
  sessionInvalidation.value = readStoredSessionInvalidation();
  profile.value = nextSession?.user ?? null;

  if (!nextSession) {
    const plan = buildAdminWorkspaceSessionClearedPlan(
      getAdminSessionEndedNotice(getSessionInvalidationPrompt(sessionInvalidation.value, "admin"))
    );
    runAdminWorkspaceSessionCleared(plan, {
      clearError: () => {
        errorMessage.value = "";
      },
      clearWorkspaceState,
      setActiveView: (view) => {
        activeView.value = view;
      },
      setNotice: (nextNotice) => {
        notice.value = nextNotice;
      },
      syncLocation: (view, syncMode) => {
        syncAdminWorkspaceLocation(view, window.location, window.history, syncMode);
      }
    });
  }
});

onMounted(() => {
  const plan = buildAdminWorkspaceMountPlan(
    normalizeAdminWorkspaceLocation(window.location, window.history),
    Boolean(session.value)
  );
  window.addEventListener("popstate", handleAdminPopstate);
  runAdminWorkspaceMountBootstrap(plan, {
    loadActiveView,
    refreshProfile,
    setActiveView: (view) => {
      activeView.value = view;
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", handleAdminPopstate);
  unsubscribeSession();
});

async function login() {
  await runAdminWorkspaceLogin(activeView.value, {
    bootstrap: (view) =>
      runAdminWorkspaceLoginBootstrap(view, {
        authenticate: () => post<AdminSessionPayload>("/api/v1/admin/login", form),
        loadActiveView,
        persistSession,
        refreshProfile
      }),
    clearError: () => {
      errorMessage.value = "";
    },
    clearSessionInvalidation,
    fallbackMessage: "管理员登录失败",
    getSuccessNotice: getAdminLoginSuccessNotice,
    resolveErrorMessage: getAdminRequestErrorMessage,
    setError: (message) => {
      errorMessage.value = message;
    },
    setLoading: (nextLoading) => {
      loading.value = nextLoading;
    },
    setNotice: (nextNotice) => {
      notice.value = nextNotice;
    }
  });
}

async function refreshProfile() {
  if (!session.value) return;
  await runAdminWorkspaceProfileRefresh({
    fallbackMessage: "读取管理员资料失败",
    readStatus: getAdminRequestErrorStatus,
    request: () => get<AdminAuthUser>("/api/v1/admin/me"),
    setError: (message) => {
      errorMessage.value = message;
    },
    setProfile: (nextProfile) => {
      profile.value = nextProfile;
    }
  });
}

async function loadOverview() {
  if (!session.value) return;
  await runAdminWorkspaceOverviewLoad({
    fallbackMessage: "读取后台概览失败",
    readStatus: getAdminRequestErrorStatus,
    request: () => get<OverviewPayload>("/api/v1/admin/overview"),
    setError: (message) => {
      errorMessage.value = message;
    },
    setOverview: (nextOverview) => {
      overview.value = nextOverview;
    }
  });
}

async function loadModeration() {
  if (!session.value) return;
  await runAdminWorkspaceModerationLoad({
    fallbackMessage: "读取审核队列失败",
    getLoadedNotice: getAdminModerationLoadedNotice,
    readStatus: getAdminRequestErrorStatus,
    request: () => get<AdminWorkspaceModerationItem[]>("/api/v1/admin/moderation"),
    resolveErrorMessage: getAdminRequestErrorMessage,
    setError: (message) => {
      errorMessage.value = message;
    },
    setItems: (items) => {
      moderationItems.value = items;
    },
    setLoading: (nextLoading) => {
      loading.value = nextLoading;
    },
    setNotice: (nextNotice) => {
      notice.value = nextNotice;
    },
    setStatus: (status) => {
      moderationErrorStatus.value = status;
    }
  });
}

async function loadGovernance(view: AdminView) {
  if (!session.value) return;
  await runAdminWorkspaceGovernanceLoad(view, {
    currentRows: governanceRows.value,
    currentRowsView: governanceRowsView.value,
    fallbackMessage: "读取治理模块失败",
    getLoadedNotice: getAdminGovernanceLoadedNotice,
    readStatus: getAdminRequestErrorStatus,
    request: (path, query) => get<GovernanceRecord[]>(path, query),
    requestSummary: (path) => get<GovernanceRecord>(path),
    resolveErrorMessage: getAdminRequestErrorMessage,
    setError: (message) => {
      errorMessage.value = message;
    },
    setLoading: (nextLoading) => {
      loading.value = nextLoading;
    },
    setNotice: (nextNotice) => {
      notice.value = nextNotice;
    },
    setRows: (rows) => {
      governanceRows.value = rows;
    },
    setRowsView: (nextView) => {
      governanceRowsView.value = nextView;
    },
    setSelectedRecord: (record) => {
      selectedRecord.value = record;
    },
    setStatus: (status) => {
      governanceErrorStatus.value = status;
    },
    setSummary: (summary) => {
      governanceSummary.value = summary;
    }
  });
}

async function applyModerationAction(item: AdminWorkspaceModerationItem, action: ModerationAction) {
  if (!session.value) return;
  await runAdminWorkspaceModerationAction(activeView.value, item, action, {
    loadGovernance,
    loadModeration,
    loadOverview,
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
    reloadView: loadGovernance,
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
    invalidFallbackMessage: "无法提交治理动作。",
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
    loadActiveView,
    setActiveView: (nextView) => {
      activeView.value = nextView;
    },
    syncLocation: (nextView, syncMode) => {
      syncAdminWorkspaceLocation(nextView, window.location, window.history, syncMode);
    }
  });
}

function refreshActiveView() {
  runAdminWorkspaceRefresh(buildAdminWorkspaceRefreshPlan(activeView.value), {
    loadActiveView
  });
}

function logout() {
  const plan = buildAdminWorkspaceLogoutPlan(getAdminLogoutNotice());
  runAdminWorkspaceLogout(plan, {
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
    persistSession,
    setActiveView: (view) => {
      activeView.value = view;
    },
    setNotice: (nextNotice) => {
      notice.value = nextNotice;
    },
    syncLocation: (view, syncMode) => {
      syncAdminWorkspaceLocation(view, window.location, window.history, syncMode);
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
      :error-message="errorMessage"
      :loading="loading"
      :notice="loginNotice"
      :login-prompt="loginPrompt"
      :login-value="form.login"
      :password-value="form.password"
      @submit="login"
      @update:login-value="form.login = $event"
      @update:password-value="form.password = $event"
    />

    <AdminShellFrame
      v-else
      :active-description="activeDescription"
      :active-group="activeMeta.group"
      :active-title="activeMeta.label"
      :active-view="activeView"
      :count-label="activeCountLabel"
      :error-message="errorMessage"
      :loading="loading"
      :nav-groups="navGroups"
      :notice="notice"
      :profile="profile"
      :profile-initial="profileInitial"
      @logout="logout"
      @refresh="refreshActiveView"
      @switch-view="switchView($event as AdminView)"
    >
      <AdminDashboardModule
        v-if="activeView === 'dashboard'"
        :moderation-items-count="moderationItems.length"
        :overview-cards="overviewCards"
        :pending-materials-count="pendingMaterials.length"
        :pending-posts-count="pendingPosts.length"
        @open-moderation="switchView('moderation')"
      />

      <AdminModerationModule
        v-else-if="activeView === 'moderation'"
        :data-state="moderationDataState"
        :items="visibleModerationItems"
        :query="moderationQuery"
        :status-filter="moderationStatusFilter"
        :status-options="moderationStatusOptions"
        :total-count="moderationItems.length"
        @request-action="requestModerationAction($event.item, $event.action)"
        @update:query="moderationQuery = $event"
        @update:status-filter="moderationStatusFilter = $event"
      />

      <AdminGovernanceModule
        v-else
        :actions="governanceActions"
        :columns="governanceColumns"
        :data-state="governanceDataState"
        :empty-text="getGovernanceModuleConfig(activeView)?.empty ?? ''"
        :query="recordQuery"
        :rows="visibleGovernanceRows"
        :selected-record="selectedRecord"
        :status-filter="governanceStatusFilter"
        :status-options="governanceStatusOptions"
        :summary="governanceSummary"
        :total-count="governanceRows.length"
        @request-action="requestGovernanceAction"
        @select-record="selectRecord"
        @update:query="recordQuery = $event"
        @update:status-filter="governanceStatusFilter = $event"
      />
    </AdminShellFrame>
  </main>
</template>
