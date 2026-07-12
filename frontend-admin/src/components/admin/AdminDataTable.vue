<script setup lang="ts">
import AdminDataCardHeader from "./AdminDataCardHeader.vue";
import AdminDataState from "./AdminDataState.vue";
import type { AdminDataStatePayload } from "./dataState";

defineProps<{
  cardClass?: string;
  dataState?: AdminDataStatePayload | null;
  description: string;
  showTable: boolean;
  tableClass?: string;
  title: string;
}>();
</script>

<template>
  <section
    :class="cardClass ? `admin-data-card ${cardClass}` : 'admin-data-card'"
    data-admin-data-table="true"
  >
    <AdminDataCardHeader
      :description="description"
      :title="title"
    />
    <AdminDataState
      v-if="dataState"
      :description="dataState.description"
      :kind="dataState.kind"
      :title="dataState.title"
    />
    <div
      v-if="showTable"
      :class="tableClass ? `admin-table ${tableClass}` : 'admin-table'"
      data-admin-data-table-body="true"
      role="table"
    >
      <slot name="head" />
      <slot />
    </div>
  </section>
</template>
