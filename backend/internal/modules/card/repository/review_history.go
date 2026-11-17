package repository

import (
	cardmodel "studymate/backend/internal/modules/card/model"
	"time"
)

// LatestCardReviewTimes returns actual review timestamps, not schedule edit times.
func (r *Repository) LatestCardReviewTimes(ownerUserID string) (map[string]time.Time, error) {
	latest := r.db.Model(&cardmodel.CardReview{}).
		Select("card_id, MAX(reviewed_at) AS latest_at").
		Where("user_id = ?", ownerUserID).Group("card_id")
	var reviews []cardmodel.CardReview
	err := r.db.Model(&cardmodel.CardReview{}).Select("card_reviews.*").
		Joins("JOIN (?) latest ON latest.card_id = card_reviews.card_id AND latest.latest_at = card_reviews.reviewed_at", latest).
		Joins("JOIN cards ON cards.id = card_reviews.card_id").
		Where("card_reviews.user_id = ? AND cards.owner_user_id = ?", ownerUserID, ownerUserID).
		Find(&reviews).Error
	if err != nil {
		return nil, err
	}
	result := make(map[string]time.Time, len(reviews))
	for _, review := range reviews {
		result[review.CardID] = review.ReviewedAt
	}
	return result, nil
}
