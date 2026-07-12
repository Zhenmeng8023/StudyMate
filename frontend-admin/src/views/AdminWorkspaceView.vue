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
import AdminConfirmDialog from "../components/admin/AdminConfirmDialog.vue";
import AdminLoginPanel from "../components/admin/AdminLoginPanel.vue";
import AdminShellFrame from "../components/admin/AdminShellFrame.vue";
import { defaultAdminRouteKey, getAdminRoutePath, normalizeAdminRoutePath, parseAdminRoutePath } from "../router";
import type { AdminRouteKey } from "../router";
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
type AdminNavItem = {
  key: AdminView;
  label: string;
  icon: string;
  group: "总览" | "治理" | "系统";
  badge?: string;
};
type GovernanceRecord = Record<string, string | number | boolean | null | undefined>;

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
const moderationConfirmTitle = computed(() => {
  const pending = pendingModerationAction.value;
  if (!pending) return "";
  if (pending.action === "approve") return pending.item.status === "hidden" ? "确认恢复这条资料" : "确认通过这条内容";
  if (pending.action === "reject") return "确认驳回这条内容";
  return "确认隐藏这条内容";
});
const moderationConfirmDescription = computed(() => {
  const pending = pendingModerationAction.value;
  if (!pending) return "";
  if (pending.action === "approve") {
    if (pending.item.status === "hidden") return `恢复后，“${pending.item.title}”会重新回到可见资料状态。`;
    return `通过后，“${pending.item.title}”将按审核结果进入可见状态。`;
  }
  if (pending.action === "reject") return `驳回后，“${pending.item.title}”会退出当前待处理队列。`;
  return `隐藏后，“${pending.item.title}”将不再继续对外展示。`;
});
const moderationConfirmLabel = computed(() => {
  const pending = pendingModerationAction.value;
  if (!pending) return "确认";
  if (pending.action === "approve") return pending.item.status === "hidden" ? "确认恢复" : "确认通过";
  if (pending.action === "reject") return "确认驳回";
  return "确认隐藏";
});
const moderationConfirmingLabel = computed(() => {
  const pending = pendingModerationAction.value;
  if (!pending) return "处理中…";
  if (pending.action === "approve") return pending.item.status === "hidden" ? "恢复中…" : "通过中…";
  if (pending.action === "reject") return "驳回中…";
  return "隐藏中…";
});
const moderationConfirmTone = computed(() => (pendingModerationAction.value?.action === "approve" ? "default" : "danger"));
const governanceActions = computed(() => {
  if (!selectedRecord.value) return [];

  const status = String(selectedRecord.value.status ?? "").toLowerCase();
  if (activeView.value === "community") {
    if (status !== "pending") return [];
    return [
      { key: "resolve", label: "标记已处理" },
      { key: "dismiss", label: "忽略举报", tone: "danger" as const }
    ];
  }

  if (activeView.value === "materials") {
    if (status === "pending") {
      return [
        { key: "approve", label: "通过资料" },
        { key: "reject", label: "驳回资料", tone: "danger" as const }
      ];
    }
    if (status === "approved") {
      return [
        { key: "hide", label: "下架资料", tone: "danger" as const }
      ];
    }
    if (status === "hidden") {
      return [
        { key: "approve", label: "恢复资料" }
      ];
    }
  }

  if (activeView.value === "users") {
    const role = String(selectedRecord.value.role ?? "").toLowerCase();
    if (role === "admin") return [];
    if (status === "active") {
      return [
        { key: "disable", label: "禁用用户", tone: "danger" as const }
      ];
    }
    if (status === "disabled") {
      return [
        { key: "activate", label: "恢复用户" }
      ];
    }
  }

  if (activeView.value === "ai") {
    if (status === "failed") {
      return [
        { key: "retry", label: "重试任务" }
      ];
    }
    if (status === "pending") {
      return [
        { key: "cancel", label: "取消任务", tone: "danger" as const }
      ];
    }
  }

  if (activeView.value === "graph") {
    if (status === "published") {
      return [
        { key: "unpublish", label: "下架模板", tone: "danger" as const }
      ];
    }
    if (status === "unpublished") {
      return [
        { key: "publish", label: "发布模板" }
      ];
    }
  }

  return [];
});
const reportConfirmTitle = computed(() => {
  const pending = pendingReportAction.value;
  if (!pending) return "";
  if (pending.action === "resolve") return "确认标记这条举报已处理";
  return "确认忽略这条举报";
});
const reportConfirmDescription = computed(() => {
  const pending = pendingReportAction.value;
  if (!pending) return "";
  if (pending.action === "resolve") return "处理后，这条举报会退出待处理状态，并记录处理人和处理时间。";
  return "忽略后，这条举报会标记为已忽略，并保留完整审计记录。";
});
const reportConfirmLabel = computed(() => (pendingReportAction.value?.action === "dismiss" ? "确认忽略" : "确认已处理"));
const reportConfirmingLabel = computed(() => (pendingReportAction.value?.action === "dismiss" ? "忽略中..." : "处理中..."));
const reportConfirmTone = computed(() => (pendingReportAction.value?.action === "dismiss" ? "danger" : "default"));
const userConfirmTitle = computed(() => {
  const pending = pendingUserAction.value;
  if (!pending) return "";
  return pending.action === "disable" ? "确认禁用这个用户" : "确认恢复这个用户";
});
const userConfirmDescription = computed(() => {
  const pending = pendingUserAction.value;
  if (!pending) return "";
  const username = String(pending.record.username ?? pending.record.displayName ?? pending.record.id ?? "");
  return pending.action === "disable"
    ? `禁用后，${username} 将不能继续登录，后续 refresh 也会被拒绝。`
    : `恢复后，${username} 可以重新登录并继续使用现有账号。`;
});
const userConfirmLabel = computed(() => (pendingUserAction.value?.action === "disable" ? "确认禁用" : "确认恢复"));
const userConfirmingLabel = computed(() => (pendingUserAction.value?.action === "disable" ? "禁用中..." : "恢复中..."));
const userConfirmTone = computed(() => (pendingUserAction.value?.action === "disable" ? "danger" : "default"));
const aiTaskConfirmTitle = computed(() => {
  const pending = pendingAITaskAction.value;
  if (!pending) return "";
  return pending.action === "retry" ? "确认重试这个 AI 任务" : "确认取消这个 AI 任务";
});
const aiTaskConfirmDescription = computed(() => {
  const pending = pendingAITaskAction.value;
  if (!pending) return "";
  const taskID = String(pending.record.id ?? "");
  return pending.action === "retry"
    ? `重试后，任务 ${taskID} 会重新回到待处理状态，并清空当前失败信息。`
    : `取消后，任务 ${taskID} 会退出待处理状态，并保留可追溯审计记录。`;
});
const aiTaskConfirmLabel = computed(() => (pendingAITaskAction.value?.action === "cancel" ? "确认取消" : "确认重试"));
const aiTaskConfirmingLabel = computed(() => (pendingAITaskAction.value?.action === "cancel" ? "取消中..." : "重试中..."));
const aiTaskConfirmTone = computed(() => (pendingAITaskAction.value?.action === "cancel" ? "danger" : "default"));
const templateConfirmTitle = computed(() => {
  const pending = pendingTemplateAction.value;
  if (!pending) return "";
  return pending.action === "publish" ? "确认发布这个图谱模板" : "确认下架这个图谱模板";
});
const templateConfirmDescription = computed(() => {
  const pending = pendingTemplateAction.value;
  if (!pending) return "";
  const name = String(pending.record.name ?? pending.record.title ?? pending.record.id ?? "");
  return pending.action === "publish"
    ? `${name} 发布后会重新出现在用户端图谱模板列表中。`
    : `${name} 下架后会从用户端图谱模板列表中隐藏，但保留后台治理记录。`;
});
const templateConfirmLabel = computed(() => (pendingTemplateAction.value?.action === "publish" ? "确认发布" : "确认下架"));
const templateConfirmingLabel = computed(() => (pendingTemplateAction.value?.action === "publish" ? "发布中..." : "下架中..."));
const templateConfirmTone = computed(() => (pendingTemplateAction.value?.action === "publish" ? "default" : "danger"));

