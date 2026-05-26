export type GraphNodeType = "text" | "note" | "material" | "card" | "concept";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  metadata?: Record<string, unknown>;
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

