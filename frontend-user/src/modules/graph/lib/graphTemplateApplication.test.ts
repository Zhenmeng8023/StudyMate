import { describe, expect, it } from "vitest";
import type { DiagramTemplatePayload } from "../../../api/client";
import { buildGraphTemplateImportDraft } from "./graphTemplateApplication";

function template(overrides: Partial<DiagramTemplatePayload> = {}): DiagramTemplatePayload {
  return {
    id: "learning-material-map",
    name: "学习资料梳理",
    category: "learning-material",
    description: "把资料、批注、笔记和待理解概念组织成一条可追溯学习链。",
    mode: "learning",
    sampleLines: ["资料主线", "关键批注", "沉淀笔记"],
    ...overrides
  };
}

describe("buildGraphTemplateImportDraft", () => {
  it("keeps learning templates as Markdown outlines", () => {
    expect(buildGraphTemplateImportDraft(template())).toEqual({
      importMode: "markdown",
      importSource: "# 资料主线\n## 关键批注\n## 沉淀笔记",
      status: "已把模板“学习资料梳理”放入导入面板"
    });
  });

  it("converts diagram templates into Mermaid flowchart drafts", () => {
    expect(
      buildGraphTemplateImportDraft(
        template({
          id: "uml-class-diagram",
          name: "UML 类图",
          category: "uml",
          mode: "diagram",
          sampleLines: ["领域模型", "核心类", "接口契约"]
        })
      )
    ).toEqual({
      importMode: "mermaid",
      importSource: "flowchart TD\n  T1[领域模型] --> T2[核心类]\n  T2[核心类] --> T3[接口契约]",
      status: "已把工程图模板“UML 类图”作为 Mermaid 草稿放入导入面板"
    });
  });
});
