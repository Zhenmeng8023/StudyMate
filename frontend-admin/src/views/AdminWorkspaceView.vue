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
  icon: string;
  group: "总览" | "治理" | "系统";
  badge?: string;
};

type GovernanceRecord = Record<string, string | number | boolean | null | undefined>;

const sessionKey = "studymate.admin.session";
const form = reactive({ login: "", password: "" });
const session = ref<AuthPayload | null>(readSession());
const profile = ref<AuthUser | null>(session.value?.user ?? null);
const moderationItems = ref<ModerationItem[]>([]);
const overview = ref<OverviewPayload | null>(null);
const governanceRows = ref<GovernanceRecord[]>([]);
const governanceSummary = ref<GovernanceRecord | null>(null);
const selectedRecord = ref<GovernanceRecord | null>(null);
const loading = ref(false);
const errorMessage = ref("");
const notice = ref("登录后会同步当前治理队列与运营数据。");
const activeView = ref<AdminView>("dashboard");
const recordQuery = ref("");
const moderationQuery = ref("");

const loggedIn = computed(() => Boolean(session.value));
const pendingPosts = computed(() => moderationItems.value.filter((item) => item.type === "post"));
const pendingMaterials = computed(() => moderationItems.value.filter((item) => item.type === "material"));
const profileInitial = computed(() => profile.value?.displayName?.trim().slice(0, 1) || "A");

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

const navGroups = computed(() => ["总览", "治理", "系统"].map((group) => ({ group, items: navItems.value.filter((item) => item.group === group) })));
const activeMeta = computed(() => navItems.value.find((item) => item.key === activeView.value) ?? navItems.value[0]);

const overviewCards = computed(() => [
  { label: "待处理", value: String(overview.value?.pendingModerationCount ?? moderationItems.value.length), helper: "需要审核或复核的公开内容" },
  { label: "用户规模", value: String(overview.value?.userCount ?? 0), helper: "当前已注册的学习者与管理员" },
  { label: "资料沉淀", value: String(overview.value?.materialCount ?? 0), helper: "可被阅读、引用和治理的资料" },
  { label: "知识图谱", value: String(overview.value?.graphCount ?? 0), helper: "用户持续维护的知识结构" }
]);

const governanceConfig: Record<Exclude<AdminView, "dashboard" | "moderation">, { endpoint: string; empty: string; description: string }> = {
  materials: { endpoint: "/api/v1/admin/files?limit=20", empty: "暂无文件治理记录。", description: "检查文件状态、归属与存储信息。" },
  community: { endpoint: "/api/v1/admin/reports?limit=20", empty: "暂无举报记录。", description: "集中查看用户提交的举报与处理线索。" },
  users: { endpoint: "/api/v1/admin/users?limit=20", empty: "暂无用户记录。", description: "按账号状态与角色查看用户资料。" },
  graph: { endpoint: "/api/v1/admin/tags?limit=20", empty: "暂无标签记录。", description: "管理资料、笔记与图谱中的分类标签。" },
  ai: { endpoint: "/api/v1/admin/ai/tasks?limit=20", empty: "暂无 AI 任务。", description: "追踪生成任务、状态与用量概览。" },
  system: { endpoint: "/api/v1/admin/files?limit=20", empty: "暂无文件记录。", description: "查看上传文件与存储治理信息。" },
  audit: { endpoint: "/api/v1/admin/audit-logs?limit=20", empty: "暂无审计日志。", description: "查看关键治理操作的可追溯记录。" }
};

const visibleModerationItems = computed(() => {
  const query = moderationQuery.value.trim().toLowerCase();
  if (!query) return moderationItems.value;
  return moderationItems.value.filter((item) => [item.title, item.summary, item.authorName, item.type, item.status].join(" ").toLowerCase().includes(query));
});

const visibleGovernanceRows = computed(() => {
  const query = recordQuery.value.trim().toLowerCase();
  if (!query) return governanceRows.value;
  return governanceRows.value.filter((row) => Object.values(row).some((value) => formatCell(value).toLowerCase().includes(query)));
});

const governanceColumns = computed(() => {
  const preferred = ["title", "name", "originalName", "username", "email", "role", "status", "action", "createdAt", "updatedAt", "id"];
  const keys = new Set<string>();
  governanceRows.value.forEach((row) => Object.keys(row).forEach((key) => keys.add(key)));
  return Array.from(keys).sort((a, b) => {
    const aIndex = preferred.indexOf(a);
    const bIndex = preferred.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }).slice(0, 7);
});

