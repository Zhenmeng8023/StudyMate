<script setup lang="ts">
import "../components/admin/admin.css";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
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
import { formatGovernanceCell, getGovernanceColumns, type GovernanceRecord } from "../components/admin/governanceRecord";
import { defaultAdminRouteKey, getAdminRoutePath, normalizeAdminRoutePath, parseAdminRoutePath } from "../router";
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
import { buildStatusFilterOptions, filterCollectionByStatusAndQuery, type AdminFilterOption } from "./adminModuleFilters";
import {
  buildAdminNavItems,
  getAdminActiveCountLabel,
  getAdminViewDescription,
  groupAdminNavItems,
  type AdminNavItem
} from "./adminViewMeta";
import {
  resetAdminWorkspaceState,
  type AdminWorkspaceResetHandlers,
  type AdminWorkspaceResetKey
} from "./adminWorkspaceState";
import {
  getGovernanceActions,
  governanceModuleConfig,
  isGovernanceModuleView,
  resolveGovernanceActionDispatch
} from "./adminGovernanceConfig";
import AdminDashboardModule from "./modules/AdminDashboardModule.vue";
import AdminGovernanceModule from "./modules/AdminGovernanceModule.vue";
import AdminModerationModule from "./modules/AdminModerationModule.vue";

interface ModerationItem {
  id: string;
  type: "post" | "material";
  title: string;
  summary: string;
  authorName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

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
type ConfirmDialogItem = {
  key: ConfirmDialogKey;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  confirmTone?: "default" | "danger";
  confirming?: boolean;
  confirmingLabel?: string;
  description?: string;
  errorMessage?: string;
  isOpen: boolean;
  title: string;
};
type FilterOption = AdminFilterOption;

const form = reactive({ login: "", password: "" });
const session = ref<AdminSessionPayload | null>(readStoredAdminSession());
const sessionInvalidation = ref(readStoredSessionInvalidation());
const profile = ref<AdminAuthUser | null>(session.value?.user ?? null);
const moderationItems = ref<ModerationItem[]>([]);
const overview = ref<OverviewPayload | null>(null);
const governanceRows = ref<GovernanceRecord[]>([]);
const governanceSummary = ref<GovernanceRecord | null>(null);
const governanceRowsView = ref<Exclude<AdminView, "dashboard" | "moderation"> | null>(null);
const selectedRecord = ref<GovernanceRecord | null>(null);
const loading = ref(false);
const errorMessage = ref("");
const moderationErrorStatus = ref<number | null>(null);
const governanceErrorStatus = ref<number | null>(null);
const notice = ref("登录后会同步当前治理队列与运营数据。");
const activeView = ref<AdminView>(resolveAdminViewFromLocation());
const recordQuery = ref("");
const moderationQuery = ref("");
const moderationStatusFilter = ref("all");
const governanceStatusFilter = ref("all");
const pendingModerationAction = ref<{ action: ModerationAction; item: ModerationItem } | null>(null);
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
const pendingPosts = computed(() => moderationItems.value.filter((item) => item.type === "post"));
const pendingMaterials = computed(() => moderationItems.value.filter((item) => item.type === "material"));
const profileInitial = computed(() => profile.value?.displayName?.trim().slice(0, 1) || "A");
const moderationConfirmCopy = computed(() => getModerationConfirmCopy(pendingModerationAction.value));
const governanceActions = computed(() => getGovernanceActions(activeView.value, selectedRecord.value));
const reportConfirmCopy = computed(() => getReportConfirmCopy(pendingReportAction.value));
const userConfirmCopy = computed(() => getUserConfirmCopy(pendingUserAction.value));
const aiTaskConfirmCopy = computed(() => getAITaskConfirmCopy(pendingAITaskAction.value));
const templateConfirmCopy = computed(() => getTemplateConfirmCopy(pendingTemplateAction.value));
const confirmDialogs = computed<ConfirmDialogItem[]>(() => [
  {
    key: "moderation" as const,
    cancelLabel: "取消",
    confirmLabel: moderationConfirmCopy.value.confirmLabel,
    confirmTone: moderationConfirmCopy.value.confirmTone,
    confirming: loading.value,
    confirmingLabel: moderationConfirmCopy.value.confirmingLabel,
    description: moderationConfirmCopy.value.description,
    errorMessage: moderationConfirmError.value,
    isOpen: Boolean(pendingModerationAction.value),
    title: moderationConfirmCopy.value.title
  },
  {
    key: "report" as const,
    cancelLabel: "取消",
    confirmLabel: reportConfirmCopy.value.confirmLabel,
    confirmTone: reportConfirmCopy.value.confirmTone,
    confirming: loading.value,
    confirmingLabel: reportConfirmCopy.value.confirmingLabel,
    description: reportConfirmCopy.value.description,
    errorMessage: reportConfirmError.value,
    isOpen: Boolean(pendingReportAction.value),
    title: reportConfirmCopy.value.title
  },
  {
    key: "aiTask" as const,
    cancelLabel: "取消",
    confirmLabel: aiTaskConfirmCopy.value.confirmLabel,
    confirmTone: aiTaskConfirmCopy.value.confirmTone,
    confirming: loading.value,
    confirmingLabel: aiTaskConfirmCopy.value.confirmingLabel,
    description: aiTaskConfirmCopy.value.description,
    errorMessage: aiTaskConfirmError.value,
    isOpen: Boolean(pendingAITaskAction.value),
    title: aiTaskConfirmCopy.value.title
  },
  {
    key: "template" as const,
    cancelLabel: "取消",
    confirmLabel: templateConfirmCopy.value.confirmLabel,
    confirmTone: templateConfirmCopy.value.confirmTone,
    confirming: loading.value,
    confirmingLabel: templateConfirmCopy.value.confirmingLabel,
    description: templateConfirmCopy.value.description,
    errorMessage: templateConfirmError.value,
    isOpen: Boolean(pendingTemplateAction.value),
    title: templateConfirmCopy.value.title
  },
  {
    key: "user" as const,
    cancelLabel: "取消",
    confirmLabel: userConfirmCopy.value.confirmLabel,
    confirmTone: userConfirmCopy.value.confirmTone,
    confirming: loading.value,
    confirmingLabel: userConfirmCopy.value.confirmingLabel,
    description: userConfirmCopy.value.description,
    errorMessage: userConfirmError.value,
    isOpen: Boolean(pendingUserAction.value),
    title: userConfirmCopy.value.title
  }
]);

const navItems = computed<AdminNavItem[]>(() => buildAdminNavItems(moderationItems.value.length));
const navGroups = computed(() => groupAdminNavItems(navItems.value));
const activeMeta = computed(() => navItems.value.find((item) => item.key === activeView.value) ?? navItems.value[0]);
const loginPrompt = computed(() => getSessionInvalidationPrompt(sessionInvalidation.value, "admin"));
const activeDescription = computed(() =>
  getAdminViewDescription(
    activeView.value,
    isGovernanceModuleView(activeView.value) ? governanceModuleConfig[activeView.value].description : ""
  )
);
const activeCountLabel = computed(() =>
  getAdminActiveCountLabel(activeView.value, moderationItems.value.length, governanceRows.value.length)
);
const moderationDataState = computed<AdminDataStatePayload | null>(() => {
  if (loading.value && moderationItems.value.length === 0) {
    return {
      kind: "loading",
      title: "正在同步审核队列",
      description: "请稍候，最新待审核内容和状态正在载入。"
    };
  }
  if (moderationErrorStatus.value === 403) {
    return {
      kind: "unauthorized",
      title: "暂无审核权限",
      description: errorMessage.value || "当前账号没有查看审核队列的权限。"
    };
  }
  if (errorMessage.value && moderationItems.value.length > 0) {
    return {
      kind: "stale",
      title: "审核队列需要刷新",
      description: "当前显示的是上一次同步结果，请刷新后再继续处理。"
    };
  }
  if (errorMessage.value && moderationItems.value.length === 0) {
    return {
      kind: "error",
      title: "审核队列暂时不可用",
      description: errorMessage.value
    };
  }
  return null;
});
const governanceDataState = computed<AdminDataStatePayload | null>(() => {
  if (activeView.value === "dashboard" || activeView.value === "moderation") return null;
  if (loading.value && governanceRows.value.length === 0) {
    return {
      kind: "loading",
      title: `正在同步${activeMeta.value.label}`,
      description: "请稍候，最新治理记录正在载入。"
    };
  }
  if (governanceErrorStatus.value === 403) {
    return {
      kind: "unauthorized",
      title: "暂无治理权限",
      description: errorMessage.value || "当前账号没有查看这个治理模块的权限。"
    };
  }
  if (governanceErrorStatus.value === 409) {
    return {
      kind: "conflict",
      title: "治理动作存在冲突",
      description: errorMessage.value || "这条记录的状态已经被其他人更新，请先刷新后再决定下一步。"
    };
  }
  if (errorMessage.value && governanceRows.value.length > 0) {
    return {
      kind: "stale",
      title: "治理记录需要刷新",
      description: "当前显示的是上一次同步结果，请刷新后再继续判断。"
    };
  }
  if (errorMessage.value && governanceRows.value.length === 0) {
    return {
      kind: "error",
      title: `${activeMeta.value.label}暂时不可用`,
      description: errorMessage.value
    };
  }
  return null;
});
const overviewCards = computed(() => [
  { label: "待处理", value: String(overview.value?.pendingModerationCount ?? moderationItems.value.length), helper: "需要审核或复核的公开内容" },
  { label: "用户规模", value: String(overview.value?.userCount ?? 0), helper: "当前已注册的学习者与管理员" },
  { label: "资料沉淀", value: String(overview.value?.materialCount ?? 0), helper: "可被阅读、引用和治理的资料" },
  { label: "知识图谱", value: String(overview.value?.graphCount ?? 0), helper: "用户持续维护的知识结构" }
]);
const governanceConfig: Record<Exclude<AdminView, "dashboard" | "moderation">, { endpoint: string; query: { limit: number }; empty: string; description: string }> = {
  materials: { endpoint: "/api/v1/admin/materials", query: { limit: 20 }, empty: "暂无资料治理记录。", description: "查看资料状态、作者与附件，并直接执行审核或上下架动作。" },
  community: { endpoint: "/api/v1/admin/reports", query: { limit: 20 }, empty: "暂无举报记录。", description: "集中查看用户提交的举报与处理线索。" },
  users: { endpoint: "/api/v1/admin/users", query: { limit: 20 }, empty: "暂无用户记录。", description: "按账号状态与角色查看用户资料。" },
  graph: { endpoint: "/api/v1/admin/tags", query: { limit: 20 }, empty: "暂无标签记录。", description: "管理资料、笔记与图谱中的分类标签。" },
  ai: { endpoint: "/api/v1/admin/ai/tasks", query: { limit: 20 }, empty: "暂无 AI 任务。", description: "追踪生成任务、状态与用量概览。" },
  system: { endpoint: "/api/v1/admin/files", query: { limit: 20 }, empty: "暂无文件记录。", description: "查看上传文件与存储治理信息。" },
  audit: { endpoint: "/api/v1/admin/audit-logs", query: { limit: 20 }, empty: "暂无审计日志。", description: "查看关键治理操作的可追溯记录。" }
};
governanceConfig.graph = {
  endpoint: "/api/v1/admin/diagram-templates",
  query: { limit: 20 },
  empty: "暂无图谱模板记录。",
  description: "管理图谱模板的发布状态与基础元数据。"
};

const visibleModerationItems = computed(() =>
  filterCollectionByStatusAndQuery(moderationItems.value, {
    getStatus: (item) => item.status,
    query: moderationQuery.value,
    statusFilter: moderationStatusFilter.value,
    toSearchText: (item) => [item.title, item.summary, item.authorName, item.type, item.status].join(" ")
  })
);
const moderationStatusOptions = computed<FilterOption[]>(() => {
  return buildStatusFilterOptions(moderationItems.value, (item) => item.status);
});
const visibleGovernanceRows = computed(() =>
  filterCollectionByStatusAndQuery(governanceRows.value, {
    getStatus: (row) => String(row.status ?? ""),
    query: recordQuery.value,
    statusFilter: governanceStatusFilter.value,
    toSearchText: (row) => Object.values(row).map((value) => formatGovernanceCell(value)).join(" ")
  })
);
const governanceStatusOptions = computed<FilterOption[]>(() => {
  return buildStatusFilterOptions(governanceRows.value, (row) => String(row.status ?? ""));
});
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

function getRequestErrorStatus(error: unknown) {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return null;
  }

  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : null;
}

