import { useCallback, useState } from "react";
import {
  clearGraphNodeSelection,
  createGraphSelectionState,
  replaceGraphNodeSelection,
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
  const [selection, setSelection] = useState(createGraphSelectionState);

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
      const nextSelection = setGraphNodeSelection(selection, nodeId);
      setSelection(nextSelection);
      clearEdgeSelection();
      return nextSelection;
    },
    [clearEdgeSelection, selection]
  );

  const clearNodeSelection = useCallback(() => {
    const nextSelection = clearGraphNodeSelection(selection);
    setSelection(nextSelection);
    return nextSelection;
  }, [selection]);

  const resetNodeSelection = useCallback(() => {
    setSelection(createGraphSelectionState());
  }, []);

  const toggleNodeSelection = useCallback(
    (nodeId: string) => {
      const nextSelection = toggleGraphNodeSelection(selection, nodeId);
      setSelection(nextSelection);
      clearEdgeSelection();
      return nextSelection;
    },
    [clearEdgeSelection, selection]
  );

  const selectNodeIds = useCallback(
    (nodeIds: string[], selectOptions: SelectNodeIdsOptions = {}) => {
      const nextSelection = replaceGraphNodeSelection(selection, nodeIds, {
        activeNodeId: selectOptions.activeNodeId
      });
      setSelection(nextSelection);
      clearEdgeSelection(selectOptions.clearEdgeSelection ?? true);
    },
    [clearEdgeSelection, selection]
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
    selectedNodeId: selection.selectedNodeId,
    selectedNodeIds: selection.selectedNodeIds,
    selectNodesInWorldRect,
    selectSingleNode,
    toggleNodeSelection
  };
}
