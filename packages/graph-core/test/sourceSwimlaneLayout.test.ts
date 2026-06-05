import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSourceSwimlaneLayout,
  parseGraphFocusPreviewSearch,
  summarizeGraphSourceReferences,
  type GraphNode
} from "../src/index.ts";

const nodes: GraphNode[] = [
  {
    id: "note-b",
    type: "note",
    title: "Beta Note",
    x: 0,
    y: 0,
    width: 220,
    height: 110,
    source: { type: "note", id: "note-2", label: "Notes" }
  },
  {
    id: "material-a",
    type: "material",
    title: "Alpha Material",
    x: 0,
    y: 0,
    width: 240,
    height: 120,
    source: { type: "material", id: "material-1", label: "Material" }
  },
  {
    id: "free-c",
    type: "concept",
    title: "Free Concept",
    x: 0,
    y: 0,
    width: 200,
    height: 100
  }
];

test("buildSourceSwimlaneLayout groups nodes into stable source lanes", () => {
  const layout = buildSourceSwimlaneLayout(nodes, {
    anchorX: 100,
    anchorY: 80,
    stageWidth: 1200,
    stageHeight: 900,
    makeGroupId: (key) => `lane-${key}`
  });

  assert.equal(layout.groups.length, 3);
  assert.deepEqual(
    layout.groups.map((group) => group.title),
    ["资料来源泳道", "笔记来源泳道", "自由节点泳道"]
  );
  assert.deepEqual(
    layout.groups.map((group) => group.metadata?.layoutKind),
    ["source-swimlane", "source-swimlane", "source-swimlane"]
  );

  const material = layout.nodes.find((node) => node.id === "material-a");
  const note = layout.nodes.find((node) => node.id === "note-b");
  const free = layout.nodes.find((node) => node.id === "free-c");
  assert.ok(material);
  assert.ok(note);
  assert.ok(free);
  assert.ok(material.x < note.x);
  assert.ok(note.x < free.x);
  assert.equal(material.y, note.y);
});

test("buildSourceSwimlaneLayout is immutable and clamps to stage bounds", () => {
  const original = structuredClone(nodes);
  const layout = buildSourceSwimlaneLayout(nodes, {
    anchorX: 1150,
    anchorY: 850,
    stageWidth: 1200,
    stageHeight: 900,
    makeGroupId: (key) => `lane-${key}`
  });

  assert.deepEqual(nodes, original);
  assert.notEqual(layout.nodes[0], nodes[0]);
  for (const node of layout.nodes) {
    assert.ok(node.x >= 0);
    assert.ok(node.y >= 0);
    assert.ok(node.x + node.width <= 1200);
    assert.ok(node.y + node.height <= 900);
  }
});

test("parseGraphFocusPreviewSearch ignores empty or incomplete focus query", () => {
  assert.equal(parseGraphFocusPreviewSearch(new URLSearchParams()), null);
  assert.equal(parseGraphFocusPreviewSearch(new URLSearchParams("focusX=120&focusY=90")), null);
  assert.equal(parseGraphFocusPreviewSearch(new URLSearchParams("focusX=0&focusY=0&focusWidth=0&focusHeight=0")), null);
});

test("parseGraphFocusPreviewSearch returns a valid focus query", () => {
  assert.deepEqual(
    parseGraphFocusPreviewSearch(
      new URLSearchParams("focusX=120&focusY=90&focusWidth=240&focusHeight=120&focusLabel=AI%20drop")
    ),
    { x: 120, y: 90, width: 240, height: 120, label: "AI drop" }
  );
});

test("summarizeGraphSourceReferences deduplicates sources and counts linked nodes", () => {
  const summary = summarizeGraphSourceReferences([
    ...nodes,
    {
      id: "note-copy",
      type: "note",
      title: "Beta Note Copy",
      x: 0,
      y: 0,
      width: 220,
      height: 110,
      source: { type: "note", id: "note-2", label: "Notes" }
    },
    {
      id: "annotation-d",
      type: "annotation",
      title: "Annotation",
      x: 0,
      y: 0,
      width: 220,
      height: 110,
      source: { type: "annotation", id: "annotation-1", label: "PDF Highlight" }
    }
  ]);

  assert.equal(summary.totalLinkedNodes, 4);
  assert.equal(summary.isolatedNodeCount, 1);
  assert.deepEqual(summary.isolatedNodeIds, ["free-c"]);
  assert.equal(summary.missingSourceNodeCount, 1);
  assert.deepEqual(summary.missingSourceNodeIds, ["free-c"]);
  assert.equal(summary.totalReferences, 3);
  assert.deepEqual(
    summary.typeBuckets.map((bucket) => [bucket.type, bucket.referenceCount, bucket.nodeCount]),
    [
      ["material", 1, 1],
      ["annotation", 1, 1],
      ["note", 1, 2]
    ]
  );

  const noteReference = summary.references.find((reference) => reference.type === "note");
  assert.ok(noteReference);
  assert.equal(noteReference.nodeCount, 2);
  assert.deepEqual(noteReference.nodeIds, ["note-b", "note-copy"]);
});

test("source swimlane layout handles the v1 release performance fixture", () => {
  const nodes = Array.from({ length: 200 }, (_, index) => ({
    id: `node-${index}`,
    type: "text",
    title: `Node ${index}`,
    x: 0,
    y: 0,
    width: 180,
    height: 96,
    source: {
      type: index % 5 === 0 ? "material" : index % 5 === 1 ? "annotation" : index % 5 === 2 ? "note" : "card",
      id: `source-${index % 20}`,
      label: `Source ${index % 20}`
    }
  }));

  const startedAt = performance.now();
  const result = buildSourceSwimlaneLayout(nodes, {
    stageWidth: 2400,
    stageHeight: 1600
  });
  const elapsedMs = performance.now() - startedAt;

  assert.equal(result.nodes.length, 200);
  assert.ok(result.groups.length <= 20);
  assert.ok(elapsedMs < 200, `expected layout under 200ms, got ${elapsedMs}ms`);
});
