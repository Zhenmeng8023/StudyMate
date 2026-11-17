import { describe, expect, it } from "vitest";
import { createReaderExcerptDraft } from "./readerExcerpt";

describe("reader excerpts", () => {
  it("preserves the original page and annotation in a safe source link", () => {
    const draft = createReaderExcerptDraft(new URLSearchParams({ material: "pdf/1", annotation: "a&1", page: "3", quote: '<img src=x onerror="alert(1)">', comment: "A & B" }));
    expect(draft.materialId).toBe("pdf/1");
    expect(draft.content).toContain("&lt;img");
    expect(draft.content).not.toContain("<img");
    expect(draft.content).toContain("A &amp; B");
    expect(draft.content).toContain('/reader/pdf%2F1?page=3&amp;annotation=a%261');
  });
  it("does not create an excerpt without a source and valid annotation", () => {
    expect(createReaderExcerptDraft(new URLSearchParams("quote=test")).content).toBe("");
    expect(createReaderExcerptDraft(new URLSearchParams("material=1&page=-1&annotation=2&quote=test")).content).toBe("");
  });
});
