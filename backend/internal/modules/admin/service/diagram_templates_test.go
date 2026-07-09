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
	graphrepo "studymate/backend/internal/modules/graph/repository"
	"studymate/backend/internal/pkg/apperrors"
)

func newDiagramTemplateAdminService(t *testing.T) (*Service, *gorm.DB) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", strings.ReplaceAll(t.Name(), "/", "-"))
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	statements := []string{
		`CREATE TABLE diagram_templates (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			category TEXT NOT NULL,
			description TEXT,
			preview_file_id TEXT,
			graph_id TEXT,
			source_type TEXT,
			status TEXT NOT NULL,
			created_by TEXT,
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
		graphrepo.NewRepository(db),
		nil,
	)

	return service, db
}

func TestListDiagramTemplatesReturnsGovernanceRows(t *testing.T) {
	service, db := newDiagramTemplateAdminService(t)

	now := time.Date(2026, 7, 9, 13, 0, 0, 0, time.UTC)
	if err := db.Exec(`
		INSERT INTO diagram_templates (id, name, category, description, source_type, status, created_by, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, "uml-class-diagram", "UML 绫诲浘", "uml", "娴嬭瘯鐢ㄦā鏉?", "system", "unpublished", "admin-1", now, now).Error; err != nil {
		t.Fatalf("seed template state: %v", err)
	}

	rows, err := service.ListDiagramTemplates(20)
	if err != nil {
		t.Fatalf("ListDiagramTemplates returned error: %v", err)
	}

	if len(rows) < 8 {
		t.Fatalf("expected default template catalog rows, got %d", len(rows))
	}

	var umlRowFound bool
	for _, row := range rows {
		if row.ID != "uml-class-diagram" {
			continue
		}

		umlRowFound = true
		if row.Status != "unpublished" {
			t.Fatalf("expected persisted unpublished status, got %#v", row)
		}
		if row.Mode != "diagram" || row.SourceType != "system" {
			t.Fatalf("expected diagram/system metadata, got %#v", row)
		}
	}

	if !umlRowFound {
		t.Fatal("expected uml-class-diagram in admin governance rows")
	}
}

func TestHandleDiagramTemplateRejectsUnsupportedAction(t *testing.T) {
	service, _ := newDiagramTemplateAdminService(t)

	err := service.HandleDiagramTemplate("admin-1", "uml-class-diagram", "archive")
	appErr := apperrors.As(err)
	if appErr.Status != 400 || appErr.Code != "invalid_diagram_template_action" {
		t.Fatalf("expected invalid_diagram_template_action, got %#v", appErr)
	}
}

func TestHandleDiagramTemplateUnpublishesTemplateAndWritesAuditLog(t *testing.T) {
	service, db := newDiagramTemplateAdminService(t)

	if err := service.HandleDiagramTemplate("admin-1", "uml-class-diagram", "unpublish"); err != nil {
		t.Fatalf("HandleDiagramTemplate returned error: %v", err)
	}

	var template struct {
		Status     string
		SourceType string
		CreatedBy  string
	}
	if err := db.Table("diagram_templates").
		Select("status, source_type, created_by").
		Take(&template, "id = ?", "uml-class-diagram").Error; err != nil {
		t.Fatalf("load template state: %v", err)
	}
	if template.Status != "unpublished" || template.SourceType != "system" || template.CreatedBy != "admin-1" {
		t.Fatalf("unexpected template state: %#v", template)
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
	if audit.ActorID != "admin-1" || audit.Action != "admin.handle.diagram_template" || audit.Target != "diagram_template" {
		t.Fatalf("unexpected audit row: %#v", audit)
	}

	var metadata map[string]any
	if err := json.Unmarshal([]byte(audit.Metadata), &metadata); err != nil {
		t.Fatalf("decode audit metadata: %v", err)
	}
	if metadata["templateId"] != "uml-class-diagram" || metadata["action"] != "unpublish" || metadata["status"] != "unpublished" {
		t.Fatalf("unexpected audit metadata: %#v", metadata)
	}
}
