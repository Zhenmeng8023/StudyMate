package service

import (
	"fmt"
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

func newManagedNoteTest(t *testing.T) (*Service, *gorm.DB, *carddto.CreateCardNoteResultPayload) {
	t.Helper()
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&adminmodel.AuditLog{}, &cardmodel.Deck{}, &cardmodel.Card{}, &cardmodel.CardNote{}, &cardmodel.CardSchedule{}, &cardmodel.CardReview{}, &cardmodel.NoteType{}, &cardmodel.CardTemplate{}); err != nil {
		t.Fatal(err)
	}
	r := cardrepo.NewRepository(db)
	s := NewService(r, adminrepo.NewAuditLogRepository(db), nil)
	s.now = func() time.Time { return time.Date(2026, 11, 16, 8, 0, 0, 0, time.UTC) }
	if err := r.CreateDeck(&cardmodel.Deck{ID: "deck", OwnerUserID: "owner", Title: "test", Visibility: "private"}); err != nil {
		t.Fatal(err)
	}
	if err := r.CreateNoteType(&cardmodel.NoteType{ID: "cloze-type", Code: "cloze", Kind: "cloze", Status: "active"}); err != nil {
		t.Fatal(err)
	}
	if err := r.CreateCardTemplate(&cardmodel.CardTemplate{ID: "cloze-template", NoteTypeID: "cloze-type", TemplateKey: "cloze", TemplateKind: "cloze", IsActive: true}); err != nil {
		t.Fatal(err)
	}
	created, err := s.CreateCardNote("owner", "deck", carddto.CreateCardNoteRequest{NoteTypeCode: "cloze", Fields: map[string]string{"text": "{{c1::One}} and {{c2::Two}}"}, SourceLinks: []carddto.SourceLinkPayload{{SourceType: "note", SourceID: "source-1", Title: "Original"}}})
	if err != nil {
		t.Fatal(err)
	}
	return s, db, created
}

func TestManagedNoteClozeOrdinalsAndTagClearing(t *testing.T) {
	s, db, created := newManagedNoteTest(t)
	if created.GeneratedCards[0].TemplateOrdinal == created.GeneratedCards[1].TemplateOrdinal {
		t.Fatal("different Cloze markers must have distinct stable ordinals")
	}
	db.Model(&cardmodel.Card{}).Where("card_note_id = ?", created.CardNote.ID).Update("tags", `["old"]`)
	updated, err := s.UpdateCardNote("owner", created.CardNote.ID, carddto.UpdateCardNoteRequest{Tags: []string{}})
	if err != nil {
		t.Fatal(err)
	}
	if len(updated.Tags) != 0 {
		t.Fatalf("expected tags cleared, got %v", updated.Tags)
	}
}

func TestManagedNoteClozeRegenerationAddsRemovesAndPreservesHistory(t *testing.T) {
	s, db, created := newManagedNoteTest(t)
	protected := created.GeneratedCards[0]
	db.Model(&cardmodel.CardSchedule{}).Where("card_id = ?", protected.ID).Updates(map[string]any{"state": "review", "repetition_count": 2, "interval_days": 10})
	updated, err := s.UpdateCardNote("owner", created.CardNote.ID, carddto.UpdateCardNoteRequest{Fields: map[string]string{"text": "{{c3::Three}}"}})
	if err != nil {
		t.Fatal(err)
	}
	if len(updated.GeneratedCards) != 2 {
		t.Fatalf("expected protected c1 plus new c3, got %#v", updated.GeneratedCards)
	}
	var found, newCard bool
	for _, card := range updated.GeneratedCards {
		if card.ID == protected.ID {
			found = true
			if card.Front != protected.Front || card.Schedule.State != "review" {
				t.Fatal("reviewed card was reset")
			}
		}
		if card.TemplateOrdinal == 2 && card.Back == "Three" {
			newCard = true
		}
	}
	if !found {
		t.Fatal("reviewed card removed")
	}
	if !newCard {
		t.Fatal("new Cloze marker did not create a card")
	}
	var deck cardmodel.Deck
	db.First(&deck, "id = ?", "deck")
	if deck.CardCount != 2 || updated.CardNote.GeneratedCardCount != 2 {
		t.Fatalf("stale card counts: deck=%d note=%d", deck.CardCount, updated.CardNote.GeneratedCardCount)
	}
}

