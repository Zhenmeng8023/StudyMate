package handler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	carddto "studymate/backend/internal/modules/card/dto"
)

func (s *fakeCardService) GetCardNote(ownerUserID, cardNoteID string) (*carddto.ManagedCardNotePayload, error) {
	s.ownerID, s.cardID = ownerUserID, cardNoteID
	return &carddto.ManagedCardNotePayload{CardNote: carddto.CardNotePayload{ID: cardNoteID, OwnerUserID: ownerUserID}}, nil
}

func (s *fakeCardService) DeleteCard(ownerUserID, cardID string, request carddto.DeleteCardRequest) (*carddto.DeleteCardResultPayload, error) {
	s.ownerID, s.cardID = ownerUserID, cardID
	s.deleteReq = request
	return &carddto.DeleteCardResultPayload{CardID: cardID, DeckID: "deck"}, nil
}

func TestCardNoteManagementHandlersBindOwnerFiltersAndDeleteConfirmation(t *testing.T) {
	gin.SetMode(gin.TestMode)
	for _, scenario := range []struct {
		method, path, body string
		handle             func(*Handler) gin.HandlerFunc
	}{
		{http.MethodGet, "/card-notes/note-1", "", func(h *Handler) gin.HandlerFunc { return h.GetCardNote }},
		{http.MethodGet, "/card-notes?sourceType=note&sourceId=source-1", "", func(h *Handler) gin.HandlerFunc { return h.ListCardNotes }},
		{http.MethodDelete, "/cards/card-1", `{"confirmDeleteHistory":true}`, func(h *Handler) gin.HandlerFunc { return h.DeleteCard }},
	} {
		t.Run(scenario.method+scenario.path, func(t *testing.T) {
			fake := &fakeCardService{}
			h := NewHandler(fake)
			r := gin.New()
			r.Use(func(c *gin.Context) { c.Set(middleware.ContextUserIDKey, "owner") })
			path := scenario.path
			if scenario.method == http.MethodDelete {
				path = "/cards/:id"
			} else if strings.Contains(path, "?") {
				path = "/card-notes"
			} else {
				path = "/card-notes/:id"
			}
			r.Handle(scenario.method, path, scenario.handle(h))
			request := httptest.NewRequest(scenario.method, scenario.path, strings.NewReader(scenario.body))
			request.Header.Set("Content-Type", "application/json")
			response := httptest.NewRecorder()
			r.ServeHTTP(response, request)
			if response.Code != http.StatusOK || fake.ownerID != "owner" {
				t.Fatalf("status=%d owner=%s body=%s", response.Code, fake.ownerID, response.Body.String())
			}
			if scenario.method == http.MethodDelete && (!fake.deleteReq.ConfirmDeleteHistory || fake.cardID != "card-1") {
				t.Fatal("delete confirmation/card id was not bound")
			}
			if strings.Contains(scenario.path, "?") && (fake.managedQuery.SourceType != "note" || fake.managedQuery.SourceID != "source-1") {
				t.Fatal("source filter was not bound")
			}
		})
	}
}
