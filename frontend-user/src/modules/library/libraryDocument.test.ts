import { describe, expect, it } from "vitest";
import type { MaterialPayload } from "../../api/client";
import { documentFileKind, filterLibraryDocuments } from "./libraryDocument";

describe("library document presentation", () => {
  it("recognizes PDFs even when an upload did not provide a MIME type", () => {
    expect(documentFileKind({ attachmentName: "LECTURE.PDF", attachmentMime: "" })).toBe("PDF");
    expect(documentFileKind({ attachmentName: "lecture.docx", attachmentMime: "application/octet-stream" })).toBe("Word");
    expect(documentFileKind({ attachmentName: "download", attachmentMime: "application/msword" })).toBe("Word");
  });

  it("applies folder scope before matching tags or file names", () => {
    const items = [
      { id: "a", folderName: "数学", title: "函数", description: "", attachmentName: "notes.pdf", tags: ["微积分"] },
      { id: "b", folderName: "计算机", title: "函数", description: "", attachmentName: "notes.pdf", tags: ["算法"] }
    ] as MaterialPayload[];
    expect(filterLibraryDocuments(items, "微积分", "数学").map((item) => item.id)).toEqual(["a"]);
    expect(filterLibraryDocuments(items, "NOTES.PDF", "计算机").map((item) => item.id)).toEqual(["b"]);
    expect(filterLibraryDocuments(items, "微积分", "计算机")).toEqual([]);
  });
});
