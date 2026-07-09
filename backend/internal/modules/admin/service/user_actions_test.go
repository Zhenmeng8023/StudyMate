package service

import (
	"encoding/json"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	"studymate/backend/internal/pkg/apperrors"
)

func newUserActionTestService(t *testing.T) (*Service, *gorm.DB) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", strings.ReplaceAll(t.Name(), "/", "-"))
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	statements := []string{
		`CREATE TABLE users (
			id TEXT PRIMARY KEY,
			username TEXT NOT NULL,
			email TEXT NOT NULL,
			display_name TEXT NOT NULL,
			role TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'active',
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL
		);`,
		`CREATE TABLE audit_logs (
			id TEXT PRIMARY KEY,
			actor_id TEXT NULL,
			action TEXT NOT NULL,
			target TEXT NOT NULL,
			metadata TEXT NULL,
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		);`,
	}

	for _, statement := range statements {
		if err := db.Exec(statement).Error; err != nil {
			t.Fatalf("create test table: %v", err)
		}
	}

	service := NewService(
		db,
		adminrepo.NewAuditLogRepository(db),
		nil,
		nil,
		nil,
		nil,
	)

	return service, db
}

func TestHandleUserRejectsUnsupportedAction(t *testing.T) {
	service, _ := newUserActionTestService(t)

	err := service.HandleUser("admin-1", "user-1", "archive")
	appErr := apperrors.As(err)
	if appErr.Status != 400 || appErr.Code != "invalid_user_action" {
		t.Fatalf("expected invalid_user_action, got %#v", appErr)
	}
}

func TestHandleUserDisablesActiveUserAndWritesAuditLog(t *testing.T) {
	service, db := newUserActionTestService(t)

	now := time.Date(2026, 7, 9, 12, 30, 0, 0, time.UTC)
	if err := db.Exec(`
		INSERT INTO users (id, username, email, display_name, role, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, "user-1", "alice", "alice@example.test", "Alice", "user", "active", now, now).Error; err != nil {
		t.Fatalf("seed user: %v", err)
	}

	if err := service.HandleUser("admin-1", "user-1", "disable"); err != nil {
		t.Fatalf("handle user disable: %v", err)
	}

	var user struct {
		Status string
	}
	if err := db.Table("users").Select("status").Take(&user, "id = ?", "user-1").Error; err != nil {
		t.Fatalf("load user: %v", err)
	}
	if user.Status != "disabled" {
		t.Fatalf("expected disabled status, got %#v", user)
	}

	var audit struct {
		ActorID  string
		Action   string
		Target   string
		Metadata string
	}
	if err := db.Table("audit_logs").Select("actor_id, action, target, metadata").Take(&audit).Error; err != nil {
		t.Fatalf("load audit log: %v", err)
	}
	if audit.ActorID != "admin-1" || audit.Action != "admin.handle.user" || audit.Target != "user" {
		t.Fatalf("unexpected audit row: %#v", audit)
	}

	var metadata map[string]any
	if err := json.Unmarshal([]byte(audit.Metadata), &metadata); err != nil {
		t.Fatalf("decode audit metadata: %v", err)
	}
	if metadata["userId"] != "user-1" || metadata["action"] != "disable" || metadata["previousStatus"] != "active" || metadata["status"] != "disabled" {
		t.Fatalf("unexpected audit metadata: %#v", metadata)
	}
}

func TestHandleUserActivatesDisabledUser(t *testing.T) {
	service, db := newUserActionTestService(t)

	now := time.Date(2026, 7, 9, 12, 35, 0, 0, time.UTC)
	if err := db.Exec(`
		INSERT INTO users (id, username, email, display_name, role, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, "user-2", "bob", "bob@example.test", "Bob", "user", "disabled", now, now).Error; err != nil {
		t.Fatalf("seed user: %v", err)
	}

	if err := service.HandleUser("admin-1", "user-2", "activate"); err != nil {
		t.Fatalf("handle user activate: %v", err)
	}

	var user struct {
		Status string
	}
	if err := db.Table("users").Select("status").Take(&user, "id = ?", "user-2").Error; err != nil {
		t.Fatalf("load user: %v", err)
	}
	if user.Status != "active" {
		t.Fatalf("expected active status, got %#v", user)
	}
}

func TestHandleUserRejectsProtectedAdminAccount(t *testing.T) {
	service, db := newUserActionTestService(t)

	now := time.Date(2026, 7, 9, 12, 40, 0, 0, time.UTC)
	if err := db.Exec(`
		INSERT INTO users (id, username, email, display_name, role, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, "admin-2", "operator", "operator@example.test", "Operator", "admin", "active", now, now).Error; err != nil {
		t.Fatalf("seed admin user: %v", err)
	}

	err := service.HandleUser("admin-1", "admin-2", "disable")
	appErr := apperrors.As(err)
	if appErr.Status != 409 || appErr.Code != "protected_admin_account" {
		t.Fatalf("expected protected_admin_account, got %#v", appErr)
	}
}
