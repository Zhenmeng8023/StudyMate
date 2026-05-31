package service

import (
	"testing"
	"time"

	cardmodel "studymate/backend/internal/modules/card/model"
)

func TestApplySM2ScheduleAgainResetsProgress(t *testing.T) {
	reviewedAt := time.Date(2026, 5, 31, 9, 0, 0, 0, time.UTC)
	current := cardmodel.CardSchedule{
		CardID:          "card-1",
		UserID:          "user-1",
		DueAt:           reviewedAt,
		IntervalDays:    6,
		EaseFactor:      2.5,
		RepetitionCount: 2,
		LapseCount:      1,
		State:           "review",
	}

	next, ok := ApplySM2Schedule(current, "again", reviewedAt)
	if !ok {
		t.Fatal("expected valid rating")
	}

	if next.RepetitionCount != 0 {
		t.Fatalf("expected repetition count reset, got %d", next.RepetitionCount)
	}
	if next.IntervalDays != 0 {
		t.Fatalf("expected interval 0, got %d", next.IntervalDays)
	}
	if next.LapseCount != 2 {
		t.Fatalf("expected lapse count 2, got %d", next.LapseCount)
	}
	if !next.DueAt.Equal(reviewedAt.Add(4 * time.Hour)) {
		t.Fatalf("expected due_at %+v, got %+v", reviewedAt.Add(4*time.Hour), next.DueAt)
	}
}

func TestApplySM2ScheduleGoodFromNewCard(t *testing.T) {
	reviewedAt := time.Date(2026, 5, 31, 9, 0, 0, 0, time.UTC)
	current := cardmodel.CardSchedule{
		CardID:     "card-1",
		UserID:     "user-1",
		DueAt:      reviewedAt,
		EaseFactor: 2.5,
		State:      "new",
	}

	next, ok := ApplySM2Schedule(current, "good", reviewedAt)
	if !ok {
		t.Fatal("expected valid rating")
	}

	if next.RepetitionCount != 1 {
		t.Fatalf("expected repetition count 1, got %d", next.RepetitionCount)
	}
	if next.IntervalDays != 1 {
		t.Fatalf("expected interval 1 day, got %d", next.IntervalDays)
	}
	if !next.DueAt.Equal(reviewedAt.AddDate(0, 0, 1)) {
		t.Fatalf("expected due_at next day, got %+v", next.DueAt)
	}
}

func TestApplySM2ScheduleEasyExpandsInterval(t *testing.T) {
	reviewedAt := time.Date(2026, 5, 31, 9, 0, 0, 0, time.UTC)
	current := cardmodel.CardSchedule{
		CardID:          "card-1",
		UserID:          "user-1",
		DueAt:           reviewedAt,
		IntervalDays:    6,
		EaseFactor:      2.5,
		RepetitionCount: 2,
		State:           "review",
	}

	next, ok := ApplySM2Schedule(current, "easy", reviewedAt)
	if !ok {
		t.Fatal("expected valid rating")
	}

	if next.RepetitionCount != 3 {
		t.Fatalf("expected repetition count 3, got %d", next.RepetitionCount)
	}
	if next.IntervalDays <= current.IntervalDays {
		t.Fatalf("expected interval to grow, got current=%d next=%d", current.IntervalDays, next.IntervalDays)
	}
	if next.EaseFactor <= current.EaseFactor {
		t.Fatalf("expected ease factor to grow, got current=%0.2f next=%0.2f", current.EaseFactor, next.EaseFactor)
	}
}
