package service

import (
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	mysqldriver "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	storage "studymate/backend/internal/migrations/mysql"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	filemodel "studymate/backend/internal/modules/file/model"
	materialmodel "studymate/backend/internal/modules/material/model"
	materialrepo "studymate/backend/internal/modules/material/repository"
	"studymate/backend/internal/pkg/apperrors"
)

// Opt-in: the supplied account must allow CREATE/DROP DATABASE. The database named
// in its DSN is never opened or modified; every statement targets a UUID test DB.
func TestMySQLMaterialLibrariesMigrationAndLifecycle(t *testing.T) {
	dsn := os.Getenv("STUDYMATE_MYSQL_TEST_DSN")
	if dsn == "" {
		t.Skip("set STUDYMATE_MYSQL_TEST_DSN for isolated real MySQL library verification")
	}
	db := isolatedLibraryMySQL(t, dsn)
	for iteration := 0; iteration < 2; iteration++ {
		if err := storage.Apply(db); err != nil {
			t.Fatalf("up migration iteration %d: %v", iteration, err)
		}
	}
	var columns int64
	if err := db.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'materials' AND column_name IN ('library_scope', 'folder_name')").Scan(&columns).Error; err != nil || columns != 2 {
		t.Fatalf("library columns: count=%d error=%v", columns, err)
	}
	var indexes int64
	if err := db.Raw("SELECT COUNT(DISTINCT index_name) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'materials' AND index_name = 'idx_material_library_owner'").Scan(&indexes).Error; err != nil || indexes != 1 {
		t.Fatalf("idempotent library index: count=%d error=%v", indexes, err)
	}

	owner, foreignOwner, administrator := uuid.NewString(), uuid.NewString(), uuid.NewString()
	legacyID := uuid.NewString()
	if err := db.Exec("INSERT INTO materials (id, owner_user_id, title, description, category, status, created_at, updated_at) VALUES (?, ?, 'Legacy resource', 'Existing public resource', 'book', 'approved', NOW(), NOW())", legacyID, owner).Error; err != nil {
		t.Fatal(err)
	}
	var legacy materialmodel.Material
	if err := db.First(&legacy, "id = ?", legacyID).Error; err != nil || legacy.LibraryScope != "community" {
		t.Fatalf("legacy default scope: %#v error=%v", legacy, err)
	}

	path := filepath.Join(t.TempDir(), "private.pdf")
	if err := os.WriteFile(path, []byte("%PDF-private-library"), 0600); err != nil {
		t.Fatal(err)
	}
	file := filemodel.FileRecord{OwnerUserID: owner, OriginalName: "private.pdf", StoredName: "private.pdf", Path: path, MimeType: "application/pdf", Size: 20}
	if err := db.Create(&file).Error; err != nil {
		t.Fatal(err)
	}
	s := NewService(materialrepo.NewRepository(db), adminrepo.NewAuditLogRepository(db))
	request := libraryRequest()
	request.AttachmentFileID = file.ID
	personal, err := s.CreatePersonal(owner, request)
	if err != nil {
		t.Fatal(err)
	}
	if personal.LibraryScope != "personal" || personal.Status != "private" {
		t.Fatalf("private resource contract: %#v", personal)
	}
	if _, err := s.GetLibraryMaterial(foreignOwner, personal.ID); err == nil || apperrors.As(err).Status != http.StatusNotFound {
		t.Fatalf("foreign owner read private metadata: %v", err)
	}
	if _, err := s.GetLibraryAttachment(foreignOwner, personal.ID); err == nil || apperrors.As(err).Status != http.StatusNotFound {
		t.Fatalf("foreign owner read private original: %v", err)
	}
	if _, err := s.GetApprovedAttachment(personal.ID); err == nil {
		t.Fatal("anonymous attachment endpoint exposed private original")
	}
	if _, err := s.GetLibraryAttachment(owner, personal.ID); err != nil {
		t.Fatalf("owner cannot read private original: %v", err)
	}
	if _, err := s.CreatePersonal(foreignOwner, request); err == nil || apperrors.As(err).Status != http.StatusForbidden {
		t.Fatalf("foreign attachment reference accepted: %v", err)
	}
	if _, err := s.CreateOfficial(owner, "student", libraryRequest()); err == nil || apperrors.As(err).Status != http.StatusForbidden {
		t.Fatalf("student published official material: %v", err)
	}
	official, err := s.CreateOfficial(administrator, "admin", libraryRequest())
	if err != nil {
		t.Fatal(err)
	}
	officialItems, err := s.ListOfficial()
	if err != nil || len(officialItems) != 1 || officialItems[0].ID != official.ID {
		t.Fatalf("official list included private or legacy material: %#v error=%v", officialItems, err)
	}
	publicItems, err := s.ListMaterials()
	if err != nil {
		t.Fatal(err)
	}
	for _, item := range publicItems {
		if item.ID == personal.ID {
			t.Fatal("public list exposed private material")
		}
	}
	for range 2 {
		if err := s.SetCollection(foreignOwner, official.ID, true); err != nil {
			t.Fatal(err)
		}
	}
	collected, err := s.ListLibrary(foreignOwner)
	if err != nil || len(collected) != 1 || collected[0].ID != official.ID || !collected[0].IsCollected {
		t.Fatalf("idempotent collection: %#v error=%v", collected, err)
	}
	for range 2 {
		if err := s.SetCollection(foreignOwner, official.ID, false); err != nil {
			t.Fatal(err)
		}
	}
	collected, err = s.ListLibrary(foreignOwner)
	if err != nil || len(collected) != 0 {
		t.Fatalf("idempotent removal: %#v error=%v", collected, err)
	}
	verifyLibraryRollback(t, db, personal.ID, official.ID, legacyID)
}

