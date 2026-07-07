import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  parseGraphFocusPreviewSearch,
  summarizeGraphSourceReferences,
} from "@studymate/graph-core";
import {
  AuthSession,
  DeckPayload,
  DiagramTemplatePayload,
  GraphCardDraftPayload,
  GraphDetailPayload,
  GraphDocumentPayload,
  GraphNodeEmphasis,
  GraphNodePayload,
  GraphNodeTone,
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
  previewGraphLayout,
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
  GraphKeyboardGuidePanel
} from "../components/GraphWorkspacePanels";
import {
  GraphConflictAssistCard,
  GraphStageCanvas,
  GraphStageStatus
} from "../components/GraphWorkspaceStageChrome";
import { GraphWorkspaceRecoveryPanel } from "../components/GraphWorkspaceRecoveryPanel";
import {
  GraphWorkspaceSourceRail,
  GraphWorkspaceToolbar,
  type GraphWorkspaceResourceTab
} from "../components/GraphWorkspaceShell";
import {
  GraphWorkspaceCanvasCommandBar,
  GraphWorkspaceDrawerHeading,
  GraphWorkspaceInspectorHeading,
  GraphWorkspaceInspectorTabs,
  GraphWorkspaceResourceTabs,
  type GraphInspectorTab
} from "../components/GraphWorkspaceCanvasChrome";
import { GraphWorkspaceOverviewPanel } from "../components/GraphWorkspaceOverviewPanel";
import { GraphWorkspaceSourceSummary } from "../components/GraphWorkspaceSourceSummary";
import { GraphWorkspaceSelectionPanel } from "../components/GraphWorkspaceSelectionPanel";
import { GraphWorkspaceImportPanel } from "../components/GraphWorkspaceImportPanel";

