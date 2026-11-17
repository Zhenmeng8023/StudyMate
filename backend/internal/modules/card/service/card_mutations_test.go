package service

import (
	"testing"
	"time"

	carddto "studymate/backend/internal/modules/card/dto"
	cardmodel "studymate/backend/internal/modules/card/model"
)

func TestReviewCardRollsBackLogWhenScheduleWriteFails(t *testing.T) {
	s, db, created := newManagedNoteTest(t)
	cardID := created.GeneratedCards[0].ID
	if err := db.Exec("CREATE TRIGGER reject_review_schedule BEFORE UPDATE ON card_schedules BEGIN SELECT RAISE(ABORT, 'write failure'); END").Error; err != nil {
		t.Fatal(err)
	}
	if _, err := s.ReviewCard("owner", cardID, carddto.ReviewCardRequest{Rating: "good"}); err == nil {
		t.Fatal("expected schedule storage failure")
	}
	var count int64
	if err := db.Model(&cardmodel.CardReview{}).Where("card_id = ?", cardID).Count(&count).Error; err != nil || count != 0 {
		t.Fatalf("partial review log survived failed scoring: %d %v", count, err)
	}
}

type pausedReviewScheduler struct {
	entered chan struct{}
	release chan struct{}
}

func (s pausedReviewScheduler) Apply(current cardmodel.CardSchedule, rating string, now time.Time) (cardmodel.CardSchedule, bool) {
	close(s.entered)
	<-s.release
	return SM2Scheduler{}.Apply(current, rating, now)
}

func TestReviewAndDeleteCannotLeaveOrphanScheduleOrLog(t *testing.T) {
	s, db, created := newManagedNoteTest(t)
	cardID := created.GeneratedCards[0].ID
	pause := pausedReviewScheduler{entered: make(chan struct{}), release: make(chan struct{})}
	s.scheduler = pause
	reviewDone := make(chan error, 1)
	go func() {
		_, err := s.ReviewCard("owner", cardID, carddto.ReviewCardRequest{Rating: "good"})
		reviewDone <- err
	}()
	<-pause.entered
	deleteDone := make(chan error, 1)
	go func() {
		_, err := s.DeleteCard("owner", cardID, carddto.DeleteCardRequest{ConfirmDeleteHistory: true})
		deleteDone <- err
	}()
	var deleteErr error
	deleteFinished := false
	select {
	case deleteErr = <-deleteDone:
		deleteFinished = true
	case <-time.After(100 * time.Millisecond):
	}
	close(pause.release)
	<-reviewDone
	if !deleteFinished {
		deleteErr = <-deleteDone
	}
	if deleteErr != nil {
		if _, err := s.DeleteCard("owner", cardID, carddto.DeleteCardRequest{ConfirmDeleteHistory: true}); err != nil {
			t.Fatal(err)
		}
	}
	var cards int64
	db.Model(&cardmodel.Card{}).Where("id = ?", cardID).Count(&cards)
	if cards != 0 {
		t.Fatal("confirmed deletion did not complete")
	}
	{
		for _, model := range []any{&cardmodel.CardSchedule{}, &cardmodel.CardReview{}} {
			var count int64
			db.Model(model).Where("card_id = ?", cardID).Count(&count)
			if count != 0 {
				t.Fatalf("delete/review left orphan %T count=%d", model, count)
			}
		}
	}
}
