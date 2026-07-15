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
	ownerID       string
	deckID        string
	cardID        string
	createDeckReq carddto.CreateDeckRequest
	listCardsReq  carddto.ListCardsQuery
	reviewReq     carddto.ReviewCardRequest
	statusReq     carddto.UpdateCardStatusRequest
	undoReq       carddto.UndoReviewRequest
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

func TestListCardsReadsServerSideFiltersFromQuery(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeCardService{}
	handler := NewHandler(service)
	router := gin.New()
	router.GET("/decks/:id/cards", withUser(handler.ListCards))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/decks/deck-1/cards?q=note&status=suspended&sourceType=note&dueBucket=upcoming", nil))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.deckID != "deck-1" || service.ownerID != "user-1" {
		t.Fatalf("unexpected request binding: owner=%q deck=%q", service.ownerID, service.deckID)
	}
	if service.listCardsReq.Query != "note" || service.listCardsReq.Status != "suspended" || service.listCardsReq.SourceType != "note" || service.listCardsReq.DueBucket != "upcoming" {
		t.Fatalf("unexpected list cards query: %#v", service.listCardsReq)
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
