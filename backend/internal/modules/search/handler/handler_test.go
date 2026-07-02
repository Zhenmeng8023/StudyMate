package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	searchdto "studymate/backend/internal/modules/search/dto"
	"studymate/backend/internal/pkg/apperrors"
)

type fakeSearchService struct {
	query  string
	types  []string
	limit  int
	userID string
	err    error
}

func (s *fakeSearchService) Search(query string, types []string, limit int, userID string) (*searchdto.Response, error) {
	s.query = query
	s.types = types
	s.limit = limit
	s.userID = userID
	if s.err != nil {
		return nil, s.err
	}
	return &searchdto.Response{
		Query: query,
		Total: 1,
		Groups: []searchdto.Group{{
			Type:  "note",
			Count: 1,
			Results: []searchdto.Result{{
				Type:    "note",
				ID:      "note-1",
				Title:   "图谱笔记",
				Summary: "来自测试",
				URL:     "/notes?selected=note-1",
				Source:  "note",
			}},
		}},
	}, nil
}

func TestSearchPassesQueryFiltersAndLimitToService(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeSearchService{}
	handler := NewHandler(service, nil)
	router := gin.New()
	router.GET("/search", handler.Search)

	request := httptest.NewRequest(http.MethodGet, "/search?q=%E5%9B%BE%E8%B0%B1&types=note,graph&limit=7", nil)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if service.query != "图谱" {
		t.Fatalf("expected query to reach service, got %q", service.query)
	}
	if service.limit != 7 {
		t.Fatalf("expected limit 7, got %d", service.limit)
	}
	if len(service.types) != 2 || service.types[0] != "note" || service.types[1] != "graph" {
		t.Fatalf("expected note and graph filters, got %#v", service.types)
	}

	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload["success"] != true {
		t.Fatalf("expected success envelope, got %#v", payload)
	}
}

func TestSearchWithoutTypesUsesDefaultServiceBehavior(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeSearchService{}
	handler := NewHandler(service, nil)
	router := gin.New()
	router.GET("/search", handler.Search)

	request := httptest.NewRequest(http.MethodGet, "/search?q=%E7%AC%94%E8%AE%B0", nil)
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", recorder.Code, recorder.Body.String())
	}
	if len(service.types) != 0 {
		t.Fatalf("expected omitted types to reach service as nil/empty, got %#v", service.types)
	}
	if service.limit != 20 {
		t.Fatalf("expected default limit 20, got %d", service.limit)
	}
}

func TestSearchReturnsServiceErrorsInEnvelope(t *testing.T) {
	gin.SetMode(gin.TestMode)
	service := &fakeSearchService{err: apperrors.New(http.StatusBadRequest, "invalid_search_type", "unsupported")}
	handler := NewHandler(service, nil)
	router := gin.New()
	router.GET("/search", handler.Search)

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/search?q=abc&types=bad", nil))

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", recorder.Code)
	}
	var payload struct {
		Success bool `json:"success"`
		Error   struct {
			Code string `json:"code"`
		} `json:"error"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if payload.Success || payload.Error.Code != "invalid_search_type" {
		t.Fatalf("expected invalid_search_type error envelope, got %#v", payload)
	}
}
