package service

import (
	cardmodel "studymate/backend/internal/modules/card/model"
	cardrepo "studymate/backend/internal/modules/card/repository"
	"testing"
	"time"
)

func TestDailyWeakSourceCountsDeduplicateCardsAndNormalizeSources(t *testing.T) {
	start := time.Date(2026, 11, 10, 0, 0, 0, 0, time.UTC)
	card := cardmodel.Card{SourceType: "graph_node", SourceID: "node-1"}
	events := []cardrepo.ReviewEventRow{
		{Card: card, Review: cardmodel.CardReview{Rating: "again", ReviewedAt: start.Add(time.Hour)}},
		{Card: cardmodel.Card{SourceType: "graph-node", SourceID: "node-1"}, Review: cardmodel.CardReview{Rating: "hard", ReviewedAt: start.Add(2 * time.Hour)}},
		{Card: card, Review: cardmodel.CardReview{Rating: "again", ReviewedAt: start.Add(25 * time.Hour)}},
		{Card: card, Review: cardmodel.CardReview{Rating: "again", ReviewedAt: start.Add(26 * time.Hour)}},
	}
	days := buildReviewInsightDays(events, start)
	if days[0].WeakNewCount != 1 || days[0].WeakCarryCount != 0 || days[1].WeakNewCount != 0 || days[1].WeakCarryCount != 1 {
		t.Fatalf("expected distinct sources per day, got %#v", days)
	}
}
