<script setup lang="ts">
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
    <article v-for="card in overviewCards" :key="card.label" class="metric-card">
      <span>{{ card.label }}</span><strong>{{ card.value }}</strong><p>{{ card.helper }}</p>
    </article>
  </section>
  <section class="admin-dashboard-grid">
    <article class="admin-priority-card">
      <div>
        <p class="eyebrow">优先队列</p>
        <h2>先处理内容审核</h2>
        <p>审核队列中的资料和帖子会直接影响社区与资料库的公开可见性。</p>
      </div>
      <button class="primary-button" data-dashboard-action="open-moderation" type="button" @click="emit('openModeration')">进入审核队列</button>
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
