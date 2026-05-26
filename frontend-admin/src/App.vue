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
const loading = ref(false);
const errorMessage = ref("");
const notice = ref("登录后会同步审核队列、运营统计和治理入口。");
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
    value: String(moderationItems.value.length),
    helper: "帖子、资料和后续内容会统一回到这条治理队列里。"
  },
  {
    label: "资料审核",
    value: String(pendingMaterials.value.length),
    helper: "分类、标签和附件巡检会继续接到这一块。"
  },
  {
    label: "社区审核",
    value: String(pendingPosts.value.length),
    helper: "帖子、评论和举报处理会逐步回到统一界面。"
  },
  {
    label: "AI 任务",
    value: "占位",
    helper: "后面会展示调用量、失败任务和人工确认状态。"
  }
]);

const placeholderModules = {
  materials: ["分类纠正", "标签治理", "附件巡检"],
  community: ["话题治理", "举报处理", "推荐策略"],
  users: ["角色权限", "账号禁用", "活跃统计"],
  graph: ["模板审核", "推荐位管理", "模板分类"],
  ai: ["任务队列", "失败重试", "用量统计"],
  system: ["存储配置", "审核策略", "系统偏好"],
  audit: ["操作日志", "状态追踪", "问题回放"]
} as const;

if (session.value) {
  void Promise.all([refreshProfile(), loadModeration()]);
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
    notice.value = "后台已经进入治理模式，正在同步概览和审核队列。";
    await Promise.all([refreshProfile(), loadModeration()]);
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

    notice.value = `《${item.title}》已更新为 ${data.data.status}。`;
    await loadModeration();
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric"
  });
}
</script>

<template>
  <main class="admin-root">
    <section v-if="!loggedIn" class="login-shell">
      <article class="login-card">
        <p class="eyebrow">StudyMate Admin</p>
        <h1>进入治理后台</h1>
        <p class="lead">这一版先把审核、概览和各模块治理入口统一到同一个后台壳层里。</p>
        <form class="login-form" @submit.prevent="login">
          <label>
            <span>用户名或邮箱</span>
            <input v-model="form.login" placeholder="输入管理员账号" />
          </label>
          <label>
            <span>密码</span>
            <input v-model="form.password" placeholder="输入密码" type="password" />
          </label>
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
          <button class="primary-button" :disabled="loading" type="submit">
            {{ loading ? "登录中..." : "登录后台" }}
          </button>
        </form>
      </article>
    </section>

    <div v-else class="admin-shell">
      <aside class="admin-sidebar">
        <div class="brand-block">
          <div class="brand-glyph">管</div>
          <div>
            <strong>StudyMate Admin</strong>
            <span>学习内容治理后台</span>
          </div>
        </div>

        <nav class="admin-nav">
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

        <article class="sidebar-card">
          <strong>{{ profile?.displayName }}</strong>
          <span>{{ profile?.email }}</span>
          <span>{{ profile?.role }}</span>
          <button class="secondary-button" type="button" @click="logout">退出后台</button>
        </article>
      </aside>

      <section class="admin-surface">
        <header class="topbar">
          <div>
            <p class="eyebrow">治理工作区</p>
            <h2>{{ navItems.find((item) => item.key === activeView)?.label }}</h2>
            <p class="lead">{{ notice }}</p>
          </div>
          <button class="secondary-button" :disabled="loading" type="button" @click="loadModeration">
            {{ loading ? "同步中..." : "刷新数据" }}
          </button>
        </header>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <template v-if="activeView === 'dashboard'">
          <div class="metric-grid">
            <article v-for="card in overviewCards" :key="card.label" class="metric-card">
              <span>{{ card.label }}</span>
              <strong>{{ card.value }}</strong>
              <p>{{ card.helper }}</p>
            </article>
          </div>
        </template>

        <template v-else-if="activeView === 'moderation'">
          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">待处理队列</p>
                <h3>帖子与资料审核</h3>
              </div>
            </div>

            <div class="moderation-list">
              <article v-for="item in moderationItems" :key="item.id" class="moderation-card">
                <div class="moderation-head">
                  <div>
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.type === "post" ? "帖子" : "资料" }} · {{ item.authorName }}</span>
                  </div>
                  <span class="status-chip">{{ item.status }}</span>
                </div>
                <p>{{ item.summary }}</p>
                <div class="moderation-meta">
                  <span>创建于 {{ formatDate(item.createdAt) }}</span>
                  <div class="actions">
                    <button class="secondary-button" type="button" @click="moderate(item, 'approve')">通过</button>
                    <button class="secondary-button" type="button" @click="moderate(item, 'reject')">驳回</button>
                    <button class="secondary-button danger" type="button" @click="moderate(item, 'hide')">下架</button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </template>

        <template v-else>
          <section class="panel">
            <div class="panel-head">
              <div>
                <p class="eyebrow">功能占位</p>
                <h3>{{ navItems.find((item) => item.key === activeView)?.label }}</h3>
              </div>
            </div>

            <div class="placeholder-grid">
              <article
                v-for="item in placeholderModules[activeView as keyof typeof placeholderModules]"
                :key="item"
                class="placeholder-card"
              >
                <strong>{{ item }}</strong>
                <p>这一块的后台能力会沿当前治理壳层继续补齐。</p>
              </article>
            </div>
          </section>
        </template>
      </section>
    </div>
  </main>
</template>

