<script setup lang="ts">
import AdminSelect from "./AdminSelect.vue";

type FilterOption = {
  label: string;
  value: string;
};

const props = defineProps<{
  modelValue: string;
  options: FilterOption[];
  testAttr: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <AdminSelect
    class="admin-filter-select"
    data-admin-filter-select="true"
    :model-value="props.modelValue"
    v-bind="{ [props.testAttr]: 'true' }"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <option v-for="option in props.options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </AdminSelect>
</template>
