package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           string    `gorm:"primaryKey;size:36"`
	Username     string    `gorm:"size:64;uniqueIndex;not null"`
	Email        string    `gorm:"size:128;uniqueIndex;not null"`
	PasswordHash string    `gorm:"size:255;not null"`
	DisplayName  string    `gorm:"size:128;not null"`
	Role         string    `gorm:"size:32;index;not null"`
	Status       string    `gorm:"size:32;index;not null;default:active"`
	CreatedAt    time.Time `gorm:"not null"`
	UpdatedAt    time.Time `gorm:"not null"`
}

func (u *User) BeforeCreate(_ *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.NewString()
	}

	if u.Status == "" {
		u.Status = "active"
	}

	return nil
}
