import { describe, expect, it } from "vitest";
import type { GraphDetailPayload } from "../../../api/client";
import {
  buildGraphWorkspaceDraftStorageKey,
  clearGraphWorkspaceLocalDraft,
  persistGraphWorkspaceLocalDraft,
  readGraphWorkspaceLocalDraft,
  recoverGraphWorkspaceLocalDraft
} from "./graphWorkspaceDraftRecovery";

const graphDetail: GraphDetailPayload = {
  id: "graph-1",
  ownerUserId: "user-1",
  title: "Graph",
  description: "desc",
  visibility: "private",
  status: "active",
  graphType: "knowledge",
  mode: "free",
  currentVersion: 4,
  nodeCount: 0,
  edgeCount: 0,
  createdAt: "2026-06-05T08:00:00Z",
  updatedAt: "2026-06-05T08:00:00Z",
  document: {
    graphId: "graph-1",
    version: 4,
    schemaVersion: 1,
    viewport: { x: 140, y: 120, zoom: 1 },
    nodes: [],
    edges: [],
    groups: [],
    theme: {},
    metadata: {}
  }
};

describe("graphWorkspaceDraftRecovery", () => {
  it("persists, reads, and clears a graph-local draft in browser storage", () => {
    const storage = window.sessionStorage;
    clearGraphWorkspaceLocalDraft(storage, graphDetail.id);

    persistGraphWorkspaceLocalDraft(storage, {
      ...graphDetail,
      title: "Dirty graph",
      document: {
        ...graphDetail.document,
        nodes: [
          {
            id: "node-1",
            type: "concept",
            title: "Recovered node",
            x: 120,
            y: 140,
            width: 220,
            height: 132,
            source: null,
            metadata: {}
          }
        ]
      }
    });

    expect(readGraphWorkspaceLocalDraft(storage, graphDetail.id)).toMatchObject({
      graphId: "graph-1",
      currentVersion: 4,
      title: "Dirty graph"
    });

    clearGraphWorkspaceLocalDraft(storage, graphDetail.id);
    expect(storage.getItem(buildGraphWorkspaceDraftStorageKey(graphDetail.id))).toBeNull();
  });

  it("only recovers a local draft when the server head version still matches", () => {
    const matchingDraft = {
      graphId: "graph-1",
      currentVersion: 4,
      title: "Recovered graph",
      description: "dirty copy",
      savedAt: "2026-07-01T10:00:00Z",
      document: {
        ...graphDetail.document,
        nodes: [
          {
            id: "node-1",
            type: "concept",
            title: "Recovered node",
            x: 120,
            y: 140,
            width: 220,
            height: 132,
            source: null,
            metadata: {}
          }
        ]
      }
    };

    const recovered = recoverGraphWorkspaceLocalDraft(graphDetail, matchingDraft);
    expect(recovered.recovered).toBe(true);
    expect(recovered.detail.title).toBe("Recovered graph");
    expect(recovered.detail.document.nodes).toHaveLength(1);

    const stale = recoverGraphWorkspaceLocalDraft(
      {
        ...graphDetail,
        currentVersion: 5,
        document: { ...graphDetail.document, version: 5 }
      },
      matchingDraft
    );
    expect(stale.recovered).toBe(false);
    expect(stale.stale).toBe(true);
    expect(stale.detail.currentVersion).toBe(5);
    expect(stale.detail.document.nodes).toHaveLength(0);
  });
});
