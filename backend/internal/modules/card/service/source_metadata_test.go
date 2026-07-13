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

func TestCreateCardAndTodayQueuePreserveSourceMetadata(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(&adminmodel.AuditLog{}, &cardmodel.Deck{}, &cardmodel.Card{}, &cardmodel.CardSchedule{}, &cardmodel.CardReview{}); err != nil {
		t.Fatalf("migrate sqlite schema: %v", err)
	}

	repository := cardrepo.NewRepository(db)
	service := NewService(repository, adminrepo.NewAuditLogRepository(db), nil)
	fixedNow := time.Date(2026, 7, 14, 9, 30, 0, 0, time.UTC)
	service.now = func() time.Time { return fixedNow }

	deck := &cardmodel.Deck{
		ID:          "deck-1",
		OwnerUserID: "user-1",
		Title:       "Reader backlinks",
		Description: "Review cards should return to annotation context",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}

	created, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType:   "basic",
		Front:      "What does this annotation emphasize?",
		Back:       "It highlights the invariant in the proof.",
		SourceType: "annotation",
		SourceID:   "annotation-1",
		SourceMetadata: map[string]any{
			"materialId":   "material-1",
			"annotationId": "annotation-1",
			"page":         12,
		},
	})
	if err != nil {
		t.Fatalf("create card: %v", err)
	}

	if created.SourceMetadata == nil || created.SourceMetadata["materialId"] != "material-1" {
		t.Fatalf("expected created card metadata, got %#v", created.SourceMetadata)
	}

	queue, err := service.TodayQueue("user-1")
	if err != nil {
		t.Fatalf("load today queue: %v", err)
	}
	if queue.DueCount != 1 || len(queue.Items) != 1 {
		t.Fatalf("expected one due review item, got due=%d items=%d", queue.DueCount, len(queue.Items))
	}

	item := queue.Items[0]
	if item.Card.SourceMetadata == nil {
		t.Fatalf("expected review queue card metadata to be present")
	}
	if item.Card.SourceMetadata["materialId"] != "material-1" || item.Card.SourceMetadata["annotationId"] != "annotation-1" {
		t.Fatalf("expected review queue metadata to preserve source context, got %#v", item.Card.SourceMetadata)
	}
	page, ok := item.Card.SourceMetadata["page"].(float64)
	if !ok || page != 12 {
		t.Fatalf("expected page 12 in review queue metadata, got %#v", item.Card.SourceMetadata["page"])
	}
}
