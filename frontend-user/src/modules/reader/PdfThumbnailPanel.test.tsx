import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PdfThumbnailPanel } from "./PdfThumbnailPanel";

vi.mock("react-pdf", () => ({
  Page: ({ pageNumber, renderTextLayer, onRenderError }: { pageNumber: number; renderTextLayer: boolean; onRenderError: () => void }) => <div data-testid="thumbnail-page" data-text-layer={String(renderTextLayer)}>Preview {pageNumber}<span onClick={(event) => { event.stopPropagation(); onRenderError(); }}>fail {pageNumber}</span></div>
}));
afterEach(cleanup);

describe("PDF thumbnail navigation", () => {
  it("renders at most eight pages, marks current page and navigates without changing documents", () => {
    const go = vi.fn();
    render(<PdfThumbnailPanel totalPages={120} currentPage={11} onGoToPage={go} onClose={vi.fn()} />);
    expect(screen.getAllByTestId("thumbnail-page")).toHaveLength(8);
    expect(screen.getByRole("button", { name: "预览第 11 页" })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByTestId("thumbnail-page")[0]).toHaveAttribute("data-text-layer", "false");
    fireEvent.click(screen.getByRole("button", { name: "预览第 12 页" }));
    expect(go).toHaveBeenCalledExactlyOnceWith(12);
    fireEvent.click(screen.getByRole("button", { name: "下一组缩略图" }));
    expect(screen.getByRole("button", { name: "预览第 17 页" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "显示当前页缩略图" }));
    expect(screen.getByRole("button", { name: "预览第 11 页" })).toBeInTheDocument();
  });

  it("offers retry for failed thumbnails and bounds the last window", () => {
    const close = vi.fn();
    render(<PdfThumbnailPanel totalPages={10} currentPage={10} onGoToPage={vi.fn()} onClose={close} />);
    expect(screen.getAllByTestId("thumbnail-page")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "下一组缩略图" })).toBeDisabled();
    fireEvent.click(screen.getByText("fail 9"));
    expect(screen.getByText("第 9 页预览失败")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "重试第 9 页缩略图" }));
    expect(screen.getByText("Preview 9")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "上一组缩略图" }));
    expect(screen.getAllByTestId("thumbnail-page")).toHaveLength(8);
    expect(screen.getByRole("button", { name: "上一组缩略图" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "关闭页面缩略图" }));
    expect(close).toHaveBeenCalledOnce();
  });
});
