<script setup lang="ts">
import AdminInput from "./AdminInput.vue";

defineProps<{
  countLabel: string;
  placeholder: string;
  query: string;
}>();

const emit = defineEmits<{
  "update:query": [value: string];
}>();
</script>

<template>
  <section class="admin-toolbar" data-admin-search-toolbar="true">
    <label class="admin-search">
      <span aria-hidden="true">S</span>
      <AdminInput
        :model-value="query"
        :placeholder="placeholder"
        @update:model-value="emit('update:query', $event)"
      />
    </label>
    <div class="admin-toolbar__meta" data-admin-search-toolbar-meta="true">
      <span>{{ countLabel }}</span>
    </div>
  </section>
</template>
