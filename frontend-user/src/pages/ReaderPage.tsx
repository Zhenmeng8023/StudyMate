import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { BookMarked, FileText, Highlighter, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Sparkles } from "lucide-react";
import type { AuthSession, CardDraftPayload, DeckPayload, MaterialPayload, ReaderStatePayload } from "../api/client";
import {
  createDeckCardNote,
  createReaderAnnotation,
  deleteReaderAnnotation,
  generateAnnotationCardDrafts,
  generateAnnotationGraphDrafts,
  getReaderState,
  listDecks,
  listMaterials,
} from "../api/client";
import { downloadLibraryMaterial, getLibraryMaterial, getMaterialAttachmentUrl, listLibraryMaterials } from "../api/library";
import { DataState, Select, Tag } from "../design-system/primitives";
import { CardNoteComposer, buildCardNoteFields, type CardNoteTemplateCode } from "../features/card-notes/CardNoteComposer";
import { CardNoteCreationResult, type CardNoteCreationResultData } from "../features/card-notes/CardNoteCreationResult";
import { commitCardNoteBatch } from "../features/card-notes/commitCardNoteBatch";
import { buildPrimarySourceLink, buildSourceBacklinkTarget } from "../features/sources/sourceLinks";
import { PdfReaderPane } from "../modules/reader/PdfReaderPane";
import { isPdfMaterial, type PdfTextSelection } from "../modules/reader/pdfSelection";
import { useReaderProgress } from "../modules/reader/useReaderProgress";
import { ReaderAnnotationList } from "../modules/reader/ReaderAnnotationList";
import {
  displayMaterialDescription,
  displayMaterialTitle,
  formatDate
} from "../app/appShared";

type ReaderInspectorTab = "annotations" | "bookmarks" | "drafts";
type ReaderCardTemplate = CardNoteTemplateCode;
type ReaderWorkspaceState =
  | {
      kind: "loading" | "error" | "stale";
      title: string;
      description: string;
    }
  | null;

const readerInspectorTabs: Array<{ id: ReaderInspectorTab; label: string }> = [
  { id: "annotations", label: "批注" },
  { id: "bookmarks", label: "书签" },
  { id: "drafts", label: "草稿" }
];

