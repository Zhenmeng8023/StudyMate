export type GraphNodeType = string;

export type GraphNodeTone = "neutral" | "sage" | "sky" | "amber" | "rose";

export type GraphNodeEmphasis = "default" | "strong" | "muted";

export interface GraphNodeAppearance {
  tone?: GraphNodeTone;
  emphasis?: GraphNodeEmphasis;
}

export interface GraphNodeMetadata {
  detail?: string;
  appearance?: GraphNodeAppearance | null;
  [key: string]: unknown;
}

export interface GraphNodeSource {
  type?: string;
  id?: string;
  label?: string;
  excerpt?: string;
}

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  source?: GraphNodeSource | null;
  metadata?: GraphNodeMetadata;
}

export interface GraphEdge {
  id: string;
  kind?: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphDocument {
  id: string;
  version: number;
  schemaVersion?: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  groups: GraphGroup[];
  viewport: GraphViewport;
  theme?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface GraphViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface GraphRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GraphStageSize {
  width: number;
  height: number;
}

export interface GraphGroup {
  id: string;
  title: string;
  nodeIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
  metadata?: Record<string, unknown>;
}

export interface SourceSwimlaneLayoutOptions {
  anchorX?: number;
  anchorY?: number;
  stageWidth?: number;
  stageHeight?: number;
  laneGap?: number;
  itemGap?: number;
  paddingX?: number;
  paddingY?: number;
  headerHeight?: number;
  makeGroupId?: (sourceKey: string, index: number) => string;
}

export interface SourceSwimlaneLayout {
  nodes: GraphNode[];
  groups: GraphGroup[];
  laneCount: number;
}

export interface GraphFocusPreview {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface GraphSourceReference {
  key: string;
  type: string;
  id: string;
  label: string;
  excerpt?: string;
  nodeCount: number;
  nodeIds: string[];
}

export interface GraphSourceTypeBucket {
  type: string;
  label: string;
  referenceCount: number;
  nodeCount: number;
}

export interface GraphSourceReferenceSummary {
  totalReferences: number;
  totalLinkedNodes: number;
  isolatedNodeCount: number;
  isolatedNodeIds: string[];
  missingSourceNodeCount: number;
  missingSourceNodeIds: string[];
  references: GraphSourceReference[];
  typeBuckets: GraphSourceTypeBucket[];
}

export type GraphValidationSeverity = "info" | "warning" | "error";

export interface GraphValidationIssue {
  ruleType: string;
  message: string;
  targetId?: string;
  severity: GraphValidationSeverity;
}

export interface GraphValidationOptions {
  sourceTargets?: Set<string>;
  requireSource?: boolean;
  minNodeWidth?: number;
  minNodeHeight?: number;
  maxNodeWidth?: number;
  maxNodeHeight?: number;
}

export interface StudymateGraphFile {
  mimeType: "application/vnd.studymate.graph+json";
  extension: ".smtg";
  schemaVersion: number;
  document: GraphDocument;
  metadata: Record<string, unknown>;
  issues: GraphValidationIssue[];
}

export interface GraphHistoryEntry {
  label: string;
  document: GraphDocument;
}

export interface GraphHistoryCoreState {
  past: GraphHistoryEntry[];
  present: GraphDocument;
  future: GraphHistoryEntry[];
  dirty: boolean;
  lastLabel: string;
}

export interface LearningGraphTemplate {
  id: string;
  name: string;
  category: "learning-material" | "book-notes" | "concept-network" | "review-card";
  description: string;
  document: GraphDocument;
}

export interface GraphSelectionState {
  selectedNodeId: string;
  selectedNodeIds: string[];
}

export interface GraphSelectionRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  hiddenNodeIds?: Set<string>;
}

export interface GraphClientPointProjection {
  clientX: number;
  clientY: number;
  stageRect: {
    left: number;
    top: number;
  };
  viewport: GraphViewport;
}

export interface GraphMinimapViewportOptions {
  viewport: GraphViewport;
  stage: GraphStageSize;
  world: GraphStageSize;
  scale: number;
}

export const studymateGraphMimeType = "application/vnd.studymate.graph+json";
export const studymateGraphExtension = ".smtg";
export const supportedGraphSchemaVersion = 1;
export const graphHistoryLimit = 80;

export function cloneGraphDocument(document: GraphDocument): GraphDocument {
  return {
    ...document,
    schemaVersion: document.schemaVersion ?? supportedGraphSchemaVersion,
    viewport: { ...document.viewport },
    nodes: (document.nodes ?? []).map((node) => ({
      ...node,
      source: node.source ? { ...node.source } : null,
      metadata: node.metadata ? cloneRecord(node.metadata) : undefined
    })),
    edges: (document.edges ?? []).map((edge) => ({
      ...edge,
      metadata: edge.metadata ? cloneRecord(edge.metadata) : undefined
    })),
    groups: (document.groups ?? []).map((group) => ({
      ...group,
      nodeIds: [...(group.nodeIds ?? [])],
      metadata: group.metadata ? cloneRecord(group.metadata) : undefined
    })),
    theme: document.theme ? cloneRecord(document.theme) : undefined,
    metadata: document.metadata ? cloneRecord(document.metadata) : undefined
  };
}

export function cloneRecord(record: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(record)) as Record<string, unknown>;
}
