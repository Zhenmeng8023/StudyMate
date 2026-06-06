import { describe, expect, it } from "vitest";
import type { GraphNodePayload } from "../../../api/client";
import {
  alignSelectedGraphNodes,
  distributeSelectedGraphNodes
} from "./graphSelectionLayout";

const nodes: GraphNodePayload[] = [
  {
    height: 80,
    id: "node-1",
    title: "One",
    type: "concept",
    width: 100,
    x: 20,
    y: 40
  },
  {
    height: 80,
    id: "node-2",
    title: "Two",
    type: "concept",
    width: 100,
    x: 220,
    y: 140
  },
  {
    height: 80,
    id: "node-3",
    title: "Three",
    type: "concept",
    width: 100,
    x: 620,
    y: 240
  },
  {
    height: 80,
    id: "node-4",
    title: "Free",
    type: "concept",
    width: 100,
    x: 900,
    y: 300
  }
];

describe("graph selection layout", () => {
  it("aligns selected nodes without mutating unselected nodes", () => {
    const result = alignSelectedGraphNodes(nodes, ["node-1", "node-2", "node-3"], "left");

    expect(result.map((node) => ({ id: node.id, x: node.x }))).toEqual([
      { id: "node-1", x: 20 },
      { id: "node-2", x: 20 },
      { id: "node-3", x: 20 },
      { id: "node-4", x: 900 }
    ]);
    expect(result[3]).toBe(nodes[3]);
    expect(nodes[1].x).toBe(220);
  });

  it("aligns selected nodes by center and clamps to the stage", () => {
    const result = alignSelectedGraphNodes(
      [
        { ...nodes[0], x: 2300, width: 160 },
        { ...nodes[1], x: 2380, width: 160 }
      ],
      ["node-1", "node-2"],
      "center"
    );

    expect(result.map((node) => node.x)).toEqual([2240, 2240]);
  });

  it("distributes selected nodes horizontally in stable order", () => {
    const result = distributeSelectedGraphNodes(nodes, ["node-1", "node-2", "node-3"], "horizontal");

    expect(result.map((node) => ({ id: node.id, x: node.x }))).toEqual([
      { id: "node-1", x: 20 },
      { id: "node-2", x: 320 },
      { id: "node-3", x: 620 },
      { id: "node-4", x: 900 }
    ]);
  });

  it("returns original nodes when distribution does not have enough selected nodes", () => {
    const result = distributeSelectedGraphNodes(nodes, ["node-1", "node-2"], "horizontal");

    expect(result).toBe(nodes);
  });
});
