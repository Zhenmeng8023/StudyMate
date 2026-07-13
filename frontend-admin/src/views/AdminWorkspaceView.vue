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
  getAITaskConfirmCopy,
  getModerationConfirmCopy,
  getReportConfirmCopy,
  getTemplateConfirmCopy,
  getUserConfirmCopy
} from "./adminActionConfirmCopy";
import {
  resetAdminConfirmDialogState,
  runAdminConfirmDialogHandler,
  type ConfirmDialogHandlerMap,
  type ConfirmDialogKey
} from "./adminConfirmDialogState";
import { buildAdminConfirmDialogs, type AdminConfirmDialogItem } from "./adminConfirmDialogs";
import {
  buildAdminNavItems,
  getAdminActiveCountLabel,
  getAdminViewDescription,
  groupAdminNavItems,
  type AdminNavItem
} from "./adminViewMeta";
import { buildAdminOverviewCards } from "./adminOverviewCards";
import { resolveGovernanceDataState, resolveModerationDataState } from "./adminViewDataState";
import { runAdminViewLoadRequest } from "./adminViewLoadRequest";
import { getAdminRequestErrorMessage, getAdminRequestErrorStatus } from "./adminRequestError";
import { runAdminViewReadRequest } from "./adminViewReadRequest";
import { runAdminWorkspaceLoginBootstrap } from "./adminWorkspaceBootstrap";
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
import { resolveAdminViewLoadPlan, shouldPreserveGovernanceRows } from "./adminViewLoadMeta";
import { runAdminWorkspaceViewLoad } from "./adminWorkspaceViewLoad";
import { runAdminWorkspaceMountBootstrap } from "./adminWorkspaceMountBootstrap";
import { runAdminWorkspacePopstate } from "./adminWorkspacePopstate";
import { runAdminWorkspaceRefresh } from "./adminWorkspaceRefresh";
import { runAdminWorkspaceLogin } from "./adminWorkspaceLogin";
import { runAdminWorkspaceLogout } from "./adminWorkspaceLogout";
import { runAdminWorkspaceSessionCleared } from "./adminWorkspaceSessionCleared";
import { runAdminWorkspaceViewSwitch } from "./adminWorkspaceViewSwitch";
import { runAdminGovernanceActionRequest } from "./adminGovernanceActionRequest";
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
  getGovernanceActions,
  governanceModuleConfig,
  isGovernanceModuleView,
  resolveGovernanceActionDispatch
} from "./adminGovernanceConfig";
import { resolveAdminModerationMutationMeta } from "./adminModerationMutationMeta";
import { runAdminGovernanceMutation } from "./adminGovernanceMutationFlow";
import { resolveGovernanceMutationMeta, type GovernanceMutationKey } from "./adminGovernanceMutationMeta";
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
const moderationConfirmCopy = computed(() => getModerationConfirmCopy(pendingModerationAction.value));
const governanceActions = computed(() => getGovernanceActions(activeView.value, selectedRecord.value));
const reportConfirmCopy = computed(() => getReportConfirmCopy(pendingReportAction.value));
const userConfirmCopy = computed(() => getUserConfirmCopy(pendingUserAction.value));
const aiTaskConfirmCopy = computed(() => getAITaskConfirmCopy(pendingAITaskAction.value));
const templateConfirmCopy = computed(() => getTemplateConfirmCopy(pendingTemplateAction.value));
const confirmDialogs = computed<AdminConfirmDialogItem[]>(() =>
  buildAdminConfirmDialogs({
    loading: loading.value,
    moderation: {
      copy: moderationConfirmCopy.value,
      errorMessage: moderationConfirmError.value,
      isOpen: Boolean(pendingModerationAction.value)
    },
    report: {
      copy: reportConfirmCopy.value,
      errorMessage: reportConfirmError.value,
      isOpen: Boolean(pendingReportAction.value)
    },
    aiTask: {
      copy: aiTaskConfirmCopy.value,
      errorMessage: aiTaskConfirmError.value,
      isOpen: Boolean(pendingAITaskAction.value)
    },
    template: {
      copy: templateConfirmCopy.value,
      errorMessage: templateConfirmError.value,
      isOpen: Boolean(pendingTemplateAction.value)
    },
    user: {
      copy: userConfirmCopy.value,
      errorMessage: userConfirmError.value,
      isOpen: Boolean(pendingUserAction.value)
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

const confirmResetHandlers: ConfirmDialogHandlerMap<() => void> = {
  moderation: () => {
    pendingModerationAction.value = null;
    moderationConfirmError.value = "";
  },
  report: () => {
    pendingReportAction.value = null;
    reportConfirmError.value = "";
  },
  user: () => {
    pendingUserAction.value = null;
    userConfirmError.value = "";
  },
  aiTask: () => {
    pendingAITaskAction.value = null;
    aiTaskConfirmError.value = "";
  },
  template: () => {
    pendingTemplateAction.value = null;
    templateConfirmError.value = "";
  }
};

const confirmSubmitHandlers: ConfirmDialogHandlerMap<() => Promise<void>> = {
  moderation: async () => {
    const pending = pendingModerationAction.value;
    if (!pending) return;
    await applyModerationAction(pending.item, pending.action);
  },
  report: async () => {
    const pending = pendingReportAction.value;
    if (!pending) return;
    await applyReportAction(pending.record, pending.action);
  },
  user: async () => {
    const pending = pendingUserAction.value;
    if (!pending) return;
    await applyUserAction(pending.record, pending.action);
  },
  aiTask: async () => {
    const pending = pendingAITaskAction.value;
    if (!pending) return;
    await applyAITaskAction(pending.record, pending.action);
  },
  template: async () => {
    const pending = pendingTemplateAction.value;
    if (!pending) return;
    await applyTemplateAction(pending.record, pending.action);
  }
};

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
  const result = await runAdminViewReadRequest({
    fallbackMessage: "读取管理员资料失败",
    readStatus: getAdminRequestErrorStatus,
    request: () => get<AdminAuthUser>("/api/v1/admin/me")
  });
  if (result.kind === "error") {
    errorMessage.value = result.message;
    return;
  }
  profile.value = result.data;
}

async function loadOverview() {
  if (!session.value) return;
  const result = await runAdminViewReadRequest({
    fallbackMessage: "读取后台概览失败",
    readStatus: getAdminRequestErrorStatus,
    request: () => get<OverviewPayload>("/api/v1/admin/overview")
  });
  if (result.kind === "error") {
    errorMessage.value = result.message;
    return;
  }
  overview.value = result.data;
}

async function loadModeration() {
  if (!session.value) return;
  loading.value = true;
  errorMessage.value = "";
  moderationErrorStatus.value = null;
  try {
    const result = await runAdminViewLoadRequest({
      readStatus: getAdminRequestErrorStatus,
      request: () => get<AdminWorkspaceModerationItem[]>("/api/v1/admin/moderation"),
      onForbidden: () => {
        moderationItems.value = [];
      }
    });
    if (result.kind === "error") {
      moderationErrorStatus.value = result.status;
      throw result.error;
    }
    moderationItems.value = result.data;
    notice.value = getAdminModerationLoadedNotice(moderationItems.value.length);
  } catch (error) {
    errorMessage.value = getAdminRequestErrorMessage(error, "读取审核队列失败");
  } finally {
    loading.value = false;
  }
}

async function loadGovernance(view: AdminView) {
  if (!session.value || view === "dashboard" || view === "moderation") return;
  const plan = resolveAdminViewLoadPlan(view);
  if (plan.kind !== "governance") return;
  const preserveExistingRows = shouldPreserveGovernanceRows(governanceRowsView.value, plan.view, governanceRows.value.length);
  loading.value = true;
  errorMessage.value = "";
  governanceErrorStatus.value = null;
  if (!preserveExistingRows) {
    governanceRows.value = [];
    governanceSummary.value = null;
    selectedRecord.value = null;
  }
  try {
    const config = getGovernanceModuleConfig(plan.view);
    if (!config) return;
    const result = await runAdminViewLoadRequest({
      readStatus: getAdminRequestErrorStatus,
      request: () => get<GovernanceRecord[]>(config.endpoint, config.query),
      onForbidden: () => {
        governanceRows.value = [];
        governanceSummary.value = null;
        governanceRowsView.value = null;
        selectedRecord.value = null;
      }
    });
    if (result.kind === "error") {
      governanceErrorStatus.value = result.status;
      throw result.error;
    }
    governanceRows.value = result.data;
    governanceRowsView.value = plan.view;
    selectedRecord.value = governanceRows.value[0] ?? null;
    if (plan.summaryEndpoint) {
      governanceSummary.value = await get<GovernanceRecord>(plan.summaryEndpoint);
    } else {
      governanceSummary.value = null;
    }
    notice.value = getAdminGovernanceLoadedNotice(governanceRows.value.length);
  } catch (error) {
    errorMessage.value = getAdminRequestErrorMessage(error, "读取治理模块失败");
  } finally {
    loading.value = false;
  }
}

async function applyModerationAction(item: AdminWorkspaceModerationItem, action: ModerationAction) {
  if (!session.value) return;
  const mutation = resolveAdminModerationMutationMeta(activeView.value, item, action);
  loading.value = true;
  errorMessage.value = "";
  moderationConfirmError.value = "";
  if (mutation.clearGovernanceConflictBeforeSubmit) {
    governanceErrorStatus.value = null;
  }
  try {
    const data = await post<{ status: string }>(mutation.path, { reason: "" });
    pendingModerationAction.value = null;
    notice.value = mutation.successNotice.replace("{status}", data.status);
    await Promise.all([loadModeration(), loadOverview()]);
    if (mutation.reloadGovernanceView) {
      await loadGovernance(mutation.reloadGovernanceView);
    }
  } catch (error) {
    const message = getAdminRequestErrorMessage(error, mutation.errorFallbackMessage);
    const status = getAdminRequestErrorStatus(error);
    if (mutation.reloadGovernanceView && status !== null && mutation.markGovernanceConflictOnStatus.includes(status)) {
      governanceErrorStatus.value = status;
    }
    errorMessage.value = message;
    moderationConfirmError.value = message;
  } finally {
    loading.value = false;
  }
}

async function applyGovernanceRecordAction(
  key: GovernanceMutationKey,
  record: GovernanceRecord,
  action: string,
  confirmError: Ref<string>
) {
  if (!session.value) return;

  loading.value = true;
  errorMessage.value = "";
  confirmError.value = "";
  governanceErrorStatus.value = null;
  const result = await runAdminGovernanceMutation(key, record, action, {
    readStatus: getAdminRequestErrorStatus,
    reloadView: loadGovernance,
    request: (path) => post<{ status: string }>(path, {}),
    resetDialog: (dialogKey) => {
      runAdminConfirmDialogHandler(dialogKey, confirmResetHandlers);
    },
    resolveErrorMessage: (error, fallbackMessage) =>
      getAdminRequestErrorMessage(error, fallbackMessage)
  });

  if (result.kind === "invalid") {
    loading.value = false;
    confirmError.value = result.message;
    return;
  }

  if (result.kind === "success") {
    notice.value = result.notice;
    loading.value = false;
    return;
  }

  if (result.shouldMarkConflict && result.status !== null) {
    governanceErrorStatus.value = result.status;
  }
  errorMessage.value = result.message;
  confirmError.value = result.message;
  loading.value = false;
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
  moderationConfirmError.value = "";
  pendingModerationAction.value = { action, item };
}

function requestGovernanceAction(payload: { action: string; record: GovernanceRecord }) {
  const dispatch = resolveGovernanceActionDispatch(activeView.value, payload);
  runAdminGovernanceActionRequest(dispatch, {
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
