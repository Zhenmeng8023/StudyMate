import { describe, expect, it } from "vitest";
import type { GraphNodePayload } from "../../../api/client";
import {
  buildGraphSourceGroups,
  organizeGraphNodesBySource
} from "./graphSourceLayout";

const nodes: GraphNodePayload[] = [
  {
    height: 80,
    id: "material-2",
    source: { id: "m2", label: "B 资料", type: "material" },
    title: "B",
    type: "material",
    width: 120,
    x: 300,
    y: 220
  },
  {
    height: 70,
    id: "note-1",
    source: { id: "n1", label: "A 笔记", type: "note" },
    title: "A",
    type: "rich-note",
    width: 160,
    x: 120,
    y: 120
  },
  {
    height: 90,
    id: "material-1",
    source: { id: "m1", label: "A 资料", type: "material" },
    title: "A",
    type: "material",
    width: 140,
    x: 20,
    y: 40
  },
  {
    height: 80,
    id: "free-1",
    title: "Free",
    type: "concept",
    width: 100,
    x: 900,
    y: 320
  }
];

describe("graph source layout", () => {
  it("organizes selected nodes into source type columns without mutating unselected nodes", () => {
    const result = organizeGraphNodesBySource(nodes, ["material-2", "note-1", "material-1"], "type-columns");

    expect(result.status).toBe("已按来源类型分列整理选中节点");
    expect(result.nodes.map((node) => ({ id: node.id, x: node.x, y: node.y }))).toEqual([
      { id: "material-2", x: 20, y: 154 },
      { id: "note-1", x: 232, y: 40 },
      { id: "material-1", x: 20, y: 40 },
      { id: "free-1", x: 900, y: 320 }
    ]);
    expect(result.nodes[3]).toBe(nodes[3]);
    expect(nodes[0]).toMatchObject({ x: 300, y: 220 });
  });

  it("organizes selected nodes into source type rows", () => {
    const result = organizeGraphNodesBySource(nodes, ["material-2", "note-1", "material-1"], "type-rows");

    expect(result.status).toBe("已按来源类型分行整理选中节点");
    expect(result.nodes.map((node) => ({ id: node.id, x: node.x, y: node.y }))).toEqual([
      { id: "material-2", x: 184, y: 40 },
      { id: "note-1", x: 20, y: 202 },
      { id: "material-1", x: 20, y: 40 },
      { id: "free-1", x: 900, y: 320 }
    ]);
  });

  it("creates source groups around selected source buckets", () => {
    const result = buildGraphSourceGroups(nodes, ["material-2", "note-1", "material-1"], {
      makeGroupId: (index) => `group-${index + 1}`
    });

    expect(result.groups).toEqual([
      {
        collapsed: false,
        height: 338,
        id: "group-1",
        nodeIds: ["material-2", "material-1"],
        title: "资料分组",
        width: 456,
        x: 0,
        y: 0
      },
      {
        collapsed: false,
        height: 148,
        id: "group-2",
        nodeIds: ["note-1"],
        title: "笔记分组",
        width: 216,
        x: 92,
        y: 80
      }
    ]);
  });
});
