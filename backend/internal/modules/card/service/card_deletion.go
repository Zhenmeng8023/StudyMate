package service

import (
	"net/http"

	"gorm.io/gorm"
	carddto "studymate/backend/internal/modules/card/dto"
	cardmodel "studymate/backend/internal/modules/card/model"
	cardrepo "studymate/backend/internal/modules/card/repository"
	"studymate/backend/internal/pkg/apperrors"
)

func (s *Service) DeleteCard(ownerID, cardID string, request carddto.DeleteCardRequest) (*carddto.DeleteCardResultPayload, error) {
	result := &carddto.DeleteCardResultPayload{CardID: cardID}
	err := s.withLockedCard(ownerID, cardID, func(repository *cardrepo.Repository, card *cardmodel.Card) error {
		result.DeckID = card.DeckID
		reviews, err := repository.CountCardReviews(ownerID, cardID)
		if err != nil {
			return err
		}
		schedule, err := repository.FindSchedule(cardID, ownerID)
		if err != nil && err != gorm.ErrRecordNotFound {
			return err
		}
		if (reviews > 0 || !isUnreviewedGeneratedCard(schedule)) && !request.ConfirmDeleteHistory {
			return apperrors.New(http.StatusConflict, "card_history_confirmation_required", "删除此卡片将同时删除复习记录，请明确确认")
		}
		if err := repository.DeleteOwnedCard(ownerID, cardID); err != nil {
			return err
		}
		if err := repository.AdjustDeckCardCount(ownerID, card.DeckID, -1); err != nil {
			return err
		}
		if card.CardNoteID != "" {
			note, err := repository.FindCardNoteByID(card.CardNoteID)
			if err != nil {
				return err
			}
			cards, err := repository.ListCardsByCardNoteID(ownerID, card.CardNoteID)
			if err != nil {
				return err
			}
			note.GeneratedCardCount = len(cards)
			note.UpdatedAt = s.now().UTC()
			if err := repository.SaveCardNote(note); err != nil {
				return err
			}
		}
		result.DeletedReviewCount = reviews
		return nil
	})
	if err != nil {
		if _, ok := err.(*apperrors.Error); ok {
			return nil, err
		}
		if err == gorm.ErrRecordNotFound {
			return nil, apperrors.New(http.StatusNotFound, "card_not_found", "卡片不存在")
		}
		return nil, apperrors.Internal("删除卡片失败")
	}
	_ = s.auditLogs.Create(ownerID, "card.delete", "card", map[string]any{"cardId": cardID, "deckId": result.DeckID, "deletedReviewCount": result.DeletedReviewCount})
	return result, nil
}
