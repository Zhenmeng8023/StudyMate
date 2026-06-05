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
  GraphValidationIssuePayload
} from "../../../api/client";

export function buildGraphJsonExport(detail: GraphDetailPayload, exportedAt = new Date().toISOString()) {
  const coreDocument = toCoreGraphDocument(detail.document);
  const filename = `${sanitizeGraphExportFilename(detail.title)}${studymateGraphExtension}`;
  return {
    filename,
    mimeType: studymateGraphMimeType,
    content: serializeStudymateGraphJson(coreDocument, {
      exportedAt,
      graphId: detail.id,
      title: detail.title,
      app: "StudyMate"
    })
  };
}

export function parseGraphJsonImport(content: string, currentDocument: GraphDocumentPayload) {
  const parsed = parseStudymateGraphJson(content, {
    graphId: currentDocument.graphId,
    version: currentDocument.version
  });

  return {
    document: fromCoreGraphDocument(parsed.document, currentDocument),
    issues: parsed.issues
  };
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
