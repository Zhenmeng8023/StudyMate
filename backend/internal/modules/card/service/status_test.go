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

func TestUpdateCardStatusControlsReviewQueueVisibility(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(&adminmodel.AuditLog{}, &cardmodel.Deck{}, &cardmodel.Card{}, &cardmodel.CardSchedule{}, &cardmodel.CardReview{}); err != nil {
		t.Fatalf("migrate sqlite schema: %v", err)
	}

	repository := cardrepo.NewRepository(db)
	service := NewService(repository, adminrepo.NewAuditLogRepository(db), nil)
	fixedNow := time.Date(2026, 7, 15, 7, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return fixedNow }

	deck := &cardmodel.Deck{
		ID:          "deck-1",
		OwnerUserID: "user-1",
		Title:       "Review controls",
		Description: "Suspended cards should leave the active queue",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}

	created, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType: "basic",
		Front:    "What should happen to a suspended card?",
		Back:     "It should leave today's active review queue.",
	})
	if err != nil {
		t.Fatalf("create card: %v", err)
	}

	initialQueue, err := service.TodayQueue("user-1")
	if err != nil {
		t.Fatalf("load initial queue: %v", err)
	}
	if initialQueue.DueCount != 1 || len(initialQueue.Items) != 1 {
		t.Fatalf("expected one active due card, got due=%d items=%d", initialQueue.DueCount, len(initialQueue.Items))
	}

	suspended, err := service.UpdateCardStatus("user-1", created.ID, carddto.UpdateCardStatusRequest{Status: "suspended"})
	if err != nil {
		t.Fatalf("suspend card: %v", err)
	}
	if suspended.Status != "suspended" {
		t.Fatalf("expected suspended status, got %#v", suspended.Status)
	}

	suspendedQueue, err := service.TodayQueue("user-1")
	if err != nil {
		t.Fatalf("load suspended queue: %v", err)
	}
	if suspendedQueue.DueCount != 0 || len(suspendedQueue.Items) != 0 {
		t.Fatalf("expected suspended card to disappear from due queue, got due=%d items=%d", suspendedQueue.DueCount, len(suspendedQueue.Items))
	}

	reactivated, err := service.UpdateCardStatus("user-1", created.ID, carddto.UpdateCardStatusRequest{Status: "active"})
	if err != nil {
		t.Fatalf("reactivate card: %v", err)
	}
	if reactivated.Status != "active" {
		t.Fatalf("expected active status, got %#v", reactivated.Status)
	}

	reactivatedQueue, err := service.TodayQueue("user-1")
	if err != nil {
		t.Fatalf("load reactivated queue: %v", err)
	}
	if reactivatedQueue.DueCount != 1 || len(reactivatedQueue.Items) != 1 {
		t.Fatalf("expected reactivated card to return to due queue, got due=%d items=%d", reactivatedQueue.DueCount, len(reactivatedQueue.Items))
	}
}

func TestBuriedCardLeavesTodayQueueUntilRestored(t *testing.T) {
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
		Title:       "Buried controls",
		Description: "Buried cards should also leave today's queue",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}

	created, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType: "basic",
		Front:    "What does bury do in the prototype?",
		Back:     "It removes the card from today's active queue until restored.",
	})
	if err != nil {
		t.Fatalf("create card: %v", err)
	}

	buried, err := service.UpdateCardStatus("user-1", created.ID, carddto.UpdateCardStatusRequest{Status: "buried"})
	if err != nil {
		t.Fatalf("bury card: %v", err)
	}
	if buried.Status != "buried" {
		t.Fatalf("expected buried status, got %#v", buried.Status)
	}

	buriedQueue, err := service.TodayQueue("user-1")
	if err != nil {
		t.Fatalf("load buried queue: %v", err)
	}
	if buriedQueue.DueCount != 0 || len(buriedQueue.Items) != 0 {
		t.Fatalf("expected buried card to disappear from due queue, got due=%d items=%d", buriedQueue.DueCount, len(buriedQueue.Items))
	}

	restored, err := service.UpdateCardStatus("user-1", created.ID, carddto.UpdateCardStatusRequest{Status: "active"})
	if err != nil {
		t.Fatalf("restore buried card: %v", err)
	}
	if restored.Status != "active" {
		t.Fatalf("expected active status after restore, got %#v", restored.Status)
	}

	restoredQueue, err := service.TodayQueue("user-1")
	if err != nil {
		t.Fatalf("load restored queue: %v", err)
	}
	if restoredQueue.DueCount != 1 || len(restoredQueue.Items) != 1 {
		t.Fatalf("expected restored buried card to return to due queue, got due=%d items=%d", restoredQueue.DueCount, len(restoredQueue.Items))
	}
}

func TestUpdateCardTagsReplacesNormalizedTags(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(&adminmodel.AuditLog{}, &cardmodel.Deck{}, &cardmodel.Card{}, &cardmodel.CardSchedule{}, &cardmodel.CardReview{}); err != nil {
		t.Fatalf("migrate sqlite schema: %v", err)
	}

	repository := cardrepo.NewRepository(db)
	service := NewService(repository, adminrepo.NewAuditLogRepository(db), nil)

	deck := &cardmodel.Deck{
		ID:          "deck-1",
		OwnerUserID: "user-1",
		Title:       "Tag controls",
		Description: "Updated tags should be normalized and persisted",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}

	created, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType: "basic",
		Front:    "What should happen to updated tags?",
		Back:     "They should be normalized and replaced in place.",
		Tags:     []string{"graph"},
	})
	if err != nil {
		t.Fatalf("create card: %v", err)
	}

	updated, err := service.UpdateCardTags("user-1", created.ID, carddto.UpdateCardTagsRequest{
		Tags: []string{" graph ", "core", "graph", ""},
	})
	if err != nil {
		t.Fatalf("update card tags: %v", err)
	}
	if len(updated.Tags) != 2 || updated.Tags[0] != "graph" || updated.Tags[1] != "core" {
		t.Fatalf("expected normalized tags, got %#v", updated.Tags)
	}

	reloaded, err := repository.FindCardByID(created.ID)
	if err != nil {
		t.Fatalf("reload card: %v", err)
	}
	decoded := cardrepo.DecodeTags(reloaded.Tags)
	if len(decoded) != 2 || decoded[0] != "graph" || decoded[1] != "core" {
		t.Fatalf("expected persisted tags to match update, got %#v", decoded)
	}
}
