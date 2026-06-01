import type {
  GraphDetailPayload,
  GraphDocumentPayload,
  GraphEdgePayload,
  GraphGroupPayload,
  GraphNodePayload
} from "../../../api/client";
import { getNodeToneTokens } from "../nodeAppearance";

export const stageWidth = 2400;
export const stageHeight = 1600;
export const autosaveDelayMs = 8000;
export const maxHistoryEntries = 40;
export const minimapScale = 0.09;

export type DragState =
  | {
      kind: "node";
      nodeId: string;
      pointerX: number;
      pointerY: number;
      originX: number;
      originY: number;
    }
  | {
      kind: "multi-node";
      nodeIds: string[];
      pointerX: number;
      pointerY: number;
      origins: Record<string, { x: number; y: number }>;
    }
  | {
      kind: "pan";
      pointerX: number;
      pointerY: number;
      originX: number;
      originY: number;
    }
  | {
      kind: "marquee";
      startX: number;
      startY: number;
      currentX: number;
      currentY: number;
    };

export type ImportMode = "markdown" | "mermaid";

export type FocusPreview = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

export type GraphFocusNavigationState = {
  graphId?: string;
  focusPreview?: FocusPreview | null;
};

export type ContextMenuState =
  | {
      x: number;
      y: number;
      nodeId?: string;
      edgeId?: string;
    }
  | null;

export type SelectionBox = {
  left: number;
  top: number;
  width: number;
  height: number;
} | null;

export type AlignmentGuide = {
  orientation: "vertical" | "horizontal";
  position: number;
  start: number;
  end: number;
  match: "start" | "center" | "end";
  label: string;
};

export type SourceOrganizerMode = "type-columns" | "type-rows";

export type SourceGroupDefinition = {
  key: string;
  title: string;
  nodeIds: string[];
};

export function cloneDocument(document: GraphDocumentPayload): GraphDocumentPayload {
  return {
    ...document,
    viewport: { ...document.viewport },
    nodes: document.nodes.map((node) => ({
      ...node,
      source: node.source ? { ...node.source } : null,
      metadata: node.metadata ? { ...node.metadata } : undefined
    })),
    edges: document.edges.map((edge) => ({
      ...edge,
      metadata: edge.metadata ? { ...edge.metadata } : undefined
    })),
    groups: document.groups.map((group) => ({
      ...group,
      nodeIds: [...group.nodeIds],
      metadata: group.metadata ? { ...group.metadata } : undefined
    })),
    theme: document.theme ? { ...document.theme } : {},
    metadata: document.metadata ? { ...document.metadata } : {}
  };
}

export function normalizeDocument(graphId: string, version: number, document: GraphDocumentPayload): GraphDocumentPayload {
  return {
    ...cloneDocument(document),
    graphId,
    version,
    schemaVersion: document.schemaVersion || 1,
    viewport: {
      x: document.viewport?.x ?? 140,
      y: document.viewport?.y ?? 120,
      zoom: document.viewport?.zoom || 1
    },
    nodes: document.nodes ?? [],
    edges: document.edges ?? [],
    groups: document.groups ?? [],
    theme: document.theme ?? {},
    metadata: document.metadata ?? {}
  };
}

export function createEmptyDocument(graphId: string, version: number): GraphDocumentPayload {
  return normalizeDocument(graphId, version, {
    graphId,
    version,
    schemaVersion: 1,
    viewport: { x: 140, y: 120, zoom: 1 },
    nodes: [],
    edges: [],
    groups: [],
    theme: {},
    metadata: {}
  });
}

export function rebuildDetail(detail: GraphDetailPayload, document: GraphDocumentPayload): GraphDetailPayload {
  return {
    ...detail,
    nodeCount: document.nodes.length,
    edgeCount: document.edges.length,
    document
  };
}

export function clampZoom(value: number) {
  return Math.max(0.55, Math.min(1.8, Number(value.toFixed(2))));
}

export function randomId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function defaultNodePosition(nodeCount: number) {
  return {
    x: 140 + (nodeCount % 4) * 260,
    y: 120 + Math.floor(nodeCount / 4) * 170
  };
}

export function buildNodeTitle(node: GraphNodePayload) {
  return node.title.trim() || "未命名节点";
}

export function getNodeSourceLabel(type?: string) {
  switch (type) {
    case "note":
      return "笔记";
    case "material":
      return "资料";
    case "card":
      return "卡片";
    default:
      return "来源";
  }
}

export function buildNodeSourceTarget(node: GraphNodePayload) {
  if (!node.source?.id) {
    return "";
  }

  switch (node.source.type) {
    case "note":
      return `/notes?selected=${encodeURIComponent(node.source.id)}`;
    case "material":
      return `/reader/${encodeURIComponent(node.source.id)}`;
    case "card":
      return "/review";
    default:
      return "";
  }
}

