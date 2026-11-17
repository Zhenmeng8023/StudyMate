import { describe, expect, it, vi } from "vitest";
import type { CreateCardNoteResultPayload, DeckPayload, SourceLinkPayload } from "../../../../api/client";
import type { GraphCardNoteDraft } from "./graphCardNoteDrafts";
import { commitGraphCardNoteDrafts, planGraphCardNoteDraftsFromSelection } from "./graphCardNoteCommands";

const graphNodeSourceLink: SourceLinkPayload = {
  sourceType: "graph-node",
  sourceId: "node-1",
  title: "二叉树遍历",
  excerpt: "前序、中序、后序遍历",
  locator: {
    graphId: "graph-1",
    nodeId: "node-1",
    focusX: 12,
    focusY: 24,
    focusWidth: 260,
    focusHeight: 140
  }
};

const draft: GraphCardNoteDraft = {
  id: "node-1",
  title: "二叉树遍历",
  excerpt: "前序、中序、后序遍历",
  locatorLabel: "图谱 graph-1 / 节点 node-1",
  front: "二叉树遍历",
  back: "前序、中序、后序遍历",
  explanation: "从图谱节点生成",
  sourceLinks: [graphNodeSourceLink]
};

const deck: DeckPayload = {
  id: "deck-1",
  ownerUserId: "user-1",
  title: "算法",
  description: "",
  visibility: "private",
  cardCount: 2,
  createdAt: "2026-07-19T00:00:00.000Z",
  updatedAt: "2026-07-19T00:00:00.000Z"
};

function createResult(generatedCount: number): CreateCardNoteResultPayload {
  return {
    cardNote: {
      id: "card-note-1",
      deckId: "deck-1",
      ownerUserId: "user-1",
      noteTypeId: "note-type-basic",
      noteTypeCode: "basic",
      fields: { front: "二叉树遍历", back: "前序、中序、后序遍历" },
      primarySourceLink: graphNodeSourceLink,
      sourceLinks: [graphNodeSourceLink],
      status: "active",
      generatedCardCount: generatedCount,
      createdAt: "2026-07-19T00:00:00.000Z",
      updatedAt: "2026-07-19T00:00:00.000Z"
    },
    generatedCards: Array.from({ length: generatedCount }, (_, index) => ({
      id: `card-${index + 1}`,
      deckId: "deck-1",
      ownerUserId: "user-1",
      cardNoteId: "card-note-1",
      templateId: "template-basic",
      templateOrdinal: index,
      cardType: "basic",
      front: `Front ${index + 1}`,
      back: `Back ${index + 1}`,
      tags: [],
      sourceType: "graph-node",
      sourceId: "node-1",
      sourceMetadata: {},
      primarySourceLink: graphNodeSourceLink,
      sourceLinks: [graphNodeSourceLink],
      status: "active",
      createdAt: "2026-07-19T00:00:00.000Z",
      updatedAt: "2026-07-19T00:00:00.000Z"
    }))
  };
}

describe("graph card note commands", () => {
  it("plans draft generation status from the current graph selection", () => {
    const plan = planGraphCardNoteDraftsFromSelection("graph-1", [
      {
        id: "node-1",
        type: "concept",
        title: "二叉树遍历",
        x: 12,
        y: 24,
        width: 260,
        height: 140,
        metadata: { detail: "前序、中序、后序遍历" }
      }
    ]);

    expect(plan.statusMessage).toBe("已基于选中节点生成 CardNote 草稿");
    expect(plan.drafts[0].sourceLinks[0]).toMatchObject({
      sourceType: "graph-node",
      sourceId: "node-1",
      locator: {
        graphId: "graph-1",
        nodeId: "node-1",
        focusX: 12,
        focusY: 24,
        focusWidth: 260,
        focusHeight: 140
      }
    });
  });

  it("commits drafts and returns immutable deck and feedback update plans", async () => {
    const createCardNote = vi.fn().mockResolvedValue(createResult(2));

    const result = await commitGraphCardNoteDrafts({
      session: {
        accessToken: "token",
        refreshToken: "refresh",
        accessTokenExpiresAt: "2026-07-19T01:00:00.000Z",
        user: {
          id: "user-1",
          username: "alice",
          email: "u@test",
          displayName: "Alice",
          role: "user"
        }
      },
      deckId: "deck-1",
      templateCode: "basic",
      drafts: [draft],
      decks: [deck],
      currentReviewFeedback: null,
      createCardNote
    });

    expect(createCardNote).toHaveBeenCalledWith(expect.any(Object), "deck-1", {
      noteTypeCode: "basic",
      fields: { front: "二叉树遍历", back: "前序、中序、后序遍历" },
      primarySourceLink: graphNodeSourceLink,
      sourceLinks: [graphNodeSourceLink]
    });
    expect(result.generatedCount).toBe(2);
    expect(result.creationResult).toMatchObject({ count: 2, cardId: "card-1", sourcePath: expect.stringContaining("graphId=graph-1") });
    expect(result.creationResult?.sourcePath).toContain("focusX=12");
    expect(result.remainingDrafts).toEqual([]);
    expect(result.statusMessage).toBe("已将 2 张 GeneratedCard 写入 算法。");
    expect(result.decks[0]).toMatchObject({ id: "deck-1", cardCount: 4 });
    expect(result.reviewFeedback?.sourceSummaries?.[0]).toMatchObject({
      sourceType: "graph-node",
      sourceId: "node-1",
      totalCardCount: 2,
      cardNoteCount: 1,
      generatedCardCount: 2
    });
  });
  it("retains only failed drafts while applying successful feedback once", async () => {
    const createCardNote = vi.fn().mockRejectedValueOnce(new Error("写入失败")).mockResolvedValueOnce(createResult(1));
    const result = await commitGraphCardNoteDrafts({
      session: { accessToken: "token", refreshToken: "refresh", accessTokenExpiresAt: "2026-07-19T01:00:00Z",
        user: { id: "user-1", username: "alice", email: "u@test", displayName: "Alice", role: "student" } },
      deckId: "deck-1", templateCode: "basic", drafts: [draft, { ...draft, id: "node-2" }],
      decks: [deck], currentReviewFeedback: null, createCardNote
    });
    expect(result.remainingDrafts).toEqual([draft]);
    expect(result.generatedCount).toBe(1);
    expect(result.decks[0].cardCount).toBe(3);
    expect(result.creationResult?.count).toBe(1);
    expect(result.statusMessage).toContain("已保留 1 条未写入草稿");
  });
});
