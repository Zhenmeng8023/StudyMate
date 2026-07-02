package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReadingProgress struct {
	ID              string    `gorm:"primaryKey;size:36"`
	UserID          string    `gorm:"size:36;index;not null"`
	MaterialID      string    `gorm:"size:36;index;not null"`
	CurrentPage     int       `gorm:"not null"`
	TotalPages      int       `gorm:"not null"`
	ProgressPercent float64   `gorm:"not null"`
	Bookmarks       string    `gorm:"type:text"`
	LastReadAt      time.Time `gorm:"not null"`
	CreatedAt       time.Time `gorm:"not null"`
	UpdatedAt       time.Time `gorm:"not null"`
}

func (r *ReadingProgress) BeforeCreate(_ *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.NewString()
	}

	return nil
}
