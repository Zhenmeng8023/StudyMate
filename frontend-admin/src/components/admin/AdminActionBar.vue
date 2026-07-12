<script setup lang="ts">
import AdminButton from "./AdminButton.vue";

type AdminActionBarItem = {
  key: string;
  label: string;
  tone?: "default" | "danger";
  variant?: "primary" | "secondary" | "ghost";
};

const props = withDefaults(defineProps<{
  actions: AdminActionBarItem[];
  compact?: boolean;
  namespace?: string;
}>(), {
  compact: false,
  namespace: "admin"
});

const emit = defineEmits<{
  press: [action: string];
}>();

function getActionAttrs(actionKey: string) {
  return {
    "data-admin-action-bar-action": actionKey,
    [`data-${props.namespace}-action`]: actionKey
  };
}
</script>

<template>
  <div
    :class="compact ? 'admin-action-bar admin-row-actions' : 'admin-action-bar'"
    data-admin-action-bar="true"
  >
    <AdminButton
      v-for="action in actions"
      :key="action.key"
      v-bind="getActionAttrs(action.key)"
      :danger="action.tone === 'danger'"
      :variant="action.variant ?? 'secondary'"
      @click="emit('press', action.key)"
    >
      {{ action.label }}
    </AdminButton>
  </div>
</template>
