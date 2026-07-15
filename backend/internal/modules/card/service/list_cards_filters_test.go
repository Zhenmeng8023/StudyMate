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

	secondGraphCard, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType:   "basic",
		Front:      "Another graph node card",
		Back:       "Belongs to another graph source",
		SourceType: "graph",
		SourceID:   "graph-2",
		Tags:       []string{"graph", "advanced"},
	})
	if err != nil {
		t.Fatalf("create second graph card: %v", err)
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

	secondGraphSchedule, err := repository.FindSchedule(secondGraphCard.ID, "user-1")
	if err != nil {
		t.Fatalf("find second graph schedule: %v", err)
	}
	secondGraphSchedule.DueAt = fixedNow.Add(6 * time.Hour)
	secondGraphSchedule.State = "review"
	if err := repository.SaveSchedule(secondGraphSchedule); err != nil {
		t.Fatalf("save second graph schedule: %v", err)
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
	if len(tagFiltered) != 2 {
		t.Fatalf("expected both graph-tagged cards, got %#v", tagFiltered)
	}
	if tagFiltered[0].ID != secondGraphCard.ID && tagFiltered[1].ID != secondGraphCard.ID {
		t.Fatalf("expected graph-2 card in tag-filtered results, got %#v", tagFiltered)
	}

	sourceFiltered, err := service.ListCards("user-1", deck.ID, carddto.ListCardsQuery{
		SourceType: "graph",
		SourceID:   "graph-1",
	})
	if err != nil {
		t.Fatalf("list source filtered cards: %v", err)
	}
	if len(sourceFiltered) != 1 || sourceFiltered[0].ID != activeGraphCard.ID {
		t.Fatalf("expected only graph-1 card, got %#v", sourceFiltered)
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
		SourceType: "graph",
		SourceID:   "node-2",
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
	if len(feedback.WeakSources) != 2 {
		t.Fatalf("expected two weak source summaries, got %d", len(feedback.WeakSources))
	}
	if feedback.WeakSources[0].SourceType != "graph" || feedback.WeakSources[0].SourceID != "node-1" {
		t.Fatalf("expected graph source summary first, got %#v", feedback.WeakSources[0])
	}
	if feedback.WeakSources[0].WeakCardCount != 1 || feedback.WeakSources[0].DueCount != 1 || feedback.WeakSources[0].LearningCount != 1 || feedback.WeakSources[0].MaxLapseCount != 2 {
		t.Fatalf("unexpected graph source summary counts: %#v", feedback.WeakSources[0])
	}
	if len(feedback.WeakSources[0].SampleCardFronts) != 1 || feedback.WeakSources[0].SampleCardFronts[0] != "Graph concept card" {
		t.Fatalf("unexpected graph source summary samples: %#v", feedback.WeakSources[0])
	}
	if feedback.WeakSources[1].SourceType != "note" || feedback.WeakSources[1].SourceID != "note-1" {
		t.Fatalf("expected note source summary second, got %#v", feedback.WeakSources[1])
	}
	if len(feedback.SourceSummaries) != 3 {
		t.Fatalf("expected three source summaries, got %d", len(feedback.SourceSummaries))
	}
	if feedback.SourceSummaries[0].SourceType != "graph" || feedback.SourceSummaries[0].SourceID != "node-1" {
		t.Fatalf("expected first source summary to remain graph weak source, got %#v", feedback.SourceSummaries[0])
	}
	if feedback.SourceSummaries[0].MasteryLevel != "weak" || feedback.SourceSummaries[0].MasteryScore != 0 {
		t.Fatalf("expected weak graph source mastery metadata, got %#v", feedback.SourceSummaries[0])
	}
	stableSource := feedback.SourceSummaries[2]
	if stableSource.SourceType != "graph" || stableSource.SourceID != "node-2" {
		t.Fatalf("expected stable graph source summary, got %#v", stableSource)
	}
	if stableSource.TotalCardCount != 1 || stableSource.MasteredCardCount != 1 || stableSource.ReviewCardCount != 1 {
		t.Fatalf("expected stable source card counts, got %#v", stableSource)
	}
	if stableSource.WeakCardCount != 0 || stableSource.LearningCount != 0 || stableSource.DueCount != 0 {
		t.Fatalf("expected stable source to have no weak counts, got %#v", stableSource)
	}
	if stableSource.MasteryLevel != "solid" || stableSource.MasteryScore != 100 {
		t.Fatalf("expected stable source mastery to be solid 100, got %#v", stableSource)
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

func TestImportDeckPreviewReportsDuplicatesAndFailures(t *testing.T) {
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
		Title:       "Previewable deck",
		Description: "Duplicate checks",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}

	if _, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType: "basic",
		Front:    "Existing front",
		Back:     "Existing back",
	}); err != nil {
		t.Fatalf("seed existing card: %v", err)
	}

	request := carddto.ImportDeckRequest{
		Filename:    "cards.json",
		PreviewOnly: true,
		Content: `{"app":"StudyMate","kind":"deck-cards","cards":[
			{"front":"Existing front","back":"Existing back","cardType":"basic"},
			{"front":"Fresh front","back":"Fresh back","cardType":"basic"},
			{"front":"Broken front","back":"","cardType":"basic"},
			{"front":"Fresh front","back":"Fresh back","cardType":"basic"}
		]}`,
	}

	preview, err := service.ImportDeck("user-1", deck.ID, request)
	if err != nil {
		t.Fatalf("preview deck import: %v", err)
	}
	if !preview.Preview || preview.TotalCount != 4 || preview.ReadyCount != 1 || preview.ImportedCount != 0 {
		t.Fatalf("unexpected preview summary: %#v", preview)
	}
	if preview.DuplicateCount != 2 || preview.FailedCount != 1 {
		t.Fatalf("expected 2 duplicates and 1 failure, got %#v", preview)
	}
	if len(preview.DuplicateSamples) != 2 || preview.DuplicateSamples[0].RowNumber != 1 || preview.DuplicateSamples[1].RowNumber != 4 {
		t.Fatalf("unexpected duplicate samples: %#v", preview.DuplicateSamples)
	}
	if len(preview.FailureSamples) != 1 || preview.FailureSamples[0].RowNumber != 3 {
		t.Fatalf("unexpected failure samples: %#v", preview.FailureSamples)
	}

	cardsAfterPreview, err := service.ListCards("user-1", deck.ID, carddto.ListCardsQuery{})
	if err != nil {
		t.Fatalf("list cards after preview: %v", err)
	}
	if len(cardsAfterPreview) != 1 {
		t.Fatalf("preview should not create cards, got %d", len(cardsAfterPreview))
	}

	request.PreviewOnly = false
	imported, err := service.ImportDeck("user-1", deck.ID, request)
	if err != nil {
		t.Fatalf("import deck after preview: %v", err)
	}
	if imported.Preview || imported.ImportedCount != 1 || imported.ReadyCount != 1 {
		t.Fatalf("unexpected import summary: %#v", imported)
	}
	if imported.DuplicateCount != 2 || imported.FailedCount != 1 {
		t.Fatalf("expected skip summary to survive import, got %#v", imported)
	}

	cardsAfterImport, err := service.ListCards("user-1", deck.ID, carddto.ListCardsQuery{})
	if err != nil {
		t.Fatalf("list cards after import: %v", err)
	}
	if len(cardsAfterImport) != 2 {
		t.Fatalf("expected 2 cards after import, got %d", len(cardsAfterImport))
	}
}
