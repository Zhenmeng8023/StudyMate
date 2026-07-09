<script setup lang="ts">
import { computed } from "vue";
import AdminButton from "./AdminButton.vue";

const props = withDefaults(defineProps<{
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
}>(), {
  cancelLabel: "取消",
  confirmLabel: "确认",
  confirmTone: "default",
  confirming: false
});

const emit = defineEmits<{
  cancel: [];
  confirm: [];
}>();

const confirmText = computed(() => {
  if (props.confirming) {
    return props.confirmingLabel ?? `${props.confirmLabel ?? "确认"}中…`;
  }

  return props.confirmLabel ?? "确认";
});
</script>

<template>
  <div v-if="isOpen" class="admin-confirm-dialog-backdrop">
    <section
      :aria-describedby="description || errorMessage ? 'admin-confirm-dialog-description' : undefined"
      aria-labelledby="admin-confirm-dialog-title"
      aria-modal="true"
      class="admin-confirm-dialog"
      role="dialog"
    >
      <div class="admin-confirm-dialog__body">
        <h2 id="admin-confirm-dialog-title">{{ title }}</h2>
        <p v-if="description" id="admin-confirm-dialog-description">{{ description }}</p>
        <p v-else-if="errorMessage" id="admin-confirm-dialog-description" />
        <p v-if="errorMessage" class="admin-confirm-dialog__error" role="alert">{{ errorMessage }}</p>
      </div>
      <div class="admin-confirm-dialog__footer">
        <AdminButton
          data-confirm-cancel="true"
          :disabled="confirming"
          @click="emit('cancel')"
        >
          {{ cancelLabel }}
        </AdminButton>
        <AdminButton
          data-confirm-submit="true"
          :danger="confirmTone === 'danger'"
          :disabled="confirming || confirmDisabled"
          variant="primary"
          @click="emit('confirm')"
        >
          {{ confirmText }}
        </AdminButton>
      </div>
    </section>
  </div>
</template>
