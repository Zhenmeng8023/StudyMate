import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Download,
  FileDown,
  Keyboard,
  Layers3,
  Link2,
  Plus,
  Redo2,
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
  appendGraphEdgeToDocument,
  buildGraphMinimapViewport,
  buildSourceSwimlaneLayout,
  centerGraphViewportOnRect,
  clearGraphNodeSelection,
  createGraphGroupForNodes,
  duplicateGraphNodeInDocument,
  parseGraphFocusPreviewSearch,
  removeGraphNodesFromDocument,
  selectGraphNodesInRect,
  setGraphNodeSelection,
  summarizeGraphSourceReferences,
  toggleGraphGroupCollapse,
  toggleGraphNodeSelection
} from "@studymate/graph-core";
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
} from "../../../api/client";
import {
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
} from "../nodeAppearance";
import {
  GraphContextMenuPanel,
  GraphKeyboardGuidePanel,
  GraphSettingsPanel,
  GraphValidationIssueList
} from "../components/GraphWorkspacePanels";
import {
  GraphStageCanvas,
  GraphStageStatus
} from "../components/GraphWorkspaceStageChrome";
import {
  GraphWorkspaceHeader,
  GraphWorkspaceSourceRail,
  GraphWorkspaceToolbar
} from "../components/GraphWorkspaceShell";

import {
  applyGraphDocumentChange,
  createEmptyGraphHistoryState,
  markGraphHistorySaved,
  redoGraphDocument,
  resetGraphHistoryState,
  type GraphHistoryState,
  undoGraphDocument
} from "../lib/graphHistory";
import {
  buildGraphImportSourceTargets,
  buildGraphJsonExport,
  parseGraphJsonImport,
  toGraphValidationIssues
} from "../lib/graphFileImportExport";
import {
  buildGraphNodeDraft,
  getGraphNodeTypeOption,
  graphNodeTypeOptions,
  type GraphNodeCreationType
} from "../lib/graphNodeTypes";
import {
  getGraphNodeMetadataEditorFields,
  getGraphNodeMetadataField,
  patchGraphNodeMetadataField
} from "../lib/graphNodeMetadata";
import { renderGraphPngBlobFromSvg } from "../lib/graphCanvasExport";
import { resolveGraphKeyboardShortcut } from "../lib/graphKeyboardShortcuts";
import {
  buildGraphSaveFailureState,
  buildGraphSaveSuccessState,
  buildSnapshotListFailureState,
  buildSnapshotRestoreFailureState,
  buildSnapshotRestoreSuccessState,
  formatGraphSaveStateLabel
} from "../lib/graphPersistenceState";
import { buildGraphSettingsSections } from "../lib/graphSettingsPanel";
import { buildGraphSourceBacklink, buildGraphSourceBacklinkFromSource } from "../lib/graphSourceBacklinks";
import {
  buildGraphWorkspaceLoadedStatus,
  buildGraphWorkspaceResourceState,
  normalizeGraphWorkspaceDetail
} from "../lib/graphWorkspaceLoadState";
import {
  autosaveDelayMs,
  buildClearedFocusNavigationLocation,
  buildCombinedBounds,
  buildFocusPreviewViewport,
  buildNodeBounds,
  buildNodeTitle,
  buildSelectionBox,
  buildSourceGroupDefinitions,
  buildSvgExport,
  clampZoom,
  cloneDocument,
  defaultNodePosition,
  downloadBlob,
  downloadTextFile,
  findHiddenNodeIds,
  getNodeSourceLabel,
  getSourceBucketKey,
  getSourceBucketLabel,
  isGeneratedSourceSwimlaneGroup,
  isTypingElement,
  maxHistoryEntries,
  minimapScale,
  normalizeDocument,
  projectClientPointToWorld,
  randomId,
  rebuildDetail,
  resolveAlignmentGuides,
  stageHeight,
  stageWidth,
  type AlignmentGuide,
  type ContextMenuState,
  type DragState,
  type FocusPreview,
  type GraphFocusNavigationState,
  type ImportMode,
  type SelectionBox,
  type SourceOrganizerMode
} from "../lib/workspaceControllerHelpers";
import type { GraphWorkspaceSaveState } from "../state/types";
import {
  useGraphAutosaveLifecycle,
  useGraphContextMenuDismiss,
  useGraphStageMeasurement
} from "./useGraphWorkspaceEffects";

