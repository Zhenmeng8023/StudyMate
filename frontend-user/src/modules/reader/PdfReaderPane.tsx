import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Expand, Search, ZoomIn, ZoomOut } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import type { ReaderAnnotationPayload } from "../../api/types";
import { annotationColor, normalizeSelectionRects, type PdfTextSelection } from "./pdfSelection";
import { renderPdfSearchText, type PdfNavigationDocument } from "./pdfNavigation";
import { usePdfNavigation } from "./usePdfNavigation";
import { PdfNavigationPanel } from "./PdfNavigationPanel";
import { PdfThumbnailPanel } from "./PdfThumbnailPanel";
import "./reader-enhancements.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type PdfReaderPaneProps = {
  fileUrl: string;
  accessToken?: string;
  initialPage: number;
  annotations?: ReaderAnnotationPayload[];
  focusedAnnotationId?: string;
  onAuthorizationExpired?: () => Promise<void>;
  onNavigationOpen?: () => void;
  onPageChange: (page: number) => void;
  onTotalPagesChange: (pages: number) => void;
  onSelectionChange: (selection: PdfTextSelection) => void;
};

export function PdfReaderPane(props: PdfReaderPaneProps) {
  const [pageNumber, setPageNumber] = useState(Math.max(props.initialPage, 1));
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [pageInput, setPageInput] = useState(String(Math.max(props.initialPage, 1)));
  const [loadError, setLoadError] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [pdfDocument, setPdfDocument] = useState<PdfNavigationDocument | null>(null);
  const [thumbnailsOpen, setThumbnailsOpen] = useState(false);
  const recoveredAuthorization = useRef(false);
  const selectionHostRef = useRef<HTMLDivElement | null>(null);
  const file = useMemo(() => ({ url: props.fileUrl, httpHeaders: props.accessToken ? { Authorization: `Bearer ${props.accessToken}` } : {} }), [props.fileUrl, props.accessToken]);

  async function handleLoadError(error: Error) {
    setLoadError(true);
    setPdfDocument(null);
    if (!("status" in error) || error.status !== 401 || !props.onAuthorizationExpired || recoveredAuthorization.current) return;
    recoveredAuthorization.current = true;
    setRecovering(true);
    try {
      await props.onAuthorizationExpired();
      setLoadError(false);
      setLoadAttempt((attempt) => attempt + 1);
    } catch {
      setLoadError(true);
    } finally {
      setRecovering(false);
    }
  }

  function revealFocusedAnnotation() {
    const highlight = selectionHostRef.current?.querySelector<HTMLElement>(".pdf-highlight--focused");
    const stage = selectionHostRef.current?.closest<HTMLElement>(".pdf-stage");
    if (!highlight || !stage) return;
    const box = highlight.getBoundingClientRect();
    const viewport = stage.getBoundingClientRect();
    stage.scrollTop += box.top - viewport.top - stage.clientHeight / 2;
    if (box.left < viewport.left) stage.scrollLeft += box.left - viewport.left;
    else if (box.right > viewport.right) stage.scrollLeft += box.right - viewport.right;
  }

  useEffect(() => {
    revealFocusedAnnotation();
  }, [props.focusedAnnotationId, pageNumber]);

  useEffect(() => {
    const nextPage = Math.max(props.initialPage, 1);
    setPageNumber(nextPage);
    setPageInput(String(nextPage));
  }, [props.initialPage]);

  function goToPage(page: number) {
    const next = Math.max(1, Math.min(numPages || page, page));
    setPageNumber(next);
    setPageInput(String(next));
    if (next !== pageNumber) props.onPageChange(next);
  }

  const navigation = usePdfNavigation(pdfDocument, goToPage, props.onAuthorizationExpired);
  useEffect(() => { setPdfDocument(null); setThumbnailsOpen(false); }, [props.fileUrl]);

  function revealSearchMatch() {
    if (navigation.panel !== "search") return;
    const hit = selectionHostRef.current?.querySelector<HTMLElement>(".pdf-search-hit--active");
    const stage = selectionHostRef.current?.closest<HTMLElement>(".pdf-stage");
    if (!hit || !stage) return;
    const box = hit.getBoundingClientRect();
    const viewport = stage.getBoundingClientRect();
    stage.scrollTop += box.top - viewport.top - stage.clientHeight / 2;
    if (box.left < viewport.left) stage.scrollLeft += box.left - viewport.left;
    else if (box.right > viewport.right) stage.scrollLeft += box.right - viewport.right;
  }
  useEffect(() => { revealSearchMatch(); }, [navigation.activeIndex, navigation.matches, pageNumber]);
  const renderSearchText = useCallback(({ str, itemIndex }: { str: string; itemIndex: number }) => renderPdfSearchText(str,
    navigation.matches.filter((match) => match.page === pageNumber).flatMap((match) => match.segments.filter((segment) => segment.itemIndex === itemIndex).map((segment) => ({ ...segment, active: match.id === navigation.matches[navigation.activeIndex]?.id })))),
  [pageNumber, navigation.matches, navigation.activeIndex]);
  function toggleNavigation(panel: "outline" | "search") {
    setThumbnailsOpen(false);
    if (navigation.searchStatus === "searching" && (panel !== "search" || navigation.panel === panel)) navigation.cancelSearch();
    if (navigation.panel !== panel) props.onNavigationOpen?.();
    navigation.setPanel(navigation.panel === panel ? null : panel);
  }

  const canGoPrev = pageNumber > 1;
  const canGoNext = numPages > 0 && pageNumber < numPages;

  const pageLabel = useMemo(() => {
    if (!numPages) {
      return `第 ${pageNumber} 页`;
    }

    return `第 ${pageNumber} / ${numPages} 页`;
  }, [numPages, pageNumber]);

  function commitPageInput() {
    const parsed = Number(pageInput);
    if (!Number.isFinite(parsed)) {
      setPageInput(String(pageNumber));
      return;
    }

    const next = Math.max(1, Math.min(numPages || parsed, Math.round(parsed)));
    goToPage(next);
  }

  function captureSelection() {
    const selection = window.getSelection();
    if (!selectionHostRef.current || !selection) {
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      return;
    }

    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    if (!anchorNode || !focusNode || !selectionHostRef.current.contains(anchorNode) || !selectionHostRef.current.contains(focusNode) || !selection.rangeCount) {
      return;
    }

    const rects = normalizeSelectionRects(Array.from(selection.getRangeAt(0).getClientRects()), selectionHostRef.current.getBoundingClientRect(), pageNumber);
    if (rects.length) props.onSelectionChange({ text: text.slice(0, 1000), rects, page: pageNumber });
  }

  return (
    <div className="pdf-reader-shell">
      <div className="pdf-toolbar">
        <div className="pdf-toolbar-group">
          <button className="ghost-button" aria-expanded={navigation.panel === "outline"} onClick={() => toggleNavigation("outline")} type="button">PDF 目录</button>
          <button className="ghost-button" aria-expanded={navigation.panel === "search"} onClick={() => toggleNavigation("search")} type="button">文内查找</button>
          <button className="ghost-button" disabled={!pdfDocument} aria-expanded={thumbnailsOpen} onClick={() => {
            if (navigation.searchStatus === "searching") navigation.cancelSearch();
            navigation.setPanel(null);
            if (!thumbnailsOpen) props.onNavigationOpen?.();
            setThumbnailsOpen(!thumbnailsOpen);
          }} type="button">页面缩略图</button>
          <button
            className="ghost-button"
            disabled={!canGoPrev}
            onClick={() => goToPage(pageNumber - 1)}
            title="上一页"
            type="button"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="ghost-button"
            disabled={!canGoNext}
            onClick={() => goToPage(pageNumber + 1)}
            title="下一页"
            type="button"
          >
            <ChevronRight size={16} />
          </button>
          <label className="page-input">
            <Search size={14} />
            <input
              aria-label="跳转页码"
              onBlur={commitPageInput}
              onChange={(event) => setPageInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitPageInput();
                }
              }}
              value={pageInput}
            />
          </label>
          <span className="page-label">{pageLabel}</span>
        </div>

        <div className="pdf-toolbar-group">
          <button
            className="ghost-button"
            onClick={() => setScale((current) => Math.max(0.8, Number((current - 0.1).toFixed(2))))}
            title="缩小"
            type="button"
          >
            <ZoomOut size={16} />
          </button>
          <button
            className="ghost-button"
            onClick={() => setScale((current) => Math.min(2.2, Number((current + 0.1).toFixed(2))))}
            title="放大"
            type="button"
          >
            <ZoomIn size={16} />
          </button>
          <button className="ghost-button" onClick={() => setScale(1.2)} title="恢复默认" type="button">
            <Expand size={16} />
          </button>
        </div>
      </div>

      <PdfNavigationPanel key={props.fileUrl} navigation={navigation} totalPages={numPages} ready={Boolean(pdfDocument)} />

      <div className="pdf-stage">
        {loadError ? <p className="panel-copy" role="alert">PDF 加载失败，请检查文件权限或重新加载。<button className="secondary-button" disabled={recovering} onClick={() => { setLoadError(false); setLoadAttempt((attempt) => attempt + 1); }} type="button">重新加载 PDF</button></p> : null}
        <Document
          key={loadAttempt}
          file={file}
          loading={<p className="panel-copy">PDF 正在加载...</p>}
          error={null}
          onLoadError={(error) => { void handleLoadError(error); }}
          noData={<p className="panel-copy">当前没有可读取的 PDF 文件。</p>}
          onLoadSuccess={(document) => {
            const pages = document.numPages;
            setPdfDocument(document as unknown as PdfNavigationDocument);
            setNumPages(pages);
            props.onTotalPagesChange(pages);
            if (pageNumber > pages) {
              setPageNumber(pages);
              setPageInput(String(pages));
            }
          }}
        >
          {thumbnailsOpen && pdfDocument ? <PdfThumbnailPanel key={props.fileUrl} totalPages={numPages} currentPage={pageNumber} onGoToPage={goToPage} onClose={() => setThumbnailsOpen(false)} /> : null}
          <div className="pdf-page-surface" onMouseUp={captureSelection} onTouchEnd={captureSelection} ref={selectionHostRef}>
            <Page className="pdf-page" pageNumber={pageNumber} renderAnnotationLayer renderTextLayer scale={scale} onRenderSuccess={revealFocusedAnnotation}
              onRenderTextLayerSuccess={revealSearchMatch}
              customTextRenderer={renderSearchText} />
            <div className="pdf-highlight-layer" aria-hidden="true">
              {(props.annotations || []).flatMap((annotation) => annotation.rects.filter((rect) => rect.page === pageNumber).map((rect, index) => (
                <span key={`${annotation.id}-${index}`} data-testid={`pdf-highlight-${annotation.id}-${index}`} className={props.focusedAnnotationId === annotation.id ? "pdf-highlight pdf-highlight--focused" : "pdf-highlight"}
                  style={{ left: `${rect.x * 100}%`, top: `${rect.y * 100}%`, width: `${rect.width * 100}%`, height: `${rect.height * 100}%`, backgroundColor: annotationColor(annotation.color) }} />
              )))}
            </div>
          </div>
        </Document>
      </div>
    </div>
  );
}
