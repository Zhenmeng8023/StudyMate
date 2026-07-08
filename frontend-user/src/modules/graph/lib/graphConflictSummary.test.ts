import { describe, expect, it } from "vitest";
import type { GraphDetailPayload, GraphDocumentPayload } from "../../../api/client";
import {
  applyGraphConflictResolutionDrafts,
  applyGraphConflictResolutionSuggestions,
  buildGraphConflictBundleArtifact,
  buildGraphConflictObjectDetails,
  buildGraphConflictResolutionBlockingIssueSummary,
  buildGraphConflictResolutionDrafts,
  buildGraphConflictResolutionOutcomeMessage,
  buildGraphConflictResolutionSuggestionOutcomeMessage,
  buildGraphConflictResolutionSuggestions,
  buildGraphConflictReportArtifact,
  buildGraphUnsavedChangeSummary,
  validateGraphConflictResolutionDrafts
} from "./graphConflictSummary";

function buildDocument(overrides?: Partial<GraphDocumentPayload>): GraphDocumentPayload {
  return {
    graphId: "graph-1",
    version: 4,
    schemaVersion: 1,
    viewport: { x: 100, y: 80, zoom: 1 },
    nodes: [
      {
        id: "node-1",
        type: "text",
        title: "概念 A",
        x: 0,
        y: 0,
        width: 220,
        height: 132,
        metadata: {}
      }
    ],
    edges: [],
    groups: [],
    theme: {},
    metadata: {},
    ...overrides
  };
}

function buildDetail(overrides?: Partial<GraphDetailPayload>): GraphDetailPayload {
  const document = overrides?.document ?? buildDocument();
  return {
    id: "graph-1",
    ownerUserId: "user-1",
    title: "Graph",
    description: "desc",
    visibility: "private",
    status: "active",
    graphType: "knowledge",
    mode: "free",
    currentVersion: document.version,
    nodeCount: document.nodes.length,
    edgeCount: document.edges.length,
    createdAt: "2026-06-05T08:00:00Z",
    updatedAt: "2026-06-05T08:00:00Z",
    document,
    ...overrides
  };
}

