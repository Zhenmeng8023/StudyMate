<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<template>
  <section class="admin-nav__group" data-admin-nav-group="true">
    <p data-admin-nav-group-title="true">{{ title }}</p>
    <slot />
  </section>
</template>
