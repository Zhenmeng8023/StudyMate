import { useEffect, useRef, useState } from "react";
import { findPdfMatches, flattenPdfOutline, getPdfTextParts, resolvePdfDestination, type PdfNavigationDocument, type PdfOutlineItem, type PdfSearchMatch, type PdfTextPart } from "./pdfNavigation";

export type PdfNavigationPanel = "outline" | "search" | null;
const resultLimit = 500;
const textCacheLimit = 32;

export function usePdfNavigation(document: PdfNavigationDocument | null, onGoToPage: (page: number) => void, onAuthorizationExpired?: () => Promise<void>) {
  const [panel, setPanel] = useState<PdfNavigationPanel>(null);
  const [outline, setOutline] = useState<PdfOutlineItem[]>([]);
  const [outlineStatus, setOutlineStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [outlineError, setOutlineError] = useState("");
  const [matches, setMatches] = useState<PdfSearchMatch[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchStatus, setSearchStatus] = useState<"idle" | "searching" | "done" | "cancelled" | "error">("idle");
  const [scannedPages, setScannedPages] = useState(0);
  const [error, setError] = useState("");
  const [noText, setNoText] = useState(false);
  const [limited, setLimited] = useState(false);
  const runId = useRef(0);
  const selectedRunId = useRef<number | null>(null);
  const outlineRunId = useRef(0);
  const destinationRunId = useRef(0);
  const cache = useRef(new Map<number, PdfTextPart[]>());
  const goToPage = useRef(onGoToPage);
  goToPage.current = onGoToPage;
  const authorization = useRef(onAuthorizationExpired);
  authorization.current = onAuthorizationExpired;

  useEffect(() => {
    runId.current++;
    selectedRunId.current = null;
    outlineRunId.current++;
    destinationRunId.current++;
    cache.current = new Map();
    setOutline([]); setOutlineStatus("idle"); setOutlineError("");
    setMatches([]); setActiveIndex(0); setSearchStatus("idle"); setScannedPages(0); setError(""); setNoText(false); setLimited(false);
    return () => { runId.current++; outlineRunId.current++; destinationRunId.current++; };
  }, [document]);

  async function loadOutline() {
    if (!document) return;
    const current = ++outlineRunId.current;
    setOutlineStatus("loading"); setOutlineError("");
    try {
      const items = await document.getOutline?.() || [];
      if (current !== outlineRunId.current) return;
      setOutline(flattenPdfOutline(items)); setOutlineStatus("done");
    } catch (cause) {
      if (current !== outlineRunId.current) return;
      setOutlineError(cause instanceof Error ? cause.message : "读取目录失败"); setOutlineStatus("error");
    }
  }

  useEffect(() => { if (panel === "outline" && document) void loadOutline(); }, [panel, document]);

  async function openOutline(item: PdfOutlineItem) {
    if (!document) return;
    const current = ++destinationRunId.current;
    try {
      const page = await resolvePdfDestination(document, item.destination);
      if (current !== destinationRunId.current) return;
      if (page) goToPage.current(page);
      else setOutlineError("此目录项没有可用的文内页码。");
    } catch (cause) {
      if (current === destinationRunId.current) setOutlineError(cause instanceof Error ? cause.message : "无法定位目录页码。");
    }
  }

  async function search(query: string) {
    const current = ++runId.current;
    selectedRunId.current = null;
    setMatches([]); setActiveIndex(0); setScannedPages(0); setError(""); setNoText(false); setLimited(false);
    if (!query.replace(/\s/g, "")) { setSearchStatus("idle"); return; }
    if (!document?.getPage) { setError("PDF 尚未准备好，请加载完成后重试。"); setSearchStatus("error"); return; }
    setSearchStatus("searching");
    let collected: PdfSearchMatch[] = [];
    let hasText = false;
    try {
      for (let page = 1; page <= document.numPages; page++) {
        if (current !== runId.current) return;
        let parts = cache.current.get(page);
        if (!parts) {
          const source = await document.getPage(page);
          if (current !== runId.current) return;
          parts = getPdfTextParts((await source.getTextContent()).items);
          if (current !== runId.current) return;
          if (cache.current.size >= textCacheLimit) cache.current.delete(cache.current.keys().next().value!);
          cache.current.set(page, parts);
        }
        hasText ||= parts.some((part) => part.str.trim());
        collected = [...collected, ...findPdfMatches(parts, query, page, resultLimit - collected.length)];
        setMatches(collected); setScannedPages(page);
        if (collected.length >= resultLimit) { setLimited(true); break; }
      }
      if (current !== runId.current) return;
      setNoText(!hasText); setSearchStatus("done");
      if (collected.length && selectedRunId.current !== current) goToPage.current(collected[0].page);
    } catch (cause) {
      if (current !== runId.current) return;
      if (cause && typeof cause === "object" && "status" in cause && cause.status === 401 && authorization.current) {
        try { await authorization.current(); } catch { /* The shared session layer reports invalidation. */ }
        if (current !== runId.current) return;
      }
      setError(cause instanceof Error ? cause.message : "PDF 文本读取失败，请重试。"); setSearchStatus("error");
    }
  }

  function cancelSearch() { runId.current++; setSearchStatus("cancelled"); }
  function selectMatch(index: number) {
    if (!matches.length) return;
    selectedRunId.current = runId.current;
    const next = (index + matches.length) % matches.length;
    setActiveIndex(next); goToPage.current(matches[next].page);
  }
  return { panel, setPanel, outline, outlineStatus, outlineError, loadOutline, openOutline, matches, activeIndex,
    searchStatus, scannedPages, error, noText, limited, search, cancelSearch, selectMatch,
    moveMatch: (delta: number) => selectMatch(activeIndex + delta), resultLimit };
}
