<script setup lang="ts">
defineProps<{
  columns: string[];
}>();
</script>

<template>
  <div class="admin-table__head" data-admin-table-head="true" role="row">
    <span
      v-for="column in columns"
      :key="column"
      data-admin-table-head-cell="true"
    >
      {{ column }}
    </span>
  </div>
</template>
