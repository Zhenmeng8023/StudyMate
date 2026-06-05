export type GraphKeyboardShortcutAction =
  | "toggle-keyboard-guide"
  | "save"
  | "select-all"
  | "undo"
  | "redo"
  | "delete-nodes"
  | "delete-edge"
  | "focus-selection"
  | "group-selection"
  | "toggle-link-mode"
  | "reset-viewport"
  | "escape"
  | "none";

export type GraphKeyboardShortcutEvent = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
};

export type GraphKeyboardShortcutContext = {
  isTyping: boolean;
  selectedNodeCount: number;
  hasSelectedEdge: boolean;
  hasDocument: boolean;
};

export function resolveGraphKeyboardShortcut(
  event: GraphKeyboardShortcutEvent,
  context: GraphKeyboardShortcutContext
): GraphKeyboardShortcutAction {
  const key = event.key.toLowerCase();
  const command = Boolean(event.ctrlKey || event.metaKey);

  if ((event.key === "?" || (event.shiftKey && event.key === "/")) && !context.isTyping) {
    return "toggle-keyboard-guide";
  }

  if (command && key === "s") {
    return "save";
  }

  if (command && key === "a" && !context.isTyping) {
    return "select-all";
  }

  if (command && key === "z" && !event.shiftKey) {
    return "undo";
  }

  if (command && (key === "y" || (event.shiftKey && key === "z"))) {
    return "redo";
  }

  if (context.isTyping) {
    return "none";
  }

  if (event.key === "Delete") {
    if (context.selectedNodeCount > 0) {
      return "delete-nodes";
    }
    return context.hasSelectedEdge ? "delete-edge" : "none";
  }

  if (key === "f" && context.selectedNodeCount === 1) {
    return "focus-selection";
  }

  if (key === "g" && context.selectedNodeCount > 0) {
    return "group-selection";
  }

  if (key === "l" && context.selectedNodeCount === 1) {
    return "toggle-link-mode";
  }

  if (event.key === "0" && context.hasDocument) {
    return "reset-viewport";
  }

  return event.key === "Escape" ? "escape" : "none";
}
