package model

import "time"

type CardSchedule struct {
	CardID          string    `gorm:"primaryKey;size:36"`
	UserID          string    `gorm:"primaryKey;size:36"`
	DueAt           time.Time `gorm:"index;not null"`
	IntervalDays    int       `gorm:"not null"`
	EaseFactor      float64   `gorm:"not null"`
	RepetitionCount int       `gorm:"not null"`
	LapseCount      int       `gorm:"not null"`
	State           string    `gorm:"size:32;index;not null"`
	UpdatedAt       time.Time `gorm:"not null"`
}
