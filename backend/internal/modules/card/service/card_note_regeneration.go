package service

import (
	"net/http"
	"time"

	"gorm.io/gorm"
	carddto "studymate/backend/internal/modules/card/dto"
	cardmodel "studymate/backend/internal/modules/card/model"
	cardrepo "studymate/backend/internal/modules/card/repository"
	"studymate/backend/internal/pkg/apperrors"
)

func (s *Service) regenerateManagedCards(repository *cardrepo.Repository, ownerID string, note cardmodel.CardNote, cards []cardmodel.Card, drafts []GeneratedCardDraft, tags []string, sourceType, sourceID string, metadata map[string]any) (*carddto.CardNoteRegenerationPayload, error) {
	stats := &carddto.CardNoteRegenerationPayload{}
	byOrdinal := make(map[int]GeneratedCardDraft, len(drafts))
	for _, draft := range drafts {
		byOrdinal[draft.TemplateOrdinal] = draft
	}
	seen := map[int]bool{}
	now := s.now().UTC()
	newTags := tags
	if newTags == nil && len(cards) > 0 {
		newTags = cardrepo.BuildCardPayload(cards[0]).Tags
	}
	for _, previousCard := range cards {
		lockedCard, err := repository.FindCardForUpdate(previousCard.ID)
		if err != nil {
			return nil, err
		}
		card := *lockedCard
		if card.OwnerUserID != ownerID || card.CardNoteID != note.ID {
			return nil, apperrors.New(http.StatusConflict, "card_changed", "卡片归属已变化，请刷新后重试")
		}
		// Legacy identity reconciliation is planned while the enclosing Note lock is held.
		card.TemplateOrdinal = previousCard.TemplateOrdinal
		schedule, err := repository.FindSchedule(card.ID, ownerID)
		if err != nil && err != gorm.ErrRecordNotFound {
			return nil, err
		}
		reviewCount, err := repository.CountCardReviews(ownerID, card.ID)
		if err != nil {
			return nil, err
		}
		draft, exists := byOrdinal[card.TemplateOrdinal]
		unreviewed := isUnreviewedGeneratedCard(schedule) && reviewCount == 0
		if !exists && unreviewed {
			if err := repository.DeleteOwnedCard(ownerID, card.ID); err != nil {
				return nil, err
			}
			stats.RemovedCount++
			continue
		}
		seen[card.TemplateOrdinal] = true
		if exists && unreviewed {
			card.Front, card.Back = draft.Front, draft.Back
			stats.UpdatedCount++
		} else {
			stats.PreservedCount++
		}
		if tags != nil {
			card.Tags = cardrepo.EncodeTags(normalizeCardTags(tags))
		}
		card.SourceType, card.SourceID = sourceType, sourceID
		card.SourceMetadata = cardrepo.MarshalSourceMetadata(metadata)
		card.UpdatedAt = now
		if err := repository.SaveCard(&card); err != nil {
			return nil, err
		}
		if schedule == nil {
			if err := repository.SaveSchedule(newGeneratedCardSchedule(card.ID, ownerID, now)); err != nil {
				return nil, err
			}
		}
	}
	for _, draft := range drafts {
		if seen[draft.TemplateOrdinal] {
			continue
		}
		card := &cardmodel.Card{DeckID: note.DeckID, OwnerUserID: ownerID, CardNoteID: note.ID, TemplateID: draft.TemplateID,
			TemplateOrdinal: draft.TemplateOrdinal, CardType: draft.CardType, Front: draft.Front, Back: draft.Back,
			SourceType: sourceType, SourceID: sourceID, SourceMetadata: cardrepo.MarshalSourceMetadata(metadata),
			Tags: cardrepo.EncodeTags(normalizeCardTags(newTags)), Status: "active", CreatedAt: now, UpdatedAt: now}
		if err := repository.CreateCard(card); err != nil {
			return nil, err
		}
		if err := repository.SaveSchedule(newGeneratedCardSchedule(card.ID, ownerID, now)); err != nil {
			return nil, err
		}
		stats.CreatedCount++
	}
	return stats, nil
}

func newGeneratedCardSchedule(cardID, ownerID string, now time.Time) *cardmodel.CardSchedule {
	return &cardmodel.CardSchedule{CardID: cardID, UserID: ownerID, DueAt: now, EaseFactor: 2.5, State: "new", UpdatedAt: now}
}
