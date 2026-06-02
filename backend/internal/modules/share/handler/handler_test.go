package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	sharedto "studymate/backend/internal/modules/share/dto"
)

type fakeShareService struct {
	ownerID string
	request sharedto.CreateLinkRequest
}

func (s *fakeShareService) Create(ownerUserID string, request sharedto.CreateLinkRequest) (*sharedto.LinkPayload, error) {
	s.ownerID = ownerUserID
	s.request = request
	return &sharedto.LinkPayload{
		ID:          "share-1",
		OwnerUserID: ownerUserID,
		TargetType:  request.TargetType,
		TargetID:    request.TargetID,
		Mode:        request.Mode,
		Token:       "token-1",
		Status:      "active",
		URL:         "/share/token-1",
		CreatedAt:   "2026-06-02T12:00:00Z",
	}, nil
}

func (s *fakeShareService) List(ownerUserID string) ([]sharedto.LinkPayload, error) {
	return []sharedto.LinkPayload{{ID: "share-1", OwnerUserID: ownerUserID}}, nil
}

func (s *fakeShareService) Revoke(ownerUserID string, linkID string) error {
	return nil
}

func (s *fakeShareService) Resolve(token string) (*sharedto.PublicResolvePayload, error) {
	return &sharedto.PublicResolvePayload{Token: token, ReadOnly: true}, nil
}

func TestCreateShareLinkUsesAuthenticatedOwnerAndRequestBody(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeShareService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/share-links", func(ctx *gin.Context) {
		ctx.Set(middleware.ContextUserIDKey, "user-1")
		handler.Create(ctx)
	})

	body := bytes.NewBufferString(`{"targetType":"note","targetId":"note-1","mode":"token","expiresAt":"2026-06-09T12:00:00Z"}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/share-links", body))

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" {
		t.Fatalf("expected owner user-1, got %q", service.ownerID)
	}
	if service.request.TargetType != "note" || service.request.TargetID != "note-1" || service.request.Mode != "token" {
		t.Fatalf("unexpected create request: %#v", service.request)
	}

	var payload struct {
		Success bool                   `json:"success"`
		Data    sharedto.LinkPayload   `json:"data"`
		Error   map[string]interface{} `json:"error"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !payload.Success || payload.Data.URL != "/share/token-1" {
		t.Fatalf("expected created link payload, got %#v", payload)
	}
}
