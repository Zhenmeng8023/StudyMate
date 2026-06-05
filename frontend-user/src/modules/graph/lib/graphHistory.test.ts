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
      past: [{ label: "旧版本", document: buildDocument({ version: 2 }) }],
      future: [{ label: "未来版本", document: buildDocument({ version: 5 }) }],
      dirty: false,
      lastLabel: "旧版本"
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
    expect(result.history.lastLabel).toBe("图谱变更");
    expect(result.history.past.at(-1)?.label).toBe("图谱变更");
    expect(result.history.past.at(-1)?.document.nodes[0]?.id).toBe("node-1");
    expect(result.detail.document.graphId).toBe("graph-1");
    expect(result.detail.document.version).toBe(4);
    expect(result.detail.document.nodes[0]?.id).toBe("node-2");
  });

  it("resets history after a graph reload or restore", () => {
    expect(
      resetGraphHistoryState({
        past: [{ label: "旧版本", document: buildDocument({ version: 1 }) }],
        future: [{ label: "未来版本", document: buildDocument({ version: 2 }) }],
        dirty: true,
        lastLabel: "旧版本"
      })
    ).toEqual(createEmptyGraphHistoryState());
  });

  it("stores explainable labels for undo, redo, and save boundaries", () => {
    const current = buildDetail(
      buildDocument({
        nodes: [{ id: "node-1", type: "concept", title: "Current", x: 0, y: 0, width: 120, height: 80 }]
      })
    );
    const next = buildDocument({
      nodes: [{ id: "node-2", type: "concept", title: "Next", x: 20, y: 20, width: 120, height: 80 }]
    });

    const changed = applyGraphDocumentChange(current, next, createEmptyGraphHistoryState(), {
      label: "导入 StudyMate 图谱 JSON"
    });
    expect(changed.history.lastLabel).toBe("导入 StudyMate 图谱 JSON");
    expect(changed.history.past[0].label).toBe("导入 StudyMate 图谱 JSON");

    const undone = undoGraphDocument(changed.detail, changed.history);
    expect(undone?.history.lastLabel).toBe("撤销：导入 StudyMate 图谱 JSON");

    const redone = redoGraphDocument(undone!.detail, undone!.history);
    expect(redone?.history.lastLabel).toBe("重做：导入 StudyMate 图谱 JSON");

    const saved = markGraphHistorySaved(redone!.history, "手动保存");
    expect(saved.lastLabel).toBe("手动保存");
    expect(saved.dirty).toBe(false);
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
      past: [{ label: "移动节点", document: previous }],
      future: [{ label: "重做节点", document: future }],
      dirty: true,
      lastLabel: "移动节点"
    });
    expect(undoResult).not.toBeNull();
    expect(undoResult?.detail.document.nodes[0]?.id).toBe("node-prev");
    expect(undoResult?.history.future[0]?.document.nodes[0]?.id).toBe("node-1");

    const redoResult = redoGraphDocument(undoResult!.detail, undoResult!.history);
    expect(redoResult).not.toBeNull();
    expect(redoResult?.detail.document.nodes[0]?.id).toBe("node-1");
    expect(redoResult?.history.past.at(-1)?.document.nodes[0]?.id).toBe("node-prev");
  });

  it("marks history as saved without dropping undo entries", () => {
    const saved = markGraphHistorySaved({
      past: [{ label: "移动节点", document: buildDocument({ version: 3 }) }],
      future: [],
      dirty: true,
      lastLabel: "移动节点"
    });

    expect(saved.dirty).toBe(false);
    expect(saved.past).toHaveLength(1);
  });
});
