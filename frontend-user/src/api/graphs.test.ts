import { afterEach, describe, expect, it, vi } from "vitest";
import {
  batchSaveGraph,
  importGraphMarkdown,
  importGraphMermaid,
  listDiagramTemplates,
  listGraphSnapshots,
  previewGraphLayout,
  restoreGraphSnapshot,
  validateGraph
} from "./client";
import type { AuthSession, GraphDocumentPayload } from "./types";

const session: AuthSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-06-02T12:00:00Z",
  user: {
    id: "user-1",
    username: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    role: "student"
  }
};

const documentPayload: GraphDocumentPayload = {
  graphId: "graph-1",
  version: 4,
  schemaVersion: 1,
  viewport: { x: 0, y: 0, zoom: 1 },
  nodes: [{ id: "node-1", type: "concept", title: "Node", x: 0, y: 0, width: 240, height: 120 }],
  edges: [],
  groups: [],
  theme: {},
  metadata: {}
};

function mockApiResponse<T>(data: T) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("graph API clients", () => {
  it("saves graph documents through the batch-save lifecycle endpoint", async () => {
    const fetchMock = mockApiResponse({
      id: "graph-1",
      ownerUserId: "user-1",
      title: "Graph",
      description: "desc",
      visibility: "private",
      status: "active",
      graphType: "knowledge",
      mode: "free",
      currentVersion: 5,
      nodeCount: 1,
      edgeCount: 0,
      createdAt: "2026-06-02T12:00:00Z",
      updatedAt: "2026-06-02T12:10:00Z",
      document: { ...documentPayload, version: 5 }
    });

    await batchSaveGraph(session, "graph-1", {
      title: "Graph",
      description: "desc",
      summary: "手动保存",
      document: documentPayload
    });

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/v1/graphs/graph-1/batch-save");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer access-token",
      "Content-Type": "application/json"
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      title: "Graph",
      description: "desc",
      summary: "手动保存",
      document: documentPayload
    });
  });

  it("loads snapshots and restores a selected version", async () => {
    const fetchMock = mockApiResponse([
      {
        id: "snapshot-1",
        graphId: "graph-1",
        versionNumber: 3,
        summary: "恢复点",
        createdAt: "2026-06-02T12:00:00Z"
      }
    ]);

    await listGraphSnapshots(session, "graph-1");
    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/graphs/graph-1/snapshots");
    expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({
      Authorization: "Bearer access-token"
    });

    fetchMock.mockClear();
    await restoreGraphSnapshot(session, "graph-1", 3);

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/v1/graphs/graph-1/restore");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ versionNumber: 3 });
  });

  it("posts source swimlane layout previews to the graph layout endpoint", async () => {
    const fetchMock = mockApiResponse({
      mode: "source-swimlane",
      statusMessage: "已生成 2 条来源泳道",
      document: documentPayload,
      selectedNodeIds: ["node-1", "node-2"],
      laneCount: 2
    });

    await previewGraphLayout(session, "graph-1", {
      mode: "source-swimlane",
      nodeIds: ["node-1", "node-2"],
      document: documentPayload
    });

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/v1/graphs/graph-1/layouts/preview");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer access-token",
      "Content-Type": "application/json"
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      mode: "source-swimlane",
      nodeIds: ["node-1", "node-2"],
      document: documentPayload
    });
  });

  it("posts markdown and mermaid imports plus validate requests to graph lifecycle endpoints", async () => {
    const fetchMock = mockApiResponse({ issues: [] });

    await importGraphMarkdown(session, "graph-1", "# Outline");
    await importGraphMermaid(session, "graph-1", "flowchart TD\nA --> B");
    await validateGraph(session, "graph-1");

    expect(fetchMock.mock.calls.map(([path]) => path)).toEqual([
      "/api/v1/graphs/graph-1/import/markdown",
      "/api/v1/graphs/graph-1/import/mermaid",
      "/api/v1/graphs/graph-1/validate"
    ]);
    expect(fetchMock.mock.calls[0][1]?.method).toBe("POST");
    expect(fetchMock.mock.calls[1][1]?.method).toBe("POST");
    expect(fetchMock.mock.calls[2][1]?.method).toBe("POST");
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ source: "# Outline" });
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({ source: "flowchart TD\nA --> B" });
    expect(fetchMock.mock.calls[2][1]?.headers).toMatchObject({
      Authorization: "Bearer access-token"
    });
  });

  it("loads diagram templates from the shared template endpoint", async () => {
    const fetchMock = mockApiResponse([
      {
        id: "uml-class-diagram",
        name: "UML 类图",
        category: "uml",
        description: "工程图模板",
        mode: "diagram",
        sampleLines: ["领域模型", "核心类", "接口契约"]
      }
    ]);

    await listDiagramTemplates(session);

    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/v1/diagram/templates");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer access-token"
    });
  });
});
