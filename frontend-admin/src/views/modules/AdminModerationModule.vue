<script setup lang="ts">
import { computed } from "vue";
import AdminActionBar from "../../components/admin/AdminActionBar.vue";
import AdminDataCardHeader from "../../components/admin/AdminDataCardHeader.vue";
import AdminDataState from "../../components/admin/AdminDataState.vue";
import AdminSearchToolbar from "../../components/admin/AdminSearchToolbar.vue";
import AdminSelect from "../../components/admin/AdminSelect.vue";
import AdminTag from "../../components/admin/AdminTag.vue";
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

type FilterOption = {
  label: string;
  value: string;
};

type ModerationActionKey = "approve" | "reject" | "hide";

const props = withDefaults(defineProps<{
  dataState?: AdminDataStatePayload | null;
  items: ModerationItem[];
  query: string;
  statusFilter?: string;
  statusOptions?: FilterOption[];
  totalCount: number;
}>(), {
  dataState: null,
  statusFilter: "all",
  statusOptions: () => []
});

const emit = defineEmits<{
  "update:query": [value: string];
  "update:statusFilter": [value: string];
  requestAction: [payload: { action: ModerationActionKey; item: ModerationItem }];
}>();

const rowActions = [
  { key: "approve", label: "通过", variant: "primary" as const },
  { key: "reject", label: "驳回", tone: "danger" as const },
  { key: "hide", label: "隐藏" }
] satisfies Array<{
  key: ModerationActionKey;
  label: string;
  tone?: "default" | "danger";
  variant?: "primary" | "secondary" | "ghost";
}>;

const resolvedDataState = computed<AdminDataStatePayload>(() =>
  props.dataState ?? {
    kind: "empty",
    title: "当前没有匹配的待审核内容",
    description: "调整搜索或筛选条件，或刷新最新治理数据。"
  }
);

const showState = computed(() => Boolean(props.dataState) || props.items.length === 0);
const showTable = computed(() => props.items.length > 0 && (!props.dataState || props.dataState.kind === "stale"));

function requestAction(actionKey: ModerationActionKey, item: ModerationItem) {
  emit("requestAction", { action: actionKey, item });
}
</script>

<template>
  <AdminSearchToolbar
    :count-label="`${items.length} / ${totalCount} 条`"
    placeholder="搜索标题、作者或状态"
    :query="query"
    @update:query="emit('update:query', $event)"
  >
    <template v-if="statusOptions.length > 1" #filters>
      <AdminSelect
        class="admin-filter-select"
        data-moderation-status-filter="true"
        :model-value="statusFilter"
        @update:model-value="emit('update:statusFilter', $event)"
      >
        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </AdminSelect>
    </template>
  </AdminSearchToolbar>

  <section class="admin-data-card admin-moderation-table">
    <AdminDataCardHeader
      description="按内容类型、作者、状态和创建时间快速定位待处理项目。"
      title="审核队列"
    />
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
        <span><AdminTag :label="item.type === 'post' ? '帖子' : '资料'" /></span>
        <span>{{ item.authorName }}</span>
        <span>{{ new Date(item.createdAt).toLocaleString("zh-CN") }}</span>
        <span><AdminTag :label="item.status" tone="status" /></span>
        <AdminActionBar
          compact
          namespace="moderation"
          :actions="rowActions"
          @press="requestAction($event as ModerationActionKey, item)"
        />
      </article>
    </div>
  </section>
</template>
