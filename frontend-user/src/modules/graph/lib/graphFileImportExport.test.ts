import { describe, expect, it } from "vitest";
import type { GraphDetailPayload, GraphDocumentPayload } from "../../../api/client";
import {
  buildGraphExportArtifact,
  buildGraphImportSourceTargets,
  buildGraphValidationOutcome,
  buildRemoteGraphImportOutcome,
  parseGraphJsonImport,
  toGraphValidationIssues
} from "./graphFileImportExport";

function buildDocument(overrides?: Partial<GraphDocumentPayload>): GraphDocumentPayload {
  return {
    graphId: "graph-1",
    version: 7,
    schemaVersion: 1,
    viewport: { x: 120, y: 80, zoom: 1 },
    nodes: [
      {
        id: "node-1",
        type: "note",
        title: "Retrieval practice",
        x: 0,
        y: 0,
        width: 240,
        height: 120,
        source: { type: "note", id: "note-1", label: "Learning note" }
      },
      {
        id: "node-2",
        type: "card",
        title: "Card",
        x: 280,
        y: 0,
        width: 240,
        height: 120,
        source: { type: "card", id: "card-1", label: "Card" }
      }
    ],
    edges: [{ id: "edge-1", sourceNodeId: "node-1", targetNodeId: "node-2", kind: "curve" }],
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
    title: 'Study: Graph<>"/bad',
    description: "desc",
    visibility: "private",
    status: "active",
    graphType: "knowledge",
    mode: "free",
    currentVersion: document.version,
    nodeCount: document.nodes.length,
    edgeCount: document.edges.length,
    createdAt: "2026-06-04T00:00:00Z",
    updatedAt: "2026-06-04T00:00:00Z",
    document,
    ...overrides
  };
}

