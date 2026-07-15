package service

import (
	"strings"
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
		Tags:       []string{"graph", "core"},
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
		Tags:       []string{"note", "summary"},
	})
	if err != nil {
		t.Fatalf("create suspended card: %v", err)
	}

	buriedDetachedCard, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType: "basic",
		Front:    "Detached fact",
		Back:     "No source linked",
		Tags:     []string{"fact"},
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
	if len(filtered[0].Tags) != 2 || filtered[0].Tags[0] != "note" {
		t.Fatalf("expected card tags to be preserved, got %#v", filtered[0].Tags)
	}

	dueCards, err := service.ListCards("user-1", deck.ID, carddto.ListCardsQuery{DueBucket: "due"})
	if err != nil {
		t.Fatalf("list due cards: %v", err)
	}
	if len(dueCards) != 1 || dueCards[0].ID != activeGraphCard.ID {
		t.Fatalf("expected only due active graph card, got %#v", dueCards)
	}

	tagFiltered, err := service.ListCards("user-1", deck.ID, carddto.ListCardsQuery{Tag: "graph"})
	if err != nil {
		t.Fatalf("list tag filtered cards: %v", err)
	}
	if len(tagFiltered) != 1 || tagFiltered[0].ID != activeGraphCard.ID {
		t.Fatalf("expected only graph-tagged card, got %#v", tagFiltered)
	}
}

func TestReviewFeedbackSummarizesWeakCardsAndLearningCounts(t *testing.T) {
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
		Title:       "Feedback deck",
		Description: "Dashboard feedback should show weak cards",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}

	relearningCard, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType:   "basic",
		Front:      "Graph concept card",
		Back:       "Needs relearning",
		SourceType: "graph",
		SourceID:   "node-1",
	})
	if err != nil {
		t.Fatalf("create relearning card: %v", err)
	}

	learningCard, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType:   "basic",
		Front:      "Note concept card",
		Back:       "Still learning",
		SourceType: "note",
		SourceID:   "note-1",
	})
	if err != nil {
		t.Fatalf("create learning card: %v", err)
	}

	stableCard, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType: "basic",
		Front:    "Stable review card",
		Back:     "Already remembered",
	})
	if err != nil {
		t.Fatalf("create stable card: %v", err)
	}

	relearningSchedule, err := repository.FindSchedule(relearningCard.ID, "user-1")
	if err != nil {
		t.Fatalf("find relearning schedule: %v", err)
	}
	relearningSchedule.DueAt = fixedNow.Add(-1 * time.Hour)
	relearningSchedule.State = "relearning"
	relearningSchedule.LapseCount = 2
	relearningSchedule.RepetitionCount = 1
	if err := repository.SaveSchedule(relearningSchedule); err != nil {
		t.Fatalf("save relearning schedule: %v", err)
	}

	learningSchedule, err := repository.FindSchedule(learningCard.ID, "user-1")
	if err != nil {
		t.Fatalf("find learning schedule: %v", err)
	}
	learningSchedule.DueAt = fixedNow.Add(12 * time.Hour)
	learningSchedule.State = "learning"
	learningSchedule.LapseCount = 0
	learningSchedule.RepetitionCount = 0
	if err := repository.SaveSchedule(learningSchedule); err != nil {
		t.Fatalf("save learning schedule: %v", err)
	}

	stableSchedule, err := repository.FindSchedule(stableCard.ID, "user-1")
	if err != nil {
		t.Fatalf("find stable schedule: %v", err)
	}
	stableSchedule.DueAt = fixedNow.Add(24 * time.Hour)
	stableSchedule.State = "review"
	stableSchedule.LapseCount = 0
	stableSchedule.RepetitionCount = 4
	if err := repository.SaveSchedule(stableSchedule); err != nil {
		t.Fatalf("save stable schedule: %v", err)
	}

	feedback, err := service.ReviewFeedback("user-1")
	if err != nil {
		t.Fatalf("review feedback: %v", err)
	}
	if feedback.DueCount != 1 {
		t.Fatalf("expected due count 1, got %d", feedback.DueCount)
	}
	if feedback.LearningCount != 2 {
		t.Fatalf("expected learning count 2, got %d", feedback.LearningCount)
	}
	if feedback.WeakCardCount != 2 {
		t.Fatalf("expected weak card count 2, got %d", feedback.WeakCardCount)
	}
	if len(feedback.WeakCards) != 2 {
		t.Fatalf("expected two weak cards, got %d", len(feedback.WeakCards))
	}
	if feedback.WeakCards[0].CardID != relearningCard.ID || feedback.WeakCards[0].LapseCount != 2 || feedback.WeakCards[0].DeckTitle != "Feedback deck" {
		t.Fatalf("expected relearning card first, got %#v", feedback.WeakCards[0])
	}
	if feedback.WeakCards[1].CardID != learningCard.ID || feedback.WeakCards[1].State != "learning" {
		t.Fatalf("expected learning card second, got %#v", feedback.WeakCards[1])
	}
}

