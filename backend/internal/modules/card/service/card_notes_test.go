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

func TestCreateCardNoteGeneratesBasicReverseCardsAndKeepsLegacyFields(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(
		&adminmodel.AuditLog{},
		&cardmodel.Deck{},
		&cardmodel.Card{},
		&cardmodel.CardSchedule{},
		&cardmodel.CardReview{},
		&cardmodel.CardNote{},
		&cardmodel.NoteType{},
		&cardmodel.CardTemplate{},
	); err != nil {
		t.Fatalf("migrate sqlite schema: %v", err)
	}

	repository := cardrepo.NewRepository(db)
	service := NewService(repository, adminrepo.NewAuditLogRepository(db), nil)
	fixedNow := time.Date(2026, 7, 17, 9, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return fixedNow }

	deck := &cardmodel.Deck{
		ID:          "deck-1",
		OwnerUserID: "user-1",
		Title:       "Anki migration",
		Description: "reader note generation",
		Visibility:  "private",
		CardCount:   0,
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}
	if err := repository.CreateNoteType(&cardmodel.NoteType{
		ID:              "note-type-basic-reverse",
		Code:            "basic_reverse",
		Name:            "Basic Reverse",
		Kind:            "basic_reverse",
		IsBuiltin:       true,
		Status:          "active",
		TemplateCount:   2,
		FieldSchemaJSON: `[{"name":"front","required":true},{"name":"back","required":true}]`,
		CreatedAt:       fixedNow,
		UpdatedAt:       fixedNow,
	}); err != nil {
		t.Fatalf("create note type: %v", err)
	}
	if err := repository.CreateCardTemplate(&cardmodel.CardTemplate{
		ID:           "tmpl-basic-rev-0",
		NoteTypeID:   "note-type-basic-reverse",
		TemplateKey:  "basic-reverse-0",
		Name:         "Forward",
		TemplateKind: "basic",
		Ordinal:      0,
		IsActive:     true,
		FrontFormat:  "{{front}}",
		BackFormat:   "{{back}}",
		CreatedAt:    fixedNow,
		UpdatedAt:    fixedNow,
	}); err != nil {
		t.Fatalf("create forward template: %v", err)
	}
	if err := repository.CreateCardTemplate(&cardmodel.CardTemplate{
		ID:           "tmpl-basic-rev-1",
		NoteTypeID:   "note-type-basic-reverse",
		TemplateKey:  "basic-reverse-1",
		Name:         "Reverse",
		TemplateKind: "basic",
		Ordinal:      1,
		IsActive:     true,
		FrontFormat:  "{{back}}",
		BackFormat:   "{{front}}",
		CreatedAt:    fixedNow,
		UpdatedAt:    fixedNow,
	}); err != nil {
		t.Fatalf("create reverse template: %v", err)
	}

	result, err := service.CreateCardNote("user-1", deck.ID, carddto.CreateCardNoteRequest{
		NoteTypeCode: "basic_reverse",
		Fields: map[string]string{
			"front": "什么是二分查找？",
			"back":  "一种每次把搜索空间减半的查找算法。",
		},
		SourceLinks: []carddto.SourceLinkPayload{{
			SourceType: "annotation",
			SourceID:   "annotation-1",
			Title:      "算法导论",
			Excerpt:    "二分查找在有序数组中工作",
			Locator: map[string]any{
				"materialId":   "material-1",
				"annotationId": "annotation-1",
				"page":         18,
			},
		}},
	})
	if err != nil {
		t.Fatalf("create card note: %v", err)
	}

	if result.CardNote.NoteTypeCode != "basic_reverse" {
		t.Fatalf("expected basic_reverse note type, got %#v", result.CardNote)
	}
	if result.CardNote.NoteTypeID != "note-type-basic-reverse" {
		t.Fatalf("expected persisted noteTypeId, got %#v", result.CardNote)
	}
	if result.CardNote.GeneratedCardCount != 2 {
		t.Fatalf("expected generated count 2, got %#v", result.CardNote)
	}
	if result.CardNote.PrimarySourceLink == nil || result.CardNote.PrimarySourceLink.SourceType != "annotation" {
		t.Fatalf("expected annotation source link, got %#v", result.CardNote.PrimarySourceLink)
	}
	if len(result.GeneratedCards) != 2 {
		t.Fatalf("expected 2 generated cards, got %d", len(result.GeneratedCards))
	}
	if result.GeneratedCards[0].Front != "什么是二分查找？" || result.GeneratedCards[0].Back != "一种每次把搜索空间减半的查找算法。" {
		t.Fatalf("unexpected first generated card: %#v", result.GeneratedCards[0])
	}
	if result.GeneratedCards[1].Front != "一种每次把搜索空间减半的查找算法。" || result.GeneratedCards[1].Back != "什么是二分查找？" {
		t.Fatalf("unexpected reverse generated card: %#v", result.GeneratedCards[1])
	}
	for _, card := range result.GeneratedCards {
		if card.CardNoteID == "" || card.TemplateID == "" {
			t.Fatalf("expected generated card to include card note/template identifiers, got %#v", card)
		}
		if card.SourceType != "annotation" || card.SourceID != "annotation-1" {
			t.Fatalf("expected legacy source fields to remain populated, got %#v", card)
		}
		if card.Schedule == nil || card.Schedule.State != "new" {
			t.Fatalf("expected generated card schedule to be initialized, got %#v", card.Schedule)
		}
	}
}