export function useGraphWorkspaceController(props: { session: AuthSession }) {
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
  const [historyState, setHistoryState] = useState<GraphHistoryState>(createEmptyGraphHistoryState);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<GraphWorkspaceSaveState>("idle");
  const [statusMessage, setStatusMessage] = useState("正在加载图谱工作区...");
  const [graphSearch, setGraphSearch] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("markdown");
  const [importSource, setImportSource] = useState("# 学习主题\n## 核心概念\n## 待复习问题");
  const [quickNodeType, setQuickNodeType] = useState<GraphNodeCreationType>("text");
  const [focusPreview, setFocusPreview] = useState<FocusPreview | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [selectionBox, setSelectionBox] = useState<SelectionBox>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const [showKeyboardGuide, setShowKeyboardGuide] = useState(false);
  const detailRef = useRef<GraphDetailPayload | null>(null);
  const historyRef = useRef<GraphHistoryState>(createEmptyGraphHistoryState());
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stageViewport = useGraphStageMeasurement(stageRef);
  const consumedFocusRef = useRef("");
  const [selectedDraftDeckId, setSelectedDraftDeckId] = useState("");
  const navigationState = (location.state as GraphFocusNavigationState | null) ?? null;
  const focusSearch = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const requestedGraphId = navigationState?.graphId || focusSearch.get("graphId") || "";
  const requestedFocusKey = navigationState?.focusPreview ? `state:${location.key}` : location.search;
  const requestedFocus = useMemo(() => {
    if (navigationState?.focusPreview) {
      return navigationState.focusPreview;
    }
    return parseGraphFocusPreviewSearch(focusSearch);
  }, [focusSearch, navigationState?.focusPreview]);

  useEffect(() => {
    detailRef.current = graphDetail;
  }, [graphDetail]);

  useEffect(() => {
    historyRef.current = historyState;
  }, [historyState]);

  useGraphContextMenuDismiss(contextMenu, () => setContextMenu(null));

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
  const selectedSourceSummary = useMemo(() => {
    if (selectedNodes.length < 2) {
      return [];
    }
    const counts = new Map<string, { label: string; count: number }>();
    for (const node of selectedNodes) {
      const key = getSourceBucketKey(node);
      const current = counts.get(key);
      if (current) {
        current.count += 1;
        continue;
      }
      counts.set(key, { label: getSourceBucketLabel(node), count: 1 });
    }
    return [...counts.values()];
  }, [selectedNodes]);
  const selectedEdge = selectedEdgeId ? document?.edges.find((edge) => edge.id === selectedEdgeId) ?? null : null;
  const selectedNodeSourceBacklink = selectedNode ? buildGraphSourceBacklink(selectedNode) : null;
  const contextMenuNode = contextMenu?.nodeId ? nodeMap.get(contextMenu.nodeId) ?? null : null;
  const contextMenuSourceBacklink = contextMenuNode ? buildGraphSourceBacklink(contextMenuNode) : null;
  const visibleNodes = useMemo(
    () => (document?.nodes ?? []).filter((node) => !hiddenNodeIds.has(node.id)),
    [document?.nodes, hiddenNodeIds]
  );
  const sourceReferenceSummary = useMemo(
    () => summarizeGraphSourceReferences(document?.nodes ?? []),
    [document?.nodes]
  );
  const quickNodeTypeLabel = getGraphNodeTypeOption(quickNodeType).label;
  const saveStateLabel = formatGraphSaveStateLabel(saveState);
  const settingsSections = useMemo(
    () =>
      buildGraphSettingsSections({
        autosaveDelayMs,
        edgeCount: document?.edges.length ?? 0,
        groupCount: document?.groups.length ?? 0,
        nodeCount: document?.nodes.length ?? 0,
        saveState
      }),
    [document?.edges.length, document?.groups.length, document?.nodes.length, saveState]
  );
  const minimapViewport = useMemo(() => {
    return document
      ? buildGraphMinimapViewport({
          viewport: document.viewport,
          stage: stageViewport,
          world: { width: stageWidth, height: stageHeight },
          scale: minimapScale
        })
      : null;
  }, [document, stageViewport.height, stageViewport.width]);
  const alignmentHintLabels = useMemo(
    () => [...new Set(alignmentGuides.map((guide) => guide.label))],
    [alignmentGuides]
  );
  const historyPast = historyState.past;
  const historyFuture = historyState.future;
  const dirty = historyState.dirty;

  useGraphAutosaveLifecycle({
    dirty,
    graphDetail,
    saving,
    onAutosave: () => void saveCurrentGraph("自动保存")
  });

  function resetHistory(nextDetail: GraphDetailPayload, label?: string) {
    setGraphDetail(nextDetail);
    const nextHistory = resetGraphHistoryState(historyRef.current, label);
    historyRef.current = nextHistory;
    setHistoryState(nextHistory);
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

  function applyDocument(nextDocument: GraphDocumentPayload, options?: { captureHistory?: boolean; status?: string; label?: string }) {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const result = applyGraphDocumentChange(current, nextDocument, historyRef.current, {
      captureHistory: options?.captureHistory,
      label: options?.label ?? options?.status
    });
    detailRef.current = result.detail;
    historyRef.current = result.history;
    setGraphDetail(result.detail);
    replaceGraphSummary(result.detail);
    setHistoryState(result.history);
    setSaveState("dirty");
    setStatusMessage(options?.status ?? "图谱有未保存的更改");
  }

  function setSingleNodeSelection(nodeId: string) {
    const nextSelection = setGraphNodeSelection({ selectedNodeId, selectedNodeIds }, nodeId);
    setSelectedNodeId(nextSelection.selectedNodeId);
    setSelectedNodeIds(nextSelection.selectedNodeIds);
    setSelectedEdgeId("");
  }

  function clearNodeSelection() {
    const nextSelection = clearGraphNodeSelection({ selectedNodeId, selectedNodeIds });
    setSelectedNodeId(nextSelection.selectedNodeId);
    setSelectedNodeIds(nextSelection.selectedNodeIds);
  }

  function toggleNodeInSelection(nodeId: string) {
    const nextSelection = toggleGraphNodeSelection({ selectedNodeId, selectedNodeIds }, nodeId);
    setSelectedNodeId(nextSelection.selectedNodeId);
    setSelectedNodeIds(nextSelection.selectedNodeIds);
    setSelectedEdgeId("");
  }

  function deleteSelectedNodes(nodeIds: string[]) {
    if (nodeIds.length === 0) {
      return;
    }

    const current = detailRef.current;
    if (current) {
      applyDocument(removeGraphNodesFromDocument(current.document, nodeIds));
    }
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

  function organizeSelectedNodesBySource(mode: SourceOrganizerMode) {
    if (selectedNodes.length < 2) {
      return;
    }

    const grouped = buildSourceGroupDefinitions(selectedNodes)
      .map((group) => ({
        ...group,
        nodes: selectedNodes
          .filter((node) => group.nodeIds.includes(node.id))
          .sort((left, right) => {
            const sourceLabelDiff = (left.source?.label || left.title).localeCompare(right.source?.label || right.title, "zh-CN");
            return sourceLabelDiff === 0 ? left.title.localeCompare(right.title, "zh-CN") : sourceLabelDiff;
          })
      }))
      .filter((group) => group.nodes.length > 0);

    if (grouped.length === 0) {
      return;
    }

    const anchorLeft = Math.min(...selectedNodes.map((node) => node.x));
    const anchorTop = Math.min(...selectedNodes.map((node) => node.y));
    const laneGap = 72;
    const itemGap = 24;
    const placements = new Map<string, { x: number; y: number }>();
    let laneOffset = 0;

    for (const group of grouped) {
      if (mode === "type-columns") {
        let columnHeight = 0;
        let columnWidth = 0;
        for (const node of group.nodes) {
          placements.set(node.id, {
            x: anchorLeft + laneOffset,
            y: anchorTop + columnHeight
          });
          columnHeight += node.height + itemGap;
          columnWidth = Math.max(columnWidth, node.width);
        }
        laneOffset += columnWidth + laneGap;
        continue;
      }

      let rowWidth = 0;
      let rowHeight = 0;
      for (const node of group.nodes) {
        placements.set(node.id, {
          x: anchorLeft + rowWidth,
          y: anchorTop + laneOffset
        });
        rowWidth += node.width + itemGap;
        rowHeight = Math.max(rowHeight, node.height);
      }
      laneOffset += rowHeight + laneGap;
    }

    mutateDocument((draft) => {
      draft.nodes = draft.nodes.map((node) => {
        const placement = placements.get(node.id);
        if (!placement) {
          return node;
        }
        return {
          ...node,
          x: Math.max(0, Math.min(stageWidth - node.width, Number(placement.x.toFixed(1)))),
          y: Math.max(0, Math.min(stageHeight - node.height, Number(placement.y.toFixed(1))))
        };
      });
    });
    setStatusMessage(mode === "type-columns" ? "已按来源类型分列整理选中节点" : "已按来源类型分行整理选中节点");
  }

  function createSourceGroupsFromSelection() {
    if (selectedNodes.length < 2) {
      return;
    }

    const sourceGroups = buildSourceGroupDefinitions(selectedNodes).filter((group) => group.nodeIds.length > 0);
    if (sourceGroups.length === 0) {
      return;
    }

    mutateDocument((draft) => {
      const nextGroups: GraphGroupPayload[] = [];
      for (const sourceGroup of sourceGroups) {
        const nodes = draft.nodes.filter((node) => sourceGroup.nodeIds.includes(node.id));
        if (nodes.length === 0) {
          continue;
        }
        const left = Math.min(...nodes.map((node) => node.x));
        const top = Math.min(...nodes.map((node) => node.y));
        const right = Math.max(...nodes.map((node) => node.x + node.width));
        const bottom = Math.max(...nodes.map((node) => node.y + node.height));
        nextGroups.push({
          id: randomId("group"),
          title: sourceGroup.title,
          nodeIds: [...sourceGroup.nodeIds],
          x: Math.max(0, left - 28),
          y: Math.max(0, top - 40),
          width: Math.min(stageWidth, right - left + 56),
          height: Math.min(stageHeight, bottom - top + 78),
          collapsed: false
        });
      }
      draft.groups.push(...nextGroups);
    });
    setStatusMessage("已按来源类型为选中节点建立分组");
  }

  function createSourceSwimlanesFromSelection() {
    if (selectedNodes.length < 2) {
      return;
    }

    const anchorX = Math.min(...selectedNodes.map((node) => node.x));
    const anchorY = Math.min(...selectedNodes.map((node) => node.y));
    const layout = buildSourceSwimlaneLayout(selectedNodes, {
      anchorX,
      anchorY,
      stageWidth,
      stageHeight,
      makeGroupId: () => randomId("swimlane")
    });
    const layoutNodes = new Map(layout.nodes.map((node) => [node.id, node]));
    const selectedNodeSet = new Set(selectedNodeIds);

    mutateDocument((draft) => {
      draft.nodes = draft.nodes.map((node) => {
        const nextNode = layoutNodes.get(node.id);
        return nextNode ? { ...node, x: nextNode.x, y: nextNode.y } : node;
      });
      draft.groups = draft.groups.filter(
        (group) => !(isGeneratedSourceSwimlaneGroup(group) && group.nodeIds.some((nodeId) => selectedNodeSet.has(nodeId)))
      );
      draft.groups.push(
        ...layout.groups.map((group) => ({
          ...group,
          nodeIds: [...group.nodeIds],
          metadata: group.metadata ? { ...group.metadata } : undefined
        }))
      );
    });
    setSelectedNodeIds(layout.nodes.map((node) => node.id));
    setSelectedNodeId("");
    setStatusMessage(`已生成 ${layout.laneCount} 条来源泳道`);
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

  function mutateDocument(mutator: (draft: GraphDocumentPayload) => void, options?: { captureHistory?: boolean; status?: string; label?: string }) {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const draft = cloneDocument(current.document);
    mutator(draft);
    applyDocument(draft, options);
  }

  function previewViewport(nextViewport: GraphDocumentPayload["viewport"], status: string) {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const nextDocument = cloneDocument(current.document);
    nextDocument.viewport = {
      ...nextDocument.viewport,
      ...nextViewport
    };
    const nextDetail = rebuildDetail(current, nextDocument);
    detailRef.current = nextDetail;
    setGraphDetail(nextDetail);
    setStatusMessage(status);
  }

  async function loadSnapshots(graphId: string) {
    try {
      const payload = await listGraphSnapshots(props.session, graphId);
      setSnapshots(payload);
      return true;
    } catch {
      setSnapshots([]);
      const snapshotState = buildSnapshotListFailureState();
      setStatusMessage(snapshotState.statusMessage);
      return false;
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

      const resourceState = buildGraphWorkspaceResourceState({ graphs: graphList, decks: deckList }, requestedGraphId);

      setDecks(deckList);
      setSelectedDraftDeckId((current) =>
        buildGraphWorkspaceResourceState({ graphs: graphList, decks: deckList }, requestedGraphId, current).selectedDraftDeckId
      );
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
        const normalized = normalizeGraphWorkspaceDetail(created);
        resetHistory(normalized, "创建图谱");
        const snapshotsLoaded = await loadSnapshots(created.id);
        setStatusMessage(buildGraphWorkspaceLoadedStatus("created", snapshotsLoaded));
        return;
      }

      setGraphs(graphList);
      const first = await getGraph(props.session, resourceState.initialGraphId);
      const normalized = normalizeGraphWorkspaceDetail(first);
      resetHistory(normalized, "加载图谱");
      const snapshotsLoaded = await loadSnapshots(resourceState.initialGraphId);
      setStatusMessage(buildGraphWorkspaceLoadedStatus("loaded", snapshotsLoaded));
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
    if (requestedFocusKey && consumedFocusRef.current === requestedFocusKey) {
      return;
    }

    consumedFocusRef.current = requestedFocusKey;

    previewViewport(buildFocusPreviewViewport(requestedFocus, graphDetail, stageRef.current), `已定位到 ${requestedFocus.label}`);
    setFocusPreview(requestedFocus);
    navigate(buildClearedFocusNavigationLocation(location.pathname, location.search), { replace: true, state: null });

    const timer = window.setTimeout(() => {
      setFocusPreview(null);
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [graphDetail, location.pathname, location.search, navigate, requestedFocus, requestedFocusKey, requestedGraphId]);

  async function openGraph(graphId: string) {
    if (detailRef.current?.id === graphId) {
      return;
    }

    setLoading(true);
    setStatusMessage("正在切换图谱...");
    try {
      const detail = await getGraph(props.session, graphId);
      const normalized = normalizeGraphWorkspaceDetail(detail);
      resetHistory(normalized, "切换图谱");
      const snapshotsLoaded = await loadSnapshots(graphId);
      setStatusMessage(buildGraphWorkspaceLoadedStatus("opened", snapshotsLoaded));
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
    setSaveState("pending");
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
      const nextHistory = markGraphHistorySaved(historyRef.current, summary);
      historyRef.current = nextHistory;
      setHistoryState(nextHistory);
      const snapshotsLoaded = await loadSnapshots(normalized.id);
      const successState = buildGraphSaveSuccessState();
      setSaveState(successState.saveState);
      setStatusMessage(snapshotsLoaded ? successState.statusMessage : buildSnapshotListFailureState().statusMessage);
    } catch (error) {
      const failedState = buildGraphSaveFailureState(error);
      setSaveState(failedState.saveState);
      setStatusMessage(failedState.statusMessage);
    } finally {
      setSaving(false);
    }
  }

  function undoCurrentGraph() {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const result = undoGraphDocument(current, historyRef.current);
    if (!result) {
      return;
    }
    detailRef.current = result.detail;
    historyRef.current = result.history;
    setGraphDetail(result.detail);
    replaceGraphSummary(result.detail);
    setHistoryState(result.history);
    setSaveState("dirty");
    setStatusMessage(`${result.history.lastLabel}，等待保存`);
  }

  function redoCurrentGraph() {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const result = redoGraphDocument(current, historyRef.current);
    if (!result) {
      return;
    }
    detailRef.current = result.detail;
    historyRef.current = result.history;
    setGraphDetail(result.detail);
    replaceGraphSummary(result.detail);
    setHistoryState(result.history);
    setSaveState("dirty");
    setStatusMessage(`${result.history.lastLabel}，等待保存`);
  }

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const currentDrag = dragState;
    function clearActiveDrag() {
      setAlignmentGuides([]);
      setSelectionBox(null);
      setDragState(null);
    }

    function handlePointerMove(event: PointerEvent) {
      if ((event.buttons & 1) !== 1) {
        clearActiveDrag();
        return;
      }

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
        const matched = selectGraphNodesInRect(detailRef.current.document.nodes ?? [], {
          left: rectStart.x,
          right: rectEnd.x,
          top: rectStart.y,
          bottom: rectEnd.y,
          hiddenNodeIds
        });
        setSelectedNodeIds(matched);
        setSelectedNodeId(matched[0] || "");
        setSelectedEdgeId("");
        setSelectionBox(null);
      }
      clearActiveDrag();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", clearActiveDrag);
    window.addEventListener("blur", clearActiveDrag);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", clearActiveDrag);
      window.removeEventListener("blur", clearActiveDrag);
    };
  }, [dragState, hiddenNodeIds, selectionBox]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const action = resolveGraphKeyboardShortcut(event, {
        isTyping: isTypingElement(event.target),
        selectedNodeCount: selectedNodeIds.length,
        hasSelectedEdge: Boolean(selectedEdgeId),
        hasDocument: Boolean(detailRef.current)
      });

      switch (action) {
        case "toggle-keyboard-guide":
          event.preventDefault();
          setShowKeyboardGuide((current) => !current);
          break;
        case "save":
          event.preventDefault();
          void saveCurrentGraph("手动保存");
          break;
        case "select-all":
          event.preventDefault();
          setSelectedNodeIds(visibleNodes.map((node) => node.id));
          setSelectedNodeId(visibleNodes[0]?.id || "");
          setSelectedEdgeId("");
          break;
        case "undo": {
          event.preventDefault();
          undoCurrentGraph();
          break;
        }
        case "redo": {
          event.preventDefault();
          redoCurrentGraph();
          break;
        }
        case "delete-nodes":
          event.preventDefault();
          deleteSelectedNodes(selectedNodeIds);
          break;
        case "delete-edge":
          event.preventDefault();
          mutateDocument(
            (draft) => {
              draft.edges = draft.edges.filter((edge) => edge.id !== selectedEdgeId);
            },
            { label: "删除连线" }
          );
          setSelectedEdgeId("");
          break;
        case "focus-selection": {
          event.preventDefault();
          const node = nodeMap.get(selectedNodeIds[0]);
          if (node) {
            focusNode(node);
          }
          break;
        }
        case "group-selection":
          event.preventDefault();
          createGroupFromSelectedNode();
          break;
        case "toggle-link-mode":
          event.preventDefault();
          if (selectedNode) {
            setLinkFromNodeId((current) => (current ? "" : selectedNode.id));
          }
          break;
        case "reset-viewport":
          event.preventDefault();
          mutateDocument(
            (draft) => {
              draft.viewport = { x: 140, y: 120, zoom: 1 };
            },
        { captureHistory: false, status: "已重置画布视野", label: "重置视野" }
          );
          break;
        case "escape":
          setLinkFromNodeId("");
          setSelectionBox(null);
          setAlignmentGuides([]);
          setShowKeyboardGuide(false);
          break;
        case "none":
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedNodes, historyFuture, historyPast, nodeMap, selectedEdgeId, selectedNode, selectedNodeIds, visibleNodes]);

  function createNode(type: GraphNodeCreationType, source?: GraphNodePayload["source"]) {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const position = defaultNodePosition(current.document.nodes.length);
    const nextNode = buildGraphNodeDraft({
      id: randomId("node"),
      position,
      source,
      type
    });

    mutateDocument(
      (draft) => {
        draft.nodes.push(nextNode);
      },
      { label: `新增${getGraphNodeTypeOption(type).label}节点` }
    );
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
      const nextHistory = {
        ...historyRef.current,
        past: [
          ...historyRef.current.past.slice(-(maxHistoryEntries - 1)),
          {
            label: nextSelection.length > 1 ? "批量移动节点" : "移动节点",
            document: cloneDocument(currentDetail.document)
          }
        ],
        future: [],
        lastLabel: nextSelection.length > 1 ? "批量移动节点" : "移动节点"
      };
      historyRef.current = nextHistory;
      setHistoryState(nextHistory);
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

      const nextEdge: GraphEdgePayload = {
        id: randomId("edge"),
        kind: "straight",
        sourceNodeId: linkFromNodeId,
        targetNodeId: nodeId,
        label: "关联",
        metadata: {}
      };

      const result = appendGraphEdgeToDocument(current.document, nextEdge);
      if (!result.created) {
        setStatusMessage(result.reason === "duplicate" ? "这两个节点之间已经有连线" : "无法在这两个节点之间创建连线");
        setLinkFromNodeId("");
        return;
      }

      applyDocument(result.document, { label: "创建连线" });
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
      { captureHistory: false, status: "已调整缩放，等待保存", label: "调整缩放" }
    );
  }

  function createGroupForNode(node: GraphNodePayload) {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const result = createGraphGroupForNodes(current.document, [node.id], {
      makeGroupId: () => randomId("group"),
      title: `${node.title} 分组`
    });
    if (!result.group) {
      return;
    }

    applyDocument(result.document, { label: "创建分组" });
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

    const current = detailRef.current;
    if (!current) {
      return;
    }

    const result = createGraphGroupForNodes(current.document, selectedNodeIds, {
      makeGroupId: () => randomId("group"),
      title: `${selectedNodes[0].title} 等 ${selectedNodes.length} 个节点`
    });
    if (!result.group) {
      return;
    }

    applyDocument(result.document, { label: "创建分组" });
    setStatusMessage(`已为 ${selectedNodes.length} 个节点创建分组`);
  }

  function toggleGroupCollapse(groupId: string) {
    const current = detailRef.current;
    if (!current) {
      return;
    }
    const nextDocument = toggleGraphGroupCollapse(current.document, groupId);
    if (nextDocument === current.document) {
      return;
    }
    applyDocument(nextDocument, { status: "已切换分组折叠状态", label: "切换分组折叠" });
  }

  function focusNode(node: GraphNodePayload) {
    if (!detailRef.current || !stageRef.current) {
      return;
    }

    const nextViewport = centerGraphViewportOnRect({
      rect: node,
      stage: {
        width: stageRef.current.clientWidth,
        height: stageRef.current.clientHeight
      },
      zoom: detailRef.current.document.viewport.zoom
    });

    mutateDocument(
      (draft) => {
        draft.viewport = {
          ...draft.viewport,
          ...nextViewport
        };
      },
      { captureHistory: false, status: `已定位到节点 ${node.title}`, label: "聚焦节点" }
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

  function deleteSelectedGraphItems() {
    if (selectedNodeIds.length > 0) {
      deleteSelectedNodes(selectedNodeIds);
      return;
    }

    if (selectedEdgeId) {
      mutateDocument(
        (draft) => {
          draft.edges = draft.edges.filter((edge) => edge.id !== selectedEdgeId);
        },
        { label: "删除连线" }
      );
      setSelectedEdgeId("");
    }
  }

  function zoomGraph(delta: number, status: string) {
    mutateDocument(
      (draft) => {
        draft.viewport.zoom = clampZoom(draft.viewport.zoom + delta);
      },
      { captureHistory: false, status, label: "调整缩放" }
    );
  }

  async function handleExportPng() {
    if (!graphDetail) {
      return;
    }

    try {
      const svg = buildSvgExport(graphDetail, nodeMap, hiddenNodeIds);
      const blob = await renderGraphPngBlobFromSvg(svg, {
        background: "#f9f6ef",
        height: stageHeight,
        width: stageWidth
      });

      const safeName = graphDetail.title.replace(/[\\/:*?"<>|]/g, "-");
      downloadBlob(`${safeName || "graph"}.png`, blob);
      setStatusMessage("已导出 PNG 图谱");
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

  function handleExportJson() {
    if (!graphDetail) {
      return;
    }

    const exported = buildGraphJsonExport(graphDetail);
    downloadTextFile(exported.filename, exported.content, exported.mimeType);
    setStatusMessage("已导出 StudyMate 图谱 JSON");
  }

  function duplicateNode(nodeId: string) {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const result = duplicateGraphNodeInDocument(current.document, nodeId, {
      makeNodeId: () => randomId("node"),
      titleSuffix: " 副本",
      stageWidth,
      stageHeight
    });
    if (!result.node) {
      return;
    }

    applyDocument(result.document, { label: "复制节点" });
    setSelectedNodeId(result.node.id);
    setSelectedEdgeId("");
    setStatusMessage("已复制节点");
  }

  async function handleImport() {
    if (!graphDetail) {
      return;
    }

    if (!importSource.trim()) {
      setStatusMessage("先填写 Markdown、Mermaid 或 StudyMate JSON 内容");
      return;
    }

    setSaving(true);
    try {
      if (importMode === "json") {
        const imported = parseGraphJsonImport(importSource, graphDetail.document, {
          sourceTargets: buildGraphImportSourceTargets({
            currentDocument: graphDetail.document,
            materials,
            notes
          })
        });
        const issues = toGraphValidationIssues(imported.issues);
        const errors = issues.filter((issue) => issue.severity === "error");
        setValidationIssues(issues);
        if (errors.length > 0) {
          setSaveState("failed");
          setStatusMessage(`导入 JSON 失败：发现 ${errors.length} 条结构错误`);
          return;
        }

        applyDocument(imported.document, {
          captureHistory: true,
          label: "导入 StudyMate 图谱 JSON",
          status: issues.length ? `已导入 JSON，另有 ${issues.length} 条校验提示` : "已导入 StudyMate 图谱 JSON"
        });
        return;
      }

      const payload =
        importMode === "markdown"
          ? await importGraphMarkdown(props.session, graphDetail.id, importSource)
          : await importGraphMermaid(props.session, graphDetail.id, importSource);
      const normalized = {
        ...payload,
        document: normalizeDocument(payload.id, payload.currentVersion, payload.document)
      };
      resetHistory(normalized, importMode === "markdown" ? "导入 Markdown 大纲" : "导入 Mermaid 草稿");
      await loadSnapshots(normalized.id);
      setSaveState("saved");
      setStatusMessage(importMode === "markdown" ? "已导入 Markdown 大纲" : "已导入 Mermaid 草稿");
    } catch (error) {
      setSaveState("failed");
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
      resetHistory(normalized, "恢复历史快照");
      const snapshotsLoaded = await loadSnapshots(normalized.id);
      const successState = buildSnapshotRestoreSuccessState(versionNumber);
      setSaveState(successState.saveState);
      setStatusMessage(snapshotsLoaded ? successState.statusMessage : buildSnapshotListFailureState().statusMessage);
    } catch (error) {
      const failedState = buildSnapshotRestoreFailureState(error);
      setSaveState(failedState.saveState);
      setStatusMessage(failedState.statusMessage);
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
      setStatusMessage("先生成卡片草稿，再确认写入卡组");
      return;
    }
    if (!selectedDraftDeckId) {
      setStatusMessage("先选择一个目标卡组");
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
      resetHistory(normalized, "创建图谱");
      await loadSnapshots(normalized.id);
      setSaveState("saved");
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
      <GraphWorkspaceHeader
        graphDetail={graphDetail}
        onCreateGraph={() => void handleCreateGraph()}
        onSave={() => void saveCurrentGraph("手动保存")}
        saveState={saveState}
        saveStateLabel={saveStateLabel}
        saving={saving}
      />

      <div className="graph-workspace-grid">
        <GraphWorkspaceSourceRail
          diagramTemplates={diagramTemplates}
          graphDetail={graphDetail}
          graphs={graphs}
          materials={visibleMaterials}
          notes={visibleNotes}
          onAddMaterialNode={addMaterialNode}
          onAddNoteNode={addNoteNode}
          onApplyTemplate={applyTemplate}
          onOpenGraph={(graphId) => void openGraph(graphId)}
        />

        <section className="graph-stage-panel">
          <GraphWorkspaceToolbar
            graphDetail={graphDetail}
            graphSearch={graphSearch}
            hasSelectedEdge={Boolean(selectedEdge)}
            historyFutureCount={historyFuture.length}
            historyPastCount={historyPast.length}
            isLinking={Boolean(linkFromNodeId)}
            nodeTypeOptions={graphNodeTypeOptions}
            onCreateGroup={createGroupFromSelectedNode}
            onCreateNode={() => createNode(quickNodeType)}
            onDeleteSelection={deleteSelectedGraphItems}
            onExportJson={handleExportJson}
            onExportPng={() => void handleExportPng()}
            onExportSvg={handleExportSvg}
            onLocateNode={handleLocateNode}
            onQuickNodeTypeChange={setQuickNodeType}
            onRedo={redoCurrentGraph}
            onSearchChange={setGraphSearch}
            onToggleKeyboardGuide={() => setShowKeyboardGuide((current) => !current)}
            onToggleLinkMode={() => setLinkFromNodeId((current) => (current ? "" : selectedNodeId))}
            onUndo={undoCurrentGraph}
            onZoomIn={() => zoomGraph(0.1, "已放大画布")}
            onZoomOut={() => zoomGraph(-0.1, "已缩小画布")}
            quickNodeType={quickNodeType}
            quickNodeTypeLabel={quickNodeTypeLabel}
            selectedNodeCount={selectedNodeIds.length}
            showKeyboardGuide={showKeyboardGuide}
          />

          <div className="graph-stage-shell">
            <GraphStageStatus
              alignmentHintLabels={alignmentHintLabels}
              graphDetail={graphDetail}
              loading={loading}
              selectedNodeCount={selectedNodeIds.length}
              statusMessage={statusMessage}
            />

            <GraphStageCanvas
              alignmentGuides={alignmentGuides}
              document={document}
              focusPreview={focusPreview}
              graphDetail={graphDetail}
              hiddenNodeIds={hiddenNodeIds}
              linkFromNodeId={linkFromNodeId}
              minimapViewport={minimapViewport}
              nodeMap={nodeMap}
              onCanvasContextMenu={(event) => openContextMenu(event)}
              onCanvasPointerDown={handleCanvasPointerDown}
              onEdgeContextMenu={(event, edge) => openContextMenu(event, { edgeId: edge.id })}
              onEdgeSelect={(event, edge) => {
                event.stopPropagation();
                setSelectedEdgeId(edge.id);
                clearNodeSelection();
              }}
              onNodeClick={(event, node) => handleNodeClick(node.id, event)}
              onNodeContextMenu={(event, node) => openContextMenu(event, { nodeId: node.id })}
              onNodePointerDown={handleNodePointerDown}
              onToggleGroupCollapse={toggleGroupCollapse}
              onWheel={handleWheel}
              scale={minimapScale}
              selectedEdgeId={selectedEdgeId}
              selectedNodeIds={selectedNodeIds}
              selectionBox={selectionBox}
              stageHeight={stageHeight}
              stageRef={stageRef}
              stageWidth={stageWidth}
              visibleNodes={visibleNodes}
            >
                  {showKeyboardGuide ? <GraphKeyboardGuidePanel onClose={() => setShowKeyboardGuide(false)} /> : null}
                  {contextMenu ? (
                    <GraphContextMenuPanel
                      contextMenu={contextMenu}
                      hasSourceTarget={Boolean(contextMenuSourceBacklink)}
                      isLinkStartSelected={linkFromNodeId === contextMenu.nodeId}
                      onCreateCanvasMaterialNode={() => {
                        createNode("material");
                        setContextMenu(null);
                      }}
                      onCreateCanvasNoteNode={() => {
                        createNode("rich-note");
                        setContextMenu(null);
                      }}
                      onCreateCanvasTextNode={() => {
                        createNode("text");
                        setContextMenu(null);
                      }}
                      onCreateGroup={() => {
                        if (contextMenuNode) {
                          createGroupForNode(contextMenuNode);
                        }
                        setContextMenu(null);
                      }}
                      onDeleteEdge={() => {
                        mutateDocument((draft) => {
                          draft.edges = draft.edges.filter((edge) => edge.id !== contextMenu.edgeId);
                        });
                        setSelectedEdgeId("");
                        setContextMenu(null);
                      }}
                      onDeleteNode={() => {
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
                      onDuplicateNode={() => {
                        duplicateNode(contextMenu.nodeId || "");
                        setContextMenu(null);
                      }}
                      onExportPng={() => {
                        void handleExportPng();
                        setContextMenu(null);
                      }}
                      onFocusNode={() => {
                        if (contextMenuNode) {
                          focusNode(contextMenuNode);
                        }
                        setContextMenu(null);
                      }}
                      onOpenSource={() => {
                        if (contextMenuSourceBacklink) {
                          navigate(contextMenuSourceBacklink.target);
                        }
                        setContextMenu(null);
                      }}
                      onToggleEdgeKind={() => {
                        mutateDocument((draft) => {
                          draft.edges = draft.edges.map((edge) =>
                            edge.id === contextMenu.edgeId
                              ? { ...edge, kind: edge.kind === "curve" ? "straight" : "curve" }
                              : edge
                          );
                        });
                        setContextMenu(null);
                      }}
                      onToggleLinkStart={() => {
                        setLinkFromNodeId((current) => (current === contextMenu.nodeId ? "" : contextMenu.nodeId || ""));
                        setSingleNodeSelection(contextMenu.nodeId || "");
                        setContextMenu(null);
                      }}
                    />
                  ) : null}
            </GraphStageCanvas>
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
                      const nextHistory = { ...historyRef.current, dirty: true };
                      detailRef.current = nextDetail;
                      historyRef.current = nextHistory;
                      setGraphDetail(nextDetail);
                      setHistoryState(nextHistory);
                      setSaveState("dirty");
                      replaceGraphSummary(nextDetail);
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
                      const nextHistory = { ...historyRef.current, dirty: true };
                      detailRef.current = nextDetail;
                      historyRef.current = nextHistory;
                      setGraphDetail(nextDetail);
                      setHistoryState(nextHistory);
                      setSaveState("dirty");
                      replaceGraphSummary(nextDetail);
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
                <p className="eyebrow">设置</p>
                <h2>偏好与说明</h2>
              </div>
            </div>
            <GraphSettingsPanel sections={settingsSections} />
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
              <button
                className={importMode === "json" ? "ghost-button active" : "ghost-button"}
                onClick={() => setImportMode("json")}
                type="button"
              >
                JSON
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

            <GraphValidationIssueList issues={validationIssues} />
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
                <p className="eyebrow">来源关系</p>
                <h2>图谱引用</h2>
              </div>
            </div>
            {sourceReferenceSummary.references.length || sourceReferenceSummary.isolatedNodeCount ? (
              <div className="graph-form-stack">
                <div className="graph-source-summary-list">
                  {sourceReferenceSummary.typeBuckets.map((bucket) => (
                    <span className="graph-source-summary-pill" key={bucket.type}>
                      {bucket.label} · {bucket.referenceCount} 来源 / {bucket.nodeCount} 节点
                    </span>
                  ))}
                  {sourceReferenceSummary.isolatedNodeCount ? (
                    <span className="graph-source-summary-pill warning">
                      孤立/无来源 · {sourceReferenceSummary.isolatedNodeCount} 节点
                    </span>
                  ) : null}
                </div>
                <div className="graph-source-reference-list">
                  {sourceReferenceSummary.references.slice(0, 5).map((reference) => {
                    const backlink = buildGraphSourceBacklinkFromSource({
                      type: reference.type,
                      id: reference.id,
                      label: reference.label,
                      excerpt: reference.excerpt
                    });
                    return (
                      <article className="graph-source-reference-item" key={reference.key}>
                        <div>
                          <strong>{reference.label}</strong>
                          <span>{reference.nodeCount} 个节点 · {backlink?.sourceTypeLabel ?? reference.type}</span>
                        </div>
                        {reference.excerpt ? <p>{reference.excerpt}</p> : null}
                        {backlink ? (
                          <button className="ghost-button compact" onClick={() => navigate(backlink.target)} type="button">
                            <Link2 size={14} />
                            {backlink.actionLabel}
                          </button>
                        ) : null}
                      </article>
                    );
                  })}
                  {sourceReferenceSummary.references.length > 5 ? (
                    <article className="graph-meta-card muted">
                      <strong>还有 {sourceReferenceSummary.references.length - 5} 个来源</strong>
                      <p>可通过节点详情回到具体资料、笔记或批注上下文。</p>
                    </article>
                  ) : null}
                </div>
              </div>
            ) : (
              <article className="graph-meta-card muted">
                <strong>暂无来源引用</strong>
                <p>从资料、笔记或批注生成节点后，这里会显示图谱和原始学习内容的关系。</p>
              </article>
            )}
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
                    左对齐
                  </button>
                  <button className="secondary-button" onClick={() => alignSelectedNodes("top")} type="button">
                    顶部对齐
                  </button>
                  <button className="secondary-button" onClick={() => alignSelectedNodes("center")} type="button">
                    水平居中
                  </button>
                  <button className="secondary-button" onClick={() => alignSelectedNodes("middle")} type="button">
                    垂直居中
                  </button>
                  <button className="secondary-button" disabled={selectedNodes.length < 3} onClick={() => distributeSelectedNodes("horizontal")} type="button">
                    横向均分
                  </button>
                  <button className="secondary-button" disabled={selectedNodes.length < 3} onClick={() => distributeSelectedNodes("vertical")} type="button">
                    纵向均分
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
                          aria-label={`批量切换为${option.label}`}
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
                  <article className="graph-meta-card">
                    <strong>按来源整理</strong>
                    <div className="graph-source-summary-list">
                      {selectedSourceSummary.map((item) => (
                        <span className="graph-source-summary-pill" key={item.label}>
                          {item.label} · {item.count}
                        </span>
                      ))}
                    </div>
                    <div className="graph-inline-actions">
                      <button className="secondary-button" onClick={() => organizeSelectedNodesBySource("type-columns")} type="button">
                        按来源分列
                      </button>
                      <button className="secondary-button" onClick={() => organizeSelectedNodesBySource("type-rows")} type="button">
                        按来源分行
                      </button>
                      <button className="secondary-button" onClick={createSourceSwimlanesFromSelection} type="button">
                        生成来源泳道
                      </button>
                      <button className="ghost-button" onClick={createSourceGroupsFromSelection} type="button">
                        生成来源分组
                      </button>
                    </div>
                  </article>
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
                {getGraphNodeMetadataEditorFields(selectedNode).map((field) => (
                  <label key={field.field}>
                    <span>{field.label}</span>
                    <input
                      aria-label={`${selectedNode.title} ${field.label}`}
                      onChange={(event) =>
                        mutateDocument(
                          (draft) => {
                            draft.nodes = draft.nodes.map((node) =>
                              node.id === selectedNode.id ? patchGraphNodeMetadataField(node, field.field, event.target.value) : node
                            );
                          },
                          { label: `编辑${field.label}` }
                        )
                      }
                      placeholder={field.placeholder}
                      value={getGraphNodeMetadataField(selectedNode, field.field)}
                    />
                  </label>
                ))}
                <div className="graph-form-stack tight">
                  <div>
                    <span className="graph-field-label">颜色</span>
                    <div className="graph-style-swatches">
                      {graphNodeToneOptions.map((option) => (
                        <button
                          aria-label={`切换为${option.label}色`}
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
                  {selectedNodeSourceBacklink ? (
                    <div className="graph-inline-actions">
                      <button className="ghost-button" onClick={() => navigate(selectedNodeSourceBacklink.target)} type="button">
                        <Link2 size={14} />
                        {selectedNodeSourceBacklink.actionLabel}
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
