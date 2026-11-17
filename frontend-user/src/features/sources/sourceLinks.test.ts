import { describe, expect, it } from "vitest";
import {
  buildPrimarySourceLink,
  buildSourceBacklinkTarget,
  buildSourceLinkReadModel,
  type SourceLinkLike
} from "./sourceLinks";

describe("buildPrimarySourceLink", () => {
  it("promotes legacy annotation source fields into a normalized source link", () => {
    const result = buildPrimarySourceLink({
      sourceType: "annotation",
      sourceId: "annotation-1",
      sourceMetadata: {
        materialId: "material-1",
        annotationId: "annotation-1",
        page: 12,
        title: "Proof note",
        excerpt: "Important sentence"
      }
    });

    expect(result).toMatchObject({
      sourceType: "annotation",
      sourceId: "annotation-1",
      title: "Proof note",
      excerpt: "Important sentence",
      locator: {
        materialId: "material-1",
        annotationId: "annotation-1",
        page: 12
      }
    });
  });
});

describe("buildSourceLinkReadModel", () => {
  it("normalizes primary SourceLink fields and exposes linked object identity", () => {
    const result = buildSourceLinkReadModel({
      primarySourceLink: {
        sourceType: "graph-node",
        sourceId: "node-1",
        title: "二叉树遍历",
        excerpt: "前序、中序、后序遍历",
        locator: {
          graphId: "graph-1",
          nodeId: "node-1",
          focusX: 120,
          focusY: 160,
          focusWidth: 260,
          focusHeight: 140
        },
        metadata: {
          sourceType: "concept"
        }
      },
      sourceType: "graph",
      sourceId: "legacy-node",
      sourceMetadata: {
        graphId: "legacy-graph"
      }
    });

    expect(result).toMatchObject({
      sourceType: "graph-node",
      sourceId: "node-1",
      title: "二叉树遍历",
      excerpt: "前序、中序、后序遍历",
      linkedObjectType: "graph-node",
      linkedObjectId: "node-1",
      fallbackLegacySource: {
        sourceType: "graph",
        sourceId: "legacy-node"
      },
      locator: {
        graphId: "graph-1",
        nodeId: "node-1",
        focusX: 120,
        focusY: 160,
        focusWidth: 260,
        focusHeight: 140
      }
    });
  });

  it("falls back to legacy source fields while keeping leftover metadata separate", () => {
    const result = buildSourceLinkReadModel({
      sourceType: "annotation",
      sourceId: "annotation-1",
      sourceMetadata: {
        materialId: "material-1",
        page: 9,
        excerpt: "Important line",
        confidence: 0.8
      }
    });

    expect(result).toMatchObject({
      sourceType: "annotation",
      sourceId: "annotation-1",
      linkedObjectType: "annotation",
      linkedObjectId: "annotation-1",
      excerpt: "Important line",
      locator: {
        materialId: "material-1",
        annotationId: "annotation-1",
        page: 9
      },
      metadata: {
        confidence: 0.8
      },
      fallbackLegacySource: {
        sourceType: "annotation",
        sourceId: "annotation-1"
      }
    });
  });
});

describe("buildSourceBacklinkTarget", () => {
  it("builds reader, graph, and ai backlinks from the normalized source link", () => {
    const readerTarget = buildSourceBacklinkTarget({
      sourceType: "annotation",
      sourceId: "annotation-1",
      locator: {
        materialId: "material-1",
        annotationId: "annotation-1",
        page: 12
      }
    } satisfies SourceLinkLike);
    expect(readerTarget).toBe("/reader/material-1?page=12&annotation=annotation-1");

    const graphTarget = buildSourceBacklinkTarget({
      sourceType: "graph",
      sourceId: "node-1",
      locator: {
        graphId: "graph-1",
        focusX: 420,
        focusY: 320,
        focusWidth: 220,
        focusHeight: 120,
        focusLabel: "Binary Tree"
      }
    } satisfies SourceLinkLike);
    expect(graphTarget).toBe(
      "/graph?graphId=graph-1&focusX=420&focusY=320&focusWidth=220&focusHeight=120&focusLabel=Binary+Tree"
    );

    const aiTarget = buildSourceBacklinkTarget({
      sourceType: "ai-draft",
      sourceId: "draft-1",
      locator: {
        draftId: "draft-1"
      }
    } satisfies SourceLinkLike);
    expect(aiTarget).toBe("/ai?draft=draft-1");
  });

  it("builds graph-node backlinks from SourceLink locator without reading legacy metadata", () => {
    const graphNodeTarget = buildSourceBacklinkTarget({
      sourceType: "graph-node",
      sourceId: "node-1",
      locator: {
        graphId: "graph-1",
        nodeId: "node-1",
        focusX: 120,
        focusY: 160,
        focusWidth: 260,
        focusHeight: 140
      },
      metadata: {
        graphId: "legacy-graph-id"
      }
    } satisfies SourceLinkLike);

    expect(graphNodeTarget).toBe("/graph?graphId=graph-1&focusX=120&focusY=160&focusWidth=260&focusHeight=140");
  });
});
