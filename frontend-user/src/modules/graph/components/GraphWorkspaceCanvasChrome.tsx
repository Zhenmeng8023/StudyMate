import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileInput,
  FolderKanban,
  History,
  Layers3,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Settings2,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import type { GraphDetailPayload } from "../../../api/client";
import { IconButton } from "../../../design-system/primitives";
import type { GraphWorkspaceSaveState } from "../state/types";
import type { GraphWorkspaceResourceTab } from "./GraphWorkspaceShell";

export type GraphInspectorTab = "overview" | "selection" | "sources" | "history" | "import" | "conflict";

export function GraphWorkspaceCanvasCommandBar(props: {
  graphDetail: GraphDetailPayload | null;
  inspectorOpen: boolean;
  onCreateGraph: () => void;
  onToggleInspector: () => void;
  onToggleResources: () => void;
  resourcesOpen: boolean;
  saveState: GraphWorkspaceSaveState;
  saveStateLabel: string;
  saving: boolean;
  onSave: () => void;
}) {
  const graphTitle = props.graphDetail?.title || "图谱工作区";
  const saveLabel = props.saving ? "保存中..." : props.saveState === "dirty" ? "保存修改" : props.saveState === "failed" ? "重新保存" : "保存";

  return (
    <header className="graph-canvas-commandbar" aria-label="图谱命令栏">
      <div className="graph-canvas-commandbar__leading">
        <IconButton
          aria-expanded={props.resourcesOpen}
          aria-label={props.resourcesOpen ? "关闭资源面板" : "打开资源面板"}
          onClick={props.onToggleResources}
          title={props.resourcesOpen ? "关闭资源面板" : "打开资源面板"}
        >
          {props.resourcesOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
        </IconButton>
        <div className="graph-canvas-commandbar__title">
          <span>知识图谱</span>
          <strong title={graphTitle}>{graphTitle}</strong>
        </div>
        <span className={`graph-save-state ${props.saveState}`} aria-label={`图谱保存状态：${props.saveStateLabel}`}>
          {props.saveStateLabel}
        </span>
      </div>

      <div className="graph-canvas-commandbar__actions">
        <button className="secondary-button graph-command-new" disabled={props.saving} onClick={props.onCreateGraph} type="button">
          <Layers3 size={16} />
          <span>新建图谱</span>
        </button>
        <button
          className={props.saveState === "dirty" ? "primary-button" : "secondary-button"}
          disabled={!props.graphDetail || props.saving || props.saveState === "saved"}
          onClick={props.onSave}
          type="button"
        >
          {saveLabel}
        </button>
        <IconButton
          aria-expanded={props.inspectorOpen}
          aria-label={props.inspectorOpen ? "关闭检查器" : "打开检查器"}
          onClick={props.onToggleInspector}
          title={props.inspectorOpen ? "关闭检查器" : "打开检查器"}
        >
          {props.inspectorOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
        </IconButton>
      </div>
    </header>
  );
}

export function GraphWorkspaceResourceTabs(props: {
  activeTab: GraphWorkspaceResourceTab;
  onChange: (tab: GraphWorkspaceResourceTab) => void;
}) {
  const tabs: Array<{ icon: typeof Layers3; id: GraphWorkspaceResourceTab; label: string }> = [
    { id: "graphs", label: "图谱", icon: Layers3 },
    { id: "sources", label: "来源", icon: BookOpen },
    { id: "templates", label: "模板", icon: FolderKanban }
  ];

  return (
    <nav className="graph-dock-tabs" aria-label="图谱资源分类">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            aria-current={props.activeTab === tab.id ? "page" : undefined}
            className={props.activeTab === tab.id ? "graph-dock-tab active" : "graph-dock-tab"}
            key={tab.id}
            onClick={() => props.onChange(tab.id)}
            type="button"
          >
            <Icon size={15} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

export function GraphWorkspaceInspectorTabs(props: {
  activeTab: GraphInspectorTab;
  hasConflict: boolean;
  hasSelection: boolean;
  onChange: (tab: GraphInspectorTab) => void;
}) {
  const tabs: Array<{ icon: typeof Settings2; id: GraphInspectorTab; label: string; visible?: boolean }> = [
    { id: "overview", label: "概览", icon: Settings2 },
    { id: "selection", label: "属性", icon: Layers3 },
    { id: "sources", label: "来源", icon: BookOpen },
    { id: "history", label: "历史", icon: History },
    { id: "import", label: "导入", icon: FileInput },
    { id: "conflict", label: "冲突", icon: ShieldAlert, visible: props.hasConflict }
  ];

  return (
    <nav className="graph-inspector-tabs" aria-label="图谱检查器分类">
      {tabs.filter((tab) => tab.visible !== false).map((tab) => {
        const Icon = tab.icon;
        const selected = props.activeTab === tab.id;
        return (
          <button
            aria-current={selected ? "page" : undefined}
            className={["graph-inspector-tab", selected ? "active" : "", tab.id === "conflict" ? "warning" : ""].filter(Boolean).join(" ")}
            key={tab.id}
            onClick={() => props.onChange(tab.id)}
            type="button"
          >
            <Icon size={15} />
            <span>{tab.label}</span>
            {tab.id === "selection" && props.hasSelection ? <em>•</em> : null}
            {tab.id === "conflict" ? <em>!</em> : null}
          </button>
        );
      })}
    </nav>
  );
}

export function GraphWorkspaceDrawerHeading(props: {
  description: string;
  onClose: () => void;
  title: string;
}) {
  return (
    <header className="graph-drawer-heading">
      <div>
        <p className="eyebrow">图谱工作区</p>
        <h2>{props.title}</h2>
        <span>{props.description}</span>
      </div>
      <IconButton aria-label={`关闭${props.title}`} onClick={props.onClose}>
        <ChevronLeft size={16} />
      </IconButton>
    </header>
  );
}

export function GraphWorkspaceInspectorHeading(props: {
  hasConflict: boolean;
  onClose: () => void;
  title: string;
}) {
  return (
    <header className="graph-inspector-heading">
      <div>
        <p className="eyebrow">检查器</p>
        <h2>{props.title}</h2>
        {props.hasConflict ? <span className="graph-inspector-conflict-hint"><Sparkles size={14} /> 检测到版本冲突</span> : null}
      </div>
      <IconButton aria-label="关闭检查器" onClick={props.onClose}>
        <ChevronRight size={16} />
      </IconButton>
    </header>
  );
}
