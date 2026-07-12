<script setup lang="ts">
import { computed } from "vue";
import AdminButton from "../../components/admin/AdminButton.vue";
import AdminDataState from "../../components/admin/AdminDataState.vue";
import AdminInput from "../../components/admin/AdminInput.vue";
import type { AdminDataStatePayload } from "../../components/admin/dataState";

type ModerationItem = {
  id: string;
  type: "post" | "material";
  title: string;
  summary: string;
  authorName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const props = defineProps<{
  dataState?: AdminDataStatePayload | null;
  items: ModerationItem[];
  query: string;
  totalCount: number;
}>();

const emit = defineEmits<{
  "update:query": [value: string];
  requestAction: [payload: { action: "approve" | "reject" | "hide"; item: ModerationItem }];
}>();

const resolvedDataState = computed<AdminDataStatePayload>(() =>
  props.dataState ?? {
    kind: "empty",
    title: "当前没有匹配的待审核内容",
    description: "调整搜索条件，或刷新最新治理数据。"
  }
);

const showState = computed(() => Boolean(props.dataState) || props.items.length === 0);
const showTable = computed(() => props.items.length > 0 && (!props.dataState || props.dataState.kind === "stale"));
</script>

<template>
  <section class="admin-toolbar">
    <label class="admin-search">
      <span>⌕</span>
      <AdminInput
        :model-value="query"
        placeholder="搜索标题、作者或状态"
        @update:model-value="emit('update:query', $event)"
      />
    </label>
    <div class="admin-toolbar__meta"><span>{{ items.length }} / {{ totalCount }} 条</span></div>
  </section>
  <section class="admin-data-card admin-moderation-table">
    <header class="admin-data-card__head">
      <div>
        <h2>审核队列</h2>
        <p>按内容类型、作者和创建时间快速定位待处理项目。</p>
      </div>
    </header>
    <AdminDataState
      v-if="showState"
      :description="resolvedDataState.description"
      :kind="resolvedDataState.kind"
      :title="resolvedDataState.title"
    />
    <div v-if="showTable" class="admin-table admin-table--moderation" role="table">
      <div class="admin-table__head" role="row">
        <span>内容</span>
        <span>类型</span>
        <span>作者</span>
        <span>提交时间</span>
        <span>状态</span>
        <span>操作</span>
      </div>
      <article v-for="item in items" :key="item.id" class="admin-table__row" role="row">
        <div class="admin-content-cell">
          <strong>{{ item.title }}</strong>
          <p>{{ item.summary }}</p>
        </div>
        <span><i class="admin-type-badge">{{ item.type === "post" ? "帖子" : "资料" }}</i></span>
        <span>{{ item.authorName }}</span>
        <span>{{ new Date(item.createdAt).toLocaleString("zh-CN") }}</span>
        <span><i class="admin-status-badge">{{ item.status }}</i></span>
        <div class="admin-row-actions">
          <AdminButton data-moderation-action="approve" variant="primary" @click="emit('requestAction', { action: 'approve', item })">
            通过
          </AdminButton>
          <AdminButton
            data-moderation-action="reject"
            danger
            @click="emit('requestAction', { action: 'reject', item })"
          >
            驳回
          </AdminButton>
          <AdminButton data-moderation-action="hide" @click="emit('requestAction', { action: 'hide', item })">
            隐藏
          </AdminButton>
        </div>
      </article>
    </div>
  </section>
</template>
