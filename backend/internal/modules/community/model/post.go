package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Post struct {
	ID           string    `gorm:"primaryKey;size:36"`
	AuthorUserID string    `gorm:"size:36;index;not null"`
	Title        string    `gorm:"size:200;not null"`
	Body         string    `gorm:"type:text;not null"`
	Kind         string    `gorm:"size:32;not null"`
	Status       string    `gorm:"size:32;index;not null"`
	CreatedAt    time.Time `gorm:"not null"`
	UpdatedAt    time.Time `gorm:"not null"`
}

func (p *Post) BeforeCreate(_ *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.NewString()
	}

	return nil
}
