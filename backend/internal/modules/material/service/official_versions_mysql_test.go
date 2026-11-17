package service

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"os"
	"path/filepath"
	"runtime"
	storage "studymate/backend/internal/migrations/mysql"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	filemodel "studymate/backend/internal/modules/file/model"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialmodel "studymate/backend/internal/modules/material/model"
	materialrepo "studymate/backend/internal/modules/material/repository"
	"studymate/backend/internal/pkg/apperrors"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestMySQLOfficialVersionsMigrationAndConcurrentCreation(t *testing.T) {
	dsn := os.Getenv("STUDYMATE_MYSQL_TEST_DSN")
	if dsn == "" {
		t.Skip("set STUDYMATE_MYSQL_TEST_DSN for isolated official versions verification")
	}
	db := isolatedLibraryMySQL(t, dsn)
	for range 2 {
		if err := storage.Apply(db); err != nil {
			t.Fatal(err)
		}
	}
	connection, _ := db.DB()
	connection.SetMaxOpenConns(4)
	owner := uuid.NewString()
	s := NewService(materialrepo.NewRepository(db), adminrepo.NewAuditLogRepository(db))
	path := versionFile(t, s, "source")
	fileIDs := []string{uuid.NewString(), uuid.NewString(), uuid.NewString()}
	for _, id := range fileIDs {
		if err := db.Create(&filemodel.FileRecord{ID: id, OwnerUserID: owner, OriginalName: "source.pdf", StoredName: id + ".pdf", Path: path, MimeType: "application/pdf", Size: 12}).Error; err != nil {
			t.Fatal(err)
		}
	}
	input := libraryRequest()
	input.AttachmentFileID = fileIDs[0]
	old, err := s.CreateOfficial(owner, "admin", input)
	if err != nil {
		t.Fatal(err)
	}
	// Hold the stable base row while two requests finish preflight and reach the final lock.
	locked := make(chan struct{})
	release := make(chan struct{})
	holder := make(chan error, 1)
	go func() {
		holder <- db.Transaction(func(tx *gorm.DB) error {
			var id string
			if err := tx.Raw("SELECT id FROM materials WHERE id = ? FOR UPDATE", old.ID).Scan(&id).Error; err != nil {
				return err
			}
			close(locked)
			<-release
			return nil
		})
	}()
	<-locked
	var arrivals atomic.Int32
	bothReady := make(chan struct{})
	callback := "test:official-version-lock-ready"
	if err := db.Callback().Query().Before("gorm:query").Register(callback, func(tx *gorm.DB) {
		if lock, ok := tx.Statement.Clauses["FOR"].Expression.(clause.Locking); ok && lock.Strength == "UPDATE" && tx.Statement.Table == "materials" {
			if arrivals.Add(1) == 2 {
				close(bothReady)
			}
		}
	}); err != nil {
		close(release)
		t.Fatal(err)
	}
	defer db.Callback().Query().Remove(callback)
	var wg sync.WaitGroup
	results := make(chan error, 2)
	for index := 1; index < 3; index++ {
		wg.Add(1)
		go func(fileID string) {
			defer wg.Done()
			request := input
			request.AttachmentFileID = fileID
			_, err := s.CreateOfficialVersion(owner, "admin", old.ID, materialdto.CreateOfficialVersionRequest{CreateMaterialRequest: request, ChangeSummary: "New PDF version"})
			results <- err
		}(fileIDs[index])
	}
	select {
	case <-bothReady:
	case <-time.After(5 * time.Second):
		close(release)
		t.Fatal("both requests did not reach the final version lock")
	}
	close(release)
	if err := <-holder; err != nil {
		t.Fatal(err)
	}
	wg.Wait()
	close(results)
	successes, conflicts := 0, 0
	for err := range results {
		if err == nil {
			successes++
		} else if apperrors.As(err).Status == 409 {
			conflicts++
		} else {
			t.Fatal(err)
		}
	}
	if successes != 1 || conflicts != 1 {
		t.Fatalf("concurrent versions successes=%d conflicts=%d", successes, conflicts)
	}
	var count int64
	if err := db.Model(&materialmodel.Material{}).Where("previous_version_id = ?", old.ID).Count(&count).Error; err != nil || count != 1 {
		t.Fatalf("branch count %d err %v", count, err)
	}
	previous := old.ID
	duplicate := materialmodel.Material{ID: uuid.NewString(), OwnerUserID: owner, LibraryScope: "official", Status: "approved", PreviousVersionID: &previous, Title: "Must fail", Description: "unique check", Category: "book"}
	if err := db.Create(&duplicate).Error; err == nil {
		t.Fatal("unique previous version index absent")
	}
	connection.SetMaxOpenConns(1)
	_, thisFile, _, _ := runtime.Caller(0)
	down, err := os.ReadFile(filepath.Join(filepath.Dir(thisFile), "..", "..", "..", "migrations", "mysql", "012_official_material_versions.down.sql"))
	if err != nil {
		t.Fatal(err)
	}
	for range 2 {
		if err := db.Exec(string(down)).Error; err != nil {
			t.Fatal(err)
		}
	}
	if err := db.Table("materials").Count(&count).Error; err != nil || count != 2 {
		t.Fatal("rollback lost materials")
	}
	if err := db.Table("file_records").Count(&count).Error; err != nil || count != 3 {
		t.Fatal("rollback lost originals")
	}
	if err := storage.Apply(db); err != nil {
		t.Fatal(err)
	}
}
