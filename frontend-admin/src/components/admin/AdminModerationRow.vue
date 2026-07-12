<script setup lang="ts">
import AdminActionBar from "./AdminActionBar.vue";
import AdminContentCell from "./AdminContentCell.vue";
import AdminTag from "./AdminTag.vue";

type ModerationItem = {
  id: string;
  type: "post" | "material";
  title: string;
  summary: string;
  authorName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type ModerationActionKey = "approve" | "reject" | "hide";

const props = defineProps<{
  actions: Array<{
    key: ModerationActionKey;
    label: string;
    tone?: "default" | "danger";
    variant?: "primary" | "secondary" | "ghost";
  }>;
  item: ModerationItem;
}>();

const emit = defineEmits<{
  press: [payload: { action: ModerationActionKey; item: ModerationItem }];
}>();

function handlePress(action: string) {
  emit("press", { action: action as ModerationActionKey, item: props.item });
}
</script>

<template>
  <article
    class="admin-table__row"
    data-admin-moderation-row="true"
    :data-moderation-row="item.id"
    role="row"
  >
    <AdminContentCell :summary="item.summary" :title="item.title" />
    <span><AdminTag :label="item.type === 'post' ? '帖子' : '资料'" /></span>
    <span>{{ item.authorName }}</span>
    <span>{{ new Date(item.createdAt).toLocaleString("zh-CN") }}</span>
    <span><AdminTag :label="item.status" tone="status" /></span>
    <AdminActionBar
      compact
      namespace="moderation"
      :actions="actions"
      @press="handlePress"
    />
  </article>
</template>
