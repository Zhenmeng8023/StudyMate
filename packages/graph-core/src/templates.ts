import type { GraphDocument, LearningGraphTemplate } from "./model.ts";
import { supportedGraphSchemaVersion } from "./model.ts";

export function getLearningGraphTemplates(): LearningGraphTemplate[] {
  return [
    buildLearningTemplate("learning-material-map", "学习资料梳理", "learning-material", [
      ["material", "资料主线", "material"],
      ["annotation", "关键批注", "annotation"],
      ["note", "沉淀笔记", "note"],
      ["concept", "待理解概念", "free"]
    ]),
    buildLearningTemplate("book-notes-map", "读书笔记", "book-notes", [
      ["material", "书籍/章节", "material"],
      ["note", "章节摘要", "note"],
      ["concept", "核心观点", "free"],
      ["concept", "问题与反思", "free"]
    ]),
    buildLearningTemplate("concept-network", "概念网络", "concept-network", [
      ["concept", "核心概念", "free"],
      ["concept", "前置概念", "free"],
      ["concept", "相关概念", "free"],
      ["ai", "AI 解释草稿", "ai"]
    ]),
    buildLearningTemplate("review-card-prep", "复习卡片准备", "review-card", [
      ["note", "复习来源笔记", "note"],
      ["concept", "可提问知识点", "free"],
      ["card", "卡片草稿", "card"],
      ["concept", "易混淆点", "free"]
    ])
  ];
}

function buildLearningTemplate(
  id: string,
  name: string,
  category: LearningGraphTemplate["category"],
  seeds: Array<[type: string, title: string, sourceType: string]>
): LearningGraphTemplate {
  const nodes = seeds.map(([type, title, sourceType], index) => ({
    id: `${id}-node-${index + 1}`,
    type,
    title,
    x: 140 + index * 260,
    y: index % 2 === 0 ? 140 : 320,
    width: 230,
    height: 120,
    source:
      sourceType === "free"
        ? null
        : {
            type: sourceType,
            id: `${sourceType}-placeholder`,
            label: `${title}来源`
          },
    metadata: { templateId: id }
  }));
  const edges = nodes.slice(1).map((node, index) => ({
    id: `${id}-edge-${index + 1}`,
    kind: "curve",
    sourceNodeId: nodes[index].id,
    targetNodeId: node.id,
    label: "学习关联"
  }));
  const document: GraphDocument = {
    id,
    version: 1,
    schemaVersion: supportedGraphSchemaVersion,
    viewport: { x: 120, y: 90, zoom: 1 },
    nodes,
    edges,
    groups: [
      {
        id: `${id}-group`,
        title: name,
        nodeIds: nodes.map((node) => node.id),
        x: 100,
        y: 100,
        width: Math.max(780, nodes.length * 260),
        height: 460,
        collapsed: false,
        metadata: { templateId: id }
      }
    ],
    theme: { template: category },
    metadata: { templateId: id, templateName: name }
  };

  return {
    id,
    name,
    category,
    description: `${name}模板，用于把资料、笔记、概念和复习行动连接成学习闭环。`,
    document
  };
}
