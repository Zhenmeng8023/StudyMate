import {
  appendGraphEdgeToDocument,
  createGraphGroupForNodes,
  duplicateGraphNodeInDocument,
  removeGraphNodesFromDocument,
  toggleGraphGroupCollapse
} from "@studymate/graph-core";
import type { GraphDocumentPayload, GraphEdgePayload, GraphNodePayload } from "../../../api/client";
import {
  buildGraphNodeDraft,
  getGraphNodeTypeOption,
  type GraphNodeCreationType
} from "./graphNodeTypes";
import {
  defaultNodePosition,
  stageHeight,
  stageWidth
} from "./workspaceControllerHelpers";

export type GraphWorkspaceDocumentMutationResult = {
  activeNodeId?: string;
  changed: boolean;
  document: GraphDocumentPayload;
  label?: string;
  linkFromNodeId?: string;
  selectedEdgeId?: string;
  selectedNodeIds?: string[];
  status?: string;
};

export type GraphWorkspaceConnectResult = GraphWorkspaceDocumentMutationResult & {
  created: boolean;
};

export function createGraphWorkspaceNode(
  document: GraphDocumentPayload,
  options: {
    makeNodeId: () => string;
    source?: GraphNodePayload["source"];
    type: GraphNodeCreationType;
  }
): GraphWorkspaceDocumentMutationResult & { node: GraphNodePayload } {
  const nextNode = buildGraphNodeDraft({
    id: options.makeNodeId(),
    position: defaultNodePosition(document.nodes.length),
    source: options.source,
    type: options.type
  });

  return {
    activeNodeId: nextNode.id,
    changed: true,
    document: {
      ...document,
      nodes: [...document.nodes, nextNode]
    },
    label: `新增${getGraphNodeTypeOption(options.type).label}节点`,
    linkFromNodeId: "",
    node: nextNode,
    selectedEdgeId: "",
    selectedNodeIds: [nextNode.id]
  };
}

export function connectGraphWorkspaceNodes(
  document: GraphDocumentPayload,
  options: {
    makeEdgeId: () => string;
    sourceNodeId: string;
    targetNodeId: string;
  }
): GraphWorkspaceConnectResult {
  const nextEdge: GraphEdgePayload = {
    id: options.makeEdgeId(),
    kind: "straight",
    label: "关联",
    metadata: {},
    sourceNodeId: options.sourceNodeId,
    targetNodeId: options.targetNodeId
  };
  const result = appendGraphEdgeToDocument(document, nextEdge);

  if (!result.created) {
    return {
      changed: false,
      created: false,
      document,
      linkFromNodeId: "",
      status: result.reason === "duplicate" ? "这两个节点之间已经有连线" : "无法在这两个节点之间创建连线"
    };
  }

  return {
    changed: true,
    created: true,
    document: result.document,
    label: "创建连线",
    linkFromNodeId: "",
    selectedEdgeId: nextEdge.id,
    selectedNodeIds: []
  };
}

export function deleteGraphWorkspaceSelection(
  document: GraphDocumentPayload,
  options: {
    linkFromNodeId: string;
    selectedEdgeId: string;
    selectedNodeIds: string[];
  }
): GraphWorkspaceDocumentMutationResult {
  if (options.selectedNodeIds.length > 0) {
    return {
      changed: true,
      document: removeGraphNodesFromDocument(document, options.selectedNodeIds),
      label: "删除节点",
      linkFromNodeId: options.selectedNodeIds.includes(options.linkFromNodeId) ? "" : options.linkFromNodeId,
      selectedEdgeId: "",
      selectedNodeIds: []
    };
  }

  if (!options.selectedEdgeId) {
    return {
      changed: false,
      document,
      linkFromNodeId: options.linkFromNodeId,
      selectedEdgeId: options.selectedEdgeId,
      selectedNodeIds: options.selectedNodeIds
    };
  }

  return {
    changed: true,
    document: {
      ...document,
      edges: document.edges.filter((edge) => edge.id !== options.selectedEdgeId)
    },
    label: "删除连线",
    linkFromNodeId: options.linkFromNodeId,
    selectedEdgeId: "",
    selectedNodeIds: options.selectedNodeIds
  };
}

export function deleteGraphWorkspaceNode(
  document: GraphDocumentPayload,
  nodeId: string,
  options: {
    linkFromNodeId: string;
    selectedNodeIds: string[];
  }
): GraphWorkspaceDocumentMutationResult {
  if (!nodeId) {
    return {
      changed: false,
      document,
      linkFromNodeId: options.linkFromNodeId,
      selectedEdgeId: "",
      selectedNodeIds: options.selectedNodeIds
    };
  }

  const nextSelectedNodeIds = options.selectedNodeIds.filter((item) => item !== nodeId);
  return {
    changed: true,
    document: removeGraphNodesFromDocument(document, [nodeId]),
    label: "删除节点",
    linkFromNodeId: options.linkFromNodeId === nodeId ? "" : options.linkFromNodeId,
    selectedEdgeId: "",
    selectedNodeIds: nextSelectedNodeIds
  };
}

export function duplicateGraphWorkspaceNode(
  document: GraphDocumentPayload,
  nodeId: string,
  options: {
    makeNodeId: () => string;
    stageHeight?: number;
    stageWidth?: number;
  }
): GraphWorkspaceDocumentMutationResult {
  const result = duplicateGraphNodeInDocument(document, nodeId, {
    makeNodeId: options.makeNodeId,
    stageHeight: options.stageHeight ?? stageHeight,
    stageWidth: options.stageWidth ?? stageWidth,
    titleSuffix: " 副本"
  });

  if (!result.node) {
    return {
      changed: false,
      document,
      selectedNodeIds: []
    };
  }

  return {
    activeNodeId: result.node.id,
    changed: true,
    document: result.document,
    label: "复制节点",
    selectedNodeIds: [result.node.id],
    status: "已复制节点"
  };
}

export function createGraphWorkspaceGroup(
  document: GraphDocumentPayload,
  nodeIds: string[],
  options: {
    makeGroupId: () => string;
  }
): GraphWorkspaceDocumentMutationResult {
  const selectedNodes = document.nodes.filter((node) => nodeIds.includes(node.id));
  if (selectedNodes.length === 0) {
    return {
      changed: false,
      document,
      selectedNodeIds: nodeIds
    };
  }

  const title =
    selectedNodes.length === 1
      ? `${selectedNodes[0].title} 分组`
      : `${selectedNodes[0].title} 等 ${selectedNodes.length} 个节点`;
  const result = createGraphGroupForNodes(document, nodeIds, {
    makeGroupId: options.makeGroupId,
    title
  });

  if (!result.group) {
    return {
      changed: false,
      document,
      selectedNodeIds: nodeIds
    };
  }

  return {
    activeNodeId: selectedNodes.length === 1 ? selectedNodes[0].id : undefined,
    changed: true,
    document: result.document,
    label: "创建分组",
    selectedNodeIds: selectedNodes.length === 1 ? [selectedNodes[0].id] : nodeIds,
    status: selectedNodes.length === 1 ? "已基于当前节点创建分组" : `已为 ${selectedNodes.length} 个节点创建分组`
  };
}

export function toggleGraphWorkspaceGroupCollapse(
  document: GraphDocumentPayload,
  groupId: string
): GraphWorkspaceDocumentMutationResult {
  const nextDocument = toggleGraphGroupCollapse(document, groupId);
  if (nextDocument === document) {
    return {
      changed: false,
      document
    };
  }

  return {
    changed: true,
    document: nextDocument,
    label: "切换分组折叠",
    status: "已切换分组折叠状态"
  };
}
