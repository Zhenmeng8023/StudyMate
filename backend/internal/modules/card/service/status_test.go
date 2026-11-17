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
	if initialQueue.NewCount != 1 || initialQueue.LearningCount != 0 || initialQueue.ReviewCount != 0 || initialQueue.RelearningCount != 0 {
		t.Fatalf("expected queue state counts to classify new cards, got %#v", initialQueue)
	}
	if initialQueue.NewLimit <= 0 || initialQueue.ReviewLimit <= 0 {
		t.Fatalf("expected queue limits to be exposed, got %#v", initialQueue)
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

func TestTodayQueueSeparatesFormalQueueStatesAndAppliesDefaultLimits(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(&adminmodel.AuditLog{}, &cardmodel.Deck{}, &cardmodel.Card{}, &cardmodel.CardSchedule{}, &cardmodel.CardReview{}); err != nil {
		t.Fatalf("migrate sqlite schema: %v", err)
	}

	repository := cardrepo.NewRepository(db)
	service := NewService(repository, adminrepo.NewAuditLogRepository(db), nil)
	fixedNow := time.Date(2026, 7, 17, 9, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return fixedNow }

	deck := &cardmodel.Deck{
		ID:          "deck-1",
		OwnerUserID: "user-1",
		Title:       "Formal queue states",
		Description: "Today queue should expose Anki-style state buckets",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}

	type seedCard struct {
		id       string
		front    string
		status   string
		state    string
		dueAt    time.Time
		step     int
		interval int
	}

	cards := []seedCard{
		{id: "card-learning", front: "Learning", status: "active", state: "learning", dueAt: fixedNow.Add(-5 * time.Minute), step: 1},
		{id: "card-relearning", front: "Relearning", status: "active", state: "relearning", dueAt: fixedNow.Add(-5 * time.Minute), step: 0, interval: 6},
		{id: "card-review", front: "Review", status: "active", state: "review", dueAt: fixedNow.Add(-2 * time.Hour), interval: 4},
		{id: "card-new", front: "New", status: "active", state: "new", dueAt: fixedNow.Add(-1 * time.Minute)},
		{id: "card-suspended", front: "Suspended", status: "suspended", state: "review", dueAt: fixedNow.Add(-1 * time.Minute), interval: 2},
		{id: "card-buried", front: "Buried", status: "buried", state: "new", dueAt: fixedNow.Add(-1 * time.Minute)},
	}

	for _, seeded := range cards {
		card := &cardmodel.Card{
			ID:          seeded.id,
			DeckID:      deck.ID,
			OwnerUserID: "user-1",
			CardType:    "basic",
			Front:       seeded.front,
			Back:        seeded.front + " back",
			Status:      seeded.status,
			CreatedAt:   fixedNow,
			UpdatedAt:   fixedNow,
		}
		if err := repository.CreateCard(card); err != nil {
			t.Fatalf("create seeded card %s: %v", seeded.id, err)
		}

		schedule := &cardmodel.CardSchedule{
			CardID:          card.ID,
			UserID:          "user-1",
			DueAt:           seeded.dueAt,
			IntervalDays:    seeded.interval,
			EaseFactor:      2.5,
			RepetitionCount: 1,
			LapseCount:      0,
			State:           seeded.state,
			LearningStep:    seeded.step,
			UpdatedAt:       fixedNow,
		}
		if err := repository.SaveSchedule(schedule); err != nil {
			t.Fatalf("save seeded schedule %s: %v", seeded.id, err)
		}
	}

	queue, err := service.TodayQueue("user-1")
	if err != nil {
		t.Fatalf("load today queue: %v", err)
	}

	if queue.DueCount != 4 {
		t.Fatalf("expected queue to include 4 active cards after limits, got %d", queue.DueCount)
	}
	if queue.NewCount != 1 || queue.LearningCount != 1 || queue.ReviewCount != 1 || queue.RelearningCount != 1 {
		t.Fatalf("expected one card in each active queue bucket, got %#v", queue)
	}
	if len(queue.Items) != 4 {
		t.Fatalf("expected 4 queued items, got %d", len(queue.Items))
	}
	if queue.Items[0].Schedule.State != "learning" || queue.Items[1].Schedule.State != "relearning" || queue.Items[2].Schedule.State != "review" || queue.Items[3].Schedule.State != "new" {
		t.Fatalf("expected learning -> relearning -> review -> new queue order, got %#v", queue.Items)
	}
}

func TestTodayQueueDueCountTracksActionableCardsBeyondPreviewWindow(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(&adminmodel.AuditLog{}, &cardmodel.Deck{}, &cardmodel.Card{}, &cardmodel.CardSchedule{}, &cardmodel.CardReview{}); err != nil {
		t.Fatalf("migrate sqlite schema: %v", err)
	}

	repository := cardrepo.NewRepository(db)
	service := NewService(repository, adminrepo.NewAuditLogRepository(db), nil)
	fixedNow := time.Date(2026, 7, 17, 9, 30, 0, 0, time.UTC)
	service.now = func() time.Time { return fixedNow }

	deck := &cardmodel.Deck{
		ID:          "deck-1",
		OwnerUserID: "user-1",
		Title:       "Preview limits",
		Description: "Due count should reflect the actionable queue even when preview items are capped",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}

	for index := 0; index < 25; index++ {
		card := &cardmodel.Card{
			ID:          "card-learning-" + string(rune('a'+index)),
			DeckID:      deck.ID,
			OwnerUserID: "user-1",
			CardType:    "basic",
			Front:       "Learning card",
			Back:        "Back",
			Status:      "active",
			CreatedAt:   fixedNow,
			UpdatedAt:   fixedNow,
		}
		if err := repository.CreateCard(card); err != nil {
			t.Fatalf("create learning card %d: %v", index, err)
		}
		if err := repository.SaveSchedule(&cardmodel.CardSchedule{
			CardID:          card.ID,
			UserID:          "user-1",
			DueAt:           fixedNow.Add(-time.Minute),
			IntervalDays:    0,
			EaseFactor:      2.5,
			RepetitionCount: 1,
			LapseCount:      0,
			State:           "learning",
			LearningStep:    0,
			UpdatedAt:       fixedNow,
		}); err != nil {
			t.Fatalf("save learning schedule %d: %v", index, err)
		}
	}

	for index := 0; index < 30; index++ {
		card := &cardmodel.Card{
			ID:          "card-review-" + string(rune('a'+index)),
			DeckID:      deck.ID,
			OwnerUserID: "user-1",
			CardType:    "basic",
			Front:       "Review card",
			Back:        "Back",
			Status:      "active",
			CreatedAt:   fixedNow,
			UpdatedAt:   fixedNow,
		}
		if err := repository.CreateCard(card); err != nil {
			t.Fatalf("create review card %d: %v", index, err)
		}
		if err := repository.SaveSchedule(&cardmodel.CardSchedule{
			CardID:          card.ID,
			UserID:          "user-1",
			DueAt:           fixedNow.Add(-2 * time.Minute),
			IntervalDays:    3,
			EaseFactor:      2.5,
			RepetitionCount: 2,
			LapseCount:      0,
			State:           "review",
			LearningStep:    0,
			UpdatedAt:       fixedNow,
		}); err != nil {
			t.Fatalf("save review schedule %d: %v", index, err)
		}
	}

	queue, err := service.TodayQueue("user-1")
	if err != nil {
		t.Fatalf("load today queue: %v", err)
	}

	if queue.DueCount != 55 {
		t.Fatalf("expected actionable due count to include all 25 learning and 30 review cards, got %d", queue.DueCount)
	}
	if queue.LearningCount != 25 || queue.ReviewCount != 30 {
		t.Fatalf("expected queue bucket counts to report the full due set, got %#v", queue)
	}
	if len(queue.Items) != 40 {
		t.Fatalf("expected preview list to stay capped at 40 items, got %d", len(queue.Items))
	}
	for index := 0; index < 25; index++ {
		if queue.Items[index].Schedule.State != "learning" {
			t.Fatalf("expected learning cards to stay ahead of review cards in the preview list, got %#v", queue.Items[index].Schedule.State)
		}
	}
	for index := 25; index < len(queue.Items); index++ {
		if queue.Items[index].Schedule.State != "review" {
			t.Fatalf("expected review cards to fill the remaining preview slots, got %#v", queue.Items[index].Schedule.State)
		}
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
