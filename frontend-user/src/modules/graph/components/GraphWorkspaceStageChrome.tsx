import { useMemo } from "react";
import { MousePointer2 } from "lucide-react";
import type { MouseEvent, PointerEvent, ReactNode, RefObject, WheelEvent } from "react";
import type {
  GraphDetailPayload,
  GraphDocumentPayload,
  GraphEdgePayload,
  GraphNodePayload
} from "../../../api/client";
import { buildNodeStyle } from "../nodeAppearance";
import {
  buildEdgeLabelPosition,
  buildEdgePath,
  buildGroupStyle,
  buildNodeTitle,
  type AlignmentGuide,
  type FocusPreview,
  type SelectionBox
} from "../lib/workspaceControllerHelpers";

export type GraphStageMinimapViewport = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function GraphStageCanvas(props: {
  alignmentGuides: AlignmentGuide[];
  children?: ReactNode;
  document: GraphDocumentPayload | null;
  focusPreview: FocusPreview | null;
  graphDetail: GraphDetailPayload | null;
  hiddenNodeIds: Set<string>;
  linkFromNodeId: string;
  minimapViewport: GraphStageMinimapViewport | null;
  nodeMap: Map<string, GraphNodePayload>;
  onCanvasContextMenu: (event: MouseEvent<HTMLDivElement>) => void;
  onCanvasPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onEdgeContextMenu: (event: MouseEvent<SVGPathElement>, edge: GraphEdgePayload) => void;
  onEdgeSelect: (event: MouseEvent<SVGPathElement>, edge: GraphEdgePayload) => void;
  onNodeClick: (event: MouseEvent<HTMLButtonElement>, node: GraphNodePayload) => void;
  onNodeContextMenu: (event: MouseEvent<HTMLButtonElement>, node: GraphNodePayload) => void;
  onNodePointerDown: (event: PointerEvent<HTMLButtonElement>, node: GraphNodePayload) => void;
  onToggleGroupCollapse: (groupId: string) => void;
  onWheel: (event: WheelEvent<HTMLDivElement>) => void;
  scale: number;
  selectedEdgeId: string;
  selectedNodeIds: string[];
  selectionBox: SelectionBox;
  stageHeight: number;
  stageRef: RefObject<HTMLDivElement | null>;
  stageWidth: number;
  visibleNodes: GraphNodePayload[];
}) {
  const selectedNodeSet = useMemo(() => new Set(props.selectedNodeIds), [props.selectedNodeIds]);

  return (
    <div
      className="graph-stage"
      onContextMenu={props.onCanvasContextMenu}
      onPointerDown={props.onCanvasPointerDown}
      onWheel={props.onWheel}
      ref={props.stageRef}
    >
      {props.graphDetail && props.document ? (
        <>
          <div
            className="graph-world"
            style={{
              width: props.stageWidth,
              height: props.stageHeight,
              transform: `translate(${props.document.viewport.x}px, ${props.document.viewport.y}px) scale(${props.document.viewport.zoom})`
            }}
          >
            {props.document.groups.map((group) => (
              <div
                className={group.collapsed ? "graph-group collapsed" : "graph-group"}
                key={group.id}
                style={buildGroupStyle(group)}
              >
                <div className="graph-group-head">
                  <strong>{group.title}</strong>
                  <button
                    className="ghost-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      props.onToggleGroupCollapse(group.id);
                    }}
                    type="button"
                  >
                    {group.collapsed ? "展开" : "折叠"}
                  </button>
                </div>
              </div>
            ))}

            <svg className="graph-edge-layer" viewBox={`0 0 ${props.stageWidth} ${props.stageHeight}`}>
              {props.document.edges
                .filter((edge) => !props.hiddenNodeIds.has(edge.sourceNodeId) && !props.hiddenNodeIds.has(edge.targetNodeId))
                .map((edge) => {
                  const labelPoint = buildEdgeLabelPosition(edge, props.nodeMap);
                  const isActive = props.selectedEdgeId === edge.id;
                  return (
                    <g key={edge.id}>
                      <path
                        className={isActive ? "graph-edge active" : "graph-edge"}
                        d={buildEdgePath(edge, props.nodeMap)}
                        markerEnd="url(#graph-arrow)"
                        onClick={(event) => props.onEdgeSelect(event, edge)}
                        onContextMenu={(event) => props.onEdgeContextMenu(event, edge)}
                      />
                      {edge.label ? (
                        <text className="graph-edge-label" x={labelPoint.x} y={labelPoint.y}>
                          {edge.label}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
            </svg>

            {props.visibleNodes.map((node) => {
              const selected = selectedNodeSet.has(node.id);
              return (
                <button
                  className={[
                    "graph-node",
                    `type-${node.type}`,
                    selected ? "active" : "",
                    props.linkFromNodeId === node.id ? "linking" : ""
                  ].join(" ").trim()}
                  key={node.id}
                  onClick={(event) => props.onNodeClick(event, node)}
                  onContextMenu={(event) => props.onNodeContextMenu(event, node)}
                  onPointerDown={(event) => props.onNodePointerDown(event, node)}
                  style={{
                    ...buildNodeStyle(node, selected),
                    width: node.width,
                    height: node.height,
                    transform: `translate(${node.x}px, ${node.y}px)`
                  }}
                  type="button"
                >
                  <span className="graph-node-type">{node.type}</span>
                  <strong>{buildNodeTitle(node)}</strong>
                  {node.source?.label ? <small>{node.source.label}</small> : <small>自由节点</small>}
                </button>
              );
            })}

            {props.focusPreview ? (
              <div
                className="graph-focus-preview"
                style={{
                  width: props.focusPreview.width,
                  height: props.focusPreview.height,
                  transform: `translate(${props.focusPreview.x}px, ${props.focusPreview.y}px)`
                }}
              >
                <span>{props.focusPreview.label}</span>
              </div>
            ) : null}
            {props.alignmentGuides.map((guide, index) => (
              <div
                className={guide.orientation === "vertical" ? "graph-alignment-guide vertical" : "graph-alignment-guide horizontal"}
                key={`${guide.orientation}-${guide.position}-${index}`}
                style={
                  guide.orientation === "vertical"
                    ? {
                        left: guide.position,
                        top: guide.start,
                        height: Math.max(0, guide.end - guide.start)
                      }
                    : {
                        top: guide.position,
                        left: guide.start,
                        width: Math.max(0, guide.end - guide.start)
                      }
                }
              />
            ))}
          </div>

          {props.selectionBox ? (
            <div
              className="graph-selection-box"
              style={{
                left: props.selectionBox.left,
                top: props.selectionBox.top,
                width: props.selectionBox.width,
                height: props.selectionBox.height
              }}
            />
          ) : null}

          <svg className="graph-arrow-defs" width="0" height="0" aria-hidden="true">
            <defs>
              <marker id="graph-arrow" markerHeight="8" markerWidth="8" orient="auto-start-reverse" refX="7" refY="4">
                <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
              </marker>
            </defs>
          </svg>

          <GraphStageMinimap
            document={props.document}
            minimapViewport={props.minimapViewport}
            scale={props.scale}
            selectedNodeIds={props.selectedNodeIds}
            stageHeight={props.stageHeight}
            stageWidth={props.stageWidth}
            visibleNodes={props.visibleNodes}
          />
          {props.children}
        </>
      ) : (
        <GraphStageEmptyState />
      )}
    </div>
  );
}

export function GraphStageStatus(props: {
  alignmentHintLabels: string[];
  graphDetail: GraphDetailPayload | null;
  loading: boolean;
  onStatusAction?: () => void;
  selectedNodeCount: number;
  statusActionLabel?: string;
  statusMessage: string;
}) {
  return (
    <div className="graph-stage-status" role="status" aria-live="polite">
      <span>{props.loading ? "正在加载..." : props.statusMessage}</span>
      <div className="graph-stage-status-meta">
        {props.alignmentHintLabels.length ? (
          <div className="graph-alignment-hints" aria-label="对齐参考线">
            {props.alignmentHintLabels.map((label) => (
              <span className="graph-alignment-pill" key={label}>
                {label}
              </span>
            ))}
          </div>
        ) : null}
        {props.graphDetail ? (
          <small>
            版本 {props.graphDetail.currentVersion} · {props.graphDetail.nodeCount} 节点 · {props.graphDetail.edgeCount} 连线
            {props.selectedNodeCount > 1 ? ` · 已选 ${props.selectedNodeCount} 个节点` : ""}
          </small>
        ) : null}
        {props.statusActionLabel && props.onStatusAction ? (
          <button className="ghost-button" onClick={props.onStatusAction} type="button">
            {props.statusActionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function GraphConflictAssistCard(props: {
  changeSummary: string[];
  latestHeadAvailable?: boolean;
  latestHeadError?: string;
  latestHeadLoading?: boolean;
  latestHeadSummary: string[];
  manualMergeDeferred?: boolean;
  materialsCaptured?: boolean;
  onDeferManualMerge: () => void;
  onExportConflictBundle: () => void;
  onReloadLatest: () => void;
  onCopyLatestJson: () => void;
  onCopySummaryReport: () => void;
  onCopyDraftJson: () => void;
  onExportLatestJson: () => void;
  onExportSummaryReport: () => void;
  onExportDraftJson: () => void;
}) {
  return (
    <article className="graph-meta-card warning" aria-label="图谱冲突辅助">
      <strong>先留存当前草稿，再决定是否重载</strong>
      <p>检测到当前画布仍有未保存修改。建议先复制或导出当前草稿 JSON，再使用上方的“重新加载最新图谱”。</p>
      {props.changeSummary.length ? (
        <ul className="graph-issue-list">
          {props.changeSummary.map((item) => (
            <li className="graph-issue-item" key={item}>
              <strong>未保存修改</strong>
              <p>{item}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {props.latestHeadLoading ? (
        <p>正在比对服务端最新图谱差异...</p>
      ) : props.latestHeadError ? (
        <p>{props.latestHeadError}</p>
      ) : props.latestHeadSummary.length ? (
        <ul className="graph-issue-list">
          {props.latestHeadSummary.map((item) => (
            <li className="graph-issue-item" key={`latest-${item}`}>
              <strong>与最新图谱相比</strong>
              <p>{item}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {props.materialsCaptured ? <p>已留存冲突材料，可安全重载最新图谱</p> : null}
      {props.manualMergeDeferred ? <p>已标记为稍后人工合并，当前继续保留本地草稿</p> : null}
      <div className="graph-inline-copy">
        <p>如果确认放弃本地修改：可直接重载最新图谱</p>
        <p>如果打算稍后人工合并：先导出冲突处理包，再重载最新图谱</p>
      </div>
      <div className="graph-inline-actions">
        <button className="secondary-button" onClick={props.onCopySummaryReport} type="button">
          复制冲突摘要
        </button>
        <button className="ghost-button" onClick={props.onExportSummaryReport} type="button">
          导出冲突摘要
        </button>
        {props.latestHeadAvailable ? (
          <button className="secondary-button" onClick={props.onCopyLatestJson} type="button">
            复制最新图谱 JSON
          </button>
        ) : null}
        {props.latestHeadAvailable ? (
          <button className="ghost-button" onClick={props.onExportLatestJson} type="button">
            导出最新图谱 JSON
          </button>
        ) : null}
        {props.latestHeadAvailable ? (
          <button className="secondary-button" onClick={props.onExportConflictBundle} type="button">
            导出冲突处理包
          </button>
        ) : null}
        <button className="ghost-button" onClick={props.onDeferManualMerge} type="button">
          先保留本地，稍后人工合并
        </button>
        <button className="secondary-button" onClick={props.onCopyDraftJson} type="button">
          复制当前草稿 JSON
        </button>
        <button className="ghost-button" onClick={props.onExportDraftJson} type="button">
          导出当前草稿 JSON
        </button>
        <button className="primary-button" onClick={props.onReloadLatest} type="button">
          放弃本地并重载最新图谱
        </button>
      </div>
    </article>
  );
}

export function GraphStageMinimap(props: {
  document: GraphDocumentPayload;
  minimapViewport: GraphStageMinimapViewport | null;
  scale: number;
  selectedNodeIds: string[];
  stageHeight: number;
  stageWidth: number;
  visibleNodes: GraphNodePayload[];
}) {
  const selectedNodeSet = useMemo(() => new Set(props.selectedNodeIds), [props.selectedNodeIds]);

  return (
    <aside className="graph-minimap" aria-label="图谱小地图">
      <div
        className="graph-minimap-world"
        style={{ width: props.stageWidth * props.scale, height: props.stageHeight * props.scale }}
      >
        {props.document.groups.map((group) => (
          <div
            className={group.collapsed ? "graph-minimap-group collapsed" : "graph-minimap-group"}
            key={group.id}
            style={{
              left: group.x * props.scale,
              top: group.y * props.scale,
              width: group.width * props.scale,
              height: group.height * props.scale
            }}
          />
        ))}
        {props.visibleNodes.map((node) => (
          <span
            className={selectedNodeSet.has(node.id) ? "graph-minimap-node active" : "graph-minimap-node"}
            key={node.id}
            style={{
              left: node.x * props.scale,
              top: node.y * props.scale,
              width: Math.max(6, node.width * props.scale),
              height: Math.max(6, node.height * props.scale)
            }}
          />
        ))}
        {props.minimapViewport ? (
          <div
            className="graph-minimap-viewport"
            style={{
              left: props.minimapViewport.left,
              top: props.minimapViewport.top,
              width: props.minimapViewport.width,
              height: props.minimapViewport.height
            }}
          />
        ) : null}
      </div>
    </aside>
  );
}

export function GraphStageEmptyState() {
  return (
    <div className="graph-stage-empty">
      <MousePointer2 size={18} />
      <span>正在准备图谱画布...</span>
    </div>
  );
}
