import type { GraphNodePayload } from "../../../api/client";

export type GraphNodeMetadataField =
  | "url"
  | "imageUrl"
  | "altText"
  | "formula"
  | "pdfPage"
  | "pdfAnchor"
  | "materialId"
  | "materialUrl"
  | "noteId"
  | "cardId"
  | "deckId"
  | "aiDraftId"
  | "aiTaskId"
  | "diagramKind"
  | "diagramShape"
  | "diagramSourceId";

export type GraphNodeMetadataContent = Partial<Record<GraphNodeMetadataField, string>>;

export function getGraphNodeMetadataContent(node: GraphNodePayload): GraphNodeMetadataContent {
  const content = node.metadata?.content;
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(content as Record<string, unknown>)
      .filter(([, value]) => typeof value === "string")
      .map(([key, value]) => [key, value as string])
  ) as GraphNodeMetadataContent;
}

export function getGraphNodeMetadataField(node: GraphNodePayload, field: GraphNodeMetadataField): string {
  return getGraphNodeMetadataContent(node)[field] ?? "";
}

export function patchGraphNodeMetadataField(
  node: GraphNodePayload,
  field: GraphNodeMetadataField,
  value: string
): GraphNodePayload {
  const nextMetadata = { ...(node.metadata ?? {}) };
  const nextContent = { ...getGraphNodeMetadataContent(node) };
  const normalized = field === "pdfPage" ? normalizePdfPage(value) : value.trim();

  if (normalized) {
    nextContent[field] = normalized;
  } else {
    delete nextContent[field];
  }

  if (Object.keys(nextContent).length > 0) {
    nextMetadata.content = nextContent;
  } else {
    delete nextMetadata.content;
  }

  return {
    ...node,
    metadata: nextMetadata
  };
}

export function getGraphNodeMetadataEditorFields(node: GraphNodePayload): Array<{
  field: GraphNodeMetadataField;
  label: string;
  placeholder: string;
}> {
  switch (node.type) {
    case "image":
      return [
        { field: "imageUrl", label: "图片地址", placeholder: "https://..." },
        { field: "altText", label: "替代文本", placeholder: "图片内容说明" }
      ];
    case "url":
      return [{ field: "url", label: "URL", placeholder: "https://..." }];
    case "formula":
      return [{ field: "formula", label: "公式 LaTeX", placeholder: "E = mc^2" }];
    case "pdf-anchor":
      return [
        { field: "pdfPage", label: "PDF 页码", placeholder: "12" },
        { field: "pdfAnchor", label: "PDF 锚点", placeholder: "章节、批注或坐标" }
      ];
    case "material":
      return [
        { field: "materialId", label: "资料 ID", placeholder: "material-..." },
        { field: "materialUrl", label: "资料 URL", placeholder: "https://..." }
      ];
    case "rich-note":
      return [{ field: "noteId", label: "笔记 ID", placeholder: "note-..." }];
    case "card":
      return [
        { field: "cardId", label: "卡片 ID", placeholder: "card-..." },
        { field: "deckId", label: "卡组 ID", placeholder: "deck-..." }
      ];
    case "ai":
      return [
        { field: "aiDraftId", label: "AI 草稿 ID", placeholder: "draft-..." },
        { field: "aiTaskId", label: "AI 任务 ID", placeholder: "task-..." }
      ];
    case "diagram":
      return [
        { field: "diagramKind", label: "工程图类型", placeholder: "UML / ERD / C4 / Flowchart" },
        { field: "diagramShape", label: "图形类型", placeholder: "class / entity / component / step" },
        { field: "diagramSourceId", label: "导入来源 ID", placeholder: "import-..." }
      ];
    default:
      return [];
  }
}

function normalizePdfPage(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const page = Number.parseInt(trimmed, 10);
  return Number.isFinite(page) && page > 0 ? String(page) : "";
}
