package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RefreshToken struct {
	ID        string     `gorm:"primaryKey;size:36"`
	UserID    string     `gorm:"size:36;index;not null"`
	TokenHash string     `gorm:"size:64;uniqueIndex;not null"`
	ExpiresAt time.Time  `gorm:"not null"`
	RevokedAt *time.Time `gorm:"default:null"`
	CreatedAt time.Time  `gorm:"not null"`
}

func (t *RefreshToken) BeforeCreate(_ *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.NewString()
	}

	return nil
}
