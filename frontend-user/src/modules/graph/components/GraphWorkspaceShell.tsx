import {
  BookOpen,
  Download,
  FileDown,
  Keyboard,
  Layers3,
  Link2,
  NotebookPen,
  Plus,
  Redo2,
  Save,
  ScanSearch,
  Search,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import type {
  DiagramTemplatePayload,
  GraphDetailPayload,
  GraphSummaryPayload,
  MaterialPayload,
  NotePayload
} from "../../../api/client";
import type { GraphWorkspaceSaveState } from "../state/types";
import type { GraphNodeCreationType, GraphNodeTypeOption } from "../lib/graphNodeTypes";

export function GraphWorkspaceHeader(props: {
  graphDetail: GraphDetailPayload | null;
  onCreateGraph: () => void;
  onSave: () => void;
  saveState: GraphWorkspaceSaveState;
  saveStateLabel: string;
  saving: boolean;
}) {
  return (
    <header className="workspace-header">
      <div>
        <p className="eyebrow">图谱画布</p>
        <h1>把资料、笔记和复习线索组织到同一张学习地图里</h1>
        <p className="header-copy">
          当前工作台已经跨到图谱产品化阶段：支持分组、搜索定位、快照恢复、Markdown/Mermaid/JSON 导入、SVG/PNG/JSON 导出和卡片草稿生成。
        </p>
      </div>
      <div className="header-actions">
        <button className="secondary-button" disabled={props.saving} onClick={props.onCreateGraph} type="button">
          <Plus size={16} />
          新建图谱
        </button>
        <button className="primary-button" disabled={!props.graphDetail || props.saving} onClick={props.onSave} type="button">
          <Save size={16} />
          {props.saving ? "保存中..." : "保存"}
        </button>
        <span className={`graph-save-state ${props.saveState}`} aria-label={`图谱保存状态：${props.saveStateLabel}`}>
          {props.saveStateLabel}
        </span>
      </div>
    </header>
  );
}

export function GraphWorkspaceSourceRail(props: {
  diagramTemplates: DiagramTemplatePayload[];
  graphDetail: GraphDetailPayload | null;
  graphs: GraphSummaryPayload[];
  materials: MaterialPayload[];
  notes: NotePayload[];
  onAddMaterialNode: (material: MaterialPayload) => void;
  onAddNoteNode: (note: NotePayload) => void;
  onApplyTemplate: (template: DiagramTemplatePayload) => void;
  onOpenGraph: (graphId: string) => void;
}) {
  return (
    <section className="graph-rail">
      <div className="graph-rail-section">
        <div className="section-frame-head compact">
          <div>
            <p className="eyebrow">图谱列表</p>
            <h2>学习工作区</h2>
          </div>
        </div>
        <div className="graph-list">
          {props.graphs.map((graph) => (
            <button
              className={graph.id === props.graphDetail?.id ? "graph-list-item active" : "graph-list-item"}
              key={graph.id}
              onClick={() => props.onOpenGraph(graph.id)}
              type="button"
            >
              <strong>{graph.title}</strong>
              <span>{graph.nodeCount} 节点 · {graph.edgeCount} 连线</span>
            </button>
          ))}
        </div>
      </div>

      <div className="graph-rail-section">
        <div className="section-frame-head compact">
          <div>
            <p className="eyebrow">来源节点</p>
            <h2>资料与笔记</h2>
          </div>
        </div>
        <div className="graph-source-list">
          {props.materials.map((material) => (
            <button
              className="graph-source-item"
              key={material.id}
              onClick={() => props.onAddMaterialNode(material)}
              type="button"
            >
              <BookOpen size={15} />
              <div>
                <strong>{material.title}</strong>
                <span>{material.category || "资料"}</span>
              </div>
            </button>
          ))}
          {props.notes.map((note) => (
            <button className="graph-source-item" key={note.id} onClick={() => props.onAddNoteNode(note)} type="button">
              <NotebookPen size={15} />
              <div>
                <strong>{note.title}</strong>
                <span>{note.summary || "笔记来源"}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="graph-rail-section">
        <div className="section-frame-head compact">
          <div>
            <p className="eyebrow">学习模板</p>
            <h2>闭环模板</h2>
          </div>
        </div>
        <div className="graph-template-list">
          {props.diagramTemplates.map((template) => (
            <button
              className="graph-template-card"
              key={template.id}
              onClick={() => props.onApplyTemplate(template)}
              type="button"
            >
              <strong>{template.name}</strong>
              <span>{template.description}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GraphWorkspaceToolbar(props: {
  graphDetail: GraphDetailPayload | null;
  graphSearch: string;
  hasSelectedEdge: boolean;
  historyFutureCount: number;
  historyPastCount: number;
  isLinking: boolean;
  nodeTypeOptions: GraphNodeTypeOption[];
  onCreateGroup: () => void;
  onCreateNode: () => void;
  onDeleteSelection: () => void;
  onExportJson: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onLocateNode: () => void;
  onQuickNodeTypeChange: (value: GraphNodeCreationType) => void;
  onRedo: () => void;
  onSearchChange: (value: string) => void;
  onToggleKeyboardGuide: () => void;
  onToggleLinkMode: () => void;
  onUndo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  quickNodeType: GraphNodeCreationType;
  quickNodeTypeLabel: string;
  selectedNodeCount: number;
  showKeyboardGuide: boolean;
}) {
  return (
    <div className="graph-toolbar" aria-label="图谱工具栏">
      <div className="graph-toolbar-group">
        <select
          aria-label="选择新建节点类型"
          className="graph-node-type-select"
          disabled={!props.graphDetail}
          onChange={(event) => props.onQuickNodeTypeChange(event.target.value as GraphNodeCreationType)}
          value={props.quickNodeType}
        >
          {props.nodeTypeOptions.map((option) => (
            <option key={option.type} value={option.type}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          aria-label={`新建${props.quickNodeTypeLabel}节点`}
          className="icon-button"
          disabled={!props.graphDetail}
          onClick={props.onCreateNode}
          title={`新建${props.quickNodeTypeLabel}节点`}
          type="button"
        >
          <Plus size={16} />
        </button>
        <button
          className="icon-button"
          disabled={props.selectedNodeCount === 0}
          onClick={props.onCreateGroup}
          title="基于选中节点创建分组"
          type="button"
        >
          <Layers3 size={16} />
        </button>
      </div>

      <div className="graph-toolbar-group">
        <button className="icon-button" disabled={props.historyPastCount === 0} onClick={props.onUndo} title="撤销" type="button">
          <Undo2 size={16} />
        </button>
        <button className="icon-button" disabled={props.historyFutureCount === 0} onClick={props.onRedo} title="重做" type="button">
          <Redo2 size={16} />
        </button>
        <button
          className={props.isLinking ? "icon-button active" : "icon-button"}
          disabled={props.selectedNodeCount !== 1}
          onClick={props.onToggleLinkMode}
          title="连接选中节点"
          type="button"
        >
          <Link2 size={16} />
        </button>
        <button
          className="icon-button"
          disabled={props.selectedNodeCount === 0 && !props.hasSelectedEdge}
          onClick={props.onDeleteSelection}
          title="删除选中项"
          type="button"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="graph-toolbar-group">
        <button
          className={props.showKeyboardGuide ? "icon-button active" : "icon-button"}
          onClick={props.onToggleKeyboardGuide}
          title="快捷键说明"
          type="button"
        >
          <Keyboard size={16} />
        </button>
        <label className="search-field narrow graph-search-field">
          <Search size={16} />
          <input
            onChange={(event) => props.onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                props.onLocateNode();
              }
            }}
            placeholder="搜索节点"
            value={props.graphSearch}
          />
        </label>
        <button className="icon-button" disabled={!props.graphSearch.trim()} onClick={props.onLocateNode} title="搜索定位" type="button">
          <ScanSearch size={16} />
        </button>
        <button className="icon-button" disabled={!props.graphDetail} onClick={props.onExportPng} title="导出 PNG" type="button">
          <Download size={16} />
        </button>
        <button className="icon-button" disabled={!props.graphDetail} onClick={props.onExportSvg} title="导出 SVG" type="button">
          <FileDown size={16} />
        </button>
        <button className="icon-button" disabled={!props.graphDetail} onClick={props.onExportJson} title="导出 StudyMate JSON" type="button">
          JSON
        </button>
        <button className="icon-button" disabled={!props.graphDetail} onClick={props.onZoomOut} title="缩小" type="button">
          <ZoomOut size={16} />
        </button>
        <button className="icon-button" disabled={!props.graphDetail} onClick={props.onZoomIn} title="放大" type="button">
          <ZoomIn size={16} />
        </button>
      </div>
    </div>
  );
}
