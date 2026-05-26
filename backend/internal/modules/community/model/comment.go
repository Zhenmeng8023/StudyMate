package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Comment struct {
	ID           string    `gorm:"primaryKey;size:36"`
	PostID       string    `gorm:"size:36;index;not null"`
	AuthorUserID string    `gorm:"size:36;index;not null"`
	Body         string    `gorm:"type:text;not null"`
	Status       string    `gorm:"size:32;index;not null"`
	CreatedAt    time.Time `gorm:"not null"`
	UpdatedAt    time.Time `gorm:"not null"`
}

func (c *Comment) BeforeCreate(_ *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.NewString()
	}

	return nil
}
