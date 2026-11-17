export type PdfTextPart = { str: string };
export type PdfMatchSegment = { itemIndex: number; start: number; end: number };
export type PdfSearchMatch = { id: string; page: number; snippet: string; segments: PdfMatchSegment[] };
export type PdfOutlineItem = { id: string; title: string; depth: number; destination: unknown };
export type PdfNavigationDocument = {
  numPages: number;
  getOutline?: () => Promise<unknown[] | null>;
  getDestination?: (name: string) => Promise<unknown[] | null>;
  getPageIndex?: (reference: { num: number; gen: number }) => Promise<number>;
  getPage?: (page: number) => Promise<{ getTextContent: () => Promise<{ items: unknown[] }> }>;
};

export function getPdfTextParts(items: unknown[]): PdfTextPart[] {
  return items.map((item) => ({ str: item && typeof item === "object" && "str" in item && typeof item.str === "string" ? item.str : "" }));
}

// Whitespace is ignored because PDF text items can split a word or phrase arbitrarily.
export function findPdfMatches(parts: PdfTextPart[], query: string, page: number, limit = 500): PdfSearchMatch[] {
  const needle = query.replace(/\s/g, "").toLowerCase();
  if (!needle) return [];
  let normalized = "";
  const positions: Array<{ itemIndex: number; start: number; end: number }> = [];
  parts.forEach((part, itemIndex) => {
    let offset = 0;
    for (const character of part.str) {
      const lower = character.toLowerCase();
      if (!/\s/.test(character)) {
        normalized += lower;
        for (let unit = 0; unit < lower.length; unit++) positions.push({ itemIndex, start: offset, end: offset + character.length });
      }
      offset += character.length;
    }
  });
  const result: PdfSearchMatch[] = [];
  let cursor = 0;
  while (result.length < limit) {
    const start = normalized.indexOf(needle, cursor);
    if (start < 0) break;
    const segments: PdfMatchSegment[] = [];
    for (const position of positions.slice(start, start + needle.length)) {
      const previous = segments.at(-1);
      if (previous?.itemIndex === position.itemIndex) previous.end = position.end;
      else segments.push({ ...position });
    }
    const first = segments[0];
    const last = segments.at(-1)!;
    const before = parts[first.itemIndex].str.slice(0, first.start);
    const selected = parts.slice(first.itemIndex, last.itemIndex + 1).map((part, index, items) => part.str.slice(index === 0 ? first.start : 0, index === items.length - 1 ? last.end : undefined)).join(" ");
    const after = parts[last.itemIndex].str.slice(last.end);
    const snippet = `${before.length > 30 ? "…" : ""}${before.slice(-30)}${selected.slice(0, 100)}${selected.length > 100 ? "…" : ""}${after.slice(0, 30)}${after.length > 30 ? "…" : ""}`;
    result.push({ id: `${page}:${start}`, page, segments, snippet });
    cursor = start + Math.max(needle.length, 1);
  }
  return result;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

export function renderPdfSearchText(text: string, segments: Array<{ start: number; end: number; active: boolean }>): string {
  const ranges = [...segments].sort((left, right) => left.start - right.start);
  let cursor = 0;
  let html = "";
  ranges.forEach((range) => {
    const start = Math.max(cursor, range.start);
    const end = Math.min(text.length, range.end);
    if (end <= start) return;
    html += escapeHtml(text.slice(cursor, start));
    html += `<mark class="pdf-search-hit${range.active ? " pdf-search-hit--active" : ""}">${escapeHtml(text.slice(start, end))}</mark>`;
    cursor = end;
  });
  return html + escapeHtml(text.slice(cursor));
}

export function flattenPdfOutline(entries: unknown[], depth = 0, prefix = ""): PdfOutlineItem[] {
  if (depth > 40) return [];
  return entries.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const id = `${prefix}${index}`;
    return [{ id, title: typeof item.title === "string" ? item.title : "未命名章节", depth, destination: item.url ? null : item.dest ?? null },
      ...flattenPdfOutline(Array.isArray(item.items) ? item.items : [], depth + 1, `${id}.`)];
  });
}

export async function resolvePdfDestination(document: PdfNavigationDocument, destination: unknown): Promise<number | null> {
  const explicit = typeof destination === "string" ? await document.getDestination?.(destination) : destination;
  if (!Array.isArray(explicit) || !explicit.length) return null;
  const reference: unknown = explicit[0];
  let index: number | undefined;
  if (typeof reference === "number") index = reference;
  else if (reference && typeof reference === "object" && "num" in reference && "gen" in reference && typeof reference.num === "number" && typeof reference.gen === "number") {
    index = await document.getPageIndex?.({ num: reference.num, gen: reference.gen });
  }
  return typeof index === "number" && Number.isInteger(index) && index >= 0 && index < document.numPages ? index + 1 : null;
}
