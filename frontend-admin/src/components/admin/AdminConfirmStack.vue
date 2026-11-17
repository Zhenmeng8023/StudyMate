<script setup lang="ts">
import type { ConfirmDialogKey } from "../../views/adminConfirmDialogState";
import AdminConfirmDialog from "./AdminConfirmDialog.vue";

type AdminConfirmStackItem = {
  key: ConfirmDialogKey;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  confirmTone?: "default" | "danger";
  confirming?: boolean;
  confirmingLabel?: string;
  description?: string;
  errorMessage?: string;
  isOpen: boolean;
  noteLabel?: string;
  noteMaxLength?: number;
  notePlaceholder?: string;
  title: string;
};

defineProps<{
  dialogs: AdminConfirmStackItem[];
}>();

const emit = defineEmits<{
  cancel: [key: ConfirmDialogKey];
  confirm: [payload: { key: ConfirmDialogKey; note: string }];
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
      :note-label="dialog.noteLabel"
      :note-max-length="dialog.noteMaxLength"
      :note-placeholder="dialog.notePlaceholder"
      :title="dialog.title"
      @cancel="emit('cancel', dialog.key)"
      @confirm="emit('confirm', { key: dialog.key, note: $event })"
    />
  </div>
</template>
