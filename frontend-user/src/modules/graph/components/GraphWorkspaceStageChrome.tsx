import { useMemo } from "react";
import { MousePointer2 } from "lucide-react";
import type { MouseEvent, PointerEvent, ReactNode, RefObject, WheelEvent } from "react";
import type {
  GraphDetailPayload,
  GraphDocumentPayload,
  GraphEdgePayload,
  GraphNodePayload
} from "../../../api/client";
import {
  buildGraphConflictObjectDecisionKey,
  formatGraphConflictObjectDetail,
  getGraphConflictResolutionChoiceLabel,
  type GraphConflictObjectDetail,
  type GraphConflictObjectScope,
  type GraphConflictResolutionChoice,
  type GraphConflictResolutionValidationIssue
} from "../lib/graphConflictSummary";
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
  changeDetails: GraphConflictObjectDetail[];
  changeSummary: string[];
  latestHeadAvailable?: boolean;
  latestHeadDetails: GraphConflictObjectDetail[];
  latestHeadError?: string;
  latestHeadLoading?: boolean;
  latestHeadSummary: string[];
  manualMergeDeferred?: boolean;
  materialsCaptured?: boolean;
  resolutionBlockingIssues?: GraphConflictResolutionValidationIssue[];
  resolutionDraftCount: number;
  resolutionSelections: Record<string, GraphConflictResolutionChoice>;
  onApplyResolutionDrafts: () => void;
  onChooseResolution: (
    scope: GraphConflictObjectScope,
    detail: GraphConflictObjectDetail,
    choice: GraphConflictResolutionChoice
  ) => void;
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
  const applyDisabled =
    !props.latestHeadAvailable ||
    props.resolutionDraftCount === 0 ||
    Boolean(props.resolutionBlockingIssues?.length);
  const unmarkedResolutionItems = buildUnmarkedConflictObjectItems({
    changeDetails: props.changeDetails,
    latestHeadDetails: props.latestHeadDetails,
    resolutionSelections: props.resolutionSelections
  });

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
      <div className="graph-inline-copy" aria-label="对象级冲突明细">
        <strong>建议优先核对的对象</strong>
        <ul className="graph-issue-list">
          {buildConflictObjectItems(
            "当前未保存修改",
            "localDraft",
            props.changeDetails,
            "当前没有可优先核对的节点、连线或分组对象"
          ).map((item) => (
            <li className="graph-issue-item" key={`local-object-${item.label}-${item.value}`}>
              <strong>{item.label}</strong>
              <p>{item.value}</p>
              {hasConflictObjectDetail(item) ? (
                <>
                  <div className="graph-inline-actions">
                    {renderConflictResolutionButtons({
                      detail: item.detail,
                      onChooseResolution: props.onChooseResolution,
                      resolutionSelections: props.resolutionSelections,
                      scope: item.scope
                    })}
                  </div>
                  <small>已标记：{getSelectedResolutionLabel(item.scope, item.detail, props.resolutionSelections)}</small>
                </>
              ) : null}
            </li>
          ))}
        </ul>
        <ul className="graph-issue-list">
          {buildLatestHeadConflictObjectItems(props).map((item) => (
            <li className="graph-issue-item" key={`latest-object-${item.label}-${item.value}`}>
              <strong>{item.label}</strong>
              <p>{item.value}</p>
              {hasConflictObjectDetail(item) ? (
                <>
                  <div className="graph-inline-actions">
                    {renderConflictResolutionButtons({
                      detail: item.detail,
                      onChooseResolution: props.onChooseResolution,
                      resolutionSelections: props.resolutionSelections,
                      scope: item.scope
                    })}
                  </div>
                  <small>已标记：{getSelectedResolutionLabel(item.scope, item.detail, props.resolutionSelections)}</small>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      {props.resolutionBlockingIssues?.length ? (
        <div className="graph-inline-copy" aria-label="取舍依赖校验问题">
          <strong>应用前需要先处理以下跨对象依赖问题</strong>
          <ul className="graph-issue-list">
            {props.resolutionBlockingIssues.map((issue, index) => (
              <li className="graph-issue-item" key={`${issue.ruleType}-${issue.targetId ?? "unknown"}-${index}`}>
                <strong>{issue.targetId ?? "未命名对象"}</strong>
                <p>{issue.message}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {unmarkedResolutionItems.length ? (
        <div className="graph-inline-copy" aria-label="未标记对象提示">
          <strong>还有 {unmarkedResolutionItems.length} 个对象尚未标记取舍</strong>
          <p>如果现在应用已标记取舍，未标记对象会默认沿用最新图谱版本。建议继续逐项确认后再应用。</p>
          <ul className="graph-issue-list">
            {unmarkedResolutionItems.slice(0, 3).map((item) => (
              <li className="graph-issue-item" key={item}>
                <p>{item}</p>
              </li>
            ))}
            {unmarkedResolutionItems.length > 3 ? (
              <li className="graph-issue-item">
                <p>还有 {unmarkedResolutionItems.length - 3} 个未标记对象，建议继续逐项确认。</p>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
      {props.materialsCaptured ? <p>已留存冲突材料，可安全重载最新图谱。</p> : null}
      {props.manualMergeDeferred ? <p>已标记为稍后人工合并，当前继续保留本地草稿。</p> : null}
      <div className="graph-inline-copy">
        <p>如果确认放弃本地修改：可直接重载最新图谱。</p>
        <p>如果打算稍后人工合并：先导出冲突处理包，再重载最新图谱。</p>
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
        <button className="secondary-button" disabled={applyDisabled} onClick={props.onApplyResolutionDrafts} type="button">
          应用已标记取舍到当前草稿
        </button>
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

type ConflictObjectCardItem =
  | { label: string; value: string }
  | { detail: GraphConflictObjectDetail; label: string; scope: GraphConflictObjectScope; value: string };

function buildConflictObjectItems(
  label: string,
  scope: GraphConflictObjectScope,
  details: GraphConflictObjectDetail[],
  fallback: string
): ConflictObjectCardItem[] {
  if (!details.length) {
    return [{ label, value: fallback }];
  }
  return details.map((detail) => ({
    label,
    scope,
    detail,
    value: formatGraphConflictObjectDetail(detail)
  }));
}

function buildLatestHeadConflictObjectItems(props: {
  latestHeadDetails: GraphConflictObjectDetail[];
  latestHeadError?: string;
  latestHeadLoading?: boolean;
}) {
  if (props.latestHeadLoading) {
    return [{ label: "与最新图谱相比", value: "正在准备最新图谱的对象级差异明细" }];
  }
  if (props.latestHeadError) {
    return [{ label: "与最新图谱相比", value: "暂时无法生成最新图谱的对象级差异明细" }];
  }
  return buildConflictObjectItems("与最新图谱相比", "latestHead", props.latestHeadDetails, "当前没有可优先核对的最新版本对象");
}

function hasConflictObjectDetail(item: ConflictObjectCardItem): item is Extract<ConflictObjectCardItem, { detail: GraphConflictObjectDetail }> {
  return "detail" in item && "scope" in item;
}

function buildUnmarkedConflictObjectItems(input: {
  changeDetails: GraphConflictObjectDetail[];
  latestHeadDetails: GraphConflictObjectDetail[];
  resolutionSelections: Record<string, GraphConflictResolutionChoice>;
}) {
  return [
    ...buildUnmarkedConflictObjectItemsForScope("当前未保存修改", "localDraft", input.changeDetails, input.resolutionSelections),
    ...buildUnmarkedConflictObjectItemsForScope("与最新图谱相比", "latestHead", input.latestHeadDetails, input.resolutionSelections)
  ];
}

function buildUnmarkedConflictObjectItemsForScope(
  label: string,
  scope: GraphConflictObjectScope,
  details: GraphConflictObjectDetail[],
  resolutionSelections: Record<string, GraphConflictResolutionChoice>
) {
  return details
    .filter((detail) => resolutionSelections[buildGraphConflictObjectDecisionKey(scope, detail)] === undefined)
    .map((detail) => `${label}：${formatGraphConflictObjectDetail(detail)}`);
}

function renderConflictResolutionButtons(input: {
  detail: GraphConflictObjectDetail;
  onChooseResolution: (
    scope: GraphConflictObjectScope,
    detail: GraphConflictObjectDetail,
    choice: GraphConflictResolutionChoice
  ) => void;
  resolutionSelections: Record<string, GraphConflictResolutionChoice>;
  scope: GraphConflictObjectScope;
}) {
  return conflictResolutionChoices.map((choice) => {
    const selected = input.resolutionSelections[buildGraphConflictObjectDecisionKey(input.scope, input.detail)] === choice;
    return (
      <button
        className={selected ? "secondary-button" : "ghost-button"}
        key={`${input.scope}-${input.detail.id}-${choice}`}
        onClick={() => input.onChooseResolution(input.scope, input.detail, choice)}
        type="button"
      >
        {buildConflictResolutionButtonLabel(choice, input.scope, input.detail)}
      </button>
    );
  });
}

function getSelectedResolutionLabel(
  scope: GraphConflictObjectScope,
  detail: GraphConflictObjectDetail,
  resolutionSelections: Record<string, GraphConflictResolutionChoice>
) {
  const selected = resolutionSelections[buildGraphConflictObjectDecisionKey(scope, detail)];
  return selected ? getGraphConflictResolutionChoiceLabel(selected) : "未标记";
}

function buildConflictResolutionButtonLabel(
  choice: GraphConflictResolutionChoice,
  scope: GraphConflictObjectScope,
  detail: GraphConflictObjectDetail
) {
  return `${getGraphConflictResolutionChoiceLabel(choice)}（${getConflictScopeButtonLabel(scope)}）：${formatGraphConflictObjectDetail(detail)}`;
}

const conflictResolutionChoices: GraphConflictResolutionChoice[] = ["keep-local", "keep-latest", "review-later"];

function getConflictScopeButtonLabel(scope: GraphConflictObjectScope) {
  return scope === "localDraft" ? "当前未保存修改" : "与最新图谱相比";
}
