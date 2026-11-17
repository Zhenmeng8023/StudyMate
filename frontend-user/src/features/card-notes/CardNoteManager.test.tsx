import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ManagedCardNotePayload } from "../../api/types";
import { CardNoteManager } from "./CardNoteManager";

const note: ManagedCardNotePayload = {
  cardNote: { id: "n1", deckId: "d1", ownerUserId: "u1", noteTypeId: "basic", noteTypeCode: "basic", fields: { front: "问题", back: "答案" }, generatedCardCount: 1, status: "active",
    primarySourceLink: { sourceType: "annotation", sourceId: "a1", title: "PDF 批注", locator: { materialId: "m1" } },
    sourceLinks: [{ sourceType: "annotation", sourceId: "a1", title: "PDF 批注", locator: { materialId: "m1" } }, { sourceType: "ai-draft", sourceId: "draft1" }] },
  generatedCards: [{ id: "c1", deckId: "d1", ownerUserId: "u1", cardType: "basic", front: "问题", back: "答案", status: "active", createdAt: "", updatedAt: "" }],
  queueStates: { new: 1 }, tags: ["旧标签"]
};
afterEach(cleanup);

function mount(overrides: Partial<Parameters<typeof CardNoteManager>[0]> = {}) {
  const props = { notes: [note], busy: false, onSave: vi.fn().mockResolvedValue(note), onStatus: vi.fn(), onDelete: vi.fn().mockResolvedValue(undefined), ...overrides };
  render(<MemoryRouter><CardNoteManager {...props} /></MemoryRouter>);
  return props;
}

