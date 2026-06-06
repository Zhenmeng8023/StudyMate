import { useEffect } from "react";
import { resolveGraphKeyboardShortcut } from "../lib/graphKeyboardShortcuts";
import { isTypingElement } from "../lib/workspaceControllerHelpers";

type GraphKeyboardActionsOptions = {
  hasDocument: boolean;
  onDeleteSelectedEdge: (edgeId: string) => void;
  onDeleteSelectedNodes: (nodeIds: string[]) => void;
  onEscape: () => void;
  onFocusSelectedNode: (nodeId: string) => void;
  onGroupSelection: () => void;
  onRedo: () => void;
  onResetViewport: () => void;
  onSave: () => void;
  onSelectAll: (nodeIds: string[]) => void;
  onToggleKeyboardGuide: () => void;
  onToggleLinkMode: (nodeId: string) => void;
  onUndo: () => void;
  selectedEdgeId: string;
  selectedNodeId: string;
  selectedNodeIds: string[];
  visibleNodeIds: string[];
};

export function useGraphKeyboardActions(options: GraphKeyboardActionsOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const action = resolveGraphKeyboardShortcut(event, {
        hasDocument: options.hasDocument,
        hasSelectedEdge: Boolean(options.selectedEdgeId),
        isTyping: isTypingElement(event.target),
        selectedNodeCount: options.selectedNodeIds.length
      });

      switch (action) {
        case "toggle-keyboard-guide":
          event.preventDefault();
          options.onToggleKeyboardGuide();
          break;
        case "save":
          event.preventDefault();
          options.onSave();
          break;
        case "select-all":
          event.preventDefault();
          options.onSelectAll(options.visibleNodeIds);
          break;
        case "undo":
          event.preventDefault();
          options.onUndo();
          break;
        case "redo":
          event.preventDefault();
          options.onRedo();
          break;
        case "delete-nodes":
          event.preventDefault();
          options.onDeleteSelectedNodes(options.selectedNodeIds);
          break;
        case "delete-edge":
          event.preventDefault();
          options.onDeleteSelectedEdge(options.selectedEdgeId);
          break;
        case "focus-selection":
          event.preventDefault();
          options.onFocusSelectedNode(options.selectedNodeIds[0] ?? "");
          break;
        case "group-selection":
          event.preventDefault();
          options.onGroupSelection();
          break;
        case "toggle-link-mode":
          event.preventDefault();
          options.onToggleLinkMode(options.selectedNodeId);
          break;
        case "reset-viewport":
          event.preventDefault();
          options.onResetViewport();
          break;
        case "escape":
          options.onEscape();
          break;
        case "none":
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options]);
}
