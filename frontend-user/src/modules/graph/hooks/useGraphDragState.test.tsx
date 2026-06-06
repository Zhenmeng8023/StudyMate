import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { AlignmentGuide } from "../lib/workspaceControllerHelpers";
import { useGraphDragState } from "./useGraphDragState";

const guide: AlignmentGuide = {
  end: 120,
  label: "左边缘对齐",
  match: "start",
  orientation: "vertical",
  position: 80,
  start: 20
};

function DragStateHarness() {
  const drag = useGraphDragState();

  return (
    <div>
      <button onClick={() => drag.beginMarquee(12, 18)} type="button">
        marquee
      </button>
      <button onClick={() => drag.updateMarquee(44, 66)} type="button">
        update marquee
      </button>
      <button onClick={() => drag.beginPan({ originX: 140, originY: 120, pointerX: 5, pointerY: 6 })} type="button">
        pan
      </button>
      <button onClick={() => drag.beginNodeDrag({ nodeId: "node-1", originX: 20, originY: 30, pointerX: 7, pointerY: 8 })} type="button">
        node
      </button>
      <button
        onClick={() =>
          drag.beginMultiNodeDrag({
            nodeIds: ["node-1", "node-2"],
            origins: {
              "node-1": { x: 20, y: 30 },
              "node-2": { x: 60, y: 70 }
            },
            pointerX: 9,
            pointerY: 10
          })
        }
        type="button"
      >
        multi
      </button>
      <button onClick={() => drag.setAlignmentGuides([guide])} type="button">
        guides
      </button>
      <button onClick={() => drag.clearActiveDrag()} type="button">
        clear
      </button>
      <span>kind:{drag.dragState?.kind ?? ""}</span>
      <span>box:{drag.selectionBox ? `${drag.selectionBox.left},${drag.selectionBox.top},${drag.selectionBox.width},${drag.selectionBox.height}` : ""}</span>
      <span>guides:{drag.alignmentGuides.map((item) => item.label).join(",")}</span>
      <span>nodes:{drag.dragState?.kind === "multi-node" ? drag.dragState.nodeIds.join(",") : ""}</span>
    </div>
  );
}

describe("useGraphDragState", () => {
  afterEach(() => {
    cleanup();
  });

  it("starts and updates marquee state with a stable selection box", () => {
    render(<DragStateHarness />);

    fireEvent.click(screen.getByRole("button", { name: "marquee" }));
    expect(screen.getByText("kind:marquee")).toBeInTheDocument();
    expect(screen.getByText("box:12,18,0,0")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "update marquee" }));
    expect(screen.getByText("box:12,18,32,48")).toBeInTheDocument();
  });

  it("tracks pan, single-node, multi-node, guides, and clear state", () => {
    render(<DragStateHarness />);

    fireEvent.click(screen.getByRole("button", { name: "pan" }));
    expect(screen.getByText("kind:pan")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "node" }));
    expect(screen.getByText("kind:node")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "multi" }));
    expect(screen.getByText("kind:multi-node")).toBeInTheDocument();
    expect(screen.getByText("nodes:node-1,node-2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "guides" }));
    expect(screen.getByText("guides:左边缘对齐")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "clear" }));
    expect(screen.getByText("kind:")).toBeInTheDocument();
    expect(screen.getByText("box:")).toBeInTheDocument();
    expect(screen.getByText("guides:")).toBeInTheDocument();
  });
});
