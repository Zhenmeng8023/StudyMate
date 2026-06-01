<script setup lang="ts">
import "../components/admin/admin.css";
import { computed, reactive, ref } from "vue";

interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
}

interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: AuthUser;
}

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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

type AdminView = "dashboard" | "moderation" | "materials" | "community" | "users" | "graph" | "ai" | "system" | "audit";

type AdminNavItem = {
  key: AdminView;
  label: string;
  badge?: string;
};

type GovernanceRecord = Record<string, string | number | boolean | null | undefined>;

const sessionKey = "studymate.admin.session";

const form = reactive({
  login: "",
  password: ""
});

const session = ref<AuthPayload | null>(readSession());
const profile = ref<AuthUser | null>(session.value?.user ?? null);
const moderationItems = ref<ModerationItem[]>([]);
const overview = ref<OverviewPayload | null>(null);
const governanceRows = ref<GovernanceRecord[]>([]);
const governanceSummary = ref<GovernanceRecord | null>(null);
const loading = ref(false);
const errorMessage = ref("");
const notice = ref("登录后会同步运营概览、审核队列和治理模块。");
const activeView = ref<AdminView>("dashboard");

const loggedIn = computed(() => Boolean(session.value));
const pendingPosts = computed(() => moderationItems.value.filter((item) => item.type === "post"));
const pendingMaterials = computed(() => moderationItems.value.filter((item) => item.type === "material"));

const navItems = computed<AdminNavItem[]>(() => [
  { key: "dashboard", label: "概览" },
  { key: "moderation", label: "内容审核", badge: moderationItems.value.length ? String(moderationItems.value.length) : "" },
  { key: "materials", label: "资料治理" },
  { key: "community", label: "举报处理" },
  { key: "users", label: "用户治理" },
  { key: "graph", label: "标签治理" },
  { key: "ai", label: "AI 任务" },
  { key: "system", label: "文件治理" },
  { key: "audit", label: "审计日志" }
]);

const overviewCards = computed(() => [
  {
    label: "待审核内容",
    value: String(overview.value?.pendingModerationCount ?? moderationItems.value.length),
    helper: "帖子、资料和后续公开内容统一进入治理队列。"
  },
  {
    label: "资料总量",
    value: String(overview.value?.materialCount ?? 0),
    helper: "用于跟踪资料沉淀规模和审核压力。"
  },
  {
    label: "用户 / 图谱",
    value: `${overview.value?.userCount ?? 0} / ${overview.value?.graphCount ?? 0}`,
    helper: "用户与图谱总量用于判断试用期活跃面。"
  },
  {
    label: "帖子总量",
    value: String(overview.value?.postCount ?? 0),
    helper: "社区规模已接真实数据，举报和审核走同一治理面板。"
  }
]);

const governanceConfig: Record<Exclude<AdminView, "dashboard" | "moderation">, { endpoint: string; empty: string }> = {
  materials: { endpoint: "/api/v1/admin/files?limit=20", empty: "暂无文件治理记录。" },
  community: { endpoint: "/api/v1/admin/reports?limit=20", empty: "暂无举报记录。" },
  users: { endpoint: "/api/v1/admin/users?limit=20", empty: "暂无用户记录。" },
  graph: { endpoint: "/api/v1/admin/tags?limit=20", empty: "暂无标签记录。" },
  ai: { endpoint: "/api/v1/admin/ai/tasks?limit=20", empty: "暂无 AI 任务。" },
  system: { endpoint: "/api/v1/admin/files?limit=20", empty: "暂无文件记录。" },
  audit: { endpoint: "/api/v1/admin/audit-logs?limit=20", empty: "暂无审计日志。" }
};

if (session.value) {
  void Promise.all([refreshProfile(), loadModeration(), loadOverview()]);
}

async function login() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const data = await post<AuthPayload>("/api/v1/admin/login", form);
    session.value = data;
    profile.value = data.user;
    window.localStorage.setItem(sessionKey, JSON.stringify(data));
    notice.value = "后台已进入治理模式，正在同步真实数据。";
    await Promise.all([refreshProfile(), loadModeration(), loadOverview()]);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "管理员登录失败";
  } finally {
    loading.value = false;
  }
}

async function refreshProfile() {
  if (!session.value) {
    return;
  }

  try {
    profile.value = await get<AuthUser>("/api/v1/admin/me");
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "读取管理员资料失败";
  }
}

async function loadOverview() {
  if (!session.value) {
    return;
  }

  try {
    overview.value = await get<OverviewPayload>("/api/v1/admin/overview");
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "读取后台概览失败";
  }
}

