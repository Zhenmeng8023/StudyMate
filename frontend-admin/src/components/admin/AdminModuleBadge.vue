<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<template>
  <span class="admin-module-badge">{{ label }}</span>
</template>
