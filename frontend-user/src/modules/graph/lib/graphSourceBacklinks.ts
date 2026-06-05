import type { GraphNodePayload, GraphNodeSourcePayload } from "../../../api/client";

export type GraphSourceBacklink = {
  target: string;
  actionLabel: string;
  sourceTypeLabel: string;
  sourceId: string;
};

type SourceLike = Pick<GraphNodeSourcePayload, "type" | "id" | "label" | "excerpt"> | null | undefined;

export function buildGraphSourceBacklink(node: GraphNodePayload): GraphSourceBacklink | null {
  return buildGraphSourceBacklinkFromSource(node.source, node.metadata);
}

export function buildGraphSourceBacklinkFromSource(
  source: SourceLike,
  metadata: Record<string, unknown> | null | undefined = {}
): GraphSourceBacklink | null {
  const sourceId = source?.id?.trim();
  const sourceType = source?.type?.trim().toLowerCase();
  if (!sourceId || !sourceType) {
    return null;
  }

  if (sourceType === "material") {
    return {
      target: appendReaderQuery(`/reader/${encodeURIComponent(sourceId)}`, metadata),
      actionLabel: "回到阅读器",
      sourceTypeLabel: "资料",
      sourceId
    };
  }

  if (sourceType === "note") {
    return {
      target: `/notes?selected=${encodeURIComponent(sourceId)}`,
      actionLabel: "回到笔记",
      sourceTypeLabel: "笔记",
      sourceId
    };
  }

  if (sourceType === "card") {
    return {
      target: `/review?card=${encodeURIComponent(sourceId)}`,
      actionLabel: "去复习页",
      sourceTypeLabel: "卡片",
      sourceId
    };
  }

  if (sourceType === "annotation") {
    const materialId = readMetadataString(metadata, "materialId") || readMetadataString(metadata, "sourceMaterialId");
    if (!materialId) {
      return null;
    }

    return {
      target: appendReaderQuery(`/reader/${encodeURIComponent(materialId)}`, {
        ...metadata,
        annotation: sourceId
      }),
      actionLabel: "回到批注",
      sourceTypeLabel: "批注",
      sourceId
    };
  }

  if (sourceType === "pdf-anchor") {
    const materialId = readMetadataString(metadata, "materialId") || readMetadataString(metadata, "sourceMaterialId");
    if (!materialId) {
      return null;
    }

    return {
      target: appendReaderQuery(`/reader/${encodeURIComponent(materialId)}`, {
        ...metadata,
        anchor: sourceId
      }),
      actionLabel: "回到 PDF 页",
      sourceTypeLabel: "PDF 锚点",
      sourceId
    };
  }

  if (sourceType === "ai_draft") {
    return {
      target: `/ai?draft=${encodeURIComponent(sourceId)}`,
      actionLabel: "查看 AI 草稿",
      sourceTypeLabel: "AI 草稿",
      sourceId
    };
  }

  if (sourceType === "ai_task" || sourceType === "ai") {
    return {
      target: `/ai?task=${encodeURIComponent(sourceId)}`,
      actionLabel: "查看 AI 任务",
      sourceTypeLabel: "AI",
      sourceId
    };
  }

  return null;
}

function appendReaderQuery(basePath: string, metadata: Record<string, unknown> | null | undefined) {
  const params = new URLSearchParams();
  const page = readMetadataNumber(metadata, "page") ?? readMetadataNumber(metadata, "pdfPage");
  const annotation = readMetadataString(metadata, "annotation") || readMetadataString(metadata, "annotationId");
  const anchor = readMetadataString(metadata, "anchor") || readMetadataString(metadata, "anchorId");

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

function readMetadataString(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function readMetadataNumber(metadata: Record<string, unknown> | null | undefined, key: string) {
  const value = metadata?.[key];
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.round(value);
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
  }
  return null;
}
