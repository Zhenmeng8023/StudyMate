import type { MaterialPayload } from "../../api/types";
import { getLibraryReadingState } from "./libraryReading";

export function LibraryReadingStatus({ book, compact = false }: { book: MaterialPayload; compact?: boolean }) {
  const state = getLibraryReadingState(book);
  return <div className={`library-reading-status${compact ? " library-reading-status--compact" : ""}`}>
    <div><span>{state.kind === "completed" ? "已读完" : state.kind === "unread" ? "未开始阅读" : "阅读中"}</span><span>{state.kind !== "unread" ? `${state.percent}%` : ""}</span></div>
    {state.kind !== "unread" ? <>
      {compact ? <progress max={100} value={state.percent} aria-label={`${book.title}阅读进度`} /> : null}
      <small>{state.label}{!compact ? ` · 上次阅读 ${new Date(state.lastReadAt).toLocaleDateString("zh-CN")}` : ""}</small>
    </> : null}
  </div>;
}
