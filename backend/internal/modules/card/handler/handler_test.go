package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	carddto "studymate/backend/internal/modules/card/dto"
)

type fakeCardService struct {
	ownerID           string
	deckID            string
	cardID            string
	exportFormat      string
	createDeckReq     carddto.CreateDeckRequest
	createCardNoteReq carddto.CreateCardNoteRequest
	updateCardNoteReq carddto.UpdateCardNoteRequest
	importDeckReq     carddto.ImportDeckRequest
	listCardsReq      carddto.ListCardsQuery
	reviewReq         carddto.ReviewCardRequest
	statusReq         carddto.UpdateCardStatusRequest
	tagReq            carddto.UpdateCardTagsRequest
	undoReq           carddto.UndoReviewRequest
	managedQuery      carddto.ListCardNotesQuery
	deleteReq         carddto.DeleteCardRequest
}

func (s *fakeCardService) ListDecks(ownerUserID string) ([]carddto.DeckPayload, error) {
	s.ownerID = ownerUserID
	return []carddto.DeckPayload{{ID: "deck-1", OwnerUserID: ownerUserID, Title: "期末复习"}}, nil
}

func (s *fakeCardService) CreateDeck(ownerUserID string, request carddto.CreateDeckRequest) (*carddto.DeckPayload, error) {
	s.ownerID = ownerUserID
	s.createDeckReq = request
	return &carddto.DeckPayload{
		ID:          "deck-1",
		OwnerUserID: ownerUserID,
		Title:       request.Title,
		Description: request.Description,
		Visibility:  request.Visibility,
		CreatedAt:   "2026-06-02T12:00:00Z",
		UpdatedAt:   "2026-06-02T12:00:00Z",
	}, nil
}

func (s *fakeCardService) ListCards(ownerUserID string, deckID string, request carddto.ListCardsQuery) ([]carddto.CardPayload, error) {
	s.ownerID = ownerUserID
	s.deckID = deckID
	s.listCardsReq = request
	return []carddto.CardPayload{}, nil
}

func (s *fakeCardService) CreateCard(ownerUserID string, deckID string, request carddto.CreateCardRequest) (*carddto.CardPayload, error) {
	s.ownerID = ownerUserID
	s.deckID = deckID
	return &carddto.CardPayload{ID: "card-1", DeckID: deckID, OwnerUserID: ownerUserID, Front: request.Front, Back: request.Back}, nil
}

func (s *fakeCardService) CreateCardNote(ownerUserID string, deckID string, request carddto.CreateCardNoteRequest) (*carddto.CreateCardNoteResultPayload, error) {
	s.ownerID = ownerUserID
	s.deckID = deckID
	s.createCardNoteReq = request
	return &carddto.CreateCardNoteResultPayload{
		CardNote: carddto.CardNotePayload{
			ID:                 "note-1",
			DeckID:             deckID,
			OwnerUserID:        ownerUserID,
			NoteTypeID:         "basic",
			NoteTypeCode:       request.NoteTypeCode,
			PrimarySourceLink:  request.PrimarySourceLink,
			SourceLinks:        request.SourceLinks,
			Fields:             request.Fields,
			GeneratedCardCount: 1,
			Status:             "active",
		},
		GeneratedCards: []carddto.GeneratedCardPayload{{
			ID:          "card-1",
			DeckID:      deckID,
			OwnerUserID: ownerUserID,
			Front:       "Front",
			Back:        "Back",
			Status:      "active",
		}},
	}, nil
}

func (s *fakeCardService) ListCardNotes(ownerUserID string, queries ...carddto.ListCardNotesQuery) ([]carddto.ManagedCardNotePayload, error) {
	s.ownerID = ownerUserID
	if len(queries) > 0 {
		s.managedQuery = queries[0]
	}
	return []carddto.ManagedCardNotePayload{{
		CardNote: carddto.CardNotePayload{
			ID:                 "note-1",
			DeckID:             "deck-1",
			OwnerUserID:        ownerUserID,
			NoteTypeCode:       "basic",
			Fields:             map[string]string{"front": "Front", "back": "Back"},
			GeneratedCardCount: 1,
			Status:             "active",
		},
		GeneratedCards: []carddto.GeneratedCardPayload{{ID: "card-1", CardNoteID: "note-1", Front: "Front", Back: "Back"}},
		QueueStates:    map[string]int{"new": 1},
		Tags:           []string{"graph"},
	}}, nil
}

