package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuditLog struct {
	ID        string    `gorm:"primaryKey;size:36"`
	ActorID   string    `gorm:"size:36;index"`
	Action    string    `gorm:"size:128;index;not null"`
	Target    string    `gorm:"size:128;index;not null"`
	Metadata  string    `gorm:"type:text"`
	CreatedAt time.Time `gorm:"not null"`
}

func (a *AuditLog) BeforeCreate(_ *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.NewString()
	}

	return nil
}
