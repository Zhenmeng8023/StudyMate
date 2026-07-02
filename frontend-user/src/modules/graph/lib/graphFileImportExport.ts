import {
  parseStudymateGraphJson,
  sanitizeGraphExportFilename,
  serializeStudymateGraphJson,
  studymateGraphExtension,
  studymateGraphMimeType,
  type GraphDocument,
  type GraphValidationIssue
} from "@studymate/graph-core";
import type {
  GraphDetailPayload,
  GraphDocumentPayload,
  GraphNodePayload,
  GraphValidationIssuePayload,
  MaterialPayload,
  NotePayload
} from "../../../api/client";
import { buildSvgExport, normalizeDocument } from "./workspaceControllerHelpers";

type GraphJsonExportOptions = {
  detail: GraphDetailPayload;
  kind: "json";
};

type GraphSvgExportOptions = {
  detail: GraphDetailPayload;
  hiddenNodeIds: Set<string>;
  kind: "svg";
  nodeMap: Map<string, GraphNodePayload>;
};

type GraphRemoteImportMode = "markdown" | "mermaid";

export type GraphJsonImportResult = {
  appliedLabel: string;
  blockingIssueCount: number;
  document: GraphDocumentPayload;
  issues: GraphValidationIssue[];
  issuePayloads: GraphValidationIssuePayload[];
  statusMessage: string;
};

export type GraphRemoteImportOutcome = {
  detail: GraphDetailPayload;
  resetLabel: string;
  statusMessage: string;
};

export type GraphValidationOutcome = {
  issues: GraphValidationIssuePayload[];
  statusMessage: string;
};

export function buildGraphExportArtifact(
  options: GraphJsonExportOptions | GraphSvgExportOptions,
  exportedAt = new Date().toISOString()
) {
  if (options.kind === "json") {
    const coreDocument = toCoreGraphDocument(options.detail.document);
    return {
      filename: buildGraphAssetExportFilename(options.detail.title, studymateGraphExtension.slice(1)),
      mimeType: studymateGraphMimeType,
      content: serializeStudymateGraphJson(coreDocument, {
        exportedAt,
        graphId: options.detail.id,
        title: options.detail.title,
        app: "StudyMate"
      })
    };
  }

  return {
    filename: buildGraphAssetExportFilename(options.detail.title, "svg"),
    mimeType: "image/svg+xml;charset=utf-8",
    content: buildSvgExport(options.detail, options.nodeMap, options.hiddenNodeIds)
  };
}

export function parseGraphJsonImport(
  content: string,
  currentDocument: GraphDocumentPayload,
  options: { sourceTargets?: Set<string> } = {}
): GraphJsonImportResult {
  const parsed = parseStudymateGraphJson(content, {
    graphId: currentDocument.graphId,
    version: currentDocument.version,
    sourceTargets: options.sourceTargets
  });
  const issuePayloads = toGraphValidationIssues(parsed.issues);
  const blockingIssueCount = issuePayloads.filter((issue) => issue.severity === "error").length;

  return {
    appliedLabel: "导入 StudyMate 图谱 JSON",
    blockingIssueCount,
    document: fromCoreGraphDocument(parsed.document, currentDocument),
    issues: parsed.issues,
    issuePayloads,
    statusMessage:
      blockingIssueCount > 0
        ? `导入 JSON 失败：发现 ${blockingIssueCount} 条结构错误`
        : issuePayloads.length > 0
          ? `已导入 JSON，另有 ${issuePayloads.length} 条校验提示`
          : "已导入 StudyMate 图谱 JSON"
  };
}

export function buildRemoteGraphImportOutcome(
  detail: GraphDetailPayload,
  mode: GraphRemoteImportMode
): GraphRemoteImportOutcome {
  const normalizedDetail = {
    ...detail,
    document: normalizeDocument(detail.id, detail.currentVersion, detail.document)
  };

  return {
    detail: normalizedDetail,
    resetLabel: mode === "markdown" ? "导入 Markdown 大纲" : "导入 Mermaid 草稿",
    statusMessage: mode === "markdown" ? "已导入 Markdown 大纲" : "已导入 Mermaid 草稿"
  };
}

export function buildGraphValidationOutcome(issues: GraphValidationIssuePayload[]): GraphValidationOutcome {
  return {
    issues,
    statusMessage: issues.length > 0 ? `发现 ${issues.length} 条校验提示` : "图谱校验通过"
  };
}

export function buildGraphImportSourceTargets(input: {
  currentDocument: GraphDocumentPayload;
  materials?: MaterialPayload[];
  notes?: NotePayload[];
}) {
  const targets = new Set<string>();
  for (const node of input.currentDocument.nodes) {
    if (node.source?.type && node.source.id) {
      targets.add(`${node.source.type.trim().toLowerCase()}:${node.source.id.trim()}`);
    }
  }
  for (const material of input.materials ?? []) {
    targets.add(`material:${material.id}`);
  }
  for (const note of input.notes ?? []) {
    targets.add(`note:${note.id}`);
  }

  return targets;
}

export function toGraphValidationIssues(issues: GraphValidationIssue[]): GraphValidationIssuePayload[] {
  return issues.map((issue) => ({
    ruleType: issue.ruleType,
    message: issue.message,
    targetId: issue.targetId,
    severity: issue.severity
  }));
}

export function toCoreGraphDocument(document: GraphDocumentPayload): GraphDocument {
  return {
    id: document.graphId,
    version: document.version,
    schemaVersion: document.schemaVersion,
    viewport: { ...document.viewport },
    nodes: document.nodes.map((node) => ({
      ...node,
      source: node.source
        ? {
            type: node.source.type ?? "",
            id: node.source.id ?? "",
            label: node.source.label,
            excerpt: node.source.excerpt
          }
        : null,
      metadata: node.metadata ? { ...node.metadata } : undefined
    })),
    edges: document.edges.map((edge) => ({
      ...edge,
      metadata: edge.metadata ? { ...edge.metadata } : undefined
    })),
    groups: document.groups.map((group) => ({
      ...group,
      nodeIds: [...group.nodeIds],
      metadata: group.metadata ? { ...group.metadata } : undefined
    })),
    theme: document.theme ? { ...document.theme } : {},
    metadata: document.metadata ? { ...document.metadata } : {}
  };
}

function fromCoreGraphDocument(document: GraphDocument, currentDocument: GraphDocumentPayload): GraphDocumentPayload {
  return {
    graphId: currentDocument.graphId,
    version: currentDocument.version,
    schemaVersion: document.schemaVersion ?? currentDocument.schemaVersion ?? 1,
    viewport: { ...document.viewport },
    nodes: document.nodes.map((node) => ({
      ...node,
      source: node.source
        ? {
            type: node.source.type ?? "",
            id: node.source.id ?? "",
            label: node.source.label,
            excerpt: node.source.excerpt
          }
        : null,
      metadata: node.metadata ? { ...node.metadata } : undefined
    })),
    edges: document.edges.map((edge) => ({
      ...edge,
      kind: edge.kind,
      metadata: edge.metadata ? { ...edge.metadata } : undefined
    })),
    groups: document.groups.map((group) => ({
      ...group,
      nodeIds: [...group.nodeIds],
      metadata: group.metadata ? { ...group.metadata } : undefined
    })),
    theme: document.theme ? { ...document.theme } : {},
    metadata: {
      ...(document.metadata ?? {}),
      importedFrom: "studymate-graph-json"
    }
  };
}

function buildGraphAssetExportFilename(title: string, extension: string) {
  return `${sanitizeGraphExportFilename(title, "graph")}.${extension}`;
}