describe("graphFileImportExport", () => {
  it("builds safe StudyMate JSON export artifacts", () => {
    const exported = buildGraphExportArtifact({ detail: buildDetail(), kind: "json" }, "2026-06-04T00:00:00.000Z");

    expect(exported.filename).toBe("Study- Graph-bad.smtg");
    expect(exported.mimeType).toBe("application/vnd.studymate.graph+json");
    expect(JSON.parse(exported.content).document.nodes).toHaveLength(2);
  });

  it("builds safe SVG export artifacts from the current canvas document", () => {
    const detail = buildDetail();
    const nodeMap = new Map(detail.document.nodes.map((node) => [node.id, node]));

    const exported = buildGraphExportArtifact({
      detail,
      hiddenNodeIds: new Set<string>(),
      kind: "svg",
      nodeMap
    });

    expect(exported.filename).toBe("Study- Graph-bad.svg");
    expect(exported.mimeType).toBe("image/svg+xml;charset=utf-8");
    expect(exported.content).toContain("<svg");
    expect(exported.content).toContain("Retrieval practice");
  });

  it("parses valid StudyMate graph JSON into the current graph document identity", () => {
    const exported = buildGraphExportArtifact({ detail: buildDetail(), kind: "json" }, "2026-06-04T00:00:00.000Z");
    const parsed = parseGraphJsonImport(exported.content, buildDocument({ graphId: "current", version: 9 }));

    expect(parsed.document.graphId).toBe("current");
    expect(parsed.document.version).toBe(9);
    expect(parsed.statusMessage).toBe("已导入 StudyMate 图谱 JSON");
    expect(parsed.issues).toEqual([]);
  });

  it("returns validation issues and blocking counts for invalid imported graph JSON", () => {
    const imported = {
      schemaVersion: 1,
      nodes: [{ id: "node-1", type: "concept", title: "Broken", x: 0, y: 0, width: 10, height: 10 }],
      edges: [{ id: "edge-1", sourceNodeId: "node-1", targetNodeId: "missing" }],
      groups: [{ id: "group-1", title: "Empty", nodeIds: [], x: 0, y: 0, width: 100, height: 80, collapsed: false }],
      viewport: { x: 0, y: 0, zoom: 1 }
    };

    const parsed = parseGraphJsonImport(JSON.stringify(imported), buildDocument());
    const issues = toGraphValidationIssues(parsed.issues);

    expect(parsed.blockingIssueCount).toBe(2);
    expect(parsed.statusMessage).toBe("导入 JSON 失败：发现 2 条结构错误");
    expect(issues.map((issue) => issue.ruleType)).toContain("dangling_edge");
    expect(issues.map((issue) => issue.ruleType)).toContain("invalid_node_size");
    expect(issues.map((issue) => issue.ruleType)).toContain("missing_source");
  });

  it("returns blocking issues for duplicate ids and invalid edge targets", () => {
    const imported = {
      schemaVersion: 1,
      nodes: [
        {
          id: "node-1",
          type: "concept",
          title: "Duplicate",
          x: 0,
          y: 0,
          width: 240,
          height: 120,
          source: { type: "note", id: "note-1" }
        },
        {
          id: "node-1",
          type: "concept",
          title: "Duplicate",
          x: 260,
          y: 0,
          width: 240,
          height: 120,
          source: { type: "note", id: "note-2" }
        }
      ],
      edges: [{ id: "edge-1", sourceNodeId: "node-1", targetNodeId: "missing-node" }],
      groups: [],
      viewport: { x: 0, y: 0, zoom: 1 }
    };

    const issues = toGraphValidationIssues(parseGraphJsonImport(JSON.stringify(imported), buildDocument()).issues);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ ruleType: "duplicate_node_id", severity: "error" }),
        expect.objectContaining({ ruleType: "dangling_edge", severity: "error" })
      ])
    );
  });

  it("validates imported source targets against known workspace sources", () => {
    const imported = {
      schemaVersion: 1,
      nodes: [
        {
          id: "node-1",
          type: "concept",
          title: "Unknown source",
          x: 0,
          y: 0,
          width: 240,
          height: 120,
          source: { type: "note", id: "missing-note" }
        }
      ],
      edges: [],
      groups: [],
      viewport: { x: 0, y: 0, zoom: 1 }
    };
    const sourceTargets = buildGraphImportSourceTargets({
      currentDocument: buildDocument(),
      materials: [],
      notes: []
    });

    const issues = toGraphValidationIssues(
      parseGraphJsonImport(JSON.stringify(imported), buildDocument(), { sourceTargets }).issues
    );

    expect(issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ ruleType: "invalid_source_target", severity: "error" })])
    );
  });

  it("normalizes remote Markdown and Mermaid import results behind one interface", () => {
    const markdownImported = buildRemoteGraphImportOutcome(
      buildDetail({
        title: "Markdown graph",
        currentVersion: 5,
        document: buildDocument({ version: 5, graphId: "remote-markdown" })
      }),
      "markdown"
    );
    const mermaidImported = buildRemoteGraphImportOutcome(
      buildDetail({
        title: "Mermaid graph",
        currentVersion: 6,
        document: buildDocument({ version: 6, graphId: "remote-mermaid" })
      }),
      "mermaid"
    );

    expect(markdownImported.resetLabel).toBe("导入 Markdown 大纲");
    expect(markdownImported.statusMessage).toBe("已导入 Markdown 大纲");
    expect(markdownImported.detail.document.graphId).toBe("graph-1");
    expect(markdownImported.detail.document.version).toBe(5);

    expect(mermaidImported.resetLabel).toBe("导入 Mermaid 草稿");
    expect(mermaidImported.statusMessage).toBe("已导入 Mermaid 草稿");
    expect(mermaidImported.detail.document.graphId).toBe("graph-1");
    expect(mermaidImported.detail.document.version).toBe(6);
  });

  it("summarizes remote validation responses for controller and hooks", () => {
    expect(buildGraphValidationOutcome([]).statusMessage).toBe("图谱校验通过");
    expect(
      buildGraphValidationOutcome([
        { ruleType: "missing_source", message: "节点缺少来源", severity: "warning", targetId: "node-1" }
      ]).statusMessage
    ).toBe("发现 1 条校验提示");
  });

  it("rejects unsupported schema versions", () => {
    expect(() => parseGraphJsonImport(JSON.stringify({ schemaVersion: 99 }), buildDocument())).toThrow(
      /Unsupported StudyMate graph schema/
    );
  });
});
