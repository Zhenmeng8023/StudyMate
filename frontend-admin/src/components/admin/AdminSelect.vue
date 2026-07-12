<script setup lang="ts">
withDefaults(defineProps<{
  disabled?: boolean;
  invalid?: boolean;
  modelValue?: string;
}>(), {
  disabled: false,
  invalid: false,
  modelValue: ""
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <select
    :aria-invalid="invalid ? 'true' : undefined"
    :class="['ds-select', invalid ? 'is-invalid' : '']"
    :disabled="disabled"
    :value="modelValue"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <slot />
  </select>
</template>