export function buildEdgePath(edge: GraphEdgePayload, nodeMap: Map<string, GraphNodePayload>) {
  const source = nodeMap.get(edge.sourceNodeId);
  const target = nodeMap.get(edge.targetNodeId);
  if (!source || !target) {
    return "";
  }

  const startX = source.x + source.width / 2;
  const startY = source.y + source.height / 2;
  const endX = target.x + target.width / 2;
  const endY = target.y + target.height / 2;

  if (edge.kind === "curve") {
    const deltaX = Math.max(80, Math.abs(endX - startX) * 0.35);
    return `M ${startX} ${startY} C ${startX + deltaX} ${startY}, ${endX - deltaX} ${endY}, ${endX} ${endY}`;
  }

  return `M ${startX} ${startY} L ${endX} ${endY}`;
}

export function buildEdgeLabelPosition(edge: GraphEdgePayload, nodeMap: Map<string, GraphNodePayload>) {
  const source = nodeMap.get(edge.sourceNodeId);
  const target = nodeMap.get(edge.targetNodeId);
  if (!source || !target) {
    return { x: 0, y: 0 };
  }

  return {
    x: (source.x + source.width / 2 + target.x + target.width / 2) / 2,
    y: (source.y + source.height / 2 + target.y + target.height / 2) / 2
  };
}

export function findHiddenNodeIds(groups: GraphGroupPayload[]) {
  const hidden = new Set<string>();
  for (const group of groups) {
    if (!group.collapsed) {
      continue;
    }
    for (const nodeId of group.nodeIds) {
      hidden.add(nodeId);
    }
  }
  return hidden;
}

export function buildGroupStyle(group: GraphGroupPayload) {
  return {
    width: group.width,
    height: group.height,
    transform: `translate(${group.x}px, ${group.y}px)`
  };
}

export function buildFocusPreviewViewport(preview: FocusPreview, detail: GraphDetailPayload, stage: HTMLDivElement) {
  const viewportWidth = stage.clientWidth;
  const viewportHeight = stage.clientHeight;
  const zoom = detail.document.viewport.zoom;
  const centerX = preview.x + preview.width / 2;
  const centerY = preview.y + preview.height / 2;
  return {
    x: viewportWidth / 2 - centerX * zoom,
    y: viewportHeight / 2 - centerY * zoom,
    zoom
  };
}

export function buildClearedFocusNavigationLocation(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  for (const key of ["graphId", "focusX", "focusY", "focusWidth", "focusHeight", "focusLabel"]) {
    params.delete(key);
  }

  const nextSearch = params.toString();
  return {
    pathname,
    search: nextSearch ? `?${nextSearch}` : ""
  };
}

export function buildSelectionBox(startX: number, startY: number, currentX: number, currentY: number): SelectionBox {
  return {
    left: Math.min(startX, currentX),
    top: Math.min(startY, currentY),
    width: Math.abs(currentX - startX),
    height: Math.abs(currentY - startY)
  };
}

export function isTypingElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
}

export function getSourceBucketKey(node: GraphNodePayload) {
  if (!node.source?.type) {
    return "free";
  }
  return node.source.type;
}

export function getSourceBucketLabel(node: GraphNodePayload) {
  if (!node.source?.type) {
    return "自由节点";
  }
  return getNodeSourceLabel(node.source.type);
}

export function isGeneratedSourceSwimlaneGroup(group: GraphGroupPayload) {
  return group.metadata?.layoutKind === "source-swimlane";
}

export function buildSourceGroupDefinitions(nodes: GraphNodePayload[]) {
  const groups = new Map<string, SourceGroupDefinition>();
  for (const node of nodes) {
    const key = getSourceBucketKey(node);
    const current = groups.get(key);
    if (current) {
      current.nodeIds.push(node.id);
      continue;
    }
    groups.set(key, {
      key,
      title: `${getSourceBucketLabel(node)}分组`,
      nodeIds: [node.id]
    });
  }
  return [...groups.values()];
}

export function getAlignmentLabel(orientation: AlignmentGuide["orientation"], match: AlignmentGuide["match"]) {
  if (orientation === "vertical") {
    if (match === "start") {
      return "左边对齐";
    }
    if (match === "center") {
      return "垂直中线对齐";
    }
    return "右边对齐";
  }

  if (match === "start") {
    return "顶边对齐";
  }
  if (match === "center") {
    return "水平中线对齐";
  }
  return "底边对齐";
}

export function buildNodeBounds(node: Pick<GraphNodePayload, "x" | "y" | "width" | "height">) {
  return {
    left: node.x,
    top: node.y,
    right: node.x + node.width,
    bottom: node.y + node.height,
    centerX: node.x + node.width / 2,
    centerY: node.y + node.height / 2,
    width: node.width,
    height: node.height
  };
}

export function buildCombinedBounds(nodes: Array<Pick<GraphNodePayload, "x" | "y" | "width" | "height">>) {
  const left = Math.min(...nodes.map((node) => node.x));
  const top = Math.min(...nodes.map((node) => node.y));
  const right = Math.max(...nodes.map((node) => node.x + node.width));
  const bottom = Math.max(...nodes.map((node) => node.y + node.height));
  return {
    left,
    top,
    right,
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
    width: right - left,
    height: bottom - top
  };
}

