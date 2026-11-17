import { useState } from "react";
import type { usePdfNavigation } from "./usePdfNavigation";

type Props = { navigation: ReturnType<typeof usePdfNavigation>; totalPages: number; ready: boolean };

export function PdfNavigationPanel({ navigation: nav, totalPages, ready }: Props) {
  const [query, setQuery] = useState("");
  if (!nav.panel) return null;
  return <section className="pdf-navigation-panel" aria-label="PDF 导航">
    <header><h3>{nav.panel === "outline" ? "PDF 目录" : "文内查找"}</h3>
      <button className="ghost-button" aria-label="关闭 PDF 导航" onClick={() => { if (nav.searchStatus === "searching") nav.cancelSearch(); nav.setPanel(null); }} type="button">关闭</button></header>
    {nav.panel === "outline" ? <>
      {!ready ? <p role="status">PDF 加载后可读取目录。</p> : null}
      {nav.outlineStatus === "loading" ? <p role="status">正在读取目录…</p> : null}
      {nav.outlineError ? <p role="alert">{nav.outlineError}<button type="button" onClick={() => void nav.loadOutline()}>重试目录</button></p> : null}
      {nav.outlineStatus === "done" && !nav.outline.length ? <p>这份 PDF 没有内嵌目录，可使用页码或文内查找。</p> : null}
      <nav aria-label="PDF 章节目录" className="pdf-outline-list">{nav.outline.map((item) => <button key={item.id} type="button" disabled={item.destination === null}
        style={{ paddingLeft: 12 + Math.min(item.depth, 10) * 16 }} onClick={() => void nav.openOutline(item)}>
        {item.title}{item.destination === null ? <small>无文内页码</small> : null}
      </button>)}</nav>
    </> : <>
      <form className="pdf-search-form" onSubmit={(event) => { event.preventDefault(); void nav.search(query); }}>
        <label>查找内容<input aria-label="查找内容" type="search" maxLength={200} placeholder="输入词句，查找当前 PDF" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <button className="secondary-button" type="submit" disabled={!ready || !query.trim()}>开始查找</button>
        {nav.searchStatus === "searching" ? <button className="ghost-button" onClick={nav.cancelSearch} type="button">停止查找</button> : null}
      </form>
      <p className="pdf-search-hint">仅检索当前 PDF 的文字，忽略空白与大小写；扫描图片需要 OCR，当前不支持。</p>
      {nav.searchStatus !== "idle" ? <p role="status" aria-live="polite">已检索 {nav.scannedPages} / {totalPages} 页 · {nav.matches.length} 处匹配{nav.searchStatus === "cancelled" ? " · 已停止" : nav.searchStatus === "searching" ? " · 正在查找" : ""}</p> : null}
      {nav.error ? <p role="alert">{nav.error}<button type="button" onClick={() => void nav.search(query)}>重试查找</button></p> : null}
      {nav.limited ? <p className="pdf-search-hint">匹配达到 {nav.resultLimit} 处，仅显示已检索页中的前 {nav.resultLimit} 处；请缩小关键词后重新查找。</p> : null}
      {nav.noText ? <p>未检测到可提取文字，这可能是扫描 PDF；当前尚不支持 OCR。</p> : nav.searchStatus === "done" && !nav.matches.length ? <p>未找到匹配内容，请尝试其他词句。</p> : null}
      {nav.matches.length ? <div className="pdf-search-controls"><button className="ghost-button" onClick={() => nav.moveMatch(-1)} type="button">上一处</button><span>{nav.activeIndex + 1} / {nav.matches.length}</span><button className="ghost-button" onClick={() => nav.moveMatch(1)} type="button">下一处</button></div> : null}
      <div className="pdf-search-results">{nav.matches.map((match, index) => <button type="button" key={match.id} aria-current={index === nav.activeIndex ? "true" : undefined}
        aria-label={`第 ${match.page} 页，第 ${index + 1} 处匹配`} onClick={() => nav.selectMatch(index)}>
        <strong>第 {match.page} 页</strong><span>{match.snippet}</span>
      </button>)}</div>
    </>}
  </section>;
}
