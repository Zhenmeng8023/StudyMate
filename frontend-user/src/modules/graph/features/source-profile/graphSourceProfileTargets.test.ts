import { describe, expect, it } from "vitest";
import { buildGraphNodeSourceProfileTarget } from "./graphSourceProfileTargets";

describe("graphSourceProfileTargets", () => {
  it("prefers a node primary source when building SourceProfile targets", () => {
    const plan = buildGraphNodeSourceProfileTarget({
      graphId: "graph-1",
      node: {
        id: "node-1",
        title: "Binary Tree",
        metadata: {
          materialId: "material-1",
          page: 4
        },
        source: {
          type: "material",
          id: "material-1",
          label: "Algorithms"
        }
      }
    });

    expect(plan?.readModel).toMatchObject({
      linkedObjectType: "material",
      linkedObjectId: "material-1",
      sourceType: "material",
      sourceId: "material-1"
    });
    expect(plan?.target).toBe("/sources?sourceType=material&sourceId=material-1");
  });

  it("falls back to graph-node when the node has no external source", () => {
    const plan = buildGraphNodeSourceProfileTarget({
      graphId: "graph-1",
      node: {
        id: "node-1",
        title: "Binary Tree",
        metadata: {}
      }
    });

    expect(plan?.readModel).toMatchObject({
      linkedObjectType: "graph-node",
      linkedObjectId: "node-1",
      locator: {
        graphId: "graph-1",
        nodeId: "node-1"
      },
      sourceType: "graph-node",
      sourceId: "node-1"
    });
    expect(plan?.target).toBe("/sources?sourceType=graph-node&sourceId=node-1");
  });
});
