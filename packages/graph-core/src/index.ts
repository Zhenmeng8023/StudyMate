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
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphDocument {
  id: string;
  version: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  groups: GraphGroup[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
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
  references: GraphSourceReference[];
  typeBuckets: GraphSourceTypeBucket[];
}

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

  for (const node of nodes) {
    const type = normalizeSourceKey(node.source?.type);
    const id = node.source?.id?.trim();
    if (!id || type === "free") {
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
    references,
    typeBuckets: [...bucketMap.values()].sort(compareSourceBuckets)
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
