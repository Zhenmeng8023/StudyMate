package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AITask struct {
	ID             string    `gorm:"primaryKey;size:36"`
	UserID         string    `gorm:"size:36;index;not null"`
	TaskType       string    `gorm:"size:64;index;not null"`
	SourceType     string    `gorm:"size:32;index"`
	SourceID       string    `gorm:"size:36;index"`
	SourceMetadata string    `gorm:"type:text"`
	Status         string    `gorm:"size:32;index;not null"`
	Model          string    `gorm:"size:128"`
	InputTokens    int64     `gorm:"not null"`
	OutputTokens   int64     `gorm:"not null"`
	ResultRefType  string    `gorm:"size:32"`
	ResultRefID    string    `gorm:"size:36"`
	ErrorMessage   string    `gorm:"type:text"`
	CreatedAt      time.Time `gorm:"not null"`
	UpdatedAt      time.Time `gorm:"not null"`
}

func (a *AITask) BeforeCreate(_ *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.NewString()
	}

	return nil
}
