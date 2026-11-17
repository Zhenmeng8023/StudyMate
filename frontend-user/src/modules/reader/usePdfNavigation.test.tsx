import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePdfNavigation } from "./usePdfNavigation";
import type { PdfNavigationDocument } from "./pdfNavigation";

afterEach(cleanup);
function documentWithText(texts: string[]): PdfNavigationDocument {
  return { numPages: texts.length, getPage: vi.fn(async (page: number) => ({ getTextContent: async () => ({ items: [{ str: texts[page - 1] }] }) })) };
}

describe("PDF navigation state", () => {
  it("loads outlines only on demand and navigates to an internal destination", async () => {
    const go = vi.fn();
    const doc = { ...documentWithText(["a", "b"]), getOutline: vi.fn().mockResolvedValue([{ title: "Chapter two", dest: [1] }]) };
    const { result } = renderHook(() => usePdfNavigation(doc, go));
    expect(doc.getOutline).not.toHaveBeenCalled();
    act(() => result.current.setPanel("outline"));
    await waitFor(() => expect(result.current.outline).toHaveLength(1));
    await act(() => result.current.openOutline(result.current.outline[0]));
    expect(go).toHaveBeenCalledWith(2);
  });
  it("searches all pages, reports progress and reuses the bounded text cache", async () => {
    const go = vi.fn();
    const doc = documentWithText(["First study", "Second STUDY", "Nothing"]);
    const { result } = renderHook(() => usePdfNavigation(doc, go));
    await act(() => result.current.search("study"));
    expect(result.current.matches).toHaveLength(2);
    expect(result.current.scannedPages).toBe(3);
    expect(result.current.searchStatus).toBe("done");
    act(() => result.current.moveMatch(1));
    expect(go).toHaveBeenLastCalledWith(2);
    await act(() => result.current.search("second"));
    expect(doc.getPage).toHaveBeenCalledTimes(3);
  });
  it("discards delayed results when the document changes", async () => {
    let finish!: (value: { items: unknown[] }) => void;
    const oldDoc: PdfNavigationDocument = { numPages: 1, getPage: async () => ({ getTextContent: () => new Promise((resolve) => { finish = resolve; }) }) };
    const { result, rerender } = renderHook(({ doc }) => usePdfNavigation(doc, vi.fn()), { initialProps: { doc: oldDoc } });
    let pending!: Promise<void>;
    act(() => { pending = result.current.search("old"); });
    await waitFor(() => expect(finish).toBeDefined());
    rerender({ doc: documentWithText(["new"]) });
    await act(async () => { finish({ items: [{ str: "old" }] }); await pending; });
    expect(result.current.matches).toEqual([]);
    expect(result.current.searchStatus).toBe("idle");
  });
  it("reports extraction failures and permits retry without treating image-only PDFs as searchable", async () => {
    const doc = documentWithText([""]);
    const getPage = vi.mocked(doc.getPage!);
    getPage.mockRejectedValueOnce(new Error("Cannot read page"));
    const { result } = renderHook(() => usePdfNavigation(doc, vi.fn()));
    await act(() => result.current.search("study"));
    expect(result.current.searchStatus).toBe("error");
    expect(result.current.error).toContain("Cannot read page");
    await act(() => result.current.search("study"));
    expect(result.current.noText).toBe(true);
    expect(result.current.searchStatus).toBe("done");
  });
  it("cancels a pending search without applying its delayed results", async () => {
    let finish!: (value: { items: unknown[] }) => void;
    const doc: PdfNavigationDocument = { numPages: 2, getPage: async () => ({ getTextContent: () => new Promise((resolve) => { finish = resolve; }) }) };
    const { result } = renderHook(() => usePdfNavigation(doc, vi.fn()));
    let pending!: Promise<void>;
    act(() => { pending = result.current.search("study"); });
    await waitFor(() => expect(finish).toBeDefined());
    act(() => result.current.cancelSearch());
    await act(async () => { finish({ items: [{ str: "study" }] }); await pending; });
    expect(result.current.searchStatus).toBe("cancelled");
    expect(result.current.matches).toEqual([]);
  });
  it("explains partial coverage when the result safety limit is reached", async () => {
    const doc = documentWithText(["study ".repeat(510), "study"]);
    const { result } = renderHook(() => usePdfNavigation(doc, vi.fn()));
    await act(() => result.current.search("study"));
    expect(result.current.limited).toBe(true);
    expect(result.current.matches).toHaveLength(500);
    expect(result.current.scannedPages).toBe(1);
    expect(doc.getPage).toHaveBeenCalledTimes(1);
  });
  it("handles blank queries and documents that are not ready", async () => {
    const { result } = renderHook(() => usePdfNavigation(null, vi.fn()));
    await act(() => result.current.search(" "));
    expect(result.current.searchStatus).toBe("idle");
    await act(() => result.current.search("study"));
    expect(result.current.error).toContain("尚未准备好");
    act(() => result.current.moveMatch(1));
    await act(() => result.current.loadOutline());
    await act(() => result.current.openOutline({ id: "1", title: "Chapter", depth: 0, destination: [0] }));
  });
  it("retries outline failures and reports unavailable or invalid destinations", async () => {
    const doc = { ...documentWithText(["a"]), getOutline: vi.fn().mockRejectedValueOnce(new Error("Outline unavailable")).mockResolvedValue([]), getDestination: vi.fn().mockResolvedValue(null) };
    const { result } = renderHook(() => usePdfNavigation(doc, vi.fn()));
    act(() => result.current.setPanel("outline"));
    await waitFor(() => expect(result.current.outlineStatus).toBe("error"));
    await act(() => result.current.loadOutline());
    expect(result.current.outline).toEqual([]);
    expect(result.current.outlineStatus).toBe("done");
    await act(() => result.current.openOutline({ id: "a", title: "Missing", depth: 0, destination: "missing" }));
    expect(result.current.outlineError).toContain("没有可用");
    doc.getDestination.mockRejectedValueOnce(new Error("Destination failed"));
    await act(() => result.current.openOutline({ id: "a", title: "Missing", depth: 0, destination: "missing" }));
    expect(result.current.outlineError).toContain("Destination failed");
  });
  it("uses shared authorization recovery once for a failed text request", async () => {
    const doc = documentWithText(["study"]);
    vi.mocked(doc.getPage!).mockRejectedValue(Object.assign(new Error("Unauthorized"), { status: 401 }));
    const recover = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => usePdfNavigation(doc, vi.fn(), recover));
    await act(() => result.current.search("study"));
    expect(recover).toHaveBeenCalledTimes(1);
    expect(result.current.searchStatus).toBe("error");
  });
  it("preserves the selected result when a later page finishes scanning", async () => {
    let finish!: (value: { items: unknown[] }) => void;
    const go = vi.fn();
    const document: PdfNavigationDocument = { numPages: 3, getPage: async (page) => ({
      getTextContent: () => page === 3 ? new Promise((resolve) => { finish = resolve; }) : Promise.resolve({ items: [{ str: "study" }] })
    }) };
    const { result } = renderHook(() => usePdfNavigation(document, go));
    let pending!: Promise<void>;
    act(() => { pending = result.current.search("study"); });
    await waitFor(() => expect(result.current.matches).toHaveLength(2));
    act(() => result.current.selectMatch(1));
    expect(go).toHaveBeenLastCalledWith(2);
    await act(async () => { finish({ items: [{ str: "study" }] }); await pending; });
    expect(result.current.activeIndex).toBe(1);
    expect(go).toHaveBeenLastCalledWith(2);
  });
  it("keeps the latest directory click when earlier destination resolution finishes late", async () => {
    const finish: Record<string, (destination: unknown[]) => void> = {};
    const document: PdfNavigationDocument = { numPages: 2, getDestination: (name) => new Promise((resolve) => { finish[name] = resolve; }) };
    const go = vi.fn();
    const { result } = renderHook(() => usePdfNavigation(document, go));
    let first!: Promise<void>;
    let second!: Promise<void>;
    act(() => {
      first = result.current.openOutline({ id: "a", title: "A", depth: 0, destination: "a" });
      second = result.current.openOutline({ id: "b", title: "B", depth: 0, destination: "b" });
    });
    await act(async () => { finish.b([1]); await second; });
    expect(go).toHaveBeenLastCalledWith(2);
    await act(async () => { finish.a([0]); await first; });
    expect(go).toHaveBeenCalledTimes(1);
    expect(go).toHaveBeenLastCalledWith(2);
  });
});
