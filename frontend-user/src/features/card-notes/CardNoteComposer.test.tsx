import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CardNoteComposer, buildCardNotePreview } from "./CardNoteComposer";

afterEach(cleanup);

describe("CardNoteComposer", () => {
  const draft = { id: "draft-1", title: "来源", front: "额外说明", back: "{{c1::A::提示}} + {{c2::B}} + {{c1::C}}" };
  const props = {
    allowedTemplates: ["basic", "basic_reverse", "cloze"] as const,
    decks: [], selectedDeckId: "deck-1", drafts: [draft],
    onDeckChange: vi.fn(), onDraftFieldChange: vi.fn(), onSubmit: vi.fn(), onTemplateChange: vi.fn()
  };
  it("previews one card for each distinct cloze number and shows other answers", () => {
    expect(buildCardNotePreview(draft, "cloze")).toEqual([
      { front: "[...] + B + [...]", back: "A + B + C\n\n额外说明" },
      { front: "A + [...] + C", back: "A + B + C\n\n额外说明" }
    ]);
  });
  it("does not invent a cloze card when no valid marker exists", () => {
    expect(buildCardNotePreview({ front: "extra", back: "plain text" }, "cloze")).toEqual([]);
  });
  it("normalizes numeric cloze identities and rejects invalid numbers or empty answers", () => {
    expect(buildCardNotePreview({ front: "", back: "{{c01::A}} {{c1::B}}" }, "cloze")).toEqual([{ front: "[...] [...]", back: "A B" }]);
    for (const back of ["{{c0::A}}", "{{c1000001::A}}", "{{c1:: }}", "{{c1::a\nb}}", "{{c1::A}} {{c0::B}}"])
      expect(buildCardNotePreview({ front: "", back }, "cloze")).toEqual([]);
  });
  it("blocks invalid cloze submissions and explains the marker format", () => {
    render(<MemoryRouter><CardNoteComposer {...props} allowedTemplates={[...props.allowedTemplates]} template="cloze" drafts={[{ ...draft, back: "plain text" }]} /></MemoryRouter>);
    expect(screen.getByRole("button", { name: "写入复习系统" })).toBeDisabled();
    expect(screen.getByText(/请在填空文本中添加/)).toBeInTheDocument();
  });
  it("blocks empty drafts and blank basic answers", () => {
    const { rerender } = render(<MemoryRouter><CardNoteComposer {...props} allowedTemplates={[...props.allowedTemplates]} template="basic" drafts={[]} /></MemoryRouter>);
    expect(screen.getByRole("button", { name: "写入复习系统" })).toBeDisabled();
    rerender(<MemoryRouter><CardNoteComposer {...props} allowedTemplates={[...props.allowedTemplates]} template="basic" drafts={[{ ...draft, back: " " }]} /></MemoryRouter>);
    expect(screen.getByRole("button", { name: "写入复习系统" })).toBeDisabled();
  });
  it("states the generated card count before confirmation", () => {
    render(<MemoryRouter><CardNoteComposer {...props} allowedTemplates={[...props.allowedTemplates]} template="cloze" /></MemoryRouter>);
    expect(screen.getByText("将生成 2 张卡片")).toBeInTheDocument();
  });
  it("bounds cloze generation to the server limits", () => {
    const back = Array.from({ length: 101 }, (_, index) => `{{c${index + 1}::x}}`).join(" ");
    expect(buildCardNotePreview({ front: "", back }, "cloze")).toEqual([]);
    expect(buildCardNotePreview({ front: "", back: "{{c1::x}}".repeat(1001) }, "cloze")).toEqual([]);
  });
});
