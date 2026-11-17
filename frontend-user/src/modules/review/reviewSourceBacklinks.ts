import type { CardPayload } from "../../api/client";
import { buildSourceLinkReadModel, normalizeSourceType } from "../../features/sources/sourceLinks";
import { buildGraphSourceBacklinkFromSource, type GraphSourceBacklink } from "../graph/lib/graphSourceBacklinks";

type CardSourceLike =
  | Pick<CardPayload, "sourceType" | "sourceId" | "sourceMetadata" | "primarySourceLink" | "sourceLinks">
  | null
  | undefined;

export function buildReviewSourceBacklink(card: CardSourceLike): GraphSourceBacklink | null {
  const sourceLink = buildSourceLinkReadModel(card ?? {});
  if (!sourceLink) {
    return null;
  }

  return buildGraphSourceBacklinkFromSource(
    {
      type: sourceLink.sourceType,
      id: sourceLink.sourceId,
      label: "",
      excerpt: ""
    },
    {
      ...(sourceLink.locator ?? {}),
      ...(sourceLink.metadata ?? {}),
      ...(sourceLink.title ? { title: sourceLink.title } : {}),
      ...(sourceLink.excerpt ? { excerpt: sourceLink.excerpt } : {})
    }
  );
}

export function formatReviewSourceReference(card: CardSourceLike) {
  const sourceLink = buildSourceLinkReadModel(card ?? {});
  const sourceType = normalizeSourceType(sourceLink?.sourceType);
  const sourceId = sourceLink?.sourceId?.trim();
  if (!sourceType || !sourceId) {
    return "";
  }

  return `${getReviewSourceTypeLabel(sourceType)} / ${sourceId}`;
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
