package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	usermodel "studymate/backend/internal/modules/user/model"
	userrepo "studymate/backend/internal/modules/user/repository"
	"studymate/backend/internal/pkg/security"
)

func newAuthMiddlewareTestContext(t *testing.T) (*gorm.DB, *userrepo.Repository, *security.TokenManager) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", strings.ReplaceAll(t.Name(), "/", "-"))
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(&usermodel.User{}); err != nil {
		t.Fatalf("auto migrate users: %v", err)
	}

	return db, userrepo.NewRepository(db), security.NewTokenManager("studymate-test-secret", time.Hour, 24*time.Hour)
}

func TestAuthenticateRejectsDisabledUser(t *testing.T) {
	db, users, tokenManager := newAuthMiddlewareTestContext(t)

	if err := db.Create(&usermodel.User{
		ID:           "user-1",
		Username:     "alice",
		Email:        "alice@example.test",
		PasswordHash: "hash",
		DisplayName:  "Alice",
		Role:         "user",
		Status:       "disabled",
	}).Error; err != nil {
		t.Fatalf("seed user: %v", err)
	}

	token, _, err := tokenManager.GenerateAccessToken("user-1", "alice", "user")
	if err != nil {
		t.Fatalf("generate access token: %v", err)
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(Authenticate(tokenManager, users))
	router.GET("/protected", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"ok": true})
	})

	request := httptest.NewRequest(http.MethodGet, "/protected", nil)
	request.Header.Set("Authorization", "Bearer "+token)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for disabled user, got %d with body %s", recorder.Code, recorder.Body.String())
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
	if payload.Success || payload.Error.Code != "user_disabled" {
		t.Fatalf("expected user_disabled payload, got %#v", payload)
	}
}

func TestAuthenticateUsesCurrentRoleFromDatabase(t *testing.T) {
	db, users, tokenManager := newAuthMiddlewareTestContext(t)

	if err := db.Create(&usermodel.User{
		ID:           "user-2",
		Username:     "bob",
		Email:        "bob@example.test",
		PasswordHash: "hash",
		DisplayName:  "Bob",
		Role:         "user",
		Status:       "active",
	}).Error; err != nil {
		t.Fatalf("seed user: %v", err)
	}

	token, _, err := tokenManager.GenerateAccessToken("user-2", "bob", "admin")
	if err != nil {
		t.Fatalf("generate access token: %v", err)
	}

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(Authenticate(tokenManager, users), RequireRole("admin"))
	router.GET("/admin-only", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{"ok": true})
	})

	request := httptest.NewRequest(http.MethodGet, "/admin-only", nil)
	request.Header.Set("Authorization", "Bearer "+token)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected 403 when persisted role is user, got %d with body %s", recorder.Code, recorder.Body.String())
	}
}
