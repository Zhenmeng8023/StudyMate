import type { DiagramTemplatePayload } from "../../../api/client";
import type { ImportMode } from "./workspaceControllerHelpers";

export type GraphTemplateImportDraft = {
  importMode: ImportMode;
  importSource: string;
  status: string;
};

export function buildGraphTemplateImportDraft(template: DiagramTemplatePayload): GraphTemplateImportDraft {
  if (template.mode === "diagram") {
    return {
      importMode: "mermaid",
      importSource: buildMermaidTemplateSource(template.sampleLines),
      status: `已把工程图模板“${template.name}”作为 Mermaid 草稿放入导入面板`
    };
  }

  return {
    importMode: "markdown",
    importSource: template.sampleLines.map((line, index) => `${index === 0 ? "#" : "##"} ${line}`).join("\n"),
    status: `已把模板“${template.name}”放入导入面板`
  };
}

function buildMermaidTemplateSource(sampleLines: string[]) {
  const lines = sampleLines.map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    return "flowchart TD";
  }
  if (lines.length === 1) {
    return `flowchart TD\n  T1[${lines[0]}]`;
  }

  const edges = lines.slice(1).map((line, index) => {
    const sourceIndex = index + 1;
    const targetIndex = index + 2;
    return `  T${sourceIndex}[${lines[index]}] --> T${targetIndex}[${line}]`;
  });
  return ["flowchart TD", ...edges].join("\n");
}
