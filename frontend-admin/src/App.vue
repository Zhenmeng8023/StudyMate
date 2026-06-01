<script setup lang="ts">
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

type AdminView =
  | "dashboard"
  | "moderation"
  | "materials"
  | "community"
  | "users"
  | "graph"
  | "ai"
  | "system"
  | "audit";

type AdminNavItem = {
  key: AdminView;
  label: string;
  badge?: string;
};

const sessionKey = "studymate.admin.session";

const form = reactive({
  login: "",
  password: ""
});

const session = ref<AuthPayload | null>(readSession());
const profile = ref<AuthUser | null>(session.value?.user ?? null);
const moderationItems = ref<ModerationItem[]>([]);
const overview = ref<OverviewPayload | null>(null);
const loading = ref(false);
const errorMessage = ref("");
const notice = ref("登录后会同步运营概览和审核队列。");
const activeView = ref<AdminView>("dashboard");

const loggedIn = computed(() => Boolean(session.value));
const pendingPosts = computed(() => moderationItems.value.filter((item) => item.type === "post"));
const pendingMaterials = computed(() => moderationItems.value.filter((item) => item.type === "material"));

const navItems = computed<AdminNavItem[]>(() => [
  { key: "dashboard", label: "概览" },
  {
    key: "moderation",
    label: "内容审核",
    badge: moderationItems.value.length ? String(moderationItems.value.length) : ""
  },
  { key: "materials", label: "资料管理" },
  { key: "community", label: "社区管理" },
  { key: "users", label: "用户管理" },
  { key: "graph", label: "图谱模板" },
  { key: "ai", label: "AI 任务" },
  { key: "system", label: "系统配置" },
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
    helper: "社区规模已接真实数据，AI 指标后续扩展。"
  }
]);

const placeholderModules = {
  materials: ["分类校正", "标签治理", "附件巡检"],
  community: ["话题治理", "举报处理", "推荐策略"],
  users: ["角色权限", "账号封禁", "活跃统计"],
  graph: ["模板审核", "推荐位管理", "模板分类"],
  ai: ["任务队列", "失败重试", "用量统计"],
  system: ["存储配置", "审核策略", "系统偏好"],
  audit: ["操作日志", "状态追踪", "问题回放"]
} as const;

if (session.value) {
  void Promise.all([refreshProfile(), loadModeration(), loadOverview()]);
}

async function login() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const payload = await fetch("/api/v1/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });
    const data = (await payload.json()) as ApiResponse<AuthPayload>;
    if (!payload.ok || !data.success) {
      throw new Error(data.error?.message ?? "管理员登录失败");
    }

    session.value = data.data;
    profile.value = data.data.user;
    window.localStorage.setItem(sessionKey, JSON.stringify(data.data));
    notice.value = "后台已进入治理模式，正在同步概览和审核队列。";
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
    const payload = await fetch("/api/v1/admin/me", {
      headers: {
        Authorization: `Bearer ${session.value.accessToken}`
      }
    });
    const data = (await payload.json()) as ApiResponse<AuthUser>;
    if (!payload.ok || !data.success) {
      throw new Error(data.error?.message ?? "读取管理员资料失败");
    }

    profile.value = data.data;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "读取管理员资料失败";
  }
}