func (s *fakeCardService) UpdateCardNote(ownerUserID string, cardNoteID string, request carddto.UpdateCardNoteRequest) (*carddto.ManagedCardNotePayload, error) {
	s.ownerID = ownerUserID
	s.cardID = cardNoteID
	s.updateCardNoteReq = request
	return &carddto.ManagedCardNotePayload{
		CardNote: carddto.CardNotePayload{
			ID:           cardNoteID,
			OwnerUserID:  ownerUserID,
			NoteTypeCode: "basic",
			Fields:       request.Fields,
			Status:       "active",
		},
		GeneratedCards: []carddto.GeneratedCardPayload{{ID: "card-1", CardNoteID: cardNoteID, Front: request.Fields["front"], Back: request.Fields["back"]}},
		QueueStates:    map[string]int{"new": 1},
		Tags:           request.Tags,
	}, nil
}

func (s *fakeCardService) BulkCreateCards(ownerUserID string, deckID string, requests []carddto.CreateCardRequest) ([]carddto.CardPayload, error) {
	s.ownerID = ownerUserID
	s.deckID = deckID
	return []carddto.CardPayload{{ID: "card-1", DeckID: deckID, OwnerUserID: ownerUserID}}, nil
}

func (s *fakeCardService) TodayQueue(ownerUserID string) (*carddto.ReviewQueuePayload, error) {
	s.ownerID = ownerUserID
	return &carddto.ReviewQueuePayload{
		DueCount: 1,
		Items: []carddto.ReviewQueueItemPayload{{
			DeckTitle: "期末复习",
			Card:      carddto.CardPayload{ID: "card-1", Front: "什么是图谱？", Back: "节点和关系。"},
			Schedule:  carddto.CardSchedulePayload{CardID: "card-1", UserID: ownerUserID, State: "new"},
		}},
	}, nil
}

func (s *fakeCardService) ReviewFeedback(ownerUserID string) (*carddto.ReviewFeedbackPayload, error) {
	s.ownerID = ownerUserID
	return &carddto.ReviewFeedbackPayload{
		DueCount:      2,
		LearningCount: 1,
		WeakCardCount: 2,
		WeakCards: []carddto.ReviewFeedbackCardPayload{{
			CardID:          "card-1",
			DeckID:          "deck-1",
			DeckTitle:       "期末复习",
			Front:           "什么是图谱？",
			SourceType:      "graph",
			SourceID:        "node-1",
			LapseCount:      2,
			RepetitionCount: 1,
			State:           "relearning",
			DueAt:           "2026-06-02T12:00:00Z",
		}},
		WeakSources: []carddto.ReviewFeedbackSourcePayload{{
			SourceType:        "graph",
			SourceID:          "node-1",
			TotalCardCount:    3,
			ReviewCardCount:   1,
			MasteredCardCount: 1,
			MasteryLevel:      "building",
			MasteryScore:      33,
			WeakCardCount:     2,
			DueCount:          1,
			LearningCount:     1,
			MaxLapseCount:     2,
			SampleCardFronts:  []string{"什么是图谱？"},
		}},
		SourceSummaries: []carddto.ReviewFeedbackSourcePayload{{
			SourceType:        "graph",
			SourceID:          "node-1",
			TotalCardCount:    3,
			ReviewCardCount:   1,
			MasteredCardCount: 1,
			MasteryLevel:      "building",
			MasteryScore:      33,
			WeakCardCount:     2,
			DueCount:          1,
			LearningCount:     1,
			MaxLapseCount:     2,
			SampleCardFronts:  []string{"什么是图谱？"},
		}},
	}, nil
}

func (s *fakeCardService) ReviewInsights(ownerUserID string) (*carddto.ReviewInsightsPayload, error) {
	s.ownerID = ownerUserID
	return &carddto.ReviewInsightsPayload{
		Days: []carddto.ReviewInsightDailyPayload{{
			Date:        "2026-07-18",
			ReviewCount: 2,
			RatingCounts: map[string]int{
				"again": 1,
				"hard":  0,
				"good":  1,
				"easy":  0,
			},
			WeakNewCount: 1,
		}},
	}, nil
}

func (s *fakeCardService) SourceProfile(ownerUserID string, query carddto.SourceProfileQuery) (*carddto.SourceProfilePayload, error) {
	s.ownerID = ownerUserID
	return &carddto.SourceProfilePayload{
		SourceType:    query.SourceType,
		SourceID:      query.SourceID,
		Title:         "图谱节点",
		QueueStates:   map[string]int{"learning": 1},
		MasteryScore:  33,
		MasteryLevel:  "building",
		LearningCount: 1,
	}, nil
}

