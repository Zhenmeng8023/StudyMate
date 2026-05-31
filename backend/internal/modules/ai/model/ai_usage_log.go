package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AIUsageLog struct {
	ID           string    `gorm:"primaryKey;size:36"`
	UserID       string    `gorm:"size:36;index;not null"`
	TaskID       string    `gorm:"size:36;index"`
	Model        string    `gorm:"size:128;not null"`
	InputTokens  int64     `gorm:"not null"`
	OutputTokens int64     `gorm:"not null"`
	CostUnits    float64   `gorm:"type:decimal(18,6);not null"`
	CreatedAt    time.Time `gorm:"not null"`
}

func (a *AIUsageLog) BeforeCreate(_ *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.NewString()
	}

	return nil
}
