<script setup lang="ts">
import { computed } from "vue";

type AdminButtonVariant = "primary" | "secondary" | "ghost";

const props = withDefaults(defineProps<{
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: AdminButtonVariant;
}>(), {
  active: false,
  danger: false,
  disabled: false,
  type: "button",
  variant: "secondary"
});

const resolvedClassName = computed(() => [
  props.variant === "primary" ? "primary-button" : props.variant === "ghost" ? "ghost-button" : "secondary-button",
  props.active ? "active" : "",
  props.danger ? "danger" : ""
].filter(Boolean).join(" "));
</script>

<template>
  <button :class="resolvedClassName" :disabled="disabled" :type="type">
    <slot />
  </button>
</template>
