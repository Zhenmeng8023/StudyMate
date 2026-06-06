import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGraphKeyboardActions } from "./useGraphKeyboardActions";

function dispatchKey(key: string, overrides: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key,
    ...overrides
  });
  const target = document.activeElement && document.activeElement !== document.body ? document.activeElement : window;
  target.dispatchEvent(event);
  return event;
}

function KeyboardHarness(props: Partial<Parameters<typeof useGraphKeyboardActions>[0]> = {}) {
  const actions = {
    onDeleteSelectedEdge: vi.fn(),
    onDeleteSelectedNodes: vi.fn(),
    onEscape: vi.fn(),
    onFocusSelectedNode: vi.fn(),
    onGroupSelection: vi.fn(),
    onRedo: vi.fn(),
    onResetViewport: vi.fn(),
    onSave: vi.fn(),
    onSelectAll: vi.fn(),
    onToggleKeyboardGuide: vi.fn(),
    onToggleLinkMode: vi.fn(),
    onUndo: vi.fn()
  };

  useGraphKeyboardActions({
    hasDocument: true,
    selectedEdgeId: "",
    selectedNodeId: "",
    selectedNodeIds: [],
    visibleNodeIds: ["node-1", "node-2"],
    ...actions,
    ...props
  });

  return (
    <div>
      <input aria-label="Title input" />
      <span>keyboard harness</span>
    </div>
  );
}

describe("useGraphKeyboardActions", () => {
  afterEach(() => {
    cleanup();
  });

  it("runs global save and history shortcuts while typing", () => {
    const onSave = vi.fn();
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    render(<KeyboardHarness onRedo={onRedo} onSave={onSave} onUndo={onUndo} />);
    screen.getByLabelText("Title input").focus();

    expect(dispatchKey("s", { ctrlKey: true }).defaultPrevented).toBe(true);
    expect(dispatchKey("z", { metaKey: true }).defaultPrevented).toBe(true);
    expect(dispatchKey("z", { ctrlKey: true, shiftKey: true }).defaultPrevented).toBe(true);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it("ignores canvas editing shortcuts while typing", () => {
    const onSelectAll = vi.fn();
    const onDeleteSelectedNodes = vi.fn();
    render(
      <KeyboardHarness
        onDeleteSelectedNodes={onDeleteSelectedNodes}
        onSelectAll={onSelectAll}
        selectedNodeIds={["node-1"]}
        selectedNodeId="node-1"
      />
    );
    screen.getByLabelText("Title input").focus();

    expect(dispatchKey("a", { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(dispatchKey("Delete").defaultPrevented).toBe(false);

    expect(onSelectAll).not.toHaveBeenCalled();
    expect(onDeleteSelectedNodes).not.toHaveBeenCalled();
  });

  it("delegates selection, focus, grouping, link mode, reset, and escape actions", () => {
    const onDeleteSelectedEdge = vi.fn();
    const onDeleteSelectedNodes = vi.fn();
    const onEscape = vi.fn();
    const onFocusSelectedNode = vi.fn();
    const onGroupSelection = vi.fn();
    const onResetViewport = vi.fn();
    const onSelectAll = vi.fn();
    const onToggleKeyboardGuide = vi.fn();
    const onToggleLinkMode = vi.fn();
    render(
      <KeyboardHarness
        onDeleteSelectedEdge={onDeleteSelectedEdge}
        onDeleteSelectedNodes={onDeleteSelectedNodes}
        onEscape={onEscape}
        onFocusSelectedNode={onFocusSelectedNode}
        onGroupSelection={onGroupSelection}
        onResetViewport={onResetViewport}
        onSelectAll={onSelectAll}
        onToggleKeyboardGuide={onToggleKeyboardGuide}
        onToggleLinkMode={onToggleLinkMode}
        selectedEdgeId="edge-1"
        selectedNodeId="node-1"
        selectedNodeIds={["node-1", "node-2"]}
      />
    );

    dispatchKey("?");
    dispatchKey("a", { ctrlKey: true });
    dispatchKey("Delete");
    dispatchKey("f");
    dispatchKey("g");
    dispatchKey("l");
    dispatchKey("0");
    dispatchKey("Escape");

    expect(onToggleKeyboardGuide).toHaveBeenCalledTimes(1);
    expect(onSelectAll).toHaveBeenCalledWith(["node-1", "node-2"]);
    expect(onDeleteSelectedNodes).toHaveBeenCalledWith(["node-1", "node-2"]);
    expect(onFocusSelectedNode).not.toHaveBeenCalled();
    expect(onGroupSelection).toHaveBeenCalledTimes(1);
    expect(onToggleLinkMode).not.toHaveBeenCalled();
    expect(onResetViewport).toHaveBeenCalledTimes(1);
    expect(onEscape).toHaveBeenCalledTimes(1);

    cleanup();

    render(
      <KeyboardHarness
        onDeleteSelectedEdge={onDeleteSelectedEdge}
        onFocusSelectedNode={onFocusSelectedNode}
        onToggleLinkMode={onToggleLinkMode}
        selectedEdgeId="edge-1"
        selectedNodeId="node-1"
        selectedNodeIds={["node-1"]}
      />
    );

    dispatchKey("f");
    dispatchKey("l");
    dispatchKey("Delete");

    expect(onFocusSelectedNode).toHaveBeenCalledWith("node-1");
    expect(onToggleLinkMode).toHaveBeenCalledWith("node-1");
    expect(onDeleteSelectedEdge).not.toHaveBeenCalled();

    cleanup();

    render(<KeyboardHarness onDeleteSelectedEdge={onDeleteSelectedEdge} selectedEdgeId="edge-1" />);
    dispatchKey("Delete");
    expect(onDeleteSelectedEdge).toHaveBeenCalledWith("edge-1");
  });
});
