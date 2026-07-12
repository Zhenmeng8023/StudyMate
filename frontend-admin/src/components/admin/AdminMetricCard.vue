<script setup lang="ts">
defineProps<{
  helper: string;
  label: string;
  value: string | number;
}>();
</script>

<template>
  <article class="metric-card" data-admin-metric-card="true">
    <span data-admin-metric-card-label="true">{{ label }}</span>
    <strong data-admin-metric-card-value="true">{{ value }}</strong>
    <p data-admin-metric-card-helper="true">{{ helper }}</p>
  </article>
</template>
