package service

import (
	"os"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	mysqldriver "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	storage "studymate/backend/internal/migrations/mysql"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	carddto "studymate/backend/internal/modules/card/dto"
	cardmodel "studymate/backend/internal/modules/card/model"
	cardrepo "studymate/backend/internal/modules/card/repository"
)

// Opt-in because SQLite cannot prove MySQL SELECT FOR UPDATE semantics.
// The supplied account needs CREATE/DROP DATABASE; its existing database is never changed.
func TestMySQLCardMutationIsolation(t *testing.T) {
	dsn := os.Getenv("STUDYMATE_MYSQL_TEST_DSN")
	if dsn == "" {
		t.Skip("set STUDYMATE_MYSQL_TEST_DSN for isolated real MySQL verification")
	}
	settings, err := mysqldriver.ParseDSN(dsn)
	if err != nil {
		t.Fatal("invalid integration database configuration")
	}
	settings.DBName = ""
	settings.ParseTime = true
	admin, err := gorm.Open(mysql.Open(settings.FormatDSN()), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatal("cannot connect to integration MySQL")
	}
	adminSQL, err := admin.DB()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = adminSQL.Close() })
	databaseName := "studymate_codex_verify_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	if err := admin.Exec("CREATE DATABASE `" + databaseName + "` CHARACTER SET utf8mb4").Error; err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := admin.Exec("DROP DATABASE `" + databaseName + "`").Error; err != nil {
			t.Errorf("temporary database cleanup failed: %v", err)
		}
	})
	settings.DBName = databaseName
	db, err := gorm.Open(mysql.Open(settings.FormatDSN()), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatal("cannot open isolated integration database")
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = sqlDB.Close() })
	for iteration := 0; iteration < 2; iteration++ {
		if err := storage.Apply(db); err != nil {
			t.Fatalf("migration iteration %d: %v", iteration, err)
		}
	}
	s := NewService(cardrepo.NewRepository(db), adminrepo.NewAuditLogRepository(db), nil)
	owner := uuid.NewString()
	deck, err := s.CreateDeck(owner, carddto.CreateDeckRequest{Title: "Isolated concurrency verification", Visibility: "private"})
	if err != nil {
		t.Fatal(err)
	}
	create := func(t *testing.T) *carddto.CreateCardNoteResultPayload {
		t.Helper()
		note, err := s.CreateCardNote(owner, deck.ID, carddto.CreateCardNoteRequest{NoteTypeCode: "basic", Fields: map[string]string{"front": "Original question", "back": "Original answer"}})
		if err != nil {
			t.Fatal(err)
		}
		return note
	}
	for _, legacy := range []bool{false, true} {
		testName := "concurrent_note_creation_keeps_deck_count"
		if legacy {
			testName = "concurrent_legacy_creation_keeps_deck_count"
		}
		t.Run(testName, func(t *testing.T) {
			concurrentDeck, err := s.CreateDeck(owner, carddto.CreateDeckRequest{Title: "Concurrent note counts", Visibility: "private"})
			if err != nil {
				t.Fatal(err)
			}
			ready := make(chan struct{}, 2)
			release := make(chan struct{})
			var arrivals atomic.Int32
			callback := "test:concurrent-note-deck-read"
			if err := db.Callback().Query().After("gorm:query").Register(callback, func(tx *gorm.DB) {
				if tx.Statement.Table == "decks" && arrivals.Add(1) <= 2 {
					ready <- struct{}{}
					<-release
				}
			}); err != nil {
				t.Fatal(err)
			}
			defer db.Callback().Query().Remove(callback)
			finished := make(chan error, 2)
			for range 2 {
				go func() {
					var err error
					if legacy {
						_, err = s.CreateCard(owner, concurrentDeck.ID, carddto.CreateCardRequest{Front: "Parallel question", Back: "Parallel answer"})
					} else {
						_, err = s.CreateCardNote(owner, concurrentDeck.ID, carddto.CreateCardNoteRequest{NoteTypeCode: "basic", Fields: map[string]string{"front": "Parallel question", "back": "Parallel answer"}})
					}
					finished <- err
				}()
			}
			for range 2 {
				select {
				case <-ready:
				case <-time.After(5 * time.Second):
					close(release)
					t.Fatal("both creators did not finish reading the same deck snapshot")
				}
			}
			close(release)
			for range 2 {
				if err := <-finished; err != nil {
					t.Fatal(err)
				}
			}
			var actual int64
			if err := db.Model(&cardmodel.Card{}).Where("deck_id = ?", concurrentDeck.ID).Count(&actual).Error; err != nil {
				t.Fatal(err)
			}
			var saved cardmodel.Deck
			if err := db.First(&saved, "id = ?", concurrentDeck.ID).Error; err != nil {
				t.Fatal(err)
			}
			if actual != 2 || saved.CardCount != actual {
				t.Fatalf("concurrent creates lost deck count: actual=%d stored=%d", actual, saved.CardCount)
			}
		})
	}
	t.Run("scoring_and_deletion_serialize_without_orphans", func(t *testing.T) {
		note := create(t)
		cardID := note.GeneratedCards[0].ID
		pause := pausedReviewScheduler{entered: make(chan struct{}), release: make(chan struct{})}
		s.scheduler = pause
		reviewDone := make(chan error, 1)
		go func() {
			_, err := s.ReviewCard(owner, cardID, carddto.ReviewCardRequest{Rating: "good"})
			reviewDone <- err
		}()
		<-pause.entered
		deleteDone := make(chan error, 1)
		go func() {
			_, err := s.DeleteCard(owner, cardID, carddto.DeleteCardRequest{ConfirmDeleteHistory: true})
			deleteDone <- err
		}()
		select {
		case err := <-deleteDone:
			close(pause.release)
			<-reviewDone
			t.Fatalf("deletion bypassed an active scoring lock: %v", err)
		case <-time.After(150 * time.Millisecond):
		}
		close(pause.release)
		if err := <-reviewDone; err != nil {
			t.Fatal(err)
		}
		if err := <-deleteDone; err != nil {
			t.Fatal(err)
		}
		for _, model := range []any{&cardmodel.CardSchedule{}, &cardmodel.CardReview{}} {
			var count int64
			if err := db.Model(model).Where("card_id = ?", cardID).Count(&count).Error; err != nil || count != 0 {
				t.Fatalf("orphan %T count=%d error=%v", model, count, err)
			}
		}
		if _, err := s.UpdateCardStatus(owner, cardID, carddto.UpdateCardStatusRequest{Status: "active"}); err == nil {
			t.Fatal("status mutation revived a deleted card")
		}
		s.scheduler = SM2Scheduler{}
	})
	t.Run("regeneration_waits_for_scoring_and_keeps_progress", func(t *testing.T) {
		note := create(t)
		pause := pausedReviewScheduler{entered: make(chan struct{}), release: make(chan struct{})}
		s.scheduler = pause
		reviewDone := make(chan error, 1)
		go func() {
			_, err := s.ReviewCard(owner, note.GeneratedCards[0].ID, carddto.ReviewCardRequest{Rating: "good"})
			reviewDone <- err
		}()
		<-pause.entered
		type result struct {
			note *carddto.ManagedCardNotePayload
			err  error
		}
		updateDone := make(chan result, 1)
		go func() {
			updated, err := s.UpdateCardNote(owner, note.CardNote.ID, carddto.UpdateCardNoteRequest{Fields: map[string]string{"front": "Changed question", "back": "Changed answer"}})
			updateDone <- result{updated, err}
		}()
		select {
		case <-updateDone:
			close(pause.release)
			<-reviewDone
			t.Fatal("regeneration bypassed an active scoring lock")
		case <-time.After(150 * time.Millisecond):
		}
		close(pause.release)
		if err := <-reviewDone; err != nil {
			t.Fatal(err)
		}
		updated := <-updateDone
		if updated.err != nil {
			t.Fatal(updated.err)
		}
		card := updated.note.GeneratedCards[0]
		if card.Front != "Original question" || card.Schedule.State == "new" || updated.note.Regeneration.PreservedCount != 1 {
			t.Fatal("regeneration overwrote a concurrently scored card")
		}
		s.scheduler = SM2Scheduler{}
	})
	t.Run("schedule_failure_rolls_back_review_log", func(t *testing.T) {
		note := create(t)
		if err := db.Exec("CREATE TRIGGER reject_verification_schedule BEFORE UPDATE ON card_schedules FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='verification rollback'").Error; err != nil {
			t.Fatal(err)
		}
		t.Cleanup(func() { db.Exec("DROP TRIGGER IF EXISTS reject_verification_schedule") })
		cardID := note.GeneratedCards[0].ID
		if _, err := s.ReviewCard(owner, cardID, carddto.ReviewCardRequest{Rating: "good"}); err == nil {
			t.Fatal("expected injected schedule failure")
		}
		var count int64
		if err := db.Model(&cardmodel.CardReview{}).Where("card_id = ?", cardID).Count(&count).Error; err != nil || count != 0 {
			t.Fatalf("review was not rolled back: %d, %v", count, err)
		}
	})
}
