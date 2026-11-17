import type { GraphNodePayload } from "../../../../api/client";
import type { GraphSourceReviewFeedback, GraphLearningState } from "../../lib/graphSourceReviewFeedback";
import { formatGraphLearningStateLabel, resolveGraphLearningState } from "../../lib/graphSourceReviewFeedback";

export type GraphLearningFilter = "all" | "weak" | "due" | "uncarded" | "mastered";

export type GraphLearningFilterOption = {
  count: number;
  filter: GraphLearningFilter;
  label: string;
};

export type GraphLearningFilterState = {
  filteredNodeIds: Set<string> | null;
  options: GraphLearningFilterOption[];
  stateCounts: Record<GraphLearningState, number>;
};

const learningFilterLabels: Record<GraphLearningFilter, string> = {
  all: "全部",
  weak: formatGraphLearningStateLabel("weak"),
  due: "到期",
  uncarded: "未制卡",
  mastered: formatGraphLearningStateLabel("mastered")
};

export function buildGraphLearningFilterState(input: {
  filter: GraphLearningFilter;
  nodes: GraphNodePayload[];
  reviewFeedbackByNodeId: Map<string, GraphSourceReviewFeedback | null>;
}): GraphLearningFilterState {
  const stateCounts: Record<GraphLearningState, number> = {
    unlearned: 0,
    learning: 0,
    weak: 0,
    mastered: 0
  };
  const filteredNodeIds = input.filter === "all" ? null : new Set<string>();
  let dueCount = 0;

  for (const node of input.nodes) {
    const feedback = input.reviewFeedbackByNodeId.get(node.id);
    const state = resolveGraphLearningState(feedback);
    stateCounts[state] += 1;
    if ((feedback?.dueCount ?? 0) > 0) {
      dueCount += 1;
    }
    if (filteredNodeIds && matchesGraphLearningFilter(input.filter, feedback)) {
      filteredNodeIds.add(node.id);
    }
  }

  return {
    filteredNodeIds,
    options: buildGraphLearningFilterOptions({
      all: input.nodes.length,
      due: dueCount,
      mastered: stateCounts.mastered,
      uncarded: stateCounts.unlearned,
      weak: stateCounts.weak
    }),
    stateCounts
  };
}

export function buildGraphLearningFilterOptions(counts: Record<GraphLearningFilter, number>): GraphLearningFilterOption[] {
  return (["all", "weak", "due", "uncarded", "mastered"] as const).map((filter) => ({
    count: counts[filter],
    filter,
    label: learningFilterLabels[filter]
  }));
}

function matchesGraphLearningFilter(filter: GraphLearningFilter, feedback: GraphSourceReviewFeedback | null | undefined) {
  if (filter === "weak") {
    return resolveGraphLearningState(feedback) === "weak";
  }
  if (filter === "due") {
    return (feedback?.dueCount ?? 0) > 0;
  }
  if (filter === "mastered") {
    return resolveGraphLearningState(feedback) === "mastered";
  }
  if (filter === "uncarded") {
    return !feedback || feedback.totalCardCount <= 0;
  }
  return true;
}
