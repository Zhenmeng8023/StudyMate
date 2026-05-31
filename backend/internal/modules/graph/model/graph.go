package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Graph struct {
	ID             string    `gorm:"primaryKey;size:36"`
	OwnerUserID    string    `gorm:"size:36;index;not null"`
	Title          string    `gorm:"size:200;not null"`
	Description    string    `gorm:"type:text"`
	Visibility     string    `gorm:"size:32;index;not null"`
	Status         string    `gorm:"size:32;index;not null"`
	GraphType      string    `gorm:"size:32;index;not null"`
	Mode           string    `gorm:"size:32;index;not null"`
	CurrentVersion int64     `gorm:"not null"`
	NodeCount      int64     `gorm:"not null"`
	EdgeCount      int64     `gorm:"not null"`
	ThumbnailFileID string   `gorm:"size:36"`
	CreatedAt      time.Time `gorm:"not null"`
	UpdatedAt      time.Time `gorm:"not null"`
}

func (g *Graph) BeforeCreate(_ *gorm.DB) error {
	if g.ID == "" {
		g.ID = uuid.NewString()
	}

	return nil
}
