<script setup lang="ts">
import { computed } from "vue";
import AdminButton from "../../components/admin/AdminButton.vue";
import AdminDataState from "../../components/admin/AdminDataState.vue";
import AdminInput from "../../components/admin/AdminInput.vue";
import type { AdminDataStatePayload } from "../../components/admin/dataState";

type GovernanceRecord = Record<string, string | number | boolean | null | undefined>;
type GovernanceAction = {
  key: string;
  label: string;
  tone?: "default" | "danger";
};

const props = defineProps<{
  actions?: GovernanceAction[];
  columns: string[];
  dataState?: AdminDataStatePayload | null;
  emptyText: string;
  query: string;
  rows: GovernanceRecord[];
  selectedRecord: GovernanceRecord | null;
  summary: GovernanceRecord | null;
  totalCount?: number;
}>();

const emit = defineEmits<{
  "update:query": [value: string];
  requestAction: [payload: { action: string; record: GovernanceRecord }];
  selectRecord: [record: GovernanceRecord];
}>();

function formatCell(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value);
}

function formatFieldLabel(key: string) {
  const labels: Record<string, string> = {
    id: "标识",
    title: "标题",
    name: "名称",
    originalName: "文件名",
    username: "用户名",
    email: "邮箱",
    displayName: "显示名称",
    role: "角色",
    status: "状态",
    action: "操作",
    createdAt: "创建时间",
    updatedAt: "更新时间",
    ownerUserId: "归属用户",
    reporterUserId: "举报用户",
    handledBy: "处理人",
    handledAt: "处理时间",
    userId: "用户",
    taskType: "任务类型",
    sourceType: "来源类型",
    sourceId: "来源标识",
    errorMessage: "错误信息",
    targetType: "目标类型",
    targetId: "目标标识",
    size: "文件大小",
    mimeType: "文件类型"
  };
  return labels[key] ?? key.replace(/([A-Z])/g, " $1").trim();
}

function getRecordTitle(row: GovernanceRecord) {
  return formatCell(row.title ?? row.name ?? row.originalName ?? row.username ?? row.action ?? row.id);
}

function requestAction(action: string) {
  if (!props.selectedRecord) return;
  emit("requestAction", { action, record: props.selectedRecord });
}

const resolvedDataState = computed<AdminDataStatePayload>(() =>
  props.dataState ?? {
    kind: "empty",
    title: props.emptyText,
    description: "当前模块已接入真实 API，但没有可显示的数据。"
  }
);
</script>

<template>
  <section v-if="summary" class="admin-metric-grid admin-metric-grid--summary">
    <article v-for="(value, key) in summary" :key="key" class="metric-card">
      <span>{{ formatFieldLabel(String(key)) }}</span>
      <strong>{{ formatCell(value) }}</strong>
      <p>AI 任务用量概览</p>
    </article>
  </section>
  <section class="admin-toolbar">
    <label class="admin-search">
      <span>⌕</span>
      <AdminInput
        :model-value="query"
        placeholder="搜索当前记录"
        @update:model-value="emit('update:query', $event)"
      />
    </label>
    <div class="admin-toolbar__meta"><span>{{ rows.length }} / {{ totalCount ?? rows.length }} 条</span></div>
  </section>
  <section class="admin-governance-layout">
    <section class="admin-data-card">
      <header class="admin-data-card__head">
        <div>
          <h2>记录列表</h2>
          <p>选择一条记录，在右侧查看完整字段和值。</p>
        </div>
      </header>
      <AdminDataState
        v-if="dataState || !rows.length"
        :description="resolvedDataState.description"
        :kind="resolvedDataState.kind"
        :title="resolvedDataState.title"
      />
      <div v-else class="admin-table admin-table--records" role="table">
        <div class="admin-table__head" role="row">
          <span v-for="column in columns" :key="column">{{ formatFieldLabel(column) }}</span>
        </div>
        <button
          v-for="(row, index) in rows"
          :key="index"
          :class="selectedRecord === row ? 'admin-table__row is-selected' : 'admin-table__row'"
          :data-record-row="String(row.id ?? index)"
          type="button"
          @click="emit('selectRecord', row)"
        >
          <span v-for="column in columns" :key="column" :title="formatCell(row[column])">{{ formatCell(row[column]) }}</span>
        </button>
      </div>
    </section>
    <aside class="admin-record-inspector">
      <header>
        <p class="eyebrow">记录详情</p>
        <h2>{{ selectedRecord ? getRecordTitle(selectedRecord) : "选择一条记录" }}</h2>
      </header>
      <dl v-if="selectedRecord">
        <template v-for="(value, key) in selectedRecord" :key="String(key)">
          <dt>{{ formatFieldLabel(String(key)) }}</dt>
          <dd>{{ formatCell(value) }}</dd>
        </template>
      </dl>
      <div v-else class="admin-inspector-empty">从左侧表格选择一条记录，查看完整字段。</div>
      <div v-if="selectedRecord && actions?.length" class="admin-record-inspector__actions">
        <AdminButton
          v-for="action in actions"
          :key="action.key"
          :danger="action.tone === 'danger'"
          :data-governance-action="action.key"
          @click="requestAction(action.key)"
        >
          {{ action.label }}
        </AdminButton>
      </div>
    </aside>
  </section>
</template>
