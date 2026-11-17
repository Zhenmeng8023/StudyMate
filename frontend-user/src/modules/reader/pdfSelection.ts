import type { MaterialPayload, ReaderAnnotationPayload } from "../../api/types";

export type PdfSelectionRect = ReaderAnnotationPayload["rects"][number];
export type PdfTextSelection = { text: string; rects: PdfSelectionRect[]; page: number };
type Bounds = { left: number; top: number; width: number; height: number };

export function normalizeSelectionRects(rects: Bounds[], page: Bounds, pageNumber: number): PdfSelectionRect[] {
  if (!(page.width > 0 && page.height > 0)) return [];
  const round = (value: number) => Number(value.toFixed(6));
  return rects.flatMap((rect) => {
    if (![rect.left, rect.top, rect.width, rect.height].every(Number.isFinite)) return [];
    const left = Math.max(page.left, rect.left);
    const top = Math.max(page.top, rect.top);
    const right = Math.min(page.left + page.width, rect.left + rect.width);
    const bottom = Math.min(page.top + page.height, rect.top + rect.height);
    if (right <= left || bottom <= top) return [];
    return [{ page: pageNumber, x: round((left - page.left) / page.width), y: round((top - page.top) / page.height), width: round((right - left) / page.width), height: round((bottom - top) / page.height) }];
  }).slice(0, 20);
}

export function isPdfMaterial(material: Pick<MaterialPayload, "attachmentMime" | "attachmentName"> | null) {
  return Boolean(material && (material.attachmentMime?.toLowerCase().includes("pdf") || /\.pdf$/i.test(material.attachmentName)));
}

export function annotationColor(color: string) {
  return ({ amber: "#f5cf67", green: "#93d5ae", blue: "#8dc5f3", pink: "#efabc7" } as Record<string, string>)[color] || (/^#[0-9a-f]{6}$/i.test(color) ? color : "#f5cf67");
}
