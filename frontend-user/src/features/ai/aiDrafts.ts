import type { AiDraftPayload, AiTaskPayload, GraphDetailPayload } from "../../api/client";

export function buildCardInputsFromAiDrafts(drafts: AiDraftPayload[]) {
  return drafts.map((draft) => ({
    cardType: "basic",
    draftId: draft.id,
    front: draft.front,
    back: draft.back,
    sourceType: draft.sourceType,
    sourceId: draft.sourceId,
    sourceMetadata: draft.metadata
  }));
}

export function formatAiTaskLabel(taskType: string) {
  switch (taskType) {
    case "graph.generate_cards":
      return "图谱生成卡片草稿";
    case "note.generate_cards":
      return "笔记生成卡片草稿";
    case "reader.generate_cards":
      return "批注生成卡片草稿";
    default:
      return taskType;
  }
}

export function formatAiSourceLabel(task: AiTaskPayload) {
  switch (task.sourceType) {
    case "graph":
      return `图谱 ${task.sourceId || ""}`.trim();
    case "note":
      return `笔记 ${task.sourceId || ""}`.trim();
    case "material":
      return `资料 ${task.sourceId || ""}`.trim();
    default:
      return task.sourceId || "未关联来源";
  }
}

export function formatAiStatusLabel(status: string) {
  switch (status) {
    case "completed":
    case "confirmed":
      return "已完成";
    case "failed":
      return "失败";
    default:
      return "进行中";
  }
}

export function formatAiDraftTarget(draft: AiDraftPayload) {
  if (draft.draftType === "graph_change") {
    if (draft.sourceType === "note") {
      return `来自笔记 ${draft.sourceId || ""}`.trim();
    }
    if (draft.sourceType === "material") {
      return `来自资料 ${draft.sourceId || ""}`.trim();
    }
  }

  switch (draft.targetType) {
    case "graph":
      return `图谱 ${draft.targetId}`;
    case "note":
      return `笔记 ${draft.targetId}`;
    case "material":
      return `资料 ${draft.targetId}`;
    default:
      return draft.targetId;
  }
}

export function buildAiDraftWorkspacePath(draft: AiDraftPayload) {
  switch (draft.sourceType || draft.targetType) {
    case "graph":
      return "/graph";
    case "note":
      return `/notes?selected=${encodeURIComponent(draft.sourceId || draft.targetId)}`;
    case "material":
      return `/reader/${encodeURIComponent(draft.sourceId || draft.targetId)}`;
    default:
      return "";
  }
}

export function getAiDraftSourceKey(draft: AiDraftPayload) {
  return draft.sourceType || draft.targetType || "unknown";
}

export function getAiDraftMetadataList(draft: AiDraftPayload, key: string) {
  const value = draft.metadata?.[key];
  return Array.isArray(value) ? value : [];
}

export function getAiDraftGraphSummary(draft: AiDraftPayload) {
  const value = draft.metadata?.summary;
  return typeof value === "string" ? value : "";
}

export function getAiDraftNodeTitles(draft: AiDraftPayload) {
  return getAiDraftMetadataList(draft, "nodes")
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }
      const title = "title" in item ? item.title : "";
      return typeof title === "string" ? title.trim() : "";
    })
    .filter(Boolean);
}

export function getAiDraftEdgeLabels(draft: AiDraftPayload) {
  return getAiDraftMetadataList(draft, "edges")
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }
      const label = "label" in item ? item.label : "";
      return typeof label === "string" && label.trim() ? label.trim() : "未命名连线";
    })
    .filter(Boolean);
}

export function getAiDraftNodeIds(draft: AiDraftPayload) {
  return getAiDraftMetadataList(draft, "nodes")
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }
      const id = "id" in item ? item.id : "";
      return typeof id === "string" ? id.trim() : "";
    })
    .filter(Boolean);
}

export function getAiDraftNodeEntries(draft: AiDraftPayload) {
  return getAiDraftMetadataList(draft, "nodes")
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const rawId = "id" in item ? item.id : "";
      const rawTitle = "title" in item ? item.title : "";
      const rawX = "x" in item ? item.x : 0;
      const rawY = "y" in item ? item.y : 0;
      const rawWidth = "width" in item ? item.width : 240;
      const rawHeight = "height" in item ? item.height : 120;
      const id = typeof rawId === "string" ? rawId.trim() : "";
      const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
      if (!id || !title) {
        return null;
      }
      return {
        id,
        title,
        x: typeof rawX === "number" ? rawX : 0,
        y: typeof rawY === "number" ? rawY : 0,
        width: typeof rawWidth === "number" ? rawWidth : 240,
        height: typeof rawHeight === "number" ? rawHeight : 120
      };
    })
    .filter(
      (
        item
      ): item is { id: string; title: string; x: number; y: number; width: number; height: number } => Boolean(item)
    );
}

export function estimateAiDraftNodePlacement(
  node: { x: number; y: number; height: number },
  graphDetail: GraphDetailPayload | null
) {
  const existingNodes = graphDetail?.document.nodes || [];
  const nextY = existingNodes.length
    ? Math.max(...existingNodes.map((item) => item.y + item.height)) + 80
    : 0;
  const x = Math.round(node.x);
  const y = Math.round(nextY + node.y);
  const zone = x < 240 ? "左侧" : x < 520 ? "中部" : "右侧";
  return { x, y, zone };
}

export function findSimilarGraphTitles(title: string, graphDetail: GraphDetailPayload | null) {
  if (!graphDetail) {
    return [];
  }

  const keyword = title.trim().toLowerCase();
  if (!keyword) {
    return [];
  }

  return graphDetail.document.nodes
    .map((node) => node.title.trim())
    .filter(Boolean)
    .filter((candidate) => {
      const normalized = candidate.toLowerCase();
      return normalized === keyword || normalized.includes(keyword) || keyword.includes(normalized);
    })
    .slice(0, 3);
}

export function buildGraphFocusLink(
  node: { title: string; x: number; y: number; width: number; height: number },
  graphDetail: GraphDetailPayload | null
) {
  const placement = estimateAiDraftNodePlacement(node, graphDetail);
  return {
    focusPreview: {
      x: placement.x,
      y: placement.y,
      width: Math.round(node.width),
      height: Math.round(node.height),
      label: node.title
    }
  };
}
