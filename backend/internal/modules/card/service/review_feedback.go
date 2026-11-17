package service

import (
	"slices"
	"strings"
	"time"

	carddto "studymate/backend/internal/modules/card/dto"
	cardrepo "studymate/backend/internal/modules/card/repository"
)

var reviewInsightRatings = []string{"again", "hard", "good", "easy"}

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
		readModel := cardrepo.BuildPrimarySourceLinkReadModel(row.Card.SourceType, row.Card.SourceID, cardrepo.ParseSourceMetadata(row.Card.SourceMetadata))
		if readModel == nil {
			continue
		}
		sourceType := readModel.SourceType
		sourceID := readModel.SourceID

		key := normalizeFeedbackSourceType(sourceType) + "::" + sourceID
		summary := summaries[key]
		if summary == nil {
			summary = &sourceSummaryAccumulator{
				sourceType:     sourceType,
				sourceID:       sourceID,
				sourceMetadata: readModel.SourceMetadata,
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
			PrimarySourceLink: cardrepo.BuildPrimarySourceLinkPayload(summary.sourceType, summary.sourceID, summary.sourceMetadata),
			SourceLinks:       cardrepo.BuildSourceLinksPayload(summary.sourceType, summary.sourceID, summary.sourceMetadata),
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

func beginningOfUTCDay(value time.Time) time.Time {
	utc := value.UTC()
	return time.Date(utc.Year(), utc.Month(), utc.Day(), 0, 0, 0, 0, time.UTC)
}

func buildReviewInsightDays(events []cardrepo.ReviewEventRow, start time.Time) []carddto.ReviewInsightDailyPayload {
	days := make([]carddto.ReviewInsightDailyPayload, 0, 7)
	byDate := make(map[string]*carddto.ReviewInsightDailyPayload, 7)
	for offset := 0; offset < 7; offset++ {
		date := start.AddDate(0, 0, offset).Format("2006-01-02")
		day := carddto.ReviewInsightDailyPayload{
			Date:         date,
			RatingCounts: map[string]int{"again": 0, "hard": 0, "good": 0, "easy": 0},
		}
		days = append(days, day)
		byDate[date] = &days[len(days)-1]
	}

	seenWeakSource := map[string]bool{}
	seenWeakSourceDate := map[string]bool{}
	chronological := slices.Clone(events)
	slices.SortStableFunc(chronological, func(a, b cardrepo.ReviewEventRow) int {
		return a.Review.ReviewedAt.Compare(b.Review.ReviewedAt)
	})
	for _, event := range chronological {
		date := beginningOfUTCDay(event.Review.ReviewedAt).Format("2006-01-02")
		day := byDate[date]
		if day == nil {
			continue
		}
		day.ReviewCount++
		rating := strings.ToLower(strings.TrimSpace(event.Review.Rating))
		if !slices.Contains(reviewInsightRatings, rating) {
			rating = "good"
		}
		day.RatingCounts[rating]++
		if rating == "again" || rating == "hard" {
			sourceKey := reviewEventSourceKey(event)
			if sourceKey == "" || seenWeakSourceDate[date+"::"+sourceKey] {
				continue
			}
			seenWeakSourceDate[date+"::"+sourceKey] = true
			if seenWeakSource[sourceKey] {
				day.WeakCarryCount++
			} else {
				day.WeakNewCount++
				seenWeakSource[sourceKey] = true
			}
		}
	}

	return days
}

func buildReviewInsightSourceTrends(events []cardrepo.ReviewEventRow, sources []carddto.ReviewFeedbackSourcePayload, start time.Time) []carddto.ReviewInsightSourceTrendPayload {
	if len(sources) == 0 {
		return nil
	}

	eventsBySourceDate := map[string]map[string][]cardrepo.ReviewEventRow{}
	for _, event := range events {
		sourceKey := reviewEventSourceKey(event)
		if sourceKey == "" {
			continue
		}
		date := beginningOfUTCDay(event.Review.ReviewedAt).Format("2006-01-02")
		if eventsBySourceDate[sourceKey] == nil {
			eventsBySourceDate[sourceKey] = map[string][]cardrepo.ReviewEventRow{}
		}
		eventsBySourceDate[sourceKey][date] = append(eventsBySourceDate[sourceKey][date], event)
	}

	trends := make([]carddto.ReviewInsightSourceTrendPayload, 0, len(sources)*7)
	for _, source := range sources {
		sourceType := normalizeFeedbackSourceType(source.SourceType)
		sourceID := strings.TrimSpace(source.SourceID)
		if sourceType == "" || sourceID == "" {
			continue
		}
		sourceKey := sourceType + "::" + sourceID
		positive := 0
		total := 0
		for offset := 0; offset < 7; offset++ {
			date := start.AddDate(0, 0, offset).Format("2006-01-02")
			for _, event := range eventsBySourceDate[sourceKey][date] {
				total++
				rating := strings.ToLower(strings.TrimSpace(event.Review.Rating))
				if rating == "good" || rating == "easy" {
					positive++
				}
			}
			score := source.MasteryScore
			if total > 0 {
				score = (positive * 100) / total
			}
			trends = append(trends, carddto.ReviewInsightSourceTrendPayload{
				Date:         date,
				SourceType:   source.SourceType,
				SourceID:     source.SourceID,
				MasteryScore: score,
			})
		}
	}

	return trends
}

func reviewEventSourceKey(event cardrepo.ReviewEventRow) string {
	source := cardrepo.BuildPrimarySourceLinkReadModel(event.Card.SourceType, event.Card.SourceID, cardrepo.ParseSourceMetadata(event.Card.SourceMetadata))
	if source == nil {
		return ""
	}
	return normalizeFeedbackSourceType(source.SourceType) + "::" + source.SourceID
}

func cardNoteMatchesSource(cardNote carddto.CardNotePayload, sourceType string, sourceID string) bool {
	for _, readModel := range cardrepo.BuildSourceLinkReadModels(cardNote.PrimarySourceLink, cardNote.SourceLinks, "", "", nil) {
		if cardrepo.SourceLinkReadModelMatches(readModel, sourceType, sourceID) {
			return true
		}
	}
	return false
}

func appendSourceLinks(primary *carddto.SourceLinkPayload, links []carddto.SourceLinkPayload) []carddto.SourceLinkPayload {
	result := make([]carddto.SourceLinkPayload, 0, len(links)+1)
	if primary != nil {
		result = append(result, *primary)
	}
	result = append(result, links...)
	return result
}

func sourceProfileSummary(primary *carddto.SourceLinkPayload, links []carddto.SourceLinkPayload, cards []carddto.GeneratedCardPayload, notes []carddto.ManagedCardNotePayload) (string, string, map[string]any) {
	for _, link := range appendSourceLinks(primary, links) {
		title := strings.TrimSpace(link.Title)
		excerpt := strings.TrimSpace(link.Excerpt)
		if title != "" || excerpt != "" || len(link.Locator) > 0 {
			return title, excerpt, link.Locator
		}
	}
	if len(notes) > 0 {
		fields := notes[0].CardNote.Fields
		if title := strings.TrimSpace(fields["front"]); title != "" {
			return title, strings.TrimSpace(fields["back"]), nil
		}
		if title := strings.TrimSpace(fields["text"]); title != "" {
			return title, strings.TrimSpace(fields["extra"]), nil
		}
	}
	if len(cards) > 0 {
		return strings.TrimSpace(cards[0].Front), strings.TrimSpace(cards[0].Back), cards[0].SourceMetadata
	}
	return "", "", nil
}