const navItems = computed<AdminNavItem[]>(() => [
  { key: "dashboard", label: "概览", icon: "▦", group: "总览" },
  { key: "moderation", label: "内容审核", icon: "✓", group: "治理", badge: moderationItems.value.length ? String(moderationItems.value.length) : "" },
  { key: "materials", label: "资料治理", icon: "▤", group: "治理" },
  { key: "community", label: "举报处理", icon: "⚑", group: "治理" },
  { key: "users", label: "用户治理", icon: "◉", group: "治理" },
  { key: "graph", label: "标签治理", icon: "◇", group: "治理" },
  { key: "ai", label: "AI 任务", icon: "✦", group: "系统" },
  { key: "system", label: "文件治理", icon: "▣", group: "系统" },
  { key: "audit", label: "审计日志", icon: "≡", group: "系统" }
]);
const navGroups = computed(() => ["总览", "治理", "系统"].map((group) => ({
  group: group as AdminNavItem["group"],
  items: navItems.value.filter((item) => item.group === group)
})));
const activeMeta = computed(() => navItems.value.find((item) => item.key === activeView.value) ?? navItems.value[0]);
const loginPrompt = computed(() => getSessionInvalidationPrompt(sessionInvalidation.value, "admin"));
const activeDescription = computed(() => {
  if (activeView.value === "dashboard") {
    return "优先处理待审核内容，再查看用户、资料与图谱的总体变化。";
  }
  if (activeView.value === "moderation") {
    return "快速判断内容风险与发布状态，所有操作都会保留可追溯线索。";
  }
  return governanceConfig[activeView.value as keyof typeof governanceConfig]?.description ?? "";
});
const activeCountLabel = computed(() => {
  if (activeView.value === "moderation") {
    return `${moderationItems.value.length} 条待处理`;
  }
  if (activeView.value === "dashboard") {
    return "";
  }
  return `${governanceRows.value.length} 条记录`;
});
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

