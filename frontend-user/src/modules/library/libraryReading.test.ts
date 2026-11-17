import { describe, expect, it } from "vitest";
import type { MaterialPayload } from "../../api/types";
import { getLibraryReadingState, readingTarget, sortLibraryBooks } from "./libraryReading";

const book = { id: "book-1", title: "算法", updatedAt: "2026-11-15" } as MaterialPayload;
describe("library reading state", () => {
  it("distinguishes unread, in-progress, completed and unknown page counts", () => {
    expect(getLibraryReadingState(book).kind).toBe("unread");
    const partial = { ...book, readingProgress: { currentPage: 3, totalPages: 10, progressPercent: 30, lastReadAt: "2026-11-17T01:00:00Z" } };
    expect(getLibraryReadingState(partial)).toMatchObject({ kind: "reading", percent: 30, label: "读到第 3 / 10 页" });
    expect(readingTarget(partial)).toBe("/reader/book-1?page=3");
    expect(getLibraryReadingState({ ...partial, readingProgress: { ...partial.readingProgress, currentPage: 10, progressPercent: 100 } }).kind).toBe("completed");
    expect(getLibraryReadingState({ ...partial, readingProgress: { ...partial.readingProgress, totalPages: 0, progressPercent: 100 } }).kind).toBe("reading");
    expect(readingTarget(book)).toBe("/reader/book-1");
  });

  it("sorts recently read books using real user timestamps without mutating the source", () => {
    const older = { ...book, id: "old", readingProgress: { currentPage: 1, totalPages: 5, progressPercent: 20, lastReadAt: "2026-11-15T01:00:00Z" } };
    const newer = { ...older, id: "new", readingProgress: { ...older.readingProgress, lastReadAt: "2026-11-17T01:00:00Z" } };
    const input = [book, older, newer];
    expect(sortLibraryBooks(input, "recently-read").map((item) => item.id)).toEqual(["new", "old", "book-1"]);
    expect(input[0]).toBe(book);
  });
});
