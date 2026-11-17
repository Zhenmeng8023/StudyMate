import type { CardPayload } from "../../api/client";
import { buildPrimarySourceLink } from "../../features/sources/sourceLinks";

export type ReviewSessionRating = "again" | "hard" | "good" | "easy";
export type ReviewSessionSummary = {
  completed: number;
  ratings: Record<ReviewSessionRating, number>;
  weakSourceCount: number;
  weakSourceKeys: string[];
};

export function createReviewSessionSummary(): ReviewSessionSummary {
  return { completed: 0, ratings: { again: 0, hard: 0, good: 0, easy: 0 }, weakSourceCount: 0, weakSourceKeys: [] };
}

export function addReviewSessionRating(
  current: ReviewSessionSummary,
  rating: ReviewSessionRating,
  card: Pick<CardPayload, "primarySourceLink" | "sourceLinks" | "sourceType" | "sourceId" | "sourceMetadata">
): ReviewSessionSummary {
  const source = buildPrimarySourceLink(card);
  const key = source ? `${source.sourceType}:${source.sourceId}` : "";
  const keys = rating === "again" && key && !current.weakSourceKeys.includes(key)
    ? [...current.weakSourceKeys, key]
    : current.weakSourceKeys;
  return {
    completed: current.completed + 1,
    ratings: { ...current.ratings, [rating]: current.ratings[rating] + 1 },
    weakSourceKeys: keys,
    weakSourceCount: keys.length
  };
}