func (s *fakeCardService) ExportDeck(ownerUserID string, deckID string, format string) (*carddto.DeckExportPayload, error) {
	s.ownerID = ownerUserID
	s.deckID = deckID
	s.exportFormat = format
	return &carddto.DeckExportPayload{
		Format:     format,
		Filename:   "deck-cards.json",
		MimeType:   "application/json;charset=utf-8",
		Content:    "{\"cards\":[]}",
		CardCount:  1,
		ExportedAt: "2026-06-02T12:00:00Z",
	}, nil
}

func (s *fakeCardService) ImportDeck(ownerUserID string, deckID string, request carddto.ImportDeckRequest) (*carddto.DeckImportPayload, error) {
	s.ownerID = ownerUserID
	s.deckID = deckID
	s.importDeckReq = request
	return &carddto.DeckImportPayload{
		Preview:       request.PreviewOnly,
		TotalCount:    1,
		ReadyCount:    1,
		ImportedCount: 1,
		StatusMessage: "已导入 1 张卡片到当前卡组。",
	}, nil
}

func (s *fakeCardService) ReviewCard(ownerUserID string, cardID string, request carddto.ReviewCardRequest) (*carddto.ReviewResultPayload, error) {
	s.ownerID = ownerUserID
	s.cardID = cardID
	s.reviewReq = request
	return &carddto.ReviewResultPayload{
		ReviewID: "review-1",
		Schedule: carddto.CardSchedulePayload{
			CardID:       cardID,
			UserID:       ownerUserID,
			State:        "review",
			IntervalDays: 1,
		},
	}, nil
}

func (s *fakeCardService) UpdateCardStatus(ownerUserID string, cardID string, request carddto.UpdateCardStatusRequest) (*carddto.CardPayload, error) {
	s.ownerID = ownerUserID
	s.cardID = cardID
	s.statusReq = request
	return &carddto.CardPayload{
		ID:          cardID,
		DeckID:      "deck-1",
		OwnerUserID: ownerUserID,
		Front:       "什么是图谱？",
		Back:        "节点和关系。",
		Status:      request.Status,
	}, nil
}

func (s *fakeCardService) UpdateCardTags(ownerUserID string, cardID string, request carddto.UpdateCardTagsRequest) (*carddto.CardPayload, error) {
	s.ownerID = ownerUserID
	s.cardID = cardID
	s.tagReq = request
	return &carddto.CardPayload{
		ID:          cardID,
		DeckID:      "deck-1",
		OwnerUserID: ownerUserID,
		Front:       "什么是图谱？",
		Back:        "节点和关系。",
		Tags:        request.Tags,
		Status:      "active",
	}, nil
}

func (s *fakeCardService) UndoReview(ownerUserID string, cardID string, request carddto.UndoReviewRequest) (*carddto.UndoReviewResultPayload, error) {
	s.ownerID = ownerUserID
	s.cardID = cardID
	s.undoReq = request
	return &carddto.UndoReviewResultPayload{
		Schedule: request.PreviousSchedule,
	}, nil
}

func withUser(handler func(*gin.Context)) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Set(middleware.ContextUserIDKey, "user-1")
		handler(ctx)
	}
}

