import { describe, expect, it } from "vitest";
import type { GraphNodePayload } from "../../../api/client";
import { resolveGraphLearningState, resolveGraphSourceReviewFeedback } from "./graphSourceReviewFeedback";

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
  it("prefers the latest source summary when one matches the selected node", () => {
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
      [
        {
          sourceType: "material",
          sourceId: "material-1",
          totalCardCount: 3,
          reviewCardCount: 1,
          masteredCardCount: 3,
          masteryLevel: "solid",
          masteryScore: 100,
          weakCardCount: 0,
          dueCount: 0,
          learningCount: 0,
          maxLapseCount: 0,
          sampleCardFronts: ["Card B"],
          lastReviewedAt: "2026-11-16T08:00:00Z"
        }
      ]
    );

    expect(feedback).toMatchObject({
      totalCardCount: 3,
      masteredCardCount: 3,
      masteryLevel: "solid",
      masteryScore: 100,
      weakCardCount: 0,
      dueCount: 0,
      learningCount: 0,
      maxLapseCount: 0,
      sampleCardFronts: ["Card B"],
      lastReviewedAt: "2026-11-16T08:00:00Z"
    });
  });

  it("falls back to review feedback embedded in node metadata when no fresh summary matches", () => {
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

  it("classifies graph learning state from runtime review feedback", () => {
    expect(resolveGraphLearningState(null)).toBe("unlearned");
    expect(
      resolveGraphLearningState({
        totalCardCount: 2,
        reviewCardCount: 0,
        masteredCardCount: 0,
        masteryLevel: "building",
        masteryScore: 20,
        weakCardCount: 0,
        dueCount: 0,
        learningCount: 2,
        maxLapseCount: 0,
        sampleCardFronts: []
      })
    ).toBe("learning");
    expect(
      resolveGraphLearningState({
        totalCardCount: 2,
        reviewCardCount: 1,
        masteredCardCount: 0,
        masteryLevel: "weak",
        masteryScore: 20,
        weakCardCount: 1,
        dueCount: 1,
        learningCount: 1,
        maxLapseCount: 2,
        sampleCardFronts: []
      })
    ).toBe("weak");
    expect(
      resolveGraphLearningState({
        totalCardCount: 2,
        reviewCardCount: 2,
        masteredCardCount: 2,
        masteryLevel: "solid",
        masteryScore: 100,
        weakCardCount: 0,
        dueCount: 0,
        learningCount: 0,
        maxLapseCount: 0,
        sampleCardFronts: []
      })
    ).toBe("mastered");
  });
});
