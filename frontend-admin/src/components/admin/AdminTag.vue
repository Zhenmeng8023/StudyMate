<script setup lang="ts">
import { computed } from "vue";

type AdminTagTone = "neutral" | "status";

const props = withDefaults(defineProps<{
  label: string;
  tone?: AdminTagTone;
}>(), {
  tone: "neutral"
});

const resolvedClassName = computed(() =>
  props.tone === "status" ? "admin-status-badge" : "admin-type-badge"
);
</script>

<template>
  <i :class="resolvedClassName" data-admin-tag="true" :data-admin-tag-tone="tone">{{ label }}</i>
</template>
