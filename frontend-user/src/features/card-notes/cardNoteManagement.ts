import type { ManagedCardNotePayload, SourceLinkPayload } from "../../api/types";

export type CardNoteEditDraft = { front: string; back: string; text: string; extra: string; tags: string; sourceTitle: string; sourceExcerpt: string };
export type CardNoteUpdateInput = { fields: Record<string, string>; tags: string[]; primarySourceLink?: SourceLinkPayload; sourceLinks?: SourceLinkPayload[] };
export type CardNoteSourceCategory = "all" | "pdf" | "graph" | "ai" | "note";

export function buildCardNoteEditDraft(note: ManagedCardNotePayload): CardNoteEditDraft {
  const fields = note.cardNote.fields ?? {};
  const source = note.cardNote.primarySourceLink ?? note.cardNote.sourceLinks?.[0];
  return { front: fields.front ?? "", back: fields.back ?? "", text: fields.text ?? "", extra: fields.extra ?? "", tags: (note.tags ?? []).join(", "), sourceTitle: source?.title ?? "", sourceExcerpt: source?.excerpt ?? "" };
}

export function buildCardNoteUpdate(note: ManagedCardNotePayload, draft: CardNoteEditDraft): CardNoteUpdateInput {
  const original = note.cardNote.primarySourceLink ?? note.cardNote.sourceLinks?.[0];
  const primarySourceLink = original ? {
    ...original,
    ...(draft.sourceTitle.trim() !== (original.title ?? "") ? { title: draft.sourceTitle.trim() } : {}),
    ...(draft.sourceExcerpt.trim() !== (original.excerpt ?? "") ? { excerpt: draft.sourceExcerpt.trim() } : {})
  } : undefined;
  const existingLinks = note.cardNote.sourceLinks ?? (original ? [original] : []);
  const sourceLinks = existingLinks.map((link) => link.sourceType === original?.sourceType && link.sourceId === original.sourceId ? { ...link, ...primarySourceLink } : link);
  return {
    fields: note.cardNote.noteTypeCode === "cloze" ? { text: draft.text, extra: draft.extra } : { front: draft.front, back: draft.back },
    tags: Array.from(new Set(draft.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean))),
    ...(primarySourceLink ? { primarySourceLink, sourceLinks } : {})
  };
}

export function cardNoteSources(note: ManagedCardNotePayload) {
  const source = note.cardNote.primarySourceLink;
  const links = [...(source ? [source] : []), ...(note.cardNote.sourceLinks ?? [])];
  return links.flatMap((link) => {
    const locatorString = (key: string) => typeof link.locator?.[key] === "string" ? String(link.locator[key]) : "";
    const type = link.sourceType;
    let category: CardNoteSourceCategory;
    let key: string;
    if (["material", "annotation", "pdf-anchor"].includes(type)) {
      category = "pdf";
      key = `material:${locatorString("materialId") || link.sourceId}`;
    } else if (["graph", "graph-node"].includes(type)) {
      category = "graph";
      key = `graph:${locatorString("graphId") || link.sourceId}`;
    } else if (["ai-draft", "ai-task"].includes(type)) {
      category = "ai";
      key = `${type}:${link.sourceId}`;
    } else if (["note", "note-block"].includes(type)) {
      category = "note";
      key = `note:${locatorString("noteId") || link.sourceId}`;
    } else {
      return [];
    }
    return [{ category, key, label: link.title || link.sourceId }];
  });
}

export function formatCardNoteState(state: string) {
  return ({ new: "新卡", learning: "学习中", review: "复习", relearning: "重新学习", suspended: "已暂停", buried: "已埋藏", active: "正常" } as Record<string, string>)[state] ?? state;
}

export function formatCardNoteTemplate(code?: string) {
  return ({ basic: "问答卡", basic_reverse: "双向问答卡", cloze: "填空卡" } as Record<string, string>)[code ?? "basic"] ?? "自定义模板";
}
