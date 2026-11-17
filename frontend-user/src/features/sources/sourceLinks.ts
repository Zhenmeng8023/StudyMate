import type { GraphNodeSourcePayload, SourceLinkPayload } from "../../api/client";

export type SourceLinkLike = {
  sourceType: string;
  sourceId: string;
  title?: string;
  excerpt?: string;
  locator?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

type LegacySourceLike = {
  sourceType?: string;
  sourceId?: string;
  sourceMetadata?: Record<string, unknown>;
  primarySourceLink?: SourceLinkPayload;
  sourceLinks?: SourceLinkPayload[];
};

type GraphSourceLike = Pick<GraphNodeSourcePayload, "type" | "id" | "label" | "excerpt"> | null | undefined;

export type SourceLinkReadModel = SourceLinkPayload & {
  linkedObjectType: string;
  linkedObjectId: string;
  fallbackLegacySource?: {
    sourceType: string;
    sourceId: string;
    sourceMetadata?: Record<string, unknown>;
  };
};

export function buildPrimarySourceLink(source: LegacySourceLike): SourceLinkPayload | null {
  if (source.primarySourceLink?.sourceType && source.primarySourceLink?.sourceId) {
    return normalizeSourceLink(source.primarySourceLink);
  }

  const firstSourceLink = source.sourceLinks?.find((item) => item?.sourceType && item?.sourceId);
  if (firstSourceLink) {
    return normalizeSourceLink(firstSourceLink);
  }

  const sourceType = normalizeSourceType(source.sourceType);
  const sourceId = source.sourceId?.trim();
  if (!sourceType || !sourceId) {
    return null;
  }

  const metadata = cloneRecord(source.sourceMetadata);
  const locator = splitSourceMetadata(sourceType, sourceId, metadata);
  const title = popString(metadata, "title");
  const excerpt = popString(metadata, "excerpt");

  return normalizeSourceLink({
    sourceType,
    sourceId,
    title,
    excerpt,
    locator,
    metadata: emptyRecordAsUndefined(metadata)
  });
}

export function buildSourceLinkFromGraphSource(
  source: GraphSourceLike,
  metadata: Record<string, unknown> | null | undefined = {}
): SourceLinkPayload | null {
  const sourceType = normalizeSourceType(source?.type);
  const sourceId = source?.id?.trim();
  if (!sourceType || !sourceId) {
    return null;
  }

  const primary = buildPrimarySourceLink({
    sourceType,
    sourceId,
    sourceMetadata: metadata ?? undefined
  });
  if (!primary) {
    return null;
  }

  return {
    ...primary,
    title: primary.title || source?.label?.trim() || undefined,
    excerpt: primary.excerpt || source?.excerpt?.trim() || undefined
  };
}

export function buildSourceLinkReadModel(source: LegacySourceLike): SourceLinkReadModel | null {
  const primary = buildPrimarySourceLink(source);
  if (!primary) {
    return null;
  }

  const legacySourceType = normalizeSourceType(source.sourceType);
  const legacySourceId = source.sourceId?.trim() ?? "";
  const fallbackLegacySource =
    legacySourceType && legacySourceId
      ? {
          sourceType: legacySourceType,
          sourceId: legacySourceId,
          sourceMetadata: emptyRecordAsUndefined(cloneRecord(source.sourceMetadata))
        }
      : undefined;

  return {
    ...primary,
    linkedObjectType: resolveLinkedObjectType(primary),
    linkedObjectId: resolveLinkedObjectId(primary),
    fallbackLegacySource
  };
}

export function buildSourceBacklinkTarget(sourceLink: SourceLinkLike | null | undefined) {
  const normalized = sourceLink ? normalizeSourceLink(sourceLink) : null;
  if (!normalized) {
    return "";
  }

  if (normalized.sourceType === "material") {
    const materialId = readLocatorString(normalized, "materialId") || normalized.sourceId;
    return appendReaderQuery(`/reader/${encodeURIComponent(materialId)}`, normalized);
  }

  if (normalized.sourceType === "note") {
    return `/notes?selected=${encodeURIComponent(normalized.sourceId)}`;
  }

  if (normalized.sourceType === "card") {
    return `/review?card=${encodeURIComponent(normalized.sourceId)}`;
  }

  if (normalized.sourceType === "graph" || normalized.sourceType === "graph-node") {
    return buildGraphWorkspaceTarget(normalized);
  }

  if (normalized.sourceType === "annotation") {
    const materialId = readLocatorString(normalized, "materialId");
    if (!materialId) {
      return "";
    }
    return appendReaderQuery(`/reader/${encodeURIComponent(materialId)}`, normalized);
  }

  if (normalized.sourceType === "pdf-anchor") {
    const materialId = readLocatorString(normalized, "materialId");
    if (!materialId) {
      return "";
    }
    return appendReaderQuery(`/reader/${encodeURIComponent(materialId)}`, normalized);
  }

  if (normalized.sourceType === "ai-draft") {
    return `/ai?draft=${encodeURIComponent(normalized.sourceId)}`;
  }

  if (normalized.sourceType === "ai-task" || normalized.sourceType === "ai") {
    return `/ai?task=${encodeURIComponent(normalized.sourceId)}`;
  }

  return "";
}

export function buildSourceProfileTarget(sourceLink: SourceLinkLike | null | undefined) {
  const normalized = sourceLink ? normalizeSourceLink(sourceLink) : null;
  if (!normalized) {
    return "";
  }
  const params = new URLSearchParams({
    sourceType: normalized.sourceType,
    sourceId: normalized.sourceId
  });
  return `/sources?${params.toString()}`;
}

export function normalizeSourceType(sourceType: string | undefined) {
  return sourceType?.trim().toLowerCase().replace(/_/g, "-") ?? "";
}

function normalizeSourceLink(sourceLink: SourceLinkLike): SourceLinkPayload | null {
  const sourceType = normalizeSourceType(sourceLink.sourceType);
  const sourceId = sourceLink.sourceId?.trim();
  if (!sourceType || !sourceId) {
    return null;
  }

  return {
    sourceType,
    sourceId,
    title: sourceLink.title?.trim() || undefined,
    excerpt: sourceLink.excerpt?.trim() || undefined,
    locator: emptyRecordAsUndefined(cloneRecord(sourceLink.locator)),
    metadata: emptyRecordAsUndefined(cloneRecord(sourceLink.metadata))
  };
}

function resolveLinkedObjectType(sourceLink: SourceLinkPayload) {
  return normalizeSourceType(sourceLink.sourceType);
}

function resolveLinkedObjectId(sourceLink: SourceLinkPayload) {
  if (sourceLink.sourceType === "graph-node") {
    return readLocatorString(sourceLink, "nodeId") || sourceLink.sourceId;
  }
  if (sourceLink.sourceType === "note-block") {
    return readLocatorString(sourceLink, "blockId") || sourceLink.sourceId;
  }
  return sourceLink.sourceId;
}

function splitSourceMetadata(sourceType: string, sourceId: string, metadata: Record<string, unknown> | undefined) {
  const remaining = metadata ?? {};
  const locator: Record<string, unknown> = {};

  switch (sourceType) {
    case "material":
      moveLocator(remaining, locator, "materialId", "materialId");
      moveLocator(remaining, locator, "sourceMaterialId", "materialId");
      moveLocator(remaining, locator, "page", "page");
      moveLocator(remaining, locator, "pdfPage", "page");
      moveLocator(remaining, locator, "annotationId", "annotationId");
      moveLocator(remaining, locator, "anchorId", "anchorId");
      break;
    case "annotation":
      locator.annotationId = sourceId;
      moveLocator(remaining, locator, "materialId", "materialId");
      moveLocator(remaining, locator, "sourceMaterialId", "materialId");
      moveLocator(remaining, locator, "annotationId", "annotationId");
      moveLocator(remaining, locator, "page", "page");
      moveLocator(remaining, locator, "pdfPage", "page");
      break;
    case "pdf-anchor":
      locator.anchorId = sourceId;
      moveLocator(remaining, locator, "materialId", "materialId");
      moveLocator(remaining, locator, "sourceMaterialId", "materialId");
      moveLocator(remaining, locator, "anchorId", "anchorId");
      moveLocator(remaining, locator, "page", "page");
      moveLocator(remaining, locator, "pdfPage", "page");
      break;
    case "note":
      locator.noteId = sourceId;
      moveLocator(remaining, locator, "noteId", "noteId");
      break;
    case "note-block":
      moveLocator(remaining, locator, "noteId", "noteId");
      moveLocator(remaining, locator, "blockId", "blockId");
      break;
    case "graph":
      moveLocator(remaining, locator, "graphId", "graphId");
      moveLocator(remaining, locator, "focusX", "focusX");
      moveLocator(remaining, locator, "focusY", "focusY");
      moveLocator(remaining, locator, "focusWidth", "focusWidth");
      moveLocator(remaining, locator, "focusHeight", "focusHeight");
      moveLocator(remaining, locator, "focusLabel", "focusLabel");
      break;
    case "graph-node":
      moveLocator(remaining, locator, "graphId", "graphId");
      moveLocator(remaining, locator, "nodeId", "nodeId");
      moveLocator(remaining, locator, "focusX", "focusX");
      moveLocator(remaining, locator, "focusY", "focusY");
      moveLocator(remaining, locator, "focusWidth", "focusWidth");
      moveLocator(remaining, locator, "focusHeight", "focusHeight");
      moveLocator(remaining, locator, "focusLabel", "focusLabel");
      break;
    case "ai-draft":
      locator.draftId = sourceId;
      moveLocator(remaining, locator, "draftId", "draftId");
      moveLocator(remaining, locator, "taskId", "taskId");
      break;
    case "ai-task":
    case "ai":
      locator.taskId = sourceId;
      moveLocator(remaining, locator, "taskId", "taskId");
      break;
    case "card":
      locator.cardId = sourceId;
      moveLocator(remaining, locator, "cardId", "cardId");
      break;
  }

  return emptyRecordAsUndefined(locator);
}

function moveLocator(
  source: Record<string, unknown>,
  locator: Record<string, unknown>,
  sourceKey: string,
  targetKey: string
) {
  if (!(sourceKey in source)) {
    return;
  }

  const value = source[sourceKey];
  if (value === null || value === undefined || value === "") {
    delete source[sourceKey];
    return;
  }

  locator[targetKey] = value;
  delete source[sourceKey];
}

function appendReaderQuery(basePath: string, sourceLink: SourceLinkLike) {
  const params = new URLSearchParams();
  const page = readLocatorNumber(sourceLink, "page");
  const annotation = readLocatorString(sourceLink, "annotationId") || readLocatorString(sourceLink, "annotation");
  const anchor = readLocatorString(sourceLink, "anchorId") || readLocatorString(sourceLink, "anchor");

  if (page) {
    params.set("page", String(page));
  }
  if (annotation) {
    params.set("annotation", annotation);
  } else if (anchor) {
    params.set("anchor", anchor);
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function buildGraphWorkspaceTarget(sourceLink: SourceLinkLike) {
  const graphId = readLocatorString(sourceLink, "graphId");
  if (!graphId) {
    return "";
  }

  const params = new URLSearchParams();
  params.set("graphId", graphId);

  const focusX = readLocatorNumberString(sourceLink, "focusX", true);
  const focusY = readLocatorNumberString(sourceLink, "focusY", true);
  const focusWidth = readLocatorNumberString(sourceLink, "focusWidth");
  const focusHeight = readLocatorNumberString(sourceLink, "focusHeight");
  const focusLabel = readLocatorString(sourceLink, "focusLabel");

  if (focusX) {
    params.set("focusX", focusX);
  }
  if (focusY) {
    params.set("focusY", focusY);
  }
  if (focusWidth) {
    params.set("focusWidth", focusWidth);
  }
  if (focusHeight) {
    params.set("focusHeight", focusHeight);
  }
  if (focusLabel) {
    params.set("focusLabel", focusLabel);
  }

  return `/graph?${params.toString()}`;
}

function readLocatorString(sourceLink: SourceLinkLike, key: string) {
  const value = sourceLink.locator?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function readLocatorNumberString(sourceLink: SourceLinkLike, key: string, allowZero = false) {
  const value = sourceLink.locator?.[key];
  if (typeof value === "number" && Number.isFinite(value) && (allowZero ? value >= 0 : value > 0)) {
    return String(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    const parsed = Number(trimmed);
    if (trimmed && Number.isFinite(parsed) && (allowZero ? parsed >= 0 : parsed > 0)) {
      return trimmed;
    }
  }
  return "";
}

function readLocatorNumber(sourceLink: SourceLinkLike, key: string) {
  const value = sourceLink.locator?.[key];
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
  }
  return null;
}

function cloneRecord(record: Record<string, unknown> | undefined) {
  if (!record) {
    return undefined;
  }
  return { ...record };
}

function popString(record: Record<string, unknown> | undefined, key: string) {
  if (!record) {
    return "";
  }
  const value = record[key];
  delete record[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function emptyRecordAsUndefined(record: Record<string, unknown> | undefined) {
  if (!record || Object.keys(record).length === 0) {
    return undefined;
  }
  return record;
}
