import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "../../api/types";
import { renderPdfCover } from "./pdfCoverRenderer";

const mocks = vi.hoisted(() => ({ getDocument: vi.fn(), refresh: vi.fn() }));
vi.mock("react-pdf", () => ({ pdfjs: { GlobalWorkerOptions: {}, getDocument: mocks.getDocument } }));
vi.mock("../../api/core", () => ({ withAuth: () => ({ Authorization: "Bearer cover-token" }) }));
vi.mock("../../api/library", () => ({ getMaterialAttachmentUrl: (id: string) => `/api/v1/library/materials/${id}/attachment`, getLibraryMaterial: mocks.refresh }));
const session = { user: { id: "owner" }, accessToken: "cover-token" } as AuthSession;
function task() {
  const render = vi.fn().mockReturnValue({ promise: Promise.resolve() });
  const getViewport = vi.fn(({ scale }: { scale: number }) => ({ width: 1000 * scale, height: 2000 * scale }));
  const getPage = vi.fn().mockResolvedValue({ getViewport, render });
  return { promise: Promise.resolve({ getPage }), destroy: vi.fn().mockResolvedValue(undefined), render, getPage };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({} as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => callback(new Blob(["cover"])));
});
afterEach(() => vi.restoreAllMocks());
describe("PDF cover renderer", () => {
  it("authenticates the original, renders only page one within bounds and destroys the document", async () => {
    const pdf = task(); mocks.getDocument.mockReturnValue(pdf);
    const blob = await renderPdfCover("book", session, new AbortController().signal);
    expect(blob.size).toBeGreaterThan(0);
    expect(mocks.getDocument).toHaveBeenCalledWith(expect.objectContaining({ url: "/api/v1/library/materials/book/attachment", httpHeaders: { Authorization: "Bearer cover-token" }, isEvalSupported: false }));
    expect(pdf.getPage).toHaveBeenCalledExactlyOnceWith(1);
    expect(pdf.render.mock.calls[0][0].viewport).toEqual({ width: 240, height: 480 });
    expect(pdf.destroy).toHaveBeenCalled();
  });
  it("destroys a failed document and recovers authorization only once", async () => {
    const failed = { promise: Promise.reject({ status: 401 }), destroy: vi.fn().mockResolvedValue(undefined) };
    const pdf = task(); mocks.getDocument.mockReturnValueOnce(failed).mockReturnValueOnce(pdf);
    mocks.refresh.mockResolvedValue(undefined);
    await renderPdfCover("book", session, new AbortController().signal);
    expect(failed.destroy).toHaveBeenCalled();
    expect(mocks.refresh).toHaveBeenCalledExactlyOnceWith(session, "book");
    expect(mocks.getDocument).toHaveBeenCalledTimes(2);
  });
  it("releases resources when canvas encoding fails", async () => {
    const pdf = task(); mocks.getDocument.mockReturnValue(pdf);
    vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementation((callback) => callback(null));
    await expect(renderPdfCover("book", session, new AbortController().signal)).rejects.toThrow("无法生成 PDF 封面");
    expect(pdf.destroy).toHaveBeenCalled();
  });
  it("never opens an already cancelled request", async () => {
    const controller = new AbortController(); controller.abort();
    await expect(renderPdfCover("book", session, controller.signal)).rejects.toThrow();
    expect(mocks.getDocument).not.toHaveBeenCalled();
  });
  it("limits concurrent documents to two and removes a cancelled queued request", async () => {
    let finish!: () => void;
    const gate = new Promise<void>((resolve) => { finish = resolve; });
    const first = task(); const second = task();
    first.render.mockReturnValue({ promise: gate }); second.render.mockReturnValue({ promise: gate });
    mocks.getDocument.mockReturnValueOnce(first).mockReturnValueOnce(second);
    const a = renderPdfCover("a", session, new AbortController().signal);
    const b = renderPdfCover("b", session, new AbortController().signal);
    const controller = new AbortController();
    const queued = renderPdfCover("c", session, controller.signal);
    await vi.waitFor(() => expect(mocks.getDocument).toHaveBeenCalledTimes(2));
    const rejected = expect(queued).rejects.toThrow(); controller.abort(); await rejected;
    finish(); await Promise.all([a, b]);
    expect(mocks.getDocument).toHaveBeenCalledTimes(2);
  });
});
