package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NoteRelation struct {
	ID         string    `gorm:"primaryKey;size:36"`
	NoteID     string    `gorm:"size:36;index;not null"`
	TargetType string    `gorm:"size:32;index;not null"`
	TargetID   string    `gorm:"size:36;index;not null"`
	CreatedAt  time.Time `gorm:"not null"`
}

func (n *NoteRelation) BeforeCreate(_ *gorm.DB) error {
	if n.ID == "" {
		n.ID = uuid.NewString()
	}

	return nil
}

