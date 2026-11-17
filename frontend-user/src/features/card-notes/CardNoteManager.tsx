import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { CardPayload, ManagedCardNotePayload } from "../../api/types";
import { ConfirmDialog, DataState, Select } from "../../design-system/primitives";
import { buildSourceBacklinkTarget, buildSourceProfileTarget } from "../sources/sourceLinks";
import { buildCardNoteEditDraft, buildCardNoteUpdate, cardNoteSources, formatCardNoteState, formatCardNoteTemplate, type CardNoteEditDraft, type CardNoteSourceCategory, type CardNoteUpdateInput } from "./cardNoteManagement";
import { buildCardNotePreview } from "./CardNoteComposer";
import "./card-note-manager.css";

type Props = {
  notes: ManagedCardNotePayload[];
  busy: boolean;
  onSave: (note: ManagedCardNotePayload, input: CardNoteUpdateInput) => Promise<ManagedCardNotePayload | null>;
  onStatus: (card: CardPayload, status: "active" | "suspended" | "buried") => void;
  onDelete: (card: CardPayload) => Promise<void>;
};

export function CardNoteManager(props: Props) {
  const [drafts, setDrafts] = useState<Record<string, CardNoteEditDraft>>({});
  const [category, setCategory] = useState<CardNoteSourceCategory>("all");
  const [sourceKey, setSourceKey] = useState("");
  const [deleteCard, setDeleteCard] = useState<CardPayload | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [saveResults, setSaveResults] = useState<Record<string, string>>({});
  const sources = useMemo(() => Array.from(new Map(props.notes.flatMap(cardNoteSources).filter((source) => category === "all" || source.category === category).map((source) => [source.key, source])).values()), [props.notes, category]);
  const visible = props.notes.filter((note) => {
    const links = cardNoteSources(note);
    return (category === "all" || links.some((link) => link.category === category)) && (!sourceKey || links.some((link) => link.key === sourceKey));
  });

  function changeDraft(note: ManagedCardNotePayload, field: keyof CardNoteEditDraft, value: string) {
    setDrafts((current) => ({ ...current, [note.cardNote.id]: { ...(current[note.cardNote.id] ?? buildCardNoteEditDraft(note)), [field]: value } }));
    setSaveResults((current) => ({ ...current, [note.cardNote.id]: "" }));
  }

  async function save(note: ManagedCardNotePayload) {
    setSaveResults((current) => ({ ...current, [note.cardNote.id]: "正在保存..." }));
    const updated = await props.onSave(note, buildCardNoteUpdate(note, drafts[note.cardNote.id] ?? buildCardNoteEditDraft(note)));
    if (updated) {
      setDrafts((current) => ({ ...current, [updated.cardNote.id]: buildCardNoteEditDraft(updated) }));
      const result = updated.regeneration;
      setSaveResults((current) => ({ ...current, [updated.cardNote.id]: result
        ? `已保存：新增 ${result.createdCount} 张，更新 ${result.updatedCount} 张，移除 ${result.removedCount} 张，保留 ${result.preservedCount} 张已学习卡片。`
        : "已保存。已学习卡片保留原文和复习进度。" }));
    } else {
      setSaveResults((current) => ({ ...current, [note.cardNote.id]: "保存失败，修改内容已保留，请重试。" }));
    }
  }

  async function confirmDelete() {
    if (!deleteCard || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const note = props.notes.find((note) => note.generatedCards.some((card) => card.id === deleteCard.id));
      const noteId = note?.cardNote.id;
      const hasUnsavedChanges = note && drafts[note.cardNote.id] && JSON.stringify(drafts[note.cardNote.id]) !== JSON.stringify(buildCardNoteEditDraft(note));
      await props.onDelete(deleteCard);
      if (noteId) setSaveResults((current) => ({ ...current, [noteId]: "" }));
      if (noteId && !hasUnsavedChanges) setDrafts((current) => Object.fromEntries(Object.entries(current).filter(([id]) => id !== noteId)));
      setDeleteCard(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "删除失败，请重试。");
    } finally {
      setDeleting(false);
    }
  }

  return <div className="review-management-stack card-note-manager">
    <section className="review-management-deck-summary">
      <strong>来源笔记与卡片</strong>
      <span>按来源笔记管理生成的卡片。保存后按当前模板更新未学习卡片，已学习卡片保留原文和进度。</span>
    </section>
    <div className="review-card-browser__toolbar">
      <label className="review-card-browser__field"><span>来源类型</span>
        <Select aria-label="筛选笔记来源类型" value={category} onChange={(event) => { setCategory(event.target.value as CardNoteSourceCategory); setSourceKey(""); }}>
          <option value="all">全部来源</option><option value="pdf">PDF / 阅读批注</option><option value="graph">图谱</option><option value="ai">AI 草稿 / 任务</option><option value="note">笔记</option>
        </Select>
      </label>
      <label className="review-card-browser__field"><span>具体来源</span>
        <Select aria-label="筛选具体来源" value={sourceKey} onChange={(event) => setSourceKey(event.target.value)}>
          <option value="">全部对象</option>{sources.map((source) => <option key={source.key} value={source.key}>{source.label}</option>)}
        </Select>
      </label>
      <small>{`显示 ${visible.length} / ${props.notes.length} 条笔记`}</small>
    </div>
    {visible.length ? <div className="review-card-list">{visible.map((note) => {
      const draft = drafts[note.cardNote.id] ?? buildCardNoteEditDraft(note);
      const source = note.cardNote.primarySourceLink ?? note.cardNote.sourceLinks?.[0];
      const profile = buildSourceProfileTarget(source);
      const backlink = buildSourceBacklinkTarget(source);
      const hasChanges = JSON.stringify(draft) !== JSON.stringify(buildCardNoteEditDraft(note));
      const allPreviews = buildCardNotePreview({ front: note.cardNote.noteTypeCode === "cloze" ? draft.extra : draft.front, back: note.cardNote.noteTypeCode === "cloze" ? draft.text : draft.back }, note.cardNote.noteTypeCode === "cloze" ? "cloze" : note.cardNote.noteTypeCode === "basic_reverse" ? "basic_reverse" : "basic");
      const preview = note.cardNote.noteTypeCode === "basic_reverse" && note.generatedCards.length
        ? allPreviews.filter((_, ordinal) => note.generatedCards.some((card) => (card.templateOrdinal ?? 0) === ordinal))
        : allPreviews;
      return <article className="review-managed-card" key={note.cardNote.id}>
        <div className="review-managed-card__head"><div className="review-managed-card__title">
          <strong>{source?.title || note.cardNote.fields?.front || "来源笔记"}</strong><small>{`CardNote ${note.cardNote.id}`}</small><small>{`${formatCardNoteTemplate(note.cardNote.noteTypeCode)} · ${note.generatedCards.length} 张卡片`}</small>
        </div></div>
        <div className="review-managed-card__meta">
          <small>{`模板 ${formatCardNoteTemplate(note.cardNote.noteTypeCode)}`}</small>
          <small>{source ? `来源：${({ note: "笔记", "note-block": "笔记块", material: "PDF / 资料", annotation: "阅读批注", "pdf-anchor": "PDF 定位", graph: "图谱", "graph-node": "图谱节点", "ai-draft": "AI 草稿", "ai-task": "AI 任务" } as Record<string, string>)[source.sourceType] ?? "其他来源"}` : "来源未绑定"}</small>
          <small>{Object.entries(note.queueStates).map(([state, count]) => `${formatCardNoteState(state)} ${count}`).join(" / ")}</small>
        </div>
        <nav className="card-note-manager__source-actions" aria-label={`笔记 ${note.cardNote.id} 来源操作`}>
          {profile ? <Link className="review-source-link" to={profile}>查看来源学习档案</Link> : null}
          {backlink ? <Link className="review-source-link" to={backlink}>回到来源</Link> : null}
        </nav>
        {([note.cardNote.noteTypeCode === "cloze" ? "text" : "front", note.cardNote.noteTypeCode === "cloze" ? "extra" : "back"] as const).map((field, index) => <label className="review-card-browser__field" key={field}>
          <span>{field === "text" ? "填空文本" : field === "extra" ? "补充说明" : index === 0 ? "问题" : "答案"}</span>
          <textarea aria-label={`编辑 CardNote ${note.cardNote.id} ${index === 0 ? "Front" : "Back"}`} rows={3} value={draft[field]} onChange={(event) => changeDraft(note, field, event.target.value)} />
        </label>)}
        <label className="review-card-browser__field"><span>标签（逗号分隔，可清空）</span>
          <input aria-label={`编辑 CardNote ${note.cardNote.id} 标签`} value={draft.tags} onChange={(event) => changeDraft(note, "tags", event.target.value)} />
        </label>
        {source ? <>
          <label className="review-card-browser__field"><span>来源标题</span><input aria-label={`编辑 CardNote ${note.cardNote.id} 来源标题`} maxLength={500} value={draft.sourceTitle} onChange={(event) => changeDraft(note, "sourceTitle", event.target.value)} /></label>
          <label className="review-card-browser__field"><span>来源说明</span><textarea aria-label={`编辑 CardNote ${note.cardNote.id} 来源说明`} maxLength={10000} rows={2} value={draft.sourceExcerpt} onChange={(event) => changeDraft(note, "sourceExcerpt", event.target.value)} /></label>
        </> : null}
        {hasChanges ? <section className="reader-draft-preview" aria-label={`笔记 ${note.cardNote.id} 更新预览`}><strong>{`当前模板将生成 ${preview.length} 张卡片`}</strong><ul>{preview.map((card, index) => <li key={index}><span>{card.front}</span><small>{card.back}</small></li>)}</ul><small>预览表示当前模板内容；已学习卡片仍保留原文和进度。</small></section> : null}
        <div className="review-card-browser__summary"><strong>生成卡片</strong><span>{`${note.generatedCards.length} 张卡片`}</span></div>
        {note.generatedCards.length ? <div className="review-card-list">{note.generatedCards.map((card) => <article className="review-managed-card" key={card.id}>
          <strong>{card.front}</strong><p>{card.back}</p>
          <div className="review-managed-card__meta"><small>{formatCardNoteState(card.schedule?.state ?? "new")}</small><small>{formatCardNoteState(card.status)}</small></div>
          <div className="review-managed-card__actions">
            {card.status === "active" ? <><button className="secondary-button" disabled={props.busy} onClick={() => props.onStatus(card, "suspended")} type="button">暂停</button><button className="secondary-button" disabled={props.busy} onClick={() => props.onStatus(card, "buried")} type="button">埋藏</button></> : <button className="secondary-button" disabled={props.busy} onClick={() => props.onStatus(card, "active")} type="button">恢复</button>}
            <button aria-label={`删除卡片 ${card.id}`} className="secondary-button" disabled={props.busy} onClick={() => { setDeleteCard(card); setDeleteError(""); }} type="button">删除卡片</button>
          </div>
        </article>)}</div> : <DataState kind="empty" title="这条笔记还没有卡片" description="来源笔记仍然保留。修改内容后保存，可按当前模板重新生成卡片。" />}
        <button className="primary-button" disabled={props.busy || !hasChanges} onClick={() => void save(note)} type="button">保存并更新未学习卡片</button>
        {saveResults[note.cardNote.id] ? <p role="status">{saveResults[note.cardNote.id]}</p> : null}
      </article>;
    })}</div> : <DataState description={props.notes.length ? "选择其他来源，或清除来源筛选后再试。" : "从阅读批注、AI 草稿、笔记或图谱创建卡片后，在这里查看和编辑。"} kind="empty" title={props.notes.length ? "当前来源没有笔记" : "还没有来源笔记"} />}
    <ConfirmDialog isOpen={Boolean(deleteCard)} title="删除这张卡片？" confirmLabel="确认删除" confirmTone="danger" confirming={deleting} errorMessage={deleteError}
      description={<><p>{deleteCard?.front}</p><p>这张卡片及其复习计划、复习记录将永久删除。来源笔记和其他卡片保留；如只想暂时停止复习，请取消后选择暂停。</p><p>删除不会修改来源笔记的模板，下次保存笔记时可能重新生成这张卡片。</p></>}
      onCancel={() => { if (!deleting) setDeleteCard(null); }} onConfirm={() => void confirmDelete()} />
  </div>;
}
