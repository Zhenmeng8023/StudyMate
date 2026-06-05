import type { GraphDocument, GraphEdge, GraphGroup, GraphNode } from "./model.ts";
import { cloneRecord } from "./model.ts";

export type GraphDocumentMutationTarget<
  TNode extends GraphNode = GraphNode,
  TEdge extends GraphEdge = GraphEdge,
  TGroup extends GraphGroup = GraphGroup
> = {
  nodes: TNode[];
  edges: TEdge[];
  groups: TGroup[];
};

export type AppendGraphEdgeResult<
  TNode extends GraphNode = GraphNode,
  TEdge extends GraphEdge = GraphEdge,
  TGroup extends GraphGroup = GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup> = GraphDocumentMutationTarget<TNode, TEdge, TGroup>
> = {
  document: TDocument;
  created: boolean;
  reason?: "duplicate" | "missing-node" | "self-loop";
};

export interface DuplicateGraphNodeOptions {
  makeNodeId: () => string;
  titleSuffix?: string;
  offsetX?: number;
  offsetY?: number;
  stageWidth?: number;
  stageHeight?: number;
}

export interface CreateGraphGroupOptions {
  makeGroupId: () => string;
  title?: string;
  paddingX?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

function cloneGraphNodeForMutation<TNode extends GraphNode>(node: TNode): TNode {
  return {
    ...node,
    source: node.source ? { ...node.source } : null,
    metadata: node.metadata ? cloneRecord(node.metadata) : undefined
  };
}

function cloneGraphEdgeForMutation<TEdge extends GraphEdge>(edge: TEdge): TEdge {
  return {
    ...edge,
    metadata: edge.metadata ? cloneRecord(edge.metadata) : undefined
  };
}

function cloneGraphGroupForMutation<TGroup extends GraphGroup>(group: TGroup): TGroup {
  return {
    ...group,
    nodeIds: [...group.nodeIds],
    metadata: group.metadata ? cloneRecord(group.metadata) : undefined
  };
}

export function removeGraphNodesFromDocument<
  TNode extends GraphNode,
  TEdge extends GraphEdge,
  TGroup extends GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup>
>(document: TDocument, nodeIds: readonly string[]): TDocument {
  const nodeIdSet = new Set(nodeIds.filter(Boolean));
  if (nodeIdSet.size === 0) {
    return document;
  }

  return {
    ...document,
    nodes: document.nodes.filter((node) => !nodeIdSet.has(node.id)).map(cloneGraphNodeForMutation),
    edges: document.edges
      .filter((edge) => !nodeIdSet.has(edge.sourceNodeId) && !nodeIdSet.has(edge.targetNodeId))
      .map(cloneGraphEdgeForMutation),
    groups: document.groups.map((group) => ({
      ...cloneGraphGroupForMutation(group),
      nodeIds: group.nodeIds.filter((nodeId) => !nodeIdSet.has(nodeId))
    }))
  };
}

export function appendGraphNodeToDocument<
  TNode extends GraphNode,
  TEdge extends GraphEdge,
  TGroup extends GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup>
>(document: TDocument, node: TNode): TDocument {
  return {
    ...document,
    nodes: [...document.nodes.map(cloneGraphNodeForMutation), cloneGraphNodeForMutation(node)],
    edges: document.edges.map(cloneGraphEdgeForMutation),
    groups: document.groups.map(cloneGraphGroupForMutation)
  };
}

export function appendGraphEdgeToDocument<
  TNode extends GraphNode,
  TEdge extends GraphEdge,
  TGroup extends GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup>
>(document: TDocument, edge: TEdge): AppendGraphEdgeResult<TNode, TEdge, TGroup, TDocument> {
  if (edge.sourceNodeId === edge.targetNodeId) {
    return { document, created: false, reason: "self-loop" };
  }

  const nodeIds = new Set(document.nodes.map((node) => node.id));
  if (!nodeIds.has(edge.sourceNodeId) || !nodeIds.has(edge.targetNodeId)) {
    return { document, created: false, reason: "missing-node" };
  }

  const exists = document.edges.some(
    (current) => current.sourceNodeId === edge.sourceNodeId && current.targetNodeId === edge.targetNodeId
  );
  if (exists) {
    return { document, created: false, reason: "duplicate" };
  }

  return {
    document: {
      ...document,
      nodes: document.nodes.map(cloneGraphNodeForMutation),
      edges: [...document.edges.map(cloneGraphEdgeForMutation), cloneGraphEdgeForMutation(edge)],
      groups: document.groups.map(cloneGraphGroupForMutation)
    },
    created: true
  };
}

export function duplicateGraphNodeInDocument<
  TNode extends GraphNode,
  TEdge extends GraphEdge,
  TGroup extends GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup>
>(
  document: TDocument,
  nodeId: string,
  options: DuplicateGraphNodeOptions
): { document: TDocument; node?: TNode } {
  const source = document.nodes.find((node) => node.id === nodeId);
  if (!source) {
    return { document };
  }

  const offsetX = options.offsetX ?? 36;
  const offsetY = options.offsetY ?? 28;
  const maxX = options.stageWidth == null ? Number.POSITIVE_INFINITY : Math.max(0, options.stageWidth - source.width);
  const maxY = options.stageHeight == null ? Number.POSITIVE_INFINITY : Math.max(0, options.stageHeight - source.height);
  const duplicated = {
    ...cloneGraphNodeForMutation(source),
    id: options.makeNodeId(),
    title: `${source.title}${options.titleSuffix ?? " 副本"}`,
    x: Math.max(0, Math.min(maxX, source.x + offsetX)),
    y: Math.max(0, Math.min(maxY, source.y + offsetY))
  } as TNode;

  return {
    document: appendGraphNodeToDocument(document, duplicated),
    node: duplicated
  };
}

export function createGraphGroupForNodes<
  TNode extends GraphNode,
  TEdge extends GraphEdge,
  TGroup extends GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup>
>(
  document: TDocument,
  nodeIds: readonly string[],
  options: CreateGraphGroupOptions
): { document: TDocument; group?: TGroup } {
  const selectedIdSet = new Set(nodeIds.filter(Boolean));
  const nodes = document.nodes.filter((node) => selectedIdSet.has(node.id));
  if (nodes.length === 0) {
    return { document };
  }

  const paddingX = options.paddingX ?? 36;
  const paddingTop = options.paddingTop ?? 46;
  const paddingBottom = options.paddingBottom ?? 42;
  const left = Math.min(...nodes.map((node) => node.x));
  const top = Math.min(...nodes.map((node) => node.y));
  const right = Math.max(...nodes.map((node) => node.x + node.width));
  const bottom = Math.max(...nodes.map((node) => node.y + node.height));
  const group = {
    id: options.makeGroupId(),
    title:
      options.title ??
      (nodes.length === 1 ? `${nodes[0].title} 分组` : `${nodes[0].title} 等 ${nodes.length} 个节点`),
    nodeIds: nodes.map((node) => node.id),
    x: Math.max(0, left - paddingX),
    y: Math.max(0, top - paddingTop),
    width: right - left + paddingX * 2,
    height: bottom - top + paddingTop + paddingBottom,
    collapsed: false
  } as TGroup;

  return {
    document: {
      ...document,
      nodes: document.nodes.map(cloneGraphNodeForMutation),
      edges: document.edges.map(cloneGraphEdgeForMutation),
      groups: [...document.groups.map(cloneGraphGroupForMutation), group]
    },
    group
  };
}

export function toggleGraphGroupCollapse<
  TNode extends GraphNode,
  TEdge extends GraphEdge,
  TGroup extends GraphGroup,
  TDocument extends GraphDocumentMutationTarget<TNode, TEdge, TGroup>
>(document: TDocument, groupId: string): TDocument {
  if (!document.groups.some((group) => group.id === groupId)) {
    return document;
  }

  return {
    ...document,
    nodes: document.nodes.map(cloneGraphNodeForMutation),
    edges: document.edges.map(cloneGraphEdgeForMutation),
    groups: document.groups.map((group) =>
      group.id === groupId ? ({ ...cloneGraphGroupForMutation(group), collapsed: !group.collapsed } as TGroup) : cloneGraphGroupForMutation(group)
    )
  };
}
