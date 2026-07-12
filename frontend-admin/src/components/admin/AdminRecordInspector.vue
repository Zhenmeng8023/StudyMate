<script setup lang="ts">
type InspectorField = {
  label: string;
  value: string;
};

withDefaults(defineProps<{
  eyebrow?: string;
  emptyText: string;
  fields: InspectorField[];
  title: string;
}>(), {
  eyebrow: "记录详情"
});
</script>

<template>
  <aside class="admin-record-inspector" data-admin-record-inspector="true">
    <header>
      <p class="eyebrow" data-admin-record-inspector-eyebrow="true">{{ eyebrow }}</p>
      <h2 data-admin-record-inspector-title="true">{{ title }}</h2>
    </header>
    <dl v-if="fields.length">
      <template v-for="field in fields" :key="`${field.label}:${field.value}`">
        <dt>{{ field.label }}</dt>
        <dd>{{ field.value }}</dd>
      </template>
    </dl>
    <div v-else class="admin-inspector-empty" data-admin-record-inspector-empty="true">{{ emptyText }}</div>
    <div v-if="$slots.actions" class="admin-record-inspector__actions" data-admin-record-inspector-actions="true">
      <slot name="actions" />
    </div>
  </aside>
</template>
