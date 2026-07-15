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

func TestListCardsSupportsServerSideFiltersAndSchedulePayload(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(&adminmodel.AuditLog{}, &cardmodel.Deck{}, &cardmodel.Card{}, &cardmodel.CardSchedule{}, &cardmodel.CardReview{}); err != nil {
		t.Fatalf("migrate sqlite schema: %v", err)
	}

	repository := cardrepo.NewRepository(db)
	service := NewService(repository, adminrepo.NewAuditLogRepository(db), nil)
	fixedNow := time.Date(2026, 7, 15, 8, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return fixedNow }

	deck := &cardmodel.Deck{
		ID:          "deck-1",
		OwnerUserID: "user-1",
		Title:       "Filterable cards",
		Description: "Deck browser should support server-side filters",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}

	activeGraphCard, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType:   "basic",
		Front:      "Graph node card",
		Back:       "Belongs to graph",
		SourceType: "graph",
		SourceID:   "graph-1",
	})
	if err != nil {
		t.Fatalf("create active card: %v", err)
	}

	suspendedNoteCard, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType:   "basic",
		Front:      "Note summary card",
		Back:       "Belongs to note",
		SourceType: "note",
		SourceID:   "note-1",
	})
	if err != nil {
		t.Fatalf("create suspended card: %v", err)
	}

	buriedDetachedCard, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType: "basic",
		Front:    "Detached fact",
		Back:     "No source linked",
	})
	if err != nil {
		t.Fatalf("create buried card: %v", err)
	}

	if _, err := service.UpdateCardStatus("user-1", suspendedNoteCard.ID, carddto.UpdateCardStatusRequest{Status: "suspended"}); err != nil {
		t.Fatalf("suspend card: %v", err)
	}
	if _, err := service.UpdateCardStatus("user-1", buriedDetachedCard.ID, carddto.UpdateCardStatusRequest{Status: "buried"}); err != nil {
		t.Fatalf("bury card: %v", err)
	}

	activeSchedule, err := repository.FindSchedule(activeGraphCard.ID, "user-1")
	if err != nil {
		t.Fatalf("find active schedule: %v", err)
	}
	activeSchedule.DueAt = fixedNow.Add(-2 * time.Hour)
	activeSchedule.State = "review"
	if err := repository.SaveSchedule(activeSchedule); err != nil {
		t.Fatalf("save active schedule: %v", err)
	}

	suspendedSchedule, err := repository.FindSchedule(suspendedNoteCard.ID, "user-1")
	if err != nil {
		t.Fatalf("find suspended schedule: %v", err)
	}
	suspendedSchedule.DueAt = fixedNow.Add(48 * time.Hour)
	suspendedSchedule.State = "learning"
	if err := repository.SaveSchedule(suspendedSchedule); err != nil {
		t.Fatalf("save suspended schedule: %v", err)
	}

	buriedSchedule, err := repository.FindSchedule(buriedDetachedCard.ID, "user-1")
	if err != nil {
		t.Fatalf("find buried schedule: %v", err)
	}
	buriedSchedule.DueAt = fixedNow.Add(12 * time.Hour)
	buriedSchedule.State = "new"
	if err := repository.SaveSchedule(buriedSchedule); err != nil {
		t.Fatalf("save buried schedule: %v", err)
	}

	filtered, err := service.ListCards("user-1", deck.ID, carddto.ListCardsQuery{
		Query:      "summary",
		Status:     "suspended",
		SourceType: "note",
		DueBucket:  "upcoming",
	})
	if err != nil {
		t.Fatalf("list filtered cards: %v", err)
	}
	if len(filtered) != 1 {
		t.Fatalf("expected one filtered card, got %d", len(filtered))
	}
	if filtered[0].ID != suspendedNoteCard.ID {
		t.Fatalf("expected suspended note card, got %#v", filtered[0].ID)
	}
	if filtered[0].Schedule == nil {
		t.Fatalf("expected filtered card schedule payload to be present")
	}
	if filtered[0].Schedule.State != "learning" {
		t.Fatalf("expected learning schedule state, got %#v", filtered[0].Schedule.State)
	}

	dueCards, err := service.ListCards("user-1", deck.ID, carddto.ListCardsQuery{DueBucket: "due"})
	if err != nil {
		t.Fatalf("list due cards: %v", err)
	}
	if len(dueCards) != 1 || dueCards[0].ID != activeGraphCard.ID {
		t.Fatalf("expected only due active graph card, got %#v", dueCards)
	}
}
