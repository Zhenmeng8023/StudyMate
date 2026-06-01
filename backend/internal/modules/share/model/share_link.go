package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ShareLink struct {
	ID          string     `gorm:"primaryKey;size:36"`
	OwnerUserID string     `gorm:"size:36;index;not null"`
	TargetType  string     `gorm:"size:32;index;not null"`
	TargetID    string     `gorm:"size:36;index;not null"`
	Mode        string     `gorm:"size:32;index;not null"`
	Token       string     `gorm:"size:96;uniqueIndex;not null"`
	Status      string     `gorm:"size:32;index;not null"`
	ExpiresAt   *time.Time `gorm:"index"`
	CreatedAt   time.Time  `gorm:"not null"`
	RevokedAt   *time.Time `gorm:"index"`
}

func (s *ShareLink) BeforeCreate(_ *gorm.DB) error {
	if s.ID == "" {
		s.ID = uuid.NewString()
	}
	if s.Status == "" {
		s.Status = "active"
	}

	return nil
}