func isolatedLibraryMySQL(t *testing.T, dsn string) *gorm.DB {
	t.Helper()
	settings, err := mysqldriver.ParseDSN(dsn)
	if err != nil {
		t.Fatal("invalid integration database configuration")
	}
	settings.DBName, settings.ParseTime, settings.MultiStatements = "", true, true
	admin, err := gorm.Open(mysql.Open(settings.FormatDSN()), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatal("cannot connect to integration MySQL")
	}
	adminSQL, err := admin.DB()
	if err != nil {
		t.Fatal("cannot obtain integration MySQL connection")
	}
	t.Cleanup(func() { _ = adminSQL.Close() })
	databaseName := "studymate_library_verify_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	if err := admin.Exec("CREATE DATABASE `" + databaseName + "` CHARACTER SET utf8mb4").Error; err != nil {
		t.Fatal("cannot create isolated integration database")
	}
	t.Cleanup(func() {
		if err := admin.Exec("DROP DATABASE `" + databaseName + "`").Error; err != nil {
			t.Error("temporary library database cleanup failed")
		}
	})
	settings.DBName = databaseName
	db, err := gorm.Open(mysql.Open(settings.FormatDSN()), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatal("cannot open isolated integration database")
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatal("cannot obtain isolated integration connection")
	}
	// Migration PREPARE statements use connection-local variables.
	sqlDB.SetMaxOpenConns(1)
	t.Cleanup(func() { _ = sqlDB.Close() })
	return db
}

func verifyLibraryRollback(t *testing.T, db *gorm.DB, personalID, officialID, legacyID string) {
	t.Helper()
	_, thisFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("cannot resolve migration fixture location")
	}
	downPath := filepath.Join(filepath.Dir(thisFile), "..", "..", "..", "migrations", "mysql", "010_material_libraries.down.sql")
	down, err := os.ReadFile(downPath)
	if err != nil {
		t.Fatal("cannot read 010 rollback fixture")
	}
	if err := db.Exec(string(down)).Error; err != nil {
		t.Fatalf("010 rollback failed: %v", err)
	}
	var columns int64
	if err := db.Raw("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'materials' AND column_name IN ('library_scope', 'folder_name')").Scan(&columns).Error; err != nil || columns != 0 {
		t.Fatalf("rollback retained library columns: count=%d error=%v", columns, err)
	}
	var visible int64
	if err := db.Table("materials").Where("id IN ? AND status = ?", []string{personalID, officialID}, "approved").Count(&visible).Error; err != nil || visible != 0 {
		t.Fatalf("rollback exposed new library scopes: count=%d error=%v", visible, err)
	}
	if err := db.Table("materials").Where("id = ? AND status = ?", legacyID, "approved").Count(&visible).Error; err != nil || visible != 1 {
		t.Fatalf("rollback modified legacy public resource: count=%d error=%v", visible, err)
	}
	if err := storage.Apply(db); err != nil {
		t.Fatalf("up after rollback: %v", err)
	}
	for _, id := range []string{personalID, officialID} {
		var item materialmodel.Material
		if err := db.First(&item, "id = ?", id).Error; err != nil {
			t.Fatal(err)
		}
		if item.Status != "archived" || item.IsPublic() {
			t.Fatalf("reapplying migration exposed rollback resource: %#v", item)
		}
	}
}