function resolveAdminViewFromLocation(): AdminView {
  if (typeof window === "undefined") return defaultAdminRouteKey;
  return parseAdminRoutePath(window.location.pathname) ?? defaultAdminRouteKey;
}

function syncAdminLocation(view: AdminView, mode: "push" | "replace" = "push") {
  if (typeof window === "undefined") return;
  const nextPath = getAdminRoutePath(view);
  if (window.location.pathname === nextPath) return;
  window.history[mode === "replace" ? "replaceState" : "pushState"]({}, "", nextPath);
}

function normalizeAdminLocation() {
  if (typeof window === "undefined") return defaultAdminRouteKey;
  const normalizedPath = normalizeAdminRoutePath(window.location.pathname);
  if (window.location.pathname !== normalizedPath) {
    window.history.replaceState({}, "", normalizedPath);
  }
  return parseAdminRoutePath(normalizedPath) ?? defaultAdminRouteKey;
}

function loadActiveView(view: AdminView) {
  if (view === "dashboard") {
    void Promise.all([loadOverview(), loadModeration()]);
    return;
  }
  if (view === "moderation") {
    void loadModeration();
    return;
  }
  void loadGovernance(view);
}

function handleAdminPopstate() {
  activeView.value = normalizeAdminLocation();
  clearWorkspaceState(["queries"]);
  if (session.value) {
    loadActiveView(activeView.value);
  }
}

