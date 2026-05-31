package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type GraphVersion struct {
	ID              string    `gorm:"primaryKey;size:36"`
	GraphID         string    `gorm:"size:36;index;not null"`
	VersionNumber   int64     `gorm:"not null"`
	EditorUserID    string    `gorm:"size:36;index;not null"`
	MongoSnapshotID string    `gorm:"size:64;index;not null"`
	Summary         string    `gorm:"size:500"`
	CreatedAt       time.Time `gorm:"not null"`
}

func (g *GraphVersion) BeforeCreate(_ *gorm.DB) error {
	if g.ID == "" {
		g.ID = uuid.NewString()
	}

	return nil
}
