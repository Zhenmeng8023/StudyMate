package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NoteType struct {
	ID              string    `gorm:"primaryKey;size:36"`
	OwnerUserID     string    `gorm:"size:36;index"`
	Code            string    `gorm:"size:64;uniqueIndex;not null"`
	Name            string    `gorm:"size:128;not null"`
	Kind            string    `gorm:"size:64;index;not null"`
	IsBuiltin       bool      `gorm:"not null"`
	Status          string    `gorm:"size:32;index;not null"`
	FieldSchemaJSON string    `gorm:"type:text"`
	TemplateCount   int       `gorm:"not null"`
	CreatedAt       time.Time `gorm:"not null"`
	UpdatedAt       time.Time `gorm:"not null"`
}

func (n *NoteType) BeforeCreate(_ *gorm.DB) error {
	if n.ID == "" {
		n.ID = uuid.NewString()
	}

	return nil
}
