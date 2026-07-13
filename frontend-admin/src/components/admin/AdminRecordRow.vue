<script setup lang="ts">
import AdminTag from "./AdminTag.vue";
import { formatGovernanceCell, type GovernanceRecord } from "./governanceRecord";

const props = defineProps<{
  columns: string[];
  row: GovernanceRecord;
  rowKey: string;
  selected: boolean;
}>();

const emit = defineEmits<{
  press: [record: GovernanceRecord];
}>();

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
    <span v-for="column in columns" :key="column" :title="formatGovernanceCell(row[column])">
      <AdminTag v-if="isStatusColumn(column)" :label="formatGovernanceCell(row[column])" tone="status" />
      <template v-else>{{ formatGovernanceCell(row[column]) }}</template>
    </span>
  </button>
</template>
