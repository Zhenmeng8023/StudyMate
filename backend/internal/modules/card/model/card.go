package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Card struct {
	ID             string    `gorm:"primaryKey;size:36"`
	DeckID         string    `gorm:"size:36;index;not null"`
	OwnerUserID    string    `gorm:"size:36;index;not null"`
	CardType       string    `gorm:"size:32;index;not null"`
	Front          string    `gorm:"type:text;not null"`
	Back           string    `gorm:"type:text;not null"`
	Tags           string    `gorm:"type:text"`
	SourceType     string    `gorm:"size:32;index"`
	SourceID       string    `gorm:"size:36;index"`
	SourceMetadata string    `gorm:"type:text"`
	Status         string    `gorm:"size:32;index;not null"`
	CreatedAt      time.Time `gorm:"not null"`
	UpdatedAt      time.Time `gorm:"not null"`
}

func (c *Card) BeforeCreate(_ *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.NewString()
	}

	return nil
}
