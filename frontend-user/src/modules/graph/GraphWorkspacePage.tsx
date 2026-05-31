import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Download,
  FileDown,
  Layers3,
  Link2,
  MousePointer2,
  NotebookPen,
  Plus,
  Redo2,
  Save,
  ScanSearch,
  Search,
  Sparkles,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AuthSession,
  DeckPayload,
  DiagramTemplatePayload,
  GraphCardDraftPayload,
  GraphDetailPayload,
  GraphDocumentPayload,
  GraphEdgePayload,
  GraphGroupPayload,
  GraphNodePayload,
  GraphSnapshotPayload,
  GraphSummaryPayload,
  GraphValidationIssuePayload,
  MaterialPayload,
  NotePayload,
  batchSaveGraph,
  commitGraphCardDrafts,
  createGraph,
  deleteGraph,
  generateGraphCardDrafts,
  getGraph,
  importGraphMarkdown,
  importGraphMermaid,
  listDecks,
  listDiagramTemplates,
  listGraphSnapshots,
  listGraphs,
  listMaterials,
  listNotes,
  restoreGraphSnapshot,
  validateGraph
} from "../../api/client";
import {
  buildNodeStyle,
  getNodeDetail,
  getNodeEmphasis,
  getNodeTone,
  getNodeToneTokens,
  graphNodeEmphasisOptions,
  graphNodeSizePresetOptions,
  graphNodeToneOptions,
  patchNodeAppearance,
  resizeNodeToPreset,
  resolveNodeSizePreset
} from "./nodeAppearance";

const stageWidth = 2400;
const stageHeight = 1600;
const autosaveDelayMs = 8000;
const maxHistoryEntries = 40;
const minimapScale = 0.09;

type DragState =
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

type ImportMode = "markdown" | "mermaid";

type FocusPreview = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

type ContextMenuState =
  | {
      x: number;
      y: number;
      nodeId?: string;
      edgeId?: string;
    }
  | null;

type SelectionBox = {
  left: number;
  top: number;
  width: number;
  height: number;
} | null;

type AlignmentGuide = {
  orientation: "vertical" | "horizontal";
  position: number;
  start: number;
  end: number;
};

function cloneDocument(document: GraphDocumentPayload): GraphDocumentPayload {
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
      nodeIds: [...group.nodeIds]
    })),
    theme: document.theme ? { ...document.theme } : {},
    metadata: document.metadata ? { ...document.metadata } : {}
  };
}

