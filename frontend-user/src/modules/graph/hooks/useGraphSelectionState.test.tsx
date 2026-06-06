import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GraphNodePayload } from "../../../api/client";
import { useGraphSelectionState } from "./useGraphSelectionState";

const nodes: GraphNodePayload[] = [
  {
    id: "node-1",
    type: "concept",
    title: "One",
    x: 0,
    y: 0,
    width: 120,
    height: 80
  },
  {
    id: "node-2",
    type: "concept",
    title: "Two",
    x: 160,
    y: 0,
    width: 120,
    height: 80
  },
  {
    id: "node-3",
    type: "concept",
    title: "Hidden",
    x: 320,
    y: 0,
    width: 120,
    height: 80
  }
];

function SelectionHarness(props: { onClearEdgeSelection: () => void }) {
  const { onClearEdgeSelection } = props;
  const selection = useGraphSelectionState({ onClearEdgeSelection });

  return (
    <div>
      <button onClick={() => selection.selectSingleNode("node-1")} type="button">single</button>
      <button onClick={() => selection.toggleNodeSelection("node-2")} type="button">toggle two</button>
      <button onClick={() => selection.toggleNodeSelection("node-1")} type="button">toggle one</button>
      <button onClick={() => selection.selectNodeIds(["node-1", "node-2"], { activeNodeId: "" })} type="button">
        select all
      </button>
      <button onClick={() => selection.clearNodeSelection()} type="button">clear</button>
      <button
        onClick={() =>
          selection.selectNodesInWorldRect(nodes, {
            hiddenNodeIds: new Set(["node-3"]),
            left: -10,
            right: 290,
            top: -10,
            bottom: 90
          })
        }
        type="button"
      >
        marquee
      </button>
      <button onClick={() => selection.resetNodeSelection()} type="button">reset</button>
      <span>active:{selection.selectedNodeId}</span>
      <span>ids:{selection.selectedNodeIds.join(",")}</span>
    </div>
  );
}

describe("useGraphSelectionState", () => {
  afterEach(() => {
    cleanup();
  });

  it("selects, toggles, clears, and resets nodes immutably", () => {
    const onClearEdgeSelection = vi.fn();
    render(<SelectionHarness onClearEdgeSelection={onClearEdgeSelection} />);

    fireEvent.click(screen.getByRole("button", { name: "single" }));
    expect(screen.getByText("active:node-1")).toBeInTheDocument();
    expect(screen.getByText("ids:node-1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "toggle two" }));
    expect(screen.getByText("active:node-2")).toBeInTheDocument();
    expect(screen.getByText("ids:node-1,node-2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "toggle one" }));
    expect(screen.getByText("active:node-2")).toBeInTheDocument();
    expect(screen.getByText("ids:node-2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "clear" }));
    expect(screen.getByText("active:")).toBeInTheDocument();
    expect(screen.getByText("ids:")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "reset" }));
    expect(onClearEdgeSelection).toHaveBeenCalledTimes(3);
  });

  it("supports explicit multi-select and marquee hit testing", () => {
    const onClearEdgeSelection = vi.fn();
    render(<SelectionHarness onClearEdgeSelection={onClearEdgeSelection} />);

    fireEvent.click(screen.getByRole("button", { name: "select all" }));
    expect(screen.getByText("active:")).toBeInTheDocument();
    expect(screen.getByText("ids:node-1,node-2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "marquee" }));
    expect(screen.getByText("active:node-1")).toBeInTheDocument();
    expect(screen.getByText("ids:node-1,node-2")).toBeInTheDocument();
    expect(onClearEdgeSelection).toHaveBeenCalledTimes(2);
  });
});
