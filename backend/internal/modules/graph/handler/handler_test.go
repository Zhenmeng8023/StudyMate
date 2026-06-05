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
	graphdto "studymate/backend/internal/modules/graph/dto"
)

type fakeGraphService struct {
	ownerID          string
	graphID          string
	batchSaveReq     graphdto.GraphBatchSaveRequest
	generateCardsReq graphdto.GraphCardDraftRequest
	restoreReq       graphdto.RestoreGraphRequest
	commitChangesReq graphdto.CommitGraphChangeDraftsRequest
}

func (s *fakeGraphService) ListGraphs(ownerUserID string) ([]graphdto.GraphSummaryPayload, error) {
	s.ownerID = ownerUserID
	return []graphdto.GraphSummaryPayload{}, nil
}

func (s *fakeGraphService) CreateGraph(ownerUserID string, request graphdto.CreateGraphRequest) (*graphdto.GraphDetailPayload, error) {
	s.ownerID = ownerUserID
	return &graphdto.GraphDetailPayload{}, nil
}

func (s *fakeGraphService) GetGraph(ownerUserID string, graphID string) (*graphdto.GraphDetailPayload, error) {
	s.ownerID = ownerUserID
	s.graphID = graphID
	return &graphdto.GraphDetailPayload{}, nil
}

func (s *fakeGraphService) UpdateGraph(ownerUserID string, graphID string, request graphdto.UpdateGraphRequest) (*graphdto.GraphSummaryPayload, error) {
	s.ownerID = ownerUserID
	s.graphID = graphID
	return &graphdto.GraphSummaryPayload{}, nil
}

func (s *fakeGraphService) DeleteGraph(ownerUserID string, graphID string) error {
	s.ownerID = ownerUserID
	s.graphID = graphID
	return nil
}

func (s *fakeGraphService) BatchSave(ownerUserID string, graphID string, request graphdto.GraphBatchSaveRequest) (*graphdto.GraphDetailPayload, error) {
	s.ownerID = ownerUserID
	s.graphID = graphID
	s.batchSaveReq = request
	return &graphdto.GraphDetailPayload{}, nil
}

func (s *fakeGraphService) ListSnapshots(ownerUserID string, graphID string) ([]graphdto.GraphSnapshotPayload, error) {
	s.ownerID = ownerUserID
	s.graphID = graphID
	return []graphdto.GraphSnapshotPayload{}, nil
}

func (s *fakeGraphService) RestoreSnapshot(ownerUserID string, graphID string, request graphdto.RestoreGraphRequest) (*graphdto.GraphDetailPayload, error) {
	s.ownerID = ownerUserID
	s.graphID = graphID
	s.restoreReq = request
	return &graphdto.GraphDetailPayload{}, nil
}

func (s *fakeGraphService) ImportMarkdown(ownerUserID string, graphID string, request graphdto.ImportGraphRequest) (*graphdto.GraphDetailPayload, error) {
	s.ownerID = ownerUserID
	s.graphID = graphID
	return &graphdto.GraphDetailPayload{}, nil
}

func (s *fakeGraphService) ImportMermaid(ownerUserID string, graphID string, request graphdto.ImportGraphRequest) (*graphdto.GraphDetailPayload, error) {
	s.ownerID = ownerUserID
	s.graphID = graphID
	return &graphdto.GraphDetailPayload{}, nil
}

func (s *fakeGraphService) ValidateGraph(ownerUserID string, graphID string) (*graphdto.GraphValidationResponse, error) {
	s.ownerID = ownerUserID
	s.graphID = graphID
	return &graphdto.GraphValidationResponse{Issues: []graphdto.GraphValidationIssuePayload{}}, nil
}

func (s *fakeGraphService) GenerateCardDrafts(ownerUserID string, graphID string, request graphdto.GraphCardDraftRequest) ([]graphdto.GraphCardDraftPayload, error) {
	s.ownerID = ownerUserID
	s.graphID = graphID
	s.generateCardsReq = request
	return []graphdto.GraphCardDraftPayload{}, nil
}

func (s *fakeGraphService) CommitCardDrafts(ownerUserID string, graphID string, request graphdto.CommitGraphCardDraftsRequest) ([]carddto.CardPayload, error) {
	s.ownerID = ownerUserID
	s.graphID = graphID
	return []carddto.CardPayload{}, nil
}

