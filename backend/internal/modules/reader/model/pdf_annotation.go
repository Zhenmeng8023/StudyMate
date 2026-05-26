package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PDFAnnotation struct {
	ID         string    `gorm:"primaryKey;size:36"`
	UserID     string    `gorm:"size:36;index;not null"`
	MaterialID string    `gorm:"size:36;index;not null"`
	Page       int       `gorm:"not null"`
	Quote      string    `gorm:"size:1000"`
	Comment    string    `gorm:"type:text"`
	Color      string    `gorm:"size:32"`
	CreatedAt  time.Time `gorm:"not null"`
	UpdatedAt  time.Time `gorm:"not null"`
}

func (r *PDFAnnotation) BeforeCreate(_ *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.NewString()
	}

	return nil
}

