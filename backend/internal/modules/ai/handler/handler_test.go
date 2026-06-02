package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	aidto "studymate/backend/internal/modules/ai/dto"
)

type fakeAiService struct {
	userIDs []string
}

func (s *fakeAiService) ListTasks(userID string) ([]aidto.TaskPayload, error) {
	s.userIDs = append(s.userIDs, userID)
	return []aidto.TaskPayload{{
		ID:        "task-1",
		UserID:    userID,
		TaskType:  "generate_cards",
		Status:    "completed",
		Model:     "local-test",
		CreatedAt: "2026-06-02T12:00:00Z",
		UpdatedAt: "2026-06-02T12:00:00Z",
	}}, nil
}

func (s *fakeAiService) UsageSummary(userID string) (*aidto.UsageSummaryPayload, error) {
	s.userIDs = append(s.userIDs, userID)
	return &aidto.UsageSummaryPayload{
		TotalTasks:     1,
		CompletedTasks: 1,
		FailedTasks:    0,
	}, nil
}

func (s *fakeAiService) ListDrafts(userID string) ([]aidto.DraftPayload, error) {
	s.userIDs = append(s.userIDs, userID)
	return []aidto.DraftPayload{{
		ID:         "draft-1",
		TaskID:     "task-1",
		DraftType:  "card_draft",
		TargetType: "deck",
		TargetID:   "deck-1",
		Status:     "pending",
		Front:      "Question",
		Back:       "Answer",
		CreatedAt:  "2026-06-02T12:00:00Z",
		UpdatedAt:  "2026-06-02T12:00:00Z",
	}}, nil
}

func withAiUser(handler func(*gin.Context)) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Set(middleware.ContextUserIDKey, "user-1")
		handler(ctx)
	}
}

func TestAiReadHandlersUseAuthenticatedUserAndEnvelope(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeAiService{}
	handler := NewHandler(service)
	router := gin.New()
	router.GET("/ai/tasks", withAiUser(handler.ListTasks))
	router.GET("/ai/usage", withAiUser(handler.UsageSummary))
	router.GET("/ai/drafts", withAiUser(handler.ListDrafts))

	for _, path := range []string{"/ai/tasks", "/ai/usage", "/ai/drafts"} {
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, path, nil))

		if recorder.Code != http.StatusOK {
			t.Fatalf("expected 200 for %s, got %d: %s", path, recorder.Code, recorder.Body.String())
		}
		var payload struct {
			Success bool            `json:"success"`
			Data    json.RawMessage `json:"data"`
		}
		if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
			t.Fatalf("decode response for %s: %v", path, err)
		}
		if !payload.Success || len(payload.Data) == 0 {
			t.Fatalf("expected success envelope for %s, got %#v", path, payload)
		}
	}

	if len(service.userIDs) != 3 {
		t.Fatalf("expected three service calls, got %#v", service.userIDs)
	}
	for _, userID := range service.userIDs {
		if userID != "user-1" {
			t.Fatalf("expected authenticated user user-1, got %#v", service.userIDs)
		}
	}
}
