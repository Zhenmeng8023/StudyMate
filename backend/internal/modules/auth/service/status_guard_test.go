package service

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	adminmodel "studymate/backend/internal/modules/admin/model"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	authdto "studymate/backend/internal/modules/auth/dto"
	authmodel "studymate/backend/internal/modules/auth/model"
	authrepo "studymate/backend/internal/modules/auth/repository"
	usermodel "studymate/backend/internal/modules/user/model"
	userrepo "studymate/backend/internal/modules/user/repository"
	"studymate/backend/internal/pkg/apperrors"
	"studymate/backend/internal/pkg/security"
)

func newAuthStatusGuardTestService(t *testing.T) (*Service, *gorm.DB) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", strings.ReplaceAll(t.Name(), "/", "-"))
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.AutoMigrate(&usermodel.User{}, &authmodel.RefreshToken{}, &adminmodel.AuditLog{}); err != nil {
		t.Fatalf("auto migrate auth status guard db: %v", err)
	}

	service := NewService(
		userrepo.NewRepository(db),
		authrepo.NewRefreshTokenRepository(db),
		adminrepo.NewAuditLogRepository(db),
		security.NewTokenManager("studymate-test-secret", time.Hour, 24*time.Hour),
		24*time.Hour,
	)

	return service, db
}

func TestLoginRejectsDisabledUser(t *testing.T) {
	service, db := newAuthStatusGuardTestService(t)

	passwordHash, err := security.HashPassword("Password123")
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}

	if err := db.Create(&usermodel.User{
		ID:           "user-1",
		Username:     "alice",
		Email:        "alice@example.test",
		PasswordHash: passwordHash,
		DisplayName:  "Alice",
		Role:         "user",
		Status:       "disabled",
	}).Error; err != nil {
		t.Fatalf("seed disabled user: %v", err)
	}

	_, err = service.Login(authdto.LoginRequest{
		Login:    "alice",
		Password: "Password123",
	})
	appErr := apperrors.As(err)
	if appErr.Status != 403 || appErr.Code != "user_disabled" {
		t.Fatalf("expected user_disabled, got %#v", appErr)
	}
}

func TestRefreshRejectsDisabledUser(t *testing.T) {
	service, db := newAuthStatusGuardTestService(t)

	passwordHash, err := security.HashPassword("Password123")
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}

	user := &usermodel.User{
		ID:           "user-2",
		Username:     "bob",
		Email:        "bob@example.test",
		PasswordHash: passwordHash,
		DisplayName:  "Bob",
		Role:         "user",
		Status:       "disabled",
	}
	if err := db.Create(user).Error; err != nil {
		t.Fatalf("seed disabled user: %v", err)
	}

	tokenManager := security.NewTokenManager("studymate-test-secret", time.Hour, 24*time.Hour)
	refreshToken, expiresAt := tokenManager.GenerateRefreshToken()
	if err := db.Create(&authmodel.RefreshToken{
		UserID:    user.ID,
		TokenHash: tokenManager.HashToken(refreshToken),
		ExpiresAt: expiresAt,
	}).Error; err != nil {
		t.Fatalf("seed refresh token: %v", err)
	}

	_, err = service.Refresh(authdto.RefreshRequest{RefreshToken: refreshToken})
	appErr := apperrors.As(err)
	if appErr.Status != 403 || appErr.Code != "user_disabled" {
		t.Fatalf("expected user_disabled, got %#v", appErr)
	}
}
