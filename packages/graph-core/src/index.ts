export type GraphNodeType = string;

export type GraphNodeTone = "neutral" | "sage" | "sky" | "amber" | "rose";

export type GraphNodeEmphasis = "default" | "strong" | "muted";

export interface GraphNodeAppearance {
  tone?: GraphNodeTone;
  emphasis?: GraphNodeEmphasis;
}

export interface GraphNodeMetadata {
  detail?: string;
  appearance?: GraphNodeAppearance | null;
  [key: string]: unknown;
}

export interface GraphNodeSource {
  type?: string;
  id?: string;
  label?: string;
  excerpt?: string;
}

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  source?: GraphNodeSource | null;
  metadata?: GraphNodeMetadata;
}

export interface GraphEdge {
  id: string;
  kind?: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphDocument {
  id: string;
  version: number;
  schemaVersion?: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  groups: GraphGroup[];
  viewport: GraphViewport;
  theme?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface GraphViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface GraphRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GraphStageSize {
  width: number;
  height: number;
}

export interface GraphGroup {
  id: string;
  title: string;
  nodeIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
  metadata?: Record<string, unknown>;
}

export interface SourceSwimlaneLayoutOptions {
  anchorX?: number;
  anchorY?: number;
  stageWidth?: number;
  stageHeight?: number;
  laneGap?: number;
  itemGap?: number;
  paddingX?: number;
  paddingY?: number;
  headerHeight?: number;
  makeGroupId?: (sourceKey: string, index: number) => string;
}

export interface SourceSwimlaneLayout {
  nodes: GraphNode[];
  groups: GraphGroup[];
  laneCount: number;
}

export interface GraphFocusPreview {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface GraphSourceReference {
  key: string;
  type: string;
  id: string;
  label: string;
  excerpt?: string;
  nodeCount: number;
  nodeIds: string[];
}

export interface GraphSourceTypeBucket {
  type: string;
  label: string;
  referenceCount: number;
  nodeCount: number;
}

export interface GraphSourceReferenceSummary {
  totalReferences: number;
  totalLinkedNodes: number;
  isolatedNodeCount: number;
  isolatedNodeIds: string[];
  missingSourceNodeCount: number;
  missingSourceNodeIds: string[];
  references: GraphSourceReference[];
  typeBuckets: GraphSourceTypeBucket[];
}

export type GraphValidationSeverity = "info" | "warning" | "error";

export interface GraphValidationIssue {
  ruleType: string;
  message: string;
  targetId?: string;
  severity: GraphValidationSeverity;
}

export interface GraphValidationOptions {
  sourceTargets?: Set<string>;
  requireSource?: boolean;
  minNodeWidth?: number;
  minNodeHeight?: number;
  maxNodeWidth?: number;
  maxNodeHeight?: number;
}

export interface StudymateGraphFile {
  mimeType: "application/vnd.studymate.graph+json";
  extension: ".smtg";
  schemaVersion: number;
  document: GraphDocument;
  metadata: Record<string, unknown>;
  issues: GraphValidationIssue[];
}

export interface GraphHistoryEntry {
  label: string;
  document: GraphDocument;
}

export interface GraphHistoryCoreState {
  past: GraphHistoryEntry[];
  present: GraphDocument;
  future: GraphHistoryEntry[];
  dirty: boolean;
  lastLabel: string;
}

export interface LearningGraphTemplate {
  id: string;
  name: string;
  category: "learning-material" | "book-notes" | "concept-network" | "review-card";
  description: string;
  document: GraphDocument;
}

export interface GraphSelectionState {
  selectedNodeId: string;
  selectedNodeIds: string[];
}

export interface GraphSelectionRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  hiddenNodeIds?: Set<string>;
}

export interface GraphClientPointProjection {
  clientX: number;
  clientY: number;
  stageRect: {
    left: number;
    top: number;
  };
  viewport: GraphViewport;
}

export interface GraphMinimapViewportOptions {
  viewport: GraphViewport;
  stage: GraphStageSize;
  world: GraphStageSize;
  scale: number;
}

export const studymateGraphMimeType = "application/vnd.studymate.graph+json";
export const studymateGraphExtension = ".smtg";
export const supportedGraphSchemaVersion = 1;
export const graphHistoryLimit = 80;

interface SourceLane {
  key: string;
  title: string;
  order: number;
  nodes: GraphNode[];
}

const sourceLaneOrder = new Map<string, number>([
  ["material", 10],
  ["annotation", 20],
  ["note", 30],
  ["card", 40],
  ["ai", 50],
  ["free", 90]
]);

const sourceLaneTitles = new Map<string, string>([
  ["material", "资料来源泳道"],
  ["annotation", "批注来源泳道"],
  ["note", "笔记来源泳道"],
  ["card", "卡片来源泳道"],
  ["ai", "AI 草稿泳道"],
  ["free", "自由节点泳道"]
]);

const sourceTypeLabels = new Map<string, string>([
  ["material", "资料"],
  ["annotation", "批注"],
  ["note", "笔记"],
  ["rich-note", "笔记"],
  ["card", "卡片"],
  ["ai", "AI 草稿"],
  ["free", "自由节点"]
]);

export function buildSourceSwimlaneLayout(nodes: GraphNode[], options: SourceSwimlaneLayoutOptions = {}): SourceSwimlaneLayout {
  const {
    anchorX = 0,
    anchorY = 0,
    stageWidth = 2400,
    stageHeight = 1600,
    laneGap = 72,
    itemGap = 24,
    paddingX = 28,
    paddingY = 26,
    headerHeight = 42,
    makeGroupId = (sourceKey, index) => `source-swimlane-${index + 1}-${sourceKey}`
  } = options;

  const lanes = buildSourceLanes(nodes);
  const placedNodes = new Map<string, GraphNode>();
  const groups: GraphGroup[] = [];
  let nextLaneX = clamp(anchorX, 0, stageWidth);

  lanes.forEach((lane, laneIndex) => {
    const laneNodeWidth = Math.max(...lane.nodes.map((node) => node.width), 160);
    const laneWidth = Math.min(stageWidth, laneNodeWidth + paddingX * 2);
    const laneContentHeight =
      lane.nodes.reduce((height, node, index) => height + node.height + (index === 0 ? 0 : itemGap), 0);
    const laneHeight = Math.min(stageHeight, headerHeight + paddingY * 2 + laneContentHeight);
    const groupX = clamp(nextLaneX, 0, Math.max(0, stageWidth - laneWidth));
    const groupY = clamp(anchorY, 0, Math.max(0, stageHeight - laneHeight));
    let nextNodeY = groupY + headerHeight + paddingY;

    for (const node of lane.nodes) {
      const x = clamp(groupX + paddingX, 0, Math.max(0, stageWidth - node.width));
      const y = clamp(nextNodeY, 0, Math.max(0, stageHeight - node.height));
      placedNodes.set(node.id, { ...node, x: roundLayoutNumber(x), y: roundLayoutNumber(y) });
      nextNodeY += node.height + itemGap;
    }

    groups.push({
      id: makeGroupId(lane.key, laneIndex),
      title: lane.title,
      nodeIds: lane.nodes.map((node) => node.id),
      x: roundLayoutNumber(groupX),
      y: roundLayoutNumber(groupY),
      width: roundLayoutNumber(laneWidth),
      height: roundLayoutNumber(laneHeight),
      collapsed: false,
      metadata: {
        layoutKind: "source-swimlane",
        sourceKey: lane.key
      }
    });

    nextLaneX = groupX + laneWidth + laneGap;
  });

  return {
    nodes: nodes.map((node) => placedNodes.get(node.id) ?? { ...node }),
    groups,
    laneCount: groups.length
  };
}

export function parseGraphFocusPreviewSearch(params: URLSearchParams): GraphFocusPreview | null {
  const requiredKeys = ["focusX", "focusY", "focusWidth", "focusHeight"] as const;
  if (requiredKeys.some((key) => !params.has(key))) {
    return null;
  }

  const x = Number(params.get("focusX"));
  const y = Number(params.get("focusY"));
  const width = Number(params.get("focusWidth"));
  const height = Number(params.get("focusHeight"));
  if (![x, y, width, height].every((value) => Number.isFinite(value)) || width <= 0 || height <= 0) {
    return null;
  }

  return {
    x,
    y,
    width,
    height,
    label: params.get("focusLabel") || "AI 预计落点"
  };
}

export function summarizeGraphSourceReferences(nodes: GraphNode[]): GraphSourceReferenceSummary {
  const referencesByKey = new Map<string, GraphSourceReference>();
  const isolatedNodeIds: string[] = [];
  const missingSourceNodeIds: string[] = [];

  for (const node of nodes) {
    const type = normalizeSourceKey(node.source?.type);
    const id = node.source?.id?.trim();
    if (!id || type === "free") {
      isolatedNodeIds.push(node.id);
      missingSourceNodeIds.push(node.id);
      continue;
    }

    const key = `${type}:${id}`;
    const current = referencesByKey.get(key);
    if (current) {
      referencesByKey.set(key, {
        ...current,
        nodeCount: current.nodeCount + 1,
        nodeIds: [...current.nodeIds, node.id]
      });
      continue;
    }

    referencesByKey.set(key, {
      key,
      type,
      id,
      label: node.source?.label?.trim() || `${getSourceTypeLabel(type)} ${id}`,
      excerpt: node.source?.excerpt?.trim() || undefined,
      nodeCount: 1,
      nodeIds: [node.id]
    });
  }

  const references = [...referencesByKey.values()].sort(compareSourceReferences);
  const bucketMap = new Map<string, GraphSourceTypeBucket>();
  for (const reference of references) {
    const current = bucketMap.get(reference.type);
    if (current) {
      bucketMap.set(reference.type, {
        ...current,
        referenceCount: current.referenceCount + 1,
        nodeCount: current.nodeCount + reference.nodeCount
      });
      continue;
    }

    bucketMap.set(reference.type, {
      type: reference.type,
      label: getSourceTypeLabel(reference.type),
      referenceCount: 1,
      nodeCount: reference.nodeCount
    });
  }

  return {
    totalReferences: references.length,
    totalLinkedNodes: references.reduce((sum, reference) => sum + reference.nodeCount, 0),
    isolatedNodeCount: isolatedNodeIds.length,
    isolatedNodeIds,
    missingSourceNodeCount: missingSourceNodeIds.length,
    missingSourceNodeIds,
    references,
    typeBuckets: [...bucketMap.values()].sort(compareSourceBuckets)
  };
}

export function cloneGraphDocument(document: GraphDocument): GraphDocument {
  return {
    ...document,
    schemaVersion: document.schemaVersion ?? supportedGraphSchemaVersion,
    viewport: { ...document.viewport },
    nodes: (document.nodes ?? []).map((node) => ({
      ...node,
      source: node.source ? { ...node.source } : null,
      metadata: node.metadata ? cloneRecord(node.metadata) : undefined
    })),
    edges: (document.edges ?? []).map((edge) => ({
      ...edge,
      metadata: edge.metadata ? cloneRecord(edge.metadata) : undefined
    })),
    groups: (document.groups ?? []).map((group) => ({
      ...group,
      nodeIds: [...(group.nodeIds ?? [])],
      metadata: group.metadata ? cloneRecord(group.metadata) : undefined
    })),
    theme: document.theme ? cloneRecord(document.theme) : {},
    metadata: document.metadata ? cloneRecord(document.metadata) : {}
  };
}

export type GraphDocumentMutationTarget<
  TNode extends GraphNode = GraphNode,
  TEdge extends GraphEdge = GraphEdge,
  TGroup extends GraphGroup = GraphGroup
> = {
  nodes: TNode[];
  edges: TEdge[];
  groups: TGroup[];
};

export type AppendGraphEdgeResult<
  TNode extends GraphNode = GraphNode,
  TEdge extends GraphEdge = GraphEdge,
  TGroup extends GraphGroup = GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup> = GraphDocumentMutationTarget<TNode, TEdge, TGroup>
> = {
  document: TDocument;
  created: boolean;
  reason?: "duplicate" | "missing-node" | "self-loop";
};

export interface DuplicateGraphNodeOptions {
  makeNodeId: () => string;
  titleSuffix?: string;
  offsetX?: number;
  offsetY?: number;
  stageWidth?: number;
  stageHeight?: number;
}

export interface CreateGraphGroupOptions {
  makeGroupId: () => string;
  title?: string;
  paddingX?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

function cloneGraphNodeForMutation<TNode extends GraphNode>(node: TNode): TNode {
  return {
    ...node,
    source: node.source ? { ...node.source } : null,
    metadata: node.metadata ? cloneRecord(node.metadata) : undefined
  };
}

function cloneGraphEdgeForMutation<TEdge extends GraphEdge>(edge: TEdge): TEdge {
  return {
    ...edge,
    metadata: edge.metadata ? cloneRecord(edge.metadata) : undefined
  };
}

function cloneGraphGroupForMutation<TGroup extends GraphGroup>(group: TGroup): TGroup {
  return {
    ...group,
    nodeIds: [...group.nodeIds],
    metadata: group.metadata ? cloneRecord(group.metadata) : undefined
  };
}

export function removeGraphNodesFromDocument<
  TNode extends GraphNode,
  TEdge extends GraphEdge,
  TGroup extends GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup>
>(document: TDocument, nodeIds: readonly string[]): TDocument {
  const nodeIdSet = new Set(nodeIds.filter(Boolean));
  if (nodeIdSet.size === 0) {
    return document;
  }

  return {
    ...document,
    nodes: document.nodes.filter((node) => !nodeIdSet.has(node.id)).map(cloneGraphNodeForMutation),
    edges: document.edges
      .filter((edge) => !nodeIdSet.has(edge.sourceNodeId) && !nodeIdSet.has(edge.targetNodeId))
      .map(cloneGraphEdgeForMutation),
    groups: document.groups.map((group) => ({
      ...cloneGraphGroupForMutation(group),
      nodeIds: group.nodeIds.filter((nodeId) => !nodeIdSet.has(nodeId))
    }))
  };
}

export function appendGraphNodeToDocument<
  TNode extends GraphNode,
  TEdge extends GraphEdge,
  TGroup extends GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup>
>(document: TDocument, node: TNode): TDocument {
  return {
    ...document,
    nodes: [...document.nodes.map(cloneGraphNodeForMutation), cloneGraphNodeForMutation(node)],
    edges: document.edges.map(cloneGraphEdgeForMutation),
    groups: document.groups.map(cloneGraphGroupForMutation)
  };
}

export function appendGraphEdgeToDocument<
  TNode extends GraphNode,
  TEdge extends GraphEdge,
  TGroup extends GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup>
>(document: TDocument, edge: TEdge): AppendGraphEdgeResult<TNode, TEdge, TGroup, TDocument> {
  if (edge.sourceNodeId === edge.targetNodeId) {
    return { document, created: false, reason: "self-loop" };
  }

  const nodeIds = new Set(document.nodes.map((node) => node.id));
  if (!nodeIds.has(edge.sourceNodeId) || !nodeIds.has(edge.targetNodeId)) {
    return { document, created: false, reason: "missing-node" };
  }

  const exists = document.edges.some(
    (current) => current.sourceNodeId === edge.sourceNodeId && current.targetNodeId === edge.targetNodeId
  );
  if (exists) {
    return { document, created: false, reason: "duplicate" };
  }

  return {
    document: {
      ...document,
      nodes: document.nodes.map(cloneGraphNodeForMutation),
      edges: [...document.edges.map(cloneGraphEdgeForMutation), cloneGraphEdgeForMutation(edge)],
      groups: document.groups.map(cloneGraphGroupForMutation)
    },
    created: true
  };
}

export function duplicateGraphNodeInDocument<
  TNode extends GraphNode,
  TEdge extends GraphEdge,
  TGroup extends GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup>
>(
  document: TDocument,
  nodeId: string,
  options: DuplicateGraphNodeOptions
): { document: TDocument; node?: TNode } {
  const source = document.nodes.find((node) => node.id === nodeId);
  if (!source) {
    return { document };
  }

  const offsetX = options.offsetX ?? 36;
  const offsetY = options.offsetY ?? 28;
  const maxX = options.stageWidth == null ? Number.POSITIVE_INFINITY : Math.max(0, options.stageWidth - source.width);
  const maxY = options.stageHeight == null ? Number.POSITIVE_INFINITY : Math.max(0, options.stageHeight - source.height);
  const duplicated = {
    ...cloneGraphNodeForMutation(source),
    id: options.makeNodeId(),
    title: `${source.title}${options.titleSuffix ?? " 副本"}`,
    x: Math.max(0, Math.min(maxX, source.x + offsetX)),
    y: Math.max(0, Math.min(maxY, source.y + offsetY))
  } as TNode;

  return {
    document: appendGraphNodeToDocument(document, duplicated),
    node: duplicated
  };
}

export function createGraphGroupForNodes<
  TNode extends GraphNode,
  TEdge extends GraphEdge,
  TGroup extends GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup>
>(
  document: TDocument,
  nodeIds: readonly string[],
  options: CreateGraphGroupOptions
): { document: TDocument; group?: TGroup } {
  const selectedIdSet = new Set(nodeIds.filter(Boolean));
  const nodes = document.nodes.filter((node) => selectedIdSet.has(node.id));
  if (nodes.length === 0) {
    return { document };
  }

  const paddingX = options.paddingX ?? 36;
  const paddingTop = options.paddingTop ?? 46;
  const paddingBottom = options.paddingBottom ?? 42;
  const left = Math.min(...nodes.map((node) => node.x));
  const top = Math.min(...nodes.map((node) => node.y));
  const right = Math.max(...nodes.map((node) => node.x + node.width));
  const bottom = Math.max(...nodes.map((node) => node.y + node.height));
  const group = {
    id: options.makeGroupId(),
    title:
      options.title ??
      (nodes.length === 1 ? `${nodes[0].title} 分组` : `${nodes[0].title} 等 ${nodes.length} 个节点`),
    nodeIds: nodes.map((node) => node.id),
    x: Math.max(0, left - paddingX),
    y: Math.max(0, top - paddingTop),
    width: right - left + paddingX * 2,
    height: bottom - top + paddingTop + paddingBottom,
    collapsed: false
  } as TGroup;

  return {
    document: {
      ...document,
      nodes: document.nodes.map(cloneGraphNodeForMutation),
      edges: document.edges.map(cloneGraphEdgeForMutation),
      groups: [...document.groups.map(cloneGraphGroupForMutation), group]
    },
    group
  };
}

export function toggleGraphGroupCollapse<
  TNode extends GraphNode,
  TEdge extends GraphEdge,
  TGroup extends GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup>
>(document: TDocument, groupId: string): TDocument {
  if (!document.groups.some((group) => group.id === groupId)) {
    return document;
  }

  return {
    ...document,
    nodes: document.nodes.map(cloneGraphNodeForMutation),
    edges: document.edges.map(cloneGraphEdgeForMutation),
    groups: document.groups.map((group) =>
      group.id === groupId ? ({ ...cloneGraphGroupForMutation(group), collapsed: !group.collapsed } as TGroup) : cloneGraphGroupForMutation(group)
    )
  };
}

export function normalizeGraphDocument(graphId: string, version: number, document: GraphDocument): GraphDocument {
  const viewport = document.viewport ?? { x: 0, y: 0, zoom: 1 };
  return {
    ...cloneGraphDocument({
      ...document,
      id: graphId,
      version,
      schemaVersion: document.schemaVersion || supportedGraphSchemaVersion,
      viewport: {
        x: finiteOrDefault(viewport.x, 0),
        y: finiteOrDefault(viewport.y, 0),
        zoom: clampZoomValue(viewport.zoom)
      },
      nodes: document.nodes ?? [],
      edges: document.edges ?? [],
      groups: document.groups ?? [],
      theme: document.theme ?? {},
      metadata: document.metadata ?? {}
    }),
    id: graphId,
    version
  };
}

export function validateGraphDocument(document: GraphDocument, options: GraphValidationOptions = {}): GraphValidationIssue[] {
  const {
    sourceTargets,
    requireSource = true,
    minNodeWidth = 80,
    minNodeHeight = 48,
    maxNodeWidth = 1200,
    maxNodeHeight = 900
  } = options;
  const issues: GraphValidationIssue[] = [];
  const nodeMap = new Map<string, GraphNode>();
  const titleMap = new Map<string, string[]>();
  const connectedNodeIds = new Set<string>();

  for (const node of document.nodes ?? []) {
    const nodeId = node.id?.trim();
    if (!nodeId) {
      issues.push({
        ruleType: "missing_node_id",
        message: "节点 ID 不能为空",
        severity: "error"
      });
      continue;
    }

    if (nodeMap.has(nodeId)) {
      issues.push({
        ruleType: "duplicate_node_id",
        message: "节点 ID 重复",
        targetId: nodeId,
        severity: "error"
      });
    }
    nodeMap.set(nodeId, node);

    const title = node.title?.trim();
    if (!title) {
      issues.push({
        ruleType: "empty_node_title",
        message: "节点标题不能为空",
        targetId: nodeId,
        severity: "warning"
      });
    } else {
      const normalizedTitle = title.toLocaleLowerCase();
      titleMap.set(normalizedTitle, [...(titleMap.get(normalizedTitle) ?? []), nodeId]);
    }

    if (
      !Number.isFinite(node.width) ||
      !Number.isFinite(node.height) ||
      node.width < minNodeWidth ||
      node.height < minNodeHeight ||
      node.width > maxNodeWidth ||
      node.height > maxNodeHeight
    ) {
      issues.push({
        ruleType: "invalid_node_size",
        message: "节点尺寸不在允许范围内",
        targetId: nodeId,
        severity: "error"
      });
    }

    const sourceType = node.source?.type?.trim();
    const sourceID = node.source?.id?.trim();
    if (requireSource && !sourceID) {
      issues.push({
        ruleType: "missing_source",
        message: "节点缺少可追溯来源",
        targetId: nodeId,
        severity: "warning"
      });
    }
    if ((sourceType && !sourceID) || (!sourceType && sourceID)) {
      issues.push({
        ruleType: "invalid_source_target",
        message: "来源类型和来源 ID 必须同时存在",
        targetId: nodeId,
        severity: "error"
      });
    }
    if (sourceTargets && sourceType && sourceID && !sourceTargets.has(`${normalizeSourceKey(sourceType)}:${sourceID}`)) {
      issues.push({
        ruleType: "invalid_source_target",
        message: "节点来源指向不存在或不可访问的对象",
        targetId: nodeId,
        severity: "error"
      });
    }
  }

  for (const [_, nodeIds] of titleMap) {
    if (nodeIds.length <= 1) {
      continue;
    }
    for (const nodeId of nodeIds) {
      issues.push({
        ruleType: "duplicate_title",
        message: "存在重复标题节点",
        targetId: nodeId,
        severity: "warning"
      });
    }
  }

  for (const edge of document.edges ?? []) {
    const sourceExists = nodeMap.has(edge.sourceNodeId);
    const targetExists = nodeMap.has(edge.targetNodeId);
    if (!sourceExists || !targetExists) {
      issues.push({
        ruleType: "dangling_edge",
        message: !sourceExists ? "连线起点不存在" : "连线终点不存在",
        targetId: edge.id,
        severity: "error"
      });
    }
    if (sourceExists) {
      connectedNodeIds.add(edge.sourceNodeId);
    }
    if (targetExists) {
      connectedNodeIds.add(edge.targetNodeId);
    }

    const targetNodeIds = edge.metadata?.targetNodeIds;
    if (Array.isArray(targetNodeIds)) {
      for (const targetNodeId of targetNodeIds) {
        if (typeof targetNodeId !== "string" || !nodeMap.has(targetNodeId)) {
          issues.push({
            ruleType: "dangling_edge",
            message: "多目标连线包含不存在的目标节点",
            targetId: edge.id,
            severity: "error"
          });
        }
      }
    }
  }

  const collapsedGroupByNodeId = new Map<string, string>();
  for (const group of document.groups ?? []) {
    if ((group.nodeIds ?? []).length === 0) {
      issues.push({
        ruleType: "empty_group",
        message: "分组内没有节点",
        targetId: group.id,
        severity: "warning"
      });
    }
    for (const nodeId of group.nodeIds ?? []) {
      if (!nodeMap.has(nodeId)) {
        issues.push({
          ruleType: "invalid_group_node",
          message: "分组引用了不存在的节点",
          targetId: group.id,
          severity: "error"
        });
      }
      if (group.collapsed) {
        collapsedGroupByNodeId.set(nodeId, group.id);
      }
    }
  }

  for (const edge of document.edges ?? []) {
    const sourceGroup = collapsedGroupByNodeId.get(edge.sourceNodeId);
    const targetGroup = collapsedGroupByNodeId.get(edge.targetNodeId);
    if ((sourceGroup && sourceGroup !== targetGroup) || (targetGroup && sourceGroup !== targetGroup)) {
      issues.push({
        ruleType: "cross_collapsed_group_edge",
        message: "连线跨过折叠分组边界",
        targetId: edge.id,
        severity: "warning"
      });
    }
  }

  for (const node of document.nodes ?? []) {
    if (!connectedNodeIds.has(node.id)) {
      issues.push({
        ruleType: "isolated_node",
        message: "节点没有任何连线",
        targetId: node.id,
        severity: "info"
      });
    }
  }

  return issues.sort(compareValidationIssues);
}

export function serializeStudymateGraphJson(
  document: GraphDocument,
  metadata: Record<string, unknown> = {}
): string {
  const normalized = normalizeGraphDocument(document.id, document.version, document);
  return JSON.stringify(
    {
      mimeType: studymateGraphMimeType,
      extension: studymateGraphExtension,
      schemaVersion: supportedGraphSchemaVersion,
      document: normalized,
      metadata
    },
    null,
    2
  );
}

export function parseStudymateGraphJson(
  content: string,
  options: { graphId?: string; version?: number; sourceTargets?: Set<string> } = {}
): StudymateGraphFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid StudyMate graph JSON: ${(error as Error).message}`);
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid StudyMate graph JSON: root must be an object");
  }

  const root = parsed as Record<string, unknown>;
  const rawSchemaVersion = Number(root.schemaVersion ?? (root.document as Record<string, unknown> | undefined)?.schemaVersion);
  if (rawSchemaVersion !== supportedGraphSchemaVersion) {
    throw new Error(`Unsupported StudyMate graph schema: ${rawSchemaVersion || "missing"}`);
  }

  const rawDocument = (root.document && typeof root.document === "object" ? root.document : root) as GraphDocument;
  const graphId = options.graphId ?? rawDocument.id;
  const version = options.version ?? rawDocument.version ?? 1;
  const document = normalizeGraphDocument(graphId, version, rawDocument);
  const issues = validateGraphDocument(document, { sourceTargets: options.sourceTargets });

  return {
    mimeType: studymateGraphMimeType,
    extension: studymateGraphExtension,
    schemaVersion: supportedGraphSchemaVersion,
    document,
    metadata: cloneRecord((root.metadata && typeof root.metadata === "object" ? root.metadata : {}) as Record<string, unknown>),
    issues
  };
}

export function createGraphHistoryState(document: GraphDocument): GraphHistoryCoreState {
  return {
    past: [],
    present: cloneGraphDocument(document),
    future: [],
    dirty: false,
    lastLabel: "初始状态"
  };
}

export function withGraphHistoryChange(
  history: GraphHistoryCoreState,
  nextDocument: GraphDocument,
  label: string
): GraphHistoryCoreState {
  const entryLabel = label.trim() || "图谱变更";
  return {
    past: [...history.past.slice(-(graphHistoryLimit - 1)), { label: entryLabel, document: cloneGraphDocument(history.present) }],
    present: cloneGraphDocument(nextDocument),
    future: [],
    dirty: true,
    lastLabel: entryLabel
  };
}

export function markGraphHistoryClean(history: GraphHistoryCoreState, label = "保存图谱"): GraphHistoryCoreState {
  return {
    ...history,
    dirty: false,
    lastLabel: label
  };
}

export function undoGraphHistory(history: GraphHistoryCoreState): GraphHistoryCoreState | null {
  const previous = history.past.at(-1);
  if (!previous) {
    return null;
  }
  return {
    past: history.past.slice(0, -1),
    present: cloneGraphDocument(previous.document),
    future: [{ label: previous.label, document: cloneGraphDocument(history.present) }, ...history.future].slice(0, graphHistoryLimit),
    dirty: true,
    lastLabel: `撤销：${previous.label}`
  };
}

export function redoGraphHistory(history: GraphHistoryCoreState): GraphHistoryCoreState | null {
  const [next, ...future] = history.future;
  if (!next) {
    return null;
  }
  return {
    past: [...history.past.slice(-(graphHistoryLimit - 1)), { label: next.label, document: cloneGraphDocument(history.present) }],
    present: cloneGraphDocument(next.document),
    future,
    dirty: true,
    lastLabel: `重做：${next.label}`
  };
}

export function getLearningGraphTemplates(): LearningGraphTemplate[] {
  return [
    buildLearningTemplate("learning-material-map", "学习资料梳理", "learning-material", [
      ["material", "资料主线", "material"],
      ["annotation", "关键批注", "annotation"],
      ["note", "沉淀笔记", "note"],
      ["concept", "待理解概念", "free"]
    ]),
    buildLearningTemplate("book-notes-map", "读书笔记", "book-notes", [
      ["material", "书籍/章节", "material"],
      ["note", "章节摘要", "note"],
      ["concept", "核心观点", "free"],
      ["concept", "问题与反思", "free"]
    ]),
    buildLearningTemplate("concept-network", "概念网络", "concept-network", [
      ["concept", "核心概念", "free"],
      ["concept", "前置概念", "free"],
      ["concept", "相关概念", "free"],
      ["ai", "AI 解释草稿", "ai"]
    ]),
    buildLearningTemplate("review-card-prep", "复习卡片准备", "review-card", [
      ["note", "复习来源笔记", "note"],
      ["concept", "可提问知识点", "free"],
      ["card", "卡片草稿", "card"],
      ["concept", "易混淆点", "free"]
    ])
  ];
}

export function buildGraphBenchmarkFixture(options: {
  nodeCount?: number;
  edgeCount?: number;
  groupCount?: number;
} = {}): GraphDocument {
  const nodeCount = options.nodeCount ?? 200;
  const edgeCount = options.edgeCount ?? 300;
  const groupCount = options.groupCount ?? 20;
  const nodes: GraphNode[] = Array.from({ length: nodeCount }, (_, index) => ({
    id: `node-${index + 1}`,
    type: index % 5 === 0 ? "material" : index % 5 === 1 ? "note" : index % 5 === 2 ? "card" : index % 5 === 3 ? "ai" : "concept",
    title: `Benchmark Node ${index + 1}`,
    x: (index % 20) * 120,
    y: Math.floor(index / 20) * 110,
    width: 180,
    height: 96,
    source: {
      type: index % 5 === 0 ? "material" : index % 5 === 1 ? "note" : index % 5 === 2 ? "card" : index % 5 === 3 ? "ai" : "free",
      id: index % 5 === 4 ? `free-${index + 1}` : `source-${index + 1}`,
      label: `Source ${index + 1}`
    }
  }));

  const edges: GraphEdge[] = Array.from({ length: edgeCount }, (_, index) => ({
    id: `edge-${index + 1}`,
    kind: index % 3 === 0 ? "curve" : "straight",
    sourceNodeId: nodes[index % nodes.length].id,
    targetNodeId: nodes[(index + 1) % nodes.length].id,
    label: index % 5 === 0 ? "关联" : undefined,
    metadata: index % 17 === 0 ? { targetNodeIds: [nodes[(index + 2) % nodes.length].id] } : undefined
  }));

  const groups: GraphGroup[] = Array.from({ length: groupCount }, (_, index) => {
    const start = Math.floor((index * nodeCount) / groupCount);
    const end = Math.floor(((index + 1) * nodeCount) / groupCount);
    return {
      id: `group-${index + 1}`,
      title: `Benchmark Group ${index + 1}`,
      nodeIds: nodes.slice(start, Math.max(start + 1, end)).map((node) => node.id),
      x: (index % 5) * 430,
      y: Math.floor(index / 5) * 310,
      width: 380,
      height: 260,
      collapsed: false,
      metadata: { fixture: "benchmark" }
    };
  });

  return {
    id: "benchmark-graph",
    version: 1,
    schemaVersion: supportedGraphSchemaVersion,
    viewport: { x: 120, y: 90, zoom: 1 },
    nodes,
    edges,
    groups,
    theme: { density: "comfortable" },
    metadata: { fixture: "200-node-productization" }
  };
}

export function sanitizeGraphExportFilename(name: string, fallback = "studymate-graph"): string {
  const normalized = name
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^-+|-+$/g, "")
    .trim();
  return normalized || fallback;
}

export function createGraphSelectionState(): GraphSelectionState {
  return {
    selectedNodeId: "",
    selectedNodeIds: []
  };
}

export function setGraphNodeSelection(_: GraphSelectionState, nodeId: string): GraphSelectionState {
  if (!nodeId.trim()) {
    return createGraphSelectionState();
  }
  return {
    selectedNodeId: nodeId,
    selectedNodeIds: [nodeId]
  };
}

export function clearGraphNodeSelection(_: GraphSelectionState): GraphSelectionState {
  return createGraphSelectionState();
}

export function toggleGraphNodeSelection(selection: GraphSelectionState, nodeId: string): GraphSelectionState {
  if (!nodeId.trim()) {
    return {
      selectedNodeId: selection.selectedNodeId,
      selectedNodeIds: [...selection.selectedNodeIds]
    };
  }

  if (selection.selectedNodeIds.includes(nodeId)) {
    const selectedNodeIds = selection.selectedNodeIds.filter((item) => item !== nodeId);
    return {
      selectedNodeId: selectedNodeIds[0] ?? "",
      selectedNodeIds
    };
  }

  return {
    selectedNodeId: nodeId,
    selectedNodeIds: [...selection.selectedNodeIds, nodeId]
  };
}

export function selectGraphNodesInRect(nodes: GraphNode[], rect: GraphSelectionRect): string[] {
  const left = Math.min(rect.left, rect.right);
  const right = Math.max(rect.left, rect.right);
  const top = Math.min(rect.top, rect.bottom);
  const bottom = Math.max(rect.top, rect.bottom);
  return nodes
    .filter((node) => !rect.hiddenNodeIds?.has(node.id))
    .filter((node) => node.x < right && node.x + node.width > left && node.y < bottom && node.y + node.height > top)
    .map((node) => node.id);
}

export function clampGraphZoom(value: number, min = 0.55, max = 1.8, fallback = 1): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Number(value.toFixed(2))));
}

export function centerGraphViewportOnRect(options: {
  rect: GraphRect;
  stage: GraphStageSize;
  zoom: number;
}): GraphViewport {
  const zoom = clampGraphZoom(options.zoom);
  const centerX = options.rect.x + options.rect.width / 2;
  const centerY = options.rect.y + options.rect.height / 2;
  return {
    x: roundLayoutNumber(options.stage.width / 2 - centerX * zoom),
    y: roundLayoutNumber(options.stage.height / 2 - centerY * zoom),
    zoom
  };
}

export function projectClientPointToGraph(options: GraphClientPointProjection): { x: number; y: number } {
  const localX = options.clientX - options.stageRect.left;
  const localY = options.clientY - options.stageRect.top;
  const zoom = options.viewport.zoom || 1;
  return {
    x: roundLayoutNumber((localX - options.viewport.x) / zoom),
    y: roundLayoutNumber((localY - options.viewport.y) / zoom)
  };
}

export function buildGraphMinimapViewport(options: GraphMinimapViewportOptions) {
  if (options.stage.width <= 0 || options.stage.height <= 0 || options.viewport.zoom <= 0 || options.scale <= 0) {
    return null;
  }
  const left = Math.max(0, -options.viewport.x / options.viewport.zoom);
  const top = Math.max(0, -options.viewport.y / options.viewport.zoom);
  const width = Math.min(options.world.width, options.stage.width / options.viewport.zoom);
  const height = Math.min(options.world.height, options.stage.height / options.viewport.zoom);
  return {
    left: roundLayoutNumber(left * options.scale),
    top: roundLayoutNumber(top * options.scale),
    width: roundLayoutNumber(width * options.scale),
    height: roundLayoutNumber(height * options.scale)
  };
}

function buildSourceLanes(nodes: GraphNode[]): SourceLane[] {
  const lanesByKey = new Map<string, SourceLane>();

  for (const node of nodes) {
    const key = normalizeSourceKey(node.source?.type);
    const lane = lanesByKey.get(key) ?? {
      key,
      title: sourceLaneTitles.get(key) ?? `${node.source?.type || "其他"}来源泳道`,
      order: sourceLaneOrder.get(key) ?? 80,
      nodes: []
    };
    lane.nodes = [...lane.nodes, node];
    lanesByKey.set(key, lane);
  }

  return [...lanesByKey.values()]
    .map((lane) => ({
      ...lane,
      nodes: [...lane.nodes].sort(compareSourceLaneNodes)
    }))
    .sort((left, right) => {
      const orderDiff = left.order - right.order;
      return orderDiff === 0 ? left.title.localeCompare(right.title, "zh-CN") : orderDiff;
    });
}

function compareSourceLaneNodes(left: GraphNode, right: GraphNode) {
  const leftSource = left.source?.label || left.title;
  const rightSource = right.source?.label || right.title;
  const sourceDiff = leftSource.localeCompare(rightSource, "zh-CN");
  return sourceDiff === 0 ? left.title.localeCompare(right.title, "zh-CN") : sourceDiff;
}

function normalizeSourceKey(sourceType?: string) {
  const key = sourceType?.trim().toLowerCase();
  return key || "free";
}

function getSourceTypeLabel(sourceType: string) {
  return sourceTypeLabels.get(sourceType) ?? sourceType;
}

function compareSourceReferences(left: GraphSourceReference, right: GraphSourceReference) {
  const orderDiff = getSourceOrder(left.type) - getSourceOrder(right.type);
  if (orderDiff !== 0) {
    return orderDiff;
  }

  const labelDiff = left.label.localeCompare(right.label, "zh-CN");
  return labelDiff === 0 ? left.id.localeCompare(right.id, "zh-CN") : labelDiff;
}

function compareSourceBuckets(left: GraphSourceTypeBucket, right: GraphSourceTypeBucket) {
  const orderDiff = getSourceOrder(left.type) - getSourceOrder(right.type);
  return orderDiff === 0 ? left.label.localeCompare(right.label, "zh-CN") : orderDiff;
}

function getSourceOrder(sourceType: string) {
  return sourceLaneOrder.get(sourceType) ?? 80;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundLayoutNumber(value: number) {
  return Number(value.toFixed(1));
}

function finiteOrDefault(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? Number(value) : fallback;
}

function clampZoomValue(value: number | undefined) {
  if (!Number.isFinite(value) || !value) {
    return 1;
  }
  return Number(Math.max(0.2, Math.min(3, value)).toFixed(2));
}

function cloneRecord(record: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(record)) as Record<string, unknown>;
}

function compareValidationIssues(left: GraphValidationIssue, right: GraphValidationIssue) {
  const severityOrder = new Map<GraphValidationSeverity, number>([
    ["error", 0],
    ["warning", 1],
    ["info", 2]
  ]);
  const severityDiff = (severityOrder.get(left.severity) ?? 3) - (severityOrder.get(right.severity) ?? 3);
  if (severityDiff !== 0) {
    return severityDiff;
  }
  const ruleDiff = left.ruleType.localeCompare(right.ruleType, "zh-CN");
  return ruleDiff === 0 ? (left.targetId ?? "").localeCompare(right.targetId ?? "", "zh-CN") : ruleDiff;
}

function buildLearningTemplate(
  id: string,
  name: string,
  category: LearningGraphTemplate["category"],
  seeds: Array<[type: string, title: string, sourceType: string]>
): LearningGraphTemplate {
  const nodes = seeds.map(([type, title, sourceType], index) => ({
    id: `${id}-node-${index + 1}`,
    type,
    title,
    x: 140 + index * 260,
    y: index % 2 === 0 ? 140 : 320,
    width: 230,
    height: 120,
    source:
      sourceType === "free"
        ? null
        : {
            type: sourceType,
            id: `${sourceType}-placeholder`,
            label: `${title}来源`
          },
    metadata: { templateId: id }
  }));
  const edges = nodes.slice(1).map((node, index) => ({
    id: `${id}-edge-${index + 1}`,
    kind: "curve",
    sourceNodeId: nodes[index].id,
    targetNodeId: node.id,
    label: "学习关联"
  }));
  const document: GraphDocument = {
    id,
    version: 1,
    schemaVersion: supportedGraphSchemaVersion,
    viewport: { x: 120, y: 90, zoom: 1 },
    nodes,
    edges,
    groups: [
      {
        id: `${id}-group`,
        title: name,
        nodeIds: nodes.map((node) => node.id),
        x: 100,
        y: 100,
        width: Math.max(780, nodes.length * 260),
        height: 460,
        collapsed: false,
        metadata: { templateId: id }
      }
    ],
    theme: { template: category },
    metadata: { templateId: id, templateName: name }
  };

  return {
    id,
    name,
    category,
    description: `${name}模板，用于把资料、笔记、概念和复习行动连接成学习闭环。`,
    document
  };
}
