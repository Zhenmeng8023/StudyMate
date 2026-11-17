package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CardNote struct {
	ID                 string    `gorm:"primaryKey;size:36"`
	DeckID             string    `gorm:"size:36;index;not null"`
	OwnerUserID        string    `gorm:"size:36;index;not null"`
	NoteTypeID         string    `gorm:"size:36;index;not null"`
	NoteTypeCode       string    `gorm:"size:64;index;not null"`
	PrimarySourceType  string    `gorm:"size:64;index"`
	PrimarySourceID    string    `gorm:"size:64;index"`
	FieldsJSON         string    `gorm:"type:text"`
	SourceLinksJSON    string    `gorm:"type:text"`
	Status             string    `gorm:"size:32;index;not null"`
	GeneratedCardCount int       `gorm:"not null"`
	CreatedAt          time.Time `gorm:"not null"`
	UpdatedAt          time.Time `gorm:"not null"`
}

func (c *CardNote) BeforeCreate(_ *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.NewString()
	}

	return nil
}
