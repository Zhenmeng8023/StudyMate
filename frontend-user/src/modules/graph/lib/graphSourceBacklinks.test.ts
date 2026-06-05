import { describe, expect, it } from "vitest";
import type { GraphNodePayload } from "../../../api/client";
import { buildGraphSourceBacklink } from "./graphSourceBacklinks";

function node(overrides: Partial<GraphNodePayload>): GraphNodePayload {
  return {
    id: "node-1",
    type: "concept",
    title: "Node",
    x: 0,
    y: 0,
    width: 200,
    height: 120,
    source: null,
    metadata: {},
    ...overrides
  };
}

describe("buildGraphSourceBacklink", () => {
  it("links material, note, card, and AI sources to their workspaces", () => {
    expect(buildGraphSourceBacklink(node({ source: { type: "material", id: "material 1" } }))).toMatchObject({
      target: "/reader/material%201",
      actionLabel: "回到阅读器"
    });
    expect(buildGraphSourceBacklink(node({ source: { type: "note", id: "note-1" } }))?.target).toBe("/notes?selected=note-1");
    expect(buildGraphSourceBacklink(node({ source: { type: "card", id: "card-1" } }))?.target).toBe("/review?card=card-1");
    expect(buildGraphSourceBacklink(node({ source: { type: "ai_draft", id: "draft-1" } }))?.target).toBe("/ai?draft=draft-1");
    expect(buildGraphSourceBacklink(node({ source: { type: "ai_task", id: "task-1" } }))?.target).toBe("/ai?task=task-1");
  });

  it("links annotation and PDF anchor nodes back to the reader page and annotation query", () => {
    expect(
      buildGraphSourceBacklink(
        node({
          source: { type: "annotation", id: "annotation-1", label: "PDF quote" },
          metadata: { materialId: "material-1", page: 3 }
        })
      )
    ).toMatchObject({
      sourceTypeLabel: "批注",
      target: "/reader/material-1?page=3&annotation=annotation-1",
      actionLabel: "回到批注"
    });

    expect(
      buildGraphSourceBacklink(
        node({
          type: "pdf-anchor",
          source: { type: "pdf-anchor", id: "anchor-1" },
          metadata: { materialId: "material-1", page: "8" }
        })
      )?.target
    ).toBe("/reader/material-1?page=8&anchor=anchor-1");
  });

  it("returns null for incomplete source references", () => {
    expect(buildGraphSourceBacklink(node({ source: null }))).toBeNull();
    expect(buildGraphSourceBacklink(node({ source: { type: "annotation", id: "annotation-1" } }))).toBeNull();
    expect(buildGraphSourceBacklink(node({ source: { type: "unknown", id: "source-1" } }))).toBeNull();
  });
});
