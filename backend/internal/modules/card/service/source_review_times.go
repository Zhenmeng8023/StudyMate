package service

import (
	carddto "studymate/backend/internal/modules/card/dto"
	cardrepo "studymate/backend/internal/modules/card/repository"
	"time"
)

func (s *Service) sourceSummariesWithReviewTimes(ownerUserID string, rows []cardrepo.ReviewFeedbackRow, now time.Time) ([]carddto.ReviewFeedbackSourcePayload, error) {
	summaries := buildSourceSummaries(rows, now)
	times, err := s.repository.LatestCardReviewTimes(ownerUserID)
	if err != nil {
		return nil, err
	}
	latestBySource := map[string]time.Time{}
	for _, row := range rows {
		source := cardrepo.BuildPrimarySourceLinkReadModel(row.Card.SourceType, row.Card.SourceID, cardrepo.ParseSourceMetadata(row.Card.SourceMetadata))
		if source == nil {
			continue
		}
		key := normalizeFeedbackSourceType(source.SourceType) + "::" + source.SourceID
		if value := times[row.Card.ID]; value.After(latestBySource[key]) {
			latestBySource[key] = value
		}
	}
	for index := range summaries {
		key := normalizeFeedbackSourceType(summaries[index].SourceType) + "::" + summaries[index].SourceID
		if value := latestBySource[key]; !value.IsZero() {
			summaries[index].LastReviewedAt = value.UTC().Format(time.RFC3339)
		}
	}
	return summaries, nil
}
