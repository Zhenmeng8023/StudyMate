export type AdminDashboardSummaryItem = {
  label: string;
  value: string;
};

export const adminDashboardModerationFeature = {
  actionLabel: "进入审核队列",
  description: "审核队列中的资料和帖子会直接影响社区与资料库的公开可见性。",
  eyebrow: "优先队列",
  title: "先处理内容审核"
} as const;

export const adminDashboardSummaryFeature = {
  eyebrow: "当前数据",
  title: "审核概览"
} as const;

export function buildAdminDashboardSummaryItems(input: {
  moderationItemsCount: number;
  pendingMaterialsCount: number;
  pendingPostsCount: number;
}): AdminDashboardSummaryItem[] {
  const { moderationItemsCount, pendingMaterialsCount, pendingPostsCount } = input;

  return [
    { label: "待审帖子", value: String(pendingPostsCount) },
    { label: "待审资料", value: String(pendingMaterialsCount) },
    { label: "审核压力", value: moderationItemsCount ? "需要关注" : "平稳" }
  ];
}
