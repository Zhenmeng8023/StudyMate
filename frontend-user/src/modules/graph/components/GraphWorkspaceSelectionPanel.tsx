import { Layers3, Link2, Trash2 } from "lucide-react";
import type {
  GraphEdgePayload,
  GraphGroupPayload,
  GraphNodeEmphasis,
  GraphNodePayload,
  GraphNodeTone
} from "../../../api/client";
import {
  getNodeDetail,
  getNodeEmphasis,
  getNodeTone,
  getNodeToneTokens,
  graphNodeEmphasisOptions,
  graphNodeSizePresetOptions,
  graphNodeToneOptions,
  resolveNodeSizePreset,
  type GraphNodeSizePreset
} from "../nodeAppearance";
import {
  getGraphNodeMetadataEditorFields,
  getGraphNodeMetadataField,
  type GraphNodeMetadataField
} from "../lib/graphNodeMetadata";
import type { GraphSourceBacklink } from "../lib/graphSourceBacklinks";
import { buildNodeTitle, getNodeSourceLabel, type SourceOrganizerMode } from "../lib/workspaceControllerHelpers";

export function GraphWorkspaceSelectionPanel(props: {
  batchEmphasis: GraphNodeEmphasis;
  batchSizePreset: GraphNodeSizePreset;
  batchTone: GraphNodeTone;
  groups: GraphGroupPayload[];
  onAlignSelectedNodes: (direction: "left" | "top" | "center" | "middle") => void;
  onApplyBatchEmphasis: (emphasis: GraphNodeEmphasis) => void;
  onApplyBatchSizePreset: (preset: GraphNodeSizePreset) => void;
  onApplyBatchTone: (tone: GraphNodeTone) => void;
  onClearNodeSelection: () => void;
  onCreateGroupFromSelectedNode: () => void;
  onCreateSourceGroupsFromSelection: () => void;
  onCreateSourceSwimlanesFromSelection: () => void;
  onDeleteSelectedNodes: (nodeIds: string[]) => void;
  onDistributeSelectedNodes: (axis: "horizontal" | "vertical") => void;
  onEdgeKindChange: (kind: string) => void;
  onEdgeLabelChange: (label: string) => void;
  onGroupTitleChange: (groupId: string, title: string) => void;
  onNodeDetailChange: (detail: string) => void;
  onNodeEmphasisChange: (emphasis: GraphNodeEmphasis) => void;
  onNodeMetadataFieldChange: (field: GraphNodeMetadataField, value: string) => void;
  onNodeSizePresetChange: (preset: GraphNodeSizePreset) => void;
  onNodeTitleChange: (title: string) => void;
  onNodeToneChange: (tone: GraphNodeTone) => void;
  onOpenSource: (target: string) => void;
  onOrganizeSelectedNodesBySource: (mode: SourceOrganizerMode) => void;
  onToggleGroupCollapse: (groupId: string) => void;
  selectedEdge: GraphEdgePayload | null;
  selectedNode: GraphNodePayload | null;
  selectedNodeIds: string[];
  selectedNodeSourceBacklink: GraphSourceBacklink | null;
  selectedNodes: GraphNodePayload[];
  selectedSourceSummary: Array<{ label: string; count: number }>;
}) {
  const {
    groups,
    selectedEdge,
    selectedNode,
    selectedNodeIds,
    selectedNodeSourceBacklink,
    selectedNodes,
    selectedSourceSummary
  } = props;

  return (
    <div className="graph-rail-section">
      <div className="section-frame-head compact">
        <div>
          <p className="eyebrow">选中内容</p>
          <h2>节点与连线</h2>
        </div>
      </div>

      {selectedNodes.length > 1 ? (
        <GraphMultiSelectionPanel
          batchEmphasis={props.batchEmphasis}
          batchSizePreset={props.batchSizePreset}
          batchTone={props.batchTone}
          onAlignSelectedNodes={props.onAlignSelectedNodes}
          onApplyBatchEmphasis={props.onApplyBatchEmphasis}
          onApplyBatchSizePreset={props.onApplyBatchSizePreset}
          onApplyBatchTone={props.onApplyBatchTone}
          onClearNodeSelection={props.onClearNodeSelection}
          onCreateGroupFromSelectedNode={props.onCreateGroupFromSelectedNode}
          onCreateSourceGroupsFromSelection={props.onCreateSourceGroupsFromSelection}
          onCreateSourceSwimlanesFromSelection={props.onCreateSourceSwimlanesFromSelection}
          onDeleteSelectedNodes={() => props.onDeleteSelectedNodes(selectedNodeIds)}
          onDistributeSelectedNodes={props.onDistributeSelectedNodes}
          onOrganizeSelectedNodesBySource={props.onOrganizeSelectedNodesBySource}
          selectedNodes={selectedNodes}
          selectedSourceSummary={selectedSourceSummary}
        />
      ) : selectedNode ? (
        <GraphSingleNodePanel
          onNodeDetailChange={props.onNodeDetailChange}
          onNodeEmphasisChange={props.onNodeEmphasisChange}
          onNodeMetadataFieldChange={props.onNodeMetadataFieldChange}
          onNodeSizePresetChange={props.onNodeSizePresetChange}
          onNodeTitleChange={props.onNodeTitleChange}
          onNodeToneChange={props.onNodeToneChange}
          onOpenSource={props.onOpenSource}
          selectedNode={selectedNode}
          selectedNodeSourceBacklink={selectedNodeSourceBacklink}
        />
      ) : null}

      {selectedEdge ? (
        <GraphSelectedEdgePanel
          onEdgeKindChange={props.onEdgeKindChange}
          onEdgeLabelChange={props.onEdgeLabelChange}
          selectedEdge={selectedEdge}
        />
      ) : null}

      {groups.length ? (
        <GraphGroupList
          groups={groups}
          onGroupTitleChange={props.onGroupTitleChange}
          onToggleGroupCollapse={props.onToggleGroupCollapse}
        />
      ) : null}

      {selectedNodes.length === 0 && !selectedEdge ? (
        <article className="graph-meta-card muted">
          <strong>操作提示</strong>
          <p>点击节点可编辑标题、笔记和样式，点击连线可改关系标签。按住 Shift 在空白处拖动可框选多个节点，滚轮可以缩放。</p>
        </article>
      ) : null}
    </div>
  );
}