const selectedRecordTitle = computed(() => selectedRecord.value ? getRecordTitle(selectedRecord.value) : "选择一条记录");

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
    notice.value = "已进入治理工作台，正在同步当前数据。";
    await Promise.all([refreshProfile(), loadModeration(), loadOverview()]);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "管理员登录失败";
  } finally {
    loading.value = false;
  }
}

async function refreshProfile() {
  if (!session.value) return;
  try {
    profile.value = await get<AuthUser>("/api/v1/admin/me");
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
    governanceRows.value = await get<GovernanceRecord[]>(config.endpoint);
    selectedRecord.value = governanceRows.value[0] ?? null;
    if (view === "ai") governanceSummary.value = await get<GovernanceRecord>("/api/v1/admin/ai/usage");
    notice.value = `已加载 ${governanceRows.value.length} 条治理记录。`;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "读取治理模块失败";
  } finally {
    loading.value = false;
  }
}

async function moderate(item: ModerationItem, action: "approve" | "reject" | "hide") {
  if (!session.value) return;
  loading.value = true;
  errorMessage.value = "";
  try {
    const path = `/api/v1/admin/moderation/${item.type === "post" ? "posts" : "materials"}/${item.id}/${action}`;
    const data = await post<{ status: string }>(path, { reason: "" });
    notice.value = `“${item.title}” 已更新为 ${data.status}。`;
    await Promise.all([loadModeration(), loadOverview()]);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "更新审核状态失败";
  } finally {
    loading.value = false;
  }
}

function switchView(view: AdminView) {
  activeView.value = view;
  recordQuery.value = "";
  moderationQuery.value = "";
  void (view === "dashboard" ? Promise.all([loadOverview(), loadModeration()]) : view === "moderation" ? loadModeration() : loadGovernance(view));
}

function refreshActiveView() {
  if (activeView.value === "dashboard") {
    void Promise.all([loadOverview(), loadModeration()]);
    return;
  }
  if (activeView.value === "moderation") {
    void loadModeration();
    return;
  }
  void loadGovernance(activeView.value);
}

function logout() {
  session.value = null;
  profile.value = null;
  moderationItems.value = [];
  overview.value = null;
  governanceRows.value = [];
  governanceSummary.value = null;
  selectedRecord.value = null;
  activeView.value = "dashboard";
  window.localStorage.removeItem(sessionKey);
  notice.value = "后台会话已清空。";
}

async function get<T>(path: string) {
  const payload = await fetch(path, { headers: { Authorization: `Bearer ${session.value?.accessToken ?? ""}` } });
  return readResponse<T>(payload);
}

