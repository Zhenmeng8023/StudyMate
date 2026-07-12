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
import { Button, IconButton, PageHeader, Select } from "../../../design-system/primitives";
import type { GraphWorkspaceSaveState } from "../state/types";
import type { GraphNodeCreationType, GraphNodeTypeOption } from "../lib/graphNodeTypes";

export type GraphWorkspaceResourceTab = "graphs" | "sources" | "templates";

export function GraphWorkspaceHeader(props: {
  graphDetail: GraphDetailPayload | null;
  onCreateGraph: () => void;
  onSave: () => void;
  saveState: GraphWorkspaceSaveState;
  saveStateLabel: string;
  saving: boolean;
}) {
  return (
    <PageHeader
      actions={(
        <>
          <Button disabled={props.saving} onClick={props.onCreateGraph} variant="secondary">
            <Plus size={16} />
            鏂板缓鍥捐氨
          </Button>
          <Button disabled={!props.graphDetail || props.saving} onClick={props.onSave} variant="primary">
            <Save size={16} />
            {props.saving ? "淇濆瓨涓?.." : "淇濆瓨"}
          </Button>
          <span className={`graph-save-state ${props.saveState}`} aria-label={`鍥捐氨淇濆瓨鐘舵€侊細${props.saveStateLabel}`}>
            {props.saveStateLabel}
          </span>
        </>
      )}
      description="鎶婅祫鏂欍€佺瑪璁板拰澶嶄範绾跨储鏀捐繘鍚屼竴寮犲彲杩芥函鐨勭煡璇嗙敾甯冦€?"
      eyebrow="鍥捐氨鐢诲竷"
      title="鎶婅祫鏂欍€佺瑪璁板拰澶嶄範绾跨储缁勭粐鍒板悓涓€寮犲涔犲湴鍥鹃噷"
    />
  );

  /*
  return (
    <header className="workspace-header">
      <div>
        <p className="eyebrow">图谱画布</p>
        <h1>把资料、笔记和复习线索组织到同一张学习地图里</h1>
        <p className="header-copy">
          把资料、笔记和复习线索放进同一张可追溯的知识画布。
        </p>
      </div>
      <div className="header-actions">
        <Button disabled={props.saving} onClick={props.onCreateGraph} variant="secondary">
          <Plus size={16} />
          新建图谱
        </Button>
        <Button disabled={!props.graphDetail || props.saving} onClick={props.onSave} variant="primary">
          <Save size={16} />
          {props.saving ? "保存中..." : "保存"}
        </Button>
        <span className={`graph-save-state ${props.saveState}`} aria-label={`图谱保存状态：${props.saveStateLabel}`}>
          {props.saveStateLabel}
        </span>
      </div>
    </header>
  );
  */
}

export function GraphWorkspaceSourceRail(props: {
  activeTab?: GraphWorkspaceResourceTab;
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
  const activeTab = props.activeTab ?? "all";

  return (
    <section className="graph-rail" data-resource-tab={activeTab}>
      {(activeTab === "all" || activeTab === "graphs") ? <div className="graph-rail-section">
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
      </div> : null}

      {(activeTab === "all" || activeTab === "sources") ? <div className="graph-rail-section">
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
      </div> : null}

      {(activeTab === "all" || activeTab === "templates") ? <div className="graph-rail-section">
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
              <small>{formatDiagramTemplateMode(template)}</small>
              <span>{template.description}</span>
              {template.sampleLines.length ? <em>{template.sampleLines.slice(0, 3).join(" → ")}</em> : null}
            </button>
          ))}
        </div>
      </div> : null}
    </section>
  );
}

function formatDiagramTemplateMode(template: DiagramTemplatePayload) {
  const modeLabel = template.mode === "diagram" ? "工程图" : "学习闭环";
  return [modeLabel, template.category].filter(Boolean).join(" / ");
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
        <Select
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
        </Select>
        <IconButton
          aria-label={`新建${props.quickNodeTypeLabel}节点`}
          disabled={!props.graphDetail}
          onClick={props.onCreateNode}
          title={`新建${props.quickNodeTypeLabel}节点`}
        >
          <Plus size={16} />
        </IconButton>
        <IconButton
          disabled={props.selectedNodeCount === 0}
          onClick={props.onCreateGroup}
          title="基于选中节点创建分组"
        >
          <Layers3 size={16} />
        </IconButton>
      </div>

      <div className="graph-toolbar-group">
        <IconButton disabled={props.historyPastCount === 0} onClick={props.onUndo} title="撤销">
          <Undo2 size={16} />
        </IconButton>
        <IconButton disabled={props.historyFutureCount === 0} onClick={props.onRedo} title="重做">
          <Redo2 size={16} />
        </IconButton>
        <IconButton
          active={props.isLinking}
          disabled={props.selectedNodeCount !== 1}
          onClick={props.onToggleLinkMode}
          title="连接选中节点"
        >
          <Link2 size={16} />
        </IconButton>
        <IconButton
          disabled={props.selectedNodeCount === 0 && !props.hasSelectedEdge}
          onClick={props.onDeleteSelection}
          title="删除选中项"
        >
          <Trash2 size={16} />
        </IconButton>
      </div>

      <div className="graph-toolbar-group">
        <IconButton
          active={props.showKeyboardGuide}
          onClick={props.onToggleKeyboardGuide}
          title="快捷键说明"
        >
          <Keyboard size={16} />
        </IconButton>
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
        <IconButton disabled={!props.graphSearch.trim()} onClick={props.onLocateNode} title="搜索定位">
          <ScanSearch size={16} />
        </IconButton>
        <IconButton disabled={!props.graphDetail} onClick={props.onExportPng} title="导出 PNG">
          <Download size={16} />
        </IconButton>
        <IconButton disabled={!props.graphDetail} onClick={props.onExportSvg} title="导出 SVG">
          <FileDown size={16} />
        </IconButton>
        <IconButton disabled={!props.graphDetail} onClick={props.onExportJson} title="导出 StudyMate JSON">
          JSON
        </IconButton>
        <IconButton disabled={!props.graphDetail} onClick={props.onZoomOut} title="缩小">
          <ZoomOut size={16} />
        </IconButton>
        <IconButton disabled={!props.graphDetail} onClick={props.onZoomIn} title="放大">
          <ZoomIn size={16} />
        </IconButton>
      </div>
    </div>
  );
}
