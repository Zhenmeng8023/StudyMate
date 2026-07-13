<script setup lang="ts">
import { computed } from "vue";
import AdminActionBar from "../../components/admin/AdminActionBar.vue";
import AdminDataTable from "../../components/admin/AdminDataTable.vue";
import AdminFilterBar from "../../components/admin/AdminFilterBar.vue";
import AdminMetricGrid from "../../components/admin/AdminMetricGrid.vue";
import AdminRecordInspector from "../../components/admin/AdminRecordInspector.vue";
import AdminRecordRow from "../../components/admin/AdminRecordRow.vue";
import AdminTableHead from "../../components/admin/AdminTableHead.vue";
import {
  formatGovernanceCell,
  formatGovernanceFieldLabel,
  getGovernanceRecordTitle,
  type GovernanceRecord
} from "../../components/admin/governanceRecord";
import type { AdminDataStatePayload } from "../../components/admin/dataState";

type GovernanceAction = {
  key: string;
  label: string;
  tone?: "default" | "danger";
  variant?: "primary" | "secondary" | "ghost";
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
        label: formatGovernanceFieldLabel(String(key)),
        value: formatGovernanceCell(value)
      }))
    : []
);

const summaryCards = computed(() =>
  props.summary
    ? Object.entries(props.summary).map(([key, value]) => ({
        helper: "AI 任务用量概览",
        label: formatGovernanceFieldLabel(String(key)),
        value: formatGovernanceCell(value)
      }))
    : []
);

const tableHeadColumns = computed(() => props.columns.map((column) => formatGovernanceFieldLabel(column)));
const showState = computed(() => Boolean(props.dataState) || props.rows.length === 0);
const showTable = computed(
  () => props.rows.length > 0 && (!props.dataState || props.dataState.kind === "stale" || props.dataState.kind === "conflict")
);
</script>

<template>
  <AdminMetricGrid v-if="summaryCards.length" :cards="summaryCards" grid-class="admin-metric-grid--summary" />

  <AdminFilterBar
    :count-label="`${rows.length} / ${totalCount ?? rows.length} 条`"
    :filter-options="statusOptions"
    filter-test-attr="data-governance-status-filter"
    :filter-value="statusFilter"
    placeholder="搜索当前记录"
    :query="query"
    @update:query="emit('update:query', $event)"
    @update:filter-value="emit('update:statusFilter', $event)"
  />

  <section class="admin-governance-layout">
    <AdminDataTable
      :data-state="showState ? resolvedDataState : null"
      description="选择一条记录，在右侧查看完整字段和操作入口。"
      :show-table="showTable"
      table-class="admin-table--records"
      title="记录列表"
    >
      <template #head>
        <AdminTableHead :columns="tableHeadColumns" />
      </template>

      <AdminRecordRow
        v-for="(row, index) in rows"
        :key="index"
        :columns="columns"
        :row="row"
        :row-key="String(row.id ?? index)"
        :selected="selectedRecord === row"
        @press="emit('selectRecord', $event)"
      />
    </AdminDataTable>

    <AdminRecordInspector
      empty-text="从左侧表格选择一条记录，查看完整字段。"
      :fields="inspectorFields"
      :title="selectedRecord ? getGovernanceRecordTitle(selectedRecord) : '选择一条记录'"
    >
      <template v-if="selectedRecord && actions.length" #actions>
        <AdminActionBar
          namespace="governance"
          :actions="actions"
          @press="requestAction"
        />
      </template>
    </AdminRecordInspector>
  </section>
</template>