func TestBatchSavePassesGraphDocumentToService(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeGraphService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/graphs/:id/batch-save", withGraphUser(handler.BatchSave))

	body := bytes.NewBufferString(`{
		"title":"Knowledge Graph",
		"description":"updated",
		"summary":"手动保存节点编辑",
		"document":{
			"graphId":"graph-1",
			"version":2,
			"schemaVersion":1,
			"viewport":{"x":0,"y":0,"zoom":1},
			"nodes":[{"id":"node-1","type":"url","title":"URL","x":0,"y":0,"width":220,"height":120,"source":{"type":"material","id":"material-1"}}],
			"edges":[],
			"groups":[],
			"theme":{},
			"metadata":{}
		}
	}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/graphs/graph-1/batch-save", body))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" || service.graphID != "graph-1" {
		t.Fatalf("expected owner and graph id to pass through, got owner=%q graph=%q", service.ownerID, service.graphID)
	}
	if service.batchSaveReq.Summary != "手动保存节点编辑" || len(service.batchSaveReq.Document.Nodes) != 1 {
		t.Fatalf("unexpected batch save request: %#v", service.batchSaveReq)
	}
	if service.batchSaveReq.Document.Nodes[0].Source == nil || service.batchSaveReq.Document.Nodes[0].Source.ID != "material-1" {
		t.Fatalf("expected source relation in document payload: %#v", service.batchSaveReq.Document.Nodes[0])
	}
}

func TestBatchSaveRejectsInvalidRequestBeforeService(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeGraphService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/graphs/:id/batch-save", withGraphUser(handler.BatchSave))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/graphs/graph-1/batch-save", bytes.NewBufferString(`{"title":"x"}`)))

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "" || service.graphID != "" {
		t.Fatalf("service should not be called for invalid request, got owner=%q graph=%q", service.ownerID, service.graphID)
	}
}

func TestRestoreSnapshotPassesVersionToService(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeGraphService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/graphs/:id/restore", withGraphUser(handler.RestoreSnapshot))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/graphs/graph-1/restore", bytes.NewBufferString(`{"versionNumber":7}`)))

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.restoreReq.VersionNumber != 7 {
		t.Fatalf("expected version 7, got %#v", service.restoreReq)
	}
}

func TestGenerateCardsRejectsBlankNodeIDs(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeGraphService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/graphs/:id/ai/generate-cards", withGraphUser(handler.GenerateCards))

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/graphs/graph-1/ai/generate-cards", bytes.NewBufferString(`{"nodeIds":[""]}`)))

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if len(service.generateCardsReq.NodeIDs) != 0 {
		t.Fatalf("service should not receive invalid node ids: %#v", service.generateCardsReq)
	}
}

func (s *fakeGraphService) CommitGraphChangeDrafts(ownerUserID string, graphID string, request graphdto.CommitGraphChangeDraftsRequest) (*graphdto.GraphDetailPayload, error) {
	s.ownerID = ownerUserID
	s.graphID = graphID
	s.commitChangesReq = request
	return &graphdto.GraphDetailPayload{
		GraphSummaryPayload: graphdto.GraphSummaryPayload{
			ID:             graphID,
			OwnerUserID:    ownerUserID,
			Title:          "Knowledge Graph",
			Visibility:     "private",
			Status:         "active",
			GraphType:      "knowledge",
			Mode:           "freeform",
			CurrentVersion: 2,
			NodeCount:      3,
			EdgeCount:      1,
			CreatedAt:      "2026-06-02T12:00:00Z",
			UpdatedAt:      "2026-06-02T12:10:00Z",
		},
		Document: graphdto.GraphDocumentPayload{
			GraphID:       graphID,
			Version:       2,
			SchemaVersion: 1,
			Viewport:      graphdto.GraphViewportPayload{Zoom: 1},
			Nodes:         []graphdto.GraphNodePayload{},
			Edges:         []graphdto.GraphEdgePayload{},
			Groups:        []graphdto.GraphGroupPayload{},
		},
	}, nil
}

func (s *fakeGraphService) ListDiagramTemplates() []graphdto.DiagramTemplatePayload {
	return []graphdto.DiagramTemplatePayload{}
}

func withGraphUser(handler func(*gin.Context)) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Set(middleware.ContextUserIDKey, "user-1")
		handler(ctx)
	}
}

func TestCommitGraphChangesPassesDraftSelectionsToService(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeGraphService{}
	handler := NewHandler(service)
	router := gin.New()
	router.POST("/graphs/:id/ai/commit-changes", withGraphUser(handler.CommitGraphChanges))

	body := bytes.NewBufferString(`{"draftIds":["draft-1"],"nodeSelections":[{"draftId":"draft-1","nodeIds":["node-a","node-b"]}]}`)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/graphs/graph-1/ai/commit-changes", body))

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.ownerID != "user-1" || service.graphID != "graph-1" {
		t.Fatalf("expected authenticated owner and graph id, got owner=%q graph=%q", service.ownerID, service.graphID)
	}
	if len(service.commitChangesReq.DraftIDs) != 1 || service.commitChangesReq.DraftIDs[0] != "draft-1" {
		t.Fatalf("unexpected draft ids: %#v", service.commitChangesReq.DraftIDs)
	}
	if len(service.commitChangesReq.NodeSelections) != 1 {
		t.Fatalf("expected one node selection, got %#v", service.commitChangesReq.NodeSelections)
	}
	selection := service.commitChangesReq.NodeSelections[0]
	if selection.DraftID != "draft-1" || len(selection.NodeIDs) != 2 || selection.NodeIDs[0] != "node-a" || selection.NodeIDs[1] != "node-b" {
		t.Fatalf("unexpected node selection: %#v", selection)
	}

	var payload struct {
		Success bool                        `json:"success"`
		Data    graphdto.GraphDetailPayload `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !payload.Success || payload.Data.ID != "graph-1" || payload.Data.CurrentVersion != 2 {
		t.Fatalf("unexpected response envelope: %#v", payload)
	}
}