function GraphMultiSelectionPanel(props: {
  batchEmphasis: GraphNodeEmphasis;
  batchSizePreset: GraphNodeSizePreset;
  batchTone: GraphNodeTone;
  onAlignSelectedNodes: (direction: "left" | "top" | "center" | "middle") => void;
  onApplyBatchEmphasis: (emphasis: GraphNodeEmphasis) => void;
  onApplyBatchSizePreset: (preset: GraphNodeSizePreset) => void;
  onApplyBatchTone: (tone: GraphNodeTone) => void;
  onClearNodeSelection: () => void;
  onCreateGroupFromSelectedNode: () => void;
  onCreateSourceGroupsFromSelection: () => void;
  onCreateSourceSwimlanesFromSelection: () => void;
  onDeleteSelectedNodes: () => void;
  onDistributeSelectedNodes: (axis: "horizontal" | "vertical") => void;
  onOrganizeSelectedNodesBySource: (mode: SourceOrganizerMode) => void;
  selectedNodes: GraphNodePayload[];
  selectedSourceSummary: Array<{ label: string; count: number }>;
}) {
  const { selectedNodes } = props;

  return (
    <div className="graph-form-stack">
      <article className="graph-meta-card">
        <strong>已选中 {selectedNodes.length} 个节点</strong>
        <p>可以直接批量拖动、按 Delete 删除，或用上方工具栏把它们整理进同一个分组。</p>
      </article>
      <div className="graph-inline-actions">
        <button className="secondary-button" onClick={props.onCreateGroupFromSelectedNode} type="button">
          <Layers3 size={16} />
          为选中节点建组
        </button>
        <button className="secondary-button" onClick={() => props.onAlignSelectedNodes("left")} type="button">
          左对齐
        </button>
        <button className="secondary-button" onClick={() => props.onAlignSelectedNodes("top")} type="button">
          顶部对齐
        </button>
        <button className="secondary-button" onClick={() => props.onAlignSelectedNodes("center")} type="button">
          水平居中
        </button>
        <button className="secondary-button" onClick={() => props.onAlignSelectedNodes("middle")} type="button">
          垂直居中
        </button>
        <button
          className="secondary-button"
          disabled={selectedNodes.length < 3}
          onClick={() => props.onDistributeSelectedNodes("horizontal")}
          type="button"
        >
          横向均分
        </button>
        <button
          className="secondary-button"
          disabled={selectedNodes.length < 3}
          onClick={() => props.onDistributeSelectedNodes("vertical")}
          type="button"
        >
          纵向均分
        </button>
        <button className="secondary-button" onClick={props.onDeleteSelectedNodes} type="button">
          <Trash2 size={16} />
          删除选中节点
        </button>
        <button className="ghost-button" onClick={props.onClearNodeSelection} type="button">
          清空选择
        </button>
      </div>
      <GraphBatchAppearanceControls
        batchEmphasis={props.batchEmphasis}
        batchSizePreset={props.batchSizePreset}
        batchTone={props.batchTone}
        onApplyBatchEmphasis={props.onApplyBatchEmphasis}
        onApplyBatchSizePreset={props.onApplyBatchSizePreset}
        onApplyBatchTone={props.onApplyBatchTone}
        sampleNode={selectedNodes[0]}
      />
      <div className="graph-meta-grid">
        <article className="graph-meta-card">
          <strong>按来源整理</strong>
          <div className="graph-source-summary-list">
            {props.selectedSourceSummary.map((item) => (
              <span className="graph-source-summary-pill" key={item.label}>
                {item.label} · {item.count}
              </span>
            ))}
          </div>
          <div className="graph-inline-actions">
            <button className="secondary-button" onClick={() => props.onOrganizeSelectedNodesBySource("type-columns")} type="button">
              按来源分列
            </button>
            <button className="secondary-button" onClick={() => props.onOrganizeSelectedNodesBySource("type-rows")} type="button">
              按来源分行
            </button>
            <button className="secondary-button" onClick={props.onCreateSourceSwimlanesFromSelection} type="button">
              生成来源泳道
            </button>
            <button className="ghost-button" onClick={props.onCreateSourceGroupsFromSelection} type="button">
              生成来源分组
            </button>
          </div>
        </article>
        <article className="graph-meta-card muted">
          <strong>覆盖范围</strong>
          <p>
            {selectedNodes.map((node) => buildNodeTitle(node)).slice(0, 3).join("、")}
            {selectedNodes.length > 3 ? " ..." : ""}
          </p>
        </article>
        <article className="graph-meta-card muted">
          <strong>批量提示</strong>
          <p>按住 Shift 在空白处拖动可框选，按住 Shift 或 Ctrl 点击节点可增减选择。</p>
        </article>
      </div>
    </div>
  );
}

