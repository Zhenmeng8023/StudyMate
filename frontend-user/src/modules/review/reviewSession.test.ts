import { describe, expect, it } from "vitest";
import { addReviewSessionRating, createReviewSessionSummary } from "./reviewSession";

describe("review session source feedback", () => {
  it("counts one weak source across generated cards using explicit SourceLinks", () => {
    const card = { primarySourceLink: { sourceType: "graph_node", sourceId: "node-1" } };
    const first = addReviewSessionRating(createReviewSessionSummary(), "again", card);
    const second = addReviewSessionRating(first, "again", { sourceType: "graph-node", sourceId: "node-1" });
    expect(second.completed).toBe(2);
    expect(second.ratings.again).toBe(2);
    expect(second.weakSourceCount).toBe(1);
    expect(first.completed).toBe(1);
  });

  it("does not invent a weak source for standalone cards or successful ratings", () => {
    const summary = addReviewSessionRating(createReviewSessionSummary(), "again", {});
    expect(addReviewSessionRating(summary, "good", { sourceType: "note", sourceId: "n" }).weakSourceCount).toBe(0);
  });
});
