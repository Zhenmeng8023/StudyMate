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
  node: Pick<GraphNodePayload, "source" | "metadata"> | null | undefined,
  summaries: ReviewFeedbackSourcePayload[]
): GraphSourceReviewFeedback | null {
  const matched = findMatchingSourceSummary(node, summaries);
  if (matched) {
    return toGraphSourceReviewFeedback(matched);
  }

  const embedded = toGraphSourceReviewFeedback(readEmbeddedReviewFeedback(node));
  if (embedded) {
    return embedded;
  }

  return null;
}

function findMatchingSourceSummary(
  node: Pick<GraphNodePayload, "source"> | null | undefined,
  summaries: ReviewFeedbackSourcePayload[]
) {
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

  return matched;
}

function normalizeSourceType(sourceType: string | undefined) {
  return sourceType?.trim().toLowerCase().replace(/_/g, "-") ?? "";
}

function readEmbeddedReviewFeedback(node: Pick<GraphNodePayload, "metadata"> | null | undefined) {
  const reviewFeedback = node?.metadata?.reviewFeedback;
  return reviewFeedback && typeof reviewFeedback === "object" && !Array.isArray(reviewFeedback)
    ? (reviewFeedback as ReviewFeedbackSourcePayload)
    : null;
}

function toGraphSourceReviewFeedback(
  summary: ReviewFeedbackSourcePayload | null | undefined
): GraphSourceReviewFeedback | null {
  if (!summary || (summary.totalCardCount ?? 0) <= 0) {
    return null;
  }

  return {
    totalCardCount: summary.totalCardCount,
    reviewCardCount: summary.reviewCardCount,
    masteredCardCount: summary.masteredCardCount,
    masteryLevel: summary.masteryLevel ?? "building",
    masteryScore: summary.masteryScore,
    weakCardCount: summary.weakCardCount,
    dueCount: summary.dueCount,
    learningCount: summary.learningCount,
    maxLapseCount: summary.maxLapseCount,
    sampleCardFronts: summary.sampleCardFronts ?? []
  };
}
