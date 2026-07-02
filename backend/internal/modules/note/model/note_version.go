package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type NoteVersion struct {
	ID            string    `gorm:"primaryKey;size:36"`
	NoteID        string    `gorm:"size:36;index;not null"`
	EditorUserID  string    `gorm:"size:36;index;not null"`
	VersionNumber int       `gorm:"not null"`
	Title         string    `gorm:"size:200;not null"`
	Summary       string    `gorm:"size:500"`
	Content       string    `gorm:"type:text;not null"`
	CreatedAt     time.Time `gorm:"not null"`
}

func (n *NoteVersion) BeforeCreate(_ *gorm.DB) error {
	if n.ID == "" {
		n.ID = uuid.NewString()
	}

	return nil
}