describe("graphConflictSummary", () => {
  it("summarizes title, description, and document collection changes", () => {
    const baseline = buildDetail();
    const current = buildDetail({
      title: "Graph updated",
      description: "desc updated",
      document: buildDocument({
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "概念 A（已修改）",
            x: 0,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          },
          {
            id: "node-2",
            type: "text",
            title: "概念 B",
            x: 260,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          }
        ],
        edges: [{ id: "edge-1", sourceNodeId: "node-1", targetNodeId: "node-2", kind: "curve" }],
        groups: [{ id: "group-1", title: "组 1", nodeIds: ["node-1", "node-2"], x: 0, y: 0, width: 520, height: 220, collapsed: false }]
      })
    });

    expect(buildGraphUnsavedChangeSummary(current, baseline)).toEqual([
      "标题已修改（当前：Graph updated；基线：Graph）",
      "说明已修改（当前：desc updated；基线：desc）",
      "节点：新增 1 个（概念 B），修改 1 个（概念 A（已修改））",
      "连线：新增 1 个（node-1 -> node-2）",
      "分组：新增 1 个（组 1）"
    ]);
  });

  it("builds object-level conflict details for nodes, edges, and groups", () => {
    const baseline = buildDetail({
      document: buildDocument({
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "概念 A",
            x: 0,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          },
          {
            id: "node-legacy",
            type: "text",
            title: "旧概念",
            x: 260,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          }
        ],
        edges: [{ id: "edge-legacy", sourceNodeId: "node-legacy", targetNodeId: "node-1", kind: "curve", label: "旧关系" }],
        groups: [{ id: "group-legacy", title: "旧分组", nodeIds: ["node-legacy"], x: 0, y: 0, width: 240, height: 180, collapsed: false }]
      })
    });
    const current = buildDetail({
      document: buildDocument({
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "概念 A（已修改）",
            x: 0,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          },
          {
            id: "node-2",
            type: "text",
            title: "概念 B",
            x: 520,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          }
        ],
        edges: [{ id: "edge-1", sourceNodeId: "node-1", targetNodeId: "node-2", kind: "curve", label: "新关系" }],
        groups: [{ id: "group-1", title: "组 1", nodeIds: ["node-1", "node-2"], x: 0, y: 0, width: 520, height: 220, collapsed: false }]
      })
    });

    expect(buildGraphConflictObjectDetails(current, baseline)).toEqual([
      { action: "updated", id: "node-1", kind: "node", label: "概念 A（已修改）" },
      { action: "added", id: "node-2", kind: "node", label: "概念 B" },
      { action: "removed", id: "node-legacy", kind: "node", label: "旧概念" },
      { action: "added", id: "edge-1", kind: "edge", label: "新关系" },
      { action: "removed", id: "edge-legacy", kind: "edge", label: "旧关系" },
      { action: "added", id: "group-1", kind: "group", label: "组 1" },
      { action: "removed", id: "group-legacy", kind: "group", label: "旧分组" }
    ]);
  });

  it("builds resolution drafts only for explicitly selected object decisions", () => {
    expect(
      buildGraphConflictResolutionDrafts({
        changeDetails: [
          { action: "added", id: "node-2", kind: "node", label: "概念 B" },
          { action: "updated", id: "group-1", kind: "group", label: "组 1" }
        ],
        latestHeadDetails: [{ action: "removed", id: "edge-legacy", kind: "edge", label: "旧关系" }],
        selections: {
          "localDraft:node:node-2:added": "keep-local",
          "latestHead:edge:edge-legacy:removed": "keep-latest"
        }
      })
    ).toEqual([
      {
        decision: "keep-local",
        detail: { action: "added", id: "node-2", kind: "node", label: "概念 B" },
        scope: "localDraft"
      },
      {
        decision: "keep-latest",
        detail: { action: "removed", id: "edge-legacy", kind: "edge", label: "旧关系" },
        scope: "latestHead"
      }
    ]);
  });

  it("rebases the local draft onto the latest head while applying keep-local object decisions", () => {
    const current = buildDetail({
      title: "Graph local",
      description: "local desc",
      currentVersion: 4,
      document: buildDocument({
        version: 4,
        viewport: { x: 220, y: 140, zoom: 1.15 },
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "概念 A（本地）",
            x: 0,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          },
          {
            id: "node-2",
            type: "text",
            title: "概念 B",
            x: 260,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          }
        ],
        edges: [],
        groups: []
      })
    });
    const latestHead = buildDetail({
      title: "Graph server",
      description: "server desc",
      currentVersion: 5,
      document: buildDocument({
        version: 5,
        viewport: { x: 40, y: 24, zoom: 0.9 },
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "概念 A（服务端）",
            x: 80,
            y: 40,
            width: 220,
            height: 132,
            metadata: {}
          }
        ],
        edges: [{ id: "edge-legacy", sourceNodeId: "node-1", targetNodeId: "node-1", kind: "curve", label: "旧关系" }],
        groups: [{ id: "group-1", title: "服务端分组", nodeIds: ["node-1"], x: 0, y: 0, width: 320, height: 200, collapsed: false }]
      })
    });

    const merged = applyGraphConflictResolutionDrafts({
      current,
      latestHead,
      drafts: [
        {
          decision: "keep-local",
          detail: { action: "updated", id: "node-1", kind: "node", label: "概念 A（本地）" },
          scope: "localDraft"
        },
        {
          decision: "keep-local",
          detail: { action: "added", id: "node-2", kind: "node", label: "概念 B" },
          scope: "localDraft"
        },
        {
          decision: "keep-latest",
          detail: { action: "removed", id: "edge-legacy", kind: "edge", label: "旧关系" },
          scope: "latestHead"
        }
      ]
    });

    expect(merged.title).toBe("Graph local");
    expect(merged.description).toBe("local desc");
    expect(merged.currentVersion).toBe(5);
    expect(merged.document.version).toBe(5);
    expect(merged.document.viewport).toEqual({ x: 220, y: 140, zoom: 1.15 });
    expect(merged.document.nodes).toEqual([
      {
        id: "node-1",
        type: "text",
        title: "概念 A（本地）",
        x: 0,
        y: 0,
        width: 220,
        height: 132,
        source: null,
        metadata: {}
      },
      {
        id: "node-2",
        type: "text",
        title: "概念 B",
        x: 260,
        y: 0,
        width: 220,
        height: 132,
        source: null,
        metadata: {}
      }
    ]);
    expect(merged.document.edges).toEqual([
      { id: "edge-legacy", sourceNodeId: "node-1", targetNodeId: "node-1", kind: "curve", label: "旧关系" }
    ]);
    expect(merged.document.groups).toEqual([
      { id: "group-1", title: "服务端分组", nodeIds: ["node-1"], x: 0, y: 0, width: 320, height: 200, collapsed: false }
    ]);
  });

  it("falls back to viewport changes when structure counts are unchanged", () => {
    const baseline = buildDetail();
    const current = buildDetail({
      document: buildDocument({
        viewport: { x: 180, y: 96, zoom: 1.1 }
      })
    });

    expect(buildGraphUnsavedChangeSummary(current, baseline)).toEqual(["画布视口已调整"]);
  });

  it("reports blocking dependency issues when a kept local edge references a node that is not preserved", () => {
    const current = buildDetail({
      document: buildDocument({
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "姒傚康 A",
            x: 0,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          },
          {
            id: "node-local",
            type: "text",
            title: "鏈湴鑺傜偣",
            x: 260,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          }
        ],
        edges: [{ id: "edge-local", sourceNodeId: "node-1", targetNodeId: "node-local", kind: "curve", label: "鏈湴杩炵嚎" }],
        groups: []
      })
    });
    const latestHead = buildDetail({
      currentVersion: 5,
      document: buildDocument({
        version: 5,
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "姒傚康 A",
            x: 0,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          }
        ],
        edges: [],
        groups: []
      })
    });

    const result = validateGraphConflictResolutionDrafts({
      current,
      latestHead,
      drafts: [
        {
          decision: "keep-local",
          detail: { action: "added", id: "edge-local", kind: "edge", label: "鏈湴杩炵嚎" },
          scope: "localDraft"
        }
      ]
    });

    expect(result.blockingIssues).toEqual([
      expect.objectContaining({
        ruleType: "dangling_edge",
        severity: "error",
        targetId: "edge-local"
      })
    ]);
  });

  it("reports blocking dependency issues when a kept local group references a node that is not preserved", () => {
    const current = buildDetail({
      document: buildDocument({
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "姒傚康 A",
            x: 0,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          },
          {
            id: "node-local",
            type: "text",
            title: "鏈湴鑺傜偣",
            x: 260,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          }
        ],
        edges: [],
        groups: [{ id: "group-local", title: "鏈湴鍒嗙粍", nodeIds: ["node-local"], x: 0, y: 0, width: 320, height: 220, collapsed: false }]
      })
    });
    const latestHead = buildDetail({
      currentVersion: 5,
      document: buildDocument({
        version: 5,
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "姒傚康 A",
            x: 0,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          }
        ],
        edges: [],
        groups: []
      })
    });

    const result = validateGraphConflictResolutionDrafts({
      current,
      latestHead,
      drafts: [
        {
          decision: "keep-local",
          detail: { action: "added", id: "group-local", kind: "group", label: "鏈湴鍒嗙粍" },
          scope: "localDraft"
        }
      ]
    });

    expect(result.blockingIssues).toEqual([
      expect.objectContaining({
        ruleType: "invalid_group_node",
        severity: "error",
        targetId: "group-local"
      })
    ]);
  });

  it("builds linked resolution suggestions for dependency blocking issues", () => {
    const current = buildDetail({
      document: buildDocument({
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "概念 A",
            x: 0,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          },
          {
            id: "node-local",
            type: "text",
            title: "本地节点",
            x: 260,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          }
        ],
        edges: [{ id: "edge-local", sourceNodeId: "node-1", targetNodeId: "node-local", kind: "curve", label: "本地连线" }],
        groups: []
      })
    });

    expect(
      buildGraphConflictResolutionSuggestions({
        blockingIssues: [
          {
            message: "dangling-edge",
            ruleType: "dangling_edge",
            severity: "error",
            targetId: "edge-local"
          }
        ],
        changeDetails: [
          { action: "added", id: "node-local", kind: "node", label: "本地节点" },
          { action: "added", id: "edge-local", kind: "edge", label: "本地连线" }
        ],
        current,
        resolutionSelections: {
          "localDraft:edge:edge-local:added": "keep-local"
        }
      })
    ).toEqual([
      {
        choice: "keep-local",
        description: "补齐这条依赖需要同时保留相关节点。",
        detail: { action: "added", id: "node-local", kind: "node", label: "本地节点" },
        scope: "localDraft"
      },
      {
        choice: "keep-latest",
        description: "如果不打算保留这个对象，可改为保留服务端版本。",
        detail: { action: "added", id: "edge-local", kind: "edge", label: "本地连线" },
        scope: "localDraft"
      }
    ]);
  });

  it("builds a readable outcome message for applied conflict resolution drafts", () => {
    expect(
      buildGraphConflictResolutionOutcomeMessage([
        {
          decision: "keep-local",
          detail: { action: "added", id: "node-2", kind: "node", label: "姒傚康 B" },
          scope: "localDraft"
        },
        {
          decision: "keep-latest",
          detail: { action: "removed", id: "edge-legacy", kind: "edge", label: "鏃у叧绯?" },
          scope: "latestHead"
        },
        {
          decision: "review-later",
          detail: { action: "updated", id: "group-1", kind: "group", label: "缁?1" },
          scope: "localDraft"
        }
      ])
    ).toBe("已基于最新图谱生成合并草稿：保留本地 1 项，保留服务端 1 项，稍后处理 1 项（已沿用最新版本），请确认后保存");

    expect(buildGraphConflictResolutionOutcomeMessage([])).toBe("已基于最新图谱生成合并草稿，请确认后保存");
  });

  it("builds a keep-latest suggestion for invalid local node source references", () => {
    const current = buildDetail({
      document: buildDocument({
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "姒傚康 A",
            x: 0,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          },
          {
            id: "node-local",
            type: "text",
            title: "Broken local node",
            x: 260,
            y: 0,
            width: 220,
            height: 132,
            source: { type: "note", id: "", label: "Broken note" },
            metadata: {}
          }
        ],
        edges: [],
        groups: []
      })
    });

    expect(
      buildGraphConflictResolutionSuggestions({
        blockingIssues: [
          {
            message: "source-invalid",
            ruleType: "invalid_source_target",
            severity: "error",
            targetId: "node-local"
          }
        ],
        changeDetails: [{ action: "added", id: "node-local", kind: "node", label: "Broken local node" }],
        current,
        resolutionSelections: {
          "localDraft:node:node-local:added": "keep-local"
        }
      })
    ).toEqual([
      {
        choice: "keep-latest",
        description:
          "This node has incomplete source information. If you do not want to fix it now, keep the latest server version instead. source.type/source.id must exist together.",
        detail: { action: "added", id: "node-local", kind: "node", label: "Broken local node" },
        scope: "localDraft"
      }
    ]);
  });

  it("applies linked resolution suggestions into the current object-level selections", () => {
    expect(
      applyGraphConflictResolutionSuggestions({
        currentSelections: {
          "localDraft:edge:edge-local:added": "keep-local"
        },
        suggestions: [
          {
            choice: "keep-local",
            description: "补齐依赖节点",
            detail: { action: "added", id: "node-local", kind: "node", label: "本地节点" },
            scope: "localDraft"
          },
          {
            choice: "keep-latest",
            description: "回退到服务端版本",
            detail: { action: "removed", id: "edge-legacy", kind: "edge", label: "旧关系" },
            scope: "latestHead"
          }
        ]
      })
    ).toEqual({
      "localDraft:edge:edge-local:added": "keep-local",
      "localDraft:node:node-local:added": "keep-local",
      "latestHead:edge:edge-legacy:removed": "keep-latest"
    });
  });

  it("builds a readable batch suggestion outcome message when blockers are cleared", () => {
    expect(
      buildGraphConflictResolutionSuggestionOutcomeMessage({
        blockingIssues: [],
        suggestions: [
          {
            choice: "keep-local",
            description: "补齐依赖节点",
            detail: { action: "added", id: "node-local", kind: "node", label: "本地节点" },
            scope: "localDraft"
          },
          {
            choice: "keep-latest",
            description: "回退到服务端版本",
            detail: { action: "removed", id: "edge-legacy", kind: "edge", label: "旧关系" },
            scope: "latestHead"
          }
        ]
      })
    ).toBe("已批量标记 2 条联动取舍建议（保留本地 1 项，保留服务端 1 项），当前已解除依赖阻断，可继续应用已标记取舍");
  });

  it("builds a readable batch suggestion outcome message when blockers remain", () => {
    expect(
      buildGraphConflictResolutionSuggestionOutcomeMessage({
        blockingIssues: [
          {
            message: "连线“Local edge”会引用未保留的节点，请先同步保留相关节点或改为保留服务端。",
            ruleType: "dangling_edge",
            severity: "error",
            targetId: "edge-local"
          },
          {
            message: "分组“Local group”仍引用未保留的节点，请先同步保留相关节点或改为保留服务端。",
            ruleType: "invalid_group_node",
            severity: "error",
            targetId: "group-local"
          }
        ],
        suggestions: [
          {
            choice: "keep-local",
            description: "补齐依赖节点",
            detail: { action: "added", id: "node-local", kind: "node", label: "本地节点" },
            scope: "localDraft"
          }
        ]
      })
    ).toBe(
      "已批量标记 1 条联动取舍建议（保留本地 1 项），但仍有 2 个依赖问题待处理：edge-local、group-local，请继续调整后再应用"
    );
  });

  it("builds a concise blocking issue summary with a remainder count", () => {
    expect(
      buildGraphConflictResolutionBlockingIssueSummary([
        {
          message: "edge-local",
          ruleType: "dangling_edge",
          severity: "error",
          targetId: "edge-local"
        },
        {
          message: "group-local",
          ruleType: "invalid_group_node",
          severity: "error",
          targetId: "group-local"
        },
        {
          message: "node-local",
          ruleType: "invalid_node_size",
          severity: "error",
          targetId: "node-local"
        }
      ])
    ).toBe("edge-local、group-local 等 3 项");
  });

  it("builds a keep-latest suggestion for invalid local node sizes", () => {
    const current = buildDetail({
      document: buildDocument({
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "姒傚康 A",
            x: 0,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          },
          {
            id: "node-local",
            type: "text",
            title: "Oversized local node",
            x: 260,
            y: 0,
            width: 30,
            height: 20,
            metadata: {}
          }
        ],
        edges: [],
        groups: []
      })
    });

    expect(
      buildGraphConflictResolutionSuggestions({
        blockingIssues: [
          {
            message: "size-invalid",
            ruleType: "invalid_node_size",
            severity: "error",
            targetId: "node-local"
          }
        ],
        changeDetails: [{ action: "added", id: "node-local", kind: "node", label: "Oversized local node" }],
        current,
        resolutionSelections: {
          "localDraft:node:node-local:added": "keep-local"
        }
      })
    ).toEqual([
      {
        choice: "keep-latest",
        description: "This node size is outside the allowed range. If you do not want to fix it now, keep the latest server version instead.",
        detail: { action: "added", id: "node-local", kind: "node", label: "Oversized local node" },
        scope: "localDraft"
      }
    ]);
  });

  it("returns an empty summary when there are no differences", () => {
    const baseline = buildDetail();
    const current = buildDetail();

    expect(buildGraphUnsavedChangeSummary(current, baseline)).toEqual([]);
    expect(buildGraphUnsavedChangeSummary(current, null)).toEqual([]);
    expect(buildGraphConflictObjectDetails(current, baseline)).toEqual([]);
    expect(buildGraphConflictObjectDetails(current, null)).toEqual([]);
  });

  it("limits collection examples and truncates long text fields", () => {
    const baseline = buildDetail({
      title: "ABCDEFGHIJKLMNOPQRSTUVWXYZ012345",
      document: buildDocument({
        nodes: []
      })
    });
    const current = buildDetail({
      title: "abcdefghijklmnopqrstuvwxyz012345",
      document: buildDocument({
        nodes: [
          {
            id: "node-1",
            type: "text",
            title: "概念 A",
            x: 0,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          },
          {
            id: "node-2",
            type: "text",
            title: "概念 B",
            x: 260,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          },
          {
            id: "node-3",
            type: "text",
            title: "概念 C",
            x: 520,
            y: 0,
            width: 220,
            height: 132,
            metadata: {}
          }
        ]
      })
    });

    expect(buildGraphUnsavedChangeSummary(current, baseline)).toEqual([
      "标题已修改（当前：abcdefghijklmnopqrstuvwx...；基线：ABCDEFGHIJKLMNOPQRSTUVWX...）",
      "节点：新增 3 个（概念 A、概念 B 等）"
    ]);
  });

  it("builds a conflict report artifact with summary, object details, and a merge checklist", () => {
    const current = buildDetail({
      title: "图谱 / Draft",
      currentVersion: 5,
      document: buildDocument({
        version: 5
      })
    });

    const artifact = buildGraphConflictReportArtifact(
      {
        changeDetails: [{ action: "added", id: "node-2", kind: "node", label: "概念 B" }],
        changeSummary: ["节点：新增 1 个（概念 B）"],
        current,
        latestHeadDetails: [
          { action: "updated", id: "node-1", kind: "node", label: "概念 A（服务端）" },
          { action: "removed", id: "edge-legacy", kind: "edge", label: "旧关系" }
        ],
        latestHeadSummary: ["标题已修改（当前：图谱 / Draft；基线：图谱线上版）"],
        resolutionDrafts: [
          {
            decision: "keep-local",
            detail: { action: "added", id: "node-2", kind: "node", label: "概念 B" },
            scope: "localDraft"
          },
          {
            decision: "keep-latest",
            detail: { action: "removed", id: "edge-legacy", kind: "edge", label: "旧关系" },
            scope: "latestHead"
          }
        ]
      },
      "2026-07-02T09:10:00.000Z"
    );

    expect(artifact.filename).toBe("图谱 - Draft-conflict-summary.md");
    expect(artifact.mimeType).toBe("text/markdown;charset=utf-8");
    expect(artifact.content).toContain("## 建议优先核对的对象");
    expect(artifact.content).toContain("### 当前未保存修改");
    expect(artifact.content).toContain("- 节点｜新增｜概念 B");
    expect(artifact.content).toContain("### 与最新图谱相比");
    expect(artifact.content).toContain("- 节点｜修改｜概念 A（服务端）");
    expect(artifact.content).toContain("- 连线｜删除｜旧关系");
    expect(artifact.content).toContain("## 当前人工取舍草稿");
    expect(artifact.content).toContain("- 当前未保存修改｜节点｜新增｜概念 B｜保留本地");
    expect(artifact.content).toContain("- 与最新图谱相比｜连线｜删除｜旧关系｜保留服务端");
    expect(artifact.content).toContain("- 优先核对上方列出的关键对象明细，逐项确认哪些节点、连线或分组需要保留。");
    expect(artifact.content).toContain(
      "- 优先按照“当前人工取舍草稿”里已标记的对象级取舍执行；未标记项如果直接应用，会默认沿用最新图谱版本，建议继续逐项人工确认。"
    );
    expect(artifact.content).toContain("- 结合最新版本的关键对象明细，逐项确认哪些节点、连线或分组需要从服务端保留。");
  });

  it("builds a conflict bundle artifact for later manual comparison", () => {
    const current = buildDetail({
      title: "图谱 / Draft",
      currentVersion: 5,
      document: buildDocument({
        version: 5
      })
    });

    expect(
      JSON.parse(
        buildGraphConflictBundleArtifact(
          {
            changeDetails: [{ action: "added", id: "node-2", kind: "node", label: "概念 B" }],
            changeSummary: ["节点：新增 1 个（概念 B）"],
            current,
            currentDraftArtifact: {
              filename: "draft.smtg",
              mimeType: "application/json",
              content: "{\"kind\":\"draft\"}"
            },
            latestHeadArtifact: {
              filename: "latest.smtg",
              mimeType: "application/json",
              content: "{\"kind\":\"latest\"}"
            },
            latestHeadDetails: [{ action: "removed", id: "edge-legacy", kind: "edge", label: "旧关系" }],
            latestHeadSummary: ["标题已修改（当前：图谱 / Draft；基线：图谱线上版）"],
            reportArtifact: {
              filename: "conflict-summary.md",
              mimeType: "text/markdown",
              content: "# summary"
            },
            resolutionDrafts: [
              {
                decision: "keep-local",
                detail: { action: "added", id: "node-2", kind: "node", label: "概念 B" },
                scope: "localDraft"
              }
            ]
          },
          "2026-07-02T09:20:00.000Z"
        ).content
      )
    ).toEqual({
      exportedAt: "2026-07-02T09:20:00.000Z",
      graph: {
        currentVersion: 5,
        id: "graph-1",
        title: "图谱 / Draft"
      },
      kind: "studymate-graph-conflict-bundle",
      latestHead: {
        artifact: {
          content: "{\"kind\":\"latest\"}",
          filename: "latest.smtg",
          mimeType: "application/json"
        },
        details: [{ action: "removed", id: "edge-legacy", kind: "edge", label: "旧关系" }],
        summary: ["标题已修改（当前：图谱 / Draft；基线：图谱线上版）"]
      },
      localDraft: {
        artifact: {
          content: "{\"kind\":\"draft\"}",
          filename: "draft.smtg",
          mimeType: "application/json"
        },
        details: [{ action: "added", id: "node-2", kind: "node", label: "概念 B" }],
        summary: ["节点：新增 1 个（概念 B）"]
      },
      resolutionDraft: [
        {
          decision: "keep-local",
          detail: { action: "added", id: "node-2", kind: "node", label: "概念 B" },
          scope: "localDraft"
        }
      ],
      manualMergeChecklist: [
        "先留存当前草稿 JSON，避免后续重载或误操作覆盖本地修改。",
        "对照“当前未保存修改”摘要，确认这次本地草稿里需要保留的节点、连线和分组。",
        "优先核对上方列出的关键对象明细，逐项确认哪些节点、连线或分组需要保留。",
        "优先按照“当前人工取舍草稿”里已标记的对象级取舍执行；未标记项如果直接应用，会默认沿用最新图谱版本，建议继续逐项人工确认。",
        "对照“与最新图谱相比”摘要，确认服务端最新版本里需要补回或保留的改动。",
        "结合最新版本的关键对象明细，逐项确认哪些节点、连线或分组需要从服务端保留。",
        "如果要在外部工具中比对，优先同时使用当前草稿 JSON、最新图谱 JSON 和这份冲突摘要。",
        "完成取舍后，再决定是重载最新图谱，还是继续保留本地草稿整理后再保存。"
      ],
      report: {
        artifact: {
          content: "# summary",
          filename: "conflict-summary.md",
          mimeType: "text/markdown"
        }
      }
    });

    const withoutLatestHead = JSON.parse(
      buildGraphConflictBundleArtifact(
        {
          changeDetails: [{ action: "added", id: "node-2", kind: "node", label: "概念 B" }],
          changeSummary: ["节点：新增 1 个（概念 B）"],
          current,
          currentDraftArtifact: {
            filename: "draft.smtg",
            mimeType: "application/json",
            content: "{\"kind\":\"draft\"}"
          },
          latestHeadArtifact: null,
          latestHeadDetails: [],
          latestHeadError: "暂时无法获取最新图谱差异摘要",
          latestHeadSummary: [],
          reportArtifact: {
            filename: "conflict-summary.md",
            mimeType: "text/markdown",
            content: "# summary"
          },
          resolutionDrafts: []
        },
        "2026-07-02T09:20:00.000Z"
      ).content
    );

    expect(withoutLatestHead.latestHead).toBeNull();
    expect(withoutLatestHead.manualMergeChecklist).toContain(
      "先重新获取最新图谱差异或最新图谱 JSON，再开始人工合并，避免只按本地草稿做判断。"
    );
    expect(
      buildGraphConflictBundleArtifact(
        {
          changeDetails: [{ action: "added", id: "node-2", kind: "node", label: "概念 B" }],
          changeSummary: ["节点：新增 1 个（概念 B）"],
          current,
          currentDraftArtifact: {
            filename: "draft.smtg",
            mimeType: "application/json",
            content: "{\"kind\":\"draft\"}"
          },
          latestHeadArtifact: null,
          latestHeadDetails: [],
          latestHeadSummary: [],
          reportArtifact: {
            filename: "conflict-summary.md",
            mimeType: "text/markdown",
            content: "# summary"
          },
          resolutionDrafts: []
        },
        "2026-07-02T09:20:00.000Z"
      ).filename
    ).toBe("图谱 - Draft-conflict-bundle.json");
  });
});