async function post<T>(path: string, body: unknown) {
  const payload = await fetch(path, {
    method: "POST",
    headers: { Authorization: session.value ? `Bearer ${session.value.accessToken}` : "", "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return readResponse<T>(payload);
}

async function readResponse<T>(payload: Response) {
  const data = (await payload.json()) as ApiResponse<T>;
  if (!payload.ok || !data.success) throw new Error(data.error?.message ?? "请求失败");
  return data.data;
}

function readSession(): AuthPayload | null {
  const raw = window.localStorage.getItem(sessionKey);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthPayload; } catch { return null; }
}

function formatCell(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value);
}

function formatFieldLabel(key: string) {
  const labels: Record<string, string> = {
    id: "标识", title: "标题", name: "名称", originalName: "文件名", username: "用户名", email: "邮箱", displayName: "显示名称", role: "角色", status: "状态", action: "操作", createdAt: "创建时间", updatedAt: "更新时间", ownerUserId: "归属用户", size: "文件大小", mimeType: "文件类型"
  };
  return labels[key] ?? key.replace(/([A-Z])/g, " $1").trim();
}

function getRecordTitle(row: GovernanceRecord) {
  return formatCell(row.title ?? row.name ?? row.originalName ?? row.username ?? row.action ?? row.id);
}

function selectRecord(row: GovernanceRecord) {
  selectedRecord.value = row;
}
</script>

<template>
  <main class="admin-shell">
    <section v-if="!loggedIn" class="admin-login">
      <section class="admin-login__brand">
        <span class="admin-login__mark">S</span>
        <div>
          <p>StudyMate 管理后台</p>
          <h1>治理工作台</h1>
          <span>面向内容、用户和学习资产的统一运营入口。</span>
        </div>
      </section>
      <section class="login-card">
        <p class="eyebrow">管理员登录</p>
        <h2>进入管理后台</h2>
        <p>使用具备管理权限的账号登录后，查看实时治理队列。</p>
        <form class="form-stack" @submit.prevent="login">
          <label><span>账号</span><input v-model="form.login" placeholder="用户名或邮箱" /></label>
          <label><span>密码</span><input v-model="form.password" placeholder="密码" type="password" /></label>
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
          <button class="primary-button" :disabled="loading" type="submit">{{ loading ? "登录中…" : "登录工作台" }}</button>
        </form>
      </section>
    </section>

    <template v-else>
      <aside class="admin-sidebar">
        <div class="admin-brand">
          <span class="admin-brand__mark">S</span>
          <span><strong>StudyMate</strong><small>运营与治理</small></span>
        </div>

        <nav class="admin-nav" aria-label="后台导航">
          <section v-for="group in navGroups" :key="group.group" class="admin-nav__group">
            <p>{{ group.group }}</p>
            <button v-for="item in group.items" :key="item.key" :class="activeView === item.key ? 'nav-item active' : 'nav-item'" type="button" @click="switchView(item.key)">
              <span class="nav-item__icon" aria-hidden="true">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
              <em v-if="item.badge">{{ item.badge }}</em>
            </button>
          </section>
        </nav>

        <footer class="admin-sidebar__footer">
          <div class="admin-profile">
            <span>{{ profileInitial }}</span>
            <div><strong>{{ profile?.displayName }}</strong><small>{{ profile?.role || 'admin' }}</small></div>
          </div>
          <button class="admin-logout" type="button" @click="logout"><span>↗</span>退出后台</button>
        </footer>
      </aside>

      <section class="admin-main">
        <header class="admin-topbar">
          <div class="admin-topbar__crumb"><span>运营中心</span><i>›</i><strong>{{ activeMeta.label }}</strong></div>
          <div class="admin-topbar__actions">
            <span class="admin-sync-state" :class="loading ? 'is-loading' : ''"><i />{{ loading ? '同步中' : '数据已连接' }}</span>
            <button class="secondary-button" :disabled="loading" type="button" @click="refreshActiveView">刷新数据</button>
          </div>
        </header>

        <section class="admin-page-heading">
          <div>
            <p class="eyebrow">{{ activeMeta.group }}</p>
            <h1>{{ activeMeta.label }}</h1>
            <p v-if="activeView !== 'dashboard' && activeView !== 'moderation'">{{ governanceConfig[activeView as keyof typeof governanceConfig]?.description }}</p>
            <p v-else-if="activeView === 'dashboard'">优先处理待审核内容，再查看用户、资料与图谱的总体变化。</p>
            <p v-else>快速判断内容风险与发布状态，所有操作都会保留可追溯线索。</p>
          </div>
          <div class="admin-page-heading__actions">
            <span v-if="activeView === 'moderation'" class="admin-count-chip">{{ moderationItems.length }} 条待处理</span>
            <span v-else-if="activeView !== 'dashboard'" class="admin-count-chip">{{ governanceRows.length }} 条记录</span>
          </div>
        </section>

        <div class="admin-notice-stack">
          <p class="notice"><span>●</span>{{ notice }}</p>
          <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        </div>

        <template v-if="activeView === 'dashboard'">
          <section class="admin-metric-grid">
            <article v-for="card in overviewCards" :key="card.label" class="metric-card">
              <span>{{ card.label }}</span><strong>{{ card.value }}</strong><p>{{ card.helper }}</p>
            </article>
          </section>
          <section class="admin-dashboard-grid">
            <article class="admin-priority-card">
              <div><p class="eyebrow">优先队列</p><h2>先处理内容审核</h2><p>审核队列中的资料和帖子会直接影响社区与资料库的公开可见性。</p></div>
              <button class="primary-button" type="button" @click="switchView('moderation')">进入审核队列</button>
            </article>
            <article class="admin-status-card">
              <p class="eyebrow">当前数据</p>
              <ul>
                <li><span>待审帖子</span><strong>{{ pendingPosts.length }}</strong></li>
                <li><span>待审资料</span><strong>{{ pendingMaterials.length }}</strong></li>
                <li><span>审核压力</span><strong>{{ moderationItems.length ? '需要关注' : '平稳' }}</strong></li>
              </ul>
            </article>
          </section>
        </template>

        <template v-else-if="activeView === 'moderation'">
          <section class="admin-toolbar">
            <label class="admin-search"><span>⌕</span><input v-model="moderationQuery" placeholder="搜索标题、作者或状态" /></label>
            <div class="admin-toolbar__meta"><span>{{ visibleModerationItems.length }} / {{ moderationItems.length }} 条</span></div>
          </section>
          <section class="admin-data-card admin-moderation-table">
            <header class="admin-data-card__head"><div><h2>审核队列</h2><p>按内容类型、作者和创建时间快速定位待处理项目。</p></div></header>
            <div v-if="!visibleModerationItems.length" class="admin-empty-state"><strong>当前没有匹配的待审核内容</strong><span>调整搜索条件，或刷新最新治理数据。</span></div>
            <div v-else class="admin-table admin-table--moderation" role="table">
              <div class="admin-table__head" role="row"><span>内容</span><span>类型</span><span>作者</span><span>提交时间</span><span>状态</span><span>操作</span></div>
              <article v-for="item in visibleModerationItems" :key="item.id" class="admin-table__row" role="row">
                <div class="admin-content-cell"><strong>{{ item.title }}</strong><p>{{ item.summary }}</p></div>
                <span><i class="admin-type-badge">{{ item.type === 'post' ? '帖子' : '资料' }}</i></span>
                <span>{{ item.authorName }}</span>
                <span>{{ new Date(item.createdAt).toLocaleString('zh-CN') }}</span>
                <span><i class="admin-status-badge">{{ item.status }}</i></span>
                <div class="admin-row-actions"><button type="button" @click="moderate(item, 'approve')">通过</button><button class="is-danger" type="button" @click="moderate(item, 'reject')">驳回</button><button type="button" @click="moderate(item, 'hide')">隐藏</button></div>
              </article>
            </div>
          </section>
        </template>

        <template v-else>
          <section v-if="governanceSummary" class="admin-metric-grid admin-metric-grid--summary">
            <article v-for="(value, key) in governanceSummary" :key="key" class="metric-card"><span>{{ formatFieldLabel(String(key)) }}</span><strong>{{ formatCell(value) }}</strong><p>AI 任务用量概览</p></article>
          </section>
          <section class="admin-toolbar">
            <label class="admin-search"><span>⌕</span><input v-model="recordQuery" placeholder="搜索当前记录" /></label>
            <div class="admin-toolbar__meta"><span>{{ visibleGovernanceRows.length }} / {{ governanceRows.length }} 条</span></div>
          </section>
          <section class="admin-governance-layout">
            <section class="admin-data-card">
              <header class="admin-data-card__head"><div><h2>记录列表</h2><p>选择一条记录，在右侧查看完整字段和值。</p></div></header>
              <div v-if="!visibleGovernanceRows.length" class="admin-empty-state"><strong>{{ governanceConfig[activeView as keyof typeof governanceConfig].empty }}</strong><span>当前模块已接入真实 API，但没有可显示的数据。</span></div>
              <div v-else class="admin-table admin-table--records" role="table">
                <div class="admin-table__head" role="row"><span v-for="column in governanceColumns" :key="column">{{ formatFieldLabel(column) }}</span></div>
                <button v-for="(row, index) in visibleGovernanceRows" :key="index" :class="selectedRecord === row ? 'admin-table__row is-selected' : 'admin-table__row'" type="button" @click="selectRecord(row)">
                  <span v-for="column in governanceColumns" :key="column" :title="formatCell(row[column])">{{ formatCell(row[column]) }}</span>
                </button>
              </div>
            </section>
            <aside class="admin-record-inspector">
              <header><p class="eyebrow">记录详情</p><h2>{{ selectedRecordTitle }}</h2></header>
              <dl v-if="selectedRecord"><template v-for="(value, key) in selectedRecord" :key="String(key)"><dt>{{ formatFieldLabel(String(key)) }}</dt><dd>{{ formatCell(value) }}</dd></template></dl>
              <div v-else class="admin-inspector-empty">从左侧表格选择一条记录，查看完整字段。</div>
            </aside>
          </section>
        </template>
      </section>
    </template>
  </main>
</template>
