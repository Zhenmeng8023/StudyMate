import type { AuthSession } from "../../api/types";
import { withAuth } from "../../api/core";
import { getLibraryMaterial, getMaterialAttachmentUrl } from "../../api/library";

let active = 0;
const waiters = new Set<() => void>();
let pdfLibrary: Promise<typeof import("react-pdf")> | undefined;

async function acquire(signal: AbortSignal) {
  signal.throwIfAborted();
  if (active < 2) { active++; return; }
  await new Promise<void>((resolve, reject) => {
    const abort = () => { waiters.delete(start); reject(signal.reason); };
    const start = () => { waiters.delete(start); signal.removeEventListener("abort", abort); active++; resolve(); };
    waiters.add(start);
    signal.addEventListener("abort", abort, { once: true });
  });
}

// Only two PDF documents may be opened for covers at once; no persistent private-image cache.
export async function renderPdfCover(materialId: string, session: AuthSession, signal: AbortSignal): Promise<Blob> {
  await acquire(signal);
  try {
    signal.throwIfAborted();
    try { return await render(materialId, session, signal); }
    catch (error) {
      signal.throwIfAborted();
      if (!error || typeof error !== "object" || !("status" in error) || error.status !== 401) throw error;
      await getLibraryMaterial(session, materialId); // Reuse the shared refresh/replay boundary once.
      signal.throwIfAborted();
      return await render(materialId, session, signal);
    }
  } finally {
    active--;
    waiters.values().next().value?.();
  }
}

async function render(materialId: string, session: AuthSession, signal: AbortSignal): Promise<Blob> {
  const { pdfjs } = await (pdfLibrary ??= import("react-pdf"));
  signal.throwIfAborted();
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const task = pdfjs.getDocument({ url: getMaterialAttachmentUrl(materialId), httpHeaders: withAuth(session), isEvalSupported: false });
  const abort = () => { void task.destroy().catch(() => undefined); };
  signal.addEventListener("abort", abort, { once: true });
  const canvas = document.createElement("canvas");
  try {
    const pdf = await task.promise;
    signal.throwIfAborted();
    const page = await pdf.getPage(1);
    signal.throwIfAborted();
    const original = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: Math.min(320 / original.width, 480 / original.height) });
    canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) throw new Error("无法生成 PDF 封面");
    await page.render({ canvasContext, canvas, viewport }).promise;
    signal.throwIfAborted();
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("无法生成 PDF 封面")), "image/png"));
  } finally {
    signal.removeEventListener("abort", abort);
    await task.destroy();
    canvas.width = 0; canvas.height = 0;
  }
}
