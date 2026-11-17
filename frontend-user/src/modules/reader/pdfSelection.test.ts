import { describe, expect, it } from "vitest";
import { annotationColor, normalizeSelectionRects, isPdfMaterial } from "./pdfSelection";

describe("PDF selections", () => {
  it("stores real multiline rectangles relative to the PDF page", () => {
    const page = { left: 100, top: 50, width: 400, height: 600 };
    expect(normalizeSelectionRects([
      { left: 140, top: 110, width: 200, height: 18 },
      { left: 140, top: 130, width: 80, height: 18 }
    ], page, 4)).toEqual([
      { page: 4, x: 0.1, y: 0.1, width: 0.5, height: 0.03 },
      { page: 4, x: 0.1, y: 0.133333, width: 0.2, height: 0.03 }
    ]);
  });

  it("clips rectangles to the page and drops empty or invalid geometry", () => {
    expect(normalizeSelectionRects([
      { left: -20, top: 90, width: 50, height: 40 },
      { left: 120, top: 30, width: 10, height: 10 },
      { left: NaN, top: 0, width: 10, height: 10 }
    ], { left: 0, top: 0, width: 100, height: 100 }, 1)).toEqual([
      { page: 1, x: 0, y: 0.9, width: 0.3, height: 0.1 }
    ]);
    expect(normalizeSelectionRects([], { left: 0, top: 0, width: 0, height: 0 }, 1)).toEqual([]);
  });

  it("recognizes PDFs with generic upload MIME without treating Word as a PDF", () => {
    expect(isPdfMaterial({ attachmentName: "Research.PDF", attachmentMime: "application/octet-stream" })).toBe(true);
    expect(isPdfMaterial({ attachmentName: "Research.docx", attachmentMime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })).toBe(false);
    expect(isPdfMaterial(null)).toBe(false);
    expect(annotationColor("blue")).toBe("#8dc5f3");
    expect(annotationColor("#123abc")).toBe("#123abc");
    expect(annotationColor("invalid")).toBe("#f5cf67");
  });
});
