import { describe, expect, it } from "vitest";
import type { ManagedCardNotePayload } from "../../api/types";
import { buildCardNoteEditDraft, buildCardNoteUpdate, cardNoteSources, formatCardNoteState, formatCardNoteTemplate } from "./cardNoteManagement";

function managed(sourceLinks: ManagedCardNotePayload["cardNote"]["sourceLinks"] = []): ManagedCardNotePayload {
  return { cardNote: { id: "n1", deckId: "d1", ownerUserId: "u1", noteTypeId: "cloze", noteTypeCode: "cloze", fields: { text: "{{c1::知识}}", extra: "补充" }, sourceLinks, generatedCardCount: 0, status: "active" }, generatedCards: [], queueStates: {} };
}
describe("CardNote editing and source grouping", () => {
  it("edits source-free Cloze notes without manufacturing a source", () => {
    const note = managed();
    const draft = buildCardNoteEditDraft(note);
    expect(buildCardNoteUpdate(note, { ...draft, tags: "图谱， 复习, 图谱" })).toEqual({ fields: { text: "{{c1::知识}}", extra: "补充" }, tags: ["图谱", "复习"] });
    expect(cardNoteSources(note)).toEqual([]);
  });
  it("can clear source title and excerpt while preserving a secondary source", () => {
    const note = managed([{ sourceType: "note-block", sourceId: "b1", title: "原标题", excerpt: "原说明", locator: { noteId: "n2" } }, { sourceType: "ai-draft", sourceId: "draft1" }]);
    const draft = buildCardNoteEditDraft(note);
    const input = buildCardNoteUpdate(note, { ...draft, sourceTitle: "", sourceExcerpt: "" });
    expect(input.primarySourceLink).toMatchObject({ title: "", excerpt: "", locator: { noteId: "n2" } });
    expect(input.sourceLinks?.[1]).toEqual({ sourceType: "ai-draft", sourceId: "draft1" });
  });
  it("groups related nodes and blocks under their parent document and preserves AI draft identity", () => {
    const note = managed([
      { sourceType: "graph-node", sourceId: "node1", locator: { graphId: "g1" } },
      { sourceType: "graph", sourceId: "g2" },
      { sourceType: "note-block", sourceId: "block1", locator: { noteId: "n2" } },
      { sourceType: "note", sourceId: "n3" },
      { sourceType: "ai-task", sourceId: "t1" },
      { sourceType: "ai-draft", sourceId: "d1" },
      { sourceType: "material", sourceId: "m1" },
      { sourceType: "pdf-anchor", sourceId: "p1", locator: { materialId: "m2" } },
      { sourceType: "card", sourceId: "c1" }
    ]);
    expect(cardNoteSources(note).map((source) => source.key)).toEqual(["graph:g1", "graph:g2", "note:n2", "note:n3", "ai-task:t1", "ai-draft:d1", "material:m1", "material:m2"]);
  });
  it("handles imported notes missing optional fields and unknown templates without exposing undefined labels", () => {
    const note = managed();
    note.cardNote = { ...note.cardNote, fields: undefined, noteTypeCode: "custom" };
    const draft = buildCardNoteEditDraft(note);
    expect(buildCardNoteUpdate(note, draft).fields).toEqual({ front: "", back: "" });
    expect(formatCardNoteTemplate()).toBe("问答卡");
    expect(formatCardNoteTemplate("custom")).toBe("自定义模板");
    expect(formatCardNoteTemplate("basic_reverse")).toBe("双向问答卡");
    expect(formatCardNoteTemplate("cloze")).toBe("填空卡");
    expect(formatCardNoteState("custom")).toBe("custom");
  });
});
