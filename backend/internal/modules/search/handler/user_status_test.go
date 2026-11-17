package handler

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	materialmodel "studymate/backend/internal/modules/material/model"
	searchservice "studymate/backend/internal/modules/search/service"
	usermodel "studymate/backend/internal/modules/user/model"
	userrepo "studymate/backend/internal/modules/user/repository"
	"studymate/backend/internal/pkg/security"
)

type searchUserLookupStub struct {
	user  *usermodel.User
	err   error
	calls int
}

func TestDisablingUserStopsPrivateMaterialSearchWithExistingToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&usermodel.User{}, &materialmodel.Material{}); err != nil {
		t.Fatal(err)
	}
	user := usermodel.User{ID: "owner", Username: "alice", Email: "alice@example.test", Status: "active"}
	if err := db.Create(&user).Error; err != nil {
		t.Fatal(err)
	}
	for _, material := range []materialmodel.Material{
		{ID: "private", OwnerUserID: "owner", LibraryScope: "personal", Status: "private", Title: "keyword private-only-title", Description: "private-only-summary"},
		{ID: "public", OwnerUserID: "admin", LibraryScope: "official", Status: "approved", Title: "keyword public-title"},
	} {
		if err := db.Create(&material).Error; err != nil {
			t.Fatal(err)
		}
	}
	tokens := security.NewTokenManager("search-status-test-secret", time.Hour, 24*time.Hour)
	token, _, err := tokens.GenerateAccessToken("owner", "alice", "student")
	if err != nil {
		t.Fatal(err)
	}
	handler := NewHandler(searchservice.NewService(db), tokens, userrepo.NewRepository(db))
	router := gin.New()
	router.GET("/search", handler.Search)
	query := func() string {
		request := httptest.NewRequest(http.MethodGet, "/search?q=keyword&types=material", nil)
		request.Header.Set("Authorization", "Bearer "+token)
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, request)
		if recorder.Code != http.StatusOK {
			t.Fatalf("search failed: %d %s", recorder.Code, recorder.Body.String())
		}
		return recorder.Body.String()
	}
	if body := query(); !strings.Contains(body, "private-only-title") {
		t.Fatalf("active owner missing private result: %s", body)
	}
	if err := db.Model(&usermodel.User{}).Where("id = ?", "owner").Update("status", "disabled").Error; err != nil {
		t.Fatal(err)
	}
	body := query()
	if strings.Contains(body, "private-only-title") || strings.Contains(body, "private-only-summary") {
		t.Fatalf("disabled user received private material: %s", body)
	}
	if !strings.Contains(body, "public-title") {
		t.Fatalf("disabled user lost public fallback: %s", body)
	}
}

func (s *searchUserLookupStub) FindByID(id string) (*usermodel.User, error) {
	s.calls++
	return s.user, s.err
}

func TestOptionalSearchIdentityRequiresCurrentActiveUser(t *testing.T) {
	gin.SetMode(gin.TestMode)
	tokens := security.NewTokenManager("search-status-test-secret", time.Hour, 24*time.Hour)
	token, _, err := tokens.GenerateAccessToken("owner", "alice", "student")
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range []struct {
		name   string
		user   *usermodel.User
		err    error
		wantID string
	}{
		{name: "active", user: &usermodel.User{ID: "owner", Status: "active"}, wantID: "owner"},
		{name: "disabled", user: &usermodel.User{ID: "owner", Status: "disabled"}},
		{name: "missing", err: gorm.ErrRecordNotFound},
		{name: "lookup-error", err: errors.New("database unavailable")},
		{name: "nil-user"},
		{name: "unknown-status", user: &usermodel.User{ID: "owner", Status: "pending"}},
		{name: "mismatched-user", user: &usermodel.User{ID: "different-user", Status: "active"}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			service := &fakeSearchService{}
			users := &searchUserLookupStub{user: tc.user, err: tc.err}
			handler := NewHandler(service, tokens, users)
			router := gin.New()
			router.GET("/search", handler.Search)
			request := httptest.NewRequest(http.MethodGet, "/search?q=private", nil)
			request.Header.Set("Authorization", "Bearer "+token)
			recorder := httptest.NewRecorder()
			router.ServeHTTP(recorder, request)
			if recorder.Code != http.StatusOK {
				t.Fatalf("public fallback failed: %d %s", recorder.Code, recorder.Body.String())
			}
			if service.userID != tc.wantID {
				t.Fatalf("expected user scope %q, got %q", tc.wantID, service.userID)
			}
			if users.calls != 1 {
				t.Fatalf("expected one current user lookup, got %d", users.calls)
			}
		})
	}
}

func TestInvalidOptionalSearchTokenDoesNotLookupUser(t *testing.T) {
	gin.SetMode(gin.TestMode)
	tokens := security.NewTokenManager("search-status-test-secret", time.Hour, 24*time.Hour)
	users := &searchUserLookupStub{user: &usermodel.User{ID: "owner", Status: "active"}}
	service := &fakeSearchService{}
	handler := NewHandler(service, tokens, users)
	router := gin.New()
	router.GET("/search", handler.Search)
	request := httptest.NewRequest(http.MethodGet, "/search?q=private", nil)
	request.Header.Set("Authorization", "Bearer invalid-token")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)
	if service.userID != "" || users.calls != 0 {
		t.Fatalf("invalid token resolved identity: id=%q calls=%d", service.userID, users.calls)
	}
}
