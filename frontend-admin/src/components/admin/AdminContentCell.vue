<script setup lang="ts">
defineProps<{
  summary: string;
  title: string;
}>();
</script>

<template>
  <div class="admin-content-cell" data-admin-content-cell="true">
    <strong data-admin-content-cell-title="true">{{ title }}</strong>
    <p data-admin-content-cell-summary="true">{{ summary }}</p>
  </div>
</template>
