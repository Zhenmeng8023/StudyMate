import { describe, expect, it } from "vitest";
import type { ReviewFeedbackPayload } from "../../../../api/client";
import { applyGraphLearningFeedbackRefreshFailure, applyGraphLearningFeedbackRefreshSuccess } from "./graphLearningFeedbackRuntime";

const currentFeedback: ReviewFeedbackPayload = {
  dueCount: 1,
  learningCount: 1,
  weakCardCount: 0,
  weakCards: [],
  sourceSummaries: [
    {
      sourceType: "graph-node",
      sourceId: "node-1",
      totalCardCount: 1,
      reviewCardCount: 0,
      masteredCardCount: 0,
      masteryLevel: "building",
      masteryScore: 0,
      weakCardCount: 0,
      dueCount: 1,
      learningCount: 1,
      maxLapseCount: 0,
      sampleCardFronts: ["旧卡"]
    }
  ]
};

describe("graph learning feedback runtime", () => {
  it("returns a success plan without touching graph document state", () => {
    const nextFeedback: ReviewFeedbackPayload = { ...currentFeedback, dueCount: 0, learningCount: 0 };

    expect(applyGraphLearningFeedbackRefreshSuccess(nextFeedback)).toEqual({
      reviewFeedback: nextFeedback,
      statusMessage: "已刷新学习反馈",
      preserveDocumentState: true
    });
  });

  it("keeps the previous runtime feedback visible when refresh fails", () => {
    expect(applyGraphLearningFeedbackRefreshFailure(currentFeedback, new Error("网络暂不可用"))).toEqual({
      reviewFeedback: currentFeedback,
      statusMessage: "网络暂不可用",
      preserveDocumentState: true,
      retryable: true
    });
  });
});
