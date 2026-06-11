import type { GraphWorkspaceSaveState } from "../state/types";
import type { GraphHistoryBoundarySummary } from "./graphHistory";

export type GraphSettingsSectionKey = "display" | "import-export" | "autosave" | "performance" | "shortcuts";

export type GraphSettingsAction = {
  label: string;
  state: string;
};

export type GraphSettingsSection = {
  key: GraphSettingsSectionKey;
  title: string;
  eyebrow: string;
  actions?: GraphSettingsAction[];
  summary: string;
  tone?: "default" | "warning";
  items: string[];
};

export type GraphSettingsSectionOptions = {
  autosaveDelayMs: number;
  edgeCount: number;
  groupCount: number;
  historyBoundary?: GraphHistoryBoundarySummary;
  nodeCount: number;
  saveState: GraphWorkspaceSaveState;
};

export function buildGraphSettingsSections(options: GraphSettingsSectionOptions): GraphSettingsSection[] {
  const autosaveSeconds = Math.max(1, Math.round(options.autosaveDelayMs / 1000));
  const benchmarkReached = options.nodeCount >= 200 || options.edgeCount >= 300 || options.groupCount >= 20;
  const autosaveWarning = options.saveState === "failed";

  return [
    {
      key: "display",
      eyebrow: "显示偏好",
      title: "画布阅读性",
      summary: "保留阅读性偏好，优先服务大图谱导航。",
      actions: [
        { label: "小地图", state: "已启用" },
        { label: "来源泳道", state: "可生成" },
        { label: "快捷键", state: "可查看" }
      ],
      items: ["保留节点颜色、强调、尺寸预设和分组折叠状态。", "小地图、搜索定位和聚焦选中节点用于大图谱导航。"]
    },
    {
      key: "import-export",
      eyebrow: "导入导出",
      title: "文件能力",
      summary: "导入先解释失败，导出先保留可恢复状态。",
      actions: [
        { label: "Markdown/Mermaid", state: "远端生成草稿" },
        { label: "StudyMate JSON", state: "本地校验" },
        { label: "PNG/SVG", state: "失败显示状态" }
      ],
      items: [
        "支持 Markdown / Mermaid 导入和 PNG / SVG 导出。",
        "StudyMate 图谱 JSON 使用 .smtg 与 application/vnd.studymate.graph+json。",
        "导入失败会保留当前画布，并把结构错误展示在校验面板。",
        "导出失败会回写状态消息，不改变图谱文档。"
      ]
    },
    {
      key: "autosave",
      eyebrow: "自动保存",
      title: "保存状态",
      summary: buildAutosaveSummary(options.saveState),
      tone: autosaveWarning ? "warning" : "default",
      actions: [
        { label: "dirty", state: "离页保护" },
        { label: "pending", state: "显示正在保存" },
        { label: "failed", state: "显示失败原因" },
        ...(options.historyBoundary
          ? [{ label: "Undo/Redo", state: options.historyBoundary.undoRedoLabel }]
          : [])
      ],
      items: [
        `自动保存间隔约 ${autosaveSeconds} 秒。`,
        `当前保存状态：${formatSaveState(options.saveState)}。`,
        "离页前会拦截 dirty / pending 状态。",
        buildAutosaveGuidance(options.saveState),
        ...(options.historyBoundary
          ? [
              `最近历史点：${options.historyBoundary.lastChangeLabel}。`,
              `历史边界：${options.historyBoundary.saveBoundaryLabel}；${options.historyBoundary.riskLabel}`
            ]
          : [])
      ]
    },
    {
      key: "performance",
      eyebrow: "性能提示",
      title: benchmarkReached ? "已达到基准规模" : "当前规模健康",
      summary: benchmarkReached ? "已进入 200/300/20 基准规模，请优先使用治理工具。" : "当前图谱规模仍适合直接编辑。",
      tone: benchmarkReached ? "warning" : "default",
      actions: benchmarkReached
        ? [
            { label: "大图导航", state: "建议使用搜索/小地图" },
            { label: "整理策略", state: "建议使用来源泳道" },
            { label: "导出", state: "大图导出保持进度提示" }
          ]
        : [
            { label: "大图导航", state: "可直接拖动" },
            { label: "整理策略", state: "可随时分组" },
            { label: "导出", state: "保持可用" }
          ],
      items: [
        `当前 ${options.nodeCount} 节点 / ${options.edgeCount} 边 / ${options.groupCount} 分组。`,
        benchmarkReached ? "已接近 200 节点 / 300 边 / 20 分组基准，请优先使用搜索、小地图和来源泳道整理。" : "距离 200 节点 / 300 边 / 20 分组基准仍有余量。"
      ]
    },
    {
      key: "shortcuts",
      eyebrow: "快捷键说明",
      title: "键盘可达",
      summary: "常用编辑动作必须能通过键盘触达。",
      actions: [
        { label: "保存/撤销", state: "已接入" },
        { label: "分组/连线", state: "已接入" },
        { label: "删除/聚焦", state: "已接入" }
      ],
      items: ["Ctrl / Cmd + S 保存，Ctrl / Cmd + Z 撤销，Shift + Ctrl / Cmd + Z 或 Ctrl / Cmd + Y 重做。", "Delete 删除，F 聚焦，G 分组，L 连线，0 重置视野，? 打开快捷键说明。"]
    }
  ];
}

function buildAutosaveSummary(saveState: GraphWorkspaceSaveState) {
  switch (saveState) {
    case "failed":
      return "保存失败需要用户可解释地恢复。";
    case "pending":
      return "保存请求进行中，保持 pending 可见。";
    case "dirty":
      return "有未保存修改，离页保护保持开启。";
    case "saved":
      return "最近一次保存已确认。";
    default:
      return "自动保存负责兜底，手动保存负责确认。";
  }
}

function buildAutosaveGuidance(saveState: GraphWorkspaceSaveState) {
  switch (saveState) {
    case "failed":
      return "保存失败时优先手动保存或恢复快照，避免继续堆叠不可解释修改。";
    case "pending":
      return "保存 pending 期间保持状态可见，等待成功或失败后再离页。";
    case "dirty":
      return "dirty 状态会触发自动保存，并在离页前提醒用户。";
    case "saved":
      return "saved 状态下可以继续编辑、导入或恢复快照。";
    default:
      return "空闲状态下不会阻塞离页。";
  }
}

function formatSaveState(saveState: GraphWorkspaceSaveState) {
  switch (saveState) {
    case "dirty":
      return "有未保存修改";
    case "pending":
      return "正在保存";
    case "saved":
      return "已保存";
    case "failed":
      return "保存失败";
    default:
      return "空闲";
  }
}
