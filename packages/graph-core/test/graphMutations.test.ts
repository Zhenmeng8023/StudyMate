import test from "node:test";
import assert from "node:assert/strict";
import {
  appendGraphEdgeToDocument,
  createGraphGroupForNodes,
  duplicateGraphNodeInDocument,
  removeGraphNodesFromDocument,
  toggleGraphGroupCollapse,
  type GraphDocument
} from "../src/index.ts";

function buildDocument(overrides: Partial<GraphDocument> = {}): GraphDocument {
  return {
    id: "graph-1",
    version: 1,
    schemaVersion: 1,
    viewport: { x: 0, y: 0, zoom: 1 },
    nodes: [
      { id: "node-a", type: "concept", title: "Alpha", x: 100, y: 120, width: 200, height: 100, metadata: { detail: "A" } },
      { id: "node-b", type: "note", title: "Beta", x: 380, y: 240, width: 220, height: 120 },
      { id: "node-c", type: "card", title: "Gamma", x: 760, y: 360, width: 180, height: 90 }
    ],
    edges: [
      { id: "edge-ab", sourceNodeId: "node-a", targetNodeId: "node-b", label: "related" },
      { id: "edge-bc", sourceNodeId: "node-b", targetNodeId: "node-c" }
    ],
    groups: [
      {
        id: "group-1",
        title: "Group",
        nodeIds: ["node-a", "node-b"],
        x: 70,
        y: 70,
        width: 620,
        height: 360,
        collapsed: false
      }
    ],
    ...overrides
  };
}

test("removeGraphNodesFromDocument removes nodes immutably and cleans dependent edges and groups", () => {
    const document = buildDocument();
    const next = removeGraphNodesFromDocument(document, ["node-b"]);

  assert.notEqual(next, document);
  assert.deepEqual(next.nodes.map((node) => node.id), ["node-a", "node-c"]);
  assert.deepEqual(next.edges, []);
  assert.deepEqual(next.groups[0].nodeIds, ["node-a"]);
  assert.equal(document.nodes.length, 3);
  assert.equal(document.edges.length, 2);
});

test("appendGraphEdgeToDocument adds an edge once and leaves duplicate source-target pairs untouched", () => {
    const document = buildDocument();
    const first = appendGraphEdgeToDocument(document, {
      id: "edge-ac",
      kind: "curve",
      sourceNodeId: "node-a",
      targetNodeId: "node-c",
      label: "explains",
      metadata: { targetNodeIds: ["node-c"] }
    });
    const duplicate = appendGraphEdgeToDocument(first.document, {
      id: "edge-ac-copy",
      sourceNodeId: "node-a",
      targetNodeId: "node-c"
    });

  assert.equal(first.created, true);
  assert.deepEqual(first.document.edges.map((edge) => edge.id), ["edge-ab", "edge-bc", "edge-ac"]);
  assert.equal(duplicate.created, false);
  assert.equal(duplicate.reason, "duplicate");
  assert.deepEqual(duplicate.document.edges.map((edge) => edge.id), ["edge-ab", "edge-bc", "edge-ac"]);
});

test("duplicateGraphNodeInDocument duplicates a node with copied metadata and clamped stage position", () => {
    const document = buildDocument();
    const result = duplicateGraphNodeInDocument(document, "node-a", {
      makeNodeId: () => "node-copy",
      stageWidth: 260,
      stageHeight: 180
    });

  assert.equal(result.node?.id, "node-copy");
  assert.equal(result.node?.title, "Alpha 副本");
  assert.equal(result.node?.x, 60);
  assert.equal(result.node?.y, 80);
  assert.deepEqual(result.node?.metadata, { detail: "A" });
  assert.notEqual(result.node?.metadata, document.nodes[0].metadata);
  assert.equal(result.document.nodes.length, 4);
});

test("createGraphGroupForNodes creates a group around selected node bounds", () => {
    const document = buildDocument();
    const result = createGraphGroupForNodes(document, ["node-a", "node-b"], {
      makeGroupId: () => "group-new",
      title: "Selected group"
    });

  assert.deepEqual(result.group, {
      id: "group-new",
      title: "Selected group",
      nodeIds: ["node-a", "node-b"],
      x: 64,
      y: 74,
      width: 572,
      height: 328,
      collapsed: false
    });
  assert.deepEqual(result.document.groups.map((group) => group.id), ["group-1", "group-new"]);
});

test("toggleGraphGroupCollapse toggles group collapse without mutating other groups", () => {
    const document = buildDocument();
    const next = toggleGraphGroupCollapse(document, "group-1");

  assert.equal(next.groups[0].collapsed, true);
  assert.equal(document.groups[0].collapsed, false);
  assert.equal(toggleGraphGroupCollapse(next, "missing"), next);
});
