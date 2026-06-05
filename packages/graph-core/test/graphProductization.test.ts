import test from "node:test";
import assert from "node:assert/strict";
import {
  buildGraphBenchmarkFixture,
  createGraphHistoryState,
  getLearningGraphTemplates,
  normalizeGraphDocument,
  parseStudymateGraphJson,
  redoGraphHistory,
  sanitizeGraphExportFilename,
  serializeStudymateGraphJson,
  undoGraphHistory,
  validateGraphDocument,
  withGraphHistoryChange,
  type GraphDocument
} from "../src/index.ts";

const baseDocument: GraphDocument = {
  id: "graph-1",
  version: 2,
  schemaVersion: 1,
  viewport: { x: 40, y: 60, zoom: 1 },
  nodes: [
    {
      id: "node-a",
      type: "concept",
      title: "Retrieval practice",
      x: 10,
      y: 20,
      width: 240,
      height: 120,
      source: { type: "note", id: "note-1", label: "Learning note" }
    },
    {
      id: "node-b",
      type: "card",
      title: "Flashcard",
      x: 320,
      y: 20,
      width: 220,
      height: 112,
      source: { type: "card", id: "card-1", label: "Review card" }
    }
  ],
  edges: [
    {
      id: "edge-a",
      kind: "curve",
      sourceNodeId: "node-a",
      targetNodeId: "node-b",
      label: "prepares"
    }
  ],
  groups: [],
  theme: { density: "comfortable" },
  metadata: { owner: "test" }
};

test("normalizeGraphDocument fills defaults without mutating the input", () => {
  const sparse = {
    ...baseDocument,
    id: "",
    viewport: { x: Number.NaN, y: 0, zoom: 0 },
    theme: undefined,
    metadata: undefined
  } as unknown as GraphDocument;
  const original = structuredClone(sparse);

  const normalized = normalizeGraphDocument("graph-normalized", 9, sparse);

  assert.deepEqual(sparse, original);
  assert.equal(normalized.id, "graph-normalized");
  assert.equal(normalized.version, 9);
  assert.equal(normalized.schemaVersion, 1);
  assert.deepEqual(normalized.viewport, { x: 0, y: 0, zoom: 1 });
  assert.deepEqual(normalized.theme, {});
  assert.deepEqual(normalized.metadata, {});
  assert.notEqual(normalized.nodes[0], sparse.nodes[0]);
});

test("validateGraphDocument reports productization rules", () => {
  const issues = validateGraphDocument({
    ...baseDocument,
    nodes: [
      ...baseDocument.nodes,
      {
        id: "node-b",
        type: "concept",
        title: "Flashcard",
        x: 0,
        y: 0,
        width: 12,
        height: 0,
        source: { type: "material", id: "", label: "Broken" }
      },
      {
        id: "node-c",
        type: "concept",
        title: "Orphan",
        x: 0,
        y: 0,
        width: 240,
        height: 120
      }
    ],
    edges: [
      ...baseDocument.edges,
      { id: "edge-b", sourceNodeId: "node-a", targetNodeId: "missing" },
      {
        id: "edge-c",
        sourceNodeId: "node-a",
        targetNodeId: "node-b",
        metadata: { targetNodeIds: ["missing-target"] }
      }
    ],
    groups: [
      {
        id: "group-empty",
        title: "Empty group",
        nodeIds: [],
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        collapsed: false
      },
      {
        id: "group-collapsed",
        title: "Collapsed",
        nodeIds: ["node-a"],
        x: 0,
        y: 0,
        width: 300,
        height: 200,
        collapsed: true
      }
    ]
  });

  assert.deepEqual(
    [...new Set(issues.map((issue) => issue.ruleType))].sort(),
    [
      "cross_collapsed_group_edge",
      "dangling_edge",
      "duplicate_node_id",
      "duplicate_title",
      "empty_group",
      "invalid_node_size",
      "invalid_source_target",
      "isolated_node",
      "missing_source"
    ].sort()
  );
});

test("StudyMate graph JSON round trips and rejects invalid schema", () => {
  const json = serializeStudymateGraphJson(baseDocument, {
    exportedAt: "2026-06-04T00:00:00.000Z",
    appVersion: "test"
  });
  const parsed = parseStudymateGraphJson(json, {
    graphId: "imported-graph",
    version: 3,
    sourceTargets: new Set(["note:note-1", "card:card-1"])
  });

  assert.equal(parsed.document.id, "imported-graph");
  assert.equal(parsed.document.version, 3);
  assert.equal(parsed.mimeType, "application/vnd.studymate.graph+json");
  assert.equal(parsed.extension, ".smtg");
  assert.equal(parsed.issues.length, 0);

  assert.throws(
    () => parseStudymateGraphJson(JSON.stringify({ ...baseDocument, schemaVersion: 999 })),
    /Unsupported StudyMate graph schema/
  );
});

test("graph history stores explainable labels and supports undo redo", () => {
  const history = createGraphHistoryState(baseDocument);
  const moved = {
    ...baseDocument,
    nodes: baseDocument.nodes.map((node) => (node.id === "node-a" ? { ...node, x: node.x + 80 } : node))
  };
  const changed = withGraphHistoryChange(history, moved, "移动节点");

  assert.equal(changed.present.nodes[0].x, 90);
  assert.equal(changed.past[0].label, "移动节点");
  assert.equal(changed.dirty, true);

  const undone = undoGraphHistory(changed);
  assert.ok(undone);
  assert.equal(undone.present.nodes[0].x, 10);
  assert.equal(undone.future[0].label, "移动节点");

  const redone = redoGraphHistory(undone);
  assert.ok(redone);
  assert.equal(redone.present.nodes[0].x, 90);
});

test("learning graph templates cover the four v0.6 product templates", () => {
  const templates = getLearningGraphTemplates();

  assert.deepEqual(
    templates.map((template) => template.id),
    ["learning-material-map", "book-notes-map", "concept-network", "review-card-prep"]
  );
  assert.ok(templates.every((template) => template.document.nodes.length >= 3));
  assert.ok(templates.every((template) => template.document.metadata?.templateId === template.id));
});

test("benchmark fixture and safe filename support export verification", () => {
  const fixture = buildGraphBenchmarkFixture({ nodeCount: 200, edgeCount: 300, groupCount: 20 });

  assert.equal(fixture.nodes.length, 200);
  assert.equal(fixture.edges.length, 300);
  assert.equal(fixture.groups.length, 20);
  assert.equal(validateGraphDocument(fixture).filter((issue) => issue.severity === "error").length, 0);
  assert.equal(sanitizeGraphExportFilename('Study:Graph<>"/bad'), "Study-Graph-bad");
});
