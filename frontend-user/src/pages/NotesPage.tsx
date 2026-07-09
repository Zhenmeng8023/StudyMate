import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, History, Layers3, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Plus, Sparkles } from "lucide-react";
import type { AuthSession, CardDraftPayload, DeckPayload, MaterialPayload, NotePayload, NoteVersionPayload } from "../api/client";
import {
  bulkCreateDeckCards,
  createNote,
  deleteNote,
  generateNoteCardDrafts,
  generateNoteGraphDrafts,
  listDecks,
  listMaterials,
  listNotes,
  listNoteVersions,
  restoreNoteVersion,
  updateNote
} from "../api/client";
import { DataState, Select } from "../design-system/primitives";
import { RichTextEditor } from "../modules/notes/RichTextEditor";
import {
  buildCardInputsFromDrafts,
  createNoteDraft,
  displayMaterialCategory,
  displayMaterialDescription,
  displayMaterialTitle,
  displayNoteSummary,
  displayNoteTitle,
  formatDate,
  stripHtml
} from "../app/appShared";

type NoteInspectorTab = "source" | "history" | "review";

const noteInspectorTabs: Array<{ id: NoteInspectorTab; label: string }> = [
  { id: "source", label: "来源" },
  { id: "history", label: "历史" },
  { id: "review", label: "复习" }
];

