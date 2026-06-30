import type { GraphNodePayload } from "../../../api/types";

export type GraphNodeCreationType =
  | "text"
  | "rich-note"
  | "material"
  | "card"
  | "ai"
  | "image"
  | "url"
  | "formula"
  | "pdf-anchor"
  | "diagram";

export interface GraphNodeTypeOption {
  defaultTitle: string;
  height: number;
  label: string;
  type: GraphNodeCreationType;
  width: number;
}

export const graphNodeTypeOptions: GraphNodeTypeOption[] = [
  { type: "text", label: "概念", defaultTitle: "新概念", width: 220, height: 132 },
  { type: "rich-note", label: "笔记", defaultTitle: "笔记节点", width: 250, height: 132 },
  { type: "material", label: "资料", defaultTitle: "资料节点", width: 250, height: 132 },
  { type: "card", label: "卡片", defaultTitle: "复习卡片", width: 250, height: 110 },
  { type: "ai", label: "AI", defaultTitle: "AI 理解节点", width: 250, height: 132 },
  { type: "image", label: "图片", defaultTitle: "图片节点", width: 250, height: 132 },
  { type: "url", label: "URL", defaultTitle: "URL 节点", width: 250, height: 132 },
  { type: "formula", label: "公式", defaultTitle: "公式节点", width: 250, height: 132 },
  { type: "pdf-anchor", label: "PDF 锚点", defaultTitle: "PDF 锚点", width: 250, height: 132 },
  { type: "diagram", label: "工程图", defaultTitle: "工程图节点", width: 280, height: 160 }
];

export function getGraphNodeTypeOption(type: GraphNodeCreationType) {
  return graphNodeTypeOptions.find((option) => option.type === type) ?? graphNodeTypeOptions[0];
}

export function buildGraphNodeDraft(input: {
  id: string;
  position: Pick<GraphNodePayload, "x" | "y">;
  source?: GraphNodePayload["source"];
  type: GraphNodeCreationType;
}): GraphNodePayload {
  const option = getGraphNodeTypeOption(input.type);
  return {
    id: input.id,
    type: input.type,
    title: input.source?.label || option.defaultTitle,
    x: input.position.x,
    y: input.position.y,
    width: option.width,
    height: option.height,
    source: input.source ?? null,
    metadata: {}
  };
}
