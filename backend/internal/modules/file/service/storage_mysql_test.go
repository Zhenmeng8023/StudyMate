package service

import (
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	mysqldriver "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	adminmodel "studymate/backend/internal/modules/admin/model"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	filemodel "studymate/backend/internal/modules/file/model"
	filerepo "studymate/backend/internal/modules/file/repository"
	usermodel "studymate/backend/internal/modules/user/model"
	"studymate/backend/internal/pkg/apperrors"
)

// Opt-in: only a generated UUID temporary database is modified, never the DSN's database.
func TestMySQLConcurrentUploadQuota(t *testing.T) {
	dsn := os.Getenv("STUDYMATE_MYSQL_TEST_DSN")
	if dsn == "" {
		t.Skip("set STUDYMATE_MYSQL_TEST_DSN for isolated MySQL upload quota verification")
	}
	settings, err := mysqldriver.ParseDSN(dsn)
	if err != nil {
		t.Fatal("invalid integration database configuration")
	}
	settings.DBName = ""
	settings.ParseTime = true
	admin, err := gorm.Open(mysql.Open(settings.FormatDSN()), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatal("cannot connect to integration MySQL")
	}
	adminSQL, _ := admin.DB()
	t.Cleanup(func() { adminSQL.Close() })
	databaseName := "studymate_storage_verify_" + strings.ReplaceAll(uuid.NewString(), "-", "")
	if err := admin.Exec("CREATE DATABASE `" + databaseName + "` CHARACTER SET utf8mb4").Error; err != nil {
		t.Fatal("cannot create isolated integration database")
	}
	t.Cleanup(func() {
		if err := admin.Exec("DROP DATABASE `" + databaseName + "`").Error; err != nil {
			t.Error("temporary storage database cleanup failed")
		}
	})
	settings.DBName = databaseName
	db, err := gorm.Open(mysql.Open(settings.FormatDSN()), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatal("cannot open isolated integration database")
	}
	sqlDB, _ := db.DB()
	sqlDB.SetMaxOpenConns(4)
	t.Cleanup(func() { sqlDB.Close() })
	if err := db.AutoMigrate(&usermodel.User{}, &filemodel.FileRecord{}, &adminmodel.AuditLog{}); err != nil {
		t.Fatal(err)
	}
	owner := uuid.NewString()
	if err := db.Create(&usermodel.User{ID: owner, Username: owner, Email: owner + "@test.invalid"}).Error; err != nil {
		t.Fatal(err)
	}
	var arrivals atomic.Int32
	ready := make(chan struct{})
	if err := db.Callback().Query().Before("gorm:query").Register("test:quota-barrier", func(tx *gorm.DB) {
		if tx.Statement.Table != "users" {
			return
		}
		if arrivals.Add(1) == 2 {
			close(ready)
		}
		select {
		case <-ready:
		case <-time.After(5 * time.Second):
			tx.AddError(apperrors.Internal("quota test barrier timeout"))
		}
	}); err != nil {
		t.Fatal(err)
	}
	dir := t.TempDir()
	content := []byte("%PDF-1.7\nconcurrent content")
	first := NewService(filerepo.NewRepository(db), adminrepo.NewAuditLogRepository(db), dir, int64(len(content)))
	second := NewService(filerepo.NewRepository(db), adminrepo.NewAuditLogRepository(db), dir, int64(len(content)))
	a, b := uploadHeader(t, "first.pdf", content), uploadHeader(t, "second.pdf", content)
	results := make(chan error, 2)
	go func() { _, err := first.Upload(owner, a); results <- err }()
	go func() { _, err := second.Upload(owner, b); results <- err }()
	successes, rejections := 0, 0
	for i := 0; i < 2; i++ {
		err := <-results
		if err == nil {
			successes++
		} else if apperrors.As(err).Code == "storage_quota_exceeded" {
			rejections++
		} else {
			t.Fatalf("unexpected upload error: %v", err)
		}
	}
	if successes != 1 || rejections != 1 || arrivals.Load() != 2 {
		t.Fatalf("success=%d rejection=%d arrivals=%d", successes, rejections, arrivals.Load())
	}
	var count int64
	db.Model(&filemodel.FileRecord{}).Where("owner_user_id = ?", owner).Count(&count)
	if count != 1 {
		t.Fatalf("record count=%d", count)
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
		t.Fatalf("disk originals=%d", files)
	}
}
