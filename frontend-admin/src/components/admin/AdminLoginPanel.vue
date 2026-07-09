<script setup lang="ts">
import AdminButton from "./AdminButton.vue";
import AdminInput from "./AdminInput.vue";

defineProps<{
  errorMessage: string;
  loading: boolean;
  loginPrompt: string;
  loginValue: string;
  passwordValue: string;
}>();

const emit = defineEmits<{
  "update:loginValue": [value: string];
  "update:passwordValue": [value: string];
  submit: [];
}>();
</script>

<template>
  <section class="admin-login">
    <section class="admin-login__brand">
      <span class="admin-login__mark">S</span>
      <div>
        <p>StudyMate 管理后台</p>
        <h1>治理工作台</h1>
        <span>面向内容、用户和学习资产的统一运营入口。</span>
      </div>
    </section>
    <section class="login-card">
      <p class="eyebrow">管理员登录</p>
      <h2>进入管理后台</h2>
      <p>使用具备管理权限的账号登录后，查看实时治理队列。</p>
      <form class="form-stack" @submit.prevent="emit('submit')">
        <label>
          <span>账号</span>
          <AdminInput
            :model-value="loginValue"
            placeholder="用户名或邮箱"
            @update:model-value="emit('update:loginValue', $event)"
          />
        </label>
        <label>
          <span>密码</span>
          <AdminInput
            :model-value="passwordValue"
            placeholder="密码"
            type="password"
            @update:model-value="emit('update:passwordValue', $event)"
          />
        </label>
        <p v-if="loginPrompt" class="error-text">{{ loginPrompt }}</p>
        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
        <AdminButton :disabled="loading" type="submit" variant="primary">
          {{ loading ? "登录中…" : "登录工作台" }}
        </AdminButton>
      </form>
    </section>
  </section>
</template>