import {
  applyGraphDocumentChange,
  buildGraphHistoryBoundarySummary,
  createEmptyGraphHistoryState,
  redoGraphDocument,
  resetGraphHistoryState,
  type GraphHistoryState,
  undoGraphDocument
} from "../lib/graphHistory";
import {
  getGraphNodeTypeOption,
  graphNodeTypeOptions,
  type GraphNodeCreationType
} from "../lib/graphNodeTypes";
import {
  getGraphNodeMetadataEditorFields,
  patchGraphNodeMetadataField
} from "../lib/graphNodeMetadata";
import {
  applyGraphBatchEmphasis,
  applyGraphBatchSizePreset,
  applyGraphBatchTone
} from "../lib/graphBatchAppearance";
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
import { buildGraphSourceSwimlaneDocument } from "../lib/graphSourceSwimlanes";
import { buildGraphExportArtifact, buildGraphValidationOutcome } from "../lib/graphFileImportExport";
import {
  connectGraphWorkspaceNodes,
  createGraphWorkspaceGroup,
  createGraphWorkspaceNode,
  deleteGraphWorkspaceNode,
  deleteGraphWorkspaceSelection,
  duplicateGraphWorkspaceNode,
  toggleGraphWorkspaceGroupCollapse,
  type GraphWorkspaceDocumentMutationResult
} from "../lib/graphWorkspaceMutations";
import { buildSnapshotListFailureState } from "../lib/graphPersistenceState";
import { buildGraphSettingsSections } from "../lib/graphSettingsPanel";
import { buildGraphSourceBacklink } from "../lib/graphSourceBacklinks";
import { buildGraphTemplateImportDraft } from "../lib/graphTemplateApplication";
import {
  applyGraphConflictResolutionDrafts,
  buildGraphConflictBundleArtifact,
  buildGraphConflictObjectDetails,
  buildGraphConflictObjectDecisionKey,
  buildGraphConflictResolutionDrafts,
  buildGraphConflictReportArtifact,
  buildGraphUnsavedChangeSummary,
  formatGraphConflictObjectDetail,
  getGraphConflictResolutionChoiceLabel,
  type GraphConflictObjectDetail,
  type GraphConflictObjectScope,
  type GraphConflictResolutionChoice
} from "../lib/graphConflictSummary";
import {
  clearGraphWorkspaceLocalDraft,
  getGraphWorkspaceDraftStorage,
  readGraphWorkspaceLocalDraft,
  recoverGraphWorkspaceLocalDraft
} from "../lib/graphWorkspaceDraftRecovery";
import {
  buildGraphWorkspaceLoadedStatus,
  buildGraphWorkspaceResourceState,
  normalizeGraphWorkspaceDetail
} from "../lib/graphWorkspaceLoadState";
import {
  buildRecoveredLocalDraftState,
  buildStaleLocalDraftDiscardedState
} from "../lib/graphPersistenceState";
import {
  autosaveDelayMs,
  cloneDocument,
  downloadTextFile,
  findHiddenNodeIds,
  getSourceBucketKey,
  getSourceBucketLabel,
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
  const [reloadLatestSuggested, setReloadLatestSuggested] = useState(false);
  const [conflictArtifactsCaptured, setConflictArtifactsCaptured] = useState(false);
  const [manualMergeDeferred, setManualMergeDeferred] = useState(false);
  const [conflictResolutionSelections, setConflictResolutionSelections] = useState<Record<string, GraphConflictResolutionChoice>>({});
  const [latestConflictDetail, setLatestConflictDetail] = useState<GraphDetailPayload | null>(null);
  const [latestConflictError, setLatestConflictError] = useState("");
  const [latestConflictLoading, setLatestConflictLoading] = useState(false);
  const [graphSearch, setGraphSearch] = useState("");
  const [resourcePanelOpen, setResourcePanelOpen] = useState(false);
  const [resourceTab, setResourceTab] = useState<GraphWorkspaceResourceTab>("graphs");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<GraphInspectorTab>("overview");
  const [importMode, setImportMode] = useState<ImportMode>("markdown");
  const [importSource, setImportSource] = useState("# 学习主题\n## 核心概念\n## 待复习问题");
  const [quickNodeType, setQuickNodeType] = useState<GraphNodeCreationType>("text");
  const graphDrag = useGraphDragState();
  const dragState = graphDrag.dragState;
  const selectionBox = graphDrag.selectionBox;
  const alignmentGuides = graphDrag.alignmentGuides;
  const [showKeyboardGuide, setShowKeyboardGuide] = useState(false);
  const detailRef = useRef<GraphDetailPayload | null>(null);
  const lastSyncedDetailRef = useRef<GraphDetailPayload | null>(null);
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
    if (graphDetail && !historyState.dirty) {
      lastSyncedDetailRef.current = graphDetail;
    }
  }, [graphDetail, historyState.dirty]);

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
  const unsavedChangeSummary = useMemo(
    () => buildGraphUnsavedChangeSummary(graphDetail, lastSyncedDetailRef.current),
    [graphDetail]
  );
  const unsavedChangeDetails = useMemo(
    () => buildGraphConflictObjectDetails(graphDetail, lastSyncedDetailRef.current),
    [graphDetail]
  );
  const latestHeadConflictSummary = useMemo(
    () => buildGraphUnsavedChangeSummary(graphDetail, latestConflictDetail),
    [graphDetail, latestConflictDetail]
  );
  const latestHeadConflictDetails = useMemo(
    () => buildGraphConflictObjectDetails(graphDetail, latestConflictDetail),
    [graphDetail, latestConflictDetail]
  );
  const conflictResolutionDrafts = useMemo(
    () =>
      buildGraphConflictResolutionDrafts({
        changeDetails: unsavedChangeDetails,
        latestHeadDetails: latestHeadConflictDetails,
        selections: conflictResolutionSelections
      }),
    [conflictResolutionSelections, latestHeadConflictDetails, unsavedChangeDetails]
  );

  useEffect(() => {
    if (!selectedNode && !selectedEdge) {
      return;
    }
    setInspectorTab("selection");
    setInspectorOpen(true);
    if (typeof window !== "undefined" && window.innerWidth < 1600) {
      setResourcePanelOpen(false);
    }
  }, [selectedEdge?.id, selectedNode?.id]);

  useEffect(() => {
    if (!reloadLatestSuggested || !dirty) {
      return;
    }
    setInspectorTab("conflict");
    setInspectorOpen(true);
    if (typeof window !== "undefined" && window.innerWidth < 1600) {
      setResourcePanelOpen(false);
    }
  }, [dirty, reloadLatestSuggested]);

  useEffect(() => {
    if (inspectorTab === "conflict" && (!reloadLatestSuggested || !dirty)) {
      setInspectorTab("overview");
    }
  }, [dirty, inspectorTab, reloadLatestSuggested]);

  function setWorkspaceStatusMessage(message: string, options?: { suggestReload?: boolean }) {
    setStatusMessage(message);
    setReloadLatestSuggested(Boolean(options?.suggestReload));
  }

  useEffect(() => {
    const currentGraphId = detailRef.current?.id;
    if (!reloadLatestSuggested || !dirty || !currentGraphId) {
      setConflictArtifactsCaptured(false);
      setManualMergeDeferred(false);
      setConflictResolutionSelections({});
      setLatestConflictDetail(null);
      setLatestConflictError("");
      setLatestConflictLoading(false);
      return;
    }

    let cancelled = false;
    setLatestConflictLoading(true);
    setLatestConflictError("");
    void getGraph(props.session, currentGraphId)
      .then((detail) => {
        if (cancelled || detailRef.current?.id !== currentGraphId) {
          return;
        }
        setLatestConflictDetail(normalizeGraphWorkspaceDetail(detail));
        setLatestConflictLoading(false);
      })
      .catch((error) => {
        if (cancelled || detailRef.current?.id !== currentGraphId) {
          return;
        }
        setLatestConflictDetail(null);
        setLatestConflictError(error instanceof Error ? error.message : "暂时无法获取最新图谱差异摘要");
        setLatestConflictLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dirty, props.session, reloadLatestSuggested]);

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
    onReloadLatestSuggestionChange: setReloadLatestSuggested,
    onReplaceGraphSummary: replaceGraphSummary,
    onResetHistory: resetHistory,
    onStatusMessage: (message) => setWorkspaceStatusMessage(message),
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
    onStatusMessage: (message) => setWorkspaceStatusMessage(message),
    onValidationIssuesChange: setValidationIssues,
    session: props.session
  });
  const settingsSections = useMemo(
    () =>
      buildGraphSettingsSections({
        autosaveDelayMs,
        edgeCount: document?.edges.length ?? 0,
        groupCount: document?.groups.length ?? 0,
        historyBoundary: buildGraphHistoryBoundarySummary({
          history: historyState,
          saveState
        }),
        nodeCount: document?.nodes.length ?? 0,
        saveState
      }),
    [document?.edges.length, document?.groups.length, document?.nodes.length, historyState, saveState]
  );
  const graphViewport = useGraphViewportCamera({
    graphDetail,
    locationPathname: location.pathname,
    locationSearch: location.search,
    navigate: (target) => navigate(target, { replace: true, state: null }),
    onPreviewViewport: previewViewport,
    onSelectNode: setSingleNodeSelection,
    onStatusMessage: (message) => setWorkspaceStatusMessage(message),
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

  function clearWorkspaceTransientState() {
    graphSelection.resetNodeSelection();
    setSelectedEdgeId("");
    setLinkFromNodeId("");
    setValidationIssues([]);
    setCardDrafts([]);
    graphDrag.clearActiveDrag();
  }

  function resetHistory(nextDetail: GraphDetailPayload, label?: string) {
    detailRef.current = nextDetail;
    setGraphDetail(nextDetail);
    const nextHistory = resetGraphHistoryState(historyRef.current, label);
    historyRef.current = nextHistory;
    setHistoryState(nextHistory);
    setReloadLatestSuggested(false);
    clearWorkspaceTransientState();
  }

  function applyRecoveredDraft(nextDetail: GraphDetailPayload, label = "恢复本地草稿") {
    detailRef.current = nextDetail;
    setGraphDetail(nextDetail);
    replaceGraphSummary(nextDetail);
    const nextHistory = {
      ...resetGraphHistoryState(historyRef.current, label),
      dirty: true
    };
    historyRef.current = nextHistory;
    setHistoryState(nextHistory);
    clearWorkspaceTransientState();
    setSaveState("dirty");
    setReloadLatestSuggested(false);
  }

  function resolveWorkspaceDetailFromDraft(detail: GraphDetailPayload) {
    const storage = getGraphWorkspaceDraftStorage();
    const draft = readGraphWorkspaceLocalDraft(storage, detail.id);
    const recovery = recoverGraphWorkspaceLocalDraft(detail, draft);
    if (recovery.stale) {
      clearGraphWorkspaceLocalDraft(storage, detail.id);
    }
    return recovery;
  }

  function buildLoadStatusMessage(
    kind: Parameters<typeof buildGraphWorkspaceLoadedStatus>[0],
    snapshotsLoaded: boolean,
    recovery: { recovered: boolean; stale: boolean }
  ) {
    if (recovery.recovered) {
      return snapshotsLoaded
        ? buildRecoveredLocalDraftState().statusMessage
        : `${buildRecoveredLocalDraftState().statusMessage}；${buildSnapshotListFailureState().statusMessage}`;
    }

    if (recovery.stale) {
      return snapshotsLoaded
        ? buildStaleLocalDraftDiscardedState().statusMessage
        : `${buildStaleLocalDraftDiscardedState().statusMessage}；${buildSnapshotListFailureState().statusMessage}`;
    }

    return buildGraphWorkspaceLoadedStatus(kind, snapshotsLoaded);
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
    setWorkspaceStatusMessage(options?.status ?? "图谱有未保存的更改");
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

  function applyWorkspaceMutation(result: GraphWorkspaceDocumentMutationResult) {
    if (!result.changed) {
      return false;
    }

    applyDocument(result.document, { label: result.label, status: result.status });
    if (result.selectedNodeIds) {
      graphSelection.selectNodeIds(result.selectedNodeIds, {
        activeNodeId: result.activeNodeId ?? "",
        clearEdgeSelection: false
      });
    }
    if (result.selectedEdgeId !== undefined) {
      setSelectedEdgeId(result.selectedEdgeId);
    }
    if (result.linkFromNodeId !== undefined) {
      setLinkFromNodeId(result.linkFromNodeId);
    }
    return true;
  }

  function deleteSelectedNodes(nodeIds: string[]) {
    if (nodeIds.length === 0) {
      return;
    }

    const current = detailRef.current;
    if (!current) {
      return;
    }

    const result = deleteGraphWorkspaceSelection(current.document, {
      linkFromNodeId,
      selectedEdgeId: "",
      selectedNodeIds: nodeIds
    });
    applyWorkspaceMutation(result);
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
    setWorkspaceStatusMessage(layout.status);
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
    setWorkspaceStatusMessage("已按来源类型为选中节点建立分组");
  }

  async function createSourceSwimlanesFromSelection() {
    if (selectedNodes.length < 2) {
      return;
    }

    const current = detailRef.current;
    if (!current) {
      return;
    }

    setSaving(true);
    try {
      const preview = await previewGraphLayout(props.session, current.id, {
        mode: "source-swimlane",
        nodeIds: selectedNodeIds,
        document: current.document
      });
      applyDocument(preview.document, { label: "生成来源泳道" });
      graphSelection.selectNodeIds(preview.selectedNodeIds, { activeNodeId: "" });
      setWorkspaceStatusMessage(preview.statusMessage);
      return;
    } catch (error) {
      const fallback = buildGraphSourceSwimlaneDocument(current.document, selectedNodeIds, {
        makeGroupId: () => randomId("swimlane")
      });
      if (fallback.document !== current.document) {
        applyDocument(fallback.document, { label: "生成来源泳道" });
        graphSelection.selectNodeIds(fallback.selectedNodeIds, { activeNodeId: "" });
        setWorkspaceStatusMessage("布局预览接口不可用，已使用本地来源泳道布局");
        return;
      }
      setWorkspaceStatusMessage(error instanceof Error ? error.message : "生成来源泳道失败");
    } finally {
      setSaving(false);
    }
  }

  function applyBatchTone(tone: GraphNodeTone) {
    mutateDocument((draft) => {
      draft.nodes = applyGraphBatchTone(draft.nodes, selectedNodeIds, tone);
    });
  }

  function applyBatchEmphasis(emphasis: GraphNodeEmphasis) {
    mutateDocument((draft) => {
      draft.nodes = applyGraphBatchEmphasis(draft.nodes, selectedNodeIds, emphasis);
    });
  }

  function applyBatchSizePreset(preset: Parameters<typeof resizeNodeToPreset>[1]) {
    mutateDocument((draft) => {
      draft.nodes = applyGraphBatchSizePreset(draft.nodes, selectedNodeIds, preset);
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
    setWorkspaceStatusMessage(status);
  }

  async function loadGraphWorkspace() {
    setLoading(true);
    setWorkspaceStatusMessage("正在同步图谱、资料、笔记和模板...");

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
        setWorkspaceStatusMessage(buildGraphWorkspaceLoadedStatus("created", snapshotsLoaded));
        return;
      }

      setGraphs(graphList);
      const first = await getGraph(props.session, resourceState.initialGraphId);
      const normalized = normalizeGraphWorkspaceDetail(first);
      const recovered = resolveWorkspaceDetailFromDraft(normalized);
      if (recovered.recovered) {
        applyRecoveredDraft(recovered.detail);
      } else {
        resetHistory(normalized, "加载图谱");
      }
      const snapshotsLoaded = await loadSnapshots(resourceState.initialGraphId);
      setWorkspaceStatusMessage(buildLoadStatusMessage("loaded", snapshotsLoaded, recovered));
    } catch (error) {
      setWorkspaceStatusMessage(error instanceof Error ? error.message : "加载图谱工作台失败");
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
    setWorkspaceStatusMessage("正在切换图谱...");
    try {
      const detail = await getGraph(props.session, graphId);
      const normalized = normalizeGraphWorkspaceDetail(detail);
      const recovered = resolveWorkspaceDetailFromDraft(normalized);
      if (recovered.recovered) {
        applyRecoveredDraft(recovered.detail);
      } else {
        resetHistory(normalized, "切换图谱");
      }
      const snapshotsLoaded = await loadSnapshots(graphId);
      setWorkspaceStatusMessage(buildLoadStatusMessage("opened", snapshotsLoaded, recovered));
    } catch (error) {
      setWorkspaceStatusMessage(error instanceof Error ? error.message : "切换图谱失败");
    } finally {
      setLoading(false);
    }
  }

  async function reloadLatestGraph() {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const shouldConfirmDiscard = dirty;
    if (shouldConfirmDiscard && !window.confirm("重新加载最新图谱会丢弃当前未保存修改，确定继续吗？")) {
      return;
    }

    setLoading(true);
    setReloadLatestSuggested(false);
    setWorkspaceStatusMessage("正在重新加载最新图谱...");
    try {
      const detail = await getGraph(props.session, current.id);
      const normalized = normalizeGraphWorkspaceDetail(detail);
      resetHistory(normalized, "重新加载最新图谱");
      const snapshotsLoaded = await loadSnapshots(current.id);
      setSaveState("idle");
      setWorkspaceStatusMessage(
        snapshotsLoaded
          ? shouldConfirmDiscard
            ? "已重新加载最新图谱，未保存更改已放弃"
            : "已重新加载最新图谱"
          : shouldConfirmDiscard
            ? `已重新加载最新图谱，未保存更改已放弃；${buildSnapshotListFailureState().statusMessage}`
            : `已重新加载最新图谱；${buildSnapshotListFailureState().statusMessage}`
      );
    } catch (error) {
      setWorkspaceStatusMessage(error instanceof Error ? error.message : "重新加载图谱失败", { suggestReload: true });
    } finally {
      setLoading(false);
    }
  }

  function deferManualMergeUntilLater() {
    setManualMergeDeferred(true);
    setWorkspaceStatusMessage(
      conflictArtifactsCaptured
        ? "已标记为稍后人工合并，当前继续保留本地草稿"
        : "已保留本地草稿；如需稍后人工合并，建议先导出冲突处理包",
      { suggestReload: true }
    );
  }

  function applyMarkedConflictResolutions() {
    const current = detailRef.current;
    const latest = latestConflictDetail;
    if (!current || !latest) {
      return;
    }
    if (conflictResolutionDrafts.length === 0) {
      setWorkspaceStatusMessage("请先标记至少一项对象级取舍后再应用", { suggestReload: true });
      return;
    }

    const merged = applyGraphConflictResolutionDrafts({
      current,
      drafts: conflictResolutionDrafts,
      latestHead: latest
    });

    lastSyncedDetailRef.current = latest;
    detailRef.current = merged;
    setGraphDetail(merged);
    replaceGraphSummary(merged);
    const nextHistory = {
      ...resetGraphHistoryState(historyRef.current, "应用对象级冲突取舍"),
      dirty: true
    };
    historyRef.current = nextHistory;
    setHistoryState(nextHistory);
    clearWorkspaceTransientState();
    setSaveState("dirty");
    setConflictArtifactsCaptured(false);
    setManualMergeDeferred(false);
    setConflictResolutionSelections({});
    setLatestConflictDetail(null);
    setLatestConflictError("");
    setLatestConflictLoading(false);
    setWorkspaceStatusMessage("已基于最新图谱生成合并草稿，请确认后保存");
  }

  function handleConflictResolutionChoice(
    scope: GraphConflictObjectScope,
    detail: GraphConflictObjectDetail,
    choice: GraphConflictResolutionChoice
  ) {
    const key = buildGraphConflictObjectDecisionKey(scope, detail);
    const currentChoice = conflictResolutionSelections[key];
    const nextChoice = currentChoice === choice ? null : choice;
    const nextSelections = nextChoice
      ? { ...conflictResolutionSelections, [key]: nextChoice }
      : Object.fromEntries(Object.entries(conflictResolutionSelections).filter(([entryKey]) => entryKey !== key));

    setConflictResolutionSelections(nextSelections);
    setManualMergeDeferred(true);
    if (nextChoice) {
      setWorkspaceStatusMessage(
        `已标记对象级取舍：${getGraphConflictResolutionChoiceLabel(nextChoice)}（${formatGraphConflictObjectDetail(detail)}）`,
        { suggestReload: true }
      );
      return;
    }
    setWorkspaceStatusMessage(`已取消对象级取舍标记：${formatGraphConflictObjectDetail(detail)}`, {
      suggestReload: true
    });
  }

  async function copyConflictDraftJson() {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    try {
      const exported = buildGraphExportArtifact({ detail: current, kind: "json" });
      const clipboard = window.navigator?.clipboard;
      if (!clipboard || typeof clipboard.writeText !== "function") {
        throw new Error("当前环境不支持复制当前草稿 JSON，请改用导出。");
      }
      await clipboard.writeText(exported.content);
      setConflictArtifactsCaptured(true);
      setWorkspaceStatusMessage("已复制当前草稿 JSON，可在重载前留存本地修改", { suggestReload: true });
    } catch (error) {
      setWorkspaceStatusMessage(error instanceof Error ? error.message : "复制当前草稿 JSON 失败", {
        suggestReload: true
      });
    }
  }

  async function copyConflictSummaryReport() {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    try {
      const exported = buildGraphConflictReportArtifact({
        changeDetails: unsavedChangeDetails,
        current,
        changeSummary: unsavedChangeSummary,
        latestHeadDetails: latestHeadConflictDetails,
        latestHeadError: latestConflictError,
        latestHeadLoading: latestConflictLoading,
        latestHeadSummary: latestHeadConflictSummary,
        resolutionDrafts: conflictResolutionDrafts
      });
      const clipboard = window.navigator?.clipboard;
      if (!clipboard || typeof clipboard.writeText !== "function") {
        throw new Error("当前环境不支持复制图谱冲突摘要，请改用导出。");
      }
      await clipboard.writeText(exported.content);
      setConflictArtifactsCaptured(true);
      setWorkspaceStatusMessage("已复制图谱冲突摘要，可在重载前同步当前取舍信息", { suggestReload: true });
    } catch (error) {
      setWorkspaceStatusMessage(error instanceof Error ? error.message : "复制图谱冲突摘要失败", {
        suggestReload: true
      });
    }
  }

  function exportConflictDraftJson() {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    try {
      const exported = buildGraphExportArtifact({ detail: current, kind: "json" });
      downloadTextFile(exported.filename, exported.content, exported.mimeType);
      setConflictArtifactsCaptured(true);
      setWorkspaceStatusMessage("已导出当前草稿 JSON，请在重载前妥善留存本地修改", { suggestReload: true });
    } catch {
      setWorkspaceStatusMessage("导出当前草稿 JSON 失败", { suggestReload: true });
    }
  }

  function exportConflictSummaryReport() {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    try {
      const exported = buildGraphConflictReportArtifact({
        changeDetails: unsavedChangeDetails,
        current,
        changeSummary: unsavedChangeSummary,
        latestHeadDetails: latestHeadConflictDetails,
        latestHeadError: latestConflictError,
        latestHeadLoading: latestConflictLoading,
        latestHeadSummary: latestHeadConflictSummary,
        resolutionDrafts: conflictResolutionDrafts
      });
      downloadTextFile(exported.filename, exported.content, exported.mimeType);
      setConflictArtifactsCaptured(true);
      setWorkspaceStatusMessage("已导出图谱冲突摘要，请在重载前同步当前取舍信息", { suggestReload: true });
    } catch {
      setWorkspaceStatusMessage("导出图谱冲突摘要失败", { suggestReload: true });
    }
  }

  async function copyLatestConflictJson() {
    const latest = latestConflictDetail;
    if (!latest) {
      return;
    }

    try {
      const exported = buildGraphExportArtifact({ detail: latest, kind: "json" });
      const clipboard = window.navigator?.clipboard;
      if (!clipboard || typeof clipboard.writeText !== "function") {
        throw new Error("当前环境不支持复制最新图谱 JSON，请改用导出。");
      }
      await clipboard.writeText(exported.content);
      setConflictArtifactsCaptured(true);
      setWorkspaceStatusMessage("已复制最新图谱 JSON，可与本地草稿配合人工比对", { suggestReload: true });
    } catch (error) {
      setWorkspaceStatusMessage(error instanceof Error ? error.message : "复制最新图谱 JSON 失败", {
        suggestReload: true
      });
    }
  }

  function exportLatestConflictJson() {
    const latest = latestConflictDetail;
    if (!latest) {
      return;
    }

    try {
      const exported = buildGraphExportArtifact({ detail: latest, kind: "json" });
      downloadTextFile(exported.filename, exported.content, exported.mimeType);
      setConflictArtifactsCaptured(true);
      setWorkspaceStatusMessage("已导出最新图谱 JSON，可与本地草稿配合人工比对", { suggestReload: true });
    } catch {
      setWorkspaceStatusMessage("导出最新图谱 JSON 失败", { suggestReload: true });
    }
  }

  function exportConflictBundle() {
    const current = detailRef.current;
    const latest = latestConflictDetail;
    if (!current || !latest) {
      return;
    }

    try {
      const currentDraftArtifact = buildGraphExportArtifact({ detail: current, kind: "json" });
      const latestHeadArtifact = buildGraphExportArtifact({ detail: latest, kind: "json" });
      const reportArtifact = buildGraphConflictReportArtifact({
        changeDetails: unsavedChangeDetails,
        current,
        changeSummary: unsavedChangeSummary,
        latestHeadDetails: latestHeadConflictDetails,
        latestHeadError: latestConflictError,
        latestHeadLoading: latestConflictLoading,
        latestHeadSummary: latestHeadConflictSummary,
        resolutionDrafts: conflictResolutionDrafts
      });
      const bundleArtifact = buildGraphConflictBundleArtifact({
        changeDetails: unsavedChangeDetails,
        current,
        changeSummary: unsavedChangeSummary,
        currentDraftArtifact,
        latestHeadArtifact,
        latestHeadDetails: latestHeadConflictDetails,
        latestHeadSummary: latestHeadConflictSummary,
        reportArtifact,
        resolutionDrafts: conflictResolutionDrafts
      });
      downloadTextFile(bundleArtifact.filename, bundleArtifact.content, bundleArtifact.mimeType);
      setConflictArtifactsCaptured(true);
      setWorkspaceStatusMessage("已导出冲突处理包，可稍后人工比对本地与最新版本", { suggestReload: true });
    } catch {
      setWorkspaceStatusMessage("导出冲突处理包失败", { suggestReload: true });
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
    setWorkspaceStatusMessage(`${result.history.lastLabel}，等待保存`);
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
    setWorkspaceStatusMessage(`${result.history.lastLabel}，等待保存`);
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

    const result = createGraphWorkspaceNode(current.document, {
      makeNodeId: () => randomId("node"),
      source,
      type
    });

    applyWorkspaceMutation(result);
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

      const result = connectGraphWorkspaceNodes(current.document, {
        makeEdgeId: () => randomId("edge"),
        sourceNodeId: linkFromNodeId,
        targetNodeId: nodeId
      });
      if (!result.created) {
        setWorkspaceStatusMessage(result.status ?? "无法在这两个节点之间创建连线");
        setLinkFromNodeId(result.linkFromNodeId ?? "");
        return;
      }

      applyWorkspaceMutation(result);
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

    const result = createGraphWorkspaceGroup(current.document, [node.id], {
      makeGroupId: () => randomId("group")
    });
    if (!result.changed) {
      return;
    }

    applyWorkspaceMutation(result);
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

    const result = createGraphWorkspaceGroup(current.document, selectedNodeIds, {
      makeGroupId: () => randomId("group")
    });
    if (!result.changed) {
      return;
    }

    applyWorkspaceMutation(result);
  }

  function toggleGroupCollapse(groupId: string) {
    const current = detailRef.current;
    if (!current) {
      return;
    }
    const result = toggleGraphWorkspaceGroupCollapse(current.document, groupId);
    if (!result.changed) {
      return;
    }
    applyWorkspaceMutation(result);
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
      setWorkspaceStatusMessage("没有找到匹配的节点");
      return;
    }

    graphViewport.focusNode(node);
  }

  function deleteSelectedGraphItems() {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const result = deleteGraphWorkspaceSelection(current.document, {
      linkFromNodeId,
      selectedEdgeId,
      selectedNodeIds
    });
    applyWorkspaceMutation(result);
  }

  function duplicateNode(nodeId: string) {
    const current = detailRef.current;
    if (!current) {
      return;
    }

    const result = duplicateGraphWorkspaceNode(current.document, nodeId, {
      makeNodeId: () => randomId("node"),
      stageWidth,
      stageHeight
    });
    applyWorkspaceMutation(result);
  }

  async function handleValidateGraph() {
    if (!graphDetail) {
      return;
    }

    try {
      const payload = await validateGraph(props.session, graphDetail.id);
      const validation = buildGraphValidationOutcome(payload.issues);
      setValidationIssues(validation.issues);
      setWorkspaceStatusMessage(validation.statusMessage);
    } catch (error) {
      setWorkspaceStatusMessage(error instanceof Error ? error.message : "图谱校验失败");
    }
  }

  async function handleGenerateCards() {
    if (!graphDetail || !selectedNode) {
      setWorkspaceStatusMessage("先选中一个节点，再生成卡片草稿");
      return;
    }

    try {
      const payload = await generateGraphCardDrafts(props.session, graphDetail.id, [selectedNode.id]);
      setCardDrafts(payload);
      setWorkspaceStatusMessage(payload.length ? "已生成卡片草稿" : "没有生成新的卡片草稿");
    } catch (error) {
      setWorkspaceStatusMessage(error instanceof Error ? error.message : "生成卡片草稿失败");
    }
  }

  async function handleCommitCardDrafts() {
    if (!graphDetail || cardDrafts.length === 0) {
      setWorkspaceStatusMessage("先生成卡片草稿，再确认写入卡组");
      return;
    }
    if (!selectedDraftDeckId) {
      setWorkspaceStatusMessage("先选择一个目标卡组");
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
      setWorkspaceStatusMessage(`已将 ${payload.length} 张卡片写入 ${targetDeck?.title || "目标卡组"}。`);
    } catch (error) {
      setWorkspaceStatusMessage(error instanceof Error ? error.message : "写入卡片失败");
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
    const draft = buildGraphTemplateImportDraft(template);
    setImportMode(draft.importMode);
    setImportSource(draft.importSource);
    setWorkspaceStatusMessage(draft.status);
    // Applying a template is an import-preparation action. Move the user directly
    // to the dedicated inspector instead of leaving the generated draft hidden.
    handleInspectorTabChange("import");
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
      setWorkspaceStatusMessage("已创建新图谱");
    } catch (error) {
      setWorkspaceStatusMessage(error instanceof Error ? error.message : "创建图谱失败");
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
      setWorkspaceStatusMessage("图谱已删除");
    } catch (error) {
      setWorkspaceStatusMessage(error instanceof Error ? error.message : "删除图谱失败");
    } finally {
      setSaving(false);
    }
  }

  function shouldUseOverlayDock() {
    return typeof window !== "undefined" && window.innerWidth < 1600;
  }

  function handleResourceTabChange(tab: GraphWorkspaceResourceTab) {
    setResourceTab(tab);
    setResourcePanelOpen(true);
    if (shouldUseOverlayDock()) {
      setInspectorOpen(false);
    }
  }

  function handleInspectorTabChange(tab: GraphInspectorTab) {
    setInspectorTab(tab);
    setInspectorOpen(true);
    if (shouldUseOverlayDock()) {
      setResourcePanelOpen(false);
    }
  }

  function toggleResourcePanel() {
    setResourcePanelOpen((current) => {
      const next = !current;
      if (next && shouldUseOverlayDock()) {
        setInspectorOpen(false);
      }
      return next;
    });
  }

  function toggleInspectorPanel() {
    setInspectorOpen((current) => {
      const next = !current;
      if (next && shouldUseOverlayDock()) {
        setResourcePanelOpen(false);
      }
      return next;
    });
  }

  function handleGraphTitleChange(title: string) {
    const current = detailRef.current;
    if (!current) {
      return;
    }
    const nextDetail = { ...current, title };
    const nextHistory = { ...historyRef.current, dirty: true };
    detailRef.current = nextDetail;
    historyRef.current = nextHistory;
    setGraphDetail(nextDetail);
    setHistoryState(nextHistory);
    setSaveState("dirty");
    replaceGraphSummary(nextDetail);
  }

  function handleGraphDescriptionChange(description: string) {
    const current = detailRef.current;
    if (!current) {
      return;
    }
    const nextDetail = { ...current, description };
    const nextHistory = { ...historyRef.current, dirty: true };
    detailRef.current = nextDetail;
    historyRef.current = nextHistory;
    setGraphDetail(nextDetail);
    setHistoryState(nextHistory);
    setSaveState("dirty");
    replaceGraphSummary(nextDetail);
  }

  const visibleMaterials = materials.slice(0, 6);
  const visibleNotes = notes.slice(0, 6);
  const hasConflict = reloadLatestSuggested && dirty;
  const hasSelection = Boolean(selectedNode || selectedEdge || selectedNodes.length > 1);

  useEffect(() => {
    if (hasSelection) {
      setInspectorOpen(true);
      setInspectorTab("selection");
    }
  }, [hasSelection, selectedEdgeId, selectedNodeId, selectedNodeIds.length]);

  useEffect(() => {
    if (hasConflict) {
      setInspectorOpen(true);
      setInspectorTab("conflict");
    }
  }, [hasConflict]);

  return (
    <div
      className="graph-canvas-workspace"
      data-inspector-open={inspectorOpen}
      data-resource-open={resourcePanelOpen}
    >
      <GraphWorkspaceCanvasCommandBar
        graphDetail={graphDetail}
        inspectorOpen={inspectorOpen}
        onCreateGraph={() => void handleCreateGraph()}
        onSave={() => void saveCurrentGraph("手动保存")}
        onToggleInspector={toggleInspectorPanel}
        onToggleResources={toggleResourcePanel}
        resourcesOpen={resourcePanelOpen}
        saveState={saveState}
        saveStateLabel={saveStateLabel}
        saving={saving}
      />

      <div className="graph-canvas-workspace__body">
        {resourcePanelOpen ? (
          <aside className="graph-resource-drawer" aria-label="图谱资源面板">
            <GraphWorkspaceDrawerHeading
              description="在图谱、来源资料和模板之间切换。"
              onClose={() => setResourcePanelOpen(false)}
              title="资源"
            />
            <GraphWorkspaceResourceTabs activeTab={resourceTab} onChange={handleResourceTabChange} />
            <div className="graph-resource-drawer__body">
              <GraphWorkspaceSourceRail
                activeTab={resourceTab}
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
            </div>
          </aside>
        ) : null}

        <section className="graph-canvas-stage-panel" aria-label="图谱画布">
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

          <div className="graph-stage-shell graph-stage-shell--canvas">
            <GraphStageStatus
              alignmentHintLabels={alignmentHintLabels}
              graphDetail={graphDetail}
              loading={loading}
              onStatusAction={hasConflict ? () => handleInspectorTabChange("conflict") : undefined}
              selectedNodeCount={selectedNodeIds.length}
              statusActionLabel={hasConflict ? "查看冲突处理" : undefined}
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
                    if (detailRef.current) {
                      const result = deleteGraphWorkspaceSelection(detailRef.current.document, {
                        linkFromNodeId,
                        selectedEdgeId: contextMenu.edgeId || "",
                        selectedNodeIds: []
                      });
                      applyWorkspaceMutation(result);
                    }
                    closeContextMenu();
                  }}
                  onDeleteNode={() => {
                    const nodeId = contextMenu.nodeId || "";
                    if (detailRef.current) {
                      const result = deleteGraphWorkspaceNode(detailRef.current.document, nodeId, {
                        linkFromNodeId,
                        selectedNodeIds
                      });
                      applyWorkspaceMutation(result);
                    }
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

        {inspectorOpen ? (
          <aside className="graph-canvas-inspector" aria-label="图谱检查器">
            <GraphWorkspaceInspectorHeading
              hasConflict={hasConflict}
              onClose={() => setInspectorOpen(false)}
              title={inspectorTab === "selection" ? "节点属性" : inspectorTab === "sources" ? "来源关系" : inspectorTab === "history" ? "历史与卡片" : inspectorTab === "import" ? "导入与校验" : inspectorTab === "conflict" ? "冲突处理" : "图谱概览"}
            />
            <GraphWorkspaceInspectorTabs
              activeTab={inspectorTab}
              hasConflict={hasConflict}
              hasSelection={hasSelection}
              onChange={handleInspectorTabChange}
            />
            <div className="graph-canvas-inspector__body">
              {inspectorTab === "overview" ? (
                <GraphWorkspaceOverviewPanel
                  graphDetail={graphDetail}
                  onDelete={() => void handleDeleteCurrentGraph()}
                  onDescriptionChange={handleGraphDescriptionChange}
                  onTitleChange={handleGraphTitleChange}
                  saving={saving}
                  settingsSections={settingsSections}
                />
              ) : null}

              {inspectorTab === "selection" ? (
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
              ) : null}

              {inspectorTab === "sources" ? (
                <GraphWorkspaceSourceSummary
                  onOpenSource={(target) => navigate(target)}
                  summary={sourceReferenceSummary}
                />
              ) : null}

              {inspectorTab === "history" ? (
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
              ) : null}

              {inspectorTab === "import" ? (
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
              ) : null}

              {inspectorTab === "conflict" ? (
                hasConflict ? (
                  <GraphConflictAssistCard
                    changeDetails={unsavedChangeDetails}
                    changeSummary={unsavedChangeSummary}
                    latestHeadAvailable={Boolean(latestConflictDetail)}
                    latestHeadDetails={latestHeadConflictDetails}
                    latestHeadError={latestConflictError}
                    latestHeadLoading={latestConflictLoading}
                    latestHeadSummary={latestHeadConflictSummary}
                    manualMergeDeferred={manualMergeDeferred}
                    materialsCaptured={conflictArtifactsCaptured}
                    resolutionDraftCount={conflictResolutionDrafts.length}
                    resolutionSelections={conflictResolutionSelections}
                    onApplyResolutionDrafts={applyMarkedConflictResolutions}
                    onChooseResolution={handleConflictResolutionChoice}
                    onDeferManualMerge={deferManualMergeUntilLater}
                    onExportConflictBundle={exportConflictBundle}
                    onReloadLatest={() => void reloadLatestGraph()}
                    onCopyLatestJson={() => void copyLatestConflictJson()}
                    onCopySummaryReport={() => void copyConflictSummaryReport()}
                    onCopyDraftJson={() => void copyConflictDraftJson()}
                    onExportLatestJson={exportLatestConflictJson}
                    onExportSummaryReport={exportConflictSummaryReport}
                    onExportDraftJson={exportConflictDraftJson}
                  />
                ) : (
                  <article className="graph-meta-card muted">
                    <strong>当前没有版本冲突</strong>
                    <p>自动保存会在发现服务端版本领先时保留本地草稿，并在这里提供安全的处理入口。</p>
                  </article>
                )
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
