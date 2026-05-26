package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MaterialFavorite struct {
	ID         string    `gorm:"primaryKey;size:36"`
	MaterialID string    `gorm:"size:36;index:idx_material_favorite_user,unique;not null"`
	UserID     string    `gorm:"size:36;index:idx_material_favorite_user,unique;not null"`
	CreatedAt  time.Time `gorm:"not null"`
}

type MaterialRating struct {
	ID         string    `gorm:"primaryKey;size:36"`
	MaterialID string    `gorm:"size:36;index:idx_material_rating_user,unique;not null"`
	UserID     string    `gorm:"size:36;index:idx_material_rating_user,unique;not null"`
	Score      int       `gorm:"not null"`
	CreatedAt  time.Time `gorm:"not null"`
	UpdatedAt  time.Time `gorm:"not null"`
}

func (f *MaterialFavorite) BeforeCreate(_ *gorm.DB) error {
	if f.ID == "" {
		f.ID = uuid.NewString()
	}

	return nil
}

func (r *MaterialRating) BeforeCreate(_ *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.NewString()
	}

	return nil
}
