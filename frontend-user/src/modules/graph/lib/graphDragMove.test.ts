import { describe, expect, it } from "vitest";
import type { GraphDocumentPayload } from "../../../api/client";
import { buildGraphDragMove } from "./graphDragMove";

const baseDocument: GraphDocumentPayload = {
  edges: [],
  graphId: "graph-1",
  groups: [],
  metadata: {},
  nodes: [
    {
      height: 80,
      id: "node-1",
      title: "One",
      type: "concept",
      width: 120,
      x: 10,
      y: 20
    },
    {
      height: 80,
      id: "node-2",
      title: "Two",
      type: "concept",
      width: 120,
      x: 260,
      y: 120
    }
  ],
  schemaVersion: 1,
  theme: {},
  version: 1,
  viewport: { x: 0, y: 0, zoom: 2 }
};

describe("buildGraphDragMove", () => {
  it("moves a single node using viewport zoom without mutating the source document", () => {
    const result = buildGraphDragMove({
      clientX: 150,
      clientY: 80,
      document: baseDocument,
      dragState: {
        kind: "node",
        nodeId: "node-1",
        originX: 10,
        originY: 20,
        pointerX: 100,
        pointerY: 40
      },
      hiddenNodeIds: new Set()
    });

    expect(result.status).toBe("正在调整节点位置");
    expect(result.nodes.find((node) => node.id === "node-1")).toMatchObject({ x: 35, y: 40 });
    expect(result.nodes.find((node) => node.id === "node-2")).toBe(baseDocument.nodes[1]);
    expect(baseDocument.nodes[0]).toMatchObject({ x: 10, y: 20 });
  });

  it("moves multiple selected nodes from stored origins and clamps to stage bounds", () => {
    const result = buildGraphDragMove({
      clientX: 50,
      clientY: 50,
      document: baseDocument,
      dragState: {
        kind: "multi-node",
        nodeIds: ["node-1", "node-2"],
        origins: {
          "node-1": { x: 10, y: 20 },
          "node-2": { x: 260, y: 120 }
        },
        pointerX: 100,
        pointerY: 100
      },
      hiddenNodeIds: new Set()
    });

    expect(result.status).toBe("正在批量调整节点位置");
    expect(result.nodes.find((node) => node.id === "node-1")).toMatchObject({ x: 0, y: 0 });
    expect(result.nodes.find((node) => node.id === "node-2")).toMatchObject({ x: 235, y: 95 });
  });
});
