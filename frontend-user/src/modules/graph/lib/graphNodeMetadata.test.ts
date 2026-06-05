import { describe, expect, it } from "vitest";
import type { GraphNodePayload } from "../../../api/client";
import {
  getGraphNodeMetadataEditorFields,
  getGraphNodeMetadataField,
  patchGraphNodeMetadataField
} from "./graphNodeMetadata";

function node(overrides: Partial<GraphNodePayload> = {}): GraphNodePayload {
  return {
    id: "node-1",
    type: "url",
    title: "URL 节点",
    x: 0,
    y: 0,
    width: 240,
    height: 132,
    metadata: { detail: "existing detail" },
    ...overrides
  };
}

describe("graphNodeMetadata", () => {
  it("patches type-specific metadata without losing existing fields", () => {
    const patched = patchGraphNodeMetadataField(node(), "url", " https://example.test/lesson ");

    expect(getGraphNodeMetadataField(patched, "url")).toBe("https://example.test/lesson");
    expect(patched.metadata?.detail).toBe("existing detail");
  });

  it("removes empty content fields and keeps metadata immutable", () => {
    const original = node({ metadata: { content: { url: "https://example.test" }, detail: "note" } });
    const patched = patchGraphNodeMetadataField(original, "url", "  ");

    expect(patched).not.toBe(original);
    expect(patched.metadata?.content).toBeUndefined();
    expect(original.metadata?.content).toEqual({ url: "https://example.test" });
  });

  it("normalizes PDF pages and exposes editor fields by node type", () => {
    const pdfNode = node({ type: "pdf-anchor" });
    const patched = patchGraphNodeMetadataField(pdfNode, "pdfPage", "12.5");

    expect(getGraphNodeMetadataField(patched, "pdfPage")).toBe("12");
    expect(getGraphNodeMetadataEditorFields(pdfNode).map((item) => item.field)).toEqual(["pdfPage", "pdfAnchor"]);
    expect(getGraphNodeMetadataEditorFields(node({ type: "concept" }))).toEqual([]);
  });
});