async function loadModeration() {
  if (!session.value) {
    return;
  }

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
  if (!session.value || view === "dashboard" || view === "moderation") {
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  governanceRows.value = [];
  governanceSummary.value = null;

  try {
    const config = governanceConfig[view];
    governanceRows.value = await get<GovernanceRecord[]>(config.endpoint);
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

async function moderate(item: ModerationItem, action: "approve" | "reject" | "hide") {
  if (!session.value) {
    return;
  }

  loading.value = true;
  errorMessage.value = "";

  try {
    const path = `/api/v1/admin/moderation/${item.type === "post" ? "posts" : "materials"}/${item.id}/${action}`;
    const data = await post<{ status: string }>(path, { reason: "" });
    notice.value = `"${item.title}" 已更新为 ${data.status}。`;
    await Promise.all([loadModeration(), loadOverview()]);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "更新审核状态失败";
  } finally {
    loading.value = false;
  }
}

function switchView(view: AdminView) {
  activeView.value = view;
  void loadGovernance(view);
}

function logout() {
  session.value = null;
  profile.value = null;
  moderationItems.value = [];
  overview.value = null;
  governanceRows.value = [];
  governanceSummary.value = null;
  activeView.value = "dashboard";
  window.localStorage.removeItem(sessionKey);
  notice.value = "后台会话已清空。";
}

async function get<T>(path: string) {
  const payload = await fetch(path, {
    headers: {
      Authorization: `Bearer ${session.value?.accessToken ?? ""}`
    }
  });
  return readResponse<T>(payload);
}

async function post<T>(path: string, body: unknown) {
  const payload = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: session.value ? `Bearer ${session.value.accessToken}` : "",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  return readResponse<T>(payload);
}

async function readResponse<T>(payload: Response) {
  const data = (await payload.json()) as ApiResponse<T>;
  if (!payload.ok || !data.success) {
    throw new Error(data.error?.message ?? "请求失败");
  }
  return data.data;
}

function readSession(): AuthPayload | null {
  const raw = window.localStorage.getItem(sessionKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthPayload;
  } catch {
    return null;
  }
}

function formatCell(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
}
</script>

<template>
  <main class="admin-shell">
    <section v-if="!loggedIn" class="login-card">
      <p class="eyebrow">Admin</p>
      <h1>StudyMate 管理后台</h1>
      <form class="form-stack" @submit.prevent="login">
        <label>
          <span>账号</span>
          <input v-model="form.login" placeholder="用户名或邮箱" />
        </label>
        <label>
          <span>密码</span>
          <input v-model="form.password" placeholder="密码" type="password" />
        </label>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <button class="primary-button" :disabled="loading" type="submit">
          {{ loading ? "登录中..." : "登录" }}
        </button>
      </form>
    </section>

    <template v-else>
      <aside class="sidebar">
        <div class="brand-block">
          <strong>StudyMate Admin</strong>
          <span>{{ profile?.displayName }}</span>
        </div>

        <nav class="nav-stack">
          <button
            v-for="item in navItems"
            :key="item.key"
            :class="activeView === item.key ? 'nav-item active' : 'nav-item'"
            type="button"
            @click="switchView(item.key)"
          >
            <span>{{ item.label }}</span>
            <small v-if="item.badge">{{ item.badge }}</small>
          </button>
        </nav>

        <button class="secondary-button" type="button" @click="logout">退出</button>
      </aside>

      <section class="admin-main">
        <header class="topbar">
          <div>
            <p class="eyebrow">运营面板</p>
            <h2>{{ navItems.find((item) => item.key === activeView)?.label }}</h2>
          </div>
          <button class="secondary-button" :disabled="loading" type="button" @click="activeView === 'moderation' ? loadModeration() : loadGovernance(activeView)">
            刷新当前模块
          </button>
        </header>

        <div class="status-stack">
          <p class="notice">{{ notice }}</p>
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        </div>

        <template v-if="activeView === 'dashboard'">
          <div class="card-grid">
            <article v-for="card in overviewCards" :key="card.label" class="metric-card">
              <span>{{ card.label }}</span>
              <strong>{{ card.value }}</strong>
              <p>{{ card.helper }}</p>
            </article>
          </div>
        </template>

        <template v-else-if="activeView === 'moderation'">
          <div class="card-grid narrow">
            <article class="metric-card">
              <span>待审帖子</span>
              <strong>{{ pendingPosts.length }}</strong>
              <p>社区内容审核入口。</p>
            </article>
            <article class="metric-card">
              <span>待审资料</span>
              <strong>{{ pendingMaterials.length }}</strong>
              <p>资料与版权状态审核入口。</p>
            </article>
          </div>

          <div class="moderation-list">
            <article v-for="item in moderationItems" :key="item.id" class="moderation-card">
              <div class="moderation-head">
                <strong>{{ item.title }}</strong>
                <span>{{ item.type }} / {{ item.status }}</span>
              </div>
              <p>{{ item.summary }}</p>
              <div class="moderation-meta">
                <span>{{ item.authorName }}</span>
                <span>{{ new Date(item.createdAt).toLocaleString("zh-CN") }}</span>
              </div>
              <div class="action-row">
                <button class="secondary-button" type="button" @click="moderate(item, 'approve')">通过</button>
                <button class="secondary-button danger" type="button" @click="moderate(item, 'reject')">驳回</button>
                <button class="secondary-button" type="button" @click="moderate(item, 'hide')">隐藏</button>
              </div>
            </article>
          </div>
        </template>

        <template v-else>
          <div v-if="governanceSummary" class="card-grid narrow">
            <article v-for="(value, key) in governanceSummary" :key="key" class="metric-card">
              <span>{{ key }}</span>
              <strong>{{ value }}</strong>
              <p>来自 /api/v1/admin/ai/usage。</p>
            </article>
          </div>

          <div class="placeholder-list">
            <article v-if="!governanceRows.length" class="placeholder-card">
              <strong>{{ governanceConfig[activeView as keyof typeof governanceConfig].empty }}</strong>
              <p>模块已经接入真实 API；当前没有可显示记录。</p>
            </article>
            <article v-for="(row, index) in governanceRows" :key="index" class="placeholder-card">
              <strong>{{ formatCell(row.title ?? row.name ?? row.originalName ?? row.username ?? row.action ?? row.id) }}</strong>
              <p v-for="(value, key) in row" :key="key">{{ key }}: {{ formatCell(value) }}</p>
            </article>
          </div>
        </template>
      </section>
    </template>
  </main>
</template>