func TestCreateCardNoteSupportsTemplateKeySubset(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(
		&adminmodel.AuditLog{},
		&cardmodel.Deck{},
		&cardmodel.Card{},
		&cardmodel.CardSchedule{},
		&cardmodel.CardReview{},
		&cardmodel.CardNote{},
		&cardmodel.NoteType{},
		&cardmodel.CardTemplate{},
	); err != nil {
		t.Fatalf("migrate sqlite schema: %v", err)
	}

	repository := cardrepo.NewRepository(db)
	service := NewService(repository, adminrepo.NewAuditLogRepository(db), nil)
	fixedNow := time.Date(2026, 7, 17, 9, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return fixedNow }

	if err := repository.CreateDeck(&cardmodel.Deck{
		ID:          "deck-1",
		OwnerUserID: "user-1",
		Title:       "Subset",
		Description: "subset templates",
		Visibility:  "private",
	}); err != nil {
		t.Fatalf("create deck: %v", err)
	}
	if err := repository.CreateNoteType(&cardmodel.NoteType{
		ID:              "note-type-basic-reverse",
		Code:            "basic_reverse",
		Name:            "Basic Reverse",
		Kind:            "basic_reverse",
		IsBuiltin:       true,
		Status:          "active",
		TemplateCount:   2,
		FieldSchemaJSON: `[{"name":"front","required":true},{"name":"back","required":true}]`,
		CreatedAt:       fixedNow,
		UpdatedAt:       fixedNow,
	}); err != nil {
		t.Fatalf("create note type: %v", err)
	}
	for _, template := range []cardmodel.CardTemplate{
		{
			ID:           "tmpl-basic-rev-0",
			NoteTypeID:   "note-type-basic-reverse",
			TemplateKey:  "basic-reverse-0",
			Name:         "Forward",
			TemplateKind: "basic",
			Ordinal:      0,
			IsActive:     true,
			FrontFormat:  "{{front}}",
			BackFormat:   "{{back}}",
			CreatedAt:    fixedNow,
			UpdatedAt:    fixedNow,
		},
		{
			ID:           "tmpl-basic-rev-1",
			NoteTypeID:   "note-type-basic-reverse",
			TemplateKey:  "basic-reverse-1",
			Name:         "Reverse",
			TemplateKind: "basic",
			Ordinal:      1,
			IsActive:     true,
			FrontFormat:  "{{back}}",
			BackFormat:   "{{front}}",
			CreatedAt:    fixedNow,
			UpdatedAt:    fixedNow,
		},
	} {
		template := template
		if err := repository.CreateCardTemplate(&template); err != nil {
			t.Fatalf("create template %s: %v", template.TemplateKey, err)
		}
	}

	result, err := service.CreateCardNote("user-1", "deck-1", carddto.CreateCardNoteRequest{
		NoteTypeCode: "basic_reverse",
		TemplateKeys: []string{"basic-reverse-1"},
		Fields: map[string]string{
			"front": "Question",
			"back":  "Answer",
		},
	})
	if err != nil {
		t.Fatalf("create card note: %v", err)
	}

	if len(result.GeneratedCards) != 1 {
		t.Fatalf("expected one generated card from selected template, got %#v", result.GeneratedCards)
	}
	if result.GeneratedCards[0].TemplateID != "tmpl-basic-rev-1" || result.GeneratedCards[0].Front != "Answer" || result.GeneratedCards[0].Back != "Question" {
		t.Fatalf("unexpected selected-template card: %#v", result.GeneratedCards[0])
	}
}

