export type GovernanceRecordValue = string | number | boolean | null | undefined;
export type GovernanceRecord = Record<string, GovernanceRecordValue>;

const governanceFieldLabels: Record<string, string> = {
  id: "标识",
  title: "标题",
  name: "名称",
  originalName: "文件名",
  username: "用户名",
  email: "邮箱",
  displayName: "显示名称",
  role: "角色",
  status: "状态",
  action: "操作",
  createdAt: "创建时间",
  updatedAt: "更新时间",
  ownerUserId: "归属用户",
  reporterUserId: "举报用户",
  handledBy: "处理人",
  handledAt: "处理时间",
  userId: "用户",
  taskType: "任务类型",
  sourceType: "来源类型",
  sourceId: "来源标识",
  errorMessage: "错误信息",
  targetType: "目标类型",
  targetId: "目标标识",
  size: "文件大小",
  mimeType: "文件类型"
};

const governancePreferredColumns = [
  "title",
  "taskType",
  "name",
  "originalName",
  "username",
  "email",
  "role",
  "status",
  "handledBy",
  "handledAt",
  "model",
  "errorMessage",
  "sourceType",
  "sourceId",
  "action",
  "createdAt",
  "updatedAt",
  "id"
];

export function formatGovernanceCell(value: GovernanceRecordValue) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value);
}

export function formatGovernanceFieldLabel(key: string) {
  return governanceFieldLabels[key] ?? key.replace(/([A-Z])/g, " $1").trim();
}

export function getGovernanceRecordTitle(row: GovernanceRecord) {
  return formatGovernanceCell(row.title ?? row.name ?? row.originalName ?? row.username ?? row.action ?? row.id);
}

export function getGovernanceColumns(rows: GovernanceRecord[], limit = 7) {
  const keys = new Set<string>();
  rows.forEach((row) => Object.keys(row).forEach((key) => keys.add(key)));

  return Array.from(keys)
    .sort((a, b) => {
      const aIndex = governancePreferredColumns.indexOf(a);
      const bIndex = governancePreferredColumns.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .slice(0, limit);
}
