import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { AuthSession, CardDraftPayload, DeckPayload, MaterialPayload, NotePayload, NoteVersionPayload } from "../api/client";
import { bulkCreateDeckCards, createNote, deleteNote, generateNoteCardDrafts, generateNoteGraphDrafts, listDecks, listMaterials, listNotes, listNoteVersions, restoreNoteVersion, updateNote } from "../api/client";
import { RichTextEditor } from "../modules/notes/RichTextEditor";
import { buildCardInputsFromDrafts, createNoteDraft, displayMaterialCategory, displayMaterialDescription, displayMaterialTitle, displayNoteSummary, displayNoteTitle, formatDate, SectionFrame, stripHtml, WorkspaceHeader } from "../app/appShared";

export function NotesPage(props: { session: AuthSession }) {
  const [notes, setNotes] = useState<NotePayload[]>([]);
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [decks, setDecks] = useState<DeckPayload[]>([]);
  const [versions, setVersions] = useState<NoteVersionPayload[]>([]);
  const [noteId, setNoteId] = useState("");
  const [draft, setDraft] = useState(createNoteDraft());
  const [cardDrafts, setCardDrafts] = useState<CardDraftPayload[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const searchParams = new URLSearchParams(useLocation().search);

  async function loadAll(selected?: string) {
    const [noteItems, materialItems, deckItems] = await Promise.all([
      listNotes(props.session),
      listMaterials(),
      listDecks(props.session)
    ]);
    setNotes(noteItems);
    setMaterials(materialItems);
    setDecks(deckItems);
    setSelectedDeckId((current) => current || deckItems[0]?.id || "");
    const nextId = selected || searchParams.get("selected") || noteItems[0]?.id || "";
    setNoteId(nextId);
  }

  useEffect(() => {
    void loadAll().catch(() => {
      setNotes([]);
      setMaterials([]);
      setDecks([]);
    });
  }, [props.session]);

  const selectedNote = notes.find((note) => note.id === noteId) ?? notes[0] ?? null;
  const relatedMaterial = materials.find((material) => material.id === (draft.materialId || selectedNote?.materialId || ""));

  useEffect(() => {
    if (!selectedNote) {
      setDraft(createNoteDraft());
      setVersions([]);
      setCardDrafts([]);
      return;
    }

    setDraft({
      title: displayNoteTitle(selectedNote) === "未命名笔记" ? "" : displayNoteTitle(selectedNote),
      summary: displayNoteSummary(selectedNote) === "这条笔记还没有摘要。" ? "" : displayNoteSummary(selectedNote),
      content: selectedNote.content,
      materialId: selectedNote.materialId,
      folderName: selectedNote.folderName || "收集箱",
      tags: selectedNote.tags
    });

    void listNoteVersions(props.session, selectedNote.id).then(setVersions).catch(() => setVersions([]));
    setCardDrafts([]);
  }, [props.session, selectedNote]);

  async function handleCreate() {
    setBusy("create");
    setMessage("");
    try {
      const created = await createNote(props.session, draft);
      await loadAll(created.id);
      setMessage("笔记已创建。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "创建笔记失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleUpdate() {
    if (!selectedNote) {
      return;
    }

    setBusy("update");
    setMessage("");
    try {
      await updateNote(props.session, selectedNote.id, {
        title: draft.title,
        summary: draft.summary || stripHtml(draft.content).slice(0, 80),
        content: draft.content,
        folderName: draft.folderName,
        tags: draft.tags
      });
      await loadAll(selectedNote.id);
      setMessage("笔记已保存，新版本已经记录。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存笔记失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleDelete() {
    if (!selectedNote || !window.confirm("确定删除这条笔记吗？")) {
      return;
    }

    setBusy("delete");
    setMessage("");
    try {
      await deleteNote(props.session, selectedNote.id);
      await loadAll();
      setMessage("笔记已删除。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除笔记失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleRestore(versionId: string) {
    if (!selectedNote) {
      return;
    }

    setBusy(`restore-${versionId}`);
    try {
      await restoreNoteVersion(props.session, selectedNote.id, versionId);
      await loadAll(selectedNote.id);
      setMessage("已恢复到所选版本。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "恢复版本失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleGenerateCardDrafts() {
    if (!selectedNote) {
      return;
    }

    setBusy("note-drafts");
    setMessage("");
    try {
      const payload = await generateNoteCardDrafts(props.session, selectedNote.id);
      setCardDrafts(payload);
      setMessage(payload.length ? "已生成笔记复习草稿。" : "这条笔记暂时没有可生成的草稿。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "生成笔记草稿失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleGenerateGraphDrafts() {
    if (!selectedNote) {
      return;
    }

    setBusy("note-graph-drafts");
    setMessage("");
    try {
      const payload = await generateNoteGraphDrafts(props.session, selectedNote.id);
      setMessage(payload.length ? "已生成笔记图谱变更草稿，去 AI 工作台确认。" : "这条笔记暂时没有可生成的图谱变更草稿。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "生成笔记图谱草稿失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleCommitCardDrafts() {
    if (!selectedDeckId || cardDrafts.length === 0) {
      return;
    }

    setBusy("note-commit");
    setMessage("");
    try {
      const payload = await bulkCreateDeckCards(props.session, selectedDeckId, buildCardInputsFromDrafts(cardDrafts));
      setDecks((current) =>
        current.map((deck) =>
          deck.id === selectedDeckId
            ? { ...deck, cardCount: deck.cardCount + payload.length, updatedAt: new Date().toISOString() }
            : deck
        )
      );
      setCardDrafts([]);
      setMessage(`已把 ${payload.length} 张笔记卡片写入 deck。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "写入复习卡片失败。");
    } finally {
      setBusy("");
    }
  }

  function handleDraftChange(draftId: string, field: "front" | "back", value: string) {
    setCardDrafts((current) =>
      current.map((item) => (item.id === draftId ? { ...item, [field]: value } : item))
    );
  }

  return (
    <>
      <WorkspaceHeader
        actions={
          <div className="header-actions">
            <button className="secondary-button" onClick={() => setDraft(createNoteDraft(relatedMaterial?.id ?? ""))} type="button">
              清空草稿
            </button>
            <button className="primary-button" disabled={busy === "create"} onClick={handleCreate} type="button">
              新建笔记
            </button>
          </div>
        }
        description="笔记页现在不只是一个文本框了。左侧是笔记清单，中间是富文本编辑器，右侧挂版本、来源资料和后续图谱入口。"
        eyebrow="笔记"
        title="把阅读后的内容沉淀成可复用的笔记"
      />

      <div className="notes-workspace">
        <SectionFrame slim subtitle="笔记列表" title="最近编辑">
          <div className="list-stack">
            {notes.map((note) => (
              <button
                className={selectedNote?.id === note.id ? "list-row active" : "list-row"}
                key={note.id}
                onClick={() => setNoteId(note.id)}
                type="button"
              >
                <div>
                  <strong>{displayNoteTitle(note)}</strong>
                  <p>{displayNoteSummary(note)}</p>
                </div>
                <span>v{note.versionNumber}</span>
              </button>
            ))}
          </div>
        </SectionFrame>

        <div className="page-stack">
          <SectionFrame
            action={
              <div className="detail-actions">
                {selectedNote ? (
                  <button className="secondary-button" disabled={busy === "delete"} onClick={handleDelete} type="button">
                    删除
                  </button>
                ) : null}
                <button
                  className="secondary-button"
                  disabled={!selectedNote || busy === "note-drafts"}
                  onClick={() => void handleGenerateCardDrafts()}
                  type="button"
                >
                  生成复习草稿
                </button>
                <button
                  className="secondary-button"
                  disabled={!selectedNote || busy === "note-graph-drafts"}
                  onClick={() => void handleGenerateGraphDrafts()}
                  type="button"
                >
                  生成图谱变更
                </button>
                <button className="primary-button" disabled={busy === "update"} onClick={handleUpdate} type="button">
                  保存当前版本
                </button>
              </div>
            }
            subtitle="编辑区"
            title={selectedNote ? displayNoteTitle(selectedNote) : "新建笔记"}
          >
            <div className="form-stack">
              <label>
                <span>标题</span>
                <input onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} value={draft.title} />
              </label>
              <label>
                <span>摘要</span>
                <input onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} value={draft.summary} />
              </label>
              <label>
                <span>文件夹</span>
                <input onChange={(event) => setDraft((current) => ({ ...current, folderName: event.target.value }))} value={draft.folderName} />
              </label>
              <label>
                <span>关联资料</span>
                <select
                  className="select-field"
                  onChange={(event) => setDraft((current) => ({ ...current, materialId: event.target.value }))}
                  value={draft.materialId}
                >
                  <option value="">暂不关联</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {displayMaterialTitle(material)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>标签</span>
                <input
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      tags: event.target.value.split(",").map((item) => item.trim()).filter(Boolean)
                    }))
                  }
                  value={draft.tags.join(", ")}
                />
              </label>
            </div>
            <RichTextEditor
              onChange={(value) => setDraft((current) => ({ ...current, content: value }))}
              placeholder="开始写下你的阅读理解、问题和待整理线索..."
              value={draft.content}
            />
            {message ? <p className="muted-copy">{message}</p> : null}
          </SectionFrame>

          <div className="main-grid">
            <SectionFrame slim subtitle="来源资料" title="当前关联">
              {relatedMaterial ? (
                <article className="profile-summary">
                  <strong>{displayMaterialTitle(relatedMaterial)}</strong>
                  <span>{displayMaterialDescription(relatedMaterial)}</span>
                  <span>{displayMaterialCategory(relatedMaterial)}</span>
                  <Link className="secondary-button" to={`/reader/${relatedMaterial.id}`}>
                    回到阅读器
                  </Link>
                </article>
              ) : (
                <article className="placeholder-card">
                  <strong>暂未关联资料</strong>
                  <p>你可以在上方选择一份资料，让笔记和阅读状态形成回路。</p>
                </article>
              )}
            </SectionFrame>

            <div className="page-stack">
              <SectionFrame slim subtitle="版本" title="历史记录">
                <div className="list-stack dense">
                  {versions.map((version) => (
                    <div className="list-row compact" key={version.id}>
                      <div>
                        <strong>v{version.versionNumber}</strong>
                        <p>{version.title}</p>
                      </div>
                      <button className="secondary-button" disabled={busy === `restore-${version.id}`} onClick={() => handleRestore(version.id)} type="button">
                        恢复
                      </button>
                    </div>
                  ))}
                </div>
              </SectionFrame>

              <SectionFrame slim subtitle="Phase 6 / 7" title="复习草稿">
                {cardDrafts.length ? (
                  <div className="page-stack">
                    <div className="graph-form-stack">
                      <label>
                        <span>写入 Deck</span>
                        <select onChange={(event) => setSelectedDeckId(event.target.value)} value={selectedDeckId}>
                          <option value="">请选择一个 deck</option>
                          {decks.map((deck) => (
                            <option key={deck.id} value={deck.id}>
                              {deck.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        className="secondary-button"
                        disabled={!selectedDeckId || busy === "note-commit"}
                        onClick={() => void handleCommitCardDrafts()}
                        type="button"
                      >
                        写入复习系统
                      </button>
                    </div>

                    <div className="graph-card-draft-list">
                      {cardDrafts.map((item) => (
                        <article className="graph-card-draft" key={item.id}>
                          <strong>{item.sourceLabel || "笔记草稿"}</strong>
                          <label>
                            <span>问题</span>
                            <input onChange={(event) => handleDraftChange(item.id, "front", event.target.value)} value={item.front} />
                          </label>
                          <label>
                            <span>答案</span>
                            <textarea onChange={(event) => handleDraftChange(item.id, "back", event.target.value)} rows={4} value={item.back} />
                          </label>
                          {item.explanation ? <small>{item.explanation}</small> : null}
                        </article>
                      ))}
                    </div>
                  </div>
                ) : decks.length ? (
                  <article className="graph-meta-card muted">
                    <strong>先生成草稿</strong>
                    <p>这块会承接从当前笔记提取出的问答卡片。你可以先保存笔记，再生成并确认写入 deck。</p>
                  </article>
                ) : (
                  <article className="graph-meta-card muted">
                    <strong>Deck 尚未准备好</strong>
                    <p>先去复习页创建一个 deck，这里就能把笔记草稿直接写进去。</p>
                  </article>
                )}
              </SectionFrame>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