const unsubscribeSession = subscribeSession(() => {
  const nextSession = readStoredAdminSession();
  session.value = nextSession;
  sessionInvalidation.value = readStoredSessionInvalidation();
  profile.value = nextSession?.user ?? null;

  if (!nextSession) {
    clearWorkspaceState();
    activeView.value = defaultAdminRouteKey;
    syncAdminLocation(defaultAdminRouteKey, "replace");
    errorMessage.value = "";
    notice.value = getSessionInvalidationPrompt(sessionInvalidation.value, "admin") || "后台会话已失效，请重新登录。";
  }
});

onMounted(() => {
  activeView.value = normalizeAdminLocation();
  window.addEventListener("popstate", handleAdminPopstate);

  if (session.value) {
    void refreshProfile();
    loadActiveView(activeView.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", handleAdminPopstate);
  unsubscribeSession();
});

async function login() {
  loading.value = true;
  errorMessage.value = "";
  clearSessionInvalidation();
  try {
    const data = await post<AdminSessionPayload>("/api/v1/admin/login", form);
    persistSession(data);
    notice.value = "已进入治理工作台，正在同步当前数据。";
    await refreshProfile();
    loadActiveView(activeView.value);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "管理员登录失败";
  } finally {
    loading.value = false;
  }
}

async function refreshProfile() {
  if (!session.value) return;
  try {
    profile.value = await get<AdminAuthUser>("/api/v1/admin/me");
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "读取管理员资料失败";
  }
}

async function loadOverview() {
  if (!session.value) return;
  try {
    overview.value = await get<OverviewPayload>("/api/v1/admin/overview");
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "读取后台概览失败";
  }
}

async function loadModeration() {
  if (!session.value) return;
  loading.value = true;
  errorMessage.value = "";
  moderationErrorStatus.value = null;
  try {
    moderationItems.value = await get<ModerationItem[]>("/api/v1/admin/moderation").catch((error) => {
      moderationErrorStatus.value = getRequestErrorStatus(error);
      if (moderationErrorStatus.value === 403) {
        moderationItems.value = [];
      }
      throw error;
    });
    notice.value = `当前共有 ${moderationItems.value.length} 条待处理内容。`;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "读取审核队列失败";
  } finally {
    loading.value = false;
  }
}

async function loadGovernance(view: AdminView) {
  if (!session.value || view === "dashboard" || view === "moderation") return;
  const preserveExistingRows = governanceRowsView.value === view && governanceRows.value.length > 0;
  loading.value = true;
  errorMessage.value = "";
  governanceErrorStatus.value = null;
  if (!preserveExistingRows) {
    governanceRows.value = [];
    governanceSummary.value = null;
    selectedRecord.value = null;
  }
  try {
    const config = governanceModuleConfig[view];
    governanceRows.value = await get<GovernanceRecord[]>(config.endpoint, config.query).catch((error) => {
      governanceErrorStatus.value = getRequestErrorStatus(error);
      if (governanceErrorStatus.value === 403) {
        governanceRows.value = [];
        governanceSummary.value = null;
        governanceRowsView.value = null;
        selectedRecord.value = null;
      }
      throw error;
    });
    governanceRowsView.value = view;
    selectedRecord.value = governanceRows.value[0] ?? null;
    if (view === "ai") {
      governanceSummary.value = await get<GovernanceRecord>("/api/v1/admin/ai/usage");
    } else {
      governanceSummary.value = null;
    }
    notice.value = `已加载 ${governanceRows.value.length} 条治理记录。`;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "读取治理模块失败";
  } finally {
    loading.value = false;
  }
}

async function applyModerationAction(item: ModerationItem, action: ModerationAction) {
  if (!session.value) return;
  loading.value = true;
  errorMessage.value = "";
  moderationConfirmError.value = "";
  if (activeView.value === "materials" && item.type === "material") {
    governanceErrorStatus.value = null;
  }
  try {
    const path = `/api/v1/admin/moderation/${item.type === "post" ? "posts" : "materials"}/${item.id}/${action}`;
    const data = await post<{ status: string }>(path, { reason: "" });
    pendingModerationAction.value = null;
    notice.value = `“${item.title}” 已更新为 ${data.status}。`;
    await Promise.all([loadModeration(), loadOverview()]);
    if (activeView.value === "materials" && item.type === "material") {
      await loadGovernance("materials");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新审核状态失败";
    if (activeView.value === "materials" && item.type === "material") {
      const status = getRequestErrorStatus(error);
      if (status === 409) {
        governanceErrorStatus.value = status;
      }
    }
    errorMessage.value = message;
    moderationConfirmError.value = message;
  } finally {
    loading.value = false;
  }
}

async function applyReportAction(record: GovernanceRecord, action: ReportAction) {
  if (!session.value) return;

  const reportID = String(record.id ?? "");
  if (!reportID) {
    reportConfirmError.value = "举报标识缺失，无法提交处理结果。";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  reportConfirmError.value = "";
  governanceErrorStatus.value = null;
  try {
    const data = await post<{ status: string }>(`/api/v1/admin/reports/${reportID}/${action}`, {});
    pendingReportAction.value = null;
    notice.value = `举报 ${reportID} 已更新为 ${data.status}。`;
    await loadGovernance("community");
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新举报状态失败";
    const status = getRequestErrorStatus(error);
    if (status === 409) {
      governanceErrorStatus.value = status;
    }
    errorMessage.value = message;
    reportConfirmError.value = message;
  } finally {
    loading.value = false;
  }
}

async function applyUserAction(record: GovernanceRecord, action: UserAction) {
  if (!session.value) return;

  const userID = String(record.id ?? "");
  if (!userID) {
    userConfirmError.value = "用户标识缺失，无法提交治理动作。";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  userConfirmError.value = "";
  governanceErrorStatus.value = null;
  try {
    const data = await post<{ status: string }>(`/api/v1/admin/users/${userID}/${action}`, {});
    pendingUserAction.value = null;
    notice.value = `用户 ${userID} 已更新为 ${data.status}。`;
    await loadGovernance("users");
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新用户状态失败";
    const status = getRequestErrorStatus(error);
    if (status === 409) {
      governanceErrorStatus.value = status;
    }
    errorMessage.value = message;
    userConfirmError.value = message;
  } finally {
    loading.value = false;
  }
}

async function applyAITaskAction(record: GovernanceRecord, action: AITaskAction) {
  if (!session.value) return;

  const taskID = String(record.id ?? "");
  if (!taskID) {
    aiTaskConfirmError.value = "AI 任务标识缺失，无法提交治理动作。";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  aiTaskConfirmError.value = "";
  governanceErrorStatus.value = null;
  try {
    const data = await post<{ status: string }>(`/api/v1/admin/ai/tasks/${taskID}/${action}`, {});
    pendingAITaskAction.value = null;
    notice.value = `AI 任务 ${taskID} 已更新为 ${data.status}。`;
    await loadGovernance("ai");
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新 AI 任务状态失败";
    const status = getRequestErrorStatus(error);
    if (status === 409) {
      governanceErrorStatus.value = status;
    }
    errorMessage.value = message;
    aiTaskConfirmError.value = message;
  } finally {
    loading.value = false;
  }
}

async function applyTemplateAction(record: GovernanceRecord, action: TemplateAction) {
  if (!session.value) return;

  const templateID = String(record.id ?? "");
  if (!templateID) {
    templateConfirmError.value = "图谱模板标识缺失，无法提交治理动作。";
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  templateConfirmError.value = "";
  governanceErrorStatus.value = null;
  try {
    const data = await post<{ status: string }>(`/api/v1/admin/diagram-templates/${templateID}/${action}`, {});
    pendingTemplateAction.value = null;
    notice.value = `图谱模板 ${templateID} 已更新为 ${data.status}。`;
    await loadGovernance("graph");
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新图谱模板状态失败";
    const status = getRequestErrorStatus(error);
    if (status === 409) {
      governanceErrorStatus.value = status;
    }
    errorMessage.value = message;
    templateConfirmError.value = message;
  } finally {
    loading.value = false;
  }
}

function requestModerationAction(item: ModerationItem, action: ModerationAction) {
  moderationConfirmError.value = "";
  pendingModerationAction.value = { action, item };
}

function requestGovernanceAction(payload: { action: string; record: GovernanceRecord }) {
  const dispatch = resolveGovernanceActionDispatch(activeView.value, payload);
  switch (dispatch.kind) {
    case "report":
      reportConfirmError.value = "";
      pendingReportAction.value = {
        action: dispatch.action,
        record: dispatch.record
      };
      return;
    case "moderation":
      requestModerationAction(dispatch.item, dispatch.action);
      return;
    case "user":
      userConfirmError.value = "";
      pendingUserAction.value = {
        action: dispatch.action,
        record: dispatch.record
      };
      return;
    case "aiTask":
      aiTaskConfirmError.value = "";
      pendingAITaskAction.value = {
        action: dispatch.action,
        record: dispatch.record
      };
      return;
    case "template":
      templateConfirmError.value = "";
      pendingTemplateAction.value = {
        action: dispatch.action,
        record: dispatch.record
      };
      return;
    case "invalid":
      errorMessage.value = dispatch.message ?? "无法提交治理动作。";
      return;
    case "noop":
      return;
  }
}

function handleConfirmDialogCancel(key: ConfirmDialogKey) {
  if (loading.value) return;
  runAdminConfirmDialogHandler(key, confirmResetHandlers);
}

async function handleConfirmDialogConfirm(key: ConfirmDialogKey) {
  await runAdminConfirmDialogHandler(key, confirmSubmitHandlers);
}

function switchView(view: AdminView) {
  activeView.value = view;
  clearWorkspaceState(["queries", "filters", "confirmState"]);
  syncAdminLocation(view);
  loadActiveView(view);
}

function refreshActiveView() {
  loadActiveView(activeView.value);
}

function logout() {
  session.value = null;
  profile.value = null;
  clearWorkspaceState();
  activeView.value = defaultAdminRouteKey;
  syncAdminLocation(defaultAdminRouteKey, "replace");
  sessionInvalidation.value = null;
  clearSessionInvalidation();
  persistSession(null);
  notice.value = "后台会话已清空。";
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
        :empty-text="isGovernanceModuleView(activeView) ? governanceModuleConfig[activeView].empty : ''"
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
