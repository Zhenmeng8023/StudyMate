import type { CardPayload } from "../../api/client";

type DeckExportKind = "json" | "csv";

type DeckPortableCard = {
  front: string;
  back: string;
  cardType: string;
  tags?: string[];
  sourceType?: string;
  sourceId?: string;
  sourceMetadata?: Record<string, unknown>;
};

type DeckJsonExportOptions = {
  kind: "json";
  deckTitle: string;
  cards: CardPayload[];
};

type DeckCsvExportOptions = {
  kind: "csv";
  deckTitle: string;
  cards: CardPayload[];
};

export type DeckImportCardInput = {
  front: string;
  back: string;
  cardType: string;
  tags?: string[];
  sourceType?: string;
  sourceId?: string;
  sourceMetadata?: Record<string, unknown>;
};

export type DeckExportArtifact = {
  filename: string;
  mimeType: string;
  content: string;
};

export type DeckImportResult = {
  appliedLabel: string;
  cards: DeckImportCardInput[];
  statusMessage: string;
};

export function buildDeckExportArtifact(
  options: DeckJsonExportOptions | DeckCsvExportOptions,
  exportedAt = new Date().toISOString()
): DeckExportArtifact {
  const cards = options.cards.map(toPortableCard);
  if (options.kind === "json") {
    return {
      filename: `${sanitizeDeckExportFilename(options.deckTitle)}-cards.json`,
      mimeType: "application/json;charset=utf-8",
      content: JSON.stringify(
        {
          app: "StudyMate",
          version: 1,
          kind: "deck-cards",
          exportedAt,
          deck: {
            title: options.deckTitle,
            cardCount: cards.length
          },
          cards
        },
        null,
        2
      )
    };
  }

  return {
    filename: `${sanitizeDeckExportFilename(options.deckTitle)}-cards.csv`,
    mimeType: "text/csv;charset=utf-8",
    content: buildCsvContent(cards)
  };
}

export function parseDeckImportFile(content: string, filename: string): DeckImportResult {
  const kind = detectDeckImportKind(filename, content);
  const cards = kind === "json" ? parseDeckJsonCards(content) : parseDeckCsvCards(content);
  if (cards.length === 0) {
    throw new Error("导入失败：文件中没有可用卡片。");
  }

  return {
    appliedLabel: kind === "json" ? "导入卡片 JSON" : "导入卡片 CSV",
    cards,
    statusMessage: `已解析 ${cards.length} 张待导入卡片。`
  };
}

export function chunkDeckImportCards(cards: DeckImportCardInput[], size = 20) {
  if (size <= 0) {
    return [cards];
  }

  const chunks: DeckImportCardInput[][] = [];
  for (let index = 0; index < cards.length; index += size) {
    chunks.push(cards.slice(index, index + size));
  }
  return chunks;
}

function toPortableCard(card: CardPayload): DeckPortableCard {
  return {
    front: card.front,
    back: card.back,
    cardType: card.cardType || "basic",
    tags: normalizeTags(card.tags ?? []),
    sourceType: card.sourceType?.trim() || undefined,
    sourceId: card.sourceId?.trim() || undefined,
    sourceMetadata: card.sourceMetadata
  };
}

function sanitizeDeckExportFilename(title: string) {
  const cleaned = title.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-");
  return cleaned || "deck";
}

function buildCsvContent(cards: DeckPortableCard[]) {
  const lines = [
    ["front", "back", "cardType", "tags", "sourceType", "sourceId"].join(",")
  ];
  for (const card of cards) {
    lines.push(
      [
        encodeCsvField(card.front),
        encodeCsvField(card.back),
        encodeCsvField(card.cardType),
        encodeCsvField((card.tags ?? []).join("|")),
        encodeCsvField(card.sourceType ?? ""),
        encodeCsvField(card.sourceId ?? "")
      ].join(",")
    );
  }
  return lines.join("\n");
}

function encodeCsvField(value: string) {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll("\"", "\"\"")}"`;
}

function detectDeckImportKind(filename: string, content: string): DeckExportKind {
  const lowerFilename = filename.trim().toLowerCase();
  if (lowerFilename.endsWith(".json")) {
    return "json";
  }
  if (lowerFilename.endsWith(".csv")) {
    return "csv";
  }

  const trimmed = content.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return "json";
  }
  return "csv";
}

function parseDeckJsonCards(content: string) {
  const parsed = JSON.parse(content) as
    | { cards?: unknown }
    | unknown[];

  const rawCards = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.cards)
      ? parsed.cards
      : [];

  return rawCards.map((card, index) => normalizeImportCard(card, index + 1));
}

function parseDeckCsvCards(content: string) {
  const rows = parseCsvRows(content);
  if (rows.length === 0) {
    return [];
  }

  const header = rows[0].map((value) => value.trim().toLowerCase());
  const frontIndex = header.indexOf("front");
  const backIndex = header.indexOf("back");
  const cardTypeIndex = header.indexOf("cardtype");
  const tagsIndex = header.indexOf("tags");
  const sourceTypeIndex = header.indexOf("sourcetype");
  const sourceIDIndex = header.indexOf("sourceid");

  if (frontIndex === -1 || backIndex === -1) {
    throw new Error("导入失败：CSV 必须包含 front 和 back 列。");
  }

  return rows
    .slice(1)
    .filter((row) => row.some((value) => value.trim() !== ""))
    .map((row, index) =>
      normalizeImportCard(
        {
          front: row[frontIndex] ?? "",
          back: row[backIndex] ?? "",
          cardType: cardTypeIndex === -1 ? "basic" : row[cardTypeIndex] ?? "basic",
          tags: tagsIndex === -1 ? [] : parseTagField(row[tagsIndex] ?? ""),
          sourceType: sourceTypeIndex === -1 ? "" : row[sourceTypeIndex] ?? "",
          sourceId: sourceIDIndex === -1 ? "" : row[sourceIDIndex] ?? ""
        },
        index + 2
      )
    );
}

function normalizeImportCard(input: unknown, rowNumber: number): DeckImportCardInput {
  const record = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const front = String(record.front ?? "").trim();
  const back = String(record.back ?? "").trim();
  if (!front || !back) {
    throw new Error(`导入失败：第 ${rowNumber} 行缺少 front 或 back。`);
  }

  const cardType = String(record.cardType ?? "basic").trim() || "basic";
  const tags = Array.isArray(record.tags)
    ? normalizeTags(record.tags.map((value) => String(value)))
    : normalizeTags(parseTagField(String(record.tags ?? "")));
  const sourceType = String(record.sourceType ?? "").trim();
  const sourceId = String(record.sourceId ?? "").trim();
  const sourceMetadata =
    typeof record.sourceMetadata === "object" && record.sourceMetadata !== null
      ? (record.sourceMetadata as Record<string, unknown>)
      : undefined;

  return {
    front,
    back,
    cardType,
    tags: tags.length ? tags : undefined,
    sourceType: sourceType || undefined,
    sourceId: sourceId || undefined,
    sourceMetadata
  };
}

function normalizeTags(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function parseTagField(value: string) {
  if (!value.trim()) {
    return [];
  }

  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCsvRows(content: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        field += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((currentRow) => currentRow.length > 1 || currentRow[0]?.trim() !== "");
}
