package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"studymate/backend/internal/middleware"
	aidto "studymate/backend/internal/modules/ai/dto"
	carddto "studymate/backend/internal/modules/card/dto"
	readerdto "studymate/backend/internal/modules/reader/dto"
)

type fakeReaderService struct {
	ownerID         string
	materialID      string
	progressRequest readerdto.UpdateProgressRequest
	annotationReq   readerdto.CreateAnnotationRequest
	annotationIDs   []string
}

func (s *fakeReaderService) GetState(ownerUserID string, materialID string) (*readerdto.ReaderStateResponse, error) {
	s.ownerID = ownerUserID
	s.materialID = materialID
	return &readerdto.ReaderStateResponse{MaterialID: materialID}, nil
}

func (s *fakeReaderService) UpdateProgress(ownerUserID string, materialID string, request readerdto.UpdateProgressRequest) (*readerdto.ReaderStateResponse, error) {
	s.ownerID = ownerUserID
	s.materialID = materialID
	s.progressRequest = request
	return &readerdto.ReaderStateResponse{
		MaterialID:      materialID,
		CurrentPage:     request.CurrentPage,
		TotalPages:      request.TotalPages,
		ProgressPercent: request.ProgressPercent,
		Bookmarks:       request.Bookmarks,
	}, nil
}

func (s *fakeReaderService) CreateAnnotation(ownerUserID string, materialID string, request readerdto.CreateAnnotationRequest) (*readerdto.AnnotationSummary, error) {
	s.ownerID = ownerUserID
	s.materialID = materialID
	s.annotationReq = request
	return &readerdto.AnnotationSummary{
		ID:         "annotation-1",
		MaterialID: materialID,
		Page:       request.Page,
		Quote:      request.Quote,
		Comment:    request.Comment,
		Color:      request.Color,
		Rects:      request.Rects,
	}, nil
}

func (s *fakeReaderService) DeleteAnnotation(ownerUserID string, materialID string, annotationID string) error {
	s.ownerID = ownerUserID
	s.materialID = materialID
	s.annotationIDs = []string{annotationID}
	return nil
}

func (s *fakeReaderService) GenerateCardDrafts(ownerUserID string, materialID string, annotationIDs []string) ([]carddto.CardDraftPayload, error) {
	s.ownerID = ownerUserID
	s.materialID = materialID
	s.annotationIDs = annotationIDs
	return []carddto.CardDraftPayload{}, nil
}

func (s *fakeReaderService) GenerateGraphDrafts(ownerUserID string, materialID string, annotationIDs []string) ([]aidto.DraftPayload, error) {
	s.ownerID = ownerUserID
	s.materialID = materialID
	s.annotationIDs = annotationIDs
	return []aidto.DraftPayload{{ID: "draft-1", DraftType: "graph_change", Status: "pending"}}, nil
}

func withReaderUser(handler func(*gin.Context)) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Set(middleware.ContextUserIDKey, "user-1")
		handler(ctx)
	}
}

func TestUpdateProgressUsesAuthenticatedUserAndBody(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeReaderService{}
	handler := NewHandler(service)
	router := gin.New()
	router.PUT("/materials/:id/reader/progress", withReaderUser(handler.UpdateProgress))

	body := bytes.NewBufferString(`{"currentPage":3,"totalPages":10,"progressPercent":30,"bookmarks":[1,3]}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPut, "/materials/material-1/reader/progress", body))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" || service.materialID != "material-1" {
		t.Fatalf("expected authenticated owner and material id, got owner=%q material=%q", service.ownerID, service.materialID)
	}
	if service.progressRequest.CurrentPage != 3 || service.progressRequest.TotalPages != 10 || len(service.progressRequest.Bookmarks) != 2 {
		t.Fatalf("unexpected progress request: %#v", service.progressRequest)
	}
}

func TestCreateAnnotationPassesRectsAndReturnsCreatedEnvelope(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeReaderService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/materials/:id/reader/annotations", withReaderUser(handler.CreateAnnotation))

	body := bytes.NewBufferString(`{"page":3,"quote":"Highlighted quote","comment":"Useful note","color":"amber","rects":[{"page":3,"x":0,"y":0,"width":1,"height":0.08}]}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/materials/material-1/reader/annotations", body))

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.annotationReq.Page != 3 || len(service.annotationReq.Rects) != 1 || service.annotationReq.Rects[0].Height != 0.08 {
		t.Fatalf("unexpected annotation request: %#v", service.annotationReq)
	}

	var payload struct {
		Success bool                        `json:"success"`
		Data    readerdto.AnnotationSummary `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !payload.Success || payload.Data.ID != "annotation-1" || payload.Data.Page != 3 {
		t.Fatalf("unexpected response envelope: %#v", payload)
	}
}

func TestGenerateGraphDraftsUsesAnnotationIDs(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeReaderService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/materials/:id/reader/annotations/generate-graph-drafts", withReaderUser(handler.GenerateGraphDrafts))

	body := bytes.NewBufferString(`{"annotationIds":["annotation-1","annotation-2"]}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/materials/material-1/reader/annotations/generate-graph-drafts", body))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" || service.materialID != "material-1" {
		t.Fatalf("expected authenticated owner and material id, got owner=%q material=%q", service.ownerID, service.materialID)
	}
	if len(service.annotationIDs) != 2 || service.annotationIDs[0] != "annotation-1" || service.annotationIDs[1] != "annotation-2" {
		t.Fatalf("unexpected annotation ids: %#v", service.annotationIDs)
	}
}
