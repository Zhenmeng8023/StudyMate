export type AdminOverviewPayload = {
  graphCount: number;
  materialCount: number;
  pendingModerationCount: number;
  postCount: number;
  userCount: number;
};

export type AdminOverviewCard = {
  helper: string;
  label: string;
  value: string;
};

export function buildAdminOverviewCards(input: {
  moderationItemsCount: number;
  overview: AdminOverviewPayload | null;
}): AdminOverviewCard[] {
  const { moderationItemsCount, overview } = input;

  return [
    {
      label: "待处理",
      value: String(overview?.pendingModerationCount ?? moderationItemsCount),
      helper: "需要审核或复核的公开内容"
    },
    {
      label: "用户规模",
      value: String(overview?.userCount ?? 0),
      helper: "当前已注册的学习者与管理员"
    },
    {
      label: "资料沉淀",
      value: String(overview?.materialCount ?? 0),
      helper: "可被阅读、引用和治理的资料"
    },
    {
      label: "知识图谱",
      value: String(overview?.graphCount ?? 0),
      helper: "用户持续维护的知识结构"
    }
  ];
}