func TestManagedNoteRejectsInvalidClozeMarker(t *testing.T) {
	for _, text := range []string{"{{c0::bad}}", "{{c1::}}", "{{c99999999999999999999999::bad}}"} {
		if _, err := GenerateCardsForNoteType(carddto.CreateCardNoteRequest{NoteTypeCode: "cloze", Fields: map[string]string{"text": text}}); err == nil {
			t.Fatalf("accepted invalid marker %s", text)
		}
	}
}

func TestManagedNoteReadFilterDeleteAndOwnership(t *testing.T) {
	s, db, created := newManagedNoteTest(t)
	if _, err := s.GetCardNote("other", created.CardNote.ID); err == nil {
		t.Fatal("cross-user detail allowed")
	}
	if _, err := s.UpdateCardNote("other", created.CardNote.ID, carddto.UpdateCardNoteRequest{Tags: []string{}}); err == nil {
		t.Fatal("cross-user edit allowed")
	}
	for _, query := range []carddto.ListCardNotesQuery{{SourceType: "note", SourceID: "source-1"}, {SourceType: "note"}} {
		list, err := s.ListCardNotes("owner", query)
		if err != nil || len(list) != 1 {
			t.Fatalf("matching source: %v %#v", err, list)
		}
	}
	list, err := s.ListCardNotes("other", carddto.ListCardNotesQuery{SourceType: "note", SourceID: "source-1"})
	if err != nil || len(list) != 0 {
		t.Fatal("list leaked across users")
	}
	list, err = s.ListCardNotes("owner", carddto.ListCardNotesQuery{SourceType: "note", SourceID: "missing"})
	if err != nil || len(list) != 0 {
		t.Fatal("source filter ignored")
	}
	if _, err := s.ListCardNotes("owner", carddto.ListCardNotesQuery{SourceID: "source-1"}); err == nil {
		t.Fatal("accepted source id without type")
	}
	cardID := created.GeneratedCards[0].ID
	if _, err := s.DeleteCard("other", cardID, carddto.DeleteCardRequest{ConfirmDeleteHistory: true}); err == nil {
		t.Fatal("cross-user delete allowed")
	}
	if err := db.Create(&cardmodel.CardReview{ID: "review", CardID: cardID, UserID: "owner", Rating: "good", ReviewedAt: s.now()}).Error; err != nil {
		t.Fatal(err)
	}
	if _, err := s.DeleteCard("owner", cardID, carddto.DeleteCardRequest{}); err == nil {
		t.Fatal("history deletion lacked explicit confirmation")
	}
	deleted, err := s.DeleteCard("owner", cardID, carddto.DeleteCardRequest{ConfirmDeleteHistory: true})
	if err != nil || deleted.DeletedReviewCount != 1 {
		t.Fatalf("delete: %v %#v", err, deleted)
	}
	for _, model := range []any{&cardmodel.Card{}, &cardmodel.CardSchedule{}, &cardmodel.CardReview{}} {
		var count int64
		query := db.Model(model)
		if _, ok := model.(*cardmodel.Card); ok {
			query = query.Where("id = ?", cardID)
		} else {
			query = query.Where("card_id = ?", cardID)
		}
		if err := query.Count(&count).Error; err != nil || count != 0 {
			t.Fatalf("dependent rows survived deletion %T count=%d err=%v", model, count, err)
		}
	}
	detail, err := s.GetCardNote("owner", created.CardNote.ID)
	if err != nil || len(detail.GeneratedCards) != 1 || detail.CardNote.GeneratedCardCount != 1 {
		t.Fatalf("detail count mismatch %v %#v", err, detail)
	}
	if _, err := s.DeleteCard("owner", cardID, carddto.DeleteCardRequest{ConfirmDeleteHistory: true}); err == nil {
		t.Fatal("double delete should be not found")
	}
}

