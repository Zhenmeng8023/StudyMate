<script setup lang="ts">
defineProps<{
  crumb: string;
  statusLabel: string;
  statusLoading?: boolean;
  title: string;
}>();
</script>

<template>
  <header class="admin-topbar" data-admin-command-bar="true">
    <div class="admin-topbar__crumb" aria-label="当前治理位置">
      <span data-admin-command-bar-crumb="true">{{ crumb }}</span>
      <i aria-hidden="true">•</i>
      <strong data-admin-command-bar-title="true">{{ title }}</strong>
    </div>
    <div class="admin-topbar__actions" data-admin-command-bar-actions="true">
      <span
        class="admin-sync-state"
        :class="statusLoading ? 'is-loading' : ''"
        data-admin-command-bar-status="true"
      >
        <i />
        {{ statusLabel }}
      </span>
      <slot name="actions" />
    </div>
  </header>
</template>
