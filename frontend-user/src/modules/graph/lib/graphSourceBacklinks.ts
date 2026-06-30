import type { GraphNodePayload, GraphNodeSourcePayload } from "../../../api/client";

export type GraphSourceBacklink = {
  target: string;
  actionLabel: string;
  sourceTypeLabel: string;
  sourceId: string;
  learningStepLabel: string;
  description: string;
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
  const sourceType = normalizeSourceType(source?.type);
  if (!sourceId || !sourceType) {
    return null;
  }

  if (sourceType === "material") {
    return {
      target: appendReaderQuery(`/reader/${encodeURIComponent(sourceId)}`, metadata),
      actionLabel: "回到阅读器",
      sourceTypeLabel: "资料",
      sourceId,
      learningStepLabel: "资料阅读",
      description: "回到原始资料确认上下文，再从图谱节点生成卡片草稿进入复习。"
    };
  }

  if (sourceType === "note") {
    return {
      target: `/notes?selected=${encodeURIComponent(sourceId)}`,
      actionLabel: "回到笔记",
      sourceTypeLabel: "笔记",
      sourceId,
      learningStepLabel: "笔记沉淀",
      description: "回到笔记补充原始思路，再把已整理的节点继续连接到图谱和卡片。"
    };
  }

  if (sourceType === "card") {
    return {
      target: `/review?card=${encodeURIComponent(sourceId)}`,
      actionLabel: "去复习页",
      sourceTypeLabel: "卡片",
      sourceId,
      learningStepLabel: "卡片复习",
      description: "回到复习卡片检查记忆结果，并把复习反馈继续沉淀回图谱。"
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
      sourceId,
      learningStepLabel: "资料批注",
      description: "回到 PDF 或资料批注定位原句，再确认该节点是否需要生成复习卡片。"
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
      sourceId,
      learningStepLabel: "PDF 锚点",
      description: "回到 PDF 定位页码和锚点，核对材料上下文后继续组织图谱。"
    };
  }

  if (sourceType === "ai-draft") {
    return {
      target: `/ai?draft=${encodeURIComponent(sourceId)}`,
      actionLabel: "查看 AI 草稿",
      sourceTypeLabel: "AI 草稿",
      sourceId,
      learningStepLabel: "AI 草稿确认",
      description: "回到 AI 草稿确认生成内容，再把确认后的知识点沉淀为卡片或图谱节点。"
    };
  }

  if (sourceType === "ai-task" || sourceType === "ai") {
    return {
      target: `/ai?task=${encodeURIComponent(sourceId)}`,
      actionLabel: "查看 AI 任务",
      sourceTypeLabel: "AI",
      sourceId,
      learningStepLabel: "AI 任务追踪",
      description: "回到 AI 任务查看生成依据，并把确认后的结果纳入图谱学习闭环。"
    };
  }

  return null;
}

function normalizeSourceType(sourceType: string | undefined) {
  return sourceType?.trim().toLowerCase().replace(/_/g, "-") ?? "";
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
