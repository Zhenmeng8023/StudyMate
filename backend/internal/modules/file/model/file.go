package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FileRecord struct {
	ID           string    `gorm:"primaryKey;size:36"`
	OwnerUserID  string    `gorm:"size:36;index;not null"`
	OriginalName string    `gorm:"size:255;not null"`
	StoredName   string    `gorm:"size:255;not null"`
	MimeType     string    `gorm:"size:128;not null"`
	Size         int64     `gorm:"not null"`
	Path         string    `gorm:"size:512;not null"`
	CreatedAt    time.Time `gorm:"not null"`
	UpdatedAt    time.Time `gorm:"not null"`
}

func (f *FileRecord) BeforeCreate(_ *gorm.DB) error {
	if f.ID == "" {
		f.ID = uuid.NewString()
	}

	return nil
}
