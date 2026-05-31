package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Deck struct {
	ID          string    `gorm:"primaryKey;size:36"`
	OwnerUserID string    `gorm:"size:36;index;not null"`
	Title       string    `gorm:"size:200;not null"`
	Description string    `gorm:"type:text"`
	Visibility  string    `gorm:"size:32;index;not null"`
	CardCount   int64     `gorm:"not null"`
	CreatedAt   time.Time `gorm:"not null"`
	UpdatedAt   time.Time `gorm:"not null"`
}

func (d *Deck) BeforeCreate(_ *gorm.DB) error {
	if d.ID == "" {
		d.ID = uuid.NewString()
	}

	return nil
}
