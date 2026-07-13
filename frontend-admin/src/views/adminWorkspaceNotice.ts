export function getAdminLoginSuccessNotice() {
  return "已进入治理工作台，正在同步当前数据。";
}

export function getAdminSessionEndedNotice(prompt: string | null | undefined) {
  return prompt || "后台会话已失效，请重新登录。";
}

export function getAdminModerationLoadedNotice(count: number) {
  return `当前共有 ${count} 条待处理内容。`;
}

export function getAdminGovernanceLoadedNotice(count: number) {
  return `已加载 ${count} 条治理记录。`;
}

export function getAdminLogoutNotice() {
  return "后台会话已清空。";
}