func TestManagedNoteRejectsOversizedTagsAndCountsPausedCards(t *testing.T) {
	s, db, created := newManagedNoteTest(t)
	if _, err := s.UpdateCardNote("owner", created.CardNote.ID, carddto.UpdateCardNoteRequest{Tags: []string{strings.Repeat("a", 101)}}); err == nil {
		t.Fatal("oversized tag accepted")
	}
	db.Model(&cardmodel.Card{}).Where("id = ?", created.GeneratedCards[0].ID).Update("status", "suspended")
	note, err := s.GetCardNote("owner", created.CardNote.ID)
	if err != nil || note.QueueStates["suspended"] != 1 || note.QueueStates["new"] != 1 {
		t.Fatalf("paused cards counted as active: %v %#v", err, note.QueueStates)
	}
}

func TestManagedNoteFiltersChildLinksByContainingSource(t *testing.T) {
	s, _, created := newManagedNoteTest(t)
	_, err := s.UpdateCardNote("owner", created.CardNote.ID, carddto.UpdateCardNoteRequest{SourceLinks: []carddto.SourceLinkPayload{
		{SourceType: "graph-node", SourceID: "node-1", Locator: map[string]any{"graphId": "graph-1"}},
		{SourceType: "annotation", SourceID: "annotation-1", Locator: map[string]any{"materialId": "pdf-1"}},
		{SourceType: "note-block", SourceID: "block-1", Locator: map[string]any{"noteId": "note-1"}},
	}})
	if err != nil {
		t.Fatal(err)
	}
	for _, query := range []carddto.ListCardNotesQuery{{SourceType: "graph", SourceID: "graph-1"}, {SourceType: "material", SourceID: "pdf-1"}, {SourceType: "note", SourceID: "note-1"}, {SourceType: "graph"}} {
		result, err := s.ListCardNotes("owner", query)
		if err != nil || len(result) != 1 {
			t.Fatalf("container source filter did not match %#v: %v %#v", query, err, result)
		}
	}
}

func TestManagedNoteLegacyClozeRecoversOrdinalsAndRetainsOmittedTags(t *testing.T) {
	s, db, created := newManagedNoteTest(t)
	db.Model(&cardmodel.Card{}).Where("card_note_id = ?", created.CardNote.ID).Updates(map[string]any{"template_ordinal": 0, "tags": `["old"]`})
	updated, err := s.UpdateCardNote("owner", created.CardNote.ID, carddto.UpdateCardNoteRequest{Fields: map[string]string{"text": "{{c2::Two changed}} and {{c3::Three}}"}})
	if err != nil {
		t.Fatal(err)
	}
	if len(updated.GeneratedCards) != 2 || updated.Regeneration.CreatedCount != 1 || updated.Regeneration.RemovedCount != 1 {
		t.Fatalf("legacy reconciliation failed: %#v", updated)
	}
	for _, card := range updated.GeneratedCards {
		if len(card.Tags) != 1 || card.Tags[0] != "old" {
			t.Fatalf("tags omitted should persist for old/new cards: %#v", card)
		}
	}
}

func TestManagedNoteAmbiguousLegacyCardsFailWithoutDataLoss(t *testing.T) {
	s, db, created := newManagedNoteTest(t)
	db.Model(&cardmodel.Card{}).Where("card_note_id = ?", created.CardNote.ID).Updates(map[string]any{"template_ordinal": 0, "front": "unidentifiable old content"})
	if _, err := s.UpdateCardNote("owner", created.CardNote.ID, carddto.UpdateCardNoteRequest{Fields: map[string]string{"text": "{{c3::Three}}"}}); err == nil {
		t.Fatal("ambiguous legacy identities must not be guessed")
	}
	current, err := s.GetCardNote("owner", created.CardNote.ID)
	if err != nil || current.CardNote.Fields["text"] != created.CardNote.Fields["text"] || len(current.GeneratedCards) != 2 {
		t.Fatalf("failed update changed existing data: %v %#v", err, current)
	}
}

