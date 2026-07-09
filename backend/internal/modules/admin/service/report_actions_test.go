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

func newReportActionTestService(t *testing.T) (*Service, *gorm.DB) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", strings.ReplaceAll(t.Name(), "/", "-"))
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	statements := []string{
		`CREATE TABLE reports (
			id TEXT PRIMARY KEY,
			reporter_user_id TEXT NOT NULL,
			target_type TEXT NOT NULL,
			target_id TEXT NOT NULL,
			reason TEXT NOT NULL,
			description TEXT NULL,
			status TEXT NOT NULL,
			handled_by TEXT NULL,
			handled_at DATETIME NULL,
			created_at DATETIME NOT NULL
		);`,
		`CREATE TABLE audit_logs (
			id TEXT PRIMARY KEY,
			actor_id TEXT NULL,
			action TEXT NOT NULL,
			target TEXT NOT NULL,
			metadata TEXT NULL,
			created_at DATETIME NOT NULL
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

func TestHandleReportRejectsInvalidStatus(t *testing.T) {
	service, _ := newReportActionTestService(t)

	err := service.HandleReport("admin-1", "report-1", "ignored")
	appErr := apperrors.As(err)
	if appErr.Status != 400 || appErr.Code != "invalid_report_status" {
		t.Fatalf("expected invalid_report_status, got %#v", appErr)
	}
}

func TestHandleReportUpdatesStatusAndWritesAuditLog(t *testing.T) {
	service, db := newReportActionTestService(t)

	if err := db.Exec(`
		INSERT INTO reports (id, reporter_user_id, target_type, target_id, reason, description, status, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, "report-1", "user-1", "post", "post-1", "spam", "duplicate links", "pending", time.Date(2026, 7, 9, 8, 0, 0, 0, time.UTC)).Error; err != nil {
		t.Fatalf("seed report: %v", err)
	}

	if err := service.HandleReport("admin-1", "report-1", "resolved"); err != nil {
		t.Fatalf("handle report: %v", err)
	}

	var report struct {
		Status    string
		HandledBy string
		HandledAt time.Time
	}
	if err := db.Table("reports").
		Select("status, handled_by, handled_at").
		Where("id = ?", "report-1").
		Take(&report).Error; err != nil {
		t.Fatalf("load report: %v", err)
	}

	if report.Status != "resolved" {
		t.Fatalf("expected resolved status, got %q", report.Status)
	}
	if report.HandledBy != "admin-1" {
		t.Fatalf("expected handled_by admin-1, got %q", report.HandledBy)
	}
	if report.HandledAt.IsZero() {
		t.Fatalf("expected handled_at to be set")
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

	if audit.ActorID != "admin-1" || audit.Action != "admin.handle.report" || audit.Target != "report" {
		t.Fatalf("unexpected audit row: %#v", audit)
	}

	var metadata map[string]any
	if err := json.Unmarshal([]byte(audit.Metadata), &metadata); err != nil {
		t.Fatalf("decode audit metadata: %v", err)
	}
	if metadata["reportId"] != "report-1" || metadata["status"] != "resolved" || metadata["previousStatus"] != "pending" {
		t.Fatalf("unexpected audit metadata: %#v", metadata)
	}
}

func TestHandleReportReturnsNotFoundWhenReportMissing(t *testing.T) {
	service, _ := newReportActionTestService(t)

	err := service.HandleReport("admin-1", "missing-report", "dismissed")
	appErr := apperrors.As(err)
	if appErr.Status != 404 || appErr.Code != "report_not_found" {
		t.Fatalf("expected report_not_found, got %#v", appErr)
	}
}
