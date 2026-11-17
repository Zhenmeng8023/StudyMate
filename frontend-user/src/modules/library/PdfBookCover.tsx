import { useEffect, useRef, useState } from "react";
import type { AuthSession } from "../../api/types";
import { renderPdfCover } from "./pdfCoverRenderer";

export function PdfBookCover({ materialId, session }: { materialId: string; session: AuthSession }) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [image, setImage] = useState<{ url: string; owner: string; materialId: string } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!host.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "160px" });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setImage(null); setError(false);
    if (!visible) return;
    const controller = new AbortController();
    let url = "";
    void renderPdfCover(materialId, session, controller.signal).then((blob) => {
      if (controller.signal.aborted) return;
      url = URL.createObjectURL(blob);
      setImage({ url, owner: session.user.id, materialId });
    }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [materialId, session.user.id, session.accessToken, visible, attempt]);
  return <div ref={host} className="library-pdf-cover">
    {image && image.owner === session.user.id && image.materialId === materialId ? <img alt="PDF 首页封面" src={image.url} /> : null}
    {error ? <div className="library-cover-retry"><span>封面暂不可用</span><button type="button" aria-label="重新加载封面" onClick={() => setAttempt((value) => value + 1)}>重试</button></div> : null}
  </div>;
}
