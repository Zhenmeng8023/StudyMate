package service

import (
	"errors"
	"net/http"

	"gorm.io/gorm"
	cardmodel "studymate/backend/internal/modules/card/model"
	cardrepo "studymate/backend/internal/modules/card/repository"
	"studymate/backend/internal/pkg/apperrors"
)

// All mutation paths acquire Note before Card, then re-read owned state in the transaction.
// The initial read only discovers the lock scope and cannot authorize a later write.
func (s *Service) withLockedCard(ownerID, cardID string, apply func(*cardrepo.Repository, *cardmodel.Card) error) error {
	initial, err := s.requireOwnerCard(ownerID, cardID)
	if err != nil {
		return err
	}
	err = s.repository.InTransaction(func(repository *cardrepo.Repository) error {
		if initial.CardNoteID != "" {
			note, err := repository.FindCardNoteForUpdate(initial.CardNoteID)
			if err != nil {
				return err
			}
			if note.OwnerUserID != ownerID {
				return apperrors.New(http.StatusForbidden, "card_note_forbidden", "无权访问该 CardNote")
			}
		}
		card, err := repository.FindCardForUpdate(cardID)
		if err != nil {
			return err
		}
		if card.OwnerUserID != ownerID {
			return apperrors.New(http.StatusForbidden, "card_forbidden", "你没有权限访问这张卡片")
		}
		if card.CardNoteID != initial.CardNoteID {
			return apperrors.New(http.StatusConflict, "card_changed", "卡片来源已变化，请刷新后重试")
		}
		return apply(repository, card)
	})
	if err == nil {
		return nil
	}
	if _, ok := err.(*apperrors.Error); ok {
		return err
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return apperrors.New(http.StatusNotFound, "card_not_found", "卡片不存在或已被删除")
	}
	return apperrors.Internal("更新卡片失败，请重试")
}
