import type { GraphNodePayload, GraphNodeSourcePayload } from "../../../api/client";
import {
  buildSourceBacklinkTarget,
  buildSourceLinkReadModel,
  normalizeSourceType,
  type SourceLinkLike
} from "../../../features/sources/sourceLinks";

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
  const sourceLink = buildSourceLinkReadModel({
    sourceType: source?.type,
    sourceId: source?.id,
    sourceMetadata: metadata ?? undefined
  });
  if (!sourceLink) {
    return null;
  }

  const sourceId = sourceLink.sourceId;
  const sourceType = normalizeSourceType(sourceLink.sourceType);
  const target = buildSourceBacklinkTarget(sourceLink);
  if (!target) {
    return null;
  }

  if (sourceType === "material") {
    return {
      target,
      actionLabel: "回到阅读器",
      sourceTypeLabel: "资料",
      sourceId,
      learningStepLabel: "资料阅读",
      description: "回到原始资料确认上下文，再从图谱节点生成卡片草稿进入复习。"
    };
  }

  if (sourceType === "note") {
    return {
      target,
      actionLabel: "回到笔记",
      sourceTypeLabel: "笔记",
      sourceId,
      learningStepLabel: "笔记沉淀",
      description: "回到笔记补充原始思路，再把已整理的节点继续连接到图谱和卡片。"
    };
  }

  if (sourceType === "card") {
    return {
      target,
      actionLabel: "去复习页",
      sourceTypeLabel: "卡片",
      sourceId,
      learningStepLabel: "卡片复习",
      description: "回到复习卡片检查记忆结果，并把复习反馈继续沉淀回图谱。"
    };
  }

  if (sourceType === "graph") {
    return {
      target,
      actionLabel: "回到图谱",
      sourceTypeLabel: "图谱",
      sourceId,
      learningStepLabel: "图谱整理",
      description: "回到图谱节点的上下文位置，继续整理知识关系并结合复习反馈修正理解。"
    };
  }

  if (sourceType === "annotation") {
    return {
      target,
      actionLabel: "回到批注",
      sourceTypeLabel: "批注",
      sourceId,
      learningStepLabel: "资料批注",
      description: "回到 PDF 或资料批注定位原句，再确认该节点是否需要生成复习卡片。"
    };
  }

  if (sourceType === "pdf-anchor") {
    return {
      target,
      actionLabel: "回到 PDF 页",
      sourceTypeLabel: "PDF 锚点",
      sourceId,
      learningStepLabel: "PDF 锚点",
      description: "回到 PDF 定位页码和锚点，核对材料上下文后继续组织图谱。"
    };
  }

  if (sourceType === "ai-draft") {
    return {
      target,
      actionLabel: "查看 AI 草稿",
      sourceTypeLabel: "AI 草稿",
      sourceId,
      learningStepLabel: "AI 草稿确认",
      description: "回到 AI 草稿确认生成内容，再把确认后的知识点沉淀为卡片或图谱节点。"
    };
  }

  if (sourceType === "ai-task" || sourceType === "ai") {
    return {
      target,
      actionLabel: "查看 AI 任务",
      sourceTypeLabel: "AI",
      sourceId,
      learningStepLabel: "AI 任务追踪",
      description: "回到 AI 任务查看生成依据，并把确认后的结果纳入图谱学习闭环。"
    };
  }

  return null;
}
