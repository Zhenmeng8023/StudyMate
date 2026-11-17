package service

import (
	"errors"
	"net/http"
	"strings"

	"gorm.io/gorm"
	carddto "studymate/backend/internal/modules/card/dto"
	cardmodel "studymate/backend/internal/modules/card/model"
	cardrepo "studymate/backend/internal/modules/card/repository"
	"studymate/backend/internal/pkg/apperrors"
)

func (s *Service) ReviewCard(ownerID, cardID string, request carddto.ReviewCardRequest) (*carddto.ReviewResultPayload, error) {
	var payload carddto.ReviewResultPayload
	err := s.withLockedCard(ownerID, cardID, func(repository *cardrepo.Repository, card *cardmodel.Card) error {
		if card.Status != "active" {
			return apperrors.New(http.StatusConflict, "card_not_active", "暂停或埋藏的卡片不能评分，请先恢复")
		}
		schedule, err := repository.FindSchedule(card.ID, ownerID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperrors.New(http.StatusNotFound, "schedule_not_found", "当前卡片还没有复习计划")
		}
		if err != nil {
			return err
		}
		now := s.now().UTC()
		next, ok := s.scheduler.Apply(*schedule, request.Rating, now)
		if !ok {
			return apperrors.New(http.StatusBadRequest, "invalid_review_rating", "评分必须是 again、hard、good 或 easy")
		}
		review := &cardmodel.CardReview{CardID: card.ID, UserID: ownerID, Rating: NormalizeReviewRating(request.Rating), ElapsedMs: maxElapsed(request.ElapsedMs), ReviewedAt: now}
		if err := repository.CreateReview(review); err != nil {
			return err
		}
		if err := repository.SaveSchedule(&next); err != nil {
			return err
		}
		payload = carddto.ReviewResultPayload{ReviewID: review.ID, Schedule: cardrepo.BuildSchedulePayload(next)}
		return nil
	})
	if err != nil {
		return nil, err
	}
	_ = s.auditLogs.Create(ownerID, "card.review", "card", map[string]any{"cardId": cardID, "rating": NormalizeReviewRating(request.Rating)})
	return &payload, nil
}

func (s *Service) UndoReview(ownerID, cardID string, request carddto.UndoReviewRequest) (*carddto.UndoReviewResultPayload, error) {
	reviewID := strings.TrimSpace(request.ReviewID)
	if reviewID == "" {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_review_id", "撤销评分时必须提供 reviewId")
	}
	var payload carddto.UndoReviewResultPayload
	err := s.withLockedCard(ownerID, cardID, func(repository *cardrepo.Repository, card *cardmodel.Card) error {
		schedule, err := repository.FindSchedule(card.ID, ownerID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperrors.New(http.StatusNotFound, "schedule_not_found", "当前卡片还没有复习计划")
		}
		if err != nil {
			return err
		}
		latest, err := repository.FindLatestReview(card.ID, ownerID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperrors.New(http.StatusNotFound, "review_not_found", "没有找到可撤销的评分记录")
		}
		if err != nil {
			return err
		}
		if latest.ID != reviewID {
			return apperrors.New(http.StatusConflict, "review_undo_conflict", "当前只能撤销这张卡片最新的一次评分")
		}
		restored, err := buildRestoredSchedule(*schedule, card.ID, ownerID, request.PreviousSchedule)
		if err != nil {
			return err
		}
		if err := repository.SaveSchedule(&restored); err != nil {
			return err
		}
		if err := repository.DeleteReviewByID(latest.ID); err != nil {
			return err
		}
		payload.Schedule = cardrepo.BuildSchedulePayload(restored)
		return nil
	})
	if err != nil {
		return nil, err
	}
	_ = s.auditLogs.Create(ownerID, "card.review.undo", "card", map[string]any{"cardId": cardID, "reviewId": reviewID})
	return &payload, nil
}