describe("CardNoteManager", () => {
  it("filters a concrete PDF through its annotation locator and offers other source categories", async () => {
    const user = userEvent.setup();
    const other = { ...note, cardNote: { ...note.cardNote, id: "n2", primarySourceLink: { sourceType: "note", sourceId: "note2", title: "笔记来源" }, sourceLinks: [{ sourceType: "note", sourceId: "note2", title: "笔记来源" }] } };
    mount({ notes: [note, other] });
    await user.selectOptions(screen.getByLabelText("筛选笔记来源类型"), "pdf");
    await user.selectOptions(screen.getByLabelText("筛选具体来源"), "material:m1");
    expect(screen.getByText("CardNote n1")).toBeInTheDocument();
    expect(screen.queryByText("CardNote n2")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("筛选笔记来源类型"), "note");
    expect(screen.getByText("CardNote n2")).toBeInTheDocument();
  });

  it("submits cleared tags and source edits while preserving locator and secondary links", async () => {
    const user = userEvent.setup();
    const props = mount();
    await user.clear(screen.getByLabelText("编辑 CardNote n1 标签"));
    await user.clear(screen.getByLabelText("编辑 CardNote n1 来源标题"));
    await user.type(screen.getByLabelText("编辑 CardNote n1 来源标题"), "新的标题");
    await user.type(screen.getByLabelText("编辑 CardNote n1 来源说明"), "补充来源");
    await user.click(screen.getByRole("button", { name: "保存并更新未学习卡片" }));
    expect(props.onSave).toHaveBeenCalledWith(note, expect.objectContaining({
      tags: [], primarySourceLink: expect.objectContaining({ title: "新的标题", excerpt: "补充来源", locator: { materialId: "m1" } }),
      sourceLinks: [expect.objectContaining({ title: "新的标题", locator: { materialId: "m1" } }), { sourceType: "ai-draft", sourceId: "draft1" }]
    }));
  });

  it("confirms history deletion and keeps the failed dialog ready to retry", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockRejectedValueOnce(new Error("暂时无法删除")).mockResolvedValue(undefined);
    mount({ onDelete });
    await user.click(screen.getByRole("button", { name: "删除卡片 c1" }));
    const dialog = screen.getByRole("dialog", { name: "删除这张卡片？" });
    expect(within(dialog).getByText(/复习记录/)).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole("button", { name: "确认删除" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("暂时无法删除");
    await user.click(within(dialog).getByRole("button", { name: "确认删除" }));
    expect(onDelete).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps unsaved input after a failed save and displays preserved-history results after retry", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValueOnce(null).mockResolvedValue({ ...note, regeneration: { createdCount: 1, updatedCount: 0, removedCount: 1, preservedCount: 2 } });
    mount({ onSave });
    expect(screen.getByRole("button", { name: "保存并更新未学习卡片" })).toBeDisabled();
    await user.type(screen.getByLabelText("编辑 CardNote n1 Front"), "补充");
    expect(screen.getByLabelText("笔记 n1 更新预览")).toHaveTextContent("当前模板将生成 1 张卡片");
    await user.click(screen.getByRole("button", { name: "保存并更新未学习卡片" }));
    expect(await screen.findByRole("status")).toHaveTextContent("保存失败");
    expect(screen.getByLabelText("编辑 CardNote n1 Front")).toHaveValue("问题补充");
    await user.click(screen.getByRole("button", { name: "保存并更新未学习卡片" }));
    expect(await screen.findByRole("status")).toHaveTextContent("保留 2 张已学习卡片");
  });

  it("provides pause, bury, restore and cancellation without deleting", async () => {
    const user = userEvent.setup();
    const paused = { ...note.generatedCards[0], id: "c2", status: "suspended" };
    const onStatus = vi.fn();
    const props = mount({ notes: [{ ...note, generatedCards: [...note.generatedCards, paused] }], onStatus });
    await user.click(screen.getByRole("button", { name: "暂停" }));
    await user.click(screen.getByRole("button", { name: "埋藏" }));
    await user.click(screen.getByRole("button", { name: "恢复" }));
    expect(onStatus.mock.calls.map((call) => call[1])).toEqual(["suspended", "buried", "active"]);
    await user.click(screen.getByRole("button", { name: "删除卡片 c2" }));
    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(props.onDelete).not.toHaveBeenCalled();
  });

  it("edits Cloze text and extra and can filter to an empty category", async () => {
    const user = userEvent.setup();
    const cloze = { ...note, cardNote: { ...note.cardNote, noteTypeCode: "cloze", fields: { text: "{{c1::知识}}", extra: "补充" } } };
    const props = mount({ notes: [cloze] });
    fireEvent.change(screen.getByLabelText("编辑 CardNote n1 Front"), { target: { value: "{{c1::知识}} {{c2::练习}}" } });
    await user.type(screen.getByLabelText("编辑 CardNote n1 Back"), "说明");
    expect(screen.getByLabelText("笔记 n1 更新预览")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "保存并更新未学习卡片" }));
    expect(props.onSave).toHaveBeenCalledWith(cloze, expect.objectContaining({ fields: { text: "{{c1::知识}} {{c2::练习}}", extra: "补充说明" } }));
    await user.selectOptions(screen.getByLabelText("筛选笔记来源类型"), "graph");
    expect(screen.getByText("当前来源没有笔记")).toBeInTheDocument();
  });

  it("guides a new user when no source notes have been created", () => {
    mount({ notes: [] });
    expect(screen.getByText("还没有来源笔记")).toBeInTheDocument();
  });

  it("previews only the reverse direction when this note selected the reverse template", async () => {
    const user = userEvent.setup();
    const reverseOnly = { ...note, cardNote: { ...note.cardNote, noteTypeCode: "basic_reverse" }, generatedCards: [{ ...note.generatedCards[0], templateId: "reverse-template", templateOrdinal: 1 }] };
    mount({ notes: [reverseOnly] });
    await user.type(screen.getByLabelText("编辑 CardNote n1 Front"), "补充");
    const preview = screen.getByLabelText("笔记 n1 更新预览");
    expect(preview).toHaveTextContent("当前模板将生成 1 张卡片");
    const items = within(preview).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(items[0].querySelector("span")).toHaveTextContent("答案");
    expect(items[0].querySelector("small")).toHaveTextContent("问题补充");
  });
  it("treats an omitted zero ordinal as the forward direction in API responses", async () => {
    const user = userEvent.setup();
    mount({ notes: [{ ...note, cardNote: { ...note.cardNote, noteTypeCode: "basic_reverse" } }] });
    await user.type(screen.getByLabelText("编辑 CardNote n1 Front"), "补充");
    const preview = screen.getByLabelText("笔记 n1 更新预览");
    expect(preview).toHaveTextContent("当前模板将生成 1 张卡片");
    expect(within(preview).getAllByRole("listitem")[0].querySelector("span")).toHaveTextContent("问题补充");
  });
});
