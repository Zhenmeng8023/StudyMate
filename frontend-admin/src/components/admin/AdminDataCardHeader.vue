<script setup lang="ts">
defineProps<{
  description: string;
  title: string;
}>();
</script>

<template>
  <header class="admin-data-card__head" data-admin-data-card-header="true">
    <div>
      <h2 data-admin-data-card-header-title="true">{{ title }}</h2>
      <p data-admin-data-card-header-description="true">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" data-admin-data-card-header-actions="true">
      <slot name="actions" />
    </div>
  </header>
</template>
