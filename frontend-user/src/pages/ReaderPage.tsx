import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { BookMarked, FileText, Highlighter, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Sparkles } from "lucide-react";
import type { AuthSession, CardDraftPayload, DeckPayload, MaterialPayload, ReaderStatePayload } from "../api/client";
import {
  bulkCreateDeckCards,
  createReaderAnnotation,
  deleteReaderAnnotation,
  generateAnnotationCardDrafts,
  generateAnnotationGraphDrafts,
  getReaderState,
  listDecks,
  listMaterials,
  updateReaderProgress
} from "../api/client";
import { DataState } from "../design-system/primitives";
import { PdfReaderPane } from "../modules/reader/PdfReaderPane";
import {
  buildCardInputsFromDrafts,
  displayAnnotationText,
  displayMaterialDescription,
  displayMaterialTitle,
  formatDate
} from "../app/appShared";

type ReaderInspectorTab = "annotations" | "bookmarks" | "drafts";

const readerInspectorTabs: Array<{ id: ReaderInspectorTab; label: string }> = [
  { id: "annotations", label: "批注" },
  { id: "bookmarks", label: "书签" },
  { id: "drafts", label: "草稿" }
];

export function ReaderPage(props: { session: AuthSession }) {
  const params = useParams();
  const location = useLocation();
  const requestedPage = parseReaderPageQuery(location.search);
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [decks, setDecks] = useState<DeckPayload[]>([]);
  const [selectedId, setSelectedId] = useState(params.materialId ?? "");
  const [readerState, setReaderState] = useState<ReaderStatePayload | null>(null);
  const [selection, setSelection] = useState("");
  const [annotationComment, setAnnotationComment] = useState("");
  const [annotationDrafts, setAnnotationDrafts] = useState<CardDraftPayload[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [materialsError, setMaterialsError] = useState("");
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [activeInspectorTab, setActiveInspectorTab] = useState<ReaderInspectorTab>("annotations");

  useEffect(() => {
    let cancelled = false;
    setLoadingMaterials(true);
    setMaterialsError("");

    void Promise.all([listMaterials(), listDecks(props.session)])
      .then(([items, deckItems]) => {
        if (cancelled) return;
        const readable = items.filter((item) => item.attachmentFileId);
        setMaterials(readable);
        setDecks(deckItems);
        setSelectedDeckId((current) => current || deckItems[0]?.id || "");
        setSelectedId((current) => current || params.materialId || readable[0]?.id || "");
      })
      .catch((error) => {
        if (cancelled) return;
        setMaterials([]);
        setDecks([]);
        setMaterialsError(error instanceof Error ? error.message : "读取可阅读资料失败。");
      })
      .finally(() => {
        if (!cancelled) setLoadingMaterials(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.materialId, props.session]);

  const selectedMaterial = useMemo(
    () => materials.find((material) => material.id === selectedId) ?? null,
    [materials, selectedId]
  );

  useEffect(() => {
    if (!selectedMaterial) {
      setReaderState(null);
      setAnnotationDrafts([]);
      return;
    }

    let cancelled = false;
    void getReaderState(props.session, selectedMaterial.id)
      .then((state) => {
        if (!cancelled) setReaderState(applyRequestedReaderPage(state, requestedPage));
      })
      .catch(() => {
        if (!cancelled) {
          setReaderState(
            applyRequestedReaderPage(
              {
                materialId: selectedMaterial.id,
                currentPage: 1,
                totalPages: 0,
                progressPercent: 0,
                bookmarks: [],
                lastReadAt: selectedMaterial.updatedAt,
                annotations: []
              },
              requestedPage
            )
          );
        }
      });
    setAnnotationDrafts([]);

    return () => {
      cancelled = true;
    };
  }, [props.session, requestedPage, selectedMaterial]);

  async function persistProgress(nextPage: number, totalPages: number) {
    if (!selectedMaterial || !readerState) return;

    const progressPercent = totalPages
      ? Math.min(100, Math.round((nextPage / totalPages) * 100))
      : readerState.progressPercent;
    const payload = await updateReaderProgress(props.session, selectedMaterial.id, {
      currentPage: nextPage,
      totalPages,
      progressPercent,
      bookmarks: readerState.bookmarks
    });
    setReaderState(payload);
  }

  async function handleAddBookmark() {
    if (!selectedMaterial || !readerState) return;

    const bookmarks = Array.from(new Set([...readerState.bookmarks, readerState.currentPage])).sort((a, b) => a - b);
    const payload = await updateReaderProgress(props.session, selectedMaterial.id, {
      currentPage: readerState.currentPage,
      totalPages: readerState.totalPages,
      progressPercent: readerState.progressPercent,
      bookmarks
    });
    setReaderState(payload);
    setActiveInspectorTab("bookmarks");
    setInspectorOpen(true);
  }

  async function handleCreateAnnotation() {
    if (!selectedMaterial || !readerState || (!selection && !annotationComment)) return;

    setBusy("annotation");
    setMessage("");
    try {
      await createReaderAnnotation(props.session, selectedMaterial.id, {
        page: readerState.currentPage,
        quote: selection,
        comment: annotationComment,
        color: "amber",
        rects: [
          {
            page: readerState.currentPage,
            x: 0,
            y: 0,
            width: 1,
            height: 0.08
          }
        ]
      });
      setSelection("");
      setAnnotationComment("");
      setReaderState(await getReaderState(props.session, selectedMaterial.id));
      setActiveInspectorTab("annotations");
      setInspectorOpen(true);
      setMessage("批注已保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存批注失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleDeleteAnnotation(annotationId: string) {
    if (!selectedMaterial) return;

    setBusy(`annotation-${annotationId}`);
    try {
      await deleteReaderAnnotation(props.session, selectedMaterial.id, annotationId);
      setReaderState(await getReaderState(props.session, selectedMaterial.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除批注失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleGenerateAnnotationDrafts() {
    if (!selectedMaterial || !readerState?.annotations.length) return;

    setBusy("annotation-drafts");
    setMessage("");
    try {
      const payload = await generateAnnotationCardDrafts(
        props.session,
        selectedMaterial.id,
        readerState.annotations.map((annotation) => annotation.id)
      );
      setAnnotationDrafts(payload);
      setActiveInspectorTab("drafts");
      setInspectorOpen(true);
      setMessage(payload.length ? "已生成批注复习草稿。" : "当前批注还不足以生成复习草稿。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "生成批注草稿失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleGenerateAnnotationGraphDrafts() {
    if (!selectedMaterial || !readerState?.annotations.length) return;

    setBusy("annotation-graph-drafts");
    setMessage("");
    try {
      const payload = await generateAnnotationGraphDrafts(
        props.session,
        selectedMaterial.id,
        readerState.annotations.map((annotation) => annotation.id)
      );
      setMessage(payload.length ? "已生成阅读图谱变更草稿，去 AI 工作台确认。" : "当前批注暂时没有可生成的图谱变更草稿。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "生成阅读图谱草稿失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleCommitAnnotationDrafts() {
    if (!selectedDeckId || annotationDrafts.length === 0) return;

    setBusy("annotation-commit");
    setMessage("");
    try {
      const payload = await bulkCreateDeckCards(props.session, selectedDeckId, buildCardInputsFromDrafts(annotationDrafts));
      setDecks((current) =>
        current.map((deck) =>
          deck.id === selectedDeckId
            ? { ...deck, cardCount: deck.cardCount + payload.length, updatedAt: new Date().toISOString() }
            : deck
        )
      );
      setAnnotationDrafts([]);
      setMessage(`已把 ${payload.length} 张批注卡片写入 deck。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "写入复习卡片失败。");
    } finally {
      setBusy("");
    }
  }

  function handleAnnotationDraftChange(draftId: string, field: "front" | "back", value: string) {
    setAnnotationDrafts((current) => current.map((item) => (item.id === draftId ? { ...item, [field]: value } : item)));
  }

  function selectMaterial(materialId: string) {
    setSelectedId(materialId);
    setActiveInspectorTab("annotations");
    setInspectorOpen(true);
  }

  const fileUrl = selectedMaterial ? `/api/v1/materials/${selectedMaterial.id}/attachment` : "";
  const canUsePdf = selectedMaterial?.attachmentMime?.toLowerCase().includes("pdf") ?? false;
  const readerTitle = selectedMaterial ? displayMaterialTitle(selectedMaterial) : "选择一份资料开始阅读";

  return (
    <section
      className={[
        "reader-studio",
        sourcesOpen ? "reader-studio--sources-open" : "",
        inspectorOpen ? "reader-studio--inspector-open" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="studio-commandbar reader-commandbar">
        <div className="studio-commandbar__leading">
          <button
            aria-expanded={sourcesOpen}
            aria-label={sourcesOpen ? "关闭资料面板" : "打开资料面板"}
            className="icon-button"
            onClick={() => setSourcesOpen((current) => !current)}
            type="button"
          >
            {sourcesOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
          </button>
          <div className="studio-commandbar__title">
            <span>阅读工作台</span>
            <strong title={readerTitle}>{readerTitle}</strong>
          </div>
          {readerState ? (
            <div className="studio-commandbar__metrics" aria-label="阅读进度">
              <span>第 {readerState.currentPage} 页</span>
              <span>{readerState.progressPercent}%</span>
            </div>
          ) : null}
        </div>
        <div className="studio-commandbar__actions">
          <button aria-label="添加书签" className="secondary-button" disabled={!readerState} onClick={() => void handleAddBookmark()} type="button">
            <BookMarked size={16} />
            <span>书签</span>
          </button>
          {selectedMaterial ? (
            <Link className="primary-button" to={`/notes?material=${selectedMaterial.id}`}>
              <FileText size={16} />
              <span>写笔记</span>
            </Link>
          ) : null}
          <button
            aria-expanded={inspectorOpen}
            aria-label={inspectorOpen ? "关闭阅读检查器" : "打开阅读检查器"}
            className="icon-button"
            onClick={() => setInspectorOpen((current) => !current)}
            type="button"
          >
            {inspectorOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}
          </button>
        </div>
      </header>

      {message ? <p className="studio-inline-message" role="status">{message}</p> : null}

      <div className="reader-studio__body">
        <aside className="studio-resource-dock reader-resource-dock" aria-label="可阅读资料">
          <header className="studio-dock-heading">
            <div>
              <p className="eyebrow">资料库</p>
              <h2>继续阅读</h2>
              <span>{materials.length} 份可阅读资料</span>
            </div>
            <button aria-label="关闭资料面板" className="icon-button" onClick={() => setSourcesOpen(false)} type="button">
              <PanelLeftClose size={16} />
            </button>
          </header>
          <div className="reader-material-list">
            {loadingMaterials ? (
              <DataState description="正在读取带附件的学习资料。" kind="loading" title="加载资料中" />
            ) : materialsError ? (
              <DataState
                action={<button className="secondary-button" onClick={() => window.location.reload()} type="button">重新加载</button>}
                description={materialsError}
                kind="error"
                title="资料暂时不可用"
              />
            ) : materials.length ? (
              materials.map((material) => {
                const selected = selectedMaterial?.id === material.id;
                return (
                  <button
                    aria-current={selected ? "page" : undefined}
                    className={selected ? "reader-material-item active" : "reader-material-item"}
                    key={material.id}
                    onClick={() => selectMaterial(material.id)}
                    type="button"
                  >
                    <strong>{displayMaterialTitle(material)}</strong>
                    <p>{displayMaterialDescription(material)}</p>
                    <span>{material.attachmentName || "有附件"}</span>
                  </button>
                );
              })
            ) : (
              <DataState
                action={<Link className="primary-button" to="/materials">去资料库</Link>}
                description="上传或关联一份带附件的资料后，就能在这里继续阅读。"
                kind="empty"
                title="还没有可阅读资料"
              />
            )}
          </div>
        </aside>

        <main className="reader-stage-shell" aria-label="阅读内容">
          {selectedMaterial && readerState ? (
            <div className="reader-stage-card">
              <div className="reader-stage-card__meta">
                <div>
                  <span>{selectedMaterial.attachmentName || "学习资料"}</span>
                  <strong>{displayMaterialTitle(selectedMaterial)}</strong>
                </div>
                <div className="reader-stage-card__chips">
                  <span>共 {readerState.totalPages || "待识别"} 页</span>
                  <span>上次阅读 {formatDate(readerState.lastReadAt)}</span>
                </div>
              </div>
              <div className="reader-stage reader-stage--studio">
                {canUsePdf ? (
                  <PdfReaderPane
                    fileUrl={fileUrl}
                    initialPage={readerState.currentPage}
                    onPageChange={(page) => void persistProgress(page, readerState.totalPages || page).catch(() => undefined)}
                    onSelectionChange={setSelection}
                    onTotalPagesChange={(pages) => void persistProgress(readerState.currentPage, pages).catch(() => undefined)}
                  />
                ) : (
                  <iframe className="reader-embed" src={fileUrl} title={selectedMaterial.attachmentName} />
                )}
              </div>
            </div>
          ) : (
            <DataState
              action={<button className="primary-button" onClick={() => setSourcesOpen(true)} type="button">打开资料面板</button>}
              description="从资料面板选择一份带附件的学习资料；PDF 会在当前工作区中打开。"
              kind="empty"
              title="选择一份资料开始阅读"
            />
          )}
        </main>

        <aside className="studio-inspector reader-inspector" aria-label="阅读检查器">
          <header className="studio-dock-heading">
            <div>
              <p className="eyebrow">阅读检查器</p>
              <h2>{readerInspectorTabs.find((tab) => tab.id === activeInspectorTab)?.label}</h2>
              <span>把摘录、书签和复习草稿留在当前资料旁边。</span>
            </div>
            <button aria-label="关闭阅读检查器" className="icon-button" onClick={() => setInspectorOpen(false)} type="button">
              <PanelRightClose size={16} />
            </button>
          </header>

          <nav className="studio-inspector-tabs" aria-label="阅读检查器分类">
            {readerInspectorTabs.map((tab) => (
              <button
                aria-current={activeInspectorTab === tab.id ? "page" : undefined}
                className={activeInspectorTab === tab.id ? "studio-inspector-tab active" : "studio-inspector-tab"}
                key={tab.id}
                onClick={() => setActiveInspectorTab(tab.id)}
                type="button"
              >
                {tab.label}
                {tab.id === "annotations" && readerState?.annotations.length ? <em>{readerState.annotations.length}</em> : null}
                {tab.id === "drafts" && annotationDrafts.length ? <em>{annotationDrafts.length}</em> : null}
              </button>
            ))}
          </nav>

          <div className="studio-inspector__body reader-inspector__body">
            {!selectedMaterial || !readerState ? (
              <DataState description="选择资料后，这里会显示阅读期间产生的上下文。" kind="empty" title="等待阅读资料" />
            ) : activeInspectorTab === "annotations" ? (
              <div className="studio-panel-stack">
                <section className="reader-annotation-composer">
                  <div className="reader-selection-preview">
                    <Highlighter size={16} />
                    <div>
                      <strong>当前选中文本</strong>
                      <p>{selection || "在 PDF 内选中一段文字，或者直接写一条批注。"}</p>
                    </div>
                  </div>
                  <label className="form-stack">
                    <span>批注内容</span>
                    <input aria-label="批注内容" onChange={(event) => setAnnotationComment(event.target.value)} value={annotationComment} />
                  </label>
                  <div className="detail-actions">
                    <button className="primary-button" disabled={busy === "annotation"} onClick={() => void handleCreateAnnotation()} type="button">
                      保存批注
                    </button>
                    <button
                      className="secondary-button"
                      disabled={!readerState.annotations.length || busy === "annotation-drafts"}
                      onClick={() => void handleGenerateAnnotationDrafts()}
                      type="button"
                    >
                      生成复习草稿
                    </button>
                    <button
                      className="secondary-button"
                      disabled={!readerState.annotations.length || busy === "annotation-graph-drafts"}
                      onClick={() => void handleGenerateAnnotationGraphDrafts()}
                      type="button"
                    >
                      <Sparkles size={16} />
                      生成图谱变更
                    </button>
                  </div>
                </section>

                {readerState.annotations.length ? (
                  <div className="reader-annotation-list">
                    {readerState.annotations.map((annotation) => (
                      <article className="reader-annotation-item" key={annotation.id}>
                        <div className="reader-annotation-item__head">
                          <strong>第 {annotation.page} 页</strong>
                          <span>{annotation.rects.length ? `${annotation.rects.length} 个坐标片段` : "无坐标片段"}</span>
                        </div>
                        <p>{displayAnnotationText(annotation)}</p>
                        <small>来源：{displayMaterialTitle(selectedMaterial)} / PDF 第 {annotation.page} 页</small>
                        <button
                          className="secondary-button danger"
                          disabled={busy === `annotation-${annotation.id}`}
                          onClick={() => void handleDeleteAnnotation(annotation.id)}
                          type="button"
                        >
                          删除批注
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <DataState description="选中文本或记录想法后，批注会按页码与来源坐标保留在这里。" kind="empty" title="还没有批注" />
                )}
              </div>
            ) : activeInspectorTab === "bookmarks" ? (
              <div className="studio-panel-stack">
                <section className="reader-inspector-summary">
                  <BookMarked size={18} />
                  <div>
                    <strong>当前进度</strong>
                    <p>第 {readerState.currentPage} / {readerState.totalPages || "待识别"} 页，已完成 {readerState.progressPercent}%</p>
                  </div>
                </section>
                {readerState.bookmarks.length ? (
                  <div className="reader-bookmark-list">
                    {readerState.bookmarks.map((bookmark) => (
                      <span className="bookmark-chip chip" key={bookmark}>第 {bookmark} 页</span>
                    ))}
                  </div>
                ) : (
                  <DataState
                    action={<button className="primary-button" onClick={() => void handleAddBookmark()} type="button">为当前页添加书签</button>}
                    description="书签会与当前阅读进度同步保存，方便从关键页继续。"
                    kind="empty"
                    title="还没有书签"
                  />
                )}
              </div>
            ) : (
              <div className="studio-panel-stack">
                {annotationDrafts.length ? (
                  <>
                    <section className="reader-draft-actions">
                      <label className="form-stack">
                        <span>写入 Deck</span>
                        <select aria-label="写入 Deck" onChange={(event) => setSelectedDeckId(event.target.value)} value={selectedDeckId}>
                          <option value="">请选择一个 deck</option>
                          {decks.map((deck) => (
                            <option key={deck.id} value={deck.id}>{deck.title}</option>
                          ))}
                        </select>
                      </label>
                      <button className="primary-button" disabled={!selectedDeckId || busy === "annotation-commit"} onClick={() => void handleCommitAnnotationDrafts()} type="button">
                        写入复习系统
                      </button>
                    </section>
                    <div className="studio-draft-list">
                      {annotationDrafts.map((item) => (
                        <article className="studio-draft-card" key={item.id}>
                          <strong>{item.sourceLabel || "批注草稿"}</strong>
                          <label>
                            <span>问题</span>
                            <input onChange={(event) => handleAnnotationDraftChange(item.id, "front", event.target.value)} value={item.front} />
                          </label>
                          <label>
                            <span>答案</span>
                            <textarea onChange={(event) => handleAnnotationDraftChange(item.id, "back", event.target.value)} rows={4} value={item.back} />
                          </label>
                          {item.explanation ? <small>{item.explanation}</small> : null}
                        </article>
                      ))}
                    </div>
                  </>
                ) : decks.length ? (
                  <DataState
                    action={<button className="primary-button" disabled={!readerState.annotations.length || busy === "annotation-drafts"} onClick={() => void handleGenerateAnnotationDrafts()} type="button">生成复习草稿</button>}
                    description="批注草稿会先在这里等待你调整，再写入选定的 deck。"
                    kind="empty"
                    title="还没有待确认草稿"
                  />
                ) : (
                  <DataState
                    action={<Link className="primary-button" to="/review">创建卡组</Link>}
                    description="先创建一个 deck，批注草稿就能直接进入复习队列。"
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

function parseReaderPageQuery(search: string) {
  const value = Number(new URLSearchParams(search).get("page"));
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

function applyRequestedReaderPage(state: ReaderStatePayload, requestedPage: number): ReaderStatePayload {
  if (!requestedPage) return state;
  const nextPage = state.totalPages ? Math.min(Math.max(requestedPage, 1), state.totalPages) : requestedPage;
  return {
    ...state,
    currentPage: nextPage,
    progressPercent: state.totalPages ? Math.min(100, Math.round((nextPage / state.totalPages) * 100)) : state.progressPercent
  };
}
