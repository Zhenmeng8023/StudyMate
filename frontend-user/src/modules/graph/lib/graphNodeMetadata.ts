import type { GraphNodePayload } from "../../../api/client";

export type GraphNodeMetadataField =
  | "url"
  | "imageUrl"
  | "altText"
  | "formula"
  | "pdfPage"
  | "pdfAnchor";

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
