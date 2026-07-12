<script setup lang="ts">
defineProps<{
  active: boolean;
  badge?: string;
  icon: string;
  label: string;
  viewKey: string;
}>();

const emit = defineEmits<{
  press: [view: string];
}>();
</script>

<template>
  <button
    :class="active ? 'nav-item active' : 'nav-item'"
    :aria-label="label"
    :aria-pressed="active"
    data-admin-nav-item="true"
    :data-admin-nav-item-view="viewKey"
    type="button"
    @click="emit('press', viewKey)"
  >
    <span class="nav-item__icon" aria-hidden="true" data-admin-nav-item-icon="true">{{ icon }}</span>
    <span data-admin-nav-item-label="true">{{ label }}</span>
    <em v-if="badge" data-admin-nav-item-badge="true">{{ badge }}</em>
  </button>
</template>
