import type { GraphNodePayload, ReviewFeedbackSourcePayload } from "../../../api/client";

export type GraphSourceReviewFeedback = {
  totalCardCount: number;
  reviewCardCount: number;
  masteredCardCount: number;
  masteryLevel: string;
  masteryScore: number;
  weakCardCount: number;
  dueCount: number;
  learningCount: number;
  maxLapseCount: number;
  sampleCardFronts: string[];
};

export function resolveGraphSourceReviewFeedback(
  node: Pick<GraphNodePayload, "source"> | null | undefined,
  summaries: ReviewFeedbackSourcePayload[]
): GraphSourceReviewFeedback | null {
  const sourceType = normalizeSourceType(node?.source?.type);
  const sourceId = node?.source?.id?.trim();
  if (!sourceType || !sourceId || summaries.length === 0) {
    return null;
  }

  const matched = summaries.find(
    (summary) => normalizeSourceType(summary.sourceType) === sourceType && summary.sourceId?.trim() === sourceId
  );
  if (!matched || (matched.totalCardCount ?? 0) <= 0) {
    return null;
  }

  return {
    totalCardCount: matched.totalCardCount,
    reviewCardCount: matched.reviewCardCount,
    masteredCardCount: matched.masteredCardCount,
    masteryLevel: matched.masteryLevel ?? "building",
    masteryScore: matched.masteryScore,
    weakCardCount: matched.weakCardCount,
    dueCount: matched.dueCount,
    learningCount: matched.learningCount,
    maxLapseCount: matched.maxLapseCount,
    sampleCardFronts: matched.sampleCardFronts ?? []
  };
}

function normalizeSourceType(sourceType: string | undefined) {
  return sourceType?.trim().toLowerCase().replace(/_/g, "-") ?? "";
}
