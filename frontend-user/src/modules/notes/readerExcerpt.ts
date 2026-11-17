import { createNoteDraft } from "../../app/appShared";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

export function createReaderExcerptDraft(params: URLSearchParams) {
  const materialId = params.get("material") || "";
  const draft = createNoteDraft(materialId);
  const annotation = params.get("annotation") || "";
  const page = Number(params.get("page"));
  if (!materialId || !annotation || !Number.isSafeInteger(page) || page < 1) return draft;
  const quote = (params.get("quote") || "").slice(0, 1000);
  const comment = (params.get("comment") || "").slice(0, 2000);
  const query = new URLSearchParams({ page: String(page), annotation });
  const source = `/reader/${encodeURIComponent(materialId)}?${query}`;
  return {
    ...draft,
    title: `第 ${page} 页阅读摘录`,
    summary: (comment || quote).slice(0, 500),
    content: `${quote ? `<blockquote><p>${escapeHtml(quote)}</p></blockquote>` : ""}${comment ? `<p>${escapeHtml(comment)}</p>` : ""}<p><a href="${escapeHtml(source)}">回到原文 · 第 ${page} 页</a></p>`
  };
}
