<script setup lang="ts">
import AdminButton from "../../components/admin/AdminButton.vue";
import AdminFeatureCard from "../../components/admin/AdminFeatureCard.vue";
import AdminMetricGrid from "../../components/admin/AdminMetricGrid.vue";

defineProps<{
  moderationItemsCount: number;
  overviewCards: Array<{ label: string; value: string; helper: string }>;
  pendingMaterialsCount: number;
  pendingPostsCount: number;
}>();

const emit = defineEmits<{
  openModeration: [];
}>();
</script>

<template>
  <AdminMetricGrid :cards="overviewCards" />
  <section class="admin-dashboard-grid">
    <AdminFeatureCard
      description="审核队列中的资料和帖子会直接影响社区与资料库的公开可见性。"
      eyebrow="优先队列"
      title="先处理内容审核"
      variant="split"
    >
      <template #actions>
        <AdminButton data-dashboard-action="open-moderation" variant="primary" @click="emit('openModeration')">
          进入审核队列
        </AdminButton>
      </template>
    </AdminFeatureCard>

    <AdminFeatureCard eyebrow="当前数据" title="审核概览">
      <ul>
        <li><span>待审帖子</span><strong>{{ pendingPostsCount }}</strong></li>
        <li><span>待审资料</span><strong>{{ pendingMaterialsCount }}</strong></li>
        <li><span>审核压力</span><strong>{{ moderationItemsCount ? "需要关注" : "平稳" }}</strong></li>
      </ul>
    </AdminFeatureCard>
  </section>
</template>
