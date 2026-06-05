import { describe, expect, it } from "vitest";
import type { GraphDetailPayload, GraphSummaryPayload } from "../../../api/types";
import {
  buildGraphWorkspaceLoadedStatus,
  buildGraphWorkspaceResourceState,
  normalizeGraphWorkspaceDetail
} from "./graphWorkspaceLoadState";

const timestamp = "2026-06-05T10:20:00Z";

function makeGraph(id: string, updatedAt: string): GraphSummaryPayload {
  return {
    id,
    ownerUserId: "user-1",
    title: `Graph ${id}`,
    description: "",
    visibility: "private",
    status: "active",
    graphType: "knowledge",
    mode: "study",
    currentVersion: 3,
    nodeCount: 0,
    edgeCount: 0,
    createdAt: timestamp,
    updatedAt
  };
}

function makeDetail(id: string): GraphDetailPayload {
  return {
    ...makeGraph(id, timestamp),
    document: {
      graphId: id,
      version: 3,
      schemaVersion: 1,
      viewport: { x: 1, y: 2, zoom: 1.5 },
      nodes: [],
      edges: [],
      groups: []
    }
  };
}

describe("graph workspace load state", () => {
  it("selects the requested graph when it exists and falls back to the first graph", () => {
    const first = makeGraph("graph-a", "2026-06-05T10:00:00Z");
    const requested = makeGraph("graph-b", "2026-06-05T10:10:00Z");

    expect(buildGraphWorkspaceResourceState({ graphs: [first, requested], decks: [] }, "graph-b")).toMatchObject({
      initialGraphId: "graph-b",
      selectedDraftDeckId: ""
    });
    expect(buildGraphWorkspaceResourceState({ graphs: [first, requested], decks: [] }, "missing")).toMatchObject({
      initialGraphId: "graph-a"
    });
  });

  it("keeps the current draft deck when present and otherwise chooses the first deck", () => {
    const deck = {
      id: "deck-1",
      ownerUserId: "user-1",
      title: "复习牌组",
      description: "",
      visibility: "private",
      cardCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    expect(buildGraphWorkspaceResourceState({ graphs: [makeGraph("graph-a", timestamp)], decks: [deck] }, "")).toMatchObject({
      selectedDraftDeckId: "deck-1"
    });
    expect(
      buildGraphWorkspaceResourceState({ graphs: [makeGraph("graph-a", timestamp)], decks: [deck] }, "", "deck-current")
    ).toMatchObject({
      selectedDraftDeckId: "deck-current"
    });
  });

  it("normalizes graph details and replaces missing documents with an empty graph document", () => {
    const normalized = normalizeGraphWorkspaceDetail({
      ...makeDetail("graph-a"),
      document: {
        ...makeDetail("graph-a").document,
        graphId: "",
        version: 0,
        schemaVersion: 0,
        viewport: { x: 999, y: 999, zoom: 99 }
      }
    });

    expect(normalized.document.graphId).toBe("graph-a");
    expect(normalized.document.version).toBe(3);
    expect(normalized.document.schemaVersion).toBe(1);
    expect(normalized.document.viewport.zoom).toBe(1);
  });

  it("preserves snapshot failure messaging instead of overwriting it with ready copy", () => {
    expect(buildGraphWorkspaceLoadedStatus("created", true)).toBe("已创建第一张图谱");
    expect(buildGraphWorkspaceLoadedStatus("loaded", true)).toBe("图谱工作台已就绪");
    expect(buildGraphWorkspaceLoadedStatus("opened", true)).toBe("已切换到目标图谱");
    expect(buildGraphWorkspaceLoadedStatus("loaded", false)).toContain("快照列表加载失败");
  });
});
