<script setup lang="ts">
import AdminConfirmDialog from "./AdminConfirmDialog.vue";

type AdminConfirmStackItem = {
  key: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  confirmTone?: "default" | "danger";
  confirming?: boolean;
  confirmingLabel?: string;
  description?: string;
  errorMessage?: string;
  isOpen: boolean;
  title: string;
};

defineProps<{
  dialogs: AdminConfirmStackItem[];
}>();

const emit = defineEmits<{
  cancel: [key: string];
  confirm: [key: string];
}>();
</script>

<template>
  <div v-if="dialogs.length" data-admin-confirm-stack="true">
    <AdminConfirmDialog
      v-for="dialog in dialogs"
      :key="dialog.key"
      :cancel-label="dialog.cancelLabel"
      :confirm-disabled="dialog.confirmDisabled"
      :confirm-label="dialog.confirmLabel"
      :confirm-tone="dialog.confirmTone"
      :confirming="dialog.confirming"
      :confirming-label="dialog.confirmingLabel"
      :description="dialog.description"
      :error-message="dialog.errorMessage"
      :is-open="dialog.isOpen"
      :title="dialog.title"
      @cancel="emit('cancel', dialog.key)"
      @confirm="emit('confirm', dialog.key)"
    />
  </div>
</template>
