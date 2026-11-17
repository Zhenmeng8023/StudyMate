import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PdfReaderPane } from "./PdfReaderPane";
import type { PdfNavigationDocument } from "./pdfNavigation";

const fixtures = vi.hoisted(() => ({ pdf: null as PdfNavigationDocument | null }));

vi.mock("react-pdf", () => ({
  pdfjs: { GlobalWorkerOptions: {} },
  Document: ({ children, file, onLoadSuccess, onLoadError }: { children: ReactNode; file: { url: string; httpHeaders: Record<string, string> }; onLoadSuccess: (value: PdfNavigationDocument) => void; onLoadError?: (error: Error) => void }) => <div data-testid="pdf-document" data-token={file.httpHeaders.Authorization}><button type="button" onClick={() => onLoadSuccess(fixtures.pdf || { numPages: 10 })}>load-pdf</button><button type="button" onClick={() => onLoadError?.(Object.assign(new Error("Unauthorized"), { status: 401 }))}>expire-pdf</button><button type="button" onClick={() => onLoadError?.(new Error("Unreadable PDF"))}>fail-pdf</button>{children}</div>,
  Page: ({ pageNumber, scale, customTextRenderer }: { pageNumber: number; scale: number; customTextRenderer?: (item: { str: string; itemIndex: number }) => string }) => <div data-testid="pdf-page" data-scale={scale}>PDF page {pageNumber}<span data-testid="search-text" dangerouslySetInnerHTML={{ __html: customTextRenderer?.({ str: "Study text", itemIndex: 0 }) || "" }} /></div>
}));

afterEach(() => { cleanup(); vi.restoreAllMocks(); fixtures.pdf = null; });

