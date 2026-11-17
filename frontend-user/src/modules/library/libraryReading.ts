import type { MaterialPayload } from "../../api/types";

export type LibraryReadingFilter = "all" | "unread" | "reading" | "completed";
export type LibraryBookSort = "updated" | "recently-read" | "title";

export function getLibraryReadingState(book: MaterialPayload) {
  const progress = book.readingProgress;
  const page = Math.max(0, Math.floor(progress?.currentPage || 0));
  const total = Math.max(0, Math.floor(progress?.totalPages || 0));
  if (!progress || !page || !progress.lastReadAt) {
    return { kind: "unread" as const, label: "未开始阅读", percent: 0, page: 0, total, lastReadAt: "" };
  }
  const percent = Math.max(0, Math.min(100, Number.isFinite(progress.progressPercent) ? progress.progressPercent : 0));
  const kind = total > 0 && (page >= total || percent >= 100) ? "completed" as const : "reading" as const;
  return { kind, label: total ? `读到第 ${Math.min(page, total)} / ${total} 页` : `读到第 ${page} 页`, percent, page: total ? Math.min(page, total) : page, total, lastReadAt: progress.lastReadAt };
}

export function readingTarget(book: MaterialPayload) {
  const state = getLibraryReadingState(book);
  return `/reader/${encodeURIComponent(book.id)}${state.page ? `?page=${state.page}` : ""}`;
}

export function sortLibraryBooks(books: MaterialPayload[], sort: LibraryBookSort): MaterialPayload[] {
  const timestamp = (value: string | undefined) => { const date = Date.parse(value || ""); return Number.isFinite(date) ? date : 0; };
  return [...books].sort((left, right) => {
    if (sort === "title") return left.title.localeCompare(right.title, "zh-CN") || left.id.localeCompare(right.id);
    const difference = sort === "recently-read"
      ? timestamp(getLibraryReadingState(right).lastReadAt) - timestamp(getLibraryReadingState(left).lastReadAt)
      : timestamp(right.updatedAt) - timestamp(left.updatedAt);
    return difference || left.id.localeCompare(right.id);
  });
}