func TestUpdateCardNoteRegeneratesOnlyUnreviewedGeneratedCards(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(
		&adminmodel.AuditLog{},
		&cardmodel.Deck{},
		&cardmodel.Card{},
		&cardmodel.CardSchedule{},
		&cardmodel.CardReview{},
		&cardmodel.CardNote{},
		&cardmodel.NoteType{},
		&cardmodel.CardTemplate{},
	); err != nil {
		t.Fatalf("migrate sqlite schema: %v", err)
	}

	repository := cardrepo.NewRepository(db)
	service := NewService(repository, adminrepo.NewAuditLogRepository(db), nil)
	fixedNow := time.Date(2026, 7, 17, 9, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return fixedNow }

	if err := repository.CreateDeck(&cardmodel.Deck{
		ID:          "deck-1",
		OwnerUserID: "user-1",
		Title:       "Managed notes",
		Visibility:  "private",
	}); err != nil {
		t.Fatalf("create deck: %v", err)
	}
	if err := repository.CreateNoteType(&cardmodel.NoteType{
		ID:              "note-type-basic-reverse",
		Code:            "basic_reverse",
		Name:            "Basic Reverse",
		Kind:            "basic_reverse",
		IsBuiltin:       true,
		Status:          "active",
		TemplateCount:   2,
		FieldSchemaJSON: `[{"name":"front","required":true},{"name":"back","required":true}]`,
		CreatedAt:       fixedNow,
		UpdatedAt:       fixedNow,
	}); err != nil {
		t.Fatalf("create note type: %v", err)
	}
	for _, template := range []cardmodel.CardTemplate{
		{
			ID:           "tmpl-basic-rev-0",
			NoteTypeID:   "note-type-basic-reverse",
			TemplateKey:  "basic-reverse-0",
			Name:         "Forward",
			TemplateKind: "basic",
			Ordinal:      0,
			IsActive:     true,
			FrontFormat:  "{{front}}",
			BackFormat:   "{{back}}",
			CreatedAt:    fixedNow,
			UpdatedAt:    fixedNow,
		},
		{
			ID:           "tmpl-basic-rev-1",
			NoteTypeID:   "note-type-basic-reverse",
			TemplateKey:  "basic-reverse-1",
			Name:         "Reverse",
			TemplateKind: "basic",
			Ordinal:      1,
			IsActive:     true,
			FrontFormat:  "{{back}}",
			BackFormat:   "{{front}}",
			CreatedAt:    fixedNow,
			UpdatedAt:    fixedNow,
		},
	} {
		template := template
		if err := repository.CreateCardTemplate(&template); err != nil {
			t.Fatalf("create template %s: %v", template.TemplateKey, err)
		}
	}

	created, err := service.CreateCardNote("user-1", "deck-1", carddto.CreateCardNoteRequest{
		NoteTypeCode: "basic_reverse",
		Fields: map[string]string{
			"front": "Old front",
			"back":  "Old back",
		},
		SourceLinks: []carddto.SourceLinkPayload{{SourceType: "note", SourceID: "note-1"}},
	})
	if err != nil {
		t.Fatalf("create card note: %v", err)
	}
	if len(created.GeneratedCards) != 2 {
		t.Fatalf("expected two generated cards, got %#v", created.GeneratedCards)
	}

	reviewedSchedule, err := repository.FindSchedule(created.GeneratedCards[0].ID, "user-1")
	if err != nil {
		t.Fatalf("find reviewed schedule: %v", err)
	}
	reviewedSchedule.State = "review"
	reviewedSchedule.RepetitionCount = 1
	reviewedSchedule.IntervalDays = 3
	if err := repository.SaveSchedule(reviewedSchedule); err != nil {
		t.Fatalf("save reviewed schedule: %v", err)
	}

	updated, err := service.UpdateCardNote("user-1", created.CardNote.ID, carddto.UpdateCardNoteRequest{
		Fields: map[string]string{
			"front": "New front",
			"back":  "New back",
		},
		Tags: []string{"graph", "weak"},
	})
	if err != nil {
		t.Fatalf("update card note: %v", err)
	}

	if updated.CardNote.Fields["front"] != "New front" || updated.CardNote.Fields["back"] != "New back" {
		t.Fatalf("expected updated fields, got %#v", updated.CardNote.Fields)
	}
	if updated.QueueStates["review"] != 1 || updated.QueueStates["new"] != 1 {
		t.Fatalf("expected queue state distribution, got %#v", updated.QueueStates)
	}
	if len(updated.GeneratedCards) != 2 {
		t.Fatalf("expected generated cards in managed payload, got %#v", updated.GeneratedCards)
	}
	if updated.GeneratedCards[0].Front != "Old front" || updated.GeneratedCards[0].Schedule == nil || updated.GeneratedCards[0].Schedule.State != "review" {
		t.Fatalf("reviewed card should keep content and schedule, got %#v", updated.GeneratedCards[0])
	}
	if updated.GeneratedCards[1].Front != "New back" || updated.GeneratedCards[1].Back != "New front" {
		t.Fatalf("unreviewed reverse card should be regenerated, got %#v", updated.GeneratedCards[1])
	}
	if len(updated.Tags) != 2 || updated.Tags[0] != "graph" || updated.Tags[1] != "weak" {
		t.Fatalf("expected updated tags in managed payload, got %#v", updated.Tags)
	}
}
