import type { AdminDataStatePayload } from "../components/admin/dataState";

type AdminViewDataStateInput = {
  errorMessage: string;
  errorStatus: number | null;
  loading: boolean;
  rowCount: number;
};

type GovernanceDataStateInput = AdminViewDataStateInput & {
  activeLabel: string;
};

export function resolveModerationDataState({
  errorMessage,
  errorStatus,
  loading,
  rowCount
}: AdminViewDataStateInput): AdminDataStatePayload | null {
  if (loading && rowCount === 0) {
    return {
      kind: "loading",
      title: "正在同步审核队列",
      description: "请稍候，最新待审核内容和状态正在载入。"
    };
  }

  if (errorStatus === 403) {
    return {
      kind: "unauthorized",
      title: "暂无审核权限",
      description: errorMessage || "当前账号没有查看审核队列的权限。"
    };
  }

  if (errorMessage && rowCount > 0) {
    return {
      kind: "stale",
      title: "审核队列需要刷新",
      description: "当前显示的是上一次同步结果，请刷新后再继续处理。"
    };
  }

  if (errorMessage && rowCount === 0) {
    return {
      kind: "error",
      title: "审核队列暂时不可用",
      description: errorMessage
    };
  }

  return null;
}

export function resolveGovernanceDataState({
  activeLabel,
  errorMessage,
  errorStatus,
  loading,
  rowCount
}: GovernanceDataStateInput): AdminDataStatePayload | null {
  if (loading && rowCount === 0) {
    return {
      kind: "loading",
      title: `正在同步${activeLabel}`,
      description: "请稍候，最新治理记录正在载入。"
    };
  }

  if (errorStatus === 403) {
    return {
      kind: "unauthorized",
      title: "暂无治理权限",
      description: errorMessage || "当前账号没有查看这个治理模块的权限。"
    };
  }

  if (errorStatus === 409) {
    return {
      kind: "conflict",
      title: "治理动作存在冲突",
      description: errorMessage || "这条记录的状态已经被其他人更新，请先刷新后再决定下一步。"
    };
  }

  if (errorMessage && rowCount > 0) {
    return {
      kind: "stale",
      title: "治理记录需要刷新",
      description: "当前显示的是上一次同步结果，请刷新后再继续判断。"
    };
  }

  if (errorMessage && rowCount === 0) {
    return {
      kind: "error",
      title: `${activeLabel}暂时不可用`,
      description: errorMessage
    };
  }

  return null;
}
