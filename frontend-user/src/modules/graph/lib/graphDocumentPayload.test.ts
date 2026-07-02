import { supportedGraphSchemaVersion } from "@studymate/graph-core";
import { describe, expect, it } from "vitest";
import { createEmptyGraphDocumentPayload, normalizeGraphDocumentPayload } from "./graphDocumentPayload";

describe("graph document payload contract", () => {
  it("fills compatibility defaults for legacy graph documents", () => {
    const normalized = normalizeGraphDocumentPayload("graph-1", 7, {
      graphId: "",
      version: 0,
      schemaVersion: 0,
      viewport: {} as never,
      nodes: undefined as never,
      edges: undefined as never,
      groups: undefined as never
    });

    expect(normalized).toMatchObject({
      graphId: "graph-1",
      version: 7,
      schemaVersion: supportedGraphSchemaVersion,
      viewport: { x: 140, y: 120, zoom: 1 },
      nodes: [],
      edges: [],
      groups: [],
      theme: {},
      metadata: {}
    });
  });

  it("creates an empty workspace document with the supported schema version", () => {
    expect(createEmptyGraphDocumentPayload("graph-2", 3)).toMatchObject({
      graphId: "graph-2",
      version: 3,
      schemaVersion: supportedGraphSchemaVersion,
      viewport: { x: 140, y: 120, zoom: 1 },
      nodes: [],
      edges: [],
      groups: [],
      theme: {},
      metadata: {}
    });
  });
});
