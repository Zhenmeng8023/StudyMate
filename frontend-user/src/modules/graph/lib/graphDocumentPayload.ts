import {
  normalizeGraphDocument,
  supportedGraphSchemaVersion,
  type GraphDocument,
  type GraphNode
} from "@studymate/graph-core";
import type { GraphDocumentPayload, GraphNodePayload } from "../../../api/types";

export const graphWorkspaceDefaultViewport = {
  x: 140,
  y: 120,
  zoom: 1
} as const;

export function normalizeGraphDocumentPayload(
  graphId: string,
  version: number,
  document: GraphDocumentPayload
): GraphDocumentPayload {
  const normalized = normalizeGraphDocument(graphId, version, toCoreGraphDocument(graphId, version, document));

  return {
    graphId: normalized.id,
    version: normalized.version,
    schemaVersion: normalized.schemaVersion ?? supportedGraphSchemaVersion,
    viewport: normalized.viewport,
    nodes: normalized.nodes.map(toGraphNodePayload),
    edges: normalized.edges,
    groups: normalized.groups,
    theme: normalized.theme ?? {},
    metadata: normalized.metadata ?? {},
    updatedAt: document.updatedAt
  };
}

export function createEmptyGraphDocumentPayload(graphId: string, version: number): GraphDocumentPayload {
  return normalizeGraphDocumentPayload(graphId, version, {
    graphId,
    version,
    schemaVersion: supportedGraphSchemaVersion,
    viewport: { ...graphWorkspaceDefaultViewport },
    nodes: [],
    edges: [],
    groups: [],
    theme: {},
    metadata: {}
  });
}

function toCoreGraphDocument(graphId: string, version: number, document: GraphDocumentPayload): GraphDocument {
  return {
    id: document.graphId || graphId,
    version: document.version || version,
    schemaVersion: document.schemaVersion || supportedGraphSchemaVersion,
    viewport: {
      x: document.viewport?.x ?? graphWorkspaceDefaultViewport.x,
      y: document.viewport?.y ?? graphWorkspaceDefaultViewport.y,
      zoom: document.viewport?.zoom ?? graphWorkspaceDefaultViewport.zoom
    },
    nodes: document.nodes ?? [],
    edges: document.edges ?? [],
    groups: document.groups ?? [],
    theme: document.theme ?? {},
    metadata: document.metadata ?? {}
  };
}

function toGraphNodePayload(node: GraphNode): GraphNodePayload {
  return {
    ...node,
    source: node.source
      ? {
          type: node.source.type ?? "",
          id: node.source.id ?? "",
          label: node.source.label,
          excerpt: node.source.excerpt
        }
      : null
  };
}
