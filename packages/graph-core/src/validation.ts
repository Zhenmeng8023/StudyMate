import type {
  GraphDocument,
  GraphNode,
  GraphValidationIssue,
  GraphValidationOptions,
  GraphValidationSeverity
} from "./model.ts";
import { cloneGraphDocument, supportedGraphSchemaVersion } from "./model.ts";
import { clampZoomValue, finiteOrDefault, normalizeSourceKey } from "./utils.ts";

export function normalizeGraphDocument(graphId: string, version: number, document: GraphDocument): GraphDocument {
  const viewport = document.viewport ?? { x: 0, y: 0, zoom: 1 };
  return {
    ...cloneGraphDocument({
      ...document,
      id: graphId,
      version,
      schemaVersion: document.schemaVersion || supportedGraphSchemaVersion,
      viewport: {
        x: finiteOrDefault(viewport.x, 0),
        y: finiteOrDefault(viewport.y, 0),
        zoom: clampZoomValue(viewport.zoom)
      },
      nodes: document.nodes ?? [],
      edges: document.edges ?? [],
      groups: document.groups ?? [],
      theme: document.theme ?? {},
      metadata: document.metadata ?? {}
    }),
    id: graphId,
    version
  };
}

export function validateGraphDocument(document: GraphDocument, options: GraphValidationOptions = {}): GraphValidationIssue[] {
  const {
    sourceTargets,
    requireSource = true,
    minNodeWidth = 80,
    minNodeHeight = 48,
    maxNodeWidth = 1200,
    maxNodeHeight = 900
  } = options;
  const issues: GraphValidationIssue[] = [];
  const nodeMap = new Map<string, GraphNode>();
  const titleMap = new Map<string, string[]>();
  const connectedNodeIds = new Set<string>();

  for (const node of document.nodes ?? []) {
    const nodeId = node.id?.trim();
    if (!nodeId) {
      issues.push({
        ruleType: "missing_node_id",
        message: "节点 ID 不能为空",
        severity: "error"
      });
      continue;
    }

    if (nodeMap.has(nodeId)) {
      issues.push({
        ruleType: "duplicate_node_id",
        message: "节点 ID 重复",
        targetId: nodeId,
        severity: "error"
      });
    }
    nodeMap.set(nodeId, node);

    const title = node.title?.trim();
    if (!title) {
      issues.push({
        ruleType: "empty_node_title",
        message: "节点标题不能为空",
        targetId: nodeId,
        severity: "warning"
      });
    } else {
      const normalizedTitle = title.toLocaleLowerCase();
      titleMap.set(normalizedTitle, [...(titleMap.get(normalizedTitle) ?? []), nodeId]);
    }

    if (
      !Number.isFinite(node.width) ||
      !Number.isFinite(node.height) ||
      node.width < minNodeWidth ||
      node.height < minNodeHeight ||
      node.width > maxNodeWidth ||
      node.height > maxNodeHeight
    ) {
      issues.push({
        ruleType: "invalid_node_size",
        message: "节点尺寸不在允许范围内",
        targetId: nodeId,
        severity: "error"
      });
    }

    const sourceType = node.source?.type?.trim();
    const sourceID = node.source?.id?.trim();
    if (requireSource && !sourceID) {
      issues.push({
        ruleType: "missing_source",
        message: "节点缺少可追溯来源",
        targetId: nodeId,
        severity: "warning"
      });
    }
    if ((sourceType && !sourceID) || (!sourceType && sourceID)) {
      issues.push({
        ruleType: "invalid_source_target",
        message: "来源类型和来源 ID 必须同时存在",
        targetId: nodeId,
        severity: "error"
      });
    }
    if (sourceTargets && sourceType && sourceID && !sourceTargets.has(`${normalizeSourceKey(sourceType)}:${sourceID}`)) {
      issues.push({
        ruleType: "invalid_source_target",
        message: "节点来源指向不存在或不可访问的对象",
        targetId: nodeId,
        severity: "error"
      });
    }
  }

  for (const [_, nodeIds] of titleMap) {
    if (nodeIds.length <= 1) {
      continue;
    }
    for (const nodeId of nodeIds) {
      issues.push({
        ruleType: "duplicate_title",
        message: "存在重复标题节点",
        targetId: nodeId,
        severity: "warning"
      });
    }
  }

  for (const edge of document.edges ?? []) {
    const sourceExists = nodeMap.has(edge.sourceNodeId);
    const targetExists = nodeMap.has(edge.targetNodeId);
    if (!sourceExists || !targetExists) {
      issues.push({
        ruleType: "dangling_edge",
        message: !sourceExists ? "连线起点不存在" : "连线终点不存在",
        targetId: edge.id,
        severity: "error"
      });
    }
    if (sourceExists) {
      connectedNodeIds.add(edge.sourceNodeId);
    }
    if (targetExists) {
      connectedNodeIds.add(edge.targetNodeId);
    }

    const targetNodeIds = edge.metadata?.targetNodeIds;
    if (Array.isArray(targetNodeIds)) {
      for (const targetNodeId of targetNodeIds) {
        if (typeof targetNodeId !== "string" || !nodeMap.has(targetNodeId)) {
          issues.push({
            ruleType: "dangling_edge",
            message: "多目标连线包含不存在的目标节点",
            targetId: edge.id,
            severity: "error"
          });
        }
      }
    }
  }

  const collapsedGroupByNodeId = new Map<string, string>();
  for (const group of document.groups ?? []) {
    if ((group.nodeIds ?? []).length === 0) {
      issues.push({
        ruleType: "empty_group",
        message: "分组内没有节点",
        targetId: group.id,
        severity: "warning"
      });
    }
    for (const nodeId of group.nodeIds ?? []) {
      if (!nodeMap.has(nodeId)) {
        issues.push({
          ruleType: "invalid_group_node",
          message: "分组引用了不存在的节点",
          targetId: group.id,
          severity: "error"
        });
      }
      if (group.collapsed) {
        collapsedGroupByNodeId.set(nodeId, group.id);
      }
    }
  }

  for (const edge of document.edges ?? []) {
    const sourceGroup = collapsedGroupByNodeId.get(edge.sourceNodeId);
    const targetGroup = collapsedGroupByNodeId.get(edge.targetNodeId);
    if ((sourceGroup && sourceGroup !== targetGroup) || (targetGroup && sourceGroup !== targetGroup)) {
      issues.push({
        ruleType: "cross_collapsed_group_edge",
        message: "连线跨过折叠分组边界",
        targetId: edge.id,
        severity: "warning"
      });
    }
  }

  for (const node of document.nodes ?? []) {
    if (!connectedNodeIds.has(node.id)) {
      issues.push({
        ruleType: "isolated_node",
        message: "节点没有任何连线",
        targetId: node.id,
        severity: "info"
      });
    }
  }

  return issues.sort(compareValidationIssues);
}

function compareValidationIssues(left: GraphValidationIssue, right: GraphValidationIssue) {
  const severityOrder = new Map<GraphValidationSeverity, number>([
    ["error", 0],
    ["warning", 1],
    ["info", 2]
  ]);
  const severityDiff = (severityOrder.get(left.severity) ?? 3) - (severityOrder.get(right.severity) ?? 3);
  if (severityDiff !== 0) {
    return severityDiff;
  }
  const ruleDiff = left.ruleType.localeCompare(right.ruleType, "zh-CN");
  return ruleDiff === 0 ? (left.targetId ?? "").localeCompare(right.targetId ?? "", "zh-CN") : ruleDiff;
}
