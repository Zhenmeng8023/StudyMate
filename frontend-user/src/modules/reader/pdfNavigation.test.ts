import { describe, expect, it, vi } from "vitest";
import { findPdfMatches, flattenPdfOutline, renderPdfSearchText, resolvePdfDestination } from "./pdfNavigation";

describe("PDF navigation helpers", () => {
  it("matches phrases across text items, ignores case and whitespace, and records item ranges", () => {
    const matches = findPdfMatches([{ str: "Binary " }, { str: "search" }, { str: " BINARY SEARCH" }], "binary search", 2);
    expect(matches).toHaveLength(2);
    expect(matches[0].page).toBe(2);
    expect(matches[0].segments).toEqual([{ itemIndex: 0, start: 0, end: 6 }, { itemIndex: 1, start: 0, end: 6 }]);
    expect(findPdfMatches([{ str: "anything" }], "  ", 1)).toEqual([]);
  });
  it("escapes PDF text before inserting search highlight markup", () => {
    const result = renderPdfSearchText('<img src=x> & test', [{ start: 0, end: 4, active: true }]);
    expect(result).toContain('&lt;img');
    expect(result).not.toContain('<img');
    expect(result).toContain('&amp;');
    expect(result).toContain('pdf-search-hit--active');
  });
  it("builds previews around matches near the end of a long text item", () => {
    const matches = findPdfMatches([{ str: `${"Intro ".repeat(80)}Important keyword with nearby context` }], "keyword", 1);
    expect(matches[0].snippet).toContain("Important keyword with nearby context");
    expect(matches[0].snippet.length).toBeLessThanOrEqual(165);
  });
  it("flattens nested outlines while retaining depth and rejects external links", () => {
    const outline = flattenPdfOutline([{ title: "Chapter", dest: "chapter", items: [{ title: "Section", dest: [1] }] }, { title: "Website", url: "https://example.test" }]);
    expect(outline.map((item) => [item.title, item.depth])).toEqual([["Chapter", 0], ["Section", 1], ["Website", 0]]);
    expect(outline[2].destination).toBeNull();
  });
  it("resolves named destinations, explicit refs and numeric page indexes safely", async () => {
    const document = { numPages: 5, getDestination: vi.fn().mockResolvedValue([{ num: 8, gen: 0 }]), getPageIndex: vi.fn().mockResolvedValue(3) };
    expect(await resolvePdfDestination(document, "chapter")).toBe(4);
    expect(await resolvePdfDestination(document, [0])).toBe(1);
    expect(await resolvePdfDestination(document, [12])).toBeNull();
    expect(await resolvePdfDestination(document, "https://example.test")).toBe(4);
    expect(await resolvePdfDestination(document, null)).toBeNull();
  });
});
