package repository

import (
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	cardmodel "studymate/backend/internal/modules/card/model"
)

func TestLatestCardReviewTimesUsesActualLogsAndEnforcesOwner(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&cardmodel.Card{}, &cardmodel.CardReview{}); err != nil {
		t.Fatal(err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = sqlDB.Close() })
	repository := NewRepository(db)
	now := time.Date(2026, 11, 16, 8, 0, 0, 0, time.UTC)
	cards := []cardmodel.Card{
		{ID: "owned", OwnerUserID: "owner", DeckID: "deck", CardType: "basic", Front: "Q", Back: "A", Status: "active", UpdatedAt: now.Add(10 * time.Hour)},
		{ID: "unreviewed", OwnerUserID: "owner", DeckID: "deck", CardType: "basic", Front: "Q", Back: "A", Status: "active"},
		{ID: "foreign", OwnerUserID: "other", DeckID: "deck", CardType: "basic", Front: "Q", Back: "A", Status: "active"},
	}
	if err := db.Create(&cards).Error; err != nil {
		t.Fatal(err)
	}
	reviews := []cardmodel.CardReview{
		{ID: "first", CardID: "owned", UserID: "owner", Rating: "again", ReviewedAt: now.Add(-24 * time.Hour)},
		{ID: "latest", CardID: "owned", UserID: "owner", Rating: "good", ReviewedAt: now},
		{ID: "foreign-log", CardID: "owned", UserID: "other", Rating: "easy", ReviewedAt: now.Add(2 * time.Hour)},
		{ID: "foreign-card", CardID: "foreign", UserID: "owner", Rating: "easy", ReviewedAt: now.Add(2 * time.Hour)},
	}
	if err := db.Create(&reviews).Error; err != nil {
		t.Fatal(err)
	}
	times, err := repository.LatestCardReviewTimes("owner")
	if err != nil {
		t.Fatal(err)
	}
	if len(times) != 1 || !times["owned"].Equal(now) {
		t.Fatalf("expected only owned card's actual latest review, got %#v", times)
	}
	empty, err := repository.LatestCardReviewTimes("unknown")
	if err != nil || len(empty) != 0 {
		t.Fatalf("unknown owner should have empty history: %#v %v", empty, err)
	}
}

func TestLatestCardReviewTimesReturnsStorageError(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = sqlDB.Close() })
	times, err := NewRepository(db).LatestCardReviewTimes("owner")
	if err == nil || times != nil {
		t.Fatalf("expected missing-table error to propagate, got %#v %v", times, err)
	}
}
