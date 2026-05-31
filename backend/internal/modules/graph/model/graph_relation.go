package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type GraphRelation struct {
	ID           string    `gorm:"primaryKey;size:36"`
	GraphID      string    `gorm:"size:36;index;not null"`
	TargetType   string    `gorm:"size:32;index;not null"`
	TargetID     string    `gorm:"size:36;index;not null"`
	RelationType string    `gorm:"size:32;not null"`
	CreatedAt    time.Time `gorm:"not null"`
}

func (g *GraphRelation) BeforeCreate(_ *gorm.DB) error {
	if g.ID == "" {
		g.ID = uuid.NewString()
	}

	return nil
}
