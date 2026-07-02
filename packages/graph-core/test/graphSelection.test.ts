import test from "node:test";
import assert from "node:assert/strict";
import {
  clearGraphNodeSelection,
  createGraphSelectionState,
  replaceGraphNodeSelection,
  selectGraphNodesInRect,
  setGraphNodeSelection,
  toggleGraphNodeSelection,
  type GraphNode
} from "../src/index.ts";

const nodes: GraphNode[] = [
  { id: "node-a", type: "concept", title: "A", x: 10, y: 10, width: 100, height: 80 },
  { id: "node-b", type: "concept", title: "B", x: 140, y: 20, width: 100, height: 80 },
  { id: "node-c", type: "concept", title: "C", x: 320, y: 200, width: 120, height: 90 }
];

test("graph selection state supports single, clear, and toggle immutably", () => {
  const empty = createGraphSelectionState();
  assert.deepEqual(empty, { selectedNodeId: "", selectedNodeIds: [] });

  const single = setGraphNodeSelection(empty, "node-a");
  assert.deepEqual(single, { selectedNodeId: "node-a", selectedNodeIds: ["node-a"] });
  assert.deepEqual(empty, { selectedNodeId: "", selectedNodeIds: [] });

  const added = toggleGraphNodeSelection(single, "node-b");
  assert.deepEqual(added, { selectedNodeId: "node-b", selectedNodeIds: ["node-a", "node-b"] });

  const removedActive = toggleGraphNodeSelection(added, "node-b");
  assert.deepEqual(removedActive, { selectedNodeId: "node-a", selectedNodeIds: ["node-a"] });

  assert.deepEqual(clearGraphNodeSelection(removedActive), { selectedNodeId: "", selectedNodeIds: [] });
});

test("graph selection toggle ignores empty node ids", () => {
  const selected = setGraphNodeSelection(createGraphSelectionState(), "node-a");

  assert.deepEqual(toggleGraphNodeSelection(selected, ""), selected);
  assert.deepEqual(setGraphNodeSelection(selected, ""), createGraphSelectionState());
});

test("replaceGraphNodeSelection normalizes explicit multi-select state", () => {
  const current = setGraphNodeSelection(createGraphSelectionState(), "node-a");

  assert.deepEqual(
    replaceGraphNodeSelection(current, ["node-a", "node-a", "", "node-b"], { activeNodeId: "missing-node" }),
    {
      selectedNodeId: "node-a",
      selectedNodeIds: ["node-a", "node-b"]
    }
  );

  assert.deepEqual(
    replaceGraphNodeSelection(current, ["node-a", "node-b"], { activeNodeId: "node-b" }),
    {
      selectedNodeId: "node-b",
      selectedNodeIds: ["node-a", "node-b"]
    }
  );

  assert.deepEqual(
    replaceGraphNodeSelection(current, ["node-a", "node-b"], { activeNodeId: "" }),
    {
      selectedNodeId: "",
      selectedNodeIds: ["node-a", "node-b"]
    }
  );

  assert.deepEqual(replaceGraphNodeSelection(current, []), createGraphSelectionState());
});

test("selectGraphNodesInRect returns visible intersecting nodes in document order", () => {
  const matched = selectGraphNodesInRect(nodes, {
    left: 0,
    top: 0,
    right: 260,
    bottom: 120,
    hiddenNodeIds: new Set(["node-b"])
  });

  assert.deepEqual(matched, ["node-a"]);
});

test("selectGraphNodesInRect normalizes reversed rectangles", () => {
  assert.deepEqual(
    selectGraphNodesInRect(nodes, {
      left: 260,
      top: 120,
      right: 0,
      bottom: 0
    }),
    ["node-a", "node-b"]
  );
});