func TestCreateDeckUsesAuthenticatedOwnerAndBody(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/decks", withUser(handler.CreateDeck))

	body := bytes.NewBufferString(`{"title":"期末复习","description":"高频概念","visibility":"private"}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/decks", body))

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" {
		t.Fatalf("expected owner user-1, got %q", service.ownerID)
	}
	if service.createDeckReq.Title != "期末复习" || service.createDeckReq.Visibility != "private" {
		t.Fatalf("unexpected deck request: %#v", service.createDeckReq)
	}
}

func TestTodayQueueReturnsDueItems(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.GET("/review/today", withUser(handler.TodayQueue))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/review/today", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	var payload struct {
		Success bool                       `json:"success"`
		Data    carddto.ReviewQueuePayload `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !payload.Success || payload.Data.DueCount != 1 || payload.Data.Items[0].Card.ID != "card-1" {
		t.Fatalf("unexpected queue payload: %#v", payload)
	}
}

func TestReviewFeedbackReturnsWeakCards(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.GET("/review/feedback", withUser(handler.ReviewFeedback))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/review/feedback", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	var payload struct {
		Success bool                          `json:"success"`
		Data    carddto.ReviewFeedbackPayload `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !payload.Success || payload.Data.WeakCardCount != 2 || len(payload.Data.WeakCards) != 1 {
		t.Fatalf("unexpected feedback payload: %#v", payload)
	}
	if payload.Data.WeakCards[0].DeckTitle != "期末复习" || payload.Data.WeakCards[0].State != "relearning" {
		t.Fatalf("unexpected weak card payload: %#v", payload.Data.WeakCards[0])
	}
	if len(payload.Data.WeakSources) != 1 || payload.Data.WeakSources[0].SourceType != "graph" || payload.Data.WeakSources[0].SourceID != "node-1" {
		t.Fatalf("unexpected weak source payload: %#v", payload.Data.WeakSources)
	}
	if len(payload.Data.SourceSummaries) != 1 || payload.Data.SourceSummaries[0].MasteryLevel != "building" || payload.Data.SourceSummaries[0].MasteryScore != 33 {
		t.Fatalf("unexpected source summaries payload: %#v", payload.Data.SourceSummaries)
	}
}

func TestExportDeckReadsFormatQuery(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.GET("/decks/:id/export", withUser(handler.ExportDeck))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/decks/deck-1/export?format=csv", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" || service.deckID != "deck-1" || service.exportFormat != "csv" {
		t.Fatalf("unexpected export request binding: owner=%q deck=%q format=%q", service.ownerID, service.deckID, service.exportFormat)
	}
}

func TestImportDeckWritesFilenameContentAndPreviewFlag(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/decks/:id/import", withUser(handler.ImportDeck))

	body := bytes.NewBufferString(`{"filename":"cards.json","content":"{\"cards\":[{\"front\":\"Q\",\"back\":\"A\"}]}","previewOnly":true}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/decks/deck-1/import", body))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" || service.deckID != "deck-1" {
		t.Fatalf("unexpected import request binding: owner=%q deck=%q", service.ownerID, service.deckID)
	}
	if service.importDeckReq.Filename != "cards.json" || service.importDeckReq.Content == "" || !service.importDeckReq.PreviewOnly {
		t.Fatalf("unexpected import request payload: %#v", service.importDeckReq)
	}
}

func TestListCardsReadsServerSideFiltersFromQuery(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.GET("/decks/:id/cards", withUser(handler.ListCards))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/decks/deck-1/cards?q=note&status=suspended&sourceType=note&sourceId=note-1&dueBucket=upcoming&tag=graph", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.deckID != "deck-1" || service.ownerID != "user-1" {
		t.Fatalf("unexpected request binding: owner=%q deck=%q", service.ownerID, service.deckID)
	}
	if service.listCardsReq.Query != "note" ||
		service.listCardsReq.Status != "suspended" ||
		service.listCardsReq.SourceType != "note" ||
		service.listCardsReq.SourceID != "note-1" ||
		service.listCardsReq.DueBucket != "upcoming" ||
		service.listCardsReq.Tag != "graph" {
		t.Fatalf("unexpected list cards query: %#v", service.listCardsReq)
	}
}

func TestReviewInsightsUsesAuthenticatedOwner(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.GET("/review/insights", withUser(handler.ReviewInsights))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/review/insights", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" {
		t.Fatalf("expected authenticated owner, got %s", service.ownerID)
	}
}

func TestSourceProfileBindsQueryAndUsesAuthenticatedOwner(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.GET("/review/source-profile", withUser(handler.SourceProfile))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/review/source-profile?sourceType=graph-node&sourceId=node-1", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" {
		t.Fatalf("expected authenticated owner, got %s", service.ownerID)
	}
	var body struct {
		Data carddto.SourceProfilePayload `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if body.Data.SourceType != "graph-node" || body.Data.SourceID != "node-1" {
		t.Fatalf("unexpected source profile: %#v", body.Data)
	}
}

func TestCreateCardNoteBindsBodyAndUsesAuthenticatedOwner(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/decks/:id/card-notes", withUser(handler.CreateCardNote))

	body := bytes.NewBufferString(`{"noteTypeCode":"basic_reverse","fields":{"front":"Q","back":"A"},"sourceLinks":[{"sourceType":"annotation","sourceId":"annotation-1","locator":{"materialId":"material-1","page":8}}]}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/decks/deck-1/card-notes", body))

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" || service.deckID != "deck-1" {
		t.Fatalf("unexpected card note binding: owner=%q deck=%q", service.ownerID, service.deckID)
	}
	if service.createCardNoteReq.NoteTypeCode != "basic_reverse" {
		t.Fatalf("unexpected card note request: %#v", service.createCardNoteReq)
	}
	if len(service.createCardNoteReq.SourceLinks) != 1 || service.createCardNoteReq.SourceLinks[0].SourceType != "annotation" {
		t.Fatalf("expected source link binding, got %#v", service.createCardNoteReq.SourceLinks)
	}
}