export function ReaderPage(props: { session: AuthSession }) {
  const params = useParams();
  const location = useLocation();
  const requestedPage = parseReaderPageQuery(location.search);
  const requestedAnnotation = new URLSearchParams(location.search).get("annotation") || "";
  const sessionRef = useRef(props.session);
  sessionRef.current = props.session;
  const [materials, setMaterials] = useState<MaterialPayload[]>([]);
  const [decks, setDecks] = useState<DeckPayload[]>([]);
  const [selectedId, setSelectedId] = useState(params.materialId ?? "");
  const [readerState, setReaderState] = useState<ReaderStatePayload | null>(null);
  const [selection, setSelection] = useState<PdfTextSelection | null>(null);
  const [annotationColor, setAnnotationColor] = useState("amber");
  const [focusedAnnotationId, setFocusedAnnotationId] = useState(requestedAnnotation);
  const [annotationComment, setAnnotationComment] = useState("");
  const [annotationDrafts, setAnnotationDrafts] = useState<CardDraftPayload[]>([]);
  const [creationResult, setCreationResult] = useState<CardNoteCreationResultData | null>(null);
  const [annotationTemplate, setAnnotationTemplate] = useState<ReaderCardTemplate>("basic");
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [materialsError, setMaterialsError] = useState("");
  const [loadingReaderState, setLoadingReaderState] = useState(false);
  const [readerStateError, setReaderStateError] = useState("");
  const [sourcesOpen, setSourcesOpen] = useState(!params.materialId);
  const [inspectorOpen, setInspectorOpen] = useState(() => window.innerWidth >= 640);
  const [activeInspectorTab, setActiveInspectorTab] = useState<ReaderInspectorTab>("annotations");

  useEffect(() => {
    let cancelled = false;
    setLoadingMaterials(true);
    setMaterialsError("");
    setMaterials([]);
    setReaderState(null);
    setSelection(null);
    setAnnotationComment("");
    setAnnotationDrafts([]);
    setCreationResult(null);

    void Promise.all([listLibraryMaterials(sessionRef.current), listMaterials(), listDecks(sessionRef.current).catch(() => {
      if (!cancelled) setMessage("卡组暂时不可用，仍可继续阅读和批注。");
      return [];
    })])
      .then(async ([personal, publicItems, deckItems]) => {
        const byId = new Map([...publicItems, ...personal].map((item) => [item.id, item]));
        if (cancelled) return;
        if (params.materialId && !byId.has(params.materialId)) {
          const direct = await getLibraryMaterial(sessionRef.current, params.materialId);
          byId.set(direct.id, direct);
        }
        if (cancelled) return;
        const readable = [...byId.values()].filter((item) => item.attachmentFileId);
        setMaterials(readable);
        setDecks(deckItems);
        setSelectedDeckId((current) => current || deckItems[0]?.id || "");
        setSelectedId((current) => params.materialId || current || readable[0]?.id || "");
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
  }, [params.materialId, props.session.user.id]);

  const selectedMaterial = useMemo(
    () => materials.find((material) => material.id === selectedId) ?? null,
    [materials, selectedId]
  );
  const activeMaterialId = useRef("");
  activeMaterialId.current = selectedMaterial?.id || "";
  const progress = useReaderProgress(props.session, selectedMaterial?.id || "", readerState, setReaderState);
  const readerWorkspaceState: ReaderWorkspaceState = useMemo(() => {
    if (selectedMaterial && loadingReaderState && !readerState) {
      return {
        kind: "loading",
        title: "准备阅读上下文",
        description: "正在读取当前资料的页码、进度、书签和批注。"
      };
    }

    if (readerStateError && readerState) {
      return {
        kind: "stale",
        title: "阅读上下文需要刷新",
        description: readerStateError
      };
    }

    if (readerStateError) {
      return {
        kind: "error",
        title: "阅读内容暂时不可用",
        description: readerStateError
      };
    }

    return null;
  }, [loadingReaderState, readerState, readerStateError, selectedMaterial]);
  const showReaderContent = Boolean(selectedMaterial && readerState && (!readerWorkspaceState || readerWorkspaceState.kind === "stale"));

  async function refreshReaderState(material: MaterialPayload, options?: { preserveExisting?: boolean }) {
    if (activeMaterialId.current !== material.id) return false;
    setLoadingReaderState(true);
    setReaderStateError("");
    if (!options?.preserveExisting) {
      setReaderState(null);
    }

    try {
      const state = await getReaderState(props.session, material.id);
      if (activeMaterialId.current !== material.id) return false;
      setReaderState((current) => current?.materialId === state.materialId ? {
        ...state,
        currentPage: current.currentPage,
        totalPages: current.totalPages || state.totalPages,
        progressPercent: current.progressPercent,
        bookmarks: current.bookmarks
      } : state);
      return true;
    } catch (error) {
      if (activeMaterialId.current !== material.id) return false;
      setReaderStateError(error instanceof Error ? error.message : "读取阅读状态失败。");
      if (!options?.preserveExisting) {
        setReaderState(null);
      }
      return false;
    } finally {
      if (activeMaterialId.current === material.id) setLoadingReaderState(false);
    }
  }

  useEffect(() => {
    if (!selectedMaterial) {
      setReaderState(null);
      setAnnotationDrafts([]);
      setLoadingReaderState(false);
      setReaderStateError("");
      return;
    }

    let cancelled = false;
    setLoadingReaderState(true);
    setReaderStateError("");
    setReaderState(null);
    setSelection(null);
    setAnnotationComment("");
    setFocusedAnnotationId(requestedAnnotation);
    void getReaderState(sessionRef.current, selectedMaterial.id)
      .then((state) => {
        if (!cancelled) {
          const annotation = state.annotations.find((item) => item.id === requestedAnnotation);
          setReaderState(applyRequestedReaderPage(state, annotation?.page || requestedPage));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setReaderStateError(error instanceof Error ? error.message : "读取阅读状态失败。");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingReaderState(false);
        }
      });
    setAnnotationDrafts([]);

    return () => {
      cancelled = true;
    };
  }, [props.session.user.id, requestedPage, requestedAnnotation, selectedMaterial?.id]);

  function handleAddBookmark() {
    if (!selectedMaterial || !readerState) return;

    const bookmarks = Array.from(new Set([...readerState.bookmarks, readerState.currentPage])).sort((a, b) => a - b);
    progress.save({ bookmarks });
    setActiveInspectorTab("bookmarks");
    setInspectorOpen(true);
  }

  async function handleCreateAnnotation() {
    if (!selectedMaterial || !readerState || (!selection && !annotationComment)) return;

    setBusy("annotation");
    setMessage("");
    try {
      await createReaderAnnotation(props.session, selectedMaterial.id, {
        page: selection?.page || readerState.currentPage,
        quote: selection?.text || "",
        comment: annotationComment,
        color: annotationColor,
        rects: selection?.rects || []
      });
      setSelection(null);
      setAnnotationComment("");
      const refreshed = await refreshReaderState(selectedMaterial, { preserveExisting: true });
      setActiveInspectorTab("annotations");
      setInspectorOpen(true);
      setMessage(refreshed ? "批注已保存。" : "");
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
      await refreshReaderState(selectedMaterial);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除批注失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleGenerateAnnotationDrafts() {
    if (!selectedMaterial || !readerState?.annotations.length) return;

    setBusy("annotation-drafts");
    setCreationResult(null);
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
      const batch = await commitCardNoteBatch(annotationDrafts, (draft) => createDeckCardNote(props.session, selectedDeckId, buildCardNoteCreateInput(draft, annotationTemplate)));
      const createdCount = batch.createdCount;
      const writtenDraft = annotationDrafts.find((draft) => batch.succeededIds.includes(draft.id));
      if (createdCount) setCreationResult({ count: createdCount, cardId: batch.cardId, sourcePath: buildSourceBacklinkTarget(writtenDraft ? buildPrimarySourceLink(writtenDraft) : null) || `/reader/${encodeURIComponent(selectedId)}` });
      setDecks((current) =>
        current.map((deck) =>
          deck.id === selectedDeckId
            ? { ...deck, cardCount: deck.cardCount + createdCount, updatedAt: new Date().toISOString() }
            : deck
        )
      );
      setAnnotationDrafts((current) => current.filter((draft) => !batch.succeededIds.includes(draft.id)));
      setMessage(batch.error ? `${batch.error} 已保留 ${batch.failedIds.length} 条未写入草稿，重试只会提交这些草稿。` : `已把 ${createdCount} 张批注卡片写入 deck。`);
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

  async function handleDownload() {
    if (!selectedMaterial) return;
    setBusy("download");
    try { await downloadLibraryMaterial(props.session, selectedMaterial); }
    catch (error) { setMessage(error instanceof Error ? error.message : "下载原文件失败。"); }
    finally { setBusy(""); }
  }

  const fileUrl = selectedMaterial ? getMaterialAttachmentUrl(selectedMaterial.id) : "";
  const canUsePdf = isPdfMaterial(selectedMaterial);
  const readerTitle = selectedMaterial ? displayMaterialTitle(selectedMaterial) : "选择一份资料开始阅读";
  const activeReaderMaterial = showReaderContent ? selectedMaterial : null;
  const activeReaderState = showReaderContent ? readerState : null;

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
          <button aria-label="添加书签" className="secondary-button" disabled={!readerState || !canUsePdf} onClick={handleAddBookmark} type="button">
            <BookMarked size={16} />
            <span>书签</span>
          </button>
          {selectedMaterial ? <button className="secondary-button" disabled={busy === "download"} onClick={() => void handleDownload()} type="button">下载原文件</button> : null}
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
      {progress.error ? <div className="reader-progress-error" role="alert"><span>阅读进度尚未保存：{progress.error}</span><button className="secondary-button" onClick={progress.retry} type="button">重试保存进度</button></div> : null}
      <CardNoteCreationResult result={creationResult} />

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
          {readerWorkspaceState && readerWorkspaceState.kind !== "stale" ? (
            <DataState
              action={selectedMaterial && readerWorkspaceState.kind === "error" ? <button className="secondary-button" onClick={() => void refreshReaderState(selectedMaterial)} type="button">重新加载阅读状态</button> : undefined}
              description={readerWorkspaceState.description}
              kind={readerWorkspaceState.kind}
              title={readerWorkspaceState.title}
            />
          ) : null}
          {readerWorkspaceState?.kind === "stale" ? (
            <DataState
              action={selectedMaterial ? <button className="secondary-button" onClick={() => void refreshReaderState(selectedMaterial, { preserveExisting: true })} type="button">刷新阅读状态</button> : undefined}
              description={readerWorkspaceState.description}
              kind={readerWorkspaceState.kind}
              title={readerWorkspaceState.title}
            />
          ) : null}
          {activeReaderMaterial && activeReaderState ? (
            <div className="reader-stage-card">
              <div className="reader-stage-card__meta">
                <div>
                  <span>{activeReaderMaterial.attachmentName || "学习资料"}</span>
                  <strong>{displayMaterialTitle(activeReaderMaterial)}</strong>
                  <small className="reader-download-note">批注单独保存，下载的是原文件。</small>
                </div>
                <div className="reader-stage-card__chips">
                  <Tag>共 {activeReaderState.totalPages || "待识别"} 页</Tag>
                  <Tag tone="muted">上次阅读 {formatDate(activeReaderState.lastReadAt)}</Tag>
                </div>
              </div>
              <div className="reader-stage reader-stage--studio">
                {canUsePdf ? (
                  <PdfReaderPane
                    key={activeReaderMaterial.id}
                    fileUrl={fileUrl}
                    accessToken={props.session.accessToken}
                    onNavigationOpen={() => { setSourcesOpen(false); setInspectorOpen(false); }}
                    onAuthorizationExpired={async () => { await getLibraryMaterial(sessionRef.current, activeReaderMaterial.id); }}
                    annotations={activeReaderState.annotations}
                    focusedAnnotationId={focusedAnnotationId}
                    initialPage={activeReaderState.currentPage}
                    onPageChange={(page) => { setSelection(null); progress.save({ currentPage: page }); }}
                    onSelectionChange={setSelection}
                    onTotalPagesChange={(pages) => progress.save({ totalPages: pages, currentPage: Math.min(activeReaderState.currentPage, pages) })}
                  />
                ) : (
                  <DataState kind="empty" title="此文件暂不支持在线预览" description="这是历史非 PDF 附件，可下载原文件查看。新上传仅接受 PDF。" />
                )}
              </div>
            </div>
          ) : !selectedMaterial && !readerWorkspaceState ? (
            <DataState
              action={<button className="primary-button" onClick={() => setSourcesOpen(true)} type="button">打开资料面板</button>}
              description="从资料面板选择一份带附件的学习资料；PDF 会在当前工作区中打开。"
              kind="empty"
              title="选择一份资料开始阅读"
            />
          ) : null}
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
            {!selectedMaterial ? (
              <DataState description="选择资料后，这里会显示阅读期间产生的上下文。" kind="empty" title="等待阅读资料" />
            ) : readerWorkspaceState && readerWorkspaceState.kind !== "stale" ? (
              <DataState
                description={readerWorkspaceState.description}
                kind={readerWorkspaceState.kind}
                title={readerWorkspaceState.title}
              />
            ) : readerState ? activeInspectorTab === "annotations" ? (
              <div className="studio-panel-stack">
                <section className="reader-annotation-composer">
                  <div className="reader-selection-preview">
                    <Highlighter size={16} />
                    <div>
                      <strong>当前选中文本</strong>
                      <p>{selection?.text || "在 PDF 内选中一段文字，或者直接写一条批注。"}</p>
                    </div>
                  </div>
                  <label className="form-stack">
                    <span>批注内容</span>
                    <input aria-label="批注内容" onChange={(event) => setAnnotationComment(event.target.value)} value={annotationComment} />
                  </label>
                  <label className="form-stack"><span>高亮颜色</span><select aria-label="高亮颜色" value={annotationColor} onChange={(event) => setAnnotationColor(event.target.value)}><option value="amber">黄色</option><option value="green">绿色</option><option value="blue">蓝色</option><option value="pink">粉色</option></select></label>
                  <div className="detail-actions">
                    <button className="primary-button" disabled={!canUsePdf || busy === "annotation" || (!selection && !annotationComment.trim())} onClick={() => void handleCreateAnnotation()} type="button">
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

                <ReaderAnnotationList material={selectedMaterial} annotations={readerState.annotations} focusedId={focusedAnnotationId} busy={busy}
                  onDelete={(id) => void handleDeleteAnnotation(id)} onLocate={(annotation) => { setFocusedAnnotationId(annotation.id); setSelection(null); progress.save({ currentPage: annotation.page }); }} />
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
                      <span className="reader-bookmark-actions" key={bookmark}><button className="bookmark-chip chip" onClick={() => progress.save({ currentPage: bookmark })} type="button">第 {bookmark} 页</button><button className="ghost-button" aria-label={`移除第 ${bookmark} 页书签`} onClick={() => progress.save({ bookmarks: readerState.bookmarks.filter((page) => page !== bookmark) })} type="button">移除</button></span>
                    ))}
                  </div>
                ) : (
                  <DataState
                    action={<button className="primary-button" disabled={!canUsePdf} onClick={handleAddBookmark} type="button">为当前页添加书签</button>}
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
                    <CardNoteComposer
                      allowedTemplates={["basic", "basic_reverse", "cloze"]}
                      busy={busy === "annotation-commit"}
                      decks={decks}
                      drafts={annotationDrafts.map((item) => ({
                        id: item.id,
                        title: item.sourceLabel || "批注草稿",
                        excerpt: item.explanation,
                        locatorLabel: item.sourceType && item.sourceId ? `${item.sourceType} / ${item.sourceId}` : undefined,
                        front: item.front,
                        back: item.back,
                        explanation: item.explanation
                      }))}
                      onDeckChange={setSelectedDeckId}
                      onDraftFieldChange={handleAnnotationDraftChange}
                      onSubmit={() => void handleCommitAnnotationDrafts()}
                      onTemplateChange={(template) => setAnnotationTemplate(template)}
                      selectedDeckId={selectedDeckId}
                      template={annotationTemplate}
                    />
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
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}

function buildCardNoteCreateInput(draft: CardDraftPayload, noteTypeCode: ReaderCardTemplate) {
  const sourceLink = buildPrimarySourceLink({
    sourceType: draft.sourceType,
    sourceId: draft.sourceId,
    sourceMetadata: draft.sourceMetadata
  });
  const sourceLinks = sourceLink ? [sourceLink] : [];
  return {
    noteTypeCode,
    sourceLinks,
    fields: buildCardNoteFields(draft, noteTypeCode)
  };
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
