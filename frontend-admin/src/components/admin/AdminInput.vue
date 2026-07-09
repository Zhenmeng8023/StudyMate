<script setup lang="ts">
withDefaults(defineProps<{
  invalid?: boolean;
  modelValue?: string;
  type?: string;
}>(), {
  invalid: false,
  modelValue: "",
  type: "text"
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <input
    :aria-invalid="invalid ? 'true' : undefined"
    :class="['ds-input', invalid ? 'is-invalid' : '']"
    :type="type"
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
