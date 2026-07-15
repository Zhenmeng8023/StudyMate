package service

import (
	"slices"
	"strings"
	"time"

	carddto "studymate/backend/internal/modules/card/dto"
	cardrepo "studymate/backend/internal/modules/card/repository"
)

type weakSourceSummaryAccumulator struct {
	sourceType       string
	sourceID         string
	sourceMetadata   map[string]any
	weakCardCount    int
	dueCount         int
	learningCount    int
	maxLapseCount    int
	sampleCardFronts []string
}

func buildWeakSourceSummaries(rows []cardrepo.ReviewFeedbackRow, now time.Time) []carddto.ReviewFeedbackSourcePayload {
	if len(rows) == 0 {
		return nil
	}

	summaries := make(map[string]*weakSourceSummaryAccumulator, len(rows))
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
			summary = &weakSourceSummaryAccumulator{
				sourceType:     sourceType,
				sourceID:       sourceID,
				sourceMetadata: cardrepo.ParseSourceMetadata(row.Card.SourceMetadata),
			}
			summaries[key] = summary
			order = append(order, key)
		}

		summary.weakCardCount += 1
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
			SourceType:       summary.sourceType,
			SourceID:         summary.sourceID,
			SourceMetadata:   summary.sourceMetadata,
			WeakCardCount:    summary.weakCardCount,
			DueCount:         summary.dueCount,
			LearningCount:    summary.learningCount,
			MaxLapseCount:    summary.maxLapseCount,
			SampleCardFronts: summary.sampleCardFronts,
		})
	}

	return result
}

func normalizeFeedbackSourceType(sourceType string) string {
	return strings.ToLower(strings.TrimSpace(strings.ReplaceAll(sourceType, "_", "-")))
}
