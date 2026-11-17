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

func TestReviewInsightsBuildsSevenDayHistoryAndFiltersOwner(t *testing.T) {
	db, service, repository := newReviewInsightsTestService(t)
	now := time.Date(2026, 7, 18, 9, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return now }

	deck := createReviewInsightsDeck(t, repository, "deck-1", "user-1")
	card, err := service.CreateCard("user-1", deck.ID, carddto.CreateCardRequest{
		CardType:   "basic",
		Front:      "Graph node",
		Back:       "Graph node answer",
		SourceType: "graph-node",
		SourceID:   "node-1",
	})
	if err != nil {
		t.Fatalf("create card: %v", err)
	}
	if err := db.Create(&cardmodel.CardReview{ID: "review-1", CardID: card.ID, UserID: "user-1", Rating: "again", ReviewedAt: now.AddDate(0, 0, -1)}).Error; err != nil {
		t.Fatalf("create review: %v", err)
	}
	if err := db.Create(&cardmodel.CardReview{ID: "review-2", CardID: card.ID, UserID: "user-1", Rating: "good", ReviewedAt: now}).Error; err != nil {
		t.Fatalf("create review: %v", err)
	}

	otherDeck := createReviewInsightsDeck(t, repository, "deck-2", "user-2")
	otherCard, err := service.CreateCard("user-2", otherDeck.ID, carddto.CreateCardRequest{
		CardType:   "basic",
		Front:      "Other user card",
		Back:       "Hidden",
		SourceType: "graph-node",
		SourceID:   "node-1",
	})
	if err != nil {
		t.Fatalf("create other card: %v", err)
	}
	if err := db.Create(&cardmodel.CardReview{ID: "review-other", CardID: otherCard.ID, UserID: "user-2", Rating: "easy", ReviewedAt: now}).Error; err != nil {
		t.Fatalf("create other review: %v", err)
	}

	insights, err := service.ReviewInsights("user-1")
	if err != nil {
		t.Fatalf("review insights: %v", err)
	}

	if len(insights.Days) != 7 {
		t.Fatalf("expected 7 days, got %d", len(insights.Days))
	}
	if insights.Days[5].Date != "2026-07-17" || insights.Days[5].RatingCounts["again"] != 1 {
		t.Fatalf("expected again count on 2026-07-17, got %#v", insights.Days[5])
	}
	if insights.Days[6].Date != "2026-07-18" || insights.Days[6].RatingCounts["good"] != 1 || insights.Days[6].RatingCounts["easy"] != 0 {
		t.Fatalf("expected only user-1 good count on 2026-07-18, got %#v", insights.Days[6])
	}
	if len(insights.SourceTrends) == 0 {
		t.Fatal("expected source mastery trends")
	}
	feedback, err := service.ReviewFeedback("user-1")
	if err != nil {
		t.Fatal(err)
	}
	if len(feedback.SourceSummaries) != 1 || feedback.SourceSummaries[0].LastReviewedAt != now.Format(time.RFC3339) {
		t.Fatalf("expected owner-scoped actual latest review timestamp, got %#v", feedback.SourceSummaries)
	}
}

func TestSourceProfileReturnsCardsQueueAndRecentReviews(t *testing.T) {
	db, service, repository := newReviewInsightsTestService(t)
	now := time.Date(2026, 7, 18, 9, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return now }
	deck := createReviewInsightsDeck(t, repository, "deck-1", "user-1")
	seedBasicNoteType(t, db, now)

	created, err := service.CreateCardNote("user-1", deck.ID, carddto.CreateCardNoteRequest{
		NoteTypeCode: "basic",
		PrimarySourceLink: &carddto.SourceLinkPayload{
			SourceType: "graph-node",
			SourceID:   "node-1",
			Title:      "图谱节点 A",
			Excerpt:    "节点解释",
			Locator:    map[string]any{"graphId": "graph-1", "nodeId": "node-1"},
		},
		Fields: map[string]string{"front": "图谱节点 A", "back": "节点解释"},
	})
	if err != nil {
		t.Fatalf("create card note: %v", err)
	}
	cardID := created.GeneratedCards[0].ID
	if err := db.Model(&cardmodel.CardSchedule{}).Where("card_id = ?", cardID).Updates(map[string]any{
		"state":       "learning",
		"lapse_count": 1,
		"due_at":      now.Add(-time.Hour),
	}).Error; err != nil {
		t.Fatalf("update schedule: %v", err)
	}
	if err := db.Create(&cardmodel.CardReview{ID: "review-1", CardID: cardID, UserID: "user-1", Rating: "again", ReviewedAt: now.Add(-time.Hour)}).Error; err != nil {
		t.Fatalf("create review: %v", err)
	}

	profile, err := service.SourceProfile("user-1", carddto.SourceProfileQuery{SourceType: "graph-node", SourceID: "node-1"})
	if err != nil {
		t.Fatalf("source profile: %v", err)
	}

	if profile.Title != "图谱节点 A" || profile.Excerpt != "节点解释" {
		t.Fatalf("expected source title/excerpt, got %#v", profile)
	}
	if profile.QueueStates["learning"] != 1 || profile.WeakCardCount != 1 || profile.DueCount != 1 {
		t.Fatalf("expected learning weak due source profile, got %#v", profile)
	}
	if len(profile.CardNotes) != 1 || len(profile.GeneratedCards) != 1 {
		t.Fatalf("expected linked card note and generated card, got %#v", profile)
	}
	if profile.LastReviewedAt == "" || len(profile.RecentReviews) != 1 || profile.RecentReviews[0].Rating != "again" {
		t.Fatalf("expected recent review metadata, got %#v", profile.RecentReviews)
	}
}

