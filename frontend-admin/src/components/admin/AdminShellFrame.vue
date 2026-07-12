<script setup lang="ts">
import AdminButton from "./AdminButton.vue";
import AdminCommandBar from "./AdminCommandBar.vue";
import AdminNavItem from "./AdminNavItem.vue";
import AdminPageHeader from "./AdminPageHeader.vue";

type ShellNavItem = {
  key: string;
  label: string;
  icon: string;
  badge?: string;
};

type ShellNavGroup = {
  group: string;
  items: ShellNavItem[];
};

type ShellProfile = {
  displayName?: string | null;
  role?: string | null;
};

defineProps<{
  activeDescription: string;
  activeGroup: string;
  activeTitle: string;
  activeView: string;
  countLabel: string;
  errorMessage: string;
  loading: boolean;
  navGroups: ShellNavGroup[];
  notice: string;
  profile: ShellProfile | null;
  profileInitial: string;
}>();

const emit = defineEmits<{
  switchView: [view: string];
  refresh: [];
  logout: [];
}>();
</script>

<template>
  <section class="admin-shell">
    <aside class="admin-sidebar">
      <div class="admin-brand">
        <span class="admin-brand__mark">S</span>
        <span><strong>StudyMate</strong><small>运营与治理</small></span>
      </div>

      <nav class="admin-nav" aria-label="后台导航">
        <section v-for="group in navGroups" :key="group.group" class="admin-nav__group">
          <p>{{ group.group }}</p>
          <AdminNavItem
            v-for="item in group.items"
            :key="item.key"
            :active="activeView === item.key"
            :badge="item.badge"
            :icon="item.icon"
            :label="item.label"
            :view-key="item.key"
            @press="emit('switchView', $event)"
          />
        </section>
      </nav>

      <footer class="admin-sidebar__footer">
        <div class="admin-profile">
          <span>{{ profileInitial }}</span>
          <div><strong>{{ profile?.displayName }}</strong><small>{{ profile?.role || "admin" }}</small></div>
        </div>
        <AdminButton class="admin-logout" data-admin-logout="true" variant="ghost" @click="emit('logout')">
          <span>↗</span>退出后台
        </AdminButton>
      </footer>
    </aside>

    <section class="admin-main">
      <AdminCommandBar
        crumb="运营中心"
        :status-label="loading ? '同步中' : '数据已连接'"
        :status-loading="loading"
        :title="activeTitle"
      >
        <template #actions>
          <AdminButton data-admin-refresh="true" :disabled="loading" @click="emit('refresh')">刷新数据</AdminButton>
        </template>
      </AdminCommandBar>

      <AdminPageHeader :description="activeDescription" :eyebrow="activeGroup" :title="activeTitle">
        <template v-if="countLabel" #actions>
          <span class="admin-count-chip">{{ countLabel }}</span>
        </template>
      </AdminPageHeader>

      <div class="admin-notice-stack">
        <p class="notice"><span>●</span>{{ notice }}</p>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      </div>

      <slot />
    </section>
  </section>
</template>
