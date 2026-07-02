package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Note struct {
	ID            string    `gorm:"primaryKey;size:36"`
	OwnerUserID   string    `gorm:"size:36;index;not null"`
	Title         string    `gorm:"size:200;not null"`
	Summary       string    `gorm:"size:500"`
	Content       string    `gorm:"type:text;not null"`
	MaterialID    string    `gorm:"size:36;index"`
	FolderName    string    `gorm:"size:120;index"`
	Tags          string    `gorm:"type:text"`
	VersionNumber int       `gorm:"not null"`
	CreatedAt     time.Time `gorm:"not null"`
	UpdatedAt     time.Time `gorm:"not null"`
}

func (n *Note) BeforeCreate(_ *gorm.DB) error {
	if n.ID == "" {
		n.ID = uuid.NewString()
	}

	return nil
}
