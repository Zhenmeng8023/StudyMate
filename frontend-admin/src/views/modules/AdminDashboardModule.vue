<script setup lang="ts">
import AdminButton from "../../components/admin/AdminButton.vue";
import AdminMetricCard from "../../components/admin/AdminMetricCard.vue";

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
  <section class="admin-metric-grid">
    <AdminMetricCard
      v-for="card in overviewCards"
      :key="card.label"
      :helper="card.helper"
      :label="card.label"
      :value="card.value"
    />
  </section>
  <section class="admin-dashboard-grid">
    <article class="admin-priority-card">
      <div>
        <p class="eyebrow">优先队列</p>
        <h2>先处理内容审核</h2>
        <p>审核队列中的资料和帖子会直接影响社区与资料库的公开可见性。</p>
      </div>
      <AdminButton data-dashboard-action="open-moderation" variant="primary" @click="emit('openModeration')">
        进入审核队列
      </AdminButton>
    </article>
    <article class="admin-status-card">
      <p class="eyebrow">当前数据</p>
      <ul>
        <li><span>待审帖子</span><strong>{{ pendingPostsCount }}</strong></li>
        <li><span>待审资料</span><strong>{{ pendingMaterialsCount }}</strong></li>
        <li><span>审核压力</span><strong>{{ moderationItemsCount ? "需要关注" : "平稳" }}</strong></li>
      </ul>
    </article>
  </section>
</template>
