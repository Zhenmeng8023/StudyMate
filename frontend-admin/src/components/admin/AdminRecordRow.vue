<script setup lang="ts">
import AdminTag from "./AdminTag.vue";

type GovernanceRecord = Record<string, string | number | boolean | null | undefined>;

const props = defineProps<{
  columns: string[];
  row: GovernanceRecord;
  rowKey: string;
  selected: boolean;
}>();

const emit = defineEmits<{
  press: [record: GovernanceRecord];
}>();

function formatCell(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value);
}

function isStatusColumn(column: string) {
  return column === "status";
}
</script>

<template>
  <button
    :class="selected ? 'admin-table__row is-selected' : 'admin-table__row'"
    data-admin-record-row="true"
    :data-record-row="rowKey"
    type="button"
    @click="emit('press', row)"
  >
    <span v-for="column in columns" :key="column" :title="formatCell(row[column])">
      <AdminTag v-if="isStatusColumn(column)" :label="formatCell(row[column])" tone="status" />
      <template v-else>{{ formatCell(row[column]) }}</template>
    </span>
  </button>
</template>
