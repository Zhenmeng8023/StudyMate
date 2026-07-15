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

  <section class="admin-ops-flow" aria-label="运营治理流程">
    <header>
      <div>
        <p class="eyebrow">治理流程</p>
        <h2>从进入队列到完成处置，保持每一步可追踪</h2>
      </div>
      <AdminButton variant="ghost" @click="emit('openModeration')">查看完整队列</AdminButton>
    </header>
    <div class="admin-ops-flow__steps">
      <article>
        <span>01</span>
        <strong>内容进入</strong>
        <p>{{ pendingMaterialsCount + pendingPostsCount }} 条内容等待系统分类。</p>
      </article>
      <article>
        <span>02</span>
        <strong>人工审核</strong>
        <p>{{ moderationItemsCount }} 条记录需要运营人员判断。</p>
      </article>
      <article>
        <span>03</span>
        <strong>执行处置</strong>
        <p>批准、拒绝或下架操作统一在审核工作区完成。</p>
      </article>
      <article>
        <span>04</span>
        <strong>留痕复盘</strong>
        <p>治理结果进入记录中心，便于后续查询和复盘。</p>
      </article>
    </div>
  </section>
</template>
