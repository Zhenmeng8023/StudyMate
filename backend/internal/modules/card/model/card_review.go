package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CardReview struct {
	ID         string    `gorm:"primaryKey;size:36"`
	CardID     string    `gorm:"size:36;index;not null"`
	UserID     string    `gorm:"size:36;index;not null"`
	Rating     string    `gorm:"size:16;index;not null"`
	ElapsedMs  int64     `gorm:"not null"`
	ReviewedAt time.Time `gorm:"not null"`
}

func (r *CardReview) BeforeCreate(_ *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.NewString()
	}

	return nil
}