function GraphBatchAppearanceControls(props: {
  batchEmphasis: GraphNodeEmphasis;
  batchSizePreset: GraphNodeSizePreset;
  batchTone: GraphNodeTone;
  onApplyBatchEmphasis: (emphasis: GraphNodeEmphasis) => void;
  onApplyBatchSizePreset: (preset: GraphNodeSizePreset) => void;
  onApplyBatchTone: (tone: GraphNodeTone) => void;
  sampleNode: GraphNodePayload;
}) {
  return (
    <div className="graph-form-stack tight">
      <div>
        <span className="graph-field-label">批量颜色</span>
        <div className="graph-style-swatches">
          {graphNodeToneOptions.map((option) => (
            <button
              aria-label={`批量切换为${option.label}`}
              className={props.batchTone === option.value ? "graph-style-swatch active" : "graph-style-swatch"}
              key={option.value}
              onClick={() => props.onApplyBatchTone(option.value)}
              style={{
                background: getNodeToneTokens({
                  ...props.sampleNode,
                  metadata: {
                    ...(props.sampleNode.metadata ?? {}),
                    appearance: { ...(props.sampleNode.metadata?.appearance ?? {}), tone: option.value }
                  }
                }).exportFill
              }}
              title={option.label}
              type="button"
            />
          ))}
        </div>
      </div>
      <SegmentedOptionGroup
        label="批量强调"
        options={graphNodeEmphasisOptions}
        value={props.batchEmphasis}
        onChange={props.onApplyBatchEmphasis}
      />
      <SegmentedOptionGroup
        label="批量尺寸"
        options={graphNodeSizePresetOptions}
        value={props.batchSizePreset}
        onChange={props.onApplyBatchSizePreset}
      />
    </div>
  );
}

