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

  it("exposes structured metadata editors for learning-loop nodes", () => {
    expect(getGraphNodeMetadataEditorFields(node({ type: "material" })).map((item) => item.field)).toEqual([
      "materialId",
      "materialUrl"
    ]);
    expect(getGraphNodeMetadataEditorFields(node({ type: "rich-note" })).map((item) => item.field)).toEqual(["noteId"]);
    expect(getGraphNodeMetadataEditorFields(node({ type: "card" })).map((item) => item.field)).toEqual(["cardId", "deckId"]);
    expect(getGraphNodeMetadataEditorFields(node({ type: "ai" })).map((item) => item.field)).toEqual([
      "aiDraftId",
      "aiTaskId"
    ]);
  });

  it("exposes draft diagram metadata editors without adding a new creation workflow", () => {
    expect(getGraphNodeMetadataEditorFields(node({ type: "diagram" })).map((item) => item.field)).toEqual([
      "diagramKind",
      "diagramShape",
      "diagramSourceId"
    ]);
  });

  it("patches structured learning metadata immutably inside metadata.content", () => {
    const original = node({
      type: "card",
      metadata: {
        detail: "复习线索",
        content: {
          cardId: "card-old",
          deckId: "deck-1"
        }
      }
    });

    const patched = patchGraphNodeMetadataField(original, "cardId", " card-new ");

    expect(getGraphNodeMetadataField(patched, "cardId")).toBe("card-new");
    expect(getGraphNodeMetadataField(patched, "deckId")).toBe("deck-1");
    expect(patched.metadata?.detail).toBe("复习线索");
    expect(original.metadata?.content).toEqual({ cardId: "card-old", deckId: "deck-1" });
  });
});
