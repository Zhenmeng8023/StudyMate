import type { CreateCardNoteResultPayload, ReviewFeedbackPayload, ReviewFeedbackSourcePayload, SourceLinkPayload } from "../../../../api/client";

export type GraphLearningFeedbackRefreshPlan = {
  reviewFeedback: ReviewFeedbackPayload | null;
  statusMessage: string;
  preserveDocumentState: true;
  retryable?: boolean;
};

export function applyGraphLearningFeedbackRefreshSuccess(
  reviewFeedback: ReviewFeedbackPayload
): GraphLearningFeedbackRefreshPlan {
  return {
    reviewFeedback,
    statusMessage: "已刷新学习反馈",
    preserveDocumentState: true
  };
}

export function applyGraphLearningFeedbackRefreshFailure(
  current: ReviewFeedbackPayload | null,
  error: unknown
): GraphLearningFeedbackRefreshPlan {
  return {
    reviewFeedback: current,
    statusMessage: error instanceof Error ? error.message : "刷新学习反馈失败",
    preserveDocumentState: true,
    retryable: true
  };
}

export function applyGraphCardNoteCreationFeedback(
  current: ReviewFeedbackPayload | null,
  result: CreateCardNoteResultPayload,
  primarySourceLink: SourceLinkPayload
): ReviewFeedbackPayload {
  const generatedCount = result.generatedCards.length;
  const summary: ReviewFeedbackSourcePayload & { cardNoteCount: number; generatedCardCount: number } = {
    sourceType: primarySourceLink.sourceType,
    sourceId: primarySourceLink.sourceId,
    primarySourceLink,
    sourceLinks: result.cardNote.sourceLinks?.length ? result.cardNote.sourceLinks : [primarySourceLink],
    totalCardCount: generatedCount,
    reviewCardCount: 0,
    masteredCardCount: 0,
    masteryLevel: "building",
    masteryScore: 0,
    weakCardCount: 0,
    dueCount: generatedCount,
    learningCount: generatedCount,
    maxLapseCount: 0,
    sampleCardFronts: result.generatedCards.map((card) => card.front).filter(Boolean).slice(0, 3),
    cardNoteCount: 1,
    generatedCardCount: generatedCount
  };

  const sourceSummaries = mergeSourceSummary(current?.sourceSummaries ?? [], summary);
  return {
    dueCount: (current?.dueCount ?? 0) + generatedCount,
    learningCount: (current?.learningCount ?? 0) + generatedCount,
    weakCardCount: current?.weakCardCount ?? 0,
    weakCards: current?.weakCards ?? [],
    weakSources: current?.weakSources ?? [],
    sourceSummaries
  };
}

function mergeSourceSummary(current: ReviewFeedbackSourcePayload[], incoming: ReviewFeedbackSourcePayload) {
  const matched = current.find(
    (summary) => summary.sourceType === incoming.sourceType && summary.sourceId === incoming.sourceId
  );
  if (!matched) {
    return [...current, incoming];
  }
  return current.map((summary) =>
    summary === matched
      ? {
          ...summary,
          primarySourceLink: summary.primarySourceLink ?? incoming.primarySourceLink,
          sourceLinks: summary.sourceLinks?.length ? summary.sourceLinks : incoming.sourceLinks,
          totalCardCount: summary.totalCardCount + incoming.totalCardCount,
          dueCount: summary.dueCount + incoming.dueCount,
          learningCount: summary.learningCount + incoming.learningCount,
          sampleCardFronts: [...(incoming.sampleCardFronts ?? []), ...(summary.sampleCardFronts ?? [])].slice(0, 3),
          cardNoteCount:
            ((summary as ReviewFeedbackSourcePayload & { cardNoteCount?: number }).cardNoteCount ?? 0) +
            ((incoming as ReviewFeedbackSourcePayload & { cardNoteCount?: number }).cardNoteCount ?? 0),
          generatedCardCount:
            ((summary as ReviewFeedbackSourcePayload & { generatedCardCount?: number }).generatedCardCount ?? 0) +
            ((incoming as ReviewFeedbackSourcePayload & { generatedCardCount?: number }).generatedCardCount ?? 0)
        }
      : summary
  );
}
