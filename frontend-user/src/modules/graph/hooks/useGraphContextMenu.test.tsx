import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGraphContextMenu } from "./useGraphContextMenu";

function ContextMenuHarness(props: {
  onEdgeSelect: ReturnType<typeof vi.fn<(edgeId: string) => void>>;
  onNodeSelect: ReturnType<typeof vi.fn<(nodeId: string) => void>>;
}) {
  const contextMenu = useGraphContextMenu({
    onEdgeSelect: props.onEdgeSelect,
    onNodeSelect: props.onNodeSelect
  });

  return (
    <div>
      <button
        data-testid="node-target"
        onContextMenu={(event) => contextMenu.openContextMenu(event, { nodeId: "node-1" })}
        type="button"
      >
        node
      </button>
      <svg>
        <path
          d="M0 0L10 10"
          data-testid="edge-target"
          onContextMenu={(event) => contextMenu.openContextMenu(event, { edgeId: "edge-1" })}
        />
      </svg>
      <button
        data-testid="canvas-target"
        onContextMenu={(event) => contextMenu.openContextMenu(event)}
        type="button"
      >
        canvas
      </button>
      <button data-testid="close-target" onClick={contextMenu.closeContextMenu} type="button">
        close
      </button>
      <span>menu:{contextMenu.contextMenu ? `${contextMenu.contextMenu.x},${contextMenu.contextMenu.y}` : "closed"}</span>
      <span>node:{contextMenu.contextMenu?.nodeId ?? ""}</span>
      <span>edge:{contextMenu.contextMenu?.edgeId ?? ""}</span>
      <span>node-calls:{props.onNodeSelect.mock.calls.length}</span>
      <span>edge-calls:{props.onEdgeSelect.mock.calls.length}</span>
    </div>
  );
}

describe("useGraphContextMenu", () => {
  afterEach(() => {
    cleanup();
  });

  it("opens node, edge, and canvas context menus from browser coordinates", () => {
    const onEdgeSelect = vi.fn<(edgeId: string) => void>();
    const onNodeSelect = vi.fn<(nodeId: string) => void>();
    render(<ContextMenuHarness onEdgeSelect={onEdgeSelect} onNodeSelect={onNodeSelect} />);

    fireEvent.contextMenu(screen.getByTestId("node-target"), { clientX: 120, clientY: 80 });
    expect(screen.getByText("menu:120,80")).toBeInTheDocument();
    expect(screen.getByText("node:node-1")).toBeInTheDocument();
    expect(screen.getByText("node-calls:1")).toBeInTheDocument();

    fireEvent.contextMenu(screen.getByTestId("edge-target"), { clientX: 160, clientY: 90 });
    expect(screen.getByText("menu:160,90")).toBeInTheDocument();
    expect(screen.getByText("edge:edge-1")).toBeInTheDocument();
    expect(screen.getByText("edge-calls:1")).toBeInTheDocument();

    fireEvent.contextMenu(screen.getByTestId("canvas-target"), { clientX: 200, clientY: 140 });
    expect(screen.getByText("menu:200,140")).toBeInTheDocument();
    expect(screen.getByText("node:")).toBeInTheDocument();
    expect(screen.getByText("edge:")).toBeInTheDocument();
  });

  it("closes from explicit actions, outside clicks, and scroll dismissals", () => {
    render(
      <ContextMenuHarness
        onEdgeSelect={vi.fn<(edgeId: string) => void>()}
        onNodeSelect={vi.fn<(nodeId: string) => void>()}
      />
    );

    fireEvent.contextMenu(screen.getByTestId("node-target"), { clientX: 120, clientY: 80 });
    fireEvent.click(screen.getByTestId("close-target"));
    expect(screen.getByText("menu:closed")).toBeInTheDocument();

    fireEvent.contextMenu(screen.getByTestId("node-target"), { clientX: 120, clientY: 80 });
    fireEvent.click(window);
    expect(screen.getByText("menu:closed")).toBeInTheDocument();

    fireEvent.contextMenu(screen.getByTestId("node-target"), { clientX: 120, clientY: 80 });
    fireEvent.scroll(window);
    expect(screen.getByText("menu:closed")).toBeInTheDocument();
  });
});
