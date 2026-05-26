package repository

import (
	"time"

	"gorm.io/gorm"
	"studymate/backend/internal/modules/auth/model"
)

type RefreshTokenRepository struct {
	db *gorm.DB
}

func NewRefreshTokenRepository(db *gorm.DB) *RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

func (r *RefreshTokenRepository) Create(token *model.RefreshToken) error {
	return r.db.Create(token).Error
}

func (r *RefreshTokenRepository) FindByHash(hash string) (*model.RefreshToken, error) {
	var token model.RefreshToken
	err := r.db.First(&token, "token_hash = ?", hash).Error
	if err != nil {
		return nil, err
	}

	return &token, nil
}

func (r *RefreshTokenRepository) RevokeByHash(hash string) error {
	now := time.Now()
	return r.db.Model(&model.RefreshToken{}).
		Where("token_hash = ? AND revoked_at IS NULL", hash).
		Update("revoked_at", &now).
		Error
}
