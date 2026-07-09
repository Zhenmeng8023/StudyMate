<script setup lang="ts">
import { computed } from "vue";
import { getDataStateLabel } from "@studymate/ui";
import type { AdminDataStatePayload } from "./dataState";

const props = defineProps<AdminDataStatePayload>();

const stateLabel = computed(() => getDataStateLabel(props.kind));
const isAlertState = computed(() => ["conflict", "error", "unauthorized"].includes(props.kind));
</script>

<template>
  <section
    :aria-live="kind === 'loading' ? 'polite' : undefined"
    :class="`admin-data-state admin-data-state--${kind}`"
    :role="isAlertState ? 'alert' : 'status'"
  >
    <div class="admin-data-state__copy">
      <p class="eyebrow">{{ stateLabel }}</p>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
  </section>
</template>
