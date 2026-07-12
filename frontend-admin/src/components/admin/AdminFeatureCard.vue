<script setup lang="ts">
withDefaults(defineProps<{
  description?: string;
  eyebrow: string;
  title: string;
  variant?: "split" | "stacked";
}>(), {
  description: "",
  variant: "stacked"
});
</script>

<template>
  <article
    :class="variant === 'split' ? 'admin-priority-card' : 'admin-status-card'"
    data-admin-feature-card="true"
  >
    <div>
      <p class="eyebrow" data-admin-feature-card-eyebrow="true">{{ eyebrow }}</p>
      <h2 data-admin-feature-card-title="true">{{ title }}</h2>
      <p v-if="description" data-admin-feature-card-description="true">{{ description }}</p>
      <slot />
    </div>
    <div v-if="$slots.actions" data-admin-feature-card-actions="true">
      <slot name="actions" />
    </div>
  </article>
</template>