<style scoped>
:global(:root) {
  --bg-0: #f5f1e7;
  --bg-1: #efe7d8;
  --surface: rgba(250, 246, 238, 0.92);
  --surface-strong: rgba(255, 252, 246, 0.96);
  --surface-soft: rgba(244, 237, 225, 0.82);
  --line: rgba(57, 58, 52, 0.12);
  --line-strong: rgba(57, 58, 52, 0.2);
  --text-0: #1f2520;
  --text-1: #4d564b;
  --text-2: #7b7f72;
  --accent: #295846;
  --accent-strong: #204638;
  --amber: #a96a1d;
  --danger: #a94d40;
  --shadow-lg: 0 22px 60px rgba(61, 47, 24, 0.12);
  --shadow-sm: 0 10px 24px rgba(61, 47, 24, 0.06);
}

:global(body) {
  margin: 0;
  color: var(--text-0);
  background:
    linear-gradient(180deg, rgba(255, 252, 246, 0.84) 0%, rgba(240, 232, 216, 0.92) 100%),
    linear-gradient(90deg, rgba(35, 61, 51, 0.02) 1px, transparent 1px),
    linear-gradient(rgba(35, 61, 51, 0.02) 1px, transparent 1px);
  background-size: auto, 32px 32px, 32px 32px;
  font-family: "PingFang SC", "Microsoft YaHei UI", sans-serif;
}

:global(*),
:global(*::before),
:global(*::after) {
  box-sizing: border-box;
}

.admin-root {
  min-height: 100vh;
}

.login-shell,
.admin-shell {
  min-height: 100vh;
}

.login-shell {
  position: relative;
  display: grid;
  place-items: center;
  padding: 24px;
}

.login-card,
.admin-sidebar,
.admin-surface,
.panel,
.metric-card,
.moderation-card,
.placeholder-card,
.sidebar-card {
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(14px);
}

.login-card {
  width: min(560px, 100%);
  padding: 34px;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--amber);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-card h1,
.topbar h2,
.panel h3,
.metric-card strong,
.brand-block strong,
.sidebar-card strong {
  margin: 0;
  font-family: "Iowan Old Style", "STZhongsong", "Songti SC", serif;
}

.lead,
.metric-card p,
.moderation-card p,
.placeholder-card p,
.sidebar-card span,
.moderation-meta span,
.moderation-head span {
  margin: 0;
  color: var(--text-1);
  line-height: 1.7;
}

.login-form,
.admin-nav,
.metric-grid,
.moderation-list,
.placeholder-grid {
  display: grid;
  gap: 14px;
}

.login-form {
  margin-top: 20px;
}

.login-form label {
  display: grid;
  gap: 8px;
}

.login-form span {
  color: var(--text-1);
  font-size: 14px;
  font-weight: 600;
}

input,
button {
  appearance: none;
  font: inherit;
}

button {
  border: 0;
}

input {
  min-height: 46px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 10px;
  color: var(--text-0);
  background: rgba(255, 255, 255, 0.72);
}

.primary-button,
.secondary-button,
.nav-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  cursor: pointer;
  transition: 180ms ease;
}

.primary-button {
  color: #f6f3ec;
  background: linear-gradient(135deg, #285645 0%, #3a6d59 100%);
}

.secondary-button,
.nav-item {
  color: var(--text-1);
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.58);
}

.secondary-button:hover,
.nav-item:hover {
  background: rgba(255, 255, 255, 0.8);
}

.danger {
  color: var(--danger);
}

.admin-shell {
  position: relative;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 20px;
  padding: 22px;
}

.admin-sidebar {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 22px 18px;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px 2px;
}

.brand-glyph {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  color: #f2efe6;
  background: linear-gradient(135deg, #264d3f 0%, #3d715b 100%);
}

.brand-block span,
.metric-card span,
.moderation-head span,
.moderation-meta span,
.sidebar-card span {
  display: block;
  color: var(--text-2);
  font-size: 13px;
}

.nav-item {
  justify-content: space-between;
  width: 100%;
  min-height: 48px;
  text-align: left;
}

.nav-item.active {
  color: var(--text-0);
  box-shadow: inset 0 0 0 1px rgba(41, 88, 70, 0.14);
  background: linear-gradient(135deg, rgba(41, 88, 70, 0.1), rgba(255, 255, 255, 0.68));
}

.nav-item small {
  color: var(--amber);
}

.sidebar-card {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 16px;
  background: var(--surface-strong);
  box-shadow: var(--shadow-sm);
}

.admin-surface {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 24px;
}

.topbar,
.panel-head,
.moderation-head,
.moderation-meta,
.actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.topbar h2,
.panel h3 {
  font-size: 30px;
}

.panel {
  display: grid;
  gap: 18px;
  padding: 18px;
  border-radius: 22px;
  background: var(--surface-soft);
}

.metric-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.metric-card {
  display: grid;
  gap: 10px;
  min-height: 180px;
  padding: 20px;
  border-radius: 18px;
  background: var(--surface-strong);
  box-shadow: var(--shadow-sm);
}

.metric-card strong {
  font-size: 36px;
  line-height: 1;
}

.moderation-card,
.placeholder-card {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 18px;
  background: var(--surface-strong);
  box-shadow: var(--shadow-sm);
}

.moderation-head strong,
.placeholder-card strong {
  font-size: 18px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  color: var(--accent-strong);
  background: rgba(41, 88, 70, 0.12);
}

.placeholder-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.error-text {
  margin: 0;
  color: var(--danger);
}

@media (max-width: 1180px) {
  .admin-shell,
  .metric-grid,
  .placeholder-grid {
    grid-template-columns: 1fr;
  }
}
</style>
