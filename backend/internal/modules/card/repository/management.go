package repository

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	cardmodel "studymate/backend/internal/modules/card/model"
)

func (r *Repository) FindCardNoteForUpdate(id string) (*cardmodel.CardNote, error) {
	var note cardmodel.CardNote
	err := r.db.Clauses(clause.Locking{Strength: "UPDATE"}).First(&note, "id = ?", id).Error
	return &note, err
}

func (r *Repository) FindCardForUpdate(id string) (*cardmodel.Card, error) {
	var card cardmodel.Card
	err := r.db.Clauses(clause.Locking{Strength: "UPDATE"}).First(&card, "id = ?", id).Error
	return &card, err
}

func (r *Repository) CountCardReviews(ownerID, cardID string) (int64, error) {
	var count int64
	err := r.db.Model(&cardmodel.CardReview{}).Where("user_id = ? AND card_id = ?", ownerID, cardID).Count(&count).Error
	return count, err
}

// DeleteOwnedCard removes dependent records in the caller's transaction.
func (r *Repository) DeleteOwnedCard(ownerID, cardID string) error {
	if err := r.db.Where("user_id = ? AND card_id = ?", ownerID, cardID).Delete(&cardmodel.CardReview{}).Error; err != nil {
		return err
	}
	if err := r.db.Where("user_id = ? AND card_id = ?", ownerID, cardID).Delete(&cardmodel.CardSchedule{}).Error; err != nil {
		return err
	}
	result := r.db.Where("owner_user_id = ? AND id = ?", ownerID, cardID).Delete(&cardmodel.Card{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *Repository) AdjustDeckCardCount(ownerID, deckID string, delta int64) error {
	return r.db.Model(&cardmodel.Deck{}).Where("owner_user_id = ? AND id = ?", ownerID, deckID).
		UpdateColumn("card_count", gorm.Expr("CASE WHEN card_count + ? < 0 THEN 0 ELSE card_count + ? END", delta, delta)).Error
}