function GraphSingleNodePanel(props: {
  onNodeDetailChange: (detail: string) => void;
  onNodeEmphasisChange: (emphasis: GraphNodeEmphasis) => void;
  onNodeMetadataFieldChange: (field: GraphNodeMetadataField, value: string) => void;
  onNodeSizePresetChange: (preset: GraphNodeSizePreset) => void;
  onNodeTitleChange: (title: string) => void;
  onNodeToneChange: (tone: GraphNodeTone) => void;
  onOpenSource: (target: string) => void;
  selectedNode: GraphNodePayload;
  selectedNodeSourceBacklink: GraphSourceBacklink | null;
}) {
  const { selectedNode } = props;

  return (
    <div className="graph-form-stack">
      <label>
        <span>节点标题</span>
        <input aria-label="节点标题" onChange={(event) => props.onNodeTitleChange(event.target.value)} value={selectedNode.title} />
      </label>
      <label>
        <span>节点笔记</span>
        <textarea onChange={(event) => props.onNodeDetailChange(event.target.value)} rows={4} value={getNodeDetail(selectedNode)} />
      </label>
      {getGraphNodeMetadataEditorFields(selectedNode).map((field) => (
        <label key={field.field}>
          <span>{field.label}</span>
          <input
            aria-label={`${selectedNode.title} ${field.label}`}
            onChange={(event) => props.onNodeMetadataFieldChange(field.field, event.target.value)}
            placeholder={field.placeholder}
            value={getGraphNodeMetadataField(selectedNode, field.field)}
          />
        </label>
      ))}
      <div className="graph-form-stack tight">
        <GraphToneSwatches selectedNode={selectedNode} onNodeToneChange={props.onNodeToneChange} />
        <SegmentedOptionGroup
          label="强调"
          options={graphNodeEmphasisOptions}
          value={getNodeEmphasis(selectedNode)}
          onChange={props.onNodeEmphasisChange}
        />
        <SegmentedOptionGroup
          label="尺寸"
          options={graphNodeSizePresetOptions}
          value={resolveNodeSizePreset(selectedNode)}
          onChange={props.onNodeSizePresetChange}
        />
      </div>
      <div className="graph-meta-card">
        <strong>来源</strong>
        <p>{selectedNode.source?.label || "当前节点是自由创建的概念节点"}</p>
        {props.selectedNodeSourceBacklink ? (
          <>
            <div className="graph-source-summary-list">
              <span className="graph-source-summary-pill">
                {props.selectedNodeSourceBacklink.sourceTypeLabel} / {props.selectedNodeSourceBacklink.sourceId}
              </span>
              <span className="graph-source-summary-pill">{props.selectedNodeSourceBacklink.learningStepLabel}</span>
            </div>
            <article className="graph-meta-card muted">
              <strong>学习闭环</strong>
              <p>{props.selectedNodeSourceBacklink.description}</p>
            </article>
            <div className="graph-inline-actions">
              <button className="ghost-button" onClick={() => props.onOpenSource(props.selectedNodeSourceBacklink!.target)} type="button">
                <Link2 size={14} />
                {props.selectedNodeSourceBacklink.actionLabel}
              </button>
            </div>
          </>
        ) : null}
      </div>
      <GraphNodeMetadataSummary selectedNode={selectedNode} />
    </div>
  );
}

