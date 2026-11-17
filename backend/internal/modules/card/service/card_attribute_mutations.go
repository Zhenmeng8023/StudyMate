package service

import (
	"net/http"

	carddto "studymate/backend/internal/modules/card/dto"
	cardmodel "studymate/backend/internal/modules/card/model"
	cardrepo "studymate/backend/internal/modules/card/repository"
	"studymate/backend/internal/pkg/apperrors"
)

func (s *Service) UpdateCardStatus(ownerID, cardID string, request carddto.UpdateCardStatusRequest) (*carddto.CardPayload, error) {
	status, ok := normalizeCardStatus(request.Status)
	if !ok {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_card_status", "卡片状态必须是 active、suspended 或 buried")
	}
	var payload carddto.CardPayload
	err := s.withLockedCard(ownerID, cardID, func(repository *cardrepo.Repository, card *cardmodel.Card) error {
		if card.Status != status {
			card.Status = status
			if err := repository.SaveCard(card); err != nil {
				return err
			}
		}
		payload = cardrepo.BuildCardPayload(*card)
		return nil
	})
	if err != nil {
		return nil, err
	}
	_ = s.auditLogs.Create(ownerID, "card.status.update", "card", map[string]any{"cardId": cardID, "status": status})
	return &payload, nil
}

func (s *Service) UpdateCardTags(ownerID, cardID string, request carddto.UpdateCardTagsRequest) (*carddto.CardPayload, error) {
	tags := normalizeCardTags(request.Tags)
	var payload carddto.CardPayload
	err := s.withLockedCard(ownerID, cardID, func(repository *cardrepo.Repository, card *cardmodel.Card) error {
		if !sameNormalizedTags(cardrepo.DecodeTags(card.Tags), tags) {
			card.Tags = cardrepo.EncodeTags(tags)
			if err := repository.SaveCard(card); err != nil {
				return err
			}
		}
		payload = cardrepo.BuildCardPayload(*card)
		return nil
	})
	if err != nil {
		return nil, err
	}
	_ = s.auditLogs.Create(ownerID, "card.tags.update", "card", map[string]any{"cardId": cardID, "tags": tags, "count": len(tags)})
	return &payload, nil
}
