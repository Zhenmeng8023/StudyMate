package service

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	graphrepo "studymate/backend/internal/modules/graph/repository"
)

func openDiagramTemplateStateTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", strings.ReplaceAll(t.Name(), "/", "-"))
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite db: %v", err)
	}

	if err := db.Exec(`
		CREATE TABLE diagram_templates (
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
		);
	`).Error; err != nil {
		t.Fatalf("create diagram_templates table: %v", err)
	}

	return db
}

func TestListDiagramTemplatesHidesUnpublishedOverrides(t *testing.T) {
	db := openDiagramTemplateStateTestDB(t)
	now := time.Date(2026, 7, 9, 13, 15, 0, 0, time.UTC)
	if err := db.Exec(`
		INSERT INTO diagram_templates (id, name, category, description, source_type, status, created_by, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, "uml-class-diagram", "UML 绫诲浘", "uml", "hide from learner list", "system", "unpublished", "admin-1", now, now).Error; err != nil {
		t.Fatalf("seed template state: %v", err)
	}

	service := NewService(graphrepo.NewRepository(db), nil, nil, nil, nil)
	templates := service.ListDiagramTemplates()

	for _, template := range templates {
		if template.ID == "uml-class-diagram" {
			t.Fatalf("expected unpublished template to be hidden from learner list, got %#v", template)
		}
	}

	var learningTemplateFound bool
	for _, template := range templates {
		if template.ID == "learning-material-map" {
			learningTemplateFound = true
		}
	}
	if !learningTemplateFound {
		t.Fatal("expected published default template to remain visible")
	}
}
