export type ActionConfirmTone = "default" | "danger";

export type ActionConfirmCopy = {
  title: string;
  description: string;
  confirmLabel: string;
  confirmingLabel: string;
  confirmTone: ActionConfirmTone;
};

type ModerationConfirmState =
  | {
      action: "approve" | "reject" | "hide";
      item: {
        title: string;
        status: string;
      };
    }
  | null;

type ReportConfirmState =
  | {
      action: "resolve" | "dismiss";
      record: {
        id?: unknown;
      };
    }
  | null;

type UserConfirmState =
  | {
      action: "disable" | "activate";
      record: {
        username?: unknown;
        displayName?: unknown;
        id?: unknown;
      };
    }
  | null;

type AITaskConfirmState =
  | {
      action: "retry" | "cancel";
      record: {
        id?: unknown;
      };
    }
  | null;

type TemplateConfirmState =
  | {
      action: "publish" | "unpublish";
      record: {
        name?: unknown;
        title?: unknown;
        id?: unknown;
      };
    }
  | null;

const defaultCopy: ActionConfirmCopy = {
  title: "",
  description: "",
  confirmLabel: "确认",
  confirmingLabel: "处理中...",
  confirmTone: "default"
};

export function getModerationConfirmCopy(pending: ModerationConfirmState): ActionConfirmCopy {
  if (!pending) return defaultCopy;

  if (pending.action === "approve") {
    if (String(pending.item.status ?? "").toLowerCase() === "hidden") {
      return {
        title: "确认恢复这条资料",
        description: `恢复后，“${pending.item.title}”会重新回到可见资料状态。`,
        confirmLabel: "确认恢复",
        confirmingLabel: "恢复中...",
        confirmTone: "default"
      };
    }

    return {
      title: "确认通过这条内容",
      description: `通过后，“${pending.item.title}”将按审核结果进入可见状态。`,
      confirmLabel: "确认通过",
      confirmingLabel: "通过中...",
      confirmTone: "default"
    };
  }

  if (pending.action === "reject") {
    return {
      title: "确认驳回这条内容",
      description: `驳回后，“${pending.item.title}”会退出当前待处理队列。`,
      confirmLabel: "确认驳回",
      confirmingLabel: "驳回中...",
      confirmTone: "danger"
    };
  }

  return {
    title: "确认隐藏这条内容",
    description: `隐藏后，“${pending.item.title}”将不再继续对外展示。`,
    confirmLabel: "确认隐藏",
    confirmingLabel: "隐藏中...",
    confirmTone: "danger"
  };
}

export function getReportConfirmCopy(pending: ReportConfirmState): ActionConfirmCopy {
  if (!pending) return defaultCopy;

  if (pending.action === "resolve") {
    return {
      title: "确认标记这条举报已处理",
      description: "处理后，这条举报会退出待处理状态，并记录处理人和处理时间。",
      confirmLabel: "确认已处理",
      confirmingLabel: "处理中...",
      confirmTone: "default"
    };
  }

  return {
    title: "确认忽略这条举报",
    description: "忽略后，这条举报会标记为已忽略，并保留完整审计记录。",
    confirmLabel: "确认忽略",
    confirmingLabel: "忽略中...",
    confirmTone: "danger"
  };
}

export function getUserConfirmCopy(pending: UserConfirmState): ActionConfirmCopy {
  if (!pending) return defaultCopy;

  const username = String(pending.record.username ?? pending.record.displayName ?? pending.record.id ?? "");
  if (pending.action === "disable") {
    return {
      title: "确认禁用这个用户",
      description: `禁用后，${username} 将不能继续登录，后续 refresh 也会被拒绝。`,
      confirmLabel: "确认禁用",
      confirmingLabel: "禁用中...",
      confirmTone: "danger"
    };
  }

  return {
    title: "确认恢复这个用户",
    description: `恢复后，${username} 可以重新登录并继续使用现有账号。`,
    confirmLabel: "确认恢复",
    confirmingLabel: "恢复中...",
    confirmTone: "default"
  };
}

export function getAITaskConfirmCopy(pending: AITaskConfirmState): ActionConfirmCopy {
  if (!pending) return defaultCopy;

  const taskID = String(pending.record.id ?? "");
  if (pending.action === "retry") {
    return {
      title: "确认重试这个 AI 任务",
      description: `重试后，任务 ${taskID} 会重新回到待处理状态，并清空当前失败信息。`,
      confirmLabel: "确认重试",
      confirmingLabel: "重试中...",
      confirmTone: "default"
    };
  }

  return {
    title: "确认取消这个 AI 任务",
    description: `取消后，任务 ${taskID} 会退出待处理状态，并保留可追踪审计记录。`,
    confirmLabel: "确认取消",
    confirmingLabel: "取消中...",
    confirmTone: "danger"
  };
}

export function getTemplateConfirmCopy(pending: TemplateConfirmState): ActionConfirmCopy {
  if (!pending) return defaultCopy;

  const name = String(pending.record.name ?? pending.record.title ?? pending.record.id ?? "");
  if (pending.action === "publish") {
    return {
      title: "确认发布这个图谱模板",
      description: `${name} 发布后会重新出现在用户端图谱模板列表中。`,
      confirmLabel: "确认发布",
      confirmingLabel: "发布中...",
      confirmTone: "default"
    };
  }

  return {
    title: "确认下架这个图谱模板",
    description: `${name} 下架后会从用户端图谱模板列表中隐藏，但保留后台治理记录。`,
    confirmLabel: "确认下架",
    confirmingLabel: "下架中...",
    confirmTone: "danger"
  };
}
