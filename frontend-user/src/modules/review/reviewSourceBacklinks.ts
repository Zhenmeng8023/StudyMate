import type { CardPayload } from "../../api/client";
import { buildGraphSourceBacklinkFromSource, type GraphSourceBacklink } from "../graph/lib/graphSourceBacklinks";

type CardSourceLike = Pick<CardPayload, "sourceType" | "sourceId" | "sourceMetadata"> | null | undefined;

export function buildReviewSourceBacklink(card: CardSourceLike): GraphSourceBacklink | null {
  const sourceType = card?.sourceType?.trim();
  const sourceId = card?.sourceId?.trim();
  if (!sourceType || !sourceId) {
    return null;
  }

  return buildGraphSourceBacklinkFromSource(
    {
      type: sourceType,
      id: sourceId,
      label: "",
      excerpt: ""
    },
    card?.sourceMetadata
  );
}

export function formatReviewSourceReference(card: CardSourceLike) {
  const sourceType = normalizeSourceType(card?.sourceType);
  const sourceId = card?.sourceId?.trim();
  if (!sourceType || !sourceId) {
    return "";
  }

  return `${getReviewSourceTypeLabel(sourceType)} / ${sourceId}`;
}

function normalizeSourceType(sourceType: string | undefined) {
  return sourceType?.trim().toLowerCase().replace(/_/g, "-") ?? "";
}

function getReviewSourceTypeLabel(sourceType: string) {
  switch (sourceType) {
    case "note":
      return "笔记";
    case "material":
      return "资料";
    case "card":
      return "卡片";
    case "graph":
      return "图谱";
    case "annotation":
      return "批注";
    case "pdf-anchor":
      return "PDF 锚点";
    case "ai-draft":
      return "AI 草稿";
    case "ai-task":
    case "ai":
      return "AI";
    case "diagram":
      return "图谱模板";
    default:
      return sourceType;
  }
}
