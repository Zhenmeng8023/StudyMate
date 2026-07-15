package service

import (
	"slices"
	"strings"
	"time"

	carddto "studymate/backend/internal/modules/card/dto"
	cardrepo "studymate/backend/internal/modules/card/repository"
)

type sourceSummaryAccumulator struct {
	sourceType        string
	sourceID          string
	sourceMetadata    map[string]any
	totalCardCount    int
	reviewCardCount   int
	masteredCardCount int
	weakCardCount     int
	dueCount          int
	learningCount     int
	maxLapseCount     int
	sampleCardFronts  []string
}

func buildSourceSummaries(rows []cardrepo.ReviewFeedbackRow, now time.Time) []carddto.ReviewFeedbackSourcePayload {
	if len(rows) == 0 {
		return nil
	}

	summaries := make(map[string]*sourceSummaryAccumulator, len(rows))
	order := make([]string, 0, len(rows))
	for _, row := range rows {
		sourceType := strings.TrimSpace(row.Card.SourceType)
		sourceID := strings.TrimSpace(row.Card.SourceID)
		if sourceType == "" || sourceID == "" {
			continue
		}

		key := normalizeFeedbackSourceType(sourceType) + "::" + sourceID
		summary := summaries[key]
		if summary == nil {
			summary = &sourceSummaryAccumulator{
				sourceType:     sourceType,
				sourceID:       sourceID,
				sourceMetadata: cardrepo.ParseSourceMetadata(row.Card.SourceMetadata),
			}
			summaries[key] = summary
			order = append(order, key)
		}

		summary.totalCardCount += 1
		if row.Schedule.State == "review" {
			summary.reviewCardCount += 1
		}
		if isMasteredSourceCard(row, now) {
			summary.masteredCardCount += 1
		}
		if isWeakSourceCard(row) {
			summary.weakCardCount += 1
		}
		if row.Schedule.DueAt.Before(now) || row.Schedule.DueAt.Equal(now) {
			summary.dueCount += 1
		}
		if row.Schedule.State == "learning" || row.Schedule.State == "relearning" {
			summary.learningCount += 1
		}
		if row.Schedule.LapseCount > summary.maxLapseCount {
			summary.maxLapseCount = row.Schedule.LapseCount
		}
		front := strings.TrimSpace(row.Card.Front)
		if front != "" && !slices.Contains(summary.sampleCardFronts, front) && len(summary.sampleCardFronts) < 2 {
			summary.sampleCardFronts = append(summary.sampleCardFronts, front)
		}
	}

	if len(order) == 0 {
		return nil
	}

	slices.SortStableFunc(order, func(left string, right string) int {
		leftSummary := summaries[left]
		rightSummary := summaries[right]
		if leftSummary.weakCardCount != rightSummary.weakCardCount {
			return rightSummary.weakCardCount - leftSummary.weakCardCount
		}
		if leftSummary.maxLapseCount != rightSummary.maxLapseCount {
			return rightSummary.maxLapseCount - leftSummary.maxLapseCount
		}
		if leftSummary.dueCount != rightSummary.dueCount {
			return rightSummary.dueCount - leftSummary.dueCount
		}
		return strings.Compare(left, right)
	})

	result := make([]carddto.ReviewFeedbackSourcePayload, 0, len(order))
	for _, key := range order {
		summary := summaries[key]
		result = append(result, carddto.ReviewFeedbackSourcePayload{
			SourceType:        summary.sourceType,
			SourceID:          summary.sourceID,
			SourceMetadata:    summary.sourceMetadata,
			TotalCardCount:    summary.totalCardCount,
			ReviewCardCount:   summary.reviewCardCount,
			MasteredCardCount: summary.masteredCardCount,
			MasteryLevel:      deriveSourceMasteryLevel(*summary),
			MasteryScore:      deriveSourceMasteryScore(*summary),
			WeakCardCount:     summary.weakCardCount,
			DueCount:          summary.dueCount,
			LearningCount:     summary.learningCount,
			MaxLapseCount:     summary.maxLapseCount,
			SampleCardFronts:  summary.sampleCardFronts,
		})
	}

	return result
}

func buildWeakSourceSummaries(summaries []carddto.ReviewFeedbackSourcePayload) []carddto.ReviewFeedbackSourcePayload {
	if len(summaries) == 0 {
		return nil
	}

	filtered := make([]carddto.ReviewFeedbackSourcePayload, 0, len(summaries))
	for _, summary := range summaries {
		if summary.WeakCardCount > 0 {
			filtered = append(filtered, summary)
		}
	}
	if len(filtered) == 0 {
		return nil
	}

	return filtered
}

func isWeakSourceCard(row cardrepo.ReviewFeedbackRow) bool {
	return row.Schedule.State == "learning" || row.Schedule.State == "relearning" || row.Schedule.LapseCount > 0
}

func isMasteredSourceCard(row cardrepo.ReviewFeedbackRow, now time.Time) bool {
	return row.Schedule.State == "review" && row.Schedule.LapseCount == 0 && row.Schedule.DueAt.After(now)
}

func deriveSourceMasteryLevel(summary sourceSummaryAccumulator) string {
	switch {
	case summary.totalCardCount == 0:
		return ""
	case summary.weakCardCount > 0:
		return "weak"
	case summary.masteredCardCount == summary.totalCardCount:
		return "solid"
	default:
		return "building"
	}
}

func deriveSourceMasteryScore(summary sourceSummaryAccumulator) int {
	if summary.totalCardCount == 0 {
		return 0
	}

	return (summary.masteredCardCount * 100) / summary.totalCardCount
}

func normalizeFeedbackSourceType(sourceType string) string {
	return strings.ToLower(strings.TrimSpace(strings.ReplaceAll(sourceType, "_", "-")))
}
