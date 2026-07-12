<script setup lang="ts">
import AdminMetricCard from "./AdminMetricCard.vue";

defineProps<{
  cards: Array<{
    helper: string;
    label: string;
    value: string;
  }>;
  gridClass?: string;
}>();
</script>

<template>
  <section
    :class="gridClass ? `admin-metric-grid ${gridClass}` : 'admin-metric-grid'"
    data-admin-metric-grid="true"
  >
    <AdminMetricCard
      v-for="card in cards"
      :key="card.label"
      :helper="card.helper"
      :label="card.label"
      :value="card.value"
    />
  </section>
</template>
