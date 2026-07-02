import { describe, expect, it } from "vitest";
import type { GraphDetailPayload, GraphDocumentPayload } from "../../../api/client";
import {
  buildGraphConflictBundleArtifact,
  buildGraphConflictReportArtifact,
  buildGraphUnsavedChangeSummary
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

  it("falls back to viewport changes when structure counts are unchanged", () => {
    const baseline = buildDetail();
    const current = buildDetail({
      document: buildDocument({
        viewport: { x: 180, y: 96, zoom: 1.1 }
      })
    });

    expect(buildGraphUnsavedChangeSummary(current, baseline)).toEqual(["画布视口已调整"]);
  });

  it("returns an empty summary when there are no differences", () => {
    const baseline = buildDetail();
    const current = buildDetail();

    expect(buildGraphUnsavedChangeSummary(current, baseline)).toEqual([]);
    expect(buildGraphUnsavedChangeSummary(current, null)).toEqual([]);
  });

  it("limits collection examples and truncates long text fields", () => {
    const baseline = buildDetail({
      title: "一个很长很长很长很长的基线标题文本",
      document: buildDocument({
        nodes: []
      })
    });
    const current = buildDetail({
      title: "一个很长很长很长很长的当前标题文本",
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
      "标题已修改（当前：一个很长很长很长很长的当前标题文本；基线：一个很长很长很长很长的基线标题文本）",
      "节点：新增 3 个（概念 A、概念 B 等）"
    ]);
  });

  it("builds a portable conflict report artifact with local and latest-head summaries", () => {
    const current = buildDetail({
      title: "图谱 / Draft",
      currentVersion: 5,
      document: buildDocument({
        version: 5
      })
    });

    expect(
      buildGraphConflictReportArtifact(
        {
          current,
          changeSummary: ["节点：新增 1 个（概念 B）"],
          latestHeadSummary: ["标题已修改（当前：图谱 / Draft；基线：图谱线上版）"]
        },
        "2026-07-02T09:10:00.000Z"
      )
    ).toEqual({
      filename: "图谱 - Draft-conflict-summary.md",
      mimeType: "text/markdown;charset=utf-8",
      content: [
        "# StudyMate 图谱冲突摘要",
        "",
        "- 导出时间：2026-07-02T09:10:00.000Z",
        "- 图谱标题：图谱 / Draft",
        "- 图谱 ID：graph-1",
        "- 当前版本：5",
        "",
        "## 当前未保存修改",
        "- 节点：新增 1 个（概念 B）",
        "",
        "## 与最新图谱相比",
        "- 标题已修改（当前：图谱 / Draft；基线：图谱线上版）"
      ].join("\n")
    });
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
            current,
            changeSummary: ["节点：新增 1 个（概念 B）"],
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
            latestHeadSummary: ["标题已修改（当前：图谱 / Draft；基线：图谱线上版）"],
            reportArtifact: {
              filename: "conflict-summary.md",
              mimeType: "text/markdown",
              content: "# summary"
            }
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
        summary: ["标题已修改（当前：图谱 / Draft；基线：图谱线上版）"]
      },
      localDraft: {
        artifact: {
          content: "{\"kind\":\"draft\"}",
          filename: "draft.smtg",
          mimeType: "application/json"
        },
        summary: ["节点：新增 1 个（概念 B）"]
      },
      report: {
        artifact: {
          content: "# summary",
          filename: "conflict-summary.md",
          mimeType: "text/markdown"
        }
      }
    });

    expect(
      buildGraphConflictBundleArtifact(
        {
          current,
          changeSummary: ["节点：新增 1 个（概念 B）"],
          currentDraftArtifact: {
            filename: "draft.smtg",
            mimeType: "application/json",
            content: "{\"kind\":\"draft\"}"
          },
          latestHeadArtifact: null,
          latestHeadSummary: [],
          reportArtifact: {
            filename: "conflict-summary.md",
            mimeType: "text/markdown",
            content: "# summary"
          }
        },
        "2026-07-02T09:20:00.000Z"
      ).filename
    ).toBe("图谱 - Draft-conflict-bundle.json");
  });
});
