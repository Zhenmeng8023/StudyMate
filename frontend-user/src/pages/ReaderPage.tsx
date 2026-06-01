import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { AuthSession, CardDraftPayload, DeckPayload, MaterialPayload, ReaderStatePayload } from "../api/client";
import { bulkCreateDeckCards, createReaderAnnotation, deleteReaderAnnotation, generateAnnotationCardDrafts, generateAnnotationGraphDrafts, getReaderState, listDecks, listMaterials, updateReaderProgress } from "../api/client";
import { PdfReaderPane } from "../modules/reader/PdfReaderPane";
import { buildCardInputsFromDrafts, displayAnnotationText, displayMaterialDescription, displayMaterialTitle, formatDate, SectionFrame, WorkspaceHeader } from "../app/appShared";

export function ReaderPage(props: { session: AuthSession }) {
  const params = useParams();
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

  useEffect(() => {
    void Promise.all([listMaterials(), listDecks(props.session)])
      .then(([items, deckItems]) => {
        const readable = items.filter((item) => item.attachmentFileId);
        setMaterials(readable);
        setDecks(deckItems);
        setSelectedDeckId((current) => current || deckItems[0]?.id || "");
        setSelectedId((current) => current || params.materialId || readable[0]?.id || "");
      })
      .catch(() => {
        setMaterials([]);
        setDecks([]);
      });
  }, [params.materialId, props.session]);

  const selectedMaterial = materials.find((material) => material.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedMaterial) {
      setReaderState(null);
      setAnnotationDrafts([]);
      return;
    }

    void getReaderState(props.session, selectedMaterial.id).then(setReaderState).catch(() => {
      setReaderState({
        materialId: selectedMaterial.id,
        currentPage: 1,
        totalPages: 0,
        progressPercent: 0,
        bookmarks: [],
        lastReadAt: selectedMaterial.updatedAt,
        annotations: []
      });
    });
    setAnnotationDrafts([]);
  }, [props.session, selectedMaterial]);

  async function persistProgress(nextPage: number, totalPages: number) {
    if (!selectedMaterial || !readerState) {
      return;
    }

    const progressPercent = totalPages ? Math.min(100, Math.round((nextPage / totalPages) * 100)) : readerState.progressPercent;
    const payload = await updateReaderProgress(props.session, selectedMaterial.id, {
      currentPage: nextPage,
      totalPages,
      progressPercent,
      bookmarks: readerState.bookmarks
    });
    setReaderState(payload);
  }

  async function handleAddBookmark() {
    if (!selectedMaterial || !readerState) {
      return;
    }

    const bookmarks = Array.from(new Set([...readerState.bookmarks, readerState.currentPage])).sort((a, b) => a - b);
    const payload = await updateReaderProgress(props.session, selectedMaterial.id, {
      currentPage: readerState.currentPage,
      totalPages: readerState.totalPages,
      progressPercent: readerState.progressPercent,
      bookmarks
    });
    setReaderState(payload);
  }

  async function handleCreateAnnotation() {
    if (!selectedMaterial || !readerState || (!selection && !annotationComment)) {
      return;
    }

    setBusy("annotation");
    setMessage("");
    try {
      await createReaderAnnotation(props.session, selectedMaterial.id, {
        page: readerState.currentPage,
        quote: selection,
        comment: annotationComment,
        color: "amber"
      });
      setSelection("");
      setAnnotationComment("");
      const payload = await getReaderState(props.session, selectedMaterial.id);
      setReaderState(payload);
      setMessage("批注已保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存批注失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleDeleteAnnotation(annotationId: string) {
    if (!selectedMaterial) {
      return;
    }

    setBusy(`annotation-${annotationId}`);
    try {
      await deleteReaderAnnotation(props.session, selectedMaterial.id, annotationId);
      const payload = await getReaderState(props.session, selectedMaterial.id);
      setReaderState(payload);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除批注失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleGenerateAnnotationDrafts() {
    if (!selectedMaterial || !readerState?.annotations.length) {
      return;
    }

    setBusy("annotation-drafts");
    setMessage("");
    try {
      const payload = await generateAnnotationCardDrafts(
        props.session,
        selectedMaterial.id,
        readerState.annotations.map((annotation) => annotation.id)
      );
      setAnnotationDrafts(payload);
      setMessage(payload.length ? "已生成批注复习草稿。" : "当前批注还不足以生成复习草稿。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "生成批注草稿失败。");
    } finally {
      setBusy("");
    }
  }

  async function handleGenerateAnnotationGraphDrafts() {
    if (!selectedMaterial || !readerState?.annotations.length) {
      return;
    }

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
    if (!selectedDeckId || annotationDrafts.length === 0) {
      return;
    }

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
    setAnnotationDrafts((current) =>
      current.map((item) => (item.id === draftId ? { ...item, [field]: value } : item))
    );
  }

  const fileUrl = selectedMaterial ? `/api/v1/materials/${selectedMaterial.id}/attachment` : "";
  const canUsePdf = selectedMaterial?.attachmentMime?.toLowerCase().includes("pdf") ?? false;

  return (
    <>
      <WorkspaceHeader
        actions={
          <div className="header-actions">
            <button className="secondary-button" onClick={() => void handleAddBookmark()} type="button">
              添加书签
            </button>
            {selectedMaterial ? (
              <Link className="primary-button" to={`/notes?material=${selectedMaterial.id}`}>
                去写笔记
              </Link>
            ) : null}
          </div>
        }
        description="阅读器现在接回了真实的阅读状态、页码进度、书签和批注。PDF 用专门的阅读组件，其他附件先用内嵌预览承接。"
        eyebrow="阅读器"
        title="把阅读进度、批注和笔记入口收进同一屏里"
      />

      <div className="reader-workspace">
        <SectionFrame slim subtitle="可读资料" title="选择一份材料">
          <div className="list-stack">
            {materials.map((material) => (
              <button
                className={selectedMaterial?.id === material.id ? "list-row active" : "list-row"}
                key={material.id}
                onClick={() => setSelectedId(material.id)}
                type="button"
              >
                <div>
                  <strong>{displayMaterialTitle(material)}</strong>
                  <p>{displayMaterialDescription(material)}</p>
                </div>
                <span>{material.attachmentName || "有附件"}</span>
              </button>
            ))}
          </div>
        </SectionFrame>

        <SectionFrame subtitle="阅读区" title={selectedMaterial ? displayMaterialTitle(selectedMaterial) : "还没有可阅读资料"}>
          {selectedMaterial && readerState ? (
            <div className="page-stack">
              <div className="reader-stage-toolbar">
                <div className="chip-row">
                  <span className="chip">当前页 {readerState.currentPage}</span>
                  <span className="chip">总页数 {readerState.totalPages || "待识别"}</span>
                  <span className="chip">进度 {readerState.progressPercent}%</span>
                </div>
              </div>
              <div className="reader-stage">
                {canUsePdf ? (
                  <PdfReaderPane
                    fileUrl={fileUrl}
                    initialPage={readerState.currentPage}
                    onPageChange={(page) =>
                      void persistProgress(page, readerState.totalPages || page).catch(() => undefined)
                    }
                    onSelectionChange={setSelection}
                    onTotalPagesChange={(pages) =>
                      void persistProgress(readerState.currentPage, pages).catch(() => undefined)
                    }
                  />
                ) : (
                  <iframe className="reader-embed" src={fileUrl} title={selectedMaterial.attachmentName} />
                )}
              </div>
            </div>
          ) : (
            <article className="placeholder-card">
              <strong>先从左侧选择一份带附件的资料</strong>
              <p>如果资料是 PDF，会进入真正的 PDF 阅读视图；其他文件先走嵌入式预览。</p>
            </article>
          )}
        </SectionFrame>

        <SectionFrame slim subtitle="摘录与批注" title="右侧工作区">
          {readerState ? (
            <div className="page-stack">
              <article className="profile-summary">
                <strong>当前选中文本</strong>
                <span>{selection || "在 PDF 内选中一段文字，或者直接写一条批注。"}</span>
              </article>
              <label className="form-stack">
                <span>批注内容</span>
                <input onChange={(event) => setAnnotationComment(event.target.value)} value={annotationComment} />
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
                  生成图谱变更
                </button>
              </div>
              <div className="bookmark-stack">
                {readerState.bookmarks.map((bookmark) => (
                  <span className="bookmark-chip chip" key={bookmark}>
                    第 {bookmark} 页
                  </span>
                ))}
              </div>
              <div className="list-stack dense">
                {readerState.annotations.map((annotation) => (
                  <article className="annotation-story" key={annotation.id}>
                    <strong>第 {annotation.page} 页</strong>
                    <p>{displayAnnotationText(annotation)}</p>
                    <button
                      className="secondary-button"
                      disabled={busy === `annotation-${annotation.id}`}
                      onClick={() => void handleDeleteAnnotation(annotation.id)}
                      type="button"
                    >
                      删除批注
                    </button>
                  </article>
                ))}
              </div>
              {annotationDrafts.length ? (
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
                      disabled={!selectedDeckId || busy === "annotation-commit"}
                      onClick={() => void handleCommitAnnotationDrafts()}
                      type="button"
                    >
                      写入复习系统
                    </button>
                  </div>

                  <div className="graph-card-draft-list">
                    {annotationDrafts.map((item) => (
                      <article className="graph-card-draft" key={item.id}>
                        <strong>{item.sourceLabel || "批注草稿"}</strong>
                        <label>
                          <span>问题</span>
                          <input
                            onChange={(event) => handleAnnotationDraftChange(item.id, "front", event.target.value)}
                            value={item.front}
                          />
                        </label>
                        <label>
                          <span>答案</span>
                          <textarea
                            onChange={(event) => handleAnnotationDraftChange(item.id, "back", event.target.value)}
                            rows={4}
                            value={item.back}
                          />
                        </label>
                        {item.explanation ? <small>{item.explanation}</small> : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : decks.length ? (
                <article className="graph-meta-card muted">
                  <strong>批注草稿待生成</strong>
                  <p>先积累几条有信息量的批注，再生成并确认写入 deck，复习系统就会接住这部分阅读成果。</p>
                </article>
              ) : (
                <article className="graph-meta-card muted">
                  <strong>Deck 尚未准备好</strong>
                  <p>先去复习页创建一个 deck，这里就能把批注草稿直接写进去。</p>
                </article>
              )}
              {message ? <p className="muted-copy">{message}</p> : null}
            </div>
          ) : (
            <article className="placeholder-card">
              <strong>批注区已就位</strong>
              <p>选择材料后，这里会展示书签、摘录和批注列表，并继续接笔记和图谱入口。</p>
            </article>
          )}
        </SectionFrame>
      </div>
    </>
  );
}
