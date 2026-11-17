package service

import (
	"github.com/google/uuid"
	"os"
	"path/filepath"
	"runtime"
	storage "studymate/backend/internal/migrations/mysql"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	filemodel "studymate/backend/internal/modules/file/model"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialrepo "studymate/backend/internal/modules/material/repository"
	"testing"
)

func TestMySQLOfficialCatalogMigrationAndLifecycle(t *testing.T) {
	dsn := os.Getenv("STUDYMATE_MYSQL_TEST_DSN")
	if dsn == "" {
		t.Skip("set STUDYMATE_MYSQL_TEST_DSN for isolated catalog verification")
	}
	db := isolatedLibraryMySQL(t, dsn)
	for range 2 {
		if err := storage.Apply(db); err != nil {
			t.Fatal(err)
		}
	}
	var count int64
	if err := db.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='materials' AND column_name IN ('material_type','author','source_url','publication_year','edition','license_status','archive_reason')").Scan(&count).Error; err != nil || count != 7 {
		t.Fatalf("metadata columns=%d err=%v", count, err)
	}
	owner := uuid.NewString()
	path := filepath.Join(t.TempDir(), "official.pdf")
	if err := os.WriteFile(path, []byte("%PDF-official"), 0600); err != nil {
		t.Fatal(err)
	}
	file := filemodel.FileRecord{OwnerUserID: owner, OriginalName: "official.pdf", StoredName: "official.pdf", MimeType: "application/pdf", Size: 13, Path: path}
	if err := db.Create(&file).Error; err != nil {
		t.Fatal(err)
	}
	s := NewService(materialrepo.NewRepository(db), adminrepo.NewAuditLogRepository(db))
	input := libraryRequest()
	input.AttachmentFileID = file.ID
	input.Author = "Catalog Author"
	input.MaterialType = "paper"
	input.SourceURL = "https://example.test/paper"
	input.Edition = "v1"
	input.LicenseStatus = "authorized"
	item, err := s.CreateOfficial(owner, "admin", input)
	if err != nil {
		t.Fatal(err)
	}
	page, err := s.ListOfficialCatalog("", materialdto.OfficialCatalogQuery{Page: 1, PageSize: 20, Q: "Catalog Author", Sort: "title"}, false)
	if err != nil || page.Total != 1 {
		t.Fatalf("catalog:%#v %v", page, err)
	}
	if _, err := s.ChangeOfficialStatus(owner, "admin", item.ID, materialdto.OfficialStatusRequest{Status: "archived", Reason: "Correction"}); err != nil {
		t.Fatal(err)
	}
	if _, err := s.ChangeOfficialStatus(owner, "admin", item.ID, materialdto.OfficialStatusRequest{Status: "approved"}); err != nil {
		t.Fatal(err)
	}
	_, thisFile, _, _ := runtime.Caller(0)
	down, err := os.ReadFile(filepath.Join(filepath.Dir(thisFile), "..", "..", "..", "migrations", "mysql", "011_official_material_catalog.down.sql"))
	if err != nil {
		t.Fatal(err)
	}
	for range 2 {
		if err := db.Exec(string(down)).Error; err != nil {
			t.Fatal(err)
		}
	}
	if err := db.Table("file_records").Where("id = ?", file.ID).Count(&count).Error; err != nil || count != 1 {
		t.Fatal("rollback lost original identity")
	}
	if err := storage.Apply(db); err != nil {
		t.Fatal(err)
	}
	if _, err := s.GetLibraryMaterial(owner, item.ID); err != nil {
		t.Fatal(err)
	}
}