function GraphToneSwatches(props: {
  onNodeToneChange: (tone: GraphNodeTone) => void;
  selectedNode: GraphNodePayload;
}) {
  return (
    <div>
      <span className="graph-field-label">颜色</span>
      <div className="graph-style-swatches">
        {graphNodeToneOptions.map((option) => (
          <button
            aria-label={`切换为${option.label}色`}
            className={getNodeTone(props.selectedNode) === option.value ? "graph-style-swatch active" : "graph-style-swatch"}
            key={option.value}
            onClick={() => props.onNodeToneChange(option.value)}
            style={{
              background: getNodeToneTokens({
                ...props.selectedNode,
                metadata: {
                  ...(props.selectedNode.metadata ?? {}),
                  appearance: { ...(props.selectedNode.metadata?.appearance ?? {}), tone: option.value }
                }
              }).exportFill
            }}
            title={option.label}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

function GraphNodeMetadataSummary(props: { selectedNode: GraphNodePayload }) {
  const { selectedNode } = props;
  return (
    <>
      <div className="graph-meta-grid">
        <article className="graph-meta-card muted">
          <strong>节点规格</strong>
          <p>
            {Math.round(selectedNode.width)} × {Math.round(selectedNode.height)} px
          </p>
        </article>
        {selectedNode.source?.type || selectedNode.source?.id ? (
          <article className="graph-meta-card muted">
            <strong>来源标识</strong>
            <p>{[getNodeSourceLabel(selectedNode.source?.type), selectedNode.source?.id].filter(Boolean).join(" / ")}</p>
          </article>
        ) : null}
      </div>
      {selectedNode.source?.excerpt ? (
        <article className="graph-meta-card">
          <strong>来源摘录</strong>
          <p>{selectedNode.source.excerpt}</p>
        </article>
      ) : selectedNode.source ? (
        <article className="graph-meta-card muted">
          <strong>来源上下文</strong>
          <p>这个节点带有来源引用，但当前没有保存摘录内容。你可以回到原始页面继续查看上下文。</p>
        </article>
      ) : null}
    </>
  );
}

function GraphSelectedEdgePanel(props: {
  onEdgeKindChange: (kind: string) => void;
  onEdgeLabelChange: (label: string) => void;
  selectedEdge: GraphEdgePayload;
}) {
  return (
    <div className="graph-form-stack">
      <label>
        <span>关系标签</span>
        <input
          aria-label="关系标签"
          onChange={(event) => props.onEdgeLabelChange(event.target.value)}
          value={props.selectedEdge.label || ""}
        />
      </label>
      <label>
        <span>线条形态</span>
        <select
          aria-label="线条形态"
          onChange={(event) => props.onEdgeKindChange(event.target.value)}
          value={props.selectedEdge.kind || "straight"}
        >
          <option value="straight">直线</option>
          <option value="curve">曲线</option>
        </select>
      </label>
    </div>
  );
}

function GraphGroupList(props: {
  groups: GraphGroupPayload[];
  onGroupTitleChange: (groupId: string, title: string) => void;
  onToggleGroupCollapse: (groupId: string) => void;
}) {
  return (
    <div className="graph-group-list">
      {props.groups.map((group) => (
        <article className="graph-group-item" key={group.id}>
          <input
            className="graph-group-title-input"
            onChange={(event) => props.onGroupTitleChange(group.id, event.target.value)}
            value={group.title}
          />
          <span>{group.nodeIds.length} 个节点</span>
          <button className="ghost-button" onClick={() => props.onToggleGroupCollapse(group.id)} type="button">
            {group.collapsed ? "展开" : "折叠"}
          </button>
        </article>
      ))}
    </div>
  );
}

function SegmentedOptionGroup<T extends string>(props: {
  label: string;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  value: T;
}) {
  return (
    <div>
      <span className="graph-field-label">{props.label}</span>
      <div className="graph-segmented compact">
        {props.options.map((option) => (
          <button
            className={props.value === option.value ? "ghost-button active" : "ghost-button"}
            key={option.value}
            onClick={() => props.onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
