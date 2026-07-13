import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { AdminRouteKey } from "../router";

export type GovernanceModuleView = Exclude<AdminRouteKey, "dashboard" | "moderation">;

export type GovernanceModuleConfig = {
  description: string;
  empty: string;
  endpoint: string;
  query: {
    limit: number;
  };
};

export type GovernanceActionItem = {
  key: string;
  label: string;
  tone?: "default" | "danger";
  variant?: "primary" | "secondary" | "ghost";
};

export type GovernanceModerationItem = {
  id: string;
  type: "material";
  title: string;
  summary: string;
  authorName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type GovernanceActionPayload = {
  action: string;
  record: GovernanceRecord;
};

export type GovernanceActionDispatch =
  | { kind: "report"; action: "resolve" | "dismiss"; record: GovernanceRecord }
  | { kind: "moderation"; action: "approve" | "reject" | "hide"; item: GovernanceModerationItem }
  | { kind: "user"; action: "disable" | "activate"; record: GovernanceRecord }
  | { kind: "aiTask"; action: "retry" | "cancel"; record: GovernanceRecord }
  | { kind: "template"; action: "publish" | "unpublish"; record: GovernanceRecord }
  | { kind: "invalid"; message?: string }
  | { kind: "noop" };

export const governanceModuleConfig: Record<GovernanceModuleView, GovernanceModuleConfig> = {
  materials: {
    endpoint: "/api/v1/admin/materials",
    query: { limit: 20 },
    empty: "暂无资料治理记录。",
    description: "查看资料状态、作者与附件，并直接执行审核或上下架动作。"
  },
  community: {
    endpoint: "/api/v1/admin/reports",
    query: { limit: 20 },
    empty: "暂无举报记录。",
    description: "集中查看用户提交的举报与处理线索。"
  },
  users: {
    endpoint: "/api/v1/admin/users",
    query: { limit: 20 },
    empty: "暂无用户记录。",
    description: "按账号状态与角色查看用户资料。"
  },
  graph: {
    endpoint: "/api/v1/admin/diagram-templates",
    query: { limit: 20 },
    empty: "暂无图谱模板记录。",
    description: "管理图谱模板的发布状态与基础元数据。"
  },
  ai: {
    endpoint: "/api/v1/admin/ai/tasks",
    query: { limit: 20 },
    empty: "暂无 AI 任务。",
    description: "追踪生成任务、状态与用量概览。"
  },
  system: {
    endpoint: "/api/v1/admin/files",
    query: { limit: 20 },
    empty: "暂无文件记录。",
    description: "查看上传文件与存储治理信息。"
  },
  audit: {
    endpoint: "/api/v1/admin/audit-logs",
    query: { limit: 20 },
    empty: "暂无审计日志。",
    description: "查看关键治理操作的可追溯记录。"
  }
};

export function isGovernanceModuleView(view: AdminRouteKey): view is GovernanceModuleView {
  return view !== "dashboard" && view !== "moderation";
}

export function getGovernanceActions(view: AdminRouteKey, record: GovernanceRecord | null): GovernanceActionItem[] {
  if (!record || !isGovernanceModuleView(view)) return [];

  const status = String(record.status ?? "").toLowerCase();
  if (view === "community") {
    if (status !== "pending") return [];
    return [
      { key: "resolve", label: "标记已处理" },
      { key: "dismiss", label: "忽略举报", tone: "danger" }
    ];
  }

  if (view === "materials") {
    if (status === "pending") {
      return [
        { key: "approve", label: "通过资料" },
        { key: "reject", label: "驳回资料", tone: "danger" }
      ];
    }
    if (status === "approved") {
      return [{ key: "hide", label: "下架资料", tone: "danger" }];
    }
    if (status === "hidden") {
      return [{ key: "approve", label: "恢复资料" }];
    }
    return [];
  }

  if (view === "users") {
    const role = String(record.role ?? "").toLowerCase();
    if (role === "admin") return [];
    if (status === "active") {
      return [{ key: "disable", label: "禁用用户", tone: "danger" }];
    }
    if (status === "disabled") {
      return [{ key: "activate", label: "恢复用户" }];
    }
    return [];
  }

  if (view === "ai") {
    if (status === "failed") {
      return [{ key: "retry", label: "重试任务" }];
    }
    if (status === "pending") {
      return [{ key: "cancel", label: "取消任务", tone: "danger" }];
    }
    return [];
  }

  if (view === "graph") {
    if (status === "published") {
      return [{ key: "unpublish", label: "下架模板", tone: "danger" }];
    }
    if (status === "unpublished") {
      return [{ key: "publish", label: "发布模板" }];
    }
  }

  return [];
}

export function mapGovernanceRecordToModerationItem(record: GovernanceRecord): GovernanceModerationItem | null {
  const id = String(record.id ?? "").trim();
  const title = String(record.title ?? "").trim();
  if (!id || !title) return null;

  const summarySource = record.description ?? record.category ?? record.attachmentName ?? "";
  return {
    id,
    type: "material",
    title,
    summary: String(summarySource),
    authorName: String(record.ownerName ?? ""),
    status: String(record.status ?? ""),
    createdAt: String(record.createdAt ?? ""),
    updatedAt: String(record.updatedAt ?? "")
  };
}

export function resolveGovernanceActionDispatch(
  view: AdminRouteKey,
  payload: GovernanceActionPayload
): GovernanceActionDispatch {
  if (view === "community") {
    if (payload.action !== "resolve" && payload.action !== "dismiss") return { kind: "noop" };
    return {
      kind: "report",
      action: payload.action,
      record: payload.record
    };
  }

  if (view === "materials") {
    if (payload.action !== "approve" && payload.action !== "reject" && payload.action !== "hide") return { kind: "noop" };

    const item = mapGovernanceRecordToModerationItem(payload.record);
    if (!item) {
      return {
        kind: "invalid",
        message: "资料记录字段不完整，无法提交治理动作。"
      };
    }

    return {
      kind: "moderation",
      action: payload.action,
      item
    };
  }

  if (view === "users") {
    if (payload.action !== "disable" && payload.action !== "activate") return { kind: "noop" };
    return {
      kind: "user",
      action: payload.action,
      record: payload.record
    };
  }

  if (view === "ai") {
    if (payload.action !== "retry" && payload.action !== "cancel") return { kind: "noop" };
    return {
      kind: "aiTask",
      action: payload.action,
      record: payload.record
    };
  }

  if (view === "graph") {
    if (payload.action !== "publish" && payload.action !== "unpublish") return { kind: "noop" };
    return {
      kind: "template",
      action: payload.action,
      record: payload.record
    };
  }

  return { kind: "noop" };
}