func TestManagedNoteSourceEditReachesGeneratedCardsWithoutLosingLocator(t *testing.T) {
	s, _, created := newManagedNoteTest(t)
	updated, err := s.UpdateCardNote("owner", created.CardNote.ID, carddto.UpdateCardNoteRequest{SourceLinks: []carddto.SourceLinkPayload{{SourceType: "note", SourceID: "source-1", Title: "Updated", Excerpt: "Explanation", Locator: map[string]any{"noteId": "source-1"}}}})
	if err != nil {
		t.Fatal(err)
	}
	for _, card := range updated.GeneratedCards {
		if card.PrimarySourceLink == nil || card.PrimarySourceLink.Title != "Updated" || card.PrimarySourceLink.Excerpt != "Explanation" || card.PrimarySourceLink.Locator["noteId"] != "source-1" {
			t.Fatalf("generated source not synchronized: %#v", card)
		}
	}
}

func TestManagedNoteDeleteRollsBackDependentRowsWhenStorageFails(t *testing.T) {
	s, db, created := newManagedNoteTest(t)
	cardID := created.GeneratedCards[0].ID
	if err := db.Create(&cardmodel.CardReview{ID: "review", CardID: cardID, UserID: "owner", Rating: "good", ReviewedAt: s.now()}).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Exec("CREATE TRIGGER reject_schedule_delete BEFORE DELETE ON card_schedules BEGIN SELECT RAISE(ABORT, 'storage failure'); END").Error; err != nil {
		t.Fatal(err)
	}
	if _, err := s.DeleteCard("owner", cardID, carddto.DeleteCardRequest{ConfirmDeleteHistory: true}); err == nil {
		t.Fatal("expected storage failure")
	}
	var count int64
	if err := db.Model(&cardmodel.CardReview{}).Where("card_id = ?", cardID).Count(&count).Error; err != nil || count != 1 {
		t.Fatalf("review deletion was not rolled back: %d %v", count, err)
	}
	detail, err := s.GetCardNote("owner", created.CardNote.ID)
	if err != nil || len(detail.GeneratedCards) != 2 {
		t.Fatalf("failed deletion lost card: %v %#v", err, detail)
	}
}

func TestManagedNoteRejectsUnboundedClozeGeneration(t *testing.T) {
	text := ""
	for i := 1; i <= 101; i++ {
		text += fmt.Sprintf("{{c%d::answer}} ", i)
	}
	if _, err := GenerateCardsForNoteType(carddto.CreateCardNoteRequest{NoteTypeCode: "cloze", Fields: map[string]string{"text": text}}); err == nil {
		t.Fatal("unbounded generated cards accepted")
	}
}

func TestManagedNoteValidatesSourceAndFieldBoundaries(t *testing.T) {
	s, _, created := newManagedNoteTest(t)
	for _, request := range []carddto.UpdateCardNoteRequest{
		{Fields: map[string]string{"text": strings.Repeat("a", 200001)}},
		{SourceLinks: []carddto.SourceLinkPayload{{SourceType: "invalid", SourceID: "id"}}},
		{SourceLinks: []carddto.SourceLinkPayload{{SourceType: "note", SourceID: "id", Title: strings.Repeat("题", 501)}}},
		{Tags: make([]string, 101)},
	} {
		if _, err := s.UpdateCardNote("owner", created.CardNote.ID, request); err == nil {
			t.Fatalf("invalid request accepted: %#v", request)
		}
	}
	fields := map[string]string{}
	for i := 0; i < 33; i++ {
		fields[fmt.Sprint(i)] = "value"
	}
	if _, err := s.UpdateCardNote("owner", created.CardNote.ID, carddto.UpdateCardNoteRequest{Fields: fields}); err == nil {
		t.Fatal("accepted too many fields")
	}
}