const visibleModerationItems = computed(() => {
  const query = moderationQuery.value.trim().toLowerCase();
  if (!query) return moderationItems.value;
  return moderationItems.value.filter((item) =>
    [item.title, item.summary, item.authorName, item.type, item.status].join(" ").toLowerCase().includes(query)
  );
});
const visibleGovernanceRows = computed(() => {
  const query = recordQuery.value.trim().toLowerCase();
  if (!query) return governanceRows.value;
  return governanceRows.value.filter((row) =>
    Object.values(row).some((value) => formatCell(value).toLowerCase().includes(query))
  );
});
const governanceColumns = computed(() => {
  const preferred = ["title", "taskType", "name", "originalName", "username", "email", "role", "status", "handledBy", "handledAt", "model", "errorMessage", "sourceType", "sourceId", "action", "createdAt", "updatedAt", "id"];
  const keys = new Set<string>();
  governanceRows.value.forEach((row) => Object.keys(row).forEach((key) => keys.add(key)));
  return Array.from(keys)
    .sort((a, b) => {
      const aIndex = preferred.indexOf(a);
      const bIndex = preferred.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .slice(0, 7);
});

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
  recordQuery.value = "";
  moderationQuery.value = "";
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
    moderationItems.value = [];
    overview.value = null;
    governanceRows.value = [];
    governanceSummary.value = null;
    governanceRowsView.value = null;
    selectedRecord.value = null;
    pendingModerationAction.value = null;
    moderationConfirmError.value = "";
    pendingReportAction.value = null;
    reportConfirmError.value = "";
    pendingUserAction.value = null;
    userConfirmError.value = "";
    pendingAITaskAction.value = null;
    aiTaskConfirmError.value = "";
    pendingTemplateAction.value = null;
    templateConfirmError.value = "";
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
    const config = governanceConfig[view];
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
  if (activeView.value === "community") {
    if (payload.action !== "resolve" && payload.action !== "dismiss") return;

    reportConfirmError.value = "";
    pendingReportAction.value = {
      action: payload.action,
      record: payload.record
    };
    return;
  }

  if (activeView.value === "materials") {
    if (payload.action !== "approve" && payload.action !== "reject" && payload.action !== "hide") return;

    const item = mapGovernanceRecordToMaterial(payload.record);
    if (!item) {
      errorMessage.value = "资料记录字段不完整，无法提交治理动作。";
      return;
    }
    requestModerationAction(item, payload.action);
    return;
  }

  if (activeView.value === "users") {
    if (payload.action !== "disable" && payload.action !== "activate") return;

    userConfirmError.value = "";
    pendingUserAction.value = {
      action: payload.action,
      record: payload.record
    };
    return;
  }

  if (activeView.value === "ai") {
    if (payload.action !== "retry" && payload.action !== "cancel") return;

    aiTaskConfirmError.value = "";
    pendingAITaskAction.value = {
      action: payload.action,
      record: payload.record
    };
    return;
  }

  if (activeView.value === "graph") {
    if (payload.action !== "publish" && payload.action !== "unpublish") return;

    templateConfirmError.value = "";
    pendingTemplateAction.value = {
      action: payload.action,
      record: payload.record
    };
  }
}

function mapGovernanceRecordToMaterial(record: GovernanceRecord): ModerationItem | null {
  const id = String(record.id ?? "").trim();
  const title = String(record.title ?? "").trim();
  if (!id || !title) return null;

  const summarySource = record.description ?? record.category ?? record.attachmentName ?? "";
  return {
    id,
    type: "material",
    title,
    summary: String(summarySource),
    authorName: String(record.ownerName ?? ""),
    status: String(record.status ?? ""),
    createdAt: String(record.createdAt ?? ""),
    updatedAt: String(record.updatedAt ?? "")
  };
}

function closeModerationConfirm() {
  if (loading.value) return;
  pendingModerationAction.value = null;
  moderationConfirmError.value = "";
}

function closeReportConfirm() {
  if (loading.value) return;
  pendingReportAction.value = null;
  reportConfirmError.value = "";
}

function closeUserConfirm() {
  if (loading.value) return;
  pendingUserAction.value = null;
  userConfirmError.value = "";
}

function closeAITaskConfirm() {
  if (loading.value) return;
  pendingAITaskAction.value = null;
  aiTaskConfirmError.value = "";
}

function closeTemplateConfirm() {
  if (loading.value) return;
  pendingTemplateAction.value = null;
  templateConfirmError.value = "";
}

async function confirmModerationAction() {
  const pending = pendingModerationAction.value;
  if (!pending) return;
  await applyModerationAction(pending.item, pending.action);
}

async function confirmReportAction() {
  const pending = pendingReportAction.value;
  if (!pending) return;
  await applyReportAction(pending.record, pending.action);
}

async function confirmUserAction() {
  const pending = pendingUserAction.value;
  if (!pending) return;
  await applyUserAction(pending.record, pending.action);
}

async function confirmAITaskAction() {
  const pending = pendingAITaskAction.value;
  if (!pending) return;
  await applyAITaskAction(pending.record, pending.action);
}

async function confirmTemplateAction() {
  const pending = pendingTemplateAction.value;
  if (!pending) return;
  await applyTemplateAction(pending.record, pending.action);
}

function switchView(view: AdminView) {
  activeView.value = view;
  recordQuery.value = "";
  moderationQuery.value = "";
  pendingModerationAction.value = null;
  moderationConfirmError.value = "";
  pendingReportAction.value = null;
  reportConfirmError.value = "";
  pendingUserAction.value = null;
  userConfirmError.value = "";
  pendingAITaskAction.value = null;
  aiTaskConfirmError.value = "";
  pendingTemplateAction.value = null;
  templateConfirmError.value = "";
  syncAdminLocation(view);
  loadActiveView(view);
}

function refreshActiveView() {
  loadActiveView(activeView.value);
}

function logout() {
  session.value = null;
  profile.value = null;
  moderationItems.value = [];
  overview.value = null;
  governanceRows.value = [];
  governanceSummary.value = null;
  governanceRowsView.value = null;
  selectedRecord.value = null;
  pendingModerationAction.value = null;
  moderationConfirmError.value = "";
  pendingReportAction.value = null;
  reportConfirmError.value = "";
  pendingUserAction.value = null;
  userConfirmError.value = "";
  pendingAITaskAction.value = null;
  aiTaskConfirmError.value = "";
  pendingTemplateAction.value = null;
  templateConfirmError.value = "";
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

function formatCell(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value);
}

function selectRecord(row: GovernanceRecord) {
  selectedRecord.value = row;
}
</script>

<template>
  <main>
    <AdminConfirmDialog
      cancel-label="取消"
      :confirm-label="moderationConfirmLabel"
      :confirm-tone="moderationConfirmTone"
      :confirming="loading"
      :confirming-label="moderationConfirmingLabel"
      :description="moderationConfirmDescription"
      :error-message="moderationConfirmError"
      :is-open="Boolean(pendingModerationAction)"
      :title="moderationConfirmTitle"
      @cancel="closeModerationConfirm"
      @confirm="confirmModerationAction"
    />
    <AdminConfirmDialog
      cancel-label="取消"
      :confirm-label="reportConfirmLabel"
      :confirm-tone="reportConfirmTone"
      :confirming="loading"
      :confirming-label="reportConfirmingLabel"
      :description="reportConfirmDescription"
      :error-message="reportConfirmError"
      :is-open="Boolean(pendingReportAction)"
      :title="reportConfirmTitle"
      @cancel="closeReportConfirm"
      @confirm="confirmReportAction"
    />
    <AdminConfirmDialog
      cancel-label="取消"
      :confirm-label="aiTaskConfirmLabel"
      :confirm-tone="aiTaskConfirmTone"
      :confirming="loading"
      :confirming-label="aiTaskConfirmingLabel"
      :description="aiTaskConfirmDescription"
      :error-message="aiTaskConfirmError"
      :is-open="Boolean(pendingAITaskAction)"
      :title="aiTaskConfirmTitle"
      @cancel="closeAITaskConfirm"
      @confirm="confirmAITaskAction"
    />
    <AdminConfirmDialog
      cancel-label="取消"
      :confirm-label="templateConfirmLabel"
      :confirm-tone="templateConfirmTone"
      :confirming="loading"
      :confirming-label="templateConfirmingLabel"
      :description="templateConfirmDescription"
      :error-message="templateConfirmError"
      :is-open="Boolean(pendingTemplateAction)"
      :title="templateConfirmTitle"
      @cancel="closeTemplateConfirm"
      @confirm="confirmTemplateAction"
    />

    <AdminConfirmDialog
      cancel-label="取消"
      :confirm-label="userConfirmLabel"
      :confirm-tone="userConfirmTone"
      :confirming="loading"
      :confirming-label="userConfirmingLabel"
      :description="userConfirmDescription"
      :error-message="userConfirmError"
      :is-open="Boolean(pendingUserAction)"
      :title="userConfirmTitle"
      @cancel="closeUserConfirm"
      @confirm="confirmUserAction"
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
        :total-count="moderationItems.length"
        @request-action="requestModerationAction($event.item, $event.action)"
        @update:query="moderationQuery = $event"
      />

      <AdminGovernanceModule
        v-else
        :actions="governanceActions"
        :columns="governanceColumns"
        :data-state="governanceDataState"
        :empty-text="governanceConfig[activeView as keyof typeof governanceConfig].empty"
        :query="recordQuery"
        :rows="visibleGovernanceRows"
        :selected-record="selectedRecord"
        :summary="governanceSummary"
        :total-count="governanceRows.length"
        @request-action="requestGovernanceAction"
        @select-record="selectRecord"
        @update:query="recordQuery = $event"
      />
    </AdminShellFrame>
  </main>
</template>
