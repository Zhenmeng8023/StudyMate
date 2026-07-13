<script setup lang="ts">
import { computed } from "vue";
import AdminButton from "../../components/admin/AdminButton.vue";
import AdminFeatureCard from "../../components/admin/AdminFeatureCard.vue";
import AdminMetricGrid from "../../components/admin/AdminMetricGrid.vue";
import {
  adminDashboardModerationFeature,
  adminDashboardSummaryFeature,
  buildAdminDashboardSummaryItems
} from "../adminDashboardMeta";

const props = defineProps<{
  moderationItemsCount: number;
  overviewCards: Array<{ label: string; value: string; helper: string }>;
  pendingMaterialsCount: number;
  pendingPostsCount: number;
}>();

const emit = defineEmits<{
  openModeration: [];
}>();

const moderationSummaryItems = computed(() =>
  buildAdminDashboardSummaryItems({
    moderationItemsCount: props.moderationItemsCount,
    pendingMaterialsCount: props.pendingMaterialsCount,
    pendingPostsCount: props.pendingPostsCount
  })
);
</script>

<template>
  <AdminMetricGrid :cards="overviewCards" />
  <section class="admin-dashboard-grid">
    <AdminFeatureCard
      :description="adminDashboardModerationFeature.description"
      :eyebrow="adminDashboardModerationFeature.eyebrow"
      :title="adminDashboardModerationFeature.title"
      variant="split"
    >
      <template #actions>
        <AdminButton data-dashboard-action="open-moderation" variant="primary" @click="emit('openModeration')">
          {{ adminDashboardModerationFeature.actionLabel }}
        </AdminButton>
      </template>
    </AdminFeatureCard>

    <AdminFeatureCard :eyebrow="adminDashboardSummaryFeature.eyebrow" :title="adminDashboardSummaryFeature.title">
      <ul>
        <li v-for="item in moderationSummaryItems" :key="item.label">
          <span>{{ item.label }}</span><strong>{{ item.value }}</strong>
        </li>
      </ul>
    </AdminFeatureCard>
  </section>
</template>
