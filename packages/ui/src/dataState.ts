export const dataStateKinds = ["empty", "error", "loading", "stale", "unauthorized", "conflict"] as const;

export type DataStateKind = (typeof dataStateKinds)[number];

const dataStateLabels: Record<DataStateKind, string> = {
  empty: "暂无内容",
  error: "暂时不可用",
  loading: "加载中",
  stale: "需要刷新",
  unauthorized: "需要登录",
  conflict: "存在冲突"
};

export function getDataStateLabel(kind: DataStateKind) {
  return dataStateLabels[kind];
}
