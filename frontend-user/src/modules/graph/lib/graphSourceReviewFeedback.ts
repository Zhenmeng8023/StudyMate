import type { GraphNodePayload, ReviewFeedbackSourcePayload } from "../../../api/client";

export type GraphSourceReviewFeedback = {
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
  if (!matched || matched.weakCardCount <= 0) {
    return null;
  }

  return {
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
