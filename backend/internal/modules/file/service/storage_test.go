package service

import (
	"errors"
	"gorm.io/gorm"
	"os"
	"path/filepath"
	"testing"

	filemodel "studymate/backend/internal/modules/file/model"
	"studymate/backend/internal/pkg/apperrors"
)

func TestUploadRemovesOriginalAfterFinalDatabaseFailure(t *testing.T) {
	s, db, dir := uploadService(t, true)
	db.Callback().Create().Before("gorm:create").Register("test:reject-file", func(tx *gorm.DB) {
		if tx.Statement.Table == "file_records" {
			tx.AddError(errors.New("injected persistence failure"))
		}
	})
	if _, err := s.Upload("owner", uploadHeader(t, "failed.pdf", []byte("%PDF-1.7\npersistence"))); err == nil {
		t.Fatal("expected database failure")
	}
	var count int64
	db.Model(&filemodel.FileRecord{}).Count(&count)
	if count != 0 {
		t.Fatal("failed file record committed")
	}
	filepath.WalkDir(dir, func(_ string, entry os.DirEntry, err error) error {
		if err != nil {
			t.Fatal(err)
		}
		if !entry.IsDir() {
			t.Fatal("failed persistence left original")
		}
		return nil
	})
}

func TestUploadQuotaRejectsAndPreservesExactBoundary(t *testing.T) {
	s, db, dir := uploadService(t, true)
	content := []byte("%PDF-1.7\nquota")
	s.quotaBytes = int64(len(content))
	if _, err := s.Upload("owner", uploadHeader(t, "first.pdf", content)); err != nil {
		t.Fatal(err)
	}
	if _, err := s.Upload("owner", uploadHeader(t, "second.pdf", content)); err == nil || apperrors.As(err).Code != "storage_quota_exceeded" {
		t.Fatalf("quota result: %v", err)
	}
	var count int64
	db.Model(&filemodel.FileRecord{}).Count(&count)
	if count != 1 {
		t.Fatalf("records=%d", count)
	}
	files := 0
	filepath.WalkDir(dir, func(_ string, entry os.DirEntry, err error) error {
		if err != nil {
			t.Fatal(err)
		}
		if !entry.IsDir() {
			files++
		}
		return nil
	})
	if files != 1 {
		t.Fatalf("disk files=%d", files)
	}
}

func TestUploadUsesWrittenBytesAndCleansFinalQuotaRejection(t *testing.T) {
	s, db, dir := uploadService(t, true)
	s.quotaBytes = 8
	header := uploadHeader(t, "actual.pdf", []byte("%PDF-1.7\nactual content larger than header"))
	header.Size = 5
	if _, err := s.Upload("owner", header); err == nil || apperrors.As(err).Code != "storage_quota_exceeded" {
		t.Fatalf("final quota result: %v", err)
	}
	var count int64
	db.Model(&filemodel.FileRecord{}).Count(&count)
	if count != 0 {
		t.Fatalf("records=%d", count)
	}
	filepath.WalkDir(dir, func(_ string, entry os.DirEntry, err error) error {
		if err != nil {
			t.Fatal(err)
		}
		if !entry.IsDir() {
			t.Fatal("rejected upload left an original")
		}
		return nil
	})
}

func TestStorageOverviewReturnsAtMostTwentyStableOwnerFiles(t *testing.T) {
	s, db, _ := uploadService(t, true)
	for _, sql := range []string{"CREATE TABLE materials (attachment_file_id TEXT, cover_file_id TEXT)", "CREATE TABLE graphs (thumbnail_file_id TEXT)", "CREATE TABLE diagram_templates (preview_file_id TEXT)"} {
		db.Exec(sql)
	}
	for i := 0; i < 24; i++ {
		db.Create(&filemodel.FileRecord{OwnerUserID: "owner", OriginalName: "pending.pdf", Size: 1})
	}
	result, err := s.GetStorage("owner")
	if err != nil || result.UnlinkedFileCount != 24 || len(result.UnlinkedFiles) != 20 {
		t.Fatalf("result=%+v err=%v", result, err)
	}
	if _, err := s.GetStorage(""); err == nil || apperrors.As(err).Status != 401 {
		t.Fatal("anonymous storage accepted")
	}
}

func TestStorageOverviewOwnerAndExplicitReferences(t *testing.T) {
	s, db, _ := uploadService(t, true)
	for _, statement := range []string{
		"CREATE TABLE materials (attachment_file_id TEXT, cover_file_id TEXT, status TEXT)",
		"CREATE TABLE graphs (thumbnail_file_id TEXT)",
		"CREATE TABLE diagram_templates (preview_file_id TEXT)",
	} {
		if err := db.Exec(statement).Error; err != nil {
			t.Fatal(err)
		}
	}
	for _, file := range []filemodel.FileRecord{
		{ID: "archived", OwnerUserID: "owner", Size: 10}, {ID: "graph", OwnerUserID: "owner", Size: 20},
		{ID: "preview", OwnerUserID: "owner", Size: 30}, {ID: "free", OwnerUserID: "owner", Size: 40},
		{ID: "foreign", OwnerUserID: "other", Size: 900},
	} {
		if err := db.Create(&file).Error; err != nil {
			t.Fatal(err)
		}
	}
	db.Exec("INSERT INTO materials VALUES ('archived','archived','archived'), ('archived','','approved')")
	db.Exec("INSERT INTO graphs VALUES ('graph')")
	db.Exec("INSERT INTO diagram_templates VALUES ('preview')")
	result, err := s.GetStorage("owner")
	if err != nil {
		t.Fatal(err)
	}
	if result.UsedBytes != 100 || result.FileCount != 4 || result.UnlinkedBytes != 40 || result.UnlinkedFileCount != 1 || result.RemainingBytes != result.QuotaBytes-100 {
		t.Fatalf("overview=%+v", result)
	}
}

func TestStorageOverviewFailsClosedAndOverQuotaRemainingIsZero(t *testing.T) {
	s, db, _ := uploadService(t, true)
	if _, err := s.GetStorage("owner"); err == nil {
		t.Fatal("missing reference tables must not report empty storage")
	}
	for _, statement := range []string{"CREATE TABLE materials (attachment_file_id TEXT, cover_file_id TEXT)", "CREATE TABLE graphs (thumbnail_file_id TEXT)", "CREATE TABLE diagram_templates (preview_file_id TEXT)"} {
		db.Exec(statement)
	}
	db.Create(&filemodel.FileRecord{OwnerUserID: "owner", Size: 100})
	s.quotaBytes = 20
	result, err := s.GetStorage("owner")
	if err != nil || result.RemainingBytes != 0 {
		t.Fatalf("overview=%+v error=%v", result, err)
	}
}
