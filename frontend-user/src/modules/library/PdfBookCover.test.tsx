import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "../../api/types";
import { PdfBookCover } from "./PdfBookCover";
import { renderPdfCover } from "./pdfCoverRenderer";

vi.mock("./pdfCoverRenderer", () => ({ renderPdfCover: vi.fn() }));
const session = { accessToken: "token", user: { id: "owner" } } as AuthSession;
let intersect: IntersectionObserverCallback;
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function setup() {
  vi.clearAllMocks();
  vi.stubGlobal("IntersectionObserver", class { constructor(callback: IntersectionObserverCallback) { intersect = callback; } observe() {} disconnect() {} });
  vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:cover"), revokeObjectURL: vi.fn() });
}
async function visible() { await act(async () => intersect([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)); }
describe("private PDF book covers", () => {
  it("loads only near the viewport and releases its URL on unmount", async () => {
    setup(); vi.mocked(renderPdfCover).mockResolvedValue(new Blob());
    const view = render(<PdfBookCover materialId="book" session={session} />);
    expect(renderPdfCover).not.toHaveBeenCalled();
    await visible();
    expect(await screen.findByRole("img", { name: "PDF 首页封面" })).toHaveAttribute("src", "blob:cover");
    expect(renderPdfCover).toHaveBeenCalledWith("book", session, expect.any(AbortSignal));
    view.unmount(); expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:cover");
  });
  it("retains the fallback and can retry after failure", async () => {
    setup(); vi.mocked(renderPdfCover).mockRejectedValueOnce(new Error("unreadable")).mockResolvedValue(new Blob());
    render(<PdfBookCover materialId="book" session={session} />);
    await visible();
    expect(await screen.findByText("封面暂不可用")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "重新加载封面" }));
    expect(await screen.findByRole("img")).toBeInTheDocument();
  });
  it("aborts pending rendering and ignores late results on account change", async () => {
    setup(); let finish!: (value: Blob) => void;
    vi.mocked(renderPdfCover).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; })).mockResolvedValue(new Blob());
    const view = render(<PdfBookCover materialId="book" session={session} />);
    await visible(); const signal = vi.mocked(renderPdfCover).mock.calls.at(-1)![2];
    view.rerender(<PdfBookCover materialId="book" session={{ ...session, user: { ...session.user, id: "other" } }} />);
    expect(signal.aborted).toBe(true);
    await act(async () => finish(new Blob()));
    await waitFor(() => expect(renderPdfCover).toHaveBeenCalledTimes(2));
  });
});
