import { describe, expect, it } from "vitest";
import type { GraphDetailPayload } from "../../../../api/client";
import { buildGraphBatchSaveCommand } from "./graphPersistenceCommands";

const detail: GraphDetailPayload = {
  id: "graph-1",
  ownerUserId: "user-1",
  title: "Learning Graph",
  description: "Graph description",
  visibility: "private",
  status: "active",
  graphType: "knowledge",
  mode: "freeform",
  currentVersion: 7,
  nodeCount: 2,
  edgeCount: 0,
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z",
  document: {
    graphId: "graph-1",
    schemaVersion: 1,
    version: 7,
    viewport: {
      x: 0,
      y: 0,
      zoom: 1
    },
    nodes: [
      {
        id: "node-1",
        type: "concept",
        title: "Runtime node",
        x: 0,
        y: 0,
        width: 120,
        height: 80,
        metadata: {
          reviewFeedback: {
            dueCount: 1,
            learningCount: 0,
            masteredCardCount: 0,
            masteryScore: 12,
            maxLapseCount: 0,
            reviewCardCount: 0,
            sampleCardFronts: [],
            totalCardCount: 2,
            weakCardCount: 1
          },
          stableKey: "keep-me"
        }
      },
      {
        id: "node-2",
        type: "concept",
        title: "Only runtime",
        x: 0,
        y: 120,
        width: 120,
        height: 80,
        metadata: {
          reviewFeedback: {
            dueCount: 0,
            learningCount: 0,
            masteredCardCount: 1,
            masteryScore: 100,
            maxLapseCount: 0,
            reviewCardCount: 1,
            sampleCardFronts: [],
            totalCardCount: 1,
            weakCardCount: 0
          }
        }
      }
    ],
    edges: [],
    groups: [],
    metadata: {},
    theme: {}
  }
};

describe("graphPersistenceCommands", () => {
  it("builds save payloads without persisting runtime review feedback", () => {
    const command = buildGraphBatchSaveCommand(detail, "Manual save");

    expect(command).toMatchObject({
      title: "Learning Graph",
      description: "Graph description",
      summary: "Manual save"
    });
    expect(command.document.nodes[0].metadata).toEqual({ stableKey: "keep-me" });
    expect(command.document.nodes[1].metadata).toBeUndefined();
  });
});
