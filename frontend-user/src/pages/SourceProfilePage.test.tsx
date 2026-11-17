import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession } from "../api/client";
import { getSourceProfile } from "../api/review";
import { SourceProfilePage } from "./SourceProfilePage";

vi.mock("../api/review", () => ({
  getSourceProfile: vi.fn()
}));

const session: AuthSession = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpiresAt: "2026-07-18T12:00:00Z",
  user: {
    id: "user-1",
    username: "alice",
    email: "alice@example.test",
    displayName: "Alice",
    role: "student"
  }
};

const getSourceProfileMock = vi.mocked(getSourceProfile);

describe("SourceProfilePage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    getSourceProfileMock.mockReset();
    getSourceProfileMock.mockResolvedValue({
      sourceType: "graph-node",
      sourceId: "node-1",
      title: "二叉树遍历",
      excerpt: "来自图谱节点的复习来源",
      locator: { graphId: "graph-1", focusLabel: "二叉树遍历" },
      queueStates: { new: 0, learning: 1, review: 2, relearning: 0, suspended: 0, buried: 0 },
      masteryScore: 67,
      masteryLevel: "building",
      dueCount: 1,
      learningCount: 1,
      weakCardCount: 1,
      lastReviewedAt: "2026-07-18T08:30:00Z",
      primarySourceLink: {
        sourceType: "graph-node",
        sourceId: "node-1",
        title: "二叉树遍历",
        excerpt: "来自图谱节点的复习来源",
        locator: { graphId: "graph-1", focusLabel: "二叉树遍历" }
      },
      cardNotes: [{
        cardNote: {
          id: "note-1",
          deckId: "deck-1",
          ownerUserId: "user-1",
          noteTypeId: "basic",
          noteTypeCode: "basic",
          fields: { front: "什么是二叉树遍历？", back: "按规则访问节点。" },
          generatedCardCount: 1,
          status: "active"
        },
        generatedCards: [{
          id: "card-1",
          deckId: "deck-1",
          ownerUserId: "user-1",
          cardType: "basic",
          front: "什么是二叉树遍历？",
          back: "按规则访问节点。",
          tags: ["graph"],
          status: "active",
          createdAt: "2026-07-18T08:00:00Z",
          updatedAt: "2026-07-18T08:00:00Z"
        }],
        queueStates: { learning: 1 },
        tags: ["graph"]
      }],
      generatedCards: [],
      recentReviews: [{ reviewId: "review-1", cardId: "card-1", rating: "again", reviewedAt: "2026-07-18T08:30:00Z" }]
    });
  });

  it("loads a source learning profile with review and backlink actions", async () => {
    render(
      <MemoryRouter initialEntries={["/sources?sourceType=graph-node&sourceId=node-1"]}>
        <SourceProfilePage session={session} />
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { level: 1, name: "二叉树遍历" })).toBeInTheDocument();
    expect(getSourceProfileMock).toHaveBeenCalledWith(session, { sourceType: "graph-node", sourceId: "node-1" });
    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByText("什么是二叉树遍历？")).toBeInTheDocument();
    expect(screen.getByText("Again")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /去复习/ })).toHaveAttribute("href", "/review?sourceType=graph-node&sourceId=node-1");
    expect(screen.getByRole("link", { name: "回到来源" })).toHaveAttribute("href", "/graph?graphId=graph-1&focusLabel=%E4%BA%8C%E5%8F%89%E6%A0%91%E9%81%8D%E5%8E%86");
  });
});
