import { describe, expect, it } from "vitest";
import type { GraphDocumentPayload, GraphNodePayload } from "../../../api/client";
import {
  connectGraphWorkspaceNodes,
  createGraphWorkspaceGroup,
  createGraphWorkspaceNode,
  deleteGraphWorkspaceSelection,
  duplicateGraphWorkspaceNode,
  toggleGraphWorkspaceGroupCollapse
} from "./graphWorkspaceMutations";

const baseNodes: GraphNodePayload[] = [
  {
    height: 100,
    id: "node-1",
    metadata: { detail: "alpha" },
    source: { id: "note-1", label: "Note 1", type: "note" },
    title: "Alpha",
    type: "concept",
    width: 200,
    x: 100,
    y: 120
  },
  {
    height: 100,
    id: "node-2",
    title: "Beta",
    type: "concept",
    width: 200,
    x: 420,
    y: 120
  },
  {
    height: 100,
    id: "node-3",
    title: "Gamma",
    type: "concept",
    width: 200,
    x: 760,
    y: 120
  }
];

const baseDocument: GraphDocumentPayload = {
  edges: [
    {
      id: "edge-1",
      kind: "straight",
      label: "关联",
      metadata: {},
      sourceNodeId: "node-1",
      targetNodeId: "node-2"
    }
  ],
  graphId: "graph-1",
  groups: [
    {
      collapsed: false,
      height: 180,
      id: "group-1",
      nodeIds: ["node-1", "node-2"],
      title: "Group",
      width: 620,
      x: 80,
      y: 80
    }
  ],
  metadata: {},
  nodes: baseNodes,
  schemaVersion: 1,
  theme: {},
  version: 1,
  viewport: { x: 0, y: 0, zoom: 1 }
};

describe("graph workspace mutations", () => {
  it("creates a typed node with source metadata and selection instructions without mutating the source document", () => {
    const result = createGraphWorkspaceNode(baseDocument, {
      makeNodeId: () => "node-new",
      source: { id: "material-1", label: "Material 1", type: "material" },
      type: "material"
    });

    expect(result.label).toBe("新增资料节点");
    expect(result.linkFromNodeId).toBe("");
    expect(result.selectedEdgeId).toBe("");
    expect(result.selectedNodeIds).toEqual(["node-new"]);
    expect(result.node).toMatchObject({
      id: "node-new",
      source: { id: "material-1", label: "Material 1", type: "material" },
      title: "Material 1",
      type: "material",
      x: 920,
      y: 120
    });
    expect(result.document.nodes).toHaveLength(4);
    expect(baseDocument.nodes).toHaveLength(3);
  });

  it("connects two nodes once and returns explainable duplicate failures", () => {
    const created = connectGraphWorkspaceNodes(baseDocument, {
      makeEdgeId: () => "edge-new",
      sourceNodeId: "node-2",
      targetNodeId: "node-3"
    });
    const duplicate = connectGraphWorkspaceNodes(created.document, {
      makeEdgeId: () => "edge-duplicate",
      sourceNodeId: "node-2",
      targetNodeId: "node-3"
    });

    expect(created.created).toBe(true);
    expect(created.label).toBe("创建连线");
    expect(created.selectedEdgeId).toBe("edge-new");
    expect(created.selectedNodeIds).toEqual([]);
    expect(created.linkFromNodeId).toBe("");
    expect(created.document.edges.map((edge) => edge.id)).toEqual(["edge-1", "edge-new"]);
    expect(duplicate.created).toBe(false);
    expect(duplicate.status).toBe("这两个节点之间已经有连线");
    expect(duplicate.document).toBe(created.document);
  });

  it("deletes selected nodes and cleans edges, groups, selected ids, and link mode immutably", () => {
    const result = deleteGraphWorkspaceSelection(baseDocument, {
      selectedEdgeId: "",
      selectedNodeIds: ["node-2"],
      linkFromNodeId: "node-2"
    });

    expect(result.changed).toBe(true);
    expect(result.label).toBe("删除节点");
    expect(result.linkFromNodeId).toBe("");
    expect(result.selectedEdgeId).toBe("");
    expect(result.selectedNodeIds).toEqual([]);
    expect(result.document.nodes.map((node) => node.id)).toEqual(["node-1", "node-3"]);
    expect(result.document.edges).toEqual([]);
    expect(result.document.groups[0].nodeIds).toEqual(["node-1"]);
    expect(baseDocument.nodes.map((node) => node.id)).toEqual(["node-1", "node-2", "node-3"]);
  });

  it("deletes a selected edge without changing nodes", () => {
    const result = deleteGraphWorkspaceSelection(baseDocument, {
      selectedEdgeId: "edge-1",
      selectedNodeIds: [],
      linkFromNodeId: ""
    });

    expect(result.changed).toBe(true);
    expect(result.label).toBe("删除连线");
    expect(result.selectedEdgeId).toBe("");
    expect(result.document.edges).toEqual([]);
    expect(result.document.nodes[0]).toBe(baseDocument.nodes[0]);
  });

  it("duplicates a node with copied metadata and active selection", () => {
    const result = duplicateGraphWorkspaceNode(baseDocument, "node-1", {
      makeNodeId: () => "node-copy",
      stageHeight: 1600,
      stageWidth: 2400
    });

    expect(result.changed).toBe(true);
    expect(result.label).toBe("复制节点");
    expect(result.status).toBe("已复制节点");
    expect(result.selectedNodeIds).toEqual(["node-copy"]);
    expect(result.activeNodeId).toBe("node-copy");
    expect(result.document.nodes.at(-1)).toMatchObject({ id: "node-copy", title: "Alpha 副本" });
    expect(result.document.nodes.at(-1)?.metadata).toEqual({ detail: "alpha" });
    expect(result.document.nodes.at(-1)?.metadata).not.toBe(baseDocument.nodes[0].metadata);
  });

  it("creates groups for one or many selected nodes with clear status messages", () => {
    const single = createGraphWorkspaceGroup(baseDocument, ["node-1"], {
      makeGroupId: () => "group-single"
    });
    const many = createGraphWorkspaceGroup(baseDocument, ["node-1", "node-2"], {
      makeGroupId: () => "group-many"
    });

    expect(single.changed).toBe(true);
    expect(single.label).toBe("创建分组");
    expect(single.status).toBe("已基于当前节点创建分组");
    expect(single.selectedNodeIds).toEqual(["node-1"]);
    expect(single.document.groups.at(-1)).toMatchObject({ id: "group-single", title: "Alpha 分组" });
    expect(many.status).toBe("已为 2 个节点创建分组");
    expect(many.document.groups.at(-1)).toMatchObject({
      id: "group-many",
      nodeIds: ["node-1", "node-2"],
      title: "Alpha 等 2 个节点"
    });
  });

  it("toggles group collapse with label and no-op protection", () => {
    const result = toggleGraphWorkspaceGroupCollapse(baseDocument, "group-1");
    const missing = toggleGraphWorkspaceGroupCollapse(baseDocument, "missing");

    expect(result.changed).toBe(true);
    expect(result.label).toBe("切换分组折叠");
    expect(result.status).toBe("已切换分组折叠状态");
    expect(result.document.groups[0].collapsed).toBe(true);
    expect(baseDocument.groups[0].collapsed).toBe(false);
    expect(missing.changed).toBe(false);
    expect(missing.document).toBe(baseDocument);
  });
});