func TestExportDeckBuildsPortableJsonAndCsvArtifacts(t *testing.T) {
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
		Title:       "Portable deck",
		Description: "Exportable cards",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}

	if _, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType:       "basic",
		Front:          "Graph concept",
		Back:           "Linked to a graph node",
		Tags:           []string{"graph", "core"},
		SourceType:     "graph",
		SourceID:       "node-1",
		SourceMetadata: map[string]any{"page": 3},
	}); err != nil {
		t.Fatalf("create card: %v", err)
	}

	jsonArtifact, err := service.ExportDeck("user-1", deck.ID, "json")
	if err != nil {
		t.Fatalf("export json deck: %v", err)
	}
	if jsonArtifact.Format != "json" || jsonArtifact.CardCount != 1 {
		t.Fatalf("unexpected json artifact summary: %#v", jsonArtifact)
	}
	if jsonArtifact.Filename == "" || jsonArtifact.MimeType == "" || jsonArtifact.Content == "" {
		t.Fatalf("expected json artifact content to be populated: %#v", jsonArtifact)
	}
	if want := "\"sourceType\": \"graph\""; !strings.Contains(jsonArtifact.Content, want) {
		t.Fatalf("expected json artifact to contain %q, got %s", want, jsonArtifact.Content)
	}

	csvArtifact, err := service.ExportDeck("user-1", deck.ID, "csv")
	if err != nil {
		t.Fatalf("export csv deck: %v", err)
	}
	if csvArtifact.Format != "csv" || csvArtifact.CardCount != 1 {
		t.Fatalf("unexpected csv artifact summary: %#v", csvArtifact)
	}
	if want := "front,back,cardType,tags,sourceType,sourceId"; !strings.Contains(csvArtifact.Content, want) {
		t.Fatalf("expected csv header %q, got %s", want, csvArtifact.Content)
	}
	if want := "Graph concept"; !strings.Contains(csvArtifact.Content, want) {
		t.Fatalf("expected csv content to contain %q, got %s", want, csvArtifact.Content)
	}
}

func TestImportDeckParsesPortableJsonAndCsvContent(t *testing.T) {
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
		Title:       "Importable deck",
		Description: "Portable imports",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}

	jsonResult, err := service.ImportDeck("user-1", deck.ID, carddto.ImportDeckRequest{
		Filename: "cards.json",
		Content:  `{"app":"StudyMate","kind":"deck-cards","cards":[{"front":"JSON card","back":"JSON answer","cardType":"basic","tags":["graph","imported"],"sourceType":"graph","sourceId":"node-2"}]}`,
	})
	if err != nil {
		t.Fatalf("import json deck: %v", err)
	}
	if jsonResult.ImportedCount != 1 {
		t.Fatalf("expected 1 imported json card, got %#v", jsonResult)
	}

	csvResult, err := service.ImportDeck("user-1", deck.ID, carddto.ImportDeckRequest{
		Filename: "cards.csv",
		Content:  "front,back,cardType,tags,sourceType,sourceId\nCSV card,CSV answer,basic,reader|imported,reader,annotation-1",
	})
	if err != nil {
		t.Fatalf("import csv deck: %v", err)
	}
	if csvResult.ImportedCount != 1 {
		t.Fatalf("expected 1 imported csv card, got %#v", csvResult)
	}

	cards, err := service.ListCards("user-1", deck.ID, carddto.ListCardsQuery{})
	if err != nil {
		t.Fatalf("list imported cards: %v", err)
	}
	if len(cards) != 2 {
		t.Fatalf("expected 2 imported cards, got %d", len(cards))
	}
	if cards[0].Front != "CSV card" && cards[1].Front != "CSV card" {
		t.Fatalf("expected one imported csv card in %#v", cards)
	}
	if cards[0].Front != "JSON card" && cards[1].Front != "JSON card" {
		t.Fatalf("expected one imported json card in %#v", cards)
	}
}
