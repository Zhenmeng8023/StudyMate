import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Keyboard,
  Plus,
  Redo2,
  Search,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  appendGraphEdgeToDocument,
  buildSourceSwimlaneLayout,
  createGraphGroupForNodes,
  duplicateGraphNodeInDocument,
  parseGraphFocusPreviewSearch,
  removeGraphNodesFromDocument,
  summarizeGraphSourceReferences,
  toggleGraphGroupCollapse,
} from "@studymate/graph-core";
import {
  AuthSession,
  DeckPayload,
  DiagramTemplatePayload,
  GraphCardDraftPayload,
  GraphDetailPayload,
  GraphDocumentPayload,
  GraphEdgePayload,
  GraphNodePayload,
  GraphSummaryPayload,
  GraphValidationIssuePayload,
  MaterialPayload,
  NotePayload,
  commitGraphCardDrafts,
  createGraph,
  deleteGraph,
  generateGraphCardDrafts,
  getGraph,
  listDecks,
  listDiagramTemplates,
  listGraphs,
  listMaterials,
  listNotes,
  validateGraph
} from "../../../api/client";
import {
  getNodeEmphasis,
  getNodeTone,
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
import { GraphWorkspaceRecoveryPanel } from "../components/GraphWorkspaceRecoveryPanel";
import {
  GraphWorkspaceHeader,
  GraphWorkspaceSourceRail,
  GraphWorkspaceToolbar
} from "../components/GraphWorkspaceShell";
import { GraphWorkspaceSourceSummary } from "../components/GraphWorkspaceSourceSummary";
import { GraphWorkspaceSelectionPanel } from "../components/GraphWorkspaceSelectionPanel";
import { GraphWorkspaceImportPanel } from "../components/GraphWorkspaceImportPanel";

import {
  applyGraphDocumentChange,
  createEmptyGraphHistoryState,
  redoGraphDocument,
  resetGraphHistoryState,
  type GraphHistoryState,
  undoGraphDocument
} from "../lib/graphHistory";
import {
  buildGraphNodeDraft,
  getGraphNodeTypeOption,
  graphNodeTypeOptions,
  type GraphNodeCreationType
} from "../lib/graphNodeTypes";
import {
  getGraphNodeMetadataEditorFields,
  patchGraphNodeMetadataField
} from "../lib/graphNodeMetadata";
import { buildGraphDragMove } from "../lib/graphDragMove";
import {
  alignSelectedGraphNodes,
  distributeSelectedGraphNodes,
  type GraphNodeAlignment,
  type GraphNodeDistributionAxis
} from "../lib/graphSelectionLayout";
import {
  buildGraphSourceGroups,
  organizeGraphNodesBySource
} from "../lib/graphSourceLayout";
import { buildSnapshotListFailureState } from "../lib/graphPersistenceState";
import { buildGraphSettingsSections } from "../lib/graphSettingsPanel";
import { buildGraphSourceBacklink } from "../lib/graphSourceBacklinks";
import {
  buildGraphWorkspaceLoadedStatus,
  buildGraphWorkspaceResourceState,
  normalizeGraphWorkspaceDetail
} from "../lib/graphWorkspaceLoadState";
import {
  autosaveDelayMs,
  cloneDocument,
  defaultNodePosition,
  findHiddenNodeIds,
  getSourceBucketKey,
  getSourceBucketLabel,
  isGeneratedSourceSwimlaneGroup,
  maxHistoryEntries,
  minimapScale,
  normalizeDocument,
  projectClientPointToWorld,
  randomId,
  rebuildDetail,
  stageHeight,
  stageWidth,
  type GraphFocusNavigationState,
  type ImportMode,
  type SourceOrganizerMode
} from "../lib/workspaceControllerHelpers";
import { useGraphStageMeasurement } from "./useGraphWorkspaceEffects";
import { useGraphContextMenu } from "./useGraphContextMenu";
import { useGraphKeyboardActions } from "./useGraphKeyboardActions";
import { useGraphImportExport } from "./useGraphImportExport";
import { useGraphWorkspacePersistence } from "./useGraphWorkspacePersistence";
import { useGraphViewportCamera } from "./useGraphViewportCamera";
import { useGraphSelectionState } from "./useGraphSelectionState";
import { useGraphDragState } from "./useGraphDragState";

export function useGraphWorkspaceController(props: { session: AuthSession }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [graphs, setGraphs] = useState<GraphSummaryPayload[]>([]);
  const [decks, setDecks] = useState<DeckPayload[]>([]);
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [notes, setNotes] = useState<NotePayload[]>([]);
  const [diagramTemplates, setDiagramTemplates] = useState<DiagramTemplatePayload[]>([]);
  const [validationIssues, setValidationIssues] = useState<GraphValidationIssuePayload[]>([]);
  const [cardDrafts, setCardDrafts] = useState<GraphCardDraftPayload[]>([]);
  const [graphDetail, setGraphDetail] = useState<GraphDetailPayload | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState("");
  const graphSelection = useGraphSelectionState({ onClearEdgeSelection: () => setSelectedEdgeId("") });
  const selectedNodeId = graphSelection.selectedNodeId;
  const selectedNodeIds = graphSelection.selectedNodeIds;
  const [linkFromNodeId, setLinkFromNodeId] = useState("");
  const [historyState, setHistoryState] = useState<GraphHistoryState>(createEmptyGraphHistoryState);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("正在加载图谱工作区...");
  const [graphSearch, setGraphSearch] = useState("");
  const [importMode, setImportMode] = useState<ImportMode>("markdown");
  const [importSource, setImportSource] = useState("# 学习主题\n## 核心概念\n## 待复习问题");
  const [quickNodeType, setQuickNodeType] = useState<GraphNodeCreationType>("text");
  const graphDrag = useGraphDragState();
  const dragState = graphDrag.dragState;
  const selectionBox = graphDrag.selectionBox;
  const alignmentGuides = graphDrag.alignmentGuides;
  const [showKeyboardGuide, setShowKeyboardGuide] = useState(false);
  const detailRef = useRef<GraphDetailPayload | null>(null);
  const historyRef = useRef<GraphHistoryState>(createEmptyGraphHistoryState());
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stageViewport = useGraphStageMeasurement(stageRef);
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

  const { closeContextMenu, contextMenu, openContextMenu } = useGraphContextMenu({
    onEdgeSelect: (edgeId) => {
      setSelectedEdgeId(edgeId);
      clearNodeSelection();
    },
    onNodeSelect: setSingleNodeSelection
  });

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
  const dirty = historyState.dirty;
  const {
    loadSnapshots,
    restoreSnapshot,
    saveCurrentGraph,
    saveState,
    saveStateLabel,
    saving,
    setSaveState,
    setSaving,
    snapshots
  } = useGraphWorkspacePersistence({
    detailRef,
    dirty,
    graphDetail,
    historyRef,
    onGraphDetailChange: setGraphDetail,
    onHistoryChange: setHistoryState,
    onReplaceGraphSummary: replaceGraphSummary,
    onResetHistory: resetHistory,
    onStatusMessage: setStatusMessage,
    session: props.session
  });
  const graphImportExport = useGraphImportExport({
    graphDetail,
    hiddenNodeIds,
    importMode,
    importSource,
    loadSnapshots,
    materials,
    nodeMap,
    notes,
    onApplyDocument: applyDocument,
    onResetHistory: resetHistory,
    onSaveStateChange: setSaveState,
    onSavingChange: setSaving,
    onStatusMessage: setStatusMessage,
    onValidationIssuesChange: setValidationIssues,
    session: props.session
  });
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
  const graphViewport = useGraphViewportCamera({
    graphDetail,
    locationPathname: location.pathname,
    locationSearch: location.search,
    navigate: (target) => navigate(target, { replace: true, state: null }),
    onPreviewViewport: previewViewport,
    onSelectNode: setSingleNodeSelection,
    onStatusMessage: setStatusMessage,
    onViewportDocumentChange: mutateDocument,
    requestedFocus,
    requestedFocusKey,
    requestedGraphId,
    stageRef,
    stageViewport
  });
  const alignmentHintLabels = useMemo(
    () => [...new Set(alignmentGuides.map((guide) => guide.label))],
    [alignmentGuides]
  );
  const historyPast = historyState.past;
  const historyFuture = historyState.future;
  const visibleNodeIds = useMemo(() => visibleNodes.map((node) => node.id), [visibleNodes]);

  useGraphKeyboardActions({
    hasDocument: Boolean(detailRef.current),
    onDeleteSelectedEdge: (edgeId) => {
      mutateDocument(
        (draft) => {
          draft.edges = draft.edges.filter((edge) => edge.id !== edgeId);
        },
        { label: "删除连线" }
      );
      setSelectedEdgeId("");
    },
    onDeleteSelectedNodes: deleteSelectedNodes,
    onEscape: () => {
      setLinkFromNodeId("");
      graphDrag.clearActiveDrag();
      setShowKeyboardGuide(false);
    },
    onFocusSelectedNode: (nodeId) => {
      const node = nodeMap.get(nodeId);
      if (node) {
        graphViewport.focusNode(node);
      }
    },
    onGroupSelection: createGroupFromSelectedNode,
    onRedo: redoCurrentGraph,
    onResetViewport: graphViewport.resetViewport,
    onSave: () => void saveCurrentGraph("手动保存"),
    onSelectAll: (nodeIds) => {
      graphSelection.selectNodeIds(nodeIds, { activeNodeId: nodeIds[0] || "" });
    },
    onToggleKeyboardGuide: () => setShowKeyboardGuide((current) => !current),
    onToggleLinkMode: (nodeId) => {
      if (nodeId) {
        setLinkFromNodeId((current) => (current ? "" : nodeId));
      }
    },
    onUndo: undoCurrentGraph,
    selectedEdgeId,
    selectedNodeId: selectedNode?.id ?? "",
    selectedNodeIds,
    visibleNodeIds
  });

  function resetHistory(nextDetail: GraphDetailPayload, label?: string) {
    setGraphDetail(nextDetail);
    const nextHistory = resetGraphHistoryState(historyRef.current, label);
    historyRef.current = nextHistory;
    setHistoryState(nextHistory);
    graphSelection.resetNodeSelection();
    setSelectedEdgeId("");
    setLinkFromNodeId("");
    setValidationIssues([]);
    setCardDrafts([]);
    graphDrag.clearActiveDrag();
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
    graphSelection.selectSingleNode(nodeId);
  }

  function clearNodeSelection() {
    graphSelection.clearNodeSelection();
  }

  function toggleNodeInSelection(nodeId: string) {
    graphSelection.toggleNodeSelection(nodeId);
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

  function alignSelectedNodes(direction: GraphNodeAlignment) {
    if (selectedNodes.length < 2) {
      return;
    }

    mutateDocument((draft) => {
      draft.nodes = alignSelectedGraphNodes(draft.nodes, selectedNodeIds, direction);
    });
  }

  function distributeSelectedNodes(axis: GraphNodeDistributionAxis) {
    if (selectedNodes.length < 3) {
      return;
    }

    mutateDocument((draft) => {
      draft.nodes = distributeSelectedGraphNodes(draft.nodes, selectedNodeIds, axis);
    });
  }

  function organizeSelectedNodesBySource(mode: SourceOrganizerMode) {
    if (selectedNodes.length < 2) {
      return;
    }

    const layout = organizeGraphNodesBySource(selectedNodes, selectedNodeIds, mode);
    mutateDocument((draft) => {
      const layoutNodes = new Map(layout.nodes.map((node) => [node.id, node]));
      draft.nodes = draft.nodes.map((node) => layoutNodes.get(node.id) ?? node);
    });
    setStatusMessage(layout.status);
  }

  function createSourceGroupsFromSelection() {
    if (selectedNodes.length < 2) {
      return;
    }

    const result = buildGraphSourceGroups(selectedNodes, selectedNodeIds, {
      makeGroupId: () => randomId("group")
    });
    if (result.groups.length === 0) {
      return;
    }

    mutateDocument((draft) => {
      draft.groups.push(...result.groups);
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
    graphSelection.selectNodeIds(layout.nodes.map((node) => node.id), { activeNodeId: "" });
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
    function handlePointerMove(event: PointerEvent) {
      if ((event.buttons & 1) !== 1) {
        graphDrag.clearActiveDrag();
        return;
      }

      const current = detailRef.current;
      if (!current) {
        return;
      }

      if (currentDrag.kind === "node") {
        const move = buildGraphDragMove({
          clientX: event.clientX,
          clientY: event.clientY,
          document: current.document,
          dragState: currentDrag,
          hiddenNodeIds
        });
        graphDrag.setAlignmentGuides(move.alignmentGuides);
        mutateDocument(
          (draft) => {
            draft.nodes = move.nodes;
          },
          { captureHistory: false, status: move.status }
        );
        return;
      }

      if (currentDrag.kind === "multi-node") {
        const move = buildGraphDragMove({
          clientX: event.clientX,
          clientY: event.clientY,
          document: current.document,
          dragState: currentDrag,
          hiddenNodeIds
        });
        graphDrag.setAlignmentGuides(move.alignmentGuides);
        mutateDocument(
          (draft) => {
            draft.nodes = move.nodes;
          },
          { captureHistory: false, status: move.status }
        );
        return;
      }

      if (currentDrag.kind === "marquee") {
        graphDrag.setAlignmentGuides([]);
        if (!stageRef.current) {
          return;
        }
        const rect = stageRef.current.getBoundingClientRect();
        graphDrag.updateMarquee(event.clientX - rect.left, event.clientY - rect.top);
        return;
      }

      graphDrag.setAlignmentGuides([]);
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
        graphSelection.selectNodesInWorldRect(detailRef.current.document.nodes ?? [], {
          left: rectStart.x,
          right: rectEnd.x,
          top: rectStart.y,
          bottom: rectEnd.y,
          hiddenNodeIds
        });
        graphDrag.clearActiveDrag();
        return;
      }
      graphDrag.clearActiveDrag();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", graphDrag.clearActiveDrag);
    window.addEventListener("blur", graphDrag.clearActiveDrag);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", graphDrag.clearActiveDrag);
      window.removeEventListener("blur", graphDrag.clearActiveDrag);
    };
  }, [dragState, graphDrag, hiddenNodeIds, selectionBox]);

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

    closeContextMenu();
    clearNodeSelection();
    setSelectedEdgeId("");
    setLinkFromNodeId("");
    graphDrag.setAlignmentGuides([]);
    if (event.shiftKey && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const startX = event.clientX - rect.left;
      const startY = event.clientY - rect.top;
      graphDrag.beginMarquee(startX, startY);
      return;
    }
    graphDrag.beginPan({
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

    closeContextMenu();
    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      toggleNodeInSelection(node.id);
      return;
    }

    const nextSelection = selectedNodeIds.includes(node.id) ? selectedNodeIds : [node.id];
    graphSelection.selectNodeIds(nextSelection, { activeNodeId: node.id });
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
      graphDrag.beginMultiNodeDrag({
        nodeIds: nextSelection,
        pointerX: event.clientX,
        pointerY: event.clientY,
        origins
      });
      return;
    }
    graphDrag.beginNodeDrag({
      nodeId: node.id,
      pointerX: event.clientX,
      pointerY: event.clientY,
      originX: node.x,
      originY: node.y
    });
  }

  function handleNodeClick(nodeId: string, event?: React.MouseEvent<HTMLButtonElement>) {
    closeContextMenu();
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

    graphViewport.focusNode(node);
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
    graphSelection.selectNodeIds([result.node.id], { activeNodeId: result.node.id });
    setStatusMessage("已复制节点");
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
            onExportJson={graphImportExport.exportJson}
            onExportPng={() => void graphImportExport.exportPng()}
            onExportSvg={graphImportExport.exportSvg}
            onLocateNode={handleLocateNode}
            onQuickNodeTypeChange={setQuickNodeType}
            onRedo={redoCurrentGraph}
            onSearchChange={setGraphSearch}
            onToggleKeyboardGuide={() => setShowKeyboardGuide((current) => !current)}
            onToggleLinkMode={() => setLinkFromNodeId((current) => (current ? "" : selectedNodeId))}
            onUndo={undoCurrentGraph}
            onZoomIn={() => graphViewport.zoomGraph(0.1, "已放大画布")}
            onZoomOut={() => graphViewport.zoomGraph(-0.1, "已缩小画布")}
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
              focusPreview={graphViewport.focusPreview}
              graphDetail={graphDetail}
              hiddenNodeIds={hiddenNodeIds}
              linkFromNodeId={linkFromNodeId}
              minimapViewport={graphViewport.minimapViewport}
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
              onWheel={graphViewport.handleWheel}
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
                        closeContextMenu();
                      }}
                      onCreateCanvasNoteNode={() => {
                        createNode("rich-note");
                        closeContextMenu();
                      }}
                      onCreateCanvasTextNode={() => {
                        createNode("text");
                        closeContextMenu();
                      }}
                      onCreateGroup={() => {
                        if (contextMenuNode) {
                          createGroupForNode(contextMenuNode);
                        }
                        closeContextMenu();
                      }}
                      onDeleteEdge={() => {
                        mutateDocument((draft) => {
                          draft.edges = draft.edges.filter((edge) => edge.id !== contextMenu.edgeId);
                        });
                        setSelectedEdgeId("");
                        closeContextMenu();
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
                        graphSelection.selectNodeIds(
                          selectedNodeIds.filter((item) => item !== nodeId),
                          { activeNodeId: "", clearEdgeSelection: false }
                        );
                        closeContextMenu();
                      }}
                      onDuplicateNode={() => {
                        duplicateNode(contextMenu.nodeId || "");
                        closeContextMenu();
                      }}
                      onExportPng={() => {
                        void graphImportExport.exportPng();
                        closeContextMenu();
                      }}
                      onFocusNode={() => {
                        if (contextMenuNode) {
                          graphViewport.focusNode(contextMenuNode);
                        }
                        closeContextMenu();
                      }}
                      onOpenSource={() => {
                        if (contextMenuSourceBacklink) {
                          navigate(contextMenuSourceBacklink.target);
                        }
                        closeContextMenu();
                      }}
                      onToggleEdgeKind={() => {
                        mutateDocument((draft) => {
                          draft.edges = draft.edges.map((edge) =>
                            edge.id === contextMenu.edgeId
                              ? { ...edge, kind: edge.kind === "curve" ? "straight" : "curve" }
                              : edge
                          );
                        });
                        closeContextMenu();
                      }}
                      onToggleLinkStart={() => {
                        setLinkFromNodeId((current) => (current === contextMenu.nodeId ? "" : contextMenu.nodeId || ""));
                        setSingleNodeSelection(contextMenu.nodeId || "");
                        closeContextMenu();
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

          <GraphWorkspaceImportPanel
            canImport={Boolean(graphDetail)}
            canValidate={Boolean(graphDetail)}
            importMode={importMode}
            importSource={importSource}
            onImport={() => void graphImportExport.importGraph()}
            onImportModeChange={setImportMode}
            onImportSourceChange={setImportSource}
            onValidate={() => void handleValidateGraph()}
            saving={saving}
            validationIssues={validationIssues}
          />

          <GraphWorkspaceRecoveryPanel
            canGenerateCards={Boolean(selectedNode)}
            cardDrafts={cardDrafts}
            decks={decks}
            onCommitCardDrafts={() => void handleCommitCardDrafts()}
            onDraftDeckChange={setSelectedDraftDeckId}
            onDraftFieldChange={handleDraftFieldChange}
            onGenerateCards={() => void handleGenerateCards()}
            onRestoreSnapshot={(versionNumber) => void restoreSnapshot(versionNumber)}
            saving={saving}
            selectedDraftDeckId={selectedDraftDeckId}
            snapshots={snapshots}
          />

          <GraphWorkspaceSourceSummary
            onOpenSource={(target) => navigate(target)}
            summary={sourceReferenceSummary}
          />

          <GraphWorkspaceSelectionPanel
            batchEmphasis={batchEmphasis ?? "default"}
            batchSizePreset={batchSizePreset ?? "default"}
            batchTone={batchTone ?? "neutral"}
            groups={document?.groups ?? []}
            onAlignSelectedNodes={alignSelectedNodes}
            onApplyBatchEmphasis={applyBatchEmphasis}
            onApplyBatchSizePreset={applyBatchSizePreset}
            onApplyBatchTone={applyBatchTone}
            onClearNodeSelection={clearNodeSelection}
            onCreateGroupFromSelectedNode={createGroupFromSelectedNode}
            onCreateSourceGroupsFromSelection={createSourceGroupsFromSelection}
            onCreateSourceSwimlanesFromSelection={createSourceSwimlanesFromSelection}
            onDeleteSelectedNodes={deleteSelectedNodes}
            onDistributeSelectedNodes={distributeSelectedNodes}
            onEdgeKindChange={(kind) =>
              selectedEdge
                ? mutateDocument((draft) => {
                    draft.edges = draft.edges.map((edge) => (edge.id === selectedEdge.id ? { ...edge, kind } : edge));
                  })
                : undefined
            }
            onEdgeLabelChange={(label) =>
              selectedEdge
                ? mutateDocument((draft) => {
                    draft.edges = draft.edges.map((edge) => (edge.id === selectedEdge.id ? { ...edge, label } : edge));
                  })
                : undefined
            }
            onGroupTitleChange={(groupId, title) =>
              mutateDocument((draft) => {
                draft.groups = draft.groups.map((item) => (item.id === groupId ? { ...item, title } : item));
              })
            }
            onNodeDetailChange={(detail) =>
              selectedNode
                ? mutateDocument((draft) => {
                    draft.nodes = draft.nodes.map((node) =>
                      node.id === selectedNode.id ? patchNodeAppearance(node, { detail }) : node
                    );
                  })
                : undefined
            }
            onNodeEmphasisChange={(emphasis) =>
              selectedNode
                ? mutateDocument((draft) => {
                    draft.nodes = draft.nodes.map((node) =>
                      node.id === selectedNode.id ? patchNodeAppearance(node, { emphasis }) : node
                    );
                  })
                : undefined
            }
            onNodeMetadataFieldChange={(field, value) =>
              selectedNode
                ? mutateDocument(
                    (draft) => {
                      draft.nodes = draft.nodes.map((node) =>
                        node.id === selectedNode.id ? patchGraphNodeMetadataField(node, field, value) : node
                      );
                    },
                    { label: `编辑${getGraphNodeMetadataEditorFields(selectedNode).find((item) => item.field === field)?.label ?? "节点元数据"}` }
                  )
                : undefined
            }
            onNodeSizePresetChange={(preset) =>
              selectedNode
                ? mutateDocument((draft) => {
                    draft.nodes = draft.nodes.map((node) =>
                      node.id === selectedNode.id ? resizeNodeToPreset(node, preset) : node
                    );
                  })
                : undefined
            }
            onNodeTitleChange={(title) =>
              selectedNode
                ? mutateDocument((draft) => {
                    draft.nodes = draft.nodes.map((node) => (node.id === selectedNode.id ? { ...node, title } : node));
                  })
                : undefined
            }
            onNodeToneChange={(tone) =>
              selectedNode
                ? mutateDocument((draft) => {
                    draft.nodes = draft.nodes.map((node) =>
                      node.id === selectedNode.id ? patchNodeAppearance(node, { tone }) : node
                    );
                  })
                : undefined
            }
            onOpenSource={(target) => navigate(target)}
            onOrganizeSelectedNodesBySource={organizeSelectedNodesBySource}
            onToggleGroupCollapse={toggleGroupCollapse}
            selectedEdge={selectedEdge}
            selectedNode={selectedNode}
            selectedNodeIds={selectedNodeIds}
            selectedNodeSourceBacklink={selectedNodeSourceBacklink}
            selectedNodes={selectedNodes}
            selectedSourceSummary={selectedSourceSummary}
          />
        </section>
      </div>
    </>
  );
}
