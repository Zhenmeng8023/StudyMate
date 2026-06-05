import { useCallback } from "react";
import { sanitizeGraphExportFilename } from "@studymate/graph-core";
import {
  importGraphMarkdown,
  importGraphMermaid
} from "../../../api/client";
import type {
  AuthSession,
  GraphDetailPayload,
  GraphDocumentPayload,
  GraphNodePayload,
  GraphValidationIssuePayload,
  MaterialPayload,
  NotePayload
} from "../../../api/client";
import { renderGraphPngBlobFromSvg } from "../lib/graphCanvasExport";
import {
  buildGraphImportSourceTargets,
  buildGraphJsonExport,
  parseGraphJsonImport,
  toGraphValidationIssues
} from "../lib/graphFileImportExport";
import {
  buildSvgExport,
  downloadBlob,
  downloadTextFile,
  normalizeDocument,
  stageHeight,
  stageWidth,
  type ImportMode
} from "../lib/workspaceControllerHelpers";
import type { GraphWorkspaceSaveState } from "../state/types";

type ApplyDocumentOptions = {
  captureHistory?: boolean;
  label?: string;
  status?: string;
};

type GraphImportExportOptions = {
  blobDownloader?: (filename: string, blob: Blob) => void;
  graphDetail: GraphDetailPayload | null;
  hiddenNodeIds: Set<string>;
  importMode: ImportMode;
  importSource: string;
  loadSnapshots: (graphId: string) => Promise<boolean>;
  materials: MaterialPayload[];
  nodeMap: Map<string, GraphNodePayload>;
  notes: NotePayload[];
  onApplyDocument: (document: GraphDocumentPayload, options?: ApplyDocumentOptions) => void;
  onResetHistory: (detail: GraphDetailPayload, label?: string) => void;
  onSaveStateChange: (saveState: GraphWorkspaceSaveState) => void;
  onSavingChange: (saving: boolean) => void;
  onStatusMessage: (message: string) => void;
  onValidationIssuesChange: (issues: GraphValidationIssuePayload[]) => void;
  pngRenderer?: (svg: string) => Promise<Blob>;
  session: AuthSession;
  textDownloader?: (filename: string, content: string, mimeType: string) => void;
};

export function useGraphImportExport(options: GraphImportExportOptions) {
  const textDownloader = options.textDownloader ?? downloadTextFile;
  const blobDownloader = options.blobDownloader ?? downloadBlob;
  const pngRenderer =
    options.pngRenderer ??
    ((svg: string) =>
      renderGraphPngBlobFromSvg(svg, {
        background: "#f9f6ef",
        height: stageHeight,
        width: stageWidth
      }));

  const exportPng = useCallback(async () => {
    if (!options.graphDetail) {
      return;
    }

    try {
      const svg = buildSvgExport(options.graphDetail, options.nodeMap, options.hiddenNodeIds);
      const blob = await pngRenderer(svg);
      blobDownloader(buildAssetExportFilename(options.graphDetail.title, "png"), blob);
      options.onStatusMessage("已导出 PNG 图谱");
    } catch {
      options.onStatusMessage("导出 PNG 失败");
    }
  }, [blobDownloader, options, pngRenderer]);

  const exportSvg = useCallback(() => {
    if (!options.graphDetail) {
      return;
    }

    try {
      const svg = buildSvgExport(options.graphDetail, options.nodeMap, options.hiddenNodeIds);
      textDownloader(buildAssetExportFilename(options.graphDetail.title, "svg"), svg, "image/svg+xml;charset=utf-8");
      options.onStatusMessage("已导出 SVG 图谱");
    } catch {
      options.onStatusMessage("导出 SVG 失败");
    }
  }, [options, textDownloader]);

  const exportJson = useCallback(() => {
    if (!options.graphDetail) {
      return;
    }

    try {
      const exported = buildGraphJsonExport(options.graphDetail);
      textDownloader(exported.filename, exported.content, exported.mimeType);
      options.onStatusMessage("已导出 StudyMate 图谱 JSON");
    } catch {
      options.onStatusMessage("导出 StudyMate JSON 失败");
    }
  }, [options, textDownloader]);

  const importGraph = useCallback(async () => {
    if (!options.graphDetail) {
      return;
    }

    if (!options.importSource.trim()) {
      options.onStatusMessage("先填写 Markdown、Mermaid 或 StudyMate JSON 内容");
      return;
    }

    options.onSavingChange(true);
    try {
      if (options.importMode === "json") {
        importGraphJson(options);
        return;
      }

      const payload =
        options.importMode === "markdown"
          ? await importGraphMarkdown(options.session, options.graphDetail.id, options.importSource)
          : await importGraphMermaid(options.session, options.graphDetail.id, options.importSource);
      const normalized = {
        ...payload,
        document: normalizeDocument(payload.id, payload.currentVersion, payload.document)
      };
      options.onResetHistory(
        normalized,
        options.importMode === "markdown" ? "导入 Markdown 大纲" : "导入 Mermaid 草稿"
      );
      await options.loadSnapshots(normalized.id);
      options.onSaveStateChange("saved");
      options.onStatusMessage(options.importMode === "markdown" ? "已导入 Markdown 大纲" : "已导入 Mermaid 草稿");
    } catch (error) {
      options.onSaveStateChange("failed");
      options.onStatusMessage(error instanceof Error ? error.message : "导入图谱失败");
    } finally {
      options.onSavingChange(false);
    }
  }, [options]);

  return {
    exportJson,
    exportPng,
    exportSvg,
    importGraph
  };
}

function importGraphJson(options: GraphImportExportOptions) {
  if (!options.graphDetail) {
    return;
  }

  const imported = parseGraphJsonImport(options.importSource, options.graphDetail.document, {
    sourceTargets: buildGraphImportSourceTargets({
      currentDocument: options.graphDetail.document,
      materials: options.materials,
      notes: options.notes
    })
  });
  const issues = toGraphValidationIssues(imported.issues);
  const errors = issues.filter((issue) => issue.severity === "error");
  options.onValidationIssuesChange(issues);
  if (errors.length > 0) {
    options.onSaveStateChange("failed");
    options.onStatusMessage(`导入 JSON 失败：发现 ${errors.length} 条结构错误`);
    return;
  }

  options.onApplyDocument(imported.document, {
    captureHistory: true,
    label: "导入 StudyMate 图谱 JSON",
    status: issues.length ? `已导入 JSON，另有 ${issues.length} 条校验提示` : "已导入 StudyMate 图谱 JSON"
  });
}

function buildAssetExportFilename(title: string, extension: "png" | "svg") {
  return `${sanitizeGraphExportFilename(title, "graph")}.${extension}`;
}