func TestSourceProfileMatchesSecondarySourceLinks(t *testing.T) {
	db, service, repository := newReviewInsightsTestService(t)
	now := time.Date(2026, 7, 18, 9, 0, 0, 0, time.UTC)
	service.now = func() time.Time { return now }
	deck := createReviewInsightsDeck(t, repository, "deck-1", "user-1")
	seedBasicNoteType(t, db, now)

	_, err := service.CreateCardNote("user-1", deck.ID, carddto.CreateCardNoteRequest{
		NoteTypeCode: "basic",
		PrimarySourceLink: &carddto.SourceLinkPayload{
			SourceType: "graph-node",
			SourceID:   "node-1",
			Title:      "Graph primary",
			Locator:    map[string]any{"graphId": "graph-1", "nodeId": "node-1"},
		},
		SourceLinks: []carddto.SourceLinkPayload{{
			SourceType: "material",
			SourceID:   "material-1",
			Title:      "Source material",
			Excerpt:    "Reader excerpt",
			Locator:    map[string]any{"materialId": "material-1", "page": float64(3)},
		}},
		Fields: map[string]string{"front": "Graph primary", "back": "Reader excerpt"},
	})
	if err != nil {
		t.Fatalf("create card note: %v", err)
	}

	profile, err := service.SourceProfile("user-1", carddto.SourceProfileQuery{SourceType: "material", SourceID: "material-1"})
	if err != nil {
		t.Fatalf("source profile: %v", err)
	}

	if profile.Title != "Source material" || profile.Excerpt != "Reader excerpt" {
		t.Fatalf("expected secondary source title/excerpt, got %#v", profile)
	}
	if len(profile.CardNotes) != 1 || len(profile.CardNotes[0].GeneratedCards) != 1 {
		t.Fatalf("expected matched CardNote and generated cards, got %#v", profile.CardNotes)
	}
	if len(profile.GeneratedCards) != 0 {
		t.Fatalf("expected top-level generated cards to remain primary-source scoped, got %#v", profile.GeneratedCards)
	}
}

func seedBasicNoteType(t *testing.T, db *gorm.DB, now time.Time) {
	t.Helper()
	if err := db.Create(&cardmodel.NoteType{
		ID:              "builtin-basic",
		Code:            "basic",
		Name:            "Basic",
		Kind:            "basic",
		IsBuiltin:       true,
		Status:          "active",
		FieldSchemaJSON: `[{"name":"front","required":true},{"name":"back","required":true}]`,
		TemplateCount:   1,
		CreatedAt:       now,
		UpdatedAt:       now,
	}).Error; err != nil {
		t.Fatalf("seed note type: %v", err)
	}
	if err := db.Create(&cardmodel.CardTemplate{
		ID:           "builtin-basic-0",
		NoteTypeID:   "builtin-basic",
		TemplateKey:  "basic-forward",
		Name:         "Basic",
		TemplateKind: "basic",
		Ordinal:      0,
		IsActive:     true,
		FrontFormat:  "{{front}}",
		BackFormat:   "{{back}}",
		CreatedAt:    now,
		UpdatedAt:    now,
	}).Error; err != nil {
		t.Fatalf("seed card template: %v", err)
	}
}

func newReviewInsightsTestService(t *testing.T) (*gorm.DB, *Service, *cardrepo.Repository) {
	t.Helper()
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
	return db, service, repository
}

func createReviewInsightsDeck(t *testing.T, repository *cardrepo.Repository, deckID string, ownerID string) *cardmodel.Deck {
	t.Helper()
	deck := &cardmodel.Deck{
		ID:          deckID,
		OwnerUserID: ownerID,
		Title:       deckID,
		Description: "Review insights test deck",
		Visibility:  "private",
	}
	if err := repository.CreateDeck(deck); err != nil {
		t.Fatalf("create deck: %v", err)
	}
	return deck
}