export function resolveAlignmentGuides(
  movingBounds: ReturnType<typeof buildNodeBounds>,
  stationaryNodes: GraphNodePayload[],
  threshold = 10
) {
  type AxisMatch = AlignmentGuide["match"];
  let bestVertical: { adjustment: number; guide: AlignmentGuide } | null = null;
  let bestHorizontal: { adjustment: number; guide: AlignmentGuide } | null = null;

  for (const node of stationaryNodes) {
    const target = buildNodeBounds(node);
    const verticalPairs: Array<[number, number, AxisMatch]> = [
      [movingBounds.left, target.left, "start"],
      [movingBounds.centerX, target.centerX, "center"],
      [movingBounds.right, target.right, "end"]
    ];
    const horizontalPairs: Array<[number, number, AxisMatch]> = [
      [movingBounds.top, target.top, "start"],
      [movingBounds.centerY, target.centerY, "center"],
      [movingBounds.bottom, target.bottom, "end"]
    ];

    for (const [current, desired, match] of verticalPairs) {
      const adjustment = desired - current;
      if (Math.abs(adjustment) > threshold) {
        continue;
      }
      const candidate = {
        adjustment,
        guide: {
          orientation: "vertical" as const,
          position: desired,
          start: Math.max(0, Math.min(movingBounds.top, target.top) - 28),
          end: Math.min(stageHeight, Math.max(movingBounds.bottom, target.bottom) + 28),
          match,
          label: getAlignmentLabel("vertical", match)
        }
      };
      if (!bestVertical || Math.abs(candidate.adjustment) < Math.abs(bestVertical.adjustment)) {
        bestVertical = candidate;
      }
    }

    for (const [current, desired, match] of horizontalPairs) {
      const adjustment = desired - current;
      if (Math.abs(adjustment) > threshold) {
        continue;
      }
      const candidate = {
        adjustment,
        guide: {
          orientation: "horizontal" as const,
          position: desired,
          start: Math.max(0, Math.min(movingBounds.left, target.left) - 28),
          end: Math.min(stageWidth, Math.max(movingBounds.right, target.right) + 28),
          match,
          label: getAlignmentLabel("horizontal", match)
        }
      };
      if (!bestHorizontal || Math.abs(candidate.adjustment) < Math.abs(bestHorizontal.adjustment)) {
        bestHorizontal = candidate;
      }
    }
  }

  return {
    deltaX: bestVertical?.adjustment ?? 0,
    deltaY: bestHorizontal?.adjustment ?? 0,
    guides: [bestVertical?.guide, bestHorizontal?.guide].filter((guide): guide is AlignmentGuide => Boolean(guide))
  };
}

export function projectClientPointToWorld(
  stage: HTMLDivElement,
  viewport: GraphDocumentPayload["viewport"],
  clientX: number,
  clientY: number
) {
  const rect = stage.getBoundingClientRect();
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  return {
    x: (localX - viewport.x) / viewport.zoom,
    y: (localY - viewport.y) / viewport.zoom
  };
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildSvgExport(
  detail: GraphDetailPayload,
  nodeMap: Map<string, GraphNodePayload>,
  hiddenNodeIds: Set<string>
) {
  const groups = detail.document.groups
    .map(
      (group) => `
        <rect x="${group.x}" y="${group.y}" width="${group.width}" height="${group.height}" rx="18" ry="18"
          fill="rgba(41,88,70,0.05)" stroke="rgba(41,88,70,0.25)" stroke-width="2" />
        <text x="${group.x + 16}" y="${group.y + 28}" font-size="16" fill="#355b4b">${group.title}</text>
      `
    )
    .join("");

  const edges = detail.document.edges
    .filter((edge) => !hiddenNodeIds.has(edge.sourceNodeId) && !hiddenNodeIds.has(edge.targetNodeId))
    .map((edge) => {
      const labelPoint = buildEdgeLabelPosition(edge, nodeMap);
      return `
        <path d="${buildEdgePath(edge, nodeMap)}" fill="none" stroke="#466858" stroke-width="2.5" />
        <text x="${labelPoint.x}" y="${labelPoint.y}" font-size="13" text-anchor="middle" fill="#4d665a">${edge.label || ""}</text>
      `;
    })
    .join("");

  const nodes = detail.document.nodes
    .filter((node) => !hiddenNodeIds.has(node.id))
    .map((node) => {
      const tone = getNodeToneTokens(node);
      return `
        <rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="16" ry="16"
          fill="${tone.exportFill}" stroke="${tone.exportStroke}" stroke-width="2" />
        <text x="${node.x + 16}" y="${node.y + 26}" font-size="12" fill="${tone.exportTypeFill}">${node.type.toUpperCase()}</text>
        <text x="${node.x + 16}" y="${node.y + 52}" font-size="18" fill="${tone.exportTitleFill}">${buildNodeTitle(node)}</text>
        <text x="${node.x + 16}" y="${node.y + 76}" font-size="13" fill="${tone.exportMetaFill}">${node.source?.label || "自由节点"}</text>
      `;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${stageWidth}" height="${stageHeight}" viewBox="0 0 ${stageWidth} ${stageHeight}">
    <rect width="100%" height="100%" fill="#f9f6ef" />
    ${groups}
    ${edges}
    ${nodes}
  </svg>`;
}
