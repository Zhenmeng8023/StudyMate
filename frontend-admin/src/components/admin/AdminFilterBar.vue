<script setup lang="ts">
import AdminFilterSelect from "./AdminFilterSelect.vue";
import AdminSearchToolbar from "./AdminSearchToolbar.vue";

type FilterOption = {
  label: string;
  value: string;
};

const props = withDefaults(defineProps<{
  countLabel: string;
  filterOptions?: FilterOption[];
  filterTestAttr?: string;
  filterValue?: string;
  placeholder: string;
  query: string;
}>(), {
  filterOptions: () => [],
  filterTestAttr: "data-admin-filter",
  filterValue: ""
});

const emit = defineEmits<{
  "update:filterValue": [value: string];
  "update:query": [value: string];
}>();
</script>

<template>
  <section data-admin-filter-bar="true">
    <AdminSearchToolbar
      :count-label="countLabel"
      :placeholder="placeholder"
      :query="query"
      @update:query="emit('update:query', $event)"
    >
      <template v-if="filterOptions.length > 1" #filters>
        <AdminFilterSelect
          :model-value="filterValue"
          :options="filterOptions"
          :test-attr="filterTestAttr"
          @update:model-value="emit('update:filterValue', $event)"
        />
      </template>
    </AdminSearchToolbar>
  </section>
</template>
