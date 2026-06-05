import type { GraphWorkspaceSaveState } from "../state/types";

export type GraphSettingsSectionKey = "display" | "import-export" | "autosave" | "performance" | "shortcuts";

export type GraphSettingsSection = {
  key: GraphSettingsSectionKey;
  title: string;
  eyebrow: string;
  tone?: "default" | "warning";
  items: string[];
};

export type GraphSettingsSectionOptions = {
  autosaveDelayMs: number;
  edgeCount: number;
  groupCount: number;
  nodeCount: number;
  saveState: GraphWorkspaceSaveState;
};

export function buildGraphSettingsSections(options: GraphSettingsSectionOptions): GraphSettingsSection[] {
  const autosaveSeconds = Math.max(1, Math.round(options.autosaveDelayMs / 1000));
  const benchmarkReached = options.nodeCount >= 200 || options.edgeCount >= 300 || options.groupCount >= 20;

  return [
    {
      key: "display",
      eyebrow: "显示偏好",
      title: "画布阅读性",
      items: ["保留节点颜色、强调、尺寸预设和分组折叠状态。", "小地图、搜索定位和聚焦选中节点用于大图谱导航。"]
    },
    {
      key: "import-export",
      eyebrow: "导入导出",
      title: "文件能力",
      items: ["支持 Markdown / Mermaid 导入和 PNG / SVG 导出。", "StudyMate 图谱 JSON 使用 .smtg 与 application/vnd.studymate.graph+json。"]
    },
    {
      key: "autosave",
      eyebrow: "自动保存",
      title: "保存状态",
      items: [`自动保存间隔约 ${autosaveSeconds} 秒。`, `当前保存状态：${formatSaveState(options.saveState)}。`, "离页前会拦截 dirty / pending 状态。"]
    },
    {
      key: "performance",
      eyebrow: "性能提示",
      title: benchmarkReached ? "已达到基准规模" : "当前规模健康",
      tone: benchmarkReached ? "warning" : "default",
      items: [
        `当前 ${options.nodeCount} 节点 / ${options.edgeCount} 边 / ${options.groupCount} 分组。`,
        benchmarkReached ? "已接近 200 节点 / 300 边 / 20 分组基准，请优先使用搜索、小地图和来源泳道整理。" : "距离 200 节点 / 300 边 / 20 分组基准仍有余量。"
      ]
    },
    {
      key: "shortcuts",
      eyebrow: "快捷键说明",
      title: "键盘可达",
      items: ["Ctrl / Cmd + S 保存，Ctrl / Cmd + Z 撤销，Shift + Ctrl / Cmd + Z 或 Ctrl / Cmd + Y 重做。", "Delete 删除，F 聚焦，G 分组，L 连线，0 重置视野，? 打开快捷键说明。"]
    }
  ];
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
