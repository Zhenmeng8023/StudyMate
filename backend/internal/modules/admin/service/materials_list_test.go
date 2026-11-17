package service

import (
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	materialrepo "studymate/backend/internal/modules/material/repository"
)

func openMaterialListTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}

	statements := []string{
		`CREATE TABLE users (
			id TEXT PRIMARY KEY,
			display_name TEXT NOT NULL
		);`,
		`CREATE TABLE file_records (
			id TEXT PRIMARY KEY,
			original_name TEXT NOT NULL
		);`,
		`CREATE TABLE materials (
			id TEXT PRIMARY KEY,
			owner_user_id TEXT NOT NULL,
			library_scope TEXT NOT NULL DEFAULT 'community',
			title TEXT NOT NULL,
			description TEXT NOT NULL,
			category TEXT NOT NULL,
			attachment_file_id TEXT,
			status TEXT NOT NULL,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL
		);`,
	}

	for _, statement := range statements {
		if err := db.Exec(statement).Error; err != nil {
			t.Fatalf("exec schema: %v", err)
		}
	}

	return db
}

func TestPersonalMaterialsAreExcludedFromGovernanceAndCannotBePublished(t *testing.T) {
	db := openMaterialListTestDB(t)
	now := time.Now().UTC()
	for _, scope := range []string{"personal", "official", "community"} {
		if err := db.Exec(`INSERT INTO materials (id,owner_user_id,library_scope,title,description,category,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`, scope, "owner", scope, "title", "description", "book", "pending", now, now).Error; err != nil {
			t.Fatal(err)
		}
	}
	s := &Service{db: db, materials: materialrepo.NewRepository(db)}
	rows, err := s.ListMaterials(20)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 2 {
		t.Fatalf("expected only official/community rows, got %#v", rows)
	}
	for _, row := range rows {
		if row.ID == "personal" {
			t.Fatal("private material leaked to governance")
		}
	}
	for _, status := range []string{"approved", "hidden", "rejected", "pending"} {
		if err := s.ModerateMaterial("admin", "personal", status, "moderation"); err == nil {
			t.Fatalf("personal material accepted moderation status %q", status)
		}
	}
	var status string
	if err := db.Table("materials").Where("id = ?", "personal").Select("status").Scan(&status).Error; err != nil {
		t.Fatal(err)
	}
	if status != "pending" {
		t.Fatalf("private material changed status: %s", status)
	}
}

func TestListMaterialsReturnsRealGovernanceRows(t *testing.T) {
	db := openMaterialListTestDB(t)

	if err := db.Exec(`INSERT INTO users (id, display_name) VALUES (?, ?)`, "user-1", "Alice").Error; err != nil {
		t.Fatalf("insert user: %v", err)
	}
	if err := db.Exec(`INSERT INTO file_records (id, original_name) VALUES (?, ?)`, "file-1", "algebra.pdf").Error; err != nil {
		t.Fatalf("insert file: %v", err)
	}

	older := time.Date(2026, 7, 9, 10, 0, 0, 0, time.UTC)
	newer := older.Add(2 * time.Hour)
	if err := db.Exec(`
		INSERT INTO materials (id, owner_user_id, title, description, category, attachment_file_id, status, created_at, updated_at)
		VALUES
		(?, ?, ?, ?, ?, ?, ?, ?, ?),
		(?, ?, ?, ?, ?, ?, ?, ?, ?)
	`,
		"material-1", "user-1", "Linear Algebra", "matrix notes", "math", "file-1", "approved", older, older,
		"material-2", "user-1", "Discrete Math", "graph proofs", "math", "", "hidden", newer, newer,
	).Error; err != nil {
		t.Fatalf("insert materials: %v", err)
	}

	service := &Service{db: db}
	rows, err := service.ListMaterials(20)
	if err != nil {
		t.Fatalf("ListMaterials returned error: %v", err)
	}

	if len(rows) != 2 {
		t.Fatalf("expected 2 rows, got %d", len(rows))
	}
	if rows[0].ID != "material-2" || rows[0].Status != "hidden" {
		t.Fatalf("expected latest material first, got %#v", rows[0])
	}
	if rows[1].ID != "material-1" || rows[1].OwnerName != "Alice" || rows[1].AttachmentName != "algebra.pdf" {
		t.Fatalf("expected joined governance fields, got %#v", rows[1])
	}
}
