<script setup lang="ts">
import { computed } from "vue";
import AdminButton from "../../components/admin/AdminButton.vue";
import AdminDataCardHeader from "../../components/admin/AdminDataCardHeader.vue";
import AdminDataState from "../../components/admin/AdminDataState.vue";
import AdminMetricCard from "../../components/admin/AdminMetricCard.vue";
import AdminRecordInspector from "../../components/admin/AdminRecordInspector.vue";
import AdminSearchToolbar from "../../components/admin/AdminSearchToolbar.vue";
import AdminSelect from "../../components/admin/AdminSelect.vue";
import type { AdminDataStatePayload } from "../../components/admin/dataState";

type GovernanceRecord = Record<string, string | number | boolean | null | undefined>;
type GovernanceAction = {
  key: string;
  label: string;
  tone?: "default" | "danger";
};
type FilterOption = {
  label: string;
  value: string;
};

const props = withDefaults(defineProps<{
  actions?: GovernanceAction[];
  columns: string[];
  dataState?: AdminDataStatePayload | null;
  emptyText: string;
  query: string;
  rows: GovernanceRecord[];
  selectedRecord: GovernanceRecord | null;
  statusFilter?: string;
  statusOptions?: FilterOption[];
  summary: GovernanceRecord | null;
  totalCount?: number;
}>(), {
  actions: () => [],
  dataState: null,
  selectedRecord: null,
  statusFilter: "all",
  statusOptions: () => [],
  summary: null,
  totalCount: undefined
});

const emit = defineEmits<{
  "update:query": [value: string];
  "update:statusFilter": [value: string];
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
    description: "当前模块已接入真实 API，但没有可展示的数据。"
  }
);

const inspectorFields = computed(() =>
  props.selectedRecord
    ? Object.entries(props.selectedRecord).map(([key, value]) => ({
        label: formatFieldLabel(String(key)),
        value: formatCell(value)
      }))
    : []
);

const showState = computed(() => Boolean(props.dataState) || props.rows.length === 0);
const showTable = computed(
  () => props.rows.length > 0 && (!props.dataState || props.dataState.kind === "stale" || props.dataState.kind === "conflict")
);
</script>

<template>
  <section v-if="summary" class="admin-metric-grid admin-metric-grid--summary">
    <AdminMetricCard
      v-for="(value, key) in summary"
      :key="key"
      helper="AI 任务用量概览"
      :label="formatFieldLabel(String(key))"
      :value="formatCell(value)"
    />
  </section>

  <AdminSearchToolbar
    :count-label="`${rows.length} / ${totalCount ?? rows.length} 条`"
    placeholder="搜索当前记录"
    :query="query"
    @update:query="emit('update:query', $event)"
  >
    <template v-if="statusOptions.length > 1" #filters>
      <AdminSelect
        class="admin-filter-select"
        data-governance-status-filter="true"
        :model-value="statusFilter"
        @update:model-value="emit('update:statusFilter', $event)"
      >
        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </AdminSelect>
    </template>
  </AdminSearchToolbar>

  <section class="admin-governance-layout">
    <section class="admin-data-card">
      <AdminDataCardHeader
        description="选择一条记录，在右侧查看完整字段和操作入口。"
        title="记录列表"
      />
      <AdminDataState
        v-if="showState"
        :description="resolvedDataState.description"
        :kind="resolvedDataState.kind"
        :title="resolvedDataState.title"
      />
      <div v-if="showTable" class="admin-table admin-table--records" role="table">
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

    <AdminRecordInspector
      empty-text="从左侧表格选择一条记录，查看完整字段。"
      :fields="inspectorFields"
      :title="selectedRecord ? getRecordTitle(selectedRecord) : '选择一条记录'"
    >
      <template v-if="selectedRecord && actions.length" #actions>
        <AdminButton
          v-for="action in actions"
          :key="action.key"
          :danger="action.tone === 'danger'"
          :data-governance-action="action.key"
          @click="requestAction(action.key)"
        >
          {{ action.label }}
        </AdminButton>
      </template>
    </AdminRecordInspector>
  </section>
</template>
