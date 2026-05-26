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
const notice = ref("登录后即可查看待审核帖子和资料。");

const loggedIn = computed(() => Boolean(session.value));

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
    notice.value = "管理员登录成功，正在同步审核队列。";
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
    notice.value = `当前待处理内容 ${data.data.length} 条。`;
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
    const payload = await fetch(`/api/v1/admin/moderation/${item.type === "post" ? "posts" : "materials"}/${item.id}/${action}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.value.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reason: "" })
    });
    const data = (await payload.json()) as ApiResponse<{ status: string }>;
    if (!payload.ok || !data.success) {
      throw new Error(data.error?.message ?? "更新审核状态失败");
    }

    notice.value = `${item.title} 已更新为 ${data.data.status}。`;
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
  window.localStorage.removeItem(sessionKey);
  notice.value = "管理员会话已清空。";
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
    <section class="admin-banner">
      <div>
        <p class="eyebrow">学伴管理后台 v0.3.0</p>
        <h1>把社区和资料的审核链路真正拉起来</h1>
        <p>
          管理员在这一版里不只是验证身份了，还需要看到待审核内容并做出动作。这样前台提交的内容才能进入公开区。
        </p>
      </div>
      <el-tag effect="dark" type="success">{{ loggedIn ? "审核工作台在线" : "等待登录" }}</el-tag>
    </section>

    <section class="admin-grid">
      <article class="admin-card">
        <header>
          <p class="section-label">管理员登录</p>
          <h2>使用管理员账号进入审核台</h2>
        </header>

        <div class="field-grid">
          <label>
            <span>邮箱或用户名</span>
            <el-input v-model="form.login" placeholder="请输入邮箱或用户名" />
          </label>
          <label>
            <span>密码</span>
            <el-input v-model="form.password" show-password type="password" placeholder="请输入密码" />
          </label>
        </div>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <p class="notice-text">{{ notice }}</p>

        <div class="action-row">
          <el-button :loading="loading" type="primary" @click="login">登录后台</el-button>
          <el-button plain @click="logout">清空会话</el-button>
          <el-button :disabled="!loggedIn" type="success" @click="loadModeration">刷新审核队列</el-button>
        </div>
      </article>

      <article class="admin-card">
        <header>
          <p class="section-label">管理员身份</p>
          <h2>当前登录信息</h2>
        </header>

        <div v-if="profile" class="profile-card">
          <strong>{{ profile.displayName }}</strong>
          <span>用户名：{{ profile.username }}</span>
          <span>邮箱：{{ profile.email }}</span>
          <span>角色：{{ profile.role }}</span>
        </div>
        <p v-else class="placeholder-copy">当前还没有管理员会话，登录后会自动刷新审核列表。</p>
      </article>
    </section>

    <section class="queue-panel">
      <header class="queue-header">
        <div>
          <p class="section-label">审核队列</p>
          <h2>待处理帖子和资料</h2>
        </div>
      </header>

      <div class="queue-list">
        <article v-for="item in moderationItems" :key="`${item.type}-${item.id}`" class="queue-card">
          <div class="queue-meta">
            <el-tag size="small" :type="item.type === 'post' ? 'warning' : 'info'">
              {{ item.type === "post" ? "帖子" : "资料" }}
            </el-tag>
            <el-tag size="small" effect="plain">{{ item.status }}</el-tag>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.summary }}</p>
          <span>提交人：{{ item.authorName }}</span>
          <div class="action-row compact">
            <el-button size="small" type="success" @click="moderate(item, 'approve')">通过</el-button>
            <el-button size="small" type="warning" @click="moderate(item, 'reject')">驳回</el-button>
            <el-button size="small" type="danger" @click="moderate(item, 'hide')">下架</el-button>
          </div>
        </article>
        <p v-if="loggedIn && moderationItems.length === 0" class="placeholder-copy">
          当前没有待处理内容，社区和资料的审核队列是空的。
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
  padding: 24px;
  color: #20272f;
  background:
    radial-gradient(circle at top left, rgba(250, 198, 87, 0.28), transparent 26%),
    radial-gradient(circle at bottom right, rgba(80, 111, 154, 0.18), transparent 30%),
    linear-gradient(180deg, #eef1f5 0%, #e5eaef 100%);
  font-family: "Microsoft YaHei UI", "PingFang SC", "Noto Sans SC", sans-serif;
}

.admin-banner,
.admin-card,
.queue-panel {
  border: 1px solid rgba(60, 72, 92, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 48px rgba(27, 38, 56, 0.08);
  backdrop-filter: blur(12px);
}

.admin-banner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  max-width: 1180px;
  margin: 0 auto 18px;
  padding: 24px;
}

.eyebrow,
.section-label {
  margin: 0 0 10px;
  color: #8f5f18;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2,
h3 {
  margin: 0;
  font-family: "STZhongsong", "Songti SC", "Noto Serif SC", serif;
}

h1 {
  font-size: 36px;
  line-height: 1.15;
}

h2 {
  font-size: 24px;
  line-height: 1.2;
}

h3 {
  font-size: 20px;
  line-height: 1.25;
}

p {
  max-width: 760px;
  margin: 14px 0 0;
  color: #586474;
  line-height: 1.7;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  max-width: 1180px;
  margin: 0 auto 18px;
}

.admin-card,
.queue-panel {
  padding: 22px;
}

.field-grid {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}

label {
  display: grid;
  gap: 8px;
}

label span {
  color: #5b6876;
  font-size: 14px;
  font-weight: 600;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.action-row.compact {
  margin-top: 14px;
}

.error-text {
  margin: 14px 0 0;
  color: #bb4b3c;
}

.notice-text {
  margin: 14px 0 0;
  color: #54657b;
}

.profile-card {
  display: grid;
  gap: 8px;
  margin-top: 16px;
  padding: 18px;
  border-radius: 10px;
  color: #f2f6fb;
  background: linear-gradient(135deg, #32465f 0%, #4d6480 100%);
}

.profile-card strong {
  font-size: 20px;
}

.profile-card span {
  color: rgba(242, 246, 251, 0.86);
}

.placeholder-copy {
  margin-top: 16px;
}

.queue-header {
  margin-bottom: 16px;
}

.queue-list {
  display: grid;
  gap: 14px;
}

.queue-card {
  padding: 18px;
  border: 1px solid rgba(60, 72, 92, 0.12);
  border-radius: 12px;
  background: rgba(246, 248, 252, 0.9);
}

.queue-card span {
  display: block;
  margin-top: 12px;
  color: #607184;
  font-size: 14px;
}

.queue-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

@media (max-width: 920px) {
  .admin-banner,
  .admin-grid {
    grid-template-columns: 1fr;
  }

  .admin-banner {
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .admin-shell {
    padding: 16px;
  }

  h1 {
    font-size: 30px;
  }

  .action-row {
    flex-direction: column;
  }
}
</style>
