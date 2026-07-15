import { describe, expect, it } from "vitest";
import type { GraphNodePayload } from "../../../api/client";
import { resolveGraphSourceReviewFeedback } from "./graphSourceReviewFeedback";

function node(overrides: Partial<GraphNodePayload> = {}): GraphNodePayload {
  return {
    id: "node-1",
    type: "material",
    title: "Node",
    x: 0,
    y: 0,
    width: 240,
    height: 120,
    source: { type: "material", id: "material-1", label: "资料 A" },
    metadata: {},
    ...overrides
  };
}

describe("resolveGraphSourceReviewFeedback", () => {
  it("prefers review feedback embedded in node metadata", () => {
    const feedback = resolveGraphSourceReviewFeedback(
      node({
        metadata: {
          reviewFeedback: {
            sourceType: "material",
            sourceId: "material-1",
            totalCardCount: 3,
            reviewCardCount: 1,
            masteredCardCount: 1,
            masteryLevel: "building",
            masteryScore: 33,
            weakCardCount: 2,
            dueCount: 1,
            learningCount: 2,
            maxLapseCount: 3,
            sampleCardFronts: ["Card A"]
          }
        }
      }),
      []
    );

    expect(feedback).toMatchObject({
      totalCardCount: 3,
      masteredCardCount: 1,
      masteryLevel: "building",
      masteryScore: 33,
      weakCardCount: 2,
      dueCount: 1,
      learningCount: 2,
      maxLapseCount: 3,
      sampleCardFronts: ["Card A"]
    });
  });
});
