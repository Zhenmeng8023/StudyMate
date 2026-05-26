package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Material struct {
	ID               string    `gorm:"primaryKey;size:36"`
	OwnerUserID      string    `gorm:"size:36;index;not null"`
	Title            string    `gorm:"size:200;not null"`
	Description      string    `gorm:"type:text;not null"`
	Category         string    `gorm:"size:64;index;not null"`
	Tags             string    `gorm:"type:text"`
	CoverFileID      string    `gorm:"size:36"`
	AttachmentFileID string    `gorm:"size:36"`
	Status           string    `gorm:"size:32;index;not null"`
	CreatedAt        time.Time `gorm:"not null"`
	UpdatedAt        time.Time `gorm:"not null"`
}

func (m *Material) BeforeCreate(_ *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.NewString()
	}

	return nil
}
