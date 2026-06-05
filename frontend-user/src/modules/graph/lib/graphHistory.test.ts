import { describe, expect, it } from "vitest";
import type { GraphDetailPayload, GraphDocumentPayload } from "../../../api/client";
import {
  applyGraphDocumentChange,
  createEmptyGraphHistoryState,
  markGraphHistorySaved,
  redoGraphDocument,
  resetGraphHistoryState,
  undoGraphDocument
} from "./graphHistory";

function buildDocument(overrides?: Partial<GraphDocumentPayload>): GraphDocumentPayload {
  return {
    graphId: "graph-1",
    version: 4,
    schemaVersion: 1,
    viewport: { x: 140, y: 120, zoom: 1 },
    nodes: [],
    edges: [],
    groups: [],
    theme: {},
    metadata: {},
    ...overrides
  };
}

function buildDetail(document: GraphDocumentPayload): GraphDetailPayload {
  return {
    id: "graph-1",
    ownerUserId: "user-1",
    title: "Graph",
    description: "desc",
    visibility: "private",
    status: "active",
    graphType: "knowledge",
    mode: "free",
    currentVersion: 4,
    nodeCount: document.nodes.length,
    edgeCount: document.edges.length,
    createdAt: "2026-06-02T12:00:00Z",
    updatedAt: "2026-06-02T12:00:00Z",
    document
  };
}

describe("graphHistory", () => {
  it("captures previous document, clears future history, and marks the graph dirty", () => {
    const current = buildDetail(
      buildDocument({
        nodes: [{ id: "node-1", type: "concept", title: "Old", x: 0, y: 0, width: 120, height: 80 }]
      })
    );
    const history = {
      past: [buildDocument({ version: 2 })],
      future: [buildDocument({ version: 5 })],
      dirty: false
    };

    const result = applyGraphDocumentChange(
      current,
      buildDocument({
        graphId: "other-graph",
        version: 99,
        nodes: [{ id: "node-2", type: "concept", title: "New", x: 20, y: 40, width: 120, height: 80 }]
      }),
      history
    );

    expect(result.history.dirty).toBe(true);
    expect(result.history.future).toEqual([]);
    expect(result.history.past).toHaveLength(2);
    expect(result.history.past.at(-1)?.nodes[0]?.id).toBe("node-1");
    expect(result.detail.document.graphId).toBe("graph-1");
    expect(result.detail.document.version).toBe(4);
    expect(result.detail.document.nodes[0]?.id).toBe("node-2");
  });

  it("resets history after a graph reload or restore", () => {
    expect(
      resetGraphHistoryState({
        past: [buildDocument({ version: 1 })],
        future: [buildDocument({ version: 2 })],
        dirty: true
      })
    ).toEqual(createEmptyGraphHistoryState());
  });

  it("supports undo and redo transitions without mutating the current detail", () => {
    const initialDetail = buildDetail(
      buildDocument({
        nodes: [{ id: "node-1", type: "concept", title: "Current", x: 0, y: 0, width: 120, height: 80 }]
      })
    );
    const previous = buildDocument({
      nodes: [{ id: "node-prev", type: "concept", title: "Previous", x: 0, y: 0, width: 120, height: 80 }]
    });
    const future = buildDocument({
      nodes: [{ id: "node-next", type: "concept", title: "Next", x: 0, y: 0, width: 120, height: 80 }]
    });

    const undoResult = undoGraphDocument(initialDetail, {
      past: [previous],
      future: [future],
      dirty: true
    });
    expect(undoResult).not.toBeNull();
    expect(undoResult?.detail.document.nodes[0]?.id).toBe("node-prev");
    expect(undoResult?.history.future[0]?.nodes[0]?.id).toBe("node-1");

    const redoResult = redoGraphDocument(undoResult!.detail, undoResult!.history);
    expect(redoResult).not.toBeNull();
    expect(redoResult?.detail.document.nodes[0]?.id).toBe("node-1");
    expect(redoResult?.history.past.at(-1)?.nodes[0]?.id).toBe("node-prev");
  });

  it("marks history as saved without dropping undo entries", () => {
    const saved = markGraphHistorySaved({
      past: [buildDocument({ version: 3 })],
      future: [],
      dirty: true
    });

    expect(saved.dirty).toBe(false);
    expect(saved.past).toHaveLength(1);
  });
});
