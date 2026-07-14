package service

import (
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	adminmodel "studymate/backend/internal/modules/admin/model"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	carddto "studymate/backend/internal/modules/card/dto"
	cardmodel "studymate/backend/internal/modules/card/model"
	cardrepo "studymate/backend/internal/modules/card/repository"
)

func TestUndoReviewRestoresPreviousScheduleAndQueue(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(&adminmodel.AuditLog{}, &cardmodel.Deck{}, &cardmodel.Card{}, &cardmodel.CardSchedule{}, &cardmodel.CardReview{}); err != nil {
		t.Fatalf("migrate sqlite schema: %v", err)
	}

	repository := cardrepo.NewRepository(db)
	service := NewService(repository, adminrepo.NewAuditLogRepository(db), nil)
	fixedNow := time.Date(2026, 7, 15, 9, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return fixedNow }

	deck := &cardmodel.Deck{
		ID:          "deck-1",
		OwnerUserID: "user-1",
		Title:       "Undo review",
		Description: "Review undo should restore the last schedule",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}

	created, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType: "basic",
		Front:    "What does undo review restore?",
		Back:     "It restores the previous schedule and returns the card to today's queue.",
	})
	if err != nil {
		t.Fatalf("create card: %v", err)
	}

	beforeReview, err := repository.FindSchedule(created.ID, "user-1")
	if err != nil {
		t.Fatalf("load schedule before review: %v", err)
	}

	reviewed, err := service.ReviewCard("user-1", created.ID, carddto.ReviewCardRequest{
		Rating:    "good",
		ElapsedMs: 1500,
	})
	if err != nil {
		t.Fatalf("review card: %v", err)
	}
	if reviewed.ReviewID == "" {
		t.Fatalf("expected review id to be returned")
	}

	queueAfterReview, err := service.TodayQueue("user-1")
	if err != nil {
		t.Fatalf("queue after review: %v", err)
	}
	if queueAfterReview.DueCount != 0 || len(queueAfterReview.Items) != 0 {
		t.Fatalf("expected reviewed card to leave due queue, got due=%d items=%d", queueAfterReview.DueCount, len(queueAfterReview.Items))
	}

	undone, err := service.UndoReview("user-1", created.ID, carddto.UndoReviewRequest{
		ReviewID: reviewed.ReviewID,
		PreviousSchedule: carddto.CardSchedulePayload{
			CardID:          beforeReview.CardID,
			UserID:          beforeReview.UserID,
			DueAt:           beforeReview.DueAt.Format(time.RFC3339),
			IntervalDays:    beforeReview.IntervalDays,
			EaseFactor:      beforeReview.EaseFactor,
			RepetitionCount: beforeReview.RepetitionCount,
			LapseCount:      beforeReview.LapseCount,
			State:           beforeReview.State,
			UpdatedAt:       beforeReview.UpdatedAt.Format(time.RFC3339),
		},
	})
	if err != nil {
		t.Fatalf("undo review: %v", err)
	}
	if undone.Schedule.State != "new" || undone.Schedule.IntervalDays != 0 {
		t.Fatalf("expected previous schedule to be restored, got %#v", undone.Schedule)
	}

	queueAfterUndo, err := service.TodayQueue("user-1")
	if err != nil {
		t.Fatalf("queue after undo: %v", err)
	}
	if queueAfterUndo.DueCount != 1 || len(queueAfterUndo.Items) != 1 {
		t.Fatalf("expected undone card to return to due queue, got due=%d items=%d", queueAfterUndo.DueCount, len(queueAfterUndo.Items))
	}
}
