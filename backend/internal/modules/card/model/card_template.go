package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CardTemplate struct {
	ID           string    `gorm:"primaryKey;size:36"`
	NoteTypeID   string    `gorm:"size:36;index;not null"`
	TemplateKey  string    `gorm:"size:64;index;not null"`
	Name         string    `gorm:"size:128;not null"`
	TemplateKind string    `gorm:"size:64;index;not null"`
	Ordinal      int       `gorm:"not null"`
	IsActive     bool      `gorm:"not null"`
	FrontFormat  string    `gorm:"type:text"`
	BackFormat   string    `gorm:"type:text"`
	ClozeRule    string    `gorm:"type:text"`
	CreatedAt    time.Time `gorm:"not null"`
	UpdatedAt    time.Time `gorm:"not null"`
}

func (c *CardTemplate) BeforeCreate(_ *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.NewString()
	}

	return nil
}
