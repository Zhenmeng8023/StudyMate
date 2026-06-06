import { useCallback, useState } from "react";
import {
  clearGraphNodeSelection,
  selectGraphNodesInRect,
  setGraphNodeSelection,
  toggleGraphNodeSelection
} from "@studymate/graph-core";
import type { GraphNodePayload } from "../../../api/client";

type SelectNodeIdsOptions = {
  activeNodeId?: string;
  clearEdgeSelection?: boolean;
};

type GraphSelectionStateOptions = {
  onClearEdgeSelection?: () => void;
};

type GraphWorldSelectionRect = {
  bottom: number;
  hiddenNodeIds?: Set<string>;
  left: number;
  right: number;
  top: number;
};

export function useGraphSelectionState(options: GraphSelectionStateOptions = {}) {
  const { onClearEdgeSelection } = options;
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  const clearEdgeSelection = useCallback(
    (enabled = true) => {
      if (enabled) {
        onClearEdgeSelection?.();
      }
    },
    [onClearEdgeSelection]
  );

  const selectSingleNode = useCallback(
    (nodeId: string) => {
      const nextSelection = setGraphNodeSelection({ selectedNodeId, selectedNodeIds }, nodeId);
      setSelectedNodeId(nextSelection.selectedNodeId);
      setSelectedNodeIds(nextSelection.selectedNodeIds);
      clearEdgeSelection();
      return nextSelection;
    },
    [clearEdgeSelection, selectedNodeId, selectedNodeIds]
  );

  const clearNodeSelection = useCallback(() => {
    const nextSelection = clearGraphNodeSelection({ selectedNodeId, selectedNodeIds });
    setSelectedNodeId(nextSelection.selectedNodeId);
    setSelectedNodeIds(nextSelection.selectedNodeIds);
    return nextSelection;
  }, [selectedNodeId, selectedNodeIds]);

  const resetNodeSelection = useCallback(() => {
    setSelectedNodeId("");
    setSelectedNodeIds([]);
  }, []);

  const toggleNodeSelection = useCallback(
    (nodeId: string) => {
      const nextSelection = toggleGraphNodeSelection({ selectedNodeId, selectedNodeIds }, nodeId);
      setSelectedNodeId(nextSelection.selectedNodeId);
      setSelectedNodeIds(nextSelection.selectedNodeIds);
      clearEdgeSelection();
      return nextSelection;
    },
    [clearEdgeSelection, selectedNodeId, selectedNodeIds]
  );

  const selectNodeIds = useCallback(
    (nodeIds: string[], selectOptions: SelectNodeIdsOptions = {}) => {
      setSelectedNodeIds([...nodeIds]);
      setSelectedNodeId(selectOptions.activeNodeId ?? nodeIds[0] ?? "");
      clearEdgeSelection(selectOptions.clearEdgeSelection ?? true);
    },
    [clearEdgeSelection]
  );

  const selectNodesInWorldRect = useCallback(
    (nodes: GraphNodePayload[], rect: GraphWorldSelectionRect, selectOptions: SelectNodeIdsOptions = {}) => {
      const matched = selectGraphNodesInRect(nodes, rect);
      selectNodeIds(matched, {
        activeNodeId: selectOptions.activeNodeId ?? matched[0] ?? "",
        clearEdgeSelection: selectOptions.clearEdgeSelection
      });
      return matched;
    },
    [selectNodeIds]
  );

  return {
    clearNodeSelection,
    resetNodeSelection,
    selectNodeIds,
    selectedNodeId,
    selectedNodeIds,
    selectNodesInWorldRect,
    selectSingleNode,
    toggleNodeSelection
  };
}