async function loadOverview() {
  if (!session.value) {
    return;
  }

  try {
    const payload = await fetch("/api/v1/admin/overview", {
      headers: {
        Authorization: `Bearer ${session.value.accessToken}`
      }
    });
    const data = (await payload.json()) as ApiResponse<OverviewPayload>;
    if (!payload.ok || !data.success) {
      throw new Error(data.error?.message ?? "读取后台概览失败");
    }

    overview.value = data.data;
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
    const payload = await fetch("/api/v1/admin/moderation", {
      headers: {
        Authorization: `Bearer ${session.value.accessToken}`
      }
    });
    const data = (await payload.json()) as ApiResponse<ModerationItem[]>;
    if (!payload.ok || !data.success) {
      throw new Error(data.error?.message ?? "读取审核队列失败");
    }

    moderationItems.value = data.data;
    notice.value = `当前共有 ${data.data.length} 条待处理内容。`;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "读取审核队列失败";
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
    const payload = await fetch(
      `/api/v1/admin/moderation/${item.type === "post" ? "posts" : "materials"}/${item.id}/${action}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.value.accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: "" })
      }
    );
    const data = (await payload.json()) as ApiResponse<{ status: string }>;
    if (!payload.ok || !data.success) {
      throw new Error(data.error?.message ?? "更新审核状态失败");
    }

    notice.value = `“${item.title}”已更新为 ${data.data.status}。`;
    await Promise.all([loadModeration(), loadOverview()]);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "更新审核状态失败";
  } finally {
    loading.value = false;
  }
}

function logout() {
  session.value = null;
  profile.value = null;
  moderationItems.value = [];
  overview.value = null;
  activeView.value = "dashboard";
  window.localStorage.removeItem(sessionKey);
  notice.value = "后台会话已清空。";
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
            @click="activeView = item.key"
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
          <button class="secondary-button" :disabled="loading" type="button" @click="loadModeration">
            刷新审核队列
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
                <span>{{ item.type }} · {{ item.status }}</span>
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
          <div class="placeholder-list">
            <article
              v-for="item in placeholderModules[activeView as keyof typeof placeholderModules]"
              :key="item"
              class="placeholder-card"
            >
              <strong>{{ item }}</strong>
              <p>当前页面已保留模块入口，后续继续接真实数据流。</p>
            </article>
          </div>
        </template>
      </section>
    </template>
  </main>
</template>

<style scoped>
:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

.admin-shell {
  --admin-bg-0: #f4f5f2;
  --admin-bg-1: #eceee8;
  --admin-surface: rgba(255, 255, 255, 0.96);
  --admin-surface-soft: rgba(247, 248, 244, 0.96);
  --admin-line: rgba(39, 47, 43, 0.09);
  --admin-text: #1b211d;
  --admin-text-soft: #58625c;
  --admin-text-muted: #818983;
  --admin-accent: #295846;
  --admin-accent-soft: rgba(41, 88, 70, 0.1);
  --admin-danger: #bc5d53;
  --admin-sidebar: #1b201d;
  --admin-sidebar-line: rgba(255, 255, 255, 0.08);
  --admin-sidebar-text: rgba(250, 252, 249, 0.94);
  --admin-sidebar-muted: rgba(226, 231, 227, 0.64);
  --admin-shadow-lg: 0 14px 34px rgba(32, 38, 34, 0.08);
  --admin-shadow-sm: 0 6px 18px rgba(32, 38, 34, 0.05);
  --admin-shell-max: 1460px;
  --admin-radius-lg: 18px;
  --admin-radius-md: 14px;
  --admin-radius-sm: 10px;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 20px;
  min-height: 100vh;
  width: min(var(--admin-shell-max), calc(100% - 28px));
  margin: 0 auto;
  padding: 18px 0;
  color: var(--admin-text);
  background:
    radial-gradient(circle at top left, rgba(41, 88, 70, 0.04), transparent 24%),
    linear-gradient(180deg, #f9faf7 0%, #f1f3ed 100%);
}

.login-card,
.metric-card,
.moderation-card,
.placeholder-card {
  border: 1px solid var(--admin-line);
  border-radius: var(--admin-radius-lg);
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-sm);
}

.login-card {
  display: grid;
  gap: 16px;
  width: min(500px, 100%);
  margin: auto;
  padding: 30px;
}

.sidebar {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 18px 16px 16px;
  position: sticky;
  top: 18px;
  height: fit-content;
  border: 1px solid var(--admin-sidebar-line);
  border-radius: var(--admin-radius-lg);
  background: var(--admin-sidebar);
  box-shadow: none;
}

.admin-main {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 0;
  background: transparent;
}

.brand-block span,
.notice,
.metric-card span,
.metric-card p,
.moderation-card p,
.moderation-meta span,
.placeholder-card p {
  color: var(--admin-text-soft);
}

.sidebar .brand-block strong,
.sidebar .brand-block span,
.sidebar .nav-item,
.sidebar .secondary-button {
  color: var(--admin-sidebar-text);
}

.sidebar .brand-block span {
  color: var(--admin-sidebar-muted);
}

.brand-block strong,
.topbar h2,
.metric-card strong,
.moderation-head strong,
.placeholder-card strong,
.login-card h1 {
  font-weight: 700;
}

.nav-stack,
.form-stack,
.moderation-list,
.placeholder-list,
.card-grid {
  display: grid;
  gap: 12px;
}

.brand-block {
  display: grid;
  gap: 4px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--admin-sidebar-line);
}

.brand-block strong {
  font-size: 15px;
  letter-spacing: 0.02em;
}

.brand-block span {
  font-size: 12px;
}

.nav-item,
.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: var(--admin-radius-sm);
  cursor: pointer;
  font: inherit;
  transition: 180ms ease;
}

.nav-item {
  justify-content: space-between;
  color: var(--admin-text-soft);
  border-color: transparent;
  background: transparent;
}

.nav-item.active {
  color: var(--admin-sidebar-text);
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.1);
}

.primary-button {
  color: #f7faf7;
  background: var(--admin-accent);
  box-shadow: 0 8px 18px rgba(41, 88, 70, 0.16);
}

.secondary-button {
  color: var(--admin-text);
  border-color: var(--admin-line);
  background: rgba(255, 255, 255, 0.9);
}

.secondary-button.danger {
  color: #fff7f5;
  background: var(--admin-danger);
}

.sidebar .secondary-button {
  border-color: var(--admin-sidebar-line);
  color: var(--admin-sidebar-text);
  background: rgba(255, 255, 255, 0.06);
}

.topbar,
.moderation-head,
.moderation-meta,
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.status-stack {
  display: grid;
  gap: 10px;
}

.card-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.card-grid.narrow {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.metric-card,
.moderation-card,
.placeholder-card {
  padding: 18px;
  background: var(--admin-surface);
}

.metric-card strong {
  font-size: 32px;
}

.moderation-card,
.placeholder-card {
  display: grid;
  gap: 10px;
}

.action-row {
  justify-content: flex-start;
}

label {
  display: grid;
  gap: 8px;
}

input {
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--admin-line);
  border-radius: var(--admin-radius-sm);
  color: var(--admin-text);
  background: rgba(255, 255, 255, 0.98);
  font: inherit;
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--admin-accent);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.notice,
.error-text {
  margin: 0;
}

.notice {
  padding: 12px 14px;
  border: 1px solid var(--admin-line);
  border-radius: var(--admin-radius-sm);
  background: rgba(255, 255, 255, 0.92);
}

.error-text {
  padding: 12px 14px;
  border: 1px solid rgba(177, 78, 76, 0.16);
  border-radius: var(--admin-radius-sm);
  color: var(--admin-danger);
  background: rgba(177, 78, 76, 0.08);
}

.topbar {
  min-height: 64px;
  padding: 4px 0 12px;
  border-bottom: 1px solid var(--admin-line);
  background: transparent;
  box-shadow: none;
}

.topbar h2 {
  margin: 2px 0 0;
  font-size: 26px;
}

.metric-card {
  gap: 10px;
}

.metric-card p,
.placeholder-card p,
.moderation-card p {
  line-height: 1.65;
}

.moderation-head span {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid var(--admin-line);
  border-radius: 999px;
  color: var(--admin-text-muted);
  background: var(--admin-surface-soft);
}

.moderation-meta {
  padding-top: 2px;
  border-top: 1px dashed rgba(57, 74, 91, 0.14);
}

.placeholder-card {
  background: var(--admin-surface-soft);
}

.secondary-button:hover,
.nav-item:hover {
  background: rgba(255, 255, 255, 0.96);
}

.secondary-button.danger:hover {
  filter: brightness(1.02);
}

.sidebar .nav-item:hover,
.sidebar .secondary-button:hover {
  background: rgba(255, 255, 255, 0.12);
}

@media (max-width: 1100px) {
  .admin-shell,
  .card-grid,
  .card-grid.narrow {
    grid-template-columns: 1fr;
  }

  .admin-shell {
    width: calc(100% - 20px);
    padding: 14px 0;
  }

  .sidebar {
    position: static;
  }
}
</style>