describe("PdfReaderPane", () => {
  it("shares its loaded PDF with bounded thumbnails and unmounts them on close or file change", () => {
    const go = vi.fn();
    const opened = vi.fn();
    fixtures.pdf = { numPages: 24 };
    const base = { fileUrl: "/first.pdf", initialPage: 1, onPageChange: go, onTotalPagesChange: vi.fn(), onSelectionChange: vi.fn(), onNavigationOpen: opened };
    const { rerender } = render(<PdfReaderPane {...base} />);
    expect(screen.getByRole("button", { name: "页面缩略图" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "load-pdf" }));
    fireEvent.click(screen.getByRole("button", { name: "页面缩略图" }));
    expect(opened).toHaveBeenCalledOnce();
    expect(screen.getAllByTestId("pdf-document")).toHaveLength(1);
    expect(screen.getAllByTestId("pdf-page")).toHaveLength(9);
    fireEvent.click(screen.getByRole("button", { name: "预览第 3 页" }));
    expect(go).toHaveBeenCalledExactlyOnceWith(3);
    expect(screen.getByRole("button", { name: "预览第 3 页" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("button", { name: "关闭页面缩略图" }));
    expect(screen.getAllByTestId("pdf-page")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "页面缩略图" }));
    fireEvent.click(screen.getByRole("button", { name: "文内查找" }));
    expect(screen.queryByRole("region", { name: "页面缩略图" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "页面缩略图" }));
    expect(screen.queryByRole("region", { name: "PDF 导航" })).not.toBeInTheDocument();
    rerender(<PdfReaderPane {...base} fileUrl="/second.pdf" />);
    expect(screen.queryByRole("region", { name: "页面缩略图" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "页面缩略图" })).toBeDisabled();
  });
  it("opens the outline on demand and finds text on another page without affecting annotations", async () => {
    const onPageChange = vi.fn();
    const onNavigationOpen = vi.fn();
    fixtures.pdf = { numPages: 2, getOutline: vi.fn().mockResolvedValue([{ title: "Chapter two", dest: [1] }]),
      getPage: vi.fn().mockResolvedValue({ getTextContent: async () => ({ items: [{ str: "Study text" }] }) }) };
    render(<PdfReaderPane fileUrl="/private.pdf" initialPage={1} onPageChange={onPageChange} onTotalPagesChange={vi.fn()} onSelectionChange={vi.fn()} onNavigationOpen={onNavigationOpen} />);
    expect(screen.queryByRole("region", { name: "PDF 导航" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "load-pdf" }));
    expect(fixtures.pdf.getOutline).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "PDF 目录" }));
    expect(onNavigationOpen).toHaveBeenCalledTimes(1);
    fireEvent.click(await screen.findByRole("button", { name: "Chapter two" }));
    await waitFor(() => expect(onPageChange).toHaveBeenCalledWith(2));
    fireEvent.click(screen.getByRole("button", { name: "文内查找" }));
    fireEvent.change(screen.getByLabelText("查找内容"), { target: { value: "Study" } });
    fireEvent.click(screen.getByRole("button", { name: "开始查找" }));
    expect(await screen.findByText("已检索 2 / 2 页 · 2 处匹配")).toBeInTheDocument();
    expect(screen.getByTestId("search-text").querySelector("mark")).toHaveTextContent("Study");
    fireEvent.click(screen.getByRole("button", { name: "下一处" }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    fireEvent.click(screen.getByRole("button", { name: "关闭 PDF 导航" }));
    expect(screen.queryByRole("region", { name: "PDF 导航" })).not.toBeInTheDocument();
  });

  it("recovers expired authorization once and offers a manual retry without looping", async () => {
    const recover = vi.fn().mockResolvedValue(undefined);
    render(<PdfReaderPane fileUrl="/private.pdf" initialPage={1} onPageChange={vi.fn()} onTotalPagesChange={vi.fn()} onSelectionChange={vi.fn()} onAuthorizationExpired={recover} />);
    fireEvent.click(screen.getByRole("button", { name: "expire-pdf" }));
    await waitFor(() => expect(recover).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole("button", { name: "expire-pdf" }));
    expect(recover).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "重新加载 PDF" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "重新加载 PDF" }));
    fireEvent.click(screen.getByRole("button", { name: "fail-pdf" }));
    expect(screen.getByRole("alert")).toHaveTextContent("PDF 加载失败");
    expect(recover).toHaveBeenCalledTimes(1);
  });

  it("sends authentication for private files and restores positioned highlights", () => {
    render(<PdfReaderPane fileUrl="/private.pdf" accessToken="private-token" initialPage={2}
      onPageChange={vi.fn()} onTotalPagesChange={vi.fn()} onSelectionChange={vi.fn()}
      focusedAnnotationId="annotation-1" annotations={[{ id: "annotation-1", materialId: "m", page: 2, quote: "quote", comment: "", color: "amber", rects: [{ page: 2, x: 0.1, y: 0.2, width: 0.3, height: 0.04 }], createdAt: "", updatedAt: "" }]} />);
    expect(screen.getByTestId("pdf-document")).toHaveAttribute("data-token", "Bearer private-token");
    const highlight = screen.getByTestId("pdf-highlight-annotation-1-0");
    expect(highlight).toHaveStyle({ left: "10%", top: "20%", width: "30%", height: "4%" });
    fireEvent.click(screen.getByTitle("放大"));
    expect(highlight).toHaveStyle({ left: "10%", top: "20%" });
  });

  it("does not report page changes on parent re-renders", () => {
    const onPageChange = vi.fn();
    const base = { fileUrl: "/document.pdf", initialPage: 3, onPageChange, onTotalPagesChange: vi.fn(), onSelectionChange: vi.fn() };
    const { rerender } = render(<PdfReaderPane {...base} />);
    rerender(<PdfReaderPane {...base} onTotalPagesChange={vi.fn()} />);
    expect(onPageChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("跳转页码"), { target: { value: "4" } });
    fireEvent.keyDown(screen.getByLabelText("跳转页码"), { key: "Enter" });
    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(4);
  });

  it("captures real text-layer selection rectangles and ignores selections outside the PDF", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(<PdfReaderPane fileUrl="/document.pdf" initialPage={2} onPageChange={vi.fn()} onTotalPagesChange={vi.fn()} onSelectionChange={onSelectionChange} />);
    const surface = container.querySelector(".pdf-page-surface") as HTMLElement;
    vi.spyOn(surface, "getBoundingClientRect").mockReturnValue({ left: 50, top: 100, width: 500, height: 1000 } as DOMRect);
    const textNode = screen.getByTestId("pdf-page").firstChild;
    const selection = { anchorNode: textNode, focusNode: textNode, rangeCount: 1, toString: () => "Selected sentence", getRangeAt: () => ({ getClientRects: () => [{ left: 100, top: 200, width: 200, height: 20 }] }) };
    vi.spyOn(window, "getSelection").mockReturnValue(selection as unknown as Selection);
    fireEvent.mouseUp(surface);
    expect(onSelectionChange).toHaveBeenCalledWith({ text: "Selected sentence", page: 2, rects: [{ page: 2, x: 0.1, y: 0.1, width: 0.4, height: 0.02 }] });
    onSelectionChange.mockClear();
    vi.spyOn(window, "getSelection").mockReturnValue({ ...selection, focusNode: document.body } as unknown as Selection);
    fireEvent.mouseUp(surface);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("clamps restored positions to the loaded page count and keeps toolbar navigation consistent", () => {
    const onTotalPagesChange = vi.fn();
    const onPageChange = vi.fn();
    render(<PdfReaderPane fileUrl="/document.pdf" initialPage={20} onPageChange={onPageChange} onTotalPagesChange={onTotalPagesChange} onSelectionChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "load-pdf" }));
    expect(onTotalPagesChange).toHaveBeenCalledWith(10);
    expect(screen.getByText("PDF page 10")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("上一页"));
    expect(onPageChange).toHaveBeenLastCalledWith(9);
    fireEvent.click(screen.getByTitle("下一页"));
    expect(onPageChange).toHaveBeenLastCalledWith(10);
    fireEvent.change(screen.getByLabelText("跳转页码"), { target: { value: "oops" } });
    fireEvent.blur(screen.getByLabelText("跳转页码"));
    expect(screen.getByLabelText("跳转页码")).toHaveValue("10");
    fireEvent.click(screen.getByTitle("缩小"));
    fireEvent.click(screen.getByTitle("恢复默认"));
    expect(screen.getByTestId("pdf-page")).toHaveAttribute("data-scale", "1.2");
  });
});
