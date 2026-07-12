<script setup lang="ts">
defineProps<{
  description: string;
  eyebrow: string;
  title: string;
}>();
</script>

<template>
  <section class="admin-page-heading" data-admin-page-header="true">
    <div>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="admin-page-heading__actions" data-admin-page-header-actions="true">
      <slot name="actions" />
    </div>
  </section>
</template>
