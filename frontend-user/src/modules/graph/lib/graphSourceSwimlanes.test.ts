import { describe, expect, it } from "vitest";
import type { GraphDocumentPayload } from "../../../api/client";
import { buildGraphSourceSwimlaneDocument } from "./graphSourceSwimlanes";

const document: GraphDocumentPayload = {
  edges: [],
  graphId: "graph-1",
  groups: [
    {
      collapsed: false,
      height: 120,
      id: "existing-swimlane",
      metadata: { layoutKind: "source-swimlane" },
      nodeIds: ["material-1"],
      title: "旧资料泳道",
      width: 200,
      x: 0,
      y: 0
    },
    {
      collapsed: false,
      height: 120,
      id: "manual-group",
      nodeIds: ["material-1", "note-1"],
      title: "手动分组",
      width: 200,
      x: 40,
      y: 40
    }
  ],
  metadata: {},
  nodes: [
    {
      height: 80,
      id: "material-1",
      source: { id: "m1", label: "资料 A", type: "material" },
      title: "资料 A",
      type: "material",
      width: 120,
      x: 240,
      y: 180
    },
    {
      height: 80,
      id: "note-1",
      source: { id: "n1", label: "笔记 A", type: "note" },
      title: "笔记 A",
      type: "rich-note",
      width: 140,
      x: 80,
      y: 120
    },
    {
      height: 80,
      id: "free-1",
      title: "自由节点",
      type: "concept",
      width: 120,
      x: 760,
      y: 400
    }
  ],
  schemaVersion: 1,
  theme: {},
  version: 1,
  viewport: { x: 0, y: 0, zoom: 1 }
};

describe("buildGraphSourceSwimlaneDocument", () => {
  it("builds swimlanes for selected nodes and replaces overlapping generated lanes immutably", () => {
    const result = buildGraphSourceSwimlaneDocument(document, ["material-1", "note-1"], {
      makeGroupId: (sourceKey) => `swimlane-${sourceKey.replace(":", "")}`
    });

    expect(result.status).toBe("已生成 2 条来源泳道");
    expect(result.selectedNodeIds).toEqual(["material-1", "note-1"]);
    expect(result.document).not.toBe(document);
    expect(result.document.nodes.find((node) => node.id === "free-1")).toBe(document.nodes[2]);
    expect(document.nodes[0]).toMatchObject({ x: 240, y: 180 });

    expect(result.document.groups.map((group) => group.id)).toEqual(["manual-group", "swimlane-material", "swimlane-note"]);
    expect(result.document.groups[0]).toBe(document.groups[1]);
    expect(result.document.groups.slice(1).map((group) => group.metadata?.layoutKind)).toEqual([
      "source-swimlane",
      "source-swimlane"
    ]);
  });

  it("returns the original document when fewer than two nodes are selected", () => {
    const result = buildGraphSourceSwimlaneDocument(document, ["material-1"], {
      makeGroupId: () => "unused"
    });

    expect(result.document).toBe(document);
    expect(result.selectedNodeIds).toEqual([]);
    expect(result.status).toBe("");
  });
});
