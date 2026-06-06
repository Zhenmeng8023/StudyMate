import { describe, expect, it } from "vitest";
import type { GraphNodePayload } from "../../../api/client";
import { applyGraphBatchEmphasis, applyGraphBatchSizePreset, applyGraphBatchTone } from "./graphBatchAppearance";

const nodes: GraphNodePayload[] = [
  {
    height: 132,
    id: "node-1",
    metadata: {},
    title: "One",
    type: "concept",
    width: 240,
    x: 10,
    y: 20
  },
  {
    height: 132,
    id: "node-2",
    metadata: {},
    title: "Two",
    type: "material",
    width: 240,
    x: 260,
    y: 20
  },
  {
    height: 132,
    id: "node-3",
    metadata: {},
    title: "Three",
    type: "concept",
    width: 240,
    x: 520,
    y: 20
  }
];

describe("graph batch appearance", () => {
  it("applies a tone to selected nodes without mutating unselected nodes", () => {
    const result = applyGraphBatchTone(nodes, ["node-1", "node-2"], "sky");

    expect(result[0].metadata?.appearance).toEqual({ emphasis: "default", tone: "sky" });
    expect(result[1].metadata?.appearance).toEqual({ emphasis: "default", tone: "sky" });
    expect(result[2]).toBe(nodes[2]);
    expect(nodes[0].metadata).toEqual({});
  });

  it("applies emphasis to selected nodes and keeps existing tone", () => {
    const result = applyGraphBatchEmphasis(
      [{ ...nodes[0], metadata: { appearance: { emphasis: "default", tone: "sage" } } }, nodes[1]],
      ["node-1"],
      "strong"
    );

    expect(result[0].metadata?.appearance).toEqual({ emphasis: "strong", tone: "sage" });
    expect(result[1]).toBe(nodes[1]);
  });

  it("resizes selected nodes to a preset", () => {
    const result = applyGraphBatchSizePreset(nodes, ["node-1", "node-3"], "detail");

    expect(result.map((node) => ({ id: node.id, width: node.width, height: node.height }))).toEqual([
      { height: 164, id: "node-1", width: 320 },
      { height: 132, id: "node-2", width: 240 },
      { height: 164, id: "node-3", width: 320 }
    ]);
  });
});
