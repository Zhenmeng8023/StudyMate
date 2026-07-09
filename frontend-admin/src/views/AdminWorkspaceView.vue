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
const selectedRecord = ref<GovernanceRecord | null>(null);
const loading = ref(false);
const errorMessage = ref("");
const notice = ref("登录后会同步当前治理队列与运营数据。");
const activeView = ref<AdminView>(resolveAdminViewFromLocation());
const recordQuery = ref("");
const moderationQuery = ref("");
const pendingModerationAction = ref<{ action: ModerationAction; item: ModerationItem } | null>(null);
const moderationConfirmError = ref("");

const loggedIn = computed(() => Boolean(session.value));
const pendingPosts = computed(() => moderationItems.value.filter((item) => item.type === "post"));
const pendingMaterials = computed(() => moderationItems.value.filter((item) => item.type === "material"));
const profileInitial = computed(() => profile.value?.displayName?.trim().slice(0, 1) || "A");
const moderationConfirmTitle = computed(() => {
  const pending = pendingModerationAction.value;
  if (!pending) return "";
  if (pending.action === "approve") return "确认通过这条内容";
  if (pending.action === "reject") return "确认驳回这条内容";
  return "确认隐藏这条内容";
});
const moderationConfirmDescription = computed(() => {
  const pending = pendingModerationAction.value;
  if (!pending) return "";
  if (pending.action === "approve") return `通过后，“${pending.item.title}”将按审核结果进入可见状态。`;
  if (pending.action === "reject") return `驳回后，“${pending.item.title}”会退出当前待处理队列。`;
  return `隐藏后，“${pending.item.title}”将不再继续对外展示。`;
});
const moderationConfirmLabel = computed(() => {
  const pending = pendingModerationAction.value;
  if (!pending) return "确认";
  if (pending.action === "approve") return "确认通过";
  if (pending.action === "reject") return "确认驳回";
  return "确认隐藏";
});
const moderationConfirmingLabel = computed(() => {
  const pending = pendingModerationAction.value;
  if (!pending) return "处理中…";
  if (pending.action === "approve") return "通过中…";
  if (pending.action === "reject") return "驳回中…";
  return "隐藏中…";
});
const moderationConfirmTone = computed(() => (pendingModerationAction.value?.action === "approve" ? "default" : "danger"));

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
const loginPrompt = computed(() => (sessionInvalidation.value ? "后台会话已失效，请重新登录后继续治理工作。" : ""));
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
const overviewCards = computed(() => [
  { label: "待处理", value: String(overview.value?.pendingModerationCount ?? moderationItems.value.length), helper: "需要审核或复核的公开内容" },
  { label: "用户规模", value: String(overview.value?.userCount ?? 0), helper: "当前已注册的学习者与管理员" },
  { label: "资料沉淀", value: String(overview.value?.materialCount ?? 0), helper: "可被阅读、引用和治理的资料" },
  { label: "知识图谱", value: String(overview.value?.graphCount ?? 0), helper: "用户持续维护的知识结构" }
]);
const governanceConfig: Record<Exclude<AdminView, "dashboard" | "moderation">, { endpoint: string; query: { limit: number }; empty: string; description: string }> = {
  materials: { endpoint: "/api/v1/admin/files", query: { limit: 20 }, empty: "暂无文件治理记录。", description: "检查文件状态、归属与存储信息。" },
  community: { endpoint: "/api/v1/admin/reports", query: { limit: 20 }, empty: "暂无举报记录。", description: "集中查看用户提交的举报与处理线索。" },
  users: { endpoint: "/api/v1/admin/users", query: { limit: 20 }, empty: "暂无用户记录。", description: "按账号状态与角色查看用户资料。" },
  graph: { endpoint: "/api/v1/admin/tags", query: { limit: 20 }, empty: "暂无标签记录。", description: "管理资料、笔记与图谱中的分类标签。" },
  ai: { endpoint: "/api/v1/admin/ai/tasks", query: { limit: 20 }, empty: "暂无 AI 任务。", description: "追踪生成任务、状态与用量概览。" },
  system: { endpoint: "/api/v1/admin/files", query: { limit: 20 }, empty: "暂无文件记录。", description: "查看上传文件与存储治理信息。" },
  audit: { endpoint: "/api/v1/admin/audit-logs", query: { limit: 20 }, empty: "暂无审计日志。", description: "查看关键治理操作的可追溯记录。" }
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
  const preferred = ["title", "name", "originalName", "username", "email", "role", "status", "action", "createdAt", "updatedAt", "id"];
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
    selectedRecord.value = null;
    pendingModerationAction.value = null;
    moderationConfirmError.value = "";
    activeView.value = defaultAdminRouteKey;
    syncAdminLocation(defaultAdminRouteKey, "replace");
    errorMessage.value = "";
    notice.value = "后台会话已失效，请重新登录。";
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
  try {
    moderationItems.value = await get<ModerationItem[]>("/api/v1/admin/moderation");
    notice.value = `当前共有 ${moderationItems.value.length} 条待处理内容。`;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "读取审核队列失败";
  } finally {
    loading.value = false;
  }
}

async function loadGovernance(view: AdminView) {
  if (!session.value || view === "dashboard" || view === "moderation") return;
  loading.value = true;
  errorMessage.value = "";
  governanceRows.value = [];
  governanceSummary.value = null;
  selectedRecord.value = null;
  try {
    const config = governanceConfig[view];
    governanceRows.value = await get<GovernanceRecord[]>(config.endpoint, config.query);
    selectedRecord.value = governanceRows.value[0] ?? null;
    if (view === "ai") {
      governanceSummary.value = await get<GovernanceRecord>("/api/v1/admin/ai/usage");
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
  try {
    const path = `/api/v1/admin/moderation/${item.type === "post" ? "posts" : "materials"}/${item.id}/${action}`;
    const data = await post<{ status: string }>(path, { reason: "" });
    pendingModerationAction.value = null;
    notice.value = `“${item.title}” 已更新为 ${data.status}。`;
    await Promise.all([loadModeration(), loadOverview()]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新审核状态失败";
    errorMessage.value = message;
    moderationConfirmError.value = message;
  } finally {
    loading.value = false;
  }
}

function requestModerationAction(item: ModerationItem, action: ModerationAction) {
  moderationConfirmError.value = "";
  pendingModerationAction.value = { action, item };
}

function closeModerationConfirm() {
  if (loading.value) return;
  pendingModerationAction.value = null;
  moderationConfirmError.value = "";
}

async function confirmModerationAction() {
  const pending = pendingModerationAction.value;
  if (!pending) return;
  await applyModerationAction(pending.item, pending.action);
}

function switchView(view: AdminView) {
  activeView.value = view;
  recordQuery.value = "";
  moderationQuery.value = "";
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
  selectedRecord.value = null;
  pendingModerationAction.value = null;
  moderationConfirmError.value = "";
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
        :items="visibleModerationItems"
        :query="moderationQuery"
        :total-count="moderationItems.length"
        @request-action="requestModerationAction($event.item, $event.action)"
        @update:query="moderationQuery = $event"
      />

      <AdminGovernanceModule
        v-else
        :columns="governanceColumns"
        :empty-text="governanceConfig[activeView as keyof typeof governanceConfig].empty"
        :query="recordQuery"
        :rows="visibleGovernanceRows"
        :selected-record="selectedRecord"
        :summary="governanceSummary"
        :total-count="governanceRows.length"
        @select-record="selectRecord"
        @update:query="recordQuery = $event"
      />
    </AdminShellFrame>
  </main>
</template>
