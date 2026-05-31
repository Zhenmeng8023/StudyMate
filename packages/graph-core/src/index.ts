export type GraphNodeType = "text" | "note" | "material" | "card" | "concept";

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

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  metadata?: GraphNodeMetadata;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface GraphDocument {
  id: string;
  version: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  groups: unknown[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
}
