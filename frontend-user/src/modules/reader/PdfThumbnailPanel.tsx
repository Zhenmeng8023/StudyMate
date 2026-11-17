import { useEffect, useState } from "react";
import { Page } from "react-pdf";

const windowSize = 8;
const pageWindow = (page: number) => Math.floor((Math.max(1, page) - 1) / windowSize) * windowSize + 1;
type Props = { totalPages: number; currentPage: number; onGoToPage: (page: number) => void; onClose: () => void };

function PdfThumbnailTile({ page, current, onGoToPage }: { page: number; current: boolean; onGoToPage: (page: number) => void }) {
  const [failed, setFailed] = useState(false);
  return <div className="pdf-thumbnail-tile">
    <button type="button" className="pdf-thumbnail-page" aria-label={`预览第 ${page} 页`} aria-current={current ? "page" : undefined} onClick={() => onGoToPage(page)}>
      {failed ? <span>第 {page} 页预览失败</span> : <Page pageNumber={page} width={112} devicePixelRatio={1} renderTextLayer={false} renderAnnotationLayer={false}
        loading={<span>正在加载第 {page} 页…</span>} error={<span>预览失败</span>} onLoadError={() => setFailed(true)} onRenderError={() => setFailed(true)} />}
      <span className="pdf-thumbnail-number">第 {page} 页</span>
    </button>
    {failed ? <button type="button" className="ghost-button" aria-label={`重试第 ${page} 页缩略图`} onClick={() => setFailed(false)}>重试预览</button> : null}
  </div>;
}

// Mounted inside the existing react-pdf Document, so previews share its PDF and authorization.
export function PdfThumbnailPanel({ totalPages, currentPage, onGoToPage, onClose }: Props) {
  const [start, setStart] = useState(() => pageWindow(currentPage));
  useEffect(() => { setStart(pageWindow(currentPage)); }, [currentPage]);
  const end = Math.min(totalPages, start + windowSize - 1);
  const pages = Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  return <section className="pdf-navigation-panel pdf-thumbnail-panel" aria-label="页面缩略图">
    <header><h3>页面缩略图</h3><button type="button" className="ghost-button" aria-label="关闭页面缩略图" onClick={onClose}>关闭</button></header>
    <div className="pdf-thumbnail-controls">
      <button type="button" className="ghost-button" aria-label="上一组缩略图" disabled={start <= 1} onClick={() => setStart(Math.max(1, start - windowSize))}>上一组</button>
      <span role="status">第 {start}–{end} / {totalPages} 页</span>
      <button type="button" className="ghost-button" aria-label="下一组缩略图" disabled={end >= totalPages} onClick={() => setStart(start + windowSize)}>下一组</button>
      <button type="button" className="ghost-button" aria-label="显示当前页缩略图" onClick={() => setStart(pageWindow(currentPage))}>当前页</button>
    </div>
    <div className="pdf-thumbnail-grid">{pages.map((page) => <PdfThumbnailTile key={page} page={page} current={page === currentPage} onGoToPage={onGoToPage} />)}</div>
  </section>;
}
