import { describe, expect, it } from "vitest";
import { resolveGraphKeyboardShortcut } from "./graphKeyboardShortcuts";

function key(overrides: Partial<Parameters<typeof resolveGraphKeyboardShortcut>[0]>) {
  return {
    key: "",
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...overrides
  };
}

const baseContext = {
  isTyping: false,
  selectedNodeCount: 0,
  hasSelectedEdge: false,
  hasDocument: true
};

describe("resolveGraphKeyboardShortcut", () => {
  it("keeps global save and history shortcuts active in text inputs", () => {
    expect(resolveGraphKeyboardShortcut(key({ key: "s", ctrlKey: true }), { ...baseContext, isTyping: true })).toBe("save");
    expect(resolveGraphKeyboardShortcut(key({ key: "z", metaKey: true }), { ...baseContext, isTyping: true })).toBe("undo");
    expect(resolveGraphKeyboardShortcut(key({ key: "z", ctrlKey: true, shiftKey: true }), { ...baseContext, isTyping: true })).toBe("redo");
  });

  it("ignores selection and editing canvas shortcuts while typing", () => {
    expect(resolveGraphKeyboardShortcut(key({ key: "a", ctrlKey: true }), { ...baseContext, isTyping: true })).toBe("none");
    expect(resolveGraphKeyboardShortcut(key({ key: "Delete" }), { ...baseContext, isTyping: true, selectedNodeCount: 1 })).toBe("none");
    expect(resolveGraphKeyboardShortcut(key({ key: "?" }), { ...baseContext, isTyping: true })).toBe("none");
  });

  it("resolves graph editing shortcuts from the current selection state", () => {
    expect(resolveGraphKeyboardShortcut(key({ key: "a", ctrlKey: true }), baseContext)).toBe("select-all");
    expect(resolveGraphKeyboardShortcut(key({ key: "Delete" }), { ...baseContext, selectedNodeCount: 2 })).toBe("delete-nodes");
    expect(resolveGraphKeyboardShortcut(key({ key: "Delete" }), { ...baseContext, hasSelectedEdge: true })).toBe("delete-edge");
    expect(resolveGraphKeyboardShortcut(key({ key: "f" }), { ...baseContext, selectedNodeCount: 1 })).toBe("focus-selection");
    expect(resolveGraphKeyboardShortcut(key({ key: "g" }), { ...baseContext, selectedNodeCount: 3 })).toBe("group-selection");
    expect(resolveGraphKeyboardShortcut(key({ key: "l" }), { ...baseContext, selectedNodeCount: 1 })).toBe("toggle-link-mode");
  });

  it("requires a graph document for viewport reset", () => {
    expect(resolveGraphKeyboardShortcut(key({ key: "0" }), baseContext)).toBe("reset-viewport");
    expect(resolveGraphKeyboardShortcut(key({ key: "0" }), { ...baseContext, hasDocument: false })).toBe("none");
    expect(resolveGraphKeyboardShortcut(key({ key: "Escape" }), { ...baseContext, hasDocument: false })).toBe("escape");
  });
});
