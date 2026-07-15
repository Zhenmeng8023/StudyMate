<script setup lang="ts">
import { computed } from "vue";
import type { AdminRouteKey } from "../router";
import type { ConfirmDialogKey } from "./adminConfirmDialogState";
import type { createAdminWorkspaceSurfaceAdapter } from "./adminWorkspaceSurfaceAdapter";
import AdminConfirmStack from "../components/admin/AdminConfirmStack.vue";
import AdminLoginPanel from "../components/admin/AdminLoginPanel.vue";
import AdminShellFrame from "../components/admin/AdminShellFrame.vue";
import AdminWorkspaceModuleHost from "./modules/AdminWorkspaceModuleHost.vue";

type AdminWorkspaceSurface = ReturnType<typeof createAdminWorkspaceSurfaceAdapter>;

const props = defineProps<{
  surface: AdminWorkspaceSurface;
}>();

const activeView = computed(() => props.surface.shellProps.activeView as AdminRouteKey);

function handleConfirmDialogCancel(key: ConfirmDialogKey) {
  props.surface.cancelConfirmDialog(key);
}

async function handleConfirmDialogConfirm(key: ConfirmDialogKey) {
  await props.surface.confirmConfirmDialog(key);
}
</script>

<template>
  <main>
    <AdminConfirmStack
      :dialogs="surface.confirmDialogs"
      @cancel="handleConfirmDialogCancel($event as ConfirmDialogKey)"
      @confirm="handleConfirmDialogConfirm($event as ConfirmDialogKey)"
    />

    <AdminLoginPanel
      v-if="!surface.loggedIn"
      :error-message="surface.loginPanelProps.errorMessage"
      :loading="surface.loginPanelProps.loading"
      :notice="surface.loginPanelProps.notice"
      :login-prompt="surface.loginPanelProps.loginPrompt"
      :login-value="surface.loginPanelProps.loginValue"
      :password-value="surface.loginPanelProps.passwordValue"
      @submit="surface.loginPanelEvents.submit()"
      @update:login-value="surface.loginPanelEvents.updateLoginValue($event)"
      @update:password-value="surface.loginPanelEvents.updatePasswordValue($event)"
    />

    <AdminShellFrame
      v-else
      :active-description="surface.shellProps.activeDescription"
      :active-group="surface.shellProps.activeGroup"
      :active-title="surface.shellProps.activeTitle"
      :active-view="surface.shellProps.activeView"
      :count-label="surface.shellProps.countLabel"
      :error-message="surface.shellProps.errorMessage"
      :loading="surface.shellProps.loading"
      :nav-groups="surface.shellProps.navGroups"
      :notice="surface.shellProps.notice"
      :profile="surface.shellProps.profile"
      :profile-initial="surface.shellProps.profileInitial"
      @logout="surface.shellEvents.logout()"
      @refresh="surface.shellEvents.refresh()"
      @switch-view="surface.shellEvents.switchView($event as AdminRouteKey)"
    >
      <AdminWorkspaceModuleHost
        :active-view="activeView"
        :module-events="surface.moduleEvents"
        :module-props="surface.moduleProps"
      />
    </AdminShellFrame>
  </main>
</template>