func TestListCardNotesUsesAuthenticatedOwner(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.GET("/card-notes", withUser(handler.ListCardNotes))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/card-notes", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" {
		t.Fatalf("expected authenticated owner, got %q", service.ownerID)
	}
	if !bytes.Contains(recorder.Body.Bytes(), []byte("note-1")) {
		t.Fatalf("expected card note response, got %s", recorder.Body.String())
	}
}

func TestUpdateCardNoteBindsBodyAndUsesAuthenticatedOwner(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.PATCH("/card-notes/:id", withUser(handler.UpdateCardNote))

	body := bytes.NewBufferString(`{"fields":{"front":"Updated front","back":"Updated back"},"tags":["graph","weak"],"sourceLinks":[{"sourceType":"note","sourceId":"note-source-1"}]}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPatch, "/card-notes/note-1", body))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" || service.cardID != "note-1" {
		t.Fatalf("unexpected binding: owner=%q cardNote=%q", service.ownerID, service.cardID)
	}
	if service.updateCardNoteReq.Fields["front"] != "Updated front" || len(service.updateCardNoteReq.Tags) != 2 {
		t.Fatalf("unexpected update request: %#v", service.updateCardNoteReq)
	}
	if len(service.updateCardNoteReq.SourceLinks) != 1 || service.updateCardNoteReq.SourceLinks[0].SourceType != "note" {
		t.Fatalf("expected source links binding, got %#v", service.updateCardNoteReq.SourceLinks)
	}
}

func TestReviewCardWritesRatingAndElapsedMs(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/cards/:id/review", withUser(handler.ReviewCard))

	body := bytes.NewBufferString(`{"rating":"good","elapsedMs":1200}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/cards/card-1/review", body))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.cardID != "card-1" {
		t.Fatalf("expected card id card-1, got %q", service.cardID)
	}
	if service.reviewReq.Rating != "good" || service.reviewReq.ElapsedMs != 1200 {
		t.Fatalf("unexpected review request: %#v", service.reviewReq)
	}
}

func TestUpdateCardStatusWritesRequestedStatus(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.PATCH("/cards/:id/status", withUser(handler.UpdateCardStatus))

	body := bytes.NewBufferString(`{"status":"suspended"}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPatch, "/cards/card-1/status", body))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.cardID != "card-1" {
		t.Fatalf("expected card id card-1, got %q", service.cardID)
	}
	if service.statusReq.Status != "suspended" {
		t.Fatalf("unexpected status request: %#v", service.statusReq)
	}
}

func TestUpdateCardTagsWritesRequestedTags(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.PATCH("/cards/:id/tags", withUser(handler.UpdateCardTags))

	body := bytes.NewBufferString(`{"tags":["graph","core"]}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPatch, "/cards/card-1/tags", body))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.cardID != "card-1" {
		t.Fatalf("expected card id card-1, got %q", service.cardID)
	}
	if len(service.tagReq.Tags) != 2 || service.tagReq.Tags[0] != "graph" || service.tagReq.Tags[1] != "core" {
		t.Fatalf("unexpected tag request: %#v", service.tagReq)
	}
}

func TestUndoReviewWritesReviewIdAndPreviousSchedule(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/cards/:id/review/undo", withUser(handler.UndoReview))

	body := bytes.NewBufferString(`{"reviewId":"review-1","previousSchedule":{"cardId":"card-1","userId":"user-1","dueAt":"2026-06-02T12:00:00Z","intervalDays":0,"easeFactor":2.5,"repetitionCount":0,"lapseCount":0,"state":"new","updatedAt":"2026-06-02T12:00:00Z"}}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/cards/card-1/review/undo", body))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.cardID != "card-1" {
		t.Fatalf("expected card id card-1, got %q", service.cardID)
	}
	if service.undoReq.ReviewID != "review-1" || service.undoReq.PreviousSchedule.CardID != "card-1" {
		t.Fatalf("unexpected undo request: %#v", service.undoReq)
	}
}
