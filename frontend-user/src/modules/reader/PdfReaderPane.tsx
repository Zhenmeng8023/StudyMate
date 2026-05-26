import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Expand, Search, ZoomIn, ZoomOut } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type PdfReaderPaneProps = {
  fileUrl: string;
  initialPage: number;
  onPageChange: (page: number) => void;
  onTotalPagesChange: (pages: number) => void;
  onSelectionChange: (text: string) => void;
};

export function PdfReaderPane(props: PdfReaderPaneProps) {
  const [pageNumber, setPageNumber] = useState(Math.max(props.initialPage, 1));
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [pageInput, setPageInput] = useState(String(Math.max(props.initialPage, 1)));
  const selectionHostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const nextPage = Math.max(props.initialPage, 1);
    setPageNumber(nextPage);
    setPageInput(String(nextPage));
  }, [props.initialPage]);

  useEffect(() => {
    props.onPageChange(pageNumber);
  }, [pageNumber, props]);

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
    setPageNumber(next);
    setPageInput(String(next));
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
    if (!anchorNode || !selectionHostRef.current.contains(anchorNode)) {
      return;
    }

    props.onSelectionChange(text);
  }

  return (
    <div className="pdf-reader-shell">
      <div className="pdf-toolbar">
        <div className="pdf-toolbar-group">
          <button
            className="ghost-button"
            disabled={!canGoPrev}
            onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
            title="上一页"
            type="button"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="ghost-button"
            disabled={!canGoNext}
            onClick={() => setPageNumber((current) => current + 1)}
            title="下一页"
            type="button"
          >
            <ChevronRight size={16} />
          </button>
          <label className="page-input">
            <Search size={14} />
            <input
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

      <div className="pdf-stage" onMouseUp={captureSelection} ref={selectionHostRef}>
        <Document
          file={props.fileUrl}
          loading={<p className="panel-copy">PDF 正在加载...</p>}
          noData={<p className="panel-copy">当前没有可读取的 PDF 文件。</p>}
          onLoadSuccess={({ numPages: pages }) => {
            setNumPages(pages);
            props.onTotalPagesChange(pages);
            if (pageNumber > pages) {
              setPageNumber(pages);
              setPageInput(String(pages));
            }
          }}
        >
          <Page className="pdf-page" pageNumber={pageNumber} renderAnnotationLayer renderTextLayer scale={scale} />
        </Document>
      </div>
    </div>
  );
}
