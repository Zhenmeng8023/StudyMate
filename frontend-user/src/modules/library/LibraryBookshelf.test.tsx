import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MaterialPayload } from "../../api/types";
import { LibraryBookshelf } from "./LibraryBookshelf";

const book = { id: "book-1", title: "算法与数据结构", description: "从基础概念到问题求解", category: "计算机", folderName: "学习书单", tags: ["算法"], attachmentName: "algorithms.pdf", attachmentMime: "application/pdf", libraryScope: "personal", updatedAt: "2026-11-17T08:00:00Z" } as MaterialPayload;
afterEach(cleanup);

describe("personal PDF bookshelf", () => {
  it("repositions a focused preview when scrolling moves its cover", () => {
    render(<LibraryBookshelf books={[book]} selectedId="" onSelect={vi.fn()} />);
    const cover = screen.getByRole("button", { name: "查看《算法与数据结构》详情" });
    const bounds = vi.spyOn(cover, "getBoundingClientRect").mockReturnValue({ top: 150, left: 20, right: 160 } as DOMRect);
    fireEvent.focus(cover); cover.focus();
    bounds.mockReturnValue({ top: 110, left: 20, right: 160 } as DOMRect);
    fireEvent.scroll(window);
    expect(screen.getByRole("tooltip")).toHaveStyle({ top: "110px" });
  });
  it("keeps the preview for queued scroll events and closes after an unhovered cover moves", () => {
    render(<LibraryBookshelf books={[book]} selectedId="" onSelect={vi.fn()} />);
    const cover = screen.getByRole("button", { name: "查看《算法与数据结构》详情" });
    const bounds = vi.spyOn(cover, "getBoundingClientRect").mockReturnValue({ top: 100, left: 20, right: 160 } as DOMRect);
    fireEvent.mouseEnter(cover);
    fireEvent.scroll(window);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    vi.spyOn(cover, "matches").mockReturnValue(false);
    bounds.mockReturnValue({ top: 80, left: 20, right: 160 } as DOMRect);
    fireEvent.scroll(window);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
  it("shows a book cover and reveals metadata on hover, then dismisses with Escape", async () => {
    const user = userEvent.setup();
    render(<LibraryBookshelf books={[book]} selectedId="book-1" onSelect={vi.fn()} />);
    const cover = screen.getByRole("button", { name: "查看《算法与数据结构》详情" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await user.hover(cover);
    expect(screen.getByRole("tooltip")).toHaveTextContent("algorithms.pdf");
    expect(screen.getByRole("tooltip")).toHaveTextContent("从基础概念到问题求解");
    expect(screen.getByRole("tooltip")).toHaveTextContent("学习书单");
    expect(cover).toHaveAttribute("aria-describedby", screen.getByRole("tooltip").id);
    fireEvent.scroll(screen.getByRole("tooltip"));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.mouseEnter(cover);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("supports keyboard focus and click selection for touch users", async () => {
    const user = userEvent.setup();
    const select = vi.fn();
    render(<LibraryBookshelf books={[{ ...book, libraryScope: "official" }]} selectedId="" onSelect={select} />);
    await user.tab();
    expect(screen.getByRole("tooltip")).toHaveTextContent("官方收藏");
    await user.keyboard("{Enter}");
    expect(select).toHaveBeenCalledWith("book-1");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
