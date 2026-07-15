<script setup lang="ts">
import "../components/admin/admin.css";
import { onBeforeUnmount, onMounted, watch } from "vue";
import AdminWorkspacePageSurface from "./AdminWorkspacePageSurface.vue";
import type { AdminRouteKey } from "../router";
import { createAdminWorkspacePageFeature } from "./adminWorkspacePageFeature";

interface OverviewPayload {
  userCount: number;
  postCount: number;
  materialCount: number;
  graphCount: number;
  pendingModerationCount: number;
}

const props = withDefaults(
  defineProps<{
    initialView?: AdminRouteKey;
    listenToPopstate?: boolean;
    navigate?: (view: AdminRouteKey, mode: "push" | "replace") => void;
  }>(),
  {
    initialView: undefined,
    listenToPopstate: true,
    navigate: undefined
  }
);

const workspacePageFeature = createAdminWorkspacePageFeature<OverviewPayload>({
  initialNotice: "\u767b\u5f55\u540e\u4f1a\u540c\u6b65\u5f53\u524d\u6cbb\u7406\u961f\u5217\u4e0e\u8fd0\u8425\u6570\u636e\u3002",
  initialView: props.initialView,
  listenToPopstate: props.listenToPopstate,
  navigate: props.navigate
});
const workspaceSurface = workspacePageFeature.surface;

let stopRuntime: (() => void) | null = null;

onMounted(() => {
  stopRuntime = workspacePageFeature.startRuntime();
});

onBeforeUnmount(() => {
  stopRuntime?.();
  stopRuntime = null;
});

watch(
  () => props.initialView,
  (nextView, previousView) => {
    if (!props.navigate || !nextView || nextView === previousView) {
      return;
    }

    workspacePageFeature.applyRouteView(nextView);
  }
);
</script>

<template>
  <AdminWorkspacePageSurface :surface="workspaceSurface" />
</template>
