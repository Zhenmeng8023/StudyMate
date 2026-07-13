import type { GovernanceRecord } from "../components/admin/governanceRecord";
import type { GovernanceModuleView } from "./adminGovernanceConfig";

export type GovernanceMutationKey = "report" | "user" | "aiTask" | "template";

type GovernanceMutationConfig = {
  errorFallbackMessage: string;
  missingIdMessage: string;
  pathPrefix: string;
  reloadView: Extract<GovernanceModuleView, "community" | "users" | "ai" | "graph">;
  successLabel: string;
};

type GovernanceMutationReady = {
  kind: "ready";
  path: string;
  successNotice: string;
  errorFallbackMessage: string;
  reloadView: Extract<GovernanceModuleView, "community" | "users" | "ai" | "graph">;
};

type GovernanceMutationInvalid = {
  kind: "invalid";
  message: string;
};

const governanceMutationConfig: Record<GovernanceMutationKey, GovernanceMutationConfig> = {
  report: {
    pathPrefix: "/api/v1/admin/reports",
    successLabel: "举报",
    missingIdMessage: "举报标识缺失，无法提交处理结果。",
    errorFallbackMessage: "更新举报状态失败",
    reloadView: "community"
  },
  user: {
    pathPrefix: "/api/v1/admin/users",
    successLabel: "用户",
    missingIdMessage: "用户标识缺失，无法提交治理动作。",
    errorFallbackMessage: "更新用户状态失败",
    reloadView: "users"
  },
  aiTask: {
    pathPrefix: "/api/v1/admin/ai/tasks",
    successLabel: "AI 任务",
    missingIdMessage: "AI 任务标识缺失，无法提交治理动作。",
    errorFallbackMessage: "更新 AI 任务状态失败",
    reloadView: "ai"
  },
  template: {
    pathPrefix: "/api/v1/admin/diagram-templates",
    successLabel: "图谱模板",
    missingIdMessage: "图谱模板标识缺失，无法提交治理动作。",
    errorFallbackMessage: "更新图谱模板状态失败",
    reloadView: "graph"
  }
};

export function resolveGovernanceMutationMeta(
  key: GovernanceMutationKey,
  record: GovernanceRecord,
  action: string
): GovernanceMutationReady | GovernanceMutationInvalid {
  const config = governanceMutationConfig[key];
  const id = String(record.id ?? "").trim();
  if (!id) {
    return {
      kind: "invalid",
      message: config.missingIdMessage
    };
  }

  return {
    kind: "ready",
    path: `${config.pathPrefix}/${id}/${action}`,
    successNotice: `${config.successLabel} ${id} 已更新为 {status}。`,
    errorFallbackMessage: config.errorFallbackMessage,
    reloadView: config.reloadView
  };
}
