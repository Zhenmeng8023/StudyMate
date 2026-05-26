package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PostLike struct {
	ID        string    `gorm:"primaryKey;size:36"`
	PostID    string    `gorm:"size:36;index:idx_post_like_user,unique;not null"`
	UserID    string    `gorm:"size:36;index:idx_post_like_user,unique;not null"`
	CreatedAt time.Time `gorm:"not null"`
}

type PostFavorite struct {
	ID        string    `gorm:"primaryKey;size:36"`
	PostID    string    `gorm:"size:36;index:idx_post_favorite_user,unique;not null"`
	UserID    string    `gorm:"size:36;index:idx_post_favorite_user,unique;not null"`
	CreatedAt time.Time `gorm:"not null"`
}

func (l *PostLike) BeforeCreate(_ *gorm.DB) error {
	if l.ID == "" {
		l.ID = uuid.NewString()
	}

	return nil
}

func (f *PostFavorite) BeforeCreate(_ *gorm.DB) error {
	if f.ID == "" {
		f.ID = uuid.NewString()
	}

	return nil
}