export function NotesPage(props: { session: AuthSession }) {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const materialFromQuery = searchParams.get("material") || "";
  const [notes, setNotes] = useState<NotePayload[]>([]);
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [decks, setDecks] = useState<DeckPayload[]>([]);
  const [versions, setVersions] = useState<NoteVersionPayload[]>([]);
  const [noteId, setNoteId] = useState("");
  const [draft, setDraft] = useState(() => createNoteDraft(materialFromQuery));
  const [cardDrafts, setCardDrafts] = useState<CardDraftPayload[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notesOpen, setNotesOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<NoteInspectorTab>("source");

  async function loadAll(selected?: string) {
    setLoading(true);
    setLoadError("");
    try {
      const [noteItems, materialItems, deckItems] = await Promise.all([
        listNotes(props.session),
        listMaterials(),
        listDecks(props.session)
      ]);
      setNotes(noteItems);
      setMaterials(materialItems);
      setDecks(deckItems);
      setSelectedDeckId((current) => current || deckItems[0]?.id || "");
      const nextId = selected || searchParams.get("selected") || (materialFromQuery ? "" : noteItems[0]?.id || "");
      setNoteId(nextId);
      if (!nextId && materialFromQuery) {
        setDraft(createNoteDraft(materialFromQuery));
      }
    } catch (error) {
      setNotes([]);
      setMaterials([]);
      setDecks([]);
      setLoadError(error instanceof Error ? error.message : "加载笔记工作台失败。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // Query parameters intentionally choose the initial note / source for this workspace.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.session, materialFromQuery, searchParams]);

  const selectedNote = useMemo(
    () => (noteId ? notes.find((note) => note.id === noteId) ?? null : null),
    [notes, noteId]
  );
  const relatedMaterial = useMemo(
    () => materials.find((material) => material.id === (draft.materialId || selectedNote?.materialId || "")) ?? null,
    [draft.materialId, materials, selectedNote?.materialId]
  );

  useEffect(() => {
    if (!selectedNote) {
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

  function handleStartNewNote() {
    setNoteId("");
    setDraft(createNoteDraft(materialFromQuery || relatedMaterial?.id || ""));
    setVersions([]);
    setCardDrafts([]);
    setActiveInspectorTab("source");
    setInspectorOpen(true);
    setMessage("");
  }

  function handleSelectNote(nextNoteId: string) {
    setNoteId(nextNoteId);
    setActiveInspectorTab("source");
    setInspectorOpen(true);
  }

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
    if (!selectedNote) return;

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
    if (!selectedNote || !window.confirm("确定删除这条笔记吗？")) return;

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
    if (!selectedNote) return;

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
    if (!selectedNote) return;

    setBusy("note-drafts");
    setMessage("");
    try {
      const payload = await generateNoteCardDrafts(props.session, selectedNote.id);
      setCardDrafts(payload);
      setActiveInspectorTab("review");
      setInspectorOpen(true);
      setMessage(payload.length ? "已生成笔记复习草稿。" : "这条笔记暂时没有可生成的草稿。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "生成笔记草稿失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleGenerateGraphDrafts() {
    if (!selectedNote) return;

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
    if (!selectedDeckId || cardDrafts.length === 0) return;

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
    setCardDrafts((current) => current.map((item) => (item.id === draftId ? { ...item, [field]: value } : item)));
  }

  const editorTitle = selectedNote ? displayNoteTitle(selectedNote) : "新建笔记";

  return (
    <section
      className={[
        "notes-studio",
        notesOpen ? "notes-studio--list-open" : "",
        inspectorOpen ? "notes-studio--inspector-open" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="studio-commandbar notes-commandbar">
        <div className="studio-commandbar__leading">
          <button
            aria-expanded={notesOpen}
            aria-label={notesOpen ? "关闭笔记列表" : "打开笔记列表"}
            className="icon-button"
            onClick={() => setNotesOpen((current) => !current)}
            type="button"
          >
            {notesOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
          </button>
          <div className="studio-commandbar__title">
            <span>笔记工作台</span>
            <strong title={editorTitle}>{editorTitle}</strong>
          </div>
          {selectedNote ? <span className="studio-commandbar__version">v{selectedNote.versionNumber}</span> : <span className="studio-commandbar__version">草稿</span>}
        </div>
        <div className="studio-commandbar__actions">
          <button className="secondary-button" onClick={handleStartNewNote} type="button">
            <Plus size={16} />
            <span>新建</span>
          </button>
          {selectedNote ? (
            <button className="primary-button" disabled={busy === "update"} onClick={() => void handleUpdate()} type="button">
              保存版本
            </button>
          ) : (
            <button className="primary-button" disabled={busy === "create"} onClick={() => void handleCreate()} type="button">
              创建笔记
            </button>
          )}
          <button
            aria-expanded={inspectorOpen}
            aria-label={inspectorOpen ? "关闭笔记检查器" : "打开笔记检查器"}
            className="icon-button"
            onClick={() => setInspectorOpen((current) => !current)}
            type="button"
          >
            {inspectorOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
          </button>
        </div>
      </header>

      {message ? <p className="studio-inline-message" role="status">{message}</p> : null}

      <div className="notes-studio__body">
        <aside className="studio-resource-dock notes-resource-dock" aria-label="笔记列表">
          <header className="studio-dock-heading">
            <div>
              <p className="eyebrow">笔记库</p>
              <h2>最近编辑</h2>
              <span>{notes.length} 条笔记</span>
            </div>
            <button aria-label="关闭笔记列表" className="icon-button" onClick={() => setNotesOpen(false)} type="button">
              <PanelLeftClose size={16} />
            </button>
          </header>
          <button className="notes-create-rail-action" onClick={handleStartNewNote} type="button">
            <Plus size={16} /> 新建空白笔记
          </button>
          <div className="notes-list">
            {loading ? (
              <DataState description="正在读取你的笔记、资料和复习卡组。" kind="loading" title="加载笔记中" />
            ) : loadError ? (
              <DataState
                action={<button className="secondary-button" onClick={() => void loadAll()} type="button">重新加载</button>}
                description={loadError}
                kind="error"
                title="笔记暂时不可用"
              />
            ) : notes.length ? (
              notes.map((note) => {
                const selected = selectedNote?.id === note.id;
                return (
                  <button
                    aria-current={selected ? "page" : undefined}
                    className={selected ? "notes-list-item active" : "notes-list-item"}
                    key={note.id}
                    onClick={() => handleSelectNote(note.id)}
                    type="button"
                  >
                    <strong>{displayNoteTitle(note)}</strong>
                    <p>{displayNoteSummary(note)}</p>
                    <span>v{note.versionNumber} · {formatDate(note.updatedAt)}</span>
                  </button>
                );
              })
            ) : (
              <DataState description="新建第一条笔记，把阅读与想法沉淀成可继续组织的内容。" kind="empty" title="还没有笔记" />
            )}
          </div>
        </aside>

        <main className="notes-editor-shell" aria-label="笔记编辑器">
          <section className="notes-editor-card">
            <div className="notes-editor-card__head">
              <div>
                <span>{selectedNote ? "正在编辑" : "新建草稿"}</span>
                <strong>{editorTitle}</strong>
              </div>
              {relatedMaterial ? <span className="notes-material-pill">来源：{displayMaterialTitle(relatedMaterial)}</span> : null}
            </div>

            <div className="notes-editor-fields">
              <label className="notes-editor-title-field">
                <span>标题</span>
                <input aria-label="笔记标题" onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="为这条笔记起一个标题" value={draft.title} />
              </label>
              <label>
                <span>资料来源</span>
                <Select aria-label="资料来源" onChange={(event) => setDraft((current) => ({ ...current, materialId: event.target.value }))} value={draft.materialId}>
                  <option value="">暂不关联资料</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>{displayMaterialTitle(material)}</option>
                  ))}
                </Select>
              </label>
              <label>
                <span>文件夹</span>
                <input aria-label="文件夹" onChange={(event) => setDraft((current) => ({ ...current, folderName: event.target.value }))} value={draft.folderName} />
              </label>
              <label>
                <span>标签</span>
                <input
                  aria-label="标签"
                  onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))}
                  placeholder="用逗号分隔"
                  value={draft.tags.join(", ")}
                />
              </label>
              <label className="notes-editor-summary-field">
                <span>摘要</span>
                <input aria-label="摘要" onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))} placeholder="用一句话说明这条笔记的核心内容" value={draft.summary} />
              </label>
            </div>

            <RichTextEditor
              onChange={(value) => setDraft((current) => ({ ...current, content: value }))}
              placeholder="开始写下你的阅读理解、问题和待整理线索..."
              value={draft.content}
            />

            <footer className="notes-editor-card__footer">
              <span>{selectedNote ? `最近更新：${formatDate(selectedNote.updatedAt)}` : "草稿尚未保存"}</span>
              <div className="detail-actions">
                {selectedNote ? (
                  <button className="secondary-button danger" disabled={busy === "delete"} onClick={() => void handleDelete()} type="button">删除</button>
                ) : null}
                {selectedNote ? (
                  <button className="primary-button" disabled={busy === "update"} onClick={() => void handleUpdate()} type="button">保存当前版本</button>
                ) : (
                  <button className="primary-button" disabled={busy === "create"} onClick={() => void handleCreate()} type="button">创建笔记</button>
                )}
              </div>
            </footer>
          </section>
        </main>

        <aside className="studio-inspector notes-inspector" aria-label="笔记检查器">
          <header className="studio-dock-heading">
            <div>
              <p className="eyebrow">笔记检查器</p>
              <h2>{noteInspectorTabs.find((tab) => tab.id === activeInspectorTab)?.label}</h2>
              <span>保留来源、版本与复习草稿，不打断编辑节奏。</span>
            </div>
            <button aria-label="关闭笔记检查器" className="icon-button" onClick={() => setInspectorOpen(false)} type="button">
              <PanelRightClose size={16} />
            </button>
          </header>
          <nav className="studio-inspector-tabs" aria-label="笔记检查器分类">
            {noteInspectorTabs.map((tab) => (
              <button
                aria-current={activeInspectorTab === tab.id ? "page" : undefined}
                className={activeInspectorTab === tab.id ? "studio-inspector-tab active" : "studio-inspector-tab"}
                key={tab.id}
                onClick={() => setActiveInspectorTab(tab.id)}
                type="button"
              >
                {tab.label}
                {tab.id === "history" && versions.length ? <em>{versions.length}</em> : null}
                {tab.id === "review" && cardDrafts.length ? <em>{cardDrafts.length}</em> : null}
              </button>
            ))}
          </nav>

          <div className="studio-inspector__body notes-inspector__body">
            {activeInspectorTab === "source" ? (
              <div className="studio-panel-stack">
                {relatedMaterial ? (
                  <article className="notes-source-card">
                    <BookOpen size={19} />
                    <div>
                      <span>当前关联资料</span>
                      <strong>{displayMaterialTitle(relatedMaterial)}</strong>
                      <p>{displayMaterialDescription(relatedMaterial)}</p>
                      <small>{displayMaterialCategory(relatedMaterial)}</small>
                      <Link className="secondary-button" to={`/reader/${relatedMaterial.id}`}>回到阅读器</Link>
                    </div>
                  </article>
                ) : (
                  <DataState
                    description="在编辑器中选择一份资料，笔记就能回到原始阅读上下文。"
                    kind="empty"
                    title="暂未关联资料"
                  />
                )}
                {selectedNote ? (
                  <article className="notes-source-meta">
                    <span>笔记版本</span>
                    <strong>v{selectedNote.versionNumber}</strong>
                    <span>标签</span>
                    <p>{draft.tags.length ? draft.tags.join(" · ") : "尚未设置标签"}</p>
                  </article>
                ) : null}
              </div>
            ) : activeInspectorTab === "history" ? (
              <div className="studio-panel-stack">
                {selectedNote && versions.length ? (
                  <div className="notes-version-list">
                    {versions.map((version) => (
                      <article className="notes-version-item" key={version.id}>
                        <div>
                          <strong>v{version.versionNumber}</strong>
                          <span>{version.title || "未命名笔记"}</span>
                          <small>{formatDate(version.createdAt)}</small>
                        </div>
                        <button className="secondary-button" disabled={busy === `restore-${version.id}`} onClick={() => void handleRestore(version.id)} type="button">
                          <History size={15} /> 恢复
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <DataState
                    description={selectedNote ? "保存笔记后，历史版本会在这里保留。" : "先创建或选择一条笔记，才能查看版本历史。"}
                    kind="empty"
                    title="还没有历史记录"
                  />
                )}
              </div>
            ) : (
              <div className="studio-panel-stack">
                {!selectedNote ? (
                  <DataState description="先创建并保存笔记，才能生成可确认的复习和图谱草稿。" kind="empty" title="保存笔记后继续" />
                ) : cardDrafts.length ? (
                  <>
                    <section className="notes-review-actions">
                      <label className="form-stack">
                        <span>写入 Deck</span>
                        <Select aria-label="写入 Deck" onChange={(event) => setSelectedDeckId(event.target.value)} value={selectedDeckId}>
                          <option value="">请选择一个 deck</option>
                          {decks.map((deck) => <option key={deck.id} value={deck.id}>{deck.title}</option>)}
                        </Select>
                      </label>
                      <button className="primary-button" disabled={!selectedDeckId || busy === "note-commit"} onClick={() => void handleCommitCardDrafts()} type="button">写入复习系统</button>
                    </section>
                    <div className="studio-draft-list">
                      {cardDrafts.map((item) => (
                        <article className="studio-draft-card" key={item.id}>
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
                  </>
                ) : decks.length ? (
                  <DataState
                    action={
                      <div className="notes-review-empty-actions">
                        <button className="primary-button" disabled={busy === "note-drafts"} onClick={() => void handleGenerateCardDrafts()} type="button">生成复习草稿</button>
                        <button className="secondary-button" disabled={busy === "note-graph-drafts"} onClick={() => void handleGenerateGraphDrafts()} type="button">
                          <Sparkles size={16} /> 生成图谱变更
                        </button>
                      </div>
                    }
                    description="草稿会先留在这里供你确认，再写入复习系统或 AI 工作台。"
                    kind="empty"
                    title="还没有待确认草稿"
                  />
                ) : (
                  <DataState
                    action={<Link className="primary-button" to="/review"><Layers3 size={16} /> 创建卡组</Link>}
                    description="先建立一个 deck，再将笔记中的关键内容转成复习卡片。"
                    kind="empty"
                    title="Deck 尚未准备好"
                  />
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
