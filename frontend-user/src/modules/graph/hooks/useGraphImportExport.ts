import { useCallback } from "react";
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
  buildGraphExportArtifact,
  buildGraphImportSourceTargets,
  buildRemoteGraphImportOutcome,
  parseGraphJsonImport
} from "../lib/graphFileImportExport";
import {
  downloadBlob,
  downloadTextFile,
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
      const svgExport = buildGraphExportArtifact({
        detail: options.graphDetail,
        hiddenNodeIds: options.hiddenNodeIds,
        kind: "svg",
        nodeMap: options.nodeMap
      });
      const blob = await pngRenderer(svgExport.content);
      blobDownloader(svgExport.filename.replace(/\.svg$/u, ".png"), blob);
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
      const exported = buildGraphExportArtifact({
        detail: options.graphDetail,
        hiddenNodeIds: options.hiddenNodeIds,
        kind: "svg",
        nodeMap: options.nodeMap
      });
      textDownloader(exported.filename, exported.content, exported.mimeType);
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
      const exported = buildGraphExportArtifact({ detail: options.graphDetail, kind: "json" });
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
        const imported = parseGraphJsonImport(options.importSource, options.graphDetail.document, {
          sourceTargets: buildGraphImportSourceTargets({
            currentDocument: options.graphDetail.document,
            materials: options.materials,
            notes: options.notes
          })
        });
        options.onValidationIssuesChange(imported.issuePayloads);
        if (imported.blockingIssueCount > 0) {
          options.onSaveStateChange("failed");
          options.onStatusMessage(imported.statusMessage);
          return;
        }

        options.onApplyDocument(imported.document, {
          captureHistory: true,
          label: imported.appliedLabel,
          status: imported.statusMessage
        });
        return;
      }

      const payload =
        options.importMode === "markdown"
          ? await importGraphMarkdown(options.session, options.graphDetail.id, options.importSource)
          : await importGraphMermaid(options.session, options.graphDetail.id, options.importSource);
      const imported = buildRemoteGraphImportOutcome(payload, options.importMode);

      options.onResetHistory(imported.detail, imported.resetLabel);
      await options.loadSnapshots(imported.detail.id);
      options.onSaveStateChange("saved");
      options.onStatusMessage(imported.statusMessage);
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
