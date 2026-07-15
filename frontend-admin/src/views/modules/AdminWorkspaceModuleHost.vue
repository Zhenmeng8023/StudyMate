<script setup lang="ts">
import type { AdminRouteKey } from "../../router";
import type { buildAdminWorkspaceModuleEvents } from "../adminWorkspaceModuleEvents";
import type { buildAdminWorkspaceModuleProps } from "../adminWorkspaceModuleProps";
import AdminDashboardModule from "./AdminDashboardModule.vue";
import AdminGovernanceModule from "./AdminGovernanceModule.vue";
import AdminModerationModule from "./AdminModerationModule.vue";

type AdminWorkspaceModuleProps = ReturnType<typeof buildAdminWorkspaceModuleProps>;
type AdminWorkspaceModuleEvents = ReturnType<typeof buildAdminWorkspaceModuleEvents>;

defineProps<{
  activeView: AdminRouteKey;
  moduleEvents: AdminWorkspaceModuleEvents;
  moduleProps: AdminWorkspaceModuleProps;
}>();
</script>

<template>
  <AdminDashboardModule
    v-if="activeView === 'dashboard'"
    :moderation-items-count="moduleProps.dashboard.moderationItemsCount"
    :overview-cards="moduleProps.dashboard.overviewCards"
    :pending-materials-count="moduleProps.dashboard.pendingMaterialsCount"
    :pending-posts-count="moduleProps.dashboard.pendingPostsCount"
    @open-moderation="moduleEvents.dashboard.openModeration()"
  />

  <AdminModerationModule
    v-else-if="activeView === 'moderation'"
    :data-state="moduleProps.moderation.dataState"
    :items="moduleProps.moderation.items"
    :query="moduleProps.moderation.query"
    :status-filter="moduleProps.moderation.statusFilter"
    :status-options="moduleProps.moderation.statusOptions"
    :total-count="moduleProps.moderation.totalCount"
    @request-action="moduleEvents.moderation.requestAction($event)"
    @update:query="moduleEvents.moderation.updateQuery($event)"
    @update:status-filter="moduleEvents.moderation.updateStatusFilter($event)"
  />

  <AdminGovernanceModule
    v-else
    :actions="moduleProps.governance.actions"
    :columns="moduleProps.governance.columns"
    :data-state="moduleProps.governance.dataState"
    :empty-text="moduleProps.governance.emptyText"
    :query="moduleProps.governance.query"
    :rows="moduleProps.governance.rows"
    :selected-record="moduleProps.governance.selectedRecord"
    :status-filter="moduleProps.governance.statusFilter"
    :status-options="moduleProps.governance.statusOptions"
    :summary="moduleProps.governance.summary"
    :total-count="moduleProps.governance.totalCount"
    @request-action="moduleEvents.governance.requestAction($event)"
    @select-record="moduleEvents.governance.selectRecord($event)"
    @update:query="moduleEvents.governance.updateQuery($event)"
    @update:status-filter="moduleEvents.governance.updateStatusFilter($event)"
  />
</template>
