import type { DeckPayload } from "../../api/client";
import { Select } from "../../design-system/primitives";
import { Link } from "react-router-dom";

export type CardNoteTemplateCode = "basic" | "basic_reverse" | "cloze";

export type CardNoteComposerDraft = {
  id: string;
  title: string;
  excerpt?: string;
  locatorLabel?: string;
  sourcePath?: string;
  front: string;
  back: string;
  explanation?: string;
};

const templateOptions: Array<{ value: CardNoteTemplateCode; label: string }> = [
  { value: "basic", label: "Basic" },
  { value: "basic_reverse", label: "Basic Reverse" },
  { value: "cloze", label: "Cloze" }
];

export function CardNoteComposer(props: {
  allowedTemplates: CardNoteTemplateCode[];
  busy?: boolean;
  decks: DeckPayload[];
  drafts: CardNoteComposerDraft[];
  onDeckChange: (deckId: string) => void;
  onDraftFieldChange: (draftId: string, field: "front" | "back", value: string) => void;
  onSubmit: () => void;
  onTemplateChange: (template: CardNoteTemplateCode) => void;
  selectedDeckId: string;
  selectClassName?: string;
  submitLabel?: string;
  template: CardNoteTemplateCode;
}) {
  const options = templateOptions.filter((option) => props.allowedTemplates.includes(option.value));
  const validationMessages = props.drafts.map((draft) => validateCardNoteDraft(draft, props.template));
  const canSubmit = props.drafts.length > 0 && validationMessages.every((message) => !message);
  const generatedCount = props.drafts.reduce((count, draft) => count + buildCardNotePreview(draft, props.template).length, 0);

  return (
    <div className="card-note-composer">
      <section className="card-note-composer__controls">
        <label className="form-stack">
          <span>写入 Deck</span>
          <Select
            aria-label="写入 Deck"
            className={props.selectClassName}
            onChange={(event) => props.onDeckChange(event.target.value)}
            value={props.selectedDeckId}
          >
            <option value="">请选择一个 deck</option>
            {props.decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.title}
              </option>
            ))}
          </Select>
        </label>
        <label className="form-stack">
          <span>卡片模板</span>
          <Select
            aria-label="卡片模板"
            className={props.selectClassName}
            onChange={(event) => props.onTemplateChange(event.target.value as CardNoteTemplateCode)}
            value={props.template}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
        <button
          className="primary-button"
          disabled={!props.selectedDeckId || props.busy || !canSubmit}
          onClick={props.onSubmit}
          type="button"
        >
          {props.busy ? "写入中..." : props.submitLabel || "写入复习系统"}
        </button>
      </section>
      <p aria-live="polite">{`将生成 ${generatedCount} 张卡片`}</p>
      {props.template === "cloze" ? <p className="muted-copy">{"使用 {{c1::答案}} 标记填空；同一编号共同隐藏，不同编号各生成一张卡片。"}</p> : null}

      <div className="studio-draft-list">
        {props.drafts.map((draft, draftIndex) => (
          <article className="studio-draft-card card-note-composer__draft" key={draft.id}>
            <strong>{draft.title}</strong>
            {draft.excerpt ? <p>{draft.excerpt}</p> : null}
            {draft.locatorLabel ? <small>{draft.locatorLabel}</small> : null}
            {draft.sourcePath ? (
              <p className="inline-link-row">
                <Link to={draft.sourcePath}>打开来源工作台</Link>
              </p>
            ) : null}
            <label>
              <span>{props.template === "cloze" ? "补充说明" : "问题"}</span>
              <input onChange={(event) => props.onDraftFieldChange(draft.id, "front", event.target.value)} value={draft.front} />
            </label>
            <label>
              <span>{props.template === "cloze" ? "填空文本" : "答案"}</span>
              <textarea onChange={(event) => props.onDraftFieldChange(draft.id, "back", event.target.value)} rows={4} value={draft.back} />
            </label>
            <div className="reader-draft-preview">
              <strong>即将生成</strong>
              {validationMessages[draftIndex] ? <p role="status">{validationMessages[draftIndex]}</p> : null}
              <ul>
                {buildCardNotePreview(draft, props.template).map((preview, index) => (
                  <li key={`${draft.id}-preview-${index}`}>
                    <span>{preview.front}</span>
                    <small>{preview.back}</small>
                  </li>
                ))}
              </ul>
            </div>
            {draft.explanation ? <small>{draft.explanation}</small> : null}
          </article>
        ))}
      </div>
    </div>
  );
}

export function buildCardNoteFields(draft: Pick<CardNoteComposerDraft, "front" | "back">, template: CardNoteTemplateCode): Record<string, string> {
  if (template === "cloze") {
    return {
      text: draft.back,
      extra: draft.front
    };
  }

  return {
    front: draft.front,
    back: draft.back
  };
}

export function buildCardNotePreview(draft: Pick<CardNoteComposerDraft, "front" | "back">, template: CardNoteTemplateCode) {
  if (template === "basic_reverse") {
    return [
      { front: draft.front, back: draft.back },
      { front: draft.back, back: draft.front }
    ];
  }

  if (template === "cloze") {
    const text = draft.back.trim();
    const pattern = /\{\{c(\d+)::(.*?)(?:::(.*?))?\}\}/g;
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 1000) return [];
    if (matches.some((match) => !match[2].trim() || Number(match[1]) < 1 || Number(match[1]) > 1_000_000)) return [];
    const ordinals = Array.from(new Set(matches.map((match) => Number(match[1]))));
    if (ordinals.length > 100) return [];
    const answer = text.replace(pattern, (_marker, _ordinal: string, value: string) => value);
    return ordinals.map((ordinal) => ({
      front: text.replace(pattern, (_marker, number: string, value: string) => Number(number) === ordinal ? "[...]" : value),
      back: `${answer}${draft.front.trim() ? `\n\n${draft.front.trim()}` : ""}`
    }));
  }

  return [{ front: draft.front, back: draft.back }];
}

function validateCardNoteDraft(draft: Pick<CardNoteComposerDraft, "front" | "back">, template: CardNoteTemplateCode) {
  if (template === "cloze") {
    return buildCardNotePreview(draft, template).length ? "" : "请在填空文本中添加 {{c1::答案}} 标记；答案不能为空，编号须为 1–1000000，每条草稿最多 100 张卡片和 1000 处标记。";
  }
  return draft.front.trim() && draft.back.trim() ? "" : "请填写问题和答案后再写入。";
}
