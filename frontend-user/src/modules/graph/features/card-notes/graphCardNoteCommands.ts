import type {
  AuthSession,
  CreateCardNoteResultPayload,
  DeckPayload,
  GraphNodePayload,
  ReviewFeedbackPayload
} from "../../../../api/client";
import { buildCardNoteFields, type CardNoteTemplateCode } from "../../../../features/card-notes/CardNoteComposer";
import type { CardNoteCreationResultData } from "../../../../features/card-notes/CardNoteCreationResult";
import { buildSourceBacklinkTarget } from "../../../../features/sources/sourceLinks";
import { applyGraphCardNoteCreationFeedback } from "../learning/graphLearningFeedbackRuntime";
import { buildGraphCardNoteDrafts, type GraphCardNoteDraft } from "./graphCardNoteDrafts";

type CreateGraphCardNote = (
  session: AuthSession,
  deckId: string,
  request: {
    noteTypeCode: CardNoteTemplateCode;
    fields: Record<string, string>;
    primarySourceLink: GraphCardNoteDraft["sourceLinks"][number] | undefined;
    sourceLinks: GraphCardNoteDraft["sourceLinks"];
  }
) => Promise<CreateCardNoteResultPayload>;

export type GraphCardNoteDraftPlan = {
  drafts: GraphCardNoteDraft[];
  statusMessage: string;
};

export type CommitGraphCardNoteDraftsInput = {
  session: AuthSession;
  deckId: string;
  templateCode: CardNoteTemplateCode;
  drafts: GraphCardNoteDraft[];
  decks: DeckPayload[];
  currentReviewFeedback: ReviewFeedbackPayload | null;
  createCardNote: CreateGraphCardNote;
};

export type CommitGraphCardNoteDraftsResult = {
  generatedCount: number;
  decks: DeckPayload[];
  reviewFeedback: ReviewFeedbackPayload | null;
  statusMessage: string;
  results: CreateCardNoteResultPayload[];
  creationResult: CardNoteCreationResultData | null;
  remainingDrafts: GraphCardNoteDraft[];
};

export function planGraphCardNoteDraftsFromSelection(graphId: string, selectedNodes: GraphNodePayload[]): GraphCardNoteDraftPlan {
  const drafts = buildGraphCardNoteDrafts(graphId, selectedNodes);
  return {
    drafts,
    statusMessage:
      drafts.length > 1 ? `已基于 ${drafts.length} 个节点生成 CardNote 草稿` : "已基于选中节点生成 CardNote 草稿"
  };
}

export async function commitGraphCardNoteDrafts(
  input: CommitGraphCardNoteDraftsInput
): Promise<CommitGraphCardNoteDraftsResult> {
  const settled = await Promise.allSettled(
    input.drafts.map((draft) =>
      input.createCardNote(input.session, input.deckId, {
        noteTypeCode: input.templateCode,
        fields: buildCardNoteFields(draft, input.templateCode),
        primarySourceLink: draft.sourceLinks[0],
        sourceLinks: draft.sourceLinks
      })
    )
  );
  const successful = settled.flatMap((result, index) => result.status === "fulfilled" ? [{ result: result.value, draft: input.drafts[index] }] : []);
  const results = successful.map((item) => item.result);
  const remainingDrafts = input.drafts.filter((_draft, index) => settled[index].status === "rejected");
  const failure = settled.find((item) => item.status === "rejected");
  const error = failure?.status === "rejected" ? failure.reason instanceof Error ? failure.reason.message : "写入卡片失败" : "";
  const generatedCount = results.reduce((count, result) => count + result.generatedCards.length, 0);
  const targetDeck = input.decks.find((deck) => deck.id === input.deckId);
  const updatedAt = new Date().toISOString();
  const decks = input.decks.map((deck) =>
    deck.id === input.deckId ? { ...deck, cardCount: deck.cardCount + generatedCount, updatedAt } : deck
  );
  const reviewFeedback = successful.reduce<ReviewFeedbackPayload | null>((feedback, { result, draft }) => {
    const primarySourceLink = draft.sourceLinks[0];
    return primarySourceLink ? applyGraphCardNoteCreationFeedback(feedback, result, primarySourceLink) : feedback;
  }, input.currentReviewFeedback);

  return {
    generatedCount,
    decks,
    reviewFeedback,
    results,
    remainingDrafts,
    creationResult: generatedCount ? { count: generatedCount, cardId: results[0]?.generatedCards[0]?.id,
      sourcePath: buildSourceBacklinkTarget(successful[0]?.draft.sourceLinks[0]) || "/graph" } : null,
    statusMessage: error ? `${error} 已保留 ${remainingDrafts.length} 条未写入草稿，重试只会提交这些草稿。` : `已将 ${generatedCount} 张 GeneratedCard 写入 ${targetDeck?.title || "目标卡组"}。`
  };
}