function normalizeDocument(graphId: string, version: number, document: GraphDocumentPayload): GraphDocumentPayload {
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

function createEmptyDocument(graphId: string, version: number): GraphDocumentPayload {
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

function rebuildDetail(detail: GraphDetailPayload, document: GraphDocumentPayload): GraphDetailPayload {
  return {
    ...detail,
    nodeCount: document.nodes.length,
    edgeCount: document.edges.length,
    document
  };
}

function clampZoom(value: number) {
  return Math.max(0.55, Math.min(1.8, Number(value.toFixed(2))));
}

function randomId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function defaultNodePosition(nodeCount: number) {
  return {
    x: 140 + (nodeCount % 4) * 260,
    y: 120 + Math.floor(nodeCount / 4) * 170
  };
}

function buildNodeTitle(node: GraphNodePayload) {
  return node.title.trim() || "未命名节点";
}

function getNodeSourceLabel(type?: string) {
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

function buildNodeSourceTarget(node: GraphNodePayload) {
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

function buildEdgePath(edge: GraphEdgePayload, nodeMap: Map<string, GraphNodePayload>) {
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

function buildEdgeLabelPosition(edge: GraphEdgePayload, nodeMap: Map<string, GraphNodePayload>) {
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

function findHiddenNodeIds(groups: GraphGroupPayload[]) {
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

function buildGroupStyle(group: GraphGroupPayload) {
  return {
    width: group.width,
    height: group.height,
    transform: `translate(${group.x}px, ${group.y}px)`
  };
}

function focusPreviewArea(
  preview: FocusPreview,
  detail: GraphDetailPayload,
  stage: HTMLDivElement,
  apply: (updater: (draft: GraphDocumentPayload) => void) => void
) {
  const viewportWidth = stage.clientWidth;
  const viewportHeight = stage.clientHeight;
  const zoom = detail.document.viewport.zoom;
  const centerX = preview.x + preview.width / 2;
  const centerY = preview.y + preview.height / 2;
  const nextX = viewportWidth / 2 - centerX * zoom;
  const nextY = viewportHeight / 2 - centerY * zoom;

  apply((draft) => {
    draft.viewport.x = nextX;
    draft.viewport.y = nextY;
  });
}

function buildSelectionBox(startX: number, startY: number, currentX: number, currentY: number): SelectionBox {
  return {
    left: Math.min(startX, currentX),
    top: Math.min(startY, currentY),
    width: Math.abs(currentX - startX),
    height: Math.abs(currentY - startY)
  };
}

function buildNodeBounds(node: Pick<GraphNodePayload, "x" | "y" | "width" | "height">) {
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

function buildCombinedBounds(nodes: Array<Pick<GraphNodePayload, "x" | "y" | "width" | "height">>) {
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

function resolveAlignmentGuides(
  movingBounds: ReturnType<typeof buildNodeBounds>,
  stationaryNodes: GraphNodePayload[],
  threshold = 10
) {
  let bestVertical: { adjustment: number; guide: AlignmentGuide } | null = null;
  let bestHorizontal: { adjustment: number; guide: AlignmentGuide } | null = null;

  for (const node of stationaryNodes) {
    const target = buildNodeBounds(node);
    const verticalPairs = [
      [movingBounds.left, target.left],
      [movingBounds.centerX, target.centerX],
      [movingBounds.right, target.right]
    ];
    const horizontalPairs = [
      [movingBounds.top, target.top],
      [movingBounds.centerY, target.centerY],
      [movingBounds.bottom, target.bottom]
    ];

    for (const [current, desired] of verticalPairs) {
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
          end: Math.min(stageHeight, Math.max(movingBounds.bottom, target.bottom) + 28)
        }
      };
      if (!bestVertical || Math.abs(candidate.adjustment) < Math.abs(bestVertical.adjustment)) {
        bestVertical = candidate;
      }
    }

    for (const [current, desired] of horizontalPairs) {
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
          end: Math.min(stageWidth, Math.max(movingBounds.right, target.right) + 28)
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

function projectClientPointToWorld(
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

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildSvgExport(
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

export function GraphWorkspacePage(props: { session: AuthSession }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [graphs, setGraphs] = useState<GraphSummaryPayload[]>([]);
  const [decks, setDecks] = useState<DeckPayload[]>([]);
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [notes, setNotes] = useState<NotePayload[]>([]);
  const [diagramTemplates, setDiagramTemplates] = useState<DiagramTemplatePayload[]>([]);
  const [snapshots, setSnapshots] = useState<GraphSnapshotPayload[]>([]);
  const [validationIssues, setValidationIssues] = useState<GraphValidationIssuePayload[]>([]);
  const [cardDrafts, setCardDrafts] = useState<GraphCardDraftPayload[]>([]);
  const [graphDetail, setGraphDetail] = useState<GraphDetailPayload | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState("");
  const [linkFromNodeId, setLinkFromNodeId] = useState("");
  const [historyPast, setHistoryPast] = useState<GraphDocumentPayload[]>([]);
  const [historyFuture, setHistoryFuture] = useState<GraphDocumentPayload[]>([]);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [statusMessage, setStatusMessage] = useState("正在加载图谱工作台...");
  const [graphSearch, setGraphSearch] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("markdown");
  const [importSource, setImportSource] = useState("# 学习主题\n## 核心概念\n## 待复习问题");
  const [stageViewport, setStageViewport] = useState({ width: 0, height: 0 });
  const [focusPreview, setFocusPreview] = useState<FocusPreview | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const detailRef = useRef<GraphDetailPayload | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [selectedDraftDeckId, setSelectedDraftDeckId] = useState("");
  const focusSearch = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requestedGraphId = focusSearch.get("graphId") || "";
  const requestedFocus = useMemo(() => {
    const x = Number(focusSearch.get("focusX"));
    const y = Number(focusSearch.get("focusY"));
    const width = Number(focusSearch.get("focusWidth"));
    const height = Number(focusSearch.get("focusHeight"));
    const label = focusSearch.get("focusLabel") || "AI 预计落点";
    if (![x, y, width, height].every((value) => Number.isFinite(value))) {
      return null;
    }
    return { x, y, width, height, label };
  }, [focusSearch]);

  useEffect(() => {
    detailRef.current = graphDetail;
  }, [graphDetail]);

  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    function handleDismiss() {
      setContextMenu(null);
    }

    window.addEventListener("click", handleDismiss);
    window.addEventListener("scroll", handleDismiss, true);
    return () => {
      window.removeEventListener("click", handleDismiss);
      window.removeEventListener("scroll", handleDismiss, true);
    };
  }, [contextMenu]);

  useEffect(() => {
    function measureStage() {
      if (!stageRef.current) {
        return;
      }
      setStageViewport({
        width: stageRef.current.clientWidth,
        height: stageRef.current.clientHeight
      });
    }

    measureStage();
    window.addEventListener("resize", measureStage);
    return () => window.removeEventListener("resize", measureStage);
  }, []);

  const document = graphDetail?.document ?? null;
  const nodeMap = useMemo(() => {
    return new Map((document?.nodes ?? []).map((node) => [node.id, node]));
  }, [document?.nodes]);
  const hiddenNodeIds = useMemo(() => findHiddenNodeIds(document?.groups ?? []), [document?.groups]);
  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) ?? null : null;
  const selectedNodes = useMemo(
    () => selectedNodeIds.map((nodeId) => nodeMap.get(nodeId)).filter((node): node is GraphNodePayload => Boolean(node)),
    [nodeMap, selectedNodeIds]
  );
  const batchTone = useMemo(() => {
    if (selectedNodes.length < 2) {
      return null;
    }
    const tone = getNodeTone(selectedNodes[0]);
    return selectedNodes.every((node) => getNodeTone(node) === tone) ? tone : null;
  }, [selectedNodes]);
  const batchEmphasis = useMemo(() => {
    if (selectedNodes.length < 2) {
      return null;
    }
    const emphasis = getNodeEmphasis(selectedNodes[0]);
    return selectedNodes.every((node) => getNodeEmphasis(node) === emphasis) ? emphasis : null;
  }, [selectedNodes]);
  const batchSizePreset = useMemo(() => {
    if (selectedNodes.length < 2) {
      return null;
    }
    const preset = resolveNodeSizePreset(selectedNodes[0]);
    return selectedNodes.every((node) => resolveNodeSizePreset(node) === preset) ? preset : null;
  }, [selectedNodes]);
  const selectedEdge = selectedEdgeId ? document?.edges.find((edge) => edge.id === selectedEdgeId) ?? null : null;
  const selectedNodeSourceTarget = selectedNode ? buildNodeSourceTarget(selectedNode) : "";
  const visibleNodes = useMemo(
    () => (document?.nodes ?? []).filter((node) => !hiddenNodeIds.has(node.id)),
    [document?.nodes, hiddenNodeIds]
  );
  const minimapViewport = useMemo(() => {
    if (!document || stageViewport.width === 0 || stageViewport.height === 0) {
      return null;
    }

    const left = Math.max(0, -document.viewport.x / document.viewport.zoom);
    const top = Math.max(0, -document.viewport.y / document.viewport.zoom);
    const width = Math.min(stageWidth, stageViewport.width / document.viewport.zoom);
    const height = Math.min(stageHeight, stageViewport.height / document.viewport.zoom);
    return {
      left: left * minimapScale,
      top: top * minimapScale,
      width: width * minimapScale,
      height: height * minimapScale
    };
  }, [document, stageViewport.height, stageViewport.width]);

  function resetHistory(nextDetail: GraphDetailPayload) {
    setGraphDetail(nextDetail);
    setHistoryPast([]);
    setHistoryFuture([]);
    setDirty(false);
    setSelectedNodeId("");
    setSelectedNodeIds([]);
    setSelectedEdgeId("");
    setLinkFromNodeId("");
    setValidationIssues([]);
    setCardDrafts([]);
    setSelectionBox(null);
    setAlignmentGuides([]);
  }

  function replaceGraphSummary(summary: GraphSummaryPayload) {
    setGraphs((current) => {
      const next = current.some((graph) => graph.id === summary.id)
        ? current.map((graph) => (graph.id === summary.id ? summary : graph))
        : [summary, ...current];
      return [...next].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    });
  }

  function applyDocument(nextDocument: GraphDocumentPayload, options?: { captureHistory?: boolean; status?: string }) {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const normalized = normalizeDocument(current.id, current.currentVersion, nextDocument);
    if (options?.captureHistory !== false) {
      setHistoryPast((past) => [...past.slice(-(maxHistoryEntries - 1)), cloneDocument(current.document)]);
      setHistoryFuture([]);
    }

    const nextDetail = rebuildDetail(current, normalized);
    detailRef.current = nextDetail;
    setGraphDetail(nextDetail);
    replaceGraphSummary(nextDetail);
    setDirty(true);
    setStatusMessage(options?.status ?? "图谱有未保存的更改");
  }

  function setSingleNodeSelection(nodeId: string) {
    setSelectedNodeId(nodeId);
    setSelectedNodeIds(nodeId ? [nodeId] : []);
    setSelectedEdgeId("");
  }

  function clearNodeSelection() {
    setSelectedNodeId("");
    setSelectedNodeIds([]);
  }

  function toggleNodeInSelection(nodeId: string) {
    setSelectedNodeIds((current) => {
      if (current.includes(nodeId)) {
        const next = current.filter((item) => item !== nodeId);
        setSelectedNodeId(next[0] || "");
        return next;
      }
      const next = [...current, nodeId];
      setSelectedNodeId(nodeId);
      return next;
    });
    setSelectedEdgeId("");
  }

  function deleteSelectedNodes(nodeIds: string[]) {
    if (nodeIds.length === 0) {
      return;
    }

    mutateDocument((draft) => {
      draft.nodes = draft.nodes.filter((node) => !nodeIds.includes(node.id));
      draft.edges = draft.edges.filter(
        (edge) => !nodeIds.includes(edge.sourceNodeId) && !nodeIds.includes(edge.targetNodeId)
      );
      draft.groups = draft.groups.map((group) => ({
        ...group,
        nodeIds: group.nodeIds.filter((nodeId) => !nodeIds.includes(nodeId))
      }));
    });
    clearNodeSelection();
    setLinkFromNodeId("");
  }

  function alignSelectedNodes(direction: "left" | "top" | "center" | "middle") {
    if (selectedNodes.length < 2) {
      return;
    }

    if (direction === "left") {
      const anchor = Math.min(...selectedNodes.map((node) => node.x));
      mutateDocument((draft) => {
        draft.nodes = draft.nodes.map((node) =>
          selectedNodeIds.includes(node.id)
            ? {
                ...node,
                x: Math.max(0, Math.min(stageWidth - node.width, Number(anchor.toFixed(1))))
              }
            : node
        );
      });
      return;
    }

    if (direction === "top") {
      const anchor = Math.min(...selectedNodes.map((node) => node.y));
      mutateDocument((draft) => {
        draft.nodes = draft.nodes.map((node) =>
          selectedNodeIds.includes(node.id)
            ? {
                ...node,
                y: Math.max(0, Math.min(stageHeight - node.height, Number(anchor.toFixed(1))))
              }
            : node
        );
      });
      return;
    }

    if (direction === "center") {
      const center = selectedNodes.reduce((sum, node) => sum + node.x + node.width / 2, 0) / selectedNodes.length;
      mutateDocument((draft) => {
        draft.nodes = draft.nodes.map((node) =>
          selectedNodeIds.includes(node.id)
            ? {
                ...node,
                x: Math.max(0, Math.min(stageWidth - node.width, Number((center - node.width / 2).toFixed(1))))
              }
            : node
        );
      });
      return;
    }

    const middle = selectedNodes.reduce((sum, node) => sum + node.y + node.height / 2, 0) / selectedNodes.length;
    mutateDocument((draft) => {
      draft.nodes = draft.nodes.map((node) =>
        selectedNodeIds.includes(node.id)
          ? {
              ...node,
              y: Math.max(0, Math.min(stageHeight - node.height, Number((middle - node.height / 2).toFixed(1))))
            }
          : node
      );
    });
  }

  function distributeSelectedNodes(axis: "horizontal" | "vertical") {
    if (selectedNodes.length < 3) {
      return;
    }

    const ordered = [...selectedNodes].sort((left, right) => (axis === "horizontal" ? left.x - right.x : left.y - right.y));
    const first = ordered[0];
    const last = ordered[ordered.length - 1];
    const span = axis === "horizontal" ? last.x - first.x : last.y - first.y;
    if (span <= 0) {
      return;
    }

    const step = span / (ordered.length - 1);
    const positions = Object.fromEntries(
      ordered.map((node, index) => [
        node.id,
        axis === "horizontal"
          ? {
              x: Math.max(0, Math.min(stageWidth - node.width, Number((first.x + index * step).toFixed(1))))
            }
          : {
              y: Math.max(0, Math.min(stageHeight - node.height, Number((first.y + index * step).toFixed(1))))
            }
      ])
    );

    mutateDocument((draft) => {
      draft.nodes = draft.nodes.map((node) => {
        const position = positions[node.id];
        return position ? { ...node, ...position } : node;
      });
    });
  }

  function applyBatchTone(tone: Parameters<typeof patchNodeAppearance>[1]["tone"]) {
    mutateDocument((draft) => {
      draft.nodes = draft.nodes.map((node) =>
        selectedNodeIds.includes(node.id) ? patchNodeAppearance(node, { tone }) : node
      );
    });
  }

  function applyBatchEmphasis(emphasis: Parameters<typeof patchNodeAppearance>[1]["emphasis"]) {
    mutateDocument((draft) => {
      draft.nodes = draft.nodes.map((node) =>
        selectedNodeIds.includes(node.id) ? patchNodeAppearance(node, { emphasis }) : node
      );
    });
  }

  function applyBatchSizePreset(preset: Parameters<typeof resizeNodeToPreset>[1]) {
    mutateDocument((draft) => {
      draft.nodes = draft.nodes.map((node) =>
        selectedNodeIds.includes(node.id) ? resizeNodeToPreset(node, preset) : node
      );
    });
  }

  function mutateDocument(mutator: (draft: GraphDocumentPayload) => void, options?: { captureHistory?: boolean; status?: string }) {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const draft = cloneDocument(current.document);
    mutator(draft);
    applyDocument(draft, options);
  }

  async function loadSnapshots(graphId: string) {
    try {
      const payload = await listGraphSnapshots(props.session, graphId);
      setSnapshots(payload);
    } catch {
      setSnapshots([]);
    }
  }

  async function loadGraphWorkspace() {
    setLoading(true);
    setStatusMessage("正在同步图谱、资料、笔记和模板...");

    try {
      const [graphList, deckList, materialList, noteList, templateList] = await Promise.all([
        listGraphs(props.session),
        listDecks(props.session),
        listMaterials(),
        listNotes(props.session),
        listDiagramTemplates(props.session)
      ]);

      setDecks(deckList);
      setSelectedDraftDeckId((current) => current || deckList[0]?.id || "");
      setMaterials(materialList);
      setNotes(noteList);
      setDiagramTemplates(templateList);

      if (graphList.length === 0) {
        const created = await createGraph(props.session, {
          title: "我的知识图谱",
          description: "把资料、笔记和卡片组织到同一张学习画布里。",
          visibility: "private"
        });
        setGraphs([created]);
        const normalized = {
          ...created,
          document: normalizeDocument(created.id, created.currentVersion, created.document)
        };
        resetHistory(normalized);
        await loadSnapshots(created.id);
        setStatusMessage("已创建第一张图谱");
        return;
      }

      setGraphs(graphList);
      const initialGraphId =
        requestedGraphId && graphList.some((graph) => graph.id === requestedGraphId) ? requestedGraphId : graphList[0].id;
      const first = await getGraph(props.session, initialGraphId);
      const normalized = {
        ...first,
        document: normalizeDocument(first.id, first.currentVersion, first.document)
      };
      resetHistory(normalized);
      await loadSnapshots(initialGraphId);
      setStatusMessage("图谱工作台已就绪");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "加载图谱工作台失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadGraphWorkspace();
  }, [props.session, requestedGraphId]);

  useEffect(() => {
    if (!graphDetail || !stageRef.current || !requestedFocus) {
      return;
    }
    if (requestedGraphId && graphDetail.id !== requestedGraphId) {
      return;
    }

    focusPreviewArea(requestedFocus, graphDetail, stageRef.current, (updater) =>
      mutateDocument(updater, { captureHistory: false, status: `已定位到 ${requestedFocus.label}` })
    );
    setFocusPreview(requestedFocus);

    const timer = window.setTimeout(() => {
      setFocusPreview(null);
      navigate({ pathname: location.pathname }, { replace: true });
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [graphDetail, location.pathname, navigate, requestedFocus, requestedGraphId]);

  async function openGraph(graphId: string) {
    if (detailRef.current?.id === graphId) {
      return;
    }

    setLoading(true);
    setStatusMessage("正在切换图谱...");
    try {
      const detail = await getGraph(props.session, graphId);
      const normalized = {
        ...detail,
        document: normalizeDocument(
          detail.id,
          detail.currentVersion,
          detail.document.graphId ? detail.document : createEmptyDocument(detail.id, detail.currentVersion)
        )
      };
      resetHistory(normalized);
      await loadSnapshots(graphId);
      setStatusMessage("已切换到目标图谱");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "切换图谱失败");
    } finally {
      setLoading(false);
    }
  }

  async function saveCurrentGraph(summary: string) {
    const current = detailRef.current;
    if (!current || saving) {
      return;
    }

    setSaving(true);
    setStatusMessage("正在保存图谱...");
    try {
      const payload = await batchSaveGraph(props.session, current.id, {
        title: current.title,
        description: current.description,
        summary,
        document: normalizeDocument(current.id, current.currentVersion, current.document)
      });
      const normalized = {
        ...payload,
        document: normalizeDocument(payload.id, payload.currentVersion, payload.document)
      };
      detailRef.current = normalized;
      setGraphDetail(normalized);
      replaceGraphSummary(normalized);
      setDirty(false);
      await loadSnapshots(normalized.id);
      setStatusMessage("图谱已保存");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "保存图谱失败");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!dirty || !graphDetail) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveCurrentGraph("自动保存");
    }, autosaveDelayMs);

    return () => window.clearTimeout(timer);
  }, [dirty, graphDetail]);

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const currentDrag = dragState;
    function handlePointerMove(event: PointerEvent) {
      const current = detailRef.current;
      if (!current) {
        return;
      }

      if (currentDrag.kind === "node") {
        const rawDeltaX = (event.clientX - currentDrag.pointerX) / current.document.viewport.zoom;
        const rawDeltaY = (event.clientY - currentDrag.pointerY) / current.document.viewport.zoom;
        const movingNode = current.document.nodes.find((node) => node.id === currentDrag.nodeId);
        const stationaryNodes = current.document.nodes.filter(
          (node) => node.id !== currentDrag.nodeId && !hiddenNodeIds.has(node.id)
        );
        const snap =
          movingNode && stationaryNodes.length > 0
            ? resolveAlignmentGuides(
                buildNodeBounds({
                  ...movingNode,
                  x: currentDrag.originX + rawDeltaX,
                  y: currentDrag.originY + rawDeltaY
                }),
                stationaryNodes
              )
            : { deltaX: 0, deltaY: 0, guides: [] };
        const nextX = currentDrag.originX + rawDeltaX + snap.deltaX;
        const nextY = currentDrag.originY + rawDeltaY + snap.deltaY;
        setAlignmentGuides(snap.guides);
        mutateDocument(
          (draft) => {
            draft.nodes = draft.nodes.map((node) =>
              node.id === currentDrag.nodeId
                ? {
                    ...node,
                    x: Math.max(0, Math.min(stageWidth - node.width, Number(nextX.toFixed(1)))),
                    y: Math.max(0, Math.min(stageHeight - node.height, Number(nextY.toFixed(1))))
                  }
                : node
            );
          },
          { captureHistory: false, status: "正在调整节点位置" }
        );
        return;
      }

      if (currentDrag.kind === "multi-node") {
        const rawDeltaX = (event.clientX - currentDrag.pointerX) / current.document.viewport.zoom;
        const rawDeltaY = (event.clientY - currentDrag.pointerY) / current.document.viewport.zoom;
        const movingNodes = current.document.nodes.filter((node) => Boolean(currentDrag.origins[node.id]));
        const stationaryNodes = current.document.nodes.filter(
          (node) => !currentDrag.origins[node.id] && !hiddenNodeIds.has(node.id)
        );
        const snap =
          movingNodes.length > 0 && stationaryNodes.length > 0
            ? resolveAlignmentGuides(
                buildCombinedBounds(
                  movingNodes.map((node) => ({
                    ...node,
                    x: currentDrag.origins[node.id].x + rawDeltaX,
                    y: currentDrag.origins[node.id].y + rawDeltaY
                  }))
                ),
                stationaryNodes
              )
            : { deltaX: 0, deltaY: 0, guides: [] };
        const deltaX = rawDeltaX + snap.deltaX;
        const deltaY = rawDeltaY + snap.deltaY;
        setAlignmentGuides(snap.guides);
        mutateDocument(
          (draft) => {
            draft.nodes = draft.nodes.map((node) => {
              const origin = currentDrag.origins[node.id];
              if (!origin) {
                return node;
              }
              return {
                ...node,
                x: Math.max(0, Math.min(stageWidth - node.width, Number((origin.x + deltaX).toFixed(1)))),
                y: Math.max(0, Math.min(stageHeight - node.height, Number((origin.y + deltaY).toFixed(1))))
              };
            });
          },
          { captureHistory: false, status: "正在批量调整节点位置" }
        );
        return;
      }

      if (currentDrag.kind === "marquee") {
        setAlignmentGuides([]);
        if (!stageRef.current) {
          return;
        }
        const rect = stageRef.current.getBoundingClientRect();
        setSelectionBox(
          buildSelectionBox(
            currentDrag.startX,
            currentDrag.startY,
            event.clientX - rect.left,
            event.clientY - rect.top
          )
        );
        setDragState({
          ...currentDrag,
          currentX: event.clientX - rect.left,
          currentY: event.clientY - rect.top
        });
        return;
      }

      setAlignmentGuides([]);
      const nextViewport = {
        x: currentDrag.originX + event.clientX - currentDrag.pointerX,
        y: currentDrag.originY + event.clientY - currentDrag.pointerY
      };
      mutateDocument(
        (draft) => {
          draft.viewport = {
            ...draft.viewport,
            ...nextViewport
          };
        },
        { captureHistory: false, status: "正在调整画布视野" }
      );
    }

    function handlePointerUp() {
      if (currentDrag.kind === "marquee" && stageRef.current && detailRef.current && selectionBox) {
        const viewport = detailRef.current.document.viewport;
        const rectStart = projectClientPointToWorld(
          stageRef.current,
          viewport,
          currentDrag.startX + stageRef.current.getBoundingClientRect().left,
          currentDrag.startY + stageRef.current.getBoundingClientRect().top
        );
        const rectEnd = projectClientPointToWorld(
          stageRef.current,
          viewport,
          currentDrag.currentX + stageRef.current.getBoundingClientRect().left,
          currentDrag.currentY + stageRef.current.getBoundingClientRect().top
        );
        const left = Math.min(rectStart.x, rectEnd.x);
        const right = Math.max(rectStart.x, rectEnd.x);
        const top = Math.min(rectStart.y, rectEnd.y);
        const bottom = Math.max(rectStart.y, rectEnd.y);
        const matched = (detailRef.current.document.nodes ?? [])
          .filter((node) => !hiddenNodeIds.has(node.id))
          .filter((node) => node.x < right && node.x + node.width > left && node.y < bottom && node.y + node.height > top)
          .map((node) => node.id);
        setSelectedNodeIds(matched);
        setSelectedNodeId(matched[0] || "");
        setSelectedEdgeId("");
        setSelectionBox(null);
      }
      setAlignmentGuides([]);
      setDragState(null);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, hiddenNodeIds, selectionBox]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveCurrentGraph("手动保存");
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        if (!detailRef.current || historyPast.length === 0) {
          return;
        }

        const previous = historyPast[historyPast.length - 1];
        const current = detailRef.current;
        setHistoryPast((past) => past.slice(0, -1));
        setHistoryFuture((future) => [cloneDocument(current.document), ...future].slice(0, maxHistoryEntries));
        const nextDetail = rebuildDetail(current, cloneDocument(previous));
        detailRef.current = nextDetail;
        setGraphDetail(nextDetail);
        replaceGraphSummary(nextDetail);
        setDirty(true);
        setStatusMessage("已撤销，等待保存");
        return;
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key.toLowerCase() === "y" || (event.shiftKey && event.key.toLowerCase() === "z"))
      ) {
        event.preventDefault();
        if (!detailRef.current || historyFuture.length === 0) {
          return;
        }

        const [next, ...rest] = historyFuture;
        const current = detailRef.current;
        setHistoryPast((past) => [...past.slice(-(maxHistoryEntries - 1)), cloneDocument(current.document)]);
        setHistoryFuture(rest);
        const nextDetail = rebuildDetail(current, cloneDocument(next));
        detailRef.current = nextDetail;
        setGraphDetail(nextDetail);
        replaceGraphSummary(nextDetail);
        setDirty(true);
        setStatusMessage("已重做，等待保存");
        return;
      }

      if (event.key === "Delete") {
        if (selectedNodeIds.length > 0) {
          event.preventDefault();
          deleteSelectedNodes(selectedNodeIds);
          return;
        }

        if (selectedEdgeId) {
          event.preventDefault();
          mutateDocument((draft) => {
            draft.edges = draft.edges.filter((edge) => edge.id !== selectedEdgeId);
          });
          setSelectedEdgeId("");
        }
      }

      if (event.key === "Escape") {
        setLinkFromNodeId("");
        setSelectionBox(null);
        setAlignmentGuides([]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedNodes, historyFuture, historyPast, selectedEdgeId, selectedNodeIds]);

  function createNode(type: "text" | "rich-note" | "material" | "card", source?: GraphNodePayload["source"]) {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const position = defaultNodePosition(current.document.nodes.length);
    const titleByType: Record<string, string> = {
      text: "新概念",
      "rich-note": source?.label || "笔记节点",
      material: source?.label || "资料节点",
      card: source?.label || "复习卡片"
    };

    const nextNode: GraphNodePayload = {
      id: randomId("node"),
      type,
      title: titleByType[type],
      x: position.x,
      y: position.y,
      width: type === "text" ? 220 : 250,
      height: type === "card" ? 110 : 132,
      source: source ?? null,
      metadata: {}
    };

    mutateDocument((draft) => {
      draft.nodes.push(nextNode);
    });
    setSingleNodeSelection(nextNode.id);
    setLinkFromNodeId("");
  }

  function addMaterialNode(material: MaterialPayload) {
    createNode("material", {
      type: "material",
      id: material.id,
      label: material.title,
      excerpt: material.description
    });
  }

  function addNoteNode(note: NotePayload) {
    createNode("rich-note", {
      type: "note",
      id: note.id,
      label: note.title,
      excerpt: note.summary
    });
  }

  function handleCanvasPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!document || event.target !== event.currentTarget || event.button !== 0) {
      return;
    }

    setContextMenu(null);
    clearNodeSelection();
    setSelectedEdgeId("");
    setLinkFromNodeId("");
    setAlignmentGuides([]);
    if (event.shiftKey && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const startX = event.clientX - rect.left;
      const startY = event.clientY - rect.top;
      setSelectionBox({ left: startX, top: startY, width: 0, height: 0 });
      setDragState({
        kind: "marquee",
        startX,
        startY,
        currentX: startX,
        currentY: startY
      });
      return;
    }
    setDragState({
      kind: "pan",
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: document.viewport.x,
      originY: document.viewport.y
    });
  }

  function handleNodePointerDown(event: React.PointerEvent<HTMLButtonElement>, node: GraphNodePayload) {
    event.stopPropagation();
    if (event.button !== 0) {
      return;
    }
    if (linkFromNodeId && linkFromNodeId !== node.id) {
      return;
    }

    setContextMenu(null);
    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      toggleNodeInSelection(node.id);
      return;
    }

    const nextSelection = selectedNodeIds.includes(node.id) ? selectedNodeIds : [node.id];
    setSelectedNodeIds(nextSelection);
    setSelectedNodeId(node.id);
    setSelectedEdgeId("");
    const currentDetail = detailRef.current;
    if (currentDetail) {
      setHistoryPast((past) => [...past.slice(-(maxHistoryEntries - 1)), cloneDocument(currentDetail.document)]);
      setHistoryFuture([]);
    }
    if (nextSelection.length > 1) {
      const origins = Object.fromEntries(
        nextSelection
          .map((nodeId) => {
            const item = currentDetail?.document.nodes.find((currentNode) => currentNode.id === nodeId);
            return item ? [nodeId, { x: item.x, y: item.y }] : null;
          })
          .filter(Boolean) as Array<[string, { x: number; y: number }]>
      );
      setDragState({
        kind: "multi-node",
        nodeIds: nextSelection,
        pointerX: event.clientX,
        pointerY: event.clientY,
        origins
      });
      return;
    }
    setDragState({
      kind: "node",
      nodeId: node.id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: node.x,
      originY: node.y
    });
  }

  function handleNodeClick(nodeId: string, event?: React.MouseEvent<HTMLButtonElement>) {
    setContextMenu(null);
    if (linkFromNodeId && linkFromNodeId !== nodeId) {
      const current = detailRef.current;
      if (!current || linkFromNodeId === nodeId) {
        return;
      }

      const exists = current.document.edges.some(
        (edge) => edge.sourceNodeId === linkFromNodeId && edge.targetNodeId === nodeId
      );
      if (exists) {
        setStatusMessage("这两个节点之间已经有连线了");
        setLinkFromNodeId("");
        return;
      }

      const nextEdge: GraphEdgePayload = {
        id: randomId("edge"),
        kind: "straight",
        sourceNodeId: linkFromNodeId,
        targetNodeId: nodeId,
        label: "关联",
        metadata: {}
      };

      mutateDocument((draft) => {
        draft.edges.push(nextEdge);
      });
      setSelectedEdgeId(nextEdge.id);
      clearNodeSelection();
      setLinkFromNodeId("");
      return;
    }

    if (event?.shiftKey || event?.metaKey || event?.ctrlKey) {
      toggleNodeInSelection(nodeId);
      return;
    }

    setSingleNodeSelection(nodeId);
  }

  function openContextMenu(
    event: React.MouseEvent<HTMLElement | SVGPathElement>,
    payload?: { nodeId?: string; edgeId?: string }
  ) {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: payload?.nodeId,
      edgeId: payload?.edgeId
    });
    if (payload?.nodeId) {
      setSingleNodeSelection(payload.nodeId);
    }
    if (payload?.edgeId) {
      setSelectedEdgeId(payload.edgeId);
      clearNodeSelection();
    }
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    mutateDocument(
      (draft) => {
        draft.viewport.zoom = clampZoom(draft.viewport.zoom + (event.deltaY < 0 ? 0.08 : -0.08));
      },
      { captureHistory: false, status: "已调整缩放，等待保存" }
    );
  }

  function createGroupForNode(node: GraphNodePayload) {
    const nextGroup: GraphGroupPayload = {
      id: randomId("group"),
      title: `${node.title} 分组`,
      nodeIds: [node.id],
      x: Math.max(0, node.x - 36),
      y: Math.max(0, node.y - 46),
      width: node.width + 72,
      height: node.height + 88,
      collapsed: false
    };

    mutateDocument((draft) => {
      draft.groups.push(nextGroup);
    });
    setSingleNodeSelection(node.id);
    setStatusMessage("已基于当前节点创建分组");
  }

  function createGroupFromSelectedNode() {
    if (selectedNodes.length === 0) {
      return;
    }
    if (selectedNodes.length === 1) {
      createGroupForNode(selectedNodes[0]);
      return;
    }

    const left = Math.min(...selectedNodes.map((node) => node.x));
    const top = Math.min(...selectedNodes.map((node) => node.y));
    const right = Math.max(...selectedNodes.map((node) => node.x + node.width));
    const bottom = Math.max(...selectedNodes.map((node) => node.y + node.height));
    const nextGroup: GraphGroupPayload = {
      id: randomId("group"),
      title: `${selectedNodes[0].title} 等 ${selectedNodes.length} 个节点`,
      nodeIds: selectedNodes.map((node) => node.id),
      x: Math.max(0, left - 36),
      y: Math.max(0, top - 46),
      width: right - left + 72,
      height: bottom - top + 88,
      collapsed: false
    };

    mutateDocument((draft) => {
      draft.groups.push(nextGroup);
    });
    setStatusMessage(`已为 ${selectedNodes.length} 个节点创建分组`);
  }

  function toggleGroupCollapse(groupId: string) {
    mutateDocument(
      (draft) => {
        draft.groups = draft.groups.map((group) =>
          group.id === groupId ? { ...group, collapsed: !group.collapsed } : group
        );
      },
      { status: "已切换分组折叠状态" }
    );
  }

  function focusNode(node: GraphNodePayload) {
    if (!detailRef.current || !stageRef.current) {
      return;
    }

    const viewportWidth = stageRef.current.clientWidth;
    const viewportHeight = stageRef.current.clientHeight;
    const nextX = viewportWidth / 2 - (node.x + node.width / 2) * detailRef.current.document.viewport.zoom;
    const nextY = viewportHeight / 2 - (node.y + node.height / 2) * detailRef.current.document.viewport.zoom;

    mutateDocument(
      (draft) => {
        draft.viewport.x = nextX;
        draft.viewport.y = nextY;
      },
      { captureHistory: false, status: `已定位到节点：${node.title}` }
    );
    setSingleNodeSelection(node.id);
  }

  function handleLocateNode() {
    const keyword = graphSearch.trim().toLowerCase();
    if (!keyword) {
      return;
    }

    const node = visibleNodes.find((item) => {
      const title = item.title.toLowerCase();
      const sourceLabel = item.source?.label?.toLowerCase() ?? "";
      return title.includes(keyword) || sourceLabel.includes(keyword);
    });
    if (!node) {
      setStatusMessage("没有找到匹配的节点");
      return;
    }

    focusNode(node);
  }

  async function handleExportPng() {
    if (!graphDetail) {
      return;
    }

    try {
      const svg = buildSvgExport(graphDetail, nodeMap, hiddenNodeIds);
      const image = new Image();
      const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("png_export_failed"));
        image.src = url;
      });

      const canvas = window.document.createElement("canvas");
      canvas.width = stageWidth;
      canvas.height = stageHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("png_export_failed");
      }

      context.fillStyle = "#f9f6ef";
      context.fillRect(0, 0, stageWidth, stageHeight);
      context.drawImage(image, 0, 0, stageWidth, stageHeight);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result: Blob | null) => {
          if (result) {
            resolve(result);
            return;
          }
          reject(new Error("png_export_failed"));
        }, "image/png");
      });

      const safeName = graphDetail.title.replace(/[\\/:*?"<>|]/g, "-");
      downloadBlob(`${safeName || "graph"}.png`, blob);
      setStatusMessage("已导出 PNG 图谱");
      URL.revokeObjectURL(url);
    } catch {
      setStatusMessage("导出 PNG 失败");
    }
  }

  function handleExportSvg() {
    if (!graphDetail) {
      return;
    }

    const svg = buildSvgExport(graphDetail, nodeMap, hiddenNodeIds);
    const safeName = graphDetail.title.replace(/[\\/:*?"<>|]/g, "-");
    downloadTextFile(`${safeName || "graph"}.svg`, svg, "image/svg+xml;charset=utf-8");
    setStatusMessage("已导出 SVG 图谱");
  }

  function duplicateNode(nodeId: string) {
    const source = detailRef.current?.document.nodes.find((node) => node.id === nodeId);
    if (!source) {
      return;
    }

    const duplicated: GraphNodePayload = {
      ...source,
      id: randomId("node"),
      title: `${buildNodeTitle(source)} 副本`,
      x: Math.min(stageWidth - source.width, source.x + 36),
      y: Math.min(stageHeight - source.height, source.y + 28),
      source: source.source ? { ...source.source } : null,
      metadata: source.metadata ? { ...source.metadata } : {}
    };

    mutateDocument((draft) => {
      draft.nodes.push(duplicated);
    });
    setSelectedNodeId(duplicated.id);
    setSelectedEdgeId("");
    setStatusMessage("已复制节点");
  }

  async function handleImport() {
    if (!graphDetail) {
      return;
    }

    if (!importSource.trim()) {
      setStatusMessage("先填写 Markdown 或 Mermaid 内容");
      return;
    }

    setSaving(true);
    try {
      const payload =
        importMode === "markdown"
          ? await importGraphMarkdown(props.session, graphDetail.id, importSource)
          : await importGraphMermaid(props.session, graphDetail.id, importSource);
      const normalized = {
        ...payload,
        document: normalizeDocument(payload.id, payload.currentVersion, payload.document)
      };
      resetHistory(normalized);
      await loadSnapshots(normalized.id);
      setStatusMessage(importMode === "markdown" ? "已导入 Markdown 大纲" : "已导入 Mermaid 草稿");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "导入图谱失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleRestoreSnapshot(versionNumber: number) {
    if (!graphDetail) {
      return;
    }

    setSaving(true);
    try {
      const payload = await restoreGraphSnapshot(props.session, graphDetail.id, versionNumber);
      const normalized = {
        ...payload,
        document: normalizeDocument(payload.id, payload.currentVersion, payload.document)
      };
      resetHistory(normalized);
      await loadSnapshots(normalized.id);
      setStatusMessage(`已恢复到快照版本 ${versionNumber}`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "恢复图谱快照失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleValidateGraph() {
    if (!graphDetail) {
      return;
    }

    try {
      const payload = await validateGraph(props.session, graphDetail.id);
      setValidationIssues(payload.issues);
      setStatusMessage(payload.issues.length ? `发现 ${payload.issues.length} 条校验提示` : "图谱校验通过");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "图谱校验失败");
    }
  }

  async function handleGenerateCards() {
    if (!graphDetail || !selectedNode) {
      setStatusMessage("先选中一个节点，再生成卡片草稿");
      return;
    }

    try {
      const payload = await generateGraphCardDrafts(props.session, graphDetail.id, [selectedNode.id]);
      setCardDrafts(payload);
      setStatusMessage(payload.length ? "已生成卡片草稿" : "没有生成新的卡片草稿");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "生成卡片草稿失败");
    }
  }

  async function handleCommitCardDrafts() {
    if (!graphDetail || cardDrafts.length === 0) {
      setStatusMessage("先生成卡片草稿，再确认写入卡组。");
      return;
    }
    if (!selectedDraftDeckId) {
      setStatusMessage("先选择一个目标卡组。");
      return;
    }

    setSaving(true);
    try {
      const payload = await commitGraphCardDrafts(props.session, graphDetail.id, {
        deckId: selectedDraftDeckId,
        drafts: cardDrafts
      });
      setCardDrafts([]);
      const targetDeck = decks.find((deck) => deck.id === selectedDraftDeckId);
      setDecks((current) =>
        current.map((deck) =>
          deck.id === selectedDraftDeckId
            ? { ...deck, cardCount: deck.cardCount + payload.length, updatedAt: new Date().toISOString() }
            : deck
        )
      );
      setStatusMessage(`已将 ${payload.length} 张卡片写入 ${targetDeck?.title || "目标卡组"}。`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "写入卡片失败");
    } finally {
      setSaving(false);
    }
  }

  function handleDraftFieldChange(draftId: string, field: "front" | "back", value: string) {
    setCardDrafts((current) =>
      current.map((draft) => (draft.id === draftId ? { ...draft, [field]: value } : draft))
    );
  }

  function applyTemplate(template: DiagramTemplatePayload) {
    setImportMode("markdown");
    setImportSource(
      template.sampleLines.map((line, index) => `${index === 0 ? "#" : "##"} ${line}`).join("\n")
    );
    setStatusMessage(`已把模板“${template.name}”放入导入面板`);
  }

  async function handleCreateGraph() {
    setSaving(true);
    try {
      const payload = await createGraph(props.session, {
        title: `知识图谱 ${graphs.length + 1}`,
        description: "新建图谱工作区",
        visibility: "private"
      });
      const normalized = {
        ...payload,
        document: normalizeDocument(payload.id, payload.currentVersion, payload.document)
      };
      replaceGraphSummary(payload);
      resetHistory(normalized);
      await loadSnapshots(normalized.id);
      setStatusMessage("已创建新图谱");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "创建图谱失败");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCurrentGraph() {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    if (!window.confirm(`确定删除图谱“${current.title}”吗？`)) {
      return;
    }

    setSaving(true);
    try {
      await deleteGraph(props.session, current.id);
      const remaining = graphs.filter((graph) => graph.id !== current.id);
      if (remaining.length > 0) {
        setGraphs(remaining);
        await openGraph(remaining[0].id);
      } else {
        setGraphs([]);
        setGraphDetail(null);
        await handleCreateGraph();
      }
      setStatusMessage("图谱已删除");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "删除图谱失败");
    } finally {
      setSaving(false);
    }
  }

  const visibleMaterials = materials.slice(0, 6);
  const visibleNotes = notes.slice(0, 6);

  return (
    <>
      <header className="workspace-header">
        <div>
          <p className="eyebrow">图谱画布</p>
          <h1>把资料、笔记和复习线索组织到同一张学习地图里</h1>
          <p className="header-copy">
            当前工作台已经跨到图谱产品化阶段：支持分组、搜索定位、快照恢复、Markdown/Mermaid 导入、SVG 导出和卡片草稿生成。
          </p>
        </div>
        <div className="header-actions">
          <button className="secondary-button" disabled={saving} onClick={() => void handleCreateGraph()} type="button">
            <Plus size={16} />
            新建图谱
          </button>
          <button className="primary-button" disabled={!graphDetail || saving} onClick={() => void saveCurrentGraph("手动保存")} type="button">
            <Save size={16} />
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </header>

      <div className="graph-workspace-grid">
        <section className="graph-rail">
          <div className="graph-rail-section">
            <div className="section-frame-head compact">
              <div>
                <p className="eyebrow">图谱列表</p>
                <h2>学习工作区</h2>
              </div>
            </div>
            <div className="graph-list">
              {graphs.map((graph) => (
                <button
                  className={graph.id === graphDetail?.id ? "graph-list-item active" : "graph-list-item"}
                  key={graph.id}
                  onClick={() => void openGraph(graph.id)}
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
              {visibleMaterials.map((material) => (
                <button className="graph-source-item" key={material.id} onClick={() => addMaterialNode(material)} type="button">
                  <BookOpen size={15} />
                  <div>
                    <strong>{material.title}</strong>
                    <span>{material.category || "资料"}</span>
                  </div>
                </button>
              ))}
              {visibleNotes.map((note) => (
                <button className="graph-source-item" key={note.id} onClick={() => addNoteNode(note)} type="button">
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
                <p className="eyebrow">工程模板</p>
                <h2>Diagram 模式</h2>
              </div>
            </div>
            <div className="graph-template-list">
              {diagramTemplates.map((template) => (
                <button className="graph-template-card" key={template.id} onClick={() => applyTemplate(template)} type="button">
                  <strong>{template.name}</strong>
                  <span>{template.description}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="graph-stage-panel">
          <div className="graph-toolbar">
            <div className="graph-toolbar-group">
              <button className="icon-button" disabled={!graphDetail} onClick={() => createNode("text")} title="新建概念节点" type="button">
                <Plus size={16} />
              </button>
              <button className="icon-button" disabled={!graphDetail} onClick={() => createNode("rich-note")} title="新建笔记节点" type="button">
                <NotebookPen size={16} />
              </button>
              <button className="icon-button" disabled={!graphDetail} onClick={() => createNode("material")} title="新建资料节点" type="button">
                <BookOpen size={16} />
              </button>
              <button className="icon-button" disabled={selectedNodeIds.length === 0} onClick={createGroupFromSelectedNode} title="基于选中节点创建分组" type="button">
                <Layers3 size={16} />
              </button>
            </div>

            <div className="graph-toolbar-group">
              <button
                className="icon-button"
                disabled={historyPast.length === 0}
                onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "z", ctrlKey: true }))}
                title="撤销"
                type="button"
              >
                <Undo2 size={16} />
              </button>
              <button
                className="icon-button"
                disabled={historyFuture.length === 0}
                onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "y", ctrlKey: true }))}
                title="重做"
                type="button"
              >
                <Redo2 size={16} />
              </button>
              <button
                className={linkFromNodeId ? "icon-button active" : "icon-button"}
                disabled={selectedNodeIds.length !== 1 || !selectedNode}
                onClick={() => setLinkFromNodeId((current) => (current ? "" : selectedNodeId))}
                title="连接选中节点"
                type="button"
              >
                <Link2 size={16} />
              </button>
              <button
                className="icon-button"
                disabled={selectedNodeIds.length === 0 && !selectedEdge}
                onClick={() => {
                  if (selectedNodeIds.length > 0) {
                    deleteSelectedNodes(selectedNodeIds);
                    return;
                  }

                  if (selectedEdgeId) {
                    mutateDocument((draft) => {
                      draft.edges = draft.edges.filter((edge) => edge.id !== selectedEdgeId);
                    });
                    setSelectedEdgeId("");
                  }
                }}
                title="删除选中项"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="graph-toolbar-group">
              <label className="search-field narrow graph-search-field">
                <Search size={16} />
                <input
                  onChange={(event) => setGraphSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleLocateNode();
                    }
                  }}
                  placeholder="搜索节点"
                  value={graphSearch}
                />
              </label>
              <button className="icon-button" disabled={!graphSearch.trim()} onClick={handleLocateNode} title="搜索定位" type="button">
                <ScanSearch size={16} />
              </button>
              <button className="icon-button" disabled={!graphDetail} onClick={() => void handleExportPng()} title="导出 PNG" type="button">
                <Download size={16} />
              </button>
              <button className="icon-button" disabled={!graphDetail} onClick={handleExportSvg} title="导出 SVG" type="button">
                <FileDown size={16} />
              </button>
              <button
                className="icon-button"
                disabled={!graphDetail}
                onClick={() =>
                  mutateDocument(
                    (draft) => {
                      draft.viewport.zoom = clampZoom(draft.viewport.zoom - 0.1);
                    },
                    { captureHistory: false, status: "已缩小画布" }
                  )
                }
                title="缩小"
                type="button"
              >
                <ZoomOut size={16} />
              </button>
              <button
                className="icon-button"
                disabled={!graphDetail}
                onClick={() =>
                  mutateDocument(
                    (draft) => {
                      draft.viewport.zoom = clampZoom(draft.viewport.zoom + 0.1);
                    },
                    { captureHistory: false, status: "已放大画布" }
                  )
                }
                title="放大"
                type="button"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          <div className="graph-stage-shell">
            <div className="graph-stage-status">
              <span>{loading ? "加载中..." : statusMessage}</span>
              {graphDetail ? (
                <small>
                  版本 {graphDetail.currentVersion} · {graphDetail.nodeCount} 节点 · {graphDetail.edgeCount} 连线
                  {selectedNodeIds.length > 1 ? ` · 已选 ${selectedNodeIds.length} 个节点` : ""}
                </small>
              ) : null}
            </div>

            <div
              className="graph-stage"
              onContextMenu={(event) => openContextMenu(event)}
              onPointerDown={handleCanvasPointerDown}
              onWheel={handleWheel}
              ref={stageRef}
            >
              {graphDetail && document ? (
                <>
                  <div
                    className="graph-world"
                    style={{
                      width: stageWidth,
                      height: stageHeight,
                      transform: `translate(${document.viewport.x}px, ${document.viewport.y}px) scale(${document.viewport.zoom})`
                    }}
                  >
                    {document.groups.map((group) => (
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
                              toggleGroupCollapse(group.id);
                            }}
                            type="button"
                          >
                            {group.collapsed ? "展开" : "折叠"}
                          </button>
                        </div>
                      </div>
                    ))}

                    <svg className="graph-edge-layer" viewBox={`0 0 ${stageWidth} ${stageHeight}`}>
                      {document.edges
                        .filter((edge) => !hiddenNodeIds.has(edge.sourceNodeId) && !hiddenNodeIds.has(edge.targetNodeId))
                        .map((edge) => {
                          const labelPoint = buildEdgeLabelPosition(edge, nodeMap);
                          const isActive = selectedEdgeId === edge.id;
                          return (
                            <g key={edge.id}>
                              <path
                                className={isActive ? "graph-edge active" : "graph-edge"}
                                d={buildEdgePath(edge, nodeMap)}
                                markerEnd="url(#graph-arrow)"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedEdgeId(edge.id);
                                  clearNodeSelection();
                                }}
                                onContextMenu={(event) => openContextMenu(event, { edgeId: edge.id })}
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

                    {visibleNodes.map((node) => (
                      <button
                        className={[
                          "graph-node",
                          `type-${node.type}`,
                          selectedNodeIds.includes(node.id) ? "active" : "",
                          linkFromNodeId === node.id ? "linking" : ""
                        ].join(" ").trim()}
                        key={node.id}
                        onClick={(event) => handleNodeClick(node.id, event)}
                        onContextMenu={(event) => openContextMenu(event, { nodeId: node.id })}
                        onPointerDown={(event) => handleNodePointerDown(event, node)}
                        style={{
                          ...buildNodeStyle(node, selectedNodeIds.includes(node.id)),
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
                    ))}

                    {focusPreview ? (
                      <div
                        className="graph-focus-preview"
                        style={{
                          width: focusPreview.width,
                          height: focusPreview.height,
                          transform: `translate(${focusPreview.x}px, ${focusPreview.y}px)`
                        }}
                      >
                        <span>{focusPreview.label}</span>
                      </div>
                    ) : null}
                    {alignmentGuides.map((guide, index) => (
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

                  {selectionBox ? (
                    <div
                      className="graph-selection-box"
                      style={{
                        left: selectionBox.left,
                        top: selectionBox.top,
                        width: selectionBox.width,
                        height: selectionBox.height
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

                  <aside className="graph-minimap">
                    <div className="graph-minimap-world" style={{ width: stageWidth * minimapScale, height: stageHeight * minimapScale }}>
                      {document.groups.map((group) => (
                        <div
                          className={group.collapsed ? "graph-minimap-group collapsed" : "graph-minimap-group"}
                          key={group.id}
                          style={{
                            left: group.x * minimapScale,
                            top: group.y * minimapScale,
                            width: group.width * minimapScale,
                            height: group.height * minimapScale
                          }}
                        />
                      ))}
                      {visibleNodes.map((node) => (
                        <span
                          className={selectedNodeIds.includes(node.id) ? "graph-minimap-node active" : "graph-minimap-node"}
                          key={node.id}
                          style={{
                            left: node.x * minimapScale,
                            top: node.y * minimapScale,
                            width: Math.max(6, node.width * minimapScale),
                            height: Math.max(6, node.height * minimapScale)
                          }}
                        />
                      ))}
                      {minimapViewport ? (
                        <div
                          className="graph-minimap-viewport"
                          style={{
                            left: minimapViewport.left,
                            top: minimapViewport.top,
                            width: minimapViewport.width,
                            height: minimapViewport.height
                          }}
                        />
                      ) : null}
                    </div>
                  </aside>
                  {contextMenu ? (
                    <div className="graph-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
                      {contextMenu.nodeId ? (
                        <>
                          <button
                            className="graph-context-item"
                            onClick={() => {
                              const node = nodeMap.get(contextMenu.nodeId || "");
                              if (node) {
                                focusNode(node);
                              }
                              setContextMenu(null);
                            }}
                            type="button"
                          >
                            聚焦节点
                          </button>
                          <button
                            className="graph-context-item"
                            onClick={() => {
                              duplicateNode(contextMenu.nodeId || "");
                              setContextMenu(null);
                            }}
                            type="button"
                          >
                            复制节点
                          </button>
                          <button
                            className="graph-context-item"
                            onClick={() => {
                              const node = nodeMap.get(contextMenu.nodeId || "");
                              if (node) {
                                createGroupForNode(node);
                              }
                              setContextMenu(null);
                            }}
                            type="button"
                          >
                            建立分组
                          </button>
                          <button
                            className="graph-context-item"
                            onClick={() => {
                              setLinkFromNodeId((current) => (current === contextMenu.nodeId ? "" : contextMenu.nodeId || ""));
                              setSingleNodeSelection(contextMenu.nodeId || "");
                              setContextMenu(null);
                            }}
                            type="button"
                          >
                            {linkFromNodeId === contextMenu.nodeId ? "取消连线起点" : "设为连线起点"}
                          </button>
                          {(() => {
                            const node = nodeMap.get(contextMenu.nodeId || "");
                            const target = node ? buildNodeSourceTarget(node) : "";
                            if (!target) {
                              return null;
                            }
                            return (
                              <button
                                className="graph-context-item"
                                onClick={() => {
                                  navigate(target);
                                  setContextMenu(null);
                                }}
                                type="button"
                              >
                                打开来源
                              </button>
                            );
                          })()}
                          <button
                            className="graph-context-item danger"
                            onClick={() => {
                              const nodeId = contextMenu.nodeId || "";
                              mutateDocument((draft) => {
                                draft.nodes = draft.nodes.filter((node) => node.id !== nodeId);
                                draft.edges = draft.edges.filter(
                                  (edge) => edge.sourceNodeId !== nodeId && edge.targetNodeId !== nodeId
                                );
                                draft.groups = draft.groups.map((group) => ({
                                  ...group,
                                  nodeIds: group.nodeIds.filter((item) => item !== nodeId)
                                }));
                              });
                              setSelectedNodeId("");
                              setContextMenu(null);
                            }}
                            type="button"
                          >
                            删除节点
                          </button>
                        </>
                      ) : contextMenu.edgeId ? (
                        <>
                          <button
                            className="graph-context-item"
                            onClick={() => {
                              mutateDocument((draft) => {
                                draft.edges = draft.edges.map((edge) =>
                                  edge.id === contextMenu.edgeId
                                    ? { ...edge, kind: edge.kind === "curve" ? "straight" : "curve" }
                                    : edge
                                );
                              });
                              setContextMenu(null);
                            }}
                            type="button"
                          >
                            切换直线/曲线
                          </button>
                          <button
                            className="graph-context-item danger"
                            onClick={() => {
                              mutateDocument((draft) => {
                                draft.edges = draft.edges.filter((edge) => edge.id !== contextMenu.edgeId);
                              });
                              setSelectedEdgeId("");
                              setContextMenu(null);
                            }}
                            type="button"
                          >
                            删除连线
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="graph-context-item"
                            onClick={() => {
                              createNode("text");
                              setContextMenu(null);
                            }}
                            type="button"
                          >
                            新建概念节点
                          </button>
                          <button
                            className="graph-context-item"
                            onClick={() => {
                              createNode("rich-note");
                              setContextMenu(null);
                            }}
                            type="button"
                          >
                            新建笔记节点
                          </button>
                          <button
                            className="graph-context-item"
                            onClick={() => {
                              createNode("material");
                              setContextMenu(null);
                            }}
                            type="button"
                          >
                            新建资料节点
                          </button>
                          <button
                            className="graph-context-item"
                            onClick={() => {
                              void handleExportPng();
                              setContextMenu(null);
                            }}
                            type="button"
                          >
                            导出 PNG
                          </button>
                        </>
                      )}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="graph-stage-empty">
                  <MousePointer2 size={18} />
                  <span>正在准备图谱画布...</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="graph-inspector">
          <div className="graph-rail-section">
            <div className="section-frame-head compact">
              <div>
                <p className="eyebrow">图谱信息</p>
                <h2>当前画布</h2>
              </div>
            </div>

            {graphDetail ? (
              <div className="graph-form-stack">
                <label>
                  <span>标题</span>
                  <input
                    onChange={(event) => {
                      const current = detailRef.current;
                      if (!current) {
                        return;
                      }
                      const nextDetail = { ...current, title: event.target.value };
                      detailRef.current = nextDetail;
                      setGraphDetail(nextDetail);
                      replaceGraphSummary(nextDetail);
                      setDirty(true);
                    }}
                    value={graphDetail.title}
                  />
                </label>
                <label>
                  <span>说明</span>
                  <textarea
                    onChange={(event) => {
                      const current = detailRef.current;
                      if (!current) {
                        return;
                      }
                      const nextDetail = { ...current, description: event.target.value };
                      detailRef.current = nextDetail;
                      setGraphDetail(nextDetail);
                      replaceGraphSummary(nextDetail);
                      setDirty(true);
                    }}
                    rows={4}
                    value={graphDetail.description}
                  />
                </label>
                <button className="secondary-button danger" disabled={saving} onClick={() => void handleDeleteCurrentGraph()} type="button">
                  <Trash2 size={16} />
                  删除当前图谱
                </button>
              </div>
            ) : null}
          </div>

          <div className="graph-rail-section">
            <div className="section-frame-head compact">
              <div>
                <p className="eyebrow">导入与校验</p>
                <h2>Phase 5 / 8</h2>
              </div>
            </div>

            <div className="graph-segmented">
              <button
                className={importMode === "markdown" ? "ghost-button active" : "ghost-button"}
                onClick={() => setImportMode("markdown")}
                type="button"
              >
                Markdown
              </button>
              <button
                className={importMode === "mermaid" ? "ghost-button active" : "ghost-button"}
                onClick={() => setImportMode("mermaid")}
                type="button"
              >
                Mermaid
              </button>
            </div>

            <textarea
              className="graph-import-input"
              onChange={(event) => setImportSource(event.target.value)}
              rows={8}
              value={importSource}
            />

            <div className="graph-inline-actions">
              <button className="secondary-button" disabled={!graphDetail || saving} onClick={() => void handleImport()} type="button">
                <FileDown size={16} />
                导入草稿
              </button>
              <button className="secondary-button" disabled={!graphDetail} onClick={() => void handleValidateGraph()} type="button">
                <ScanSearch size={16} />
                校验图谱
              </button>
            </div>

            {validationIssues.length ? (
              <div className="graph-issue-list">
                {validationIssues.map((issue) => (
                  <article className={`graph-issue-item ${issue.severity}`} key={`${issue.ruleType}-${issue.targetId || issue.message}`}>
                    <strong>{issue.ruleType}</strong>
                    <span>{issue.message}</span>
                  </article>
                ))}
              </div>
            ) : (
              <article className="graph-meta-card muted">
                <strong>校验结果</strong>
                <p>这里会显示悬空连线、空标题等图谱结构问题。</p>
              </article>
            )}
          </div>

          <div className="graph-rail-section">
            <div className="section-frame-head compact">
              <div>
                <p className="eyebrow">快照与草稿</p>
                <h2>Phase 5 / 6</h2>
              </div>
            </div>

            <div className="graph-inline-actions">
              <button className="secondary-button" disabled={!selectedNode} onClick={() => void handleGenerateCards()} type="button">
                <Sparkles size={16} />
                生成卡片草稿
              </button>
            </div>

            {cardDrafts.length ? (
              <>
                <div className="graph-form-stack">
                  <label>
                    <span>写入卡组</span>
                    <select onChange={(event) => setSelectedDraftDeckId(event.target.value)} value={selectedDraftDeckId}>
                      <option value="">请选择一个 deck</option>
                      {decks.map((deck) => (
                        <option key={deck.id} value={deck.id}>
                          {deck.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="secondary-button" disabled={!selectedDraftDeckId || saving} onClick={() => void handleCommitCardDrafts()} type="button">
                    <BookOpen size={16} />
                    确认写入卡组
                  </button>
                </div>

                <div className="graph-card-draft-list">
                  {cardDrafts.map((draft) => (
                    <article className="graph-card-draft" key={draft.id}>
                      <label>
                        <span>问题</span>
                        <input
                          onChange={(event) => handleDraftFieldChange(draft.id, "front", event.target.value)}
                          value={draft.front}
                        />
                      </label>
                      <label>
                        <span>答案</span>
                        <textarea
                          onChange={(event) => handleDraftFieldChange(draft.id, "back", event.target.value)}
                          rows={4}
                          value={draft.back}
                        />
                      </label>
                      {draft.explanation ? <small>{draft.explanation}</small> : null}
                    </article>
                  ))}
                </div>
              </>
            ) : !decks.length ? (
              <article className="graph-meta-card muted">
                <strong>卡组准备</strong>
                <p>先去复习页创建一个 deck，这里就能把图谱草稿确认写进去。</p>
              </article>
            ) : null}

            <div className="graph-snapshot-list">
              {snapshots.map((snapshot) => (
                <article className="graph-snapshot-item" key={snapshot.id}>
                  <div>
                    <strong>v{snapshot.versionNumber}</strong>
                    <span>{snapshot.summary || "图谱变更"}</span>
                  </div>
                  <button className="ghost-button" disabled={saving} onClick={() => void handleRestoreSnapshot(snapshot.versionNumber)} type="button">
                    恢复
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div className="graph-rail-section">
            <div className="section-frame-head compact">
              <div>
                <p className="eyebrow">选中内容</p>
                <h2>节点与连线</h2>
              </div>
            </div>

            {selectedNodes.length > 1 ? (
              <div className="graph-form-stack">
                <article className="graph-meta-card">
                  <strong>已选中 {selectedNodes.length} 个节点</strong>
                  <p>可以直接批量拖动、按 Delete 删除，或用上方工具栏把它们整理进同一个分组。</p>
                </article>
                <div className="graph-inline-actions">
                  <button className="secondary-button" onClick={createGroupFromSelectedNode} type="button">
                    <Layers3 size={16} />
                    为选中节点建组
                  </button>
                  <button className="secondary-button" onClick={() => alignSelectedNodes("left")} type="button">
                    宸﹀榻?
                  </button>
                  <button className="secondary-button" onClick={() => alignSelectedNodes("top")} type="button">
                    椤堕儴瀵归綈
                  </button>
                  <button className="secondary-button" onClick={() => alignSelectedNodes("center")} type="button">
                    姘村钩灞呬腑
                  </button>
                  <button className="secondary-button" onClick={() => alignSelectedNodes("middle")} type="button">
                    鍨傜洿灞呬腑
                  </button>
                  <button className="secondary-button" disabled={selectedNodes.length < 3} onClick={() => distributeSelectedNodes("horizontal")} type="button">
                    妯悜鍧囧垎
                  </button>
                  <button className="secondary-button" disabled={selectedNodes.length < 3} onClick={() => distributeSelectedNodes("vertical")} type="button">
                    绾靛悜鍧囧垎
                  </button>
                  <button className="secondary-button" onClick={() => deleteSelectedNodes(selectedNodeIds)} type="button">
                    <Trash2 size={16} />
                    删除选中节点
                  </button>
                  <button className="ghost-button" onClick={clearNodeSelection} type="button">
                    清空选择
                  </button>
                </div>
                <div className="graph-form-stack tight">
                  <div>
                    <span className="graph-field-label">批量颜色</span>
                    <div className="graph-style-swatches">
                      {graphNodeToneOptions.map((option) => (
                        <button
                          aria-label={`批量切换到${option.label}`}
                          className={batchTone === option.value ? "graph-style-swatch active" : "graph-style-swatch"}
                          key={option.value}
                          onClick={() => applyBatchTone(option.value)}
                          style={{
                            background: getNodeToneTokens({
                              ...selectedNodes[0],
                              metadata: {
                                ...(selectedNodes[0].metadata ?? {}),
                                appearance: { ...(selectedNodes[0].metadata?.appearance ?? {}), tone: option.value }
                              }
                            }).exportFill
                          }}
                          title={option.label}
                          type="button"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="graph-field-label">批量强调</span>
                    <div className="graph-segmented compact">
                      {graphNodeEmphasisOptions.map((option) => (
                        <button
                          className={batchEmphasis === option.value ? "ghost-button active" : "ghost-button"}
                          key={option.value}
                          onClick={() => applyBatchEmphasis(option.value)}
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="graph-field-label">批量尺寸</span>
                    <div className="graph-segmented compact">
                      {graphNodeSizePresetOptions.map((option) => (
                        <button
                          className={batchSizePreset === option.value ? "ghost-button active" : "ghost-button"}
                          key={option.value}
                          onClick={() => applyBatchSizePreset(option.value)}
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="graph-meta-grid">
                  <article className="graph-meta-card muted">
                    <strong>覆盖范围</strong>
                    <p>{selectedNodes.map((node) => buildNodeTitle(node)).slice(0, 3).join("、")}{selectedNodes.length > 3 ? " ..." : ""}</p>
                  </article>
                  <article className="graph-meta-card muted">
                    <strong>批量提示</strong>
                    <p>按住 Shift 在空白处拖动可框选，按住 Shift 或 Ctrl 点击节点可增减选择。</p>
                  </article>
                </div>
              </div>
            ) : selectedNode ? (
              <div className="graph-form-stack">
                <label>
                  <span>节点标题</span>
                  <input
                    onChange={(event) =>
                      mutateDocument((draft) => {
                        draft.nodes = draft.nodes.map((node) =>
                          node.id === selectedNode.id ? { ...node, title: event.target.value } : node
                        );
                      })
                    }
                    value={selectedNode.title}
                  />
                </label>
                <label>
                  <span>节点笔记</span>
                  <textarea
                    onChange={(event) =>
                      mutateDocument((draft) => {
                        draft.nodes = draft.nodes.map((node) =>
                          node.id === selectedNode.id ? patchNodeAppearance(node, { detail: event.target.value }) : node
                        );
                      })
                    }
                    rows={4}
                    value={getNodeDetail(selectedNode)}
                  />
                </label>
                <div className="graph-form-stack tight">
                  <div>
                    <span className="graph-field-label">颜色</span>
                    <div className="graph-style-swatches">
                      {graphNodeToneOptions.map((option) => (
                        <button
                          aria-label={`切换到${option.label}色`}
                          className={getNodeTone(selectedNode) === option.value ? "graph-style-swatch active" : "graph-style-swatch"}
                          key={option.value}
                          onClick={() =>
                            mutateDocument((draft) => {
                              draft.nodes = draft.nodes.map((node) =>
                                node.id === selectedNode.id ? patchNodeAppearance(node, { tone: option.value }) : node
                              );
                            })
                          }
                          style={{
                            background: getNodeToneTokens({
                              ...selectedNode,
                              metadata: {
                                ...(selectedNode.metadata ?? {}),
                                appearance: { ...(selectedNode.metadata?.appearance ?? {}), tone: option.value }
                              }
                            }).exportFill
                          }}
                          title={option.label}
                          type="button"
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="graph-field-label">强调</span>
                    <div className="graph-segmented compact">
                      {graphNodeEmphasisOptions.map((option) => (
                        <button
                          className={getNodeEmphasis(selectedNode) === option.value ? "ghost-button active" : "ghost-button"}
                          key={option.value}
                          onClick={() =>
                            mutateDocument((draft) => {
                              draft.nodes = draft.nodes.map((node) =>
                                node.id === selectedNode.id ? patchNodeAppearance(node, { emphasis: option.value }) : node
                              );
                            })
                          }
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="graph-field-label">尺寸</span>
                    <div className="graph-segmented compact">
                      {graphNodeSizePresetOptions.map((option) => (
                        <button
                          className={resolveNodeSizePreset(selectedNode) === option.value ? "ghost-button active" : "ghost-button"}
                          key={option.value}
                          onClick={() =>
                            mutateDocument((draft) => {
                              draft.nodes = draft.nodes.map((node) =>
                                node.id === selectedNode.id ? resizeNodeToPreset(node, option.value) : node
                              );
                            })
                          }
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="graph-meta-card">
                  <strong>来源</strong>
                  <p>{selectedNode.source?.label || "当前节点是自由创建的概念节点"}</p>
                  {selectedNodeSourceTarget ? (
                    <div className="graph-inline-actions">
                      <button className="ghost-button" onClick={() => navigate(selectedNodeSourceTarget)} type="button">
                        <Link2 size={14} />
                        {selectedNode.source?.type === "material"
                          ? "回到阅读器"
                          : selectedNode.source?.type === "note"
                            ? "回到笔记"
                            : "去复习页"}
                      </button>
                    </div>
                  ) : null}
                </div>
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
                      <p>
                        {[getNodeSourceLabel(selectedNode.source?.type), selectedNode.source?.id].filter(Boolean).join(" / ")}
                      </p>
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
              </div>
            ) : null}

            {selectedEdge ? (
              <div className="graph-form-stack">
                <label>
                  <span>关系标签</span>
                  <input
                    onChange={(event) =>
                      mutateDocument((draft) => {
                        draft.edges = draft.edges.map((edge) =>
                          edge.id === selectedEdge.id ? { ...edge, label: event.target.value } : edge
                        );
                      })
                    }
                    value={selectedEdge.label || ""}
                  />
                </label>
                <label>
                  <span>线条形态</span>
                  <select
                    onChange={(event) =>
                      mutateDocument((draft) => {
                        draft.edges = draft.edges.map((edge) =>
                          edge.id === selectedEdge.id ? { ...edge, kind: event.target.value } : edge
                        );
                      })
                    }
                    value={selectedEdge.kind || "straight"}
                  >
                    <option value="straight">直线</option>
                    <option value="curve">曲线</option>
                  </select>
                </label>
              </div>
            ) : null}

            {document?.groups.length ? (
              <div className="graph-group-list">
                {document.groups.map((group) => (
                  <article className="graph-group-item" key={group.id}>
                    <input
                      className="graph-group-title-input"
                      onChange={(event) =>
                        mutateDocument((draft) => {
                          draft.groups = draft.groups.map((item) =>
                            item.id === group.id ? { ...item, title: event.target.value } : item
                          );
                        })
                      }
                      value={group.title}
                    />
                    <span>{group.nodeIds.length} 个节点</span>
                    <button className="ghost-button" onClick={() => toggleGroupCollapse(group.id)} type="button">
                      {group.collapsed ? "展开" : "折叠"}
                    </button>
                  </article>
                ))}
              </div>
            ) : null}

            {selectedNodes.length === 0 && !selectedEdge ? (
              <article className="graph-meta-card muted">
                <strong>操作提示</strong>
                <p>点击节点可编辑标题、笔记和样式，点击连线可改关系标签。按住 Shift 在空白处拖动可框选多个节点，滚轮可以缩放。</p>
              </article>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
