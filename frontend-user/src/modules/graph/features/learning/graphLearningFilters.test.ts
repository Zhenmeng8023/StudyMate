import { describe, expect, it } from "vitest";
import type { GraphNodePayload } from "../../../../api/client";
import type { GraphSourceReviewFeedback } from "../../lib/graphSourceReviewFeedback";
import { buildGraphLearningFilterState } from "./graphLearningFilters";

const nodes: GraphNodePayload[] = [
  { id: "node-weak", type: "concept", title: "Weak", x: 0, y: 0, width: 120, height: 80 },
  { id: "node-due", type: "concept", title: "Due", x: 0, y: 0, width: 120, height: 80 },
  { id: "node-mastered", type: "concept", title: "Mastered", x: 0, y: 0, width: 120, height: 80 },
  { id: "node-uncarded", type: "concept", title: "Uncarded", x: 0, y: 0, width: 120, height: 80 }
];

function feedback(overrides: Partial<GraphSourceReviewFeedback>): GraphSourceReviewFeedback {
  return {
    totalCardCount: 1,
    reviewCardCount: 0,
    masteredCardCount: 0,
    masteryLevel: "building",
    masteryScore: 0,
    weakCardCount: 0,
    dueCount: 0,
    learningCount: 0,
    maxLapseCount: 0,
    sampleCardFronts: [],
    ...overrides
  };
}

const reviewFeedbackByNodeId = new Map<string, GraphSourceReviewFeedback | null>([
  ["node-weak", feedback({ weakCardCount: 1 })],
  ["node-due", feedback({ dueCount: 2 })],
  ["node-mastered", feedback({ masteredCardCount: 1, masteryLevel: "solid" })]
]);

describe("graphLearningFilters", () => {
  it("builds stable learning state counts and filter options", () => {
    const state = buildGraphLearningFilterState({
      filter: "all",
      nodes,
      reviewFeedbackByNodeId
    });

    expect(state.filteredNodeIds).toBeNull();
    expect(state.stateCounts).toEqual({
      learning: 1,
      mastered: 1,
      unlearned: 1,
      weak: 1
    });
    expect(state.options).toEqual([
      { count: 4, filter: "all", label: "全部" },
      { count: 1, filter: "weak", label: "薄弱" },
      { count: 1, filter: "due", label: "到期" },
      { count: 1, filter: "uncarded", label: "未制卡" },
      { count: 1, filter: "mastered", label: "已掌握" }
    ]);
  });

  it("returns only node ids matching the active learning filter", () => {
    const weak = buildGraphLearningFilterState({ filter: "weak", nodes, reviewFeedbackByNodeId });
    const due = buildGraphLearningFilterState({ filter: "due", nodes, reviewFeedbackByNodeId });
    const uncarded = buildGraphLearningFilterState({ filter: "uncarded", nodes, reviewFeedbackByNodeId });
    const mastered = buildGraphLearningFilterState({ filter: "mastered", nodes, reviewFeedbackByNodeId });

    expect([...(weak.filteredNodeIds ?? [])]).toEqual(["node-weak"]);
    expect([...(due.filteredNodeIds ?? [])]).toEqual(["node-due"]);
    expect([...(uncarded.filteredNodeIds ?? [])]).toEqual(["node-uncarded"]);
    expect([...(mastered.filteredNodeIds ?? [])]).toEqual(["node-mastered"]);
  });
});
