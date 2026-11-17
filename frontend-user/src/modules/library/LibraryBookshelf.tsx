import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, FileText } from "lucide-react";
import type { AuthSession, MaterialPayload } from "../../api/types";
import { documentFileKind } from "./libraryDocument";
import { LibraryReadingStatus } from "./LibraryReadingStatus";
import { PdfBookCover } from "./PdfBookCover";

type Preview = { book: MaterialPayload; left: number; top: number; anchor: HTMLElement; anchorTop: number; anchorLeft: number };
type Props = { books: MaterialPayload[]; selectedId: string; onSelect: (id: string) => void; session?: AuthSession | null };

function coverColor(id: string) {
  return [...id].reduce((hash, letter) => (hash + letter.charCodeAt(0)) % 5, 0);
}

export function LibraryBookshelf({ books, selectedId, onSelect, session }: Props) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const tooltipId = useId();
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissedBookId = useRef("");
  const currentPreview = useRef(preview);
  currentPreview.current = preview;

  function cancelHide() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }
  function hide() {
    dismissedBookId.current = "";
    cancelHide();
    hideTimer.current = setTimeout(() => setPreview(null), 120);
  }
  function reveal(book: MaterialPayload, element: HTMLElement) {
    cancelHide();
    if (dismissedBookId.current === book.id) return;
    const box = element.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 24);
    const preferredLeft = box.right + 14 + width <= window.innerWidth ? box.right + 14 : box.left - width - 14;
    setPreview({ book, anchor: element, anchorTop: box.top, anchorLeft: box.left, left: Math.max(12, Math.min(preferredLeft, window.innerWidth - width - 12)), top: Math.max(12, Math.min(box.top, window.innerHeight - 340)) });
  }
  useEffect(() => {
    const dismiss = (event: Event) => {
      if (event.target instanceof Element && event.target.closest(".library-book-preview")) return;
      if (event.type === "scroll" && currentPreview.current) {
        const { anchor, anchorTop, anchorLeft, book } = currentPreview.current;
        const box = anchor.getBoundingClientRect();
        if (anchor.isConnected && Math.abs(box.top - anchorTop) < 1 && Math.abs(box.left - anchorLeft) < 1) return;
        if (anchor.isConnected && (anchor.matches(":hover") || document.activeElement === anchor)) {
          reveal(book, anchor);
          return;
        }
      }
      setPreview(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      dismissedBookId.current = currentPreview.current?.book.id || "";
      setPreview(null);
    };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return <>
    <div className="library-bookshelf" aria-label="PDF 书架">
      {books.map((book) => <article className="library-book" key={book.id}>
        <button className={`library-book-cover library-book-cover--${coverColor(book.id)}`}
          aria-label={`查看《${book.title}》详情`} aria-current={selectedId === book.id ? "true" : undefined}
          aria-describedby={preview?.book.id === book.id ? tooltipId : undefined}
          onMouseEnter={(event) => reveal(book, event.currentTarget)} onMouseLeave={hide}
          onFocus={(event) => reveal(book, event.currentTarget)} onBlur={hide}
          onClick={() => { cancelHide(); setPreview(null); onSelect(book.id); }} type="button">
          <span className="library-book-topline"><FileText size={14} aria-hidden="true" />{documentFileKind(book)}<span>{book.libraryScope === "official" ? "官方收藏" : "私有藏书"}</span></span>
          <span className="library-book-rule" aria-hidden="true" />
          <strong>{book.title}</strong>
          <span className="library-book-category">{book.category || "学习资料"}</span>
          <span className="library-book-bottom"><BookOpen size={22} aria-hidden="true" /><span>STUDYMATE<br />个人书架</span></span>
        </button>
        {session && documentFileKind(book) === "PDF" ? <PdfBookCover key={`${session.user.id}:${book.attachmentFileId}`} materialId={book.id} session={session} /> : null}
        <div className="library-book-caption"><h3>{book.title}</h3><span>{book.folderName || (book.libraryScope === "official" ? "官方资料" : "未分类")}</span></div>
        <LibraryReadingStatus book={book} compact />
      </article>)}
    </div>
    {preview ? createPortal(<div className="library-book-preview" id={tooltipId} role="tooltip"
      style={{ left: preview.left, top: preview.top, maxHeight: `calc(100vh - ${preview.top + 12}px)` }} onMouseEnter={cancelHide} onMouseLeave={hide}>
      <div className="library-book-preview__eyebrow">{preview.book.libraryScope === "official" ? "官方收藏" : "仅自己可见"} · {documentFileKind(preview.book)}</div>
      <h3>{preview.book.title}</h3><p>{preview.book.description || "暂无资料简介"}</p>
      <LibraryReadingStatus book={preview.book} />
      <dl><div><dt>原文件</dt><dd>{preview.book.attachmentName}</dd></div>
        <div><dt>分类</dt><dd>{preview.book.category || "学习资料"}</dd></div>
        <div><dt>文件夹</dt><dd>{preview.book.folderName || "未分类"}</dd></div>
        <div><dt>更新</dt><dd>{new Date(preview.book.updatedAt).toLocaleDateString("zh-CN")}</dd></div></dl>
      <div className="library-book-preview__tags">{(preview.book.tags || []).map((tag) => <span key={tag}>{tag}</span>)}</div>
      <small>点击封面，查看阅读与管理操作</small>
    </div>, document.body) : null}
  </>;
}
