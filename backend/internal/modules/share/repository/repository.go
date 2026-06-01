package repository

import (
	"errors"
	"time"

	sharemodel "studymate/backend/internal/modules/share/model"

	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(link *sharemodel.ShareLink) error {
	return r.db.Create(link).Error
}

func (r *Repository) ListByOwner(ownerUserID string) ([]sharemodel.ShareLink, error) {
	var links []sharemodel.ShareLink
	err := r.db.
		Where("owner_user_id = ?", ownerUserID).
		Order("created_at DESC").
		Limit(100).
		Find(&links).Error
	return links, err
}

func (r *Repository) FindActiveByToken(token string, now time.Time) (*sharemodel.ShareLink, error) {
	var link sharemodel.ShareLink
	err := r.db.
		Where("token = ? AND status = ? AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > ?)", token, "active", now).
		First(&link).Error
	if err != nil {
		return nil, err
	}
	return &link, nil
}

func (r *Repository) Revoke(ownerUserID string, linkID string, now time.Time) error {
	result := r.db.Model(&sharemodel.ShareLink{}).
		Where("id = ? AND owner_user_id = ? AND revoked_at IS NULL", linkID, ownerUserID).
		Updates(map[string]any{
			"status":     "revoked",
			"revoked_at": now,
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *Repository) IsNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
