import type { GraphNodePayload, ReviewFeedbackSourcePayload } from "../../../api/client";

export type GraphSourceReviewFeedback = {
  lastReviewedAt?: string;
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
  cardNoteCount?: number;
  generatedCardCount?: number;
};

export type GraphLearningState = "unlearned" | "learning" | "weak" | "mastered";

export function resolveGraphLearningState(feedback: GraphSourceReviewFeedback | null | undefined): GraphLearningState {
  if (!feedback || feedback.totalCardCount <= 0) {
    return "unlearned";
  }
  if (feedback.weakCardCount > 0 || feedback.masteryLevel === "weak" || feedback.maxLapseCount > 0) {
    return "weak";
  }
  if (feedback.masteryLevel === "solid" || feedback.masteredCardCount >= feedback.totalCardCount) {
    return "mastered";
  }
  return "learning";
}

export function formatGraphLearningStateLabel(state: GraphLearningState) {
  switch (state) {
    case "weak":
      return "薄弱";
    case "mastered":
      return "已掌握";
    case "learning":
      return "学习中";
    case "unlearned":
    default:
      return "未学习";
  }
}

export function resolveGraphSourceReviewFeedback(
  node: Pick<GraphNodePayload, "id" | "source" | "metadata"> | null | undefined,
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
  node: Pick<GraphNodePayload, "id" | "source"> | null | undefined,
  summaries: ReviewFeedbackSourcePayload[]
) {
  const sourceType = normalizeSourceType(node?.source?.type);
  const sourceId = node?.source?.id?.trim();
  const nodeId = node?.id?.trim();
  if (((!sourceType || !sourceId) && !nodeId) || summaries.length === 0) {
    return null;
  }

  const matched = summaries.find(
    (summary) =>
      (normalizeSourceType(summary.sourceType) === sourceType && summary.sourceId?.trim() === sourceId) ||
      (normalizeSourceType(summary.sourceType) === "graph-node" && summary.sourceId?.trim() === nodeId)
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
    lastReviewedAt: summary.lastReviewedAt,
    totalCardCount: summary.totalCardCount,
    reviewCardCount: summary.reviewCardCount,
    masteredCardCount: summary.masteredCardCount,
    masteryLevel: summary.masteryLevel ?? "building",
    masteryScore: summary.masteryScore,
    weakCardCount: summary.weakCardCount,
    dueCount: summary.dueCount,
    learningCount: summary.learningCount,
    maxLapseCount: summary.maxLapseCount,
    sampleCardFronts: summary.sampleCardFronts ?? [],
    cardNoteCount: (summary as ReviewFeedbackSourcePayload & { cardNoteCount?: number }).cardNoteCount,
    generatedCardCount: (summary as ReviewFeedbackSourcePayload & { generatedCardCount?: number }).generatedCardCount
  };
}
