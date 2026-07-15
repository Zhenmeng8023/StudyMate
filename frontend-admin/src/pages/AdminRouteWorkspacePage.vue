<script setup lang="ts">
import AdminWorkspaceView from "../views/AdminWorkspaceView.vue";
import { getAdminRoutePath, type AdminRouteKey } from "../router";
import { useRouter } from "vue-router";

defineProps<{
  routeView: AdminRouteKey;
}>();

const router = useRouter();

function navigate(view: AdminRouteKey, mode: "push" | "replace") {
  const targetPath = getAdminRoutePath(view);
  if (mode === "replace") {
    void router.replace(targetPath);
    return;
  }

  void router.push(targetPath);
}
</script>

<template>
  <AdminWorkspaceView
    :initial-view="routeView"
    :listen-to-popstate="false"
    :navigate="navigate"
  />
</template>
