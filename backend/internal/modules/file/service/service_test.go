package service

import (
	"archive/zip"
	"bytes"
	"mime/multipart"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	adminmodel "studymate/backend/internal/modules/admin/model"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	filemodel "studymate/backend/internal/modules/file/model"
	filerepo "studymate/backend/internal/modules/file/repository"
	usermodel "studymate/backend/internal/modules/user/model"
	"studymate/backend/internal/pkg/apperrors"
)

func uploadHeader(t *testing.T, name string, data []byte) *multipart.FileHeader {
	t.Helper()
	var body bytes.Buffer
	w := multipart.NewWriter(&body)
	part, err := w.CreateFormFile("file", name)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := part.Write(data); err != nil {
		t.Fatal(err)
	}
	if err := w.Close(); err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest("POST", "/files", &body)
	req.Header.Set("Content-Type", w.FormDataContentType())
	if err := req.ParseMultipartForm(1 << 20); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = req.MultipartForm.RemoveAll() })
	return req.MultipartForm.File["file"][0]
}

func uploadService(t *testing.T, migrate bool) (*Service, *gorm.DB, string) {
	t.Helper()
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if migrate {
		if err := db.AutoMigrate(&filemodel.FileRecord{}, &adminmodel.AuditLog{}, &usermodel.User{}); err != nil {
			t.Fatal(err)
		}
		if err := db.Create(&usermodel.User{ID: "owner", Username: "owner", Email: "owner@test.invalid"}).Error; err != nil {
			t.Fatal(err)
		}
	}
	dir := t.TempDir()
	return NewService(filerepo.NewRepository(db), adminrepo.NewAuditLogRepository(db), dir), db, dir
}

func TestUploadRejectsEmptyAndInvalidNames(t *testing.T) {
	s, _, _ := uploadService(t, true)
	if _, err := s.Upload("owner", nil); err == nil {
		t.Fatal("nil upload accepted")
	}
	for _, tc := range []struct {
		name string
		data []byte
	}{{"empty.txt", nil}, {strings.Repeat("a", 256) + ".txt", []byte("notes")}} {
		if _, err := s.Upload("owner", uploadHeader(t, tc.name, tc.data)); err == nil {
			t.Fatalf("invalid upload accepted: %s", tc.name)
		}
	}
	if _, err := s.GetMetadata("missing"); err == nil {
		t.Fatal("missing metadata should fail")
	}
	if _, err := s.GetRecord("missing"); err == nil {
		t.Fatal("missing file should fail")
	}
}

func TestUploadReportsUnavailableStorage(t *testing.T) {
	s, _, dir := uploadService(t, true)
	blocked := filepath.Join(dir, "not-a-directory")
	if err := os.WriteFile(blocked, []byte("blocked"), 0o600); err != nil {
		t.Fatal(err)
	}
	s.uploadDir = blocked
	if _, err := s.Upload("owner", uploadHeader(t, "notes.pdf", []byte("%PDF-1.7\nreading notes"))); err == nil {
		t.Fatal("expected storage failure")
	}
}

func TestUploadRejectsUnsupportedAndDisguisedFiles(t *testing.T) {
	for _, name := range []string{"page.html", "script.js", "image.svg", "fake.pdf", "fake.doc", "fake.docx", "fake.png", "page.txt", "page.md"} {
		t.Run(name, func(t *testing.T) {
			s, _, dir := uploadService(t, true)
			_, err := s.Upload("owner", uploadHeader(t, name, []byte("<html><script>alert(1)</script></html>")))
			if err == nil || apperrors.As(err).Status != 400 {
				t.Fatalf("expected invalid file, got %v", err)
			}
			entries, _ := os.ReadDir(dir)
			if len(entries) != 0 {
				t.Fatal("invalid upload wrote files")
			}
		})
	}
}

func TestUploadPersistsDetectedTypeWithoutExposingPath(t *testing.T) {
	s, db, _ := uploadService(t, true)
	content := []byte("%PDF-1.7\nserver-side file contents")
	result, err := s.Upload("owner", uploadHeader(t, "论文.PDF", content))
	if err != nil {
		t.Fatal(err)
	}
	if result.MimeType != "application/pdf" || result.Path != "" || result.Size != int64(len(content)) {
		t.Fatalf("bad response: %#v", result)
	}
	var record filemodel.FileRecord
	if err := db.First(&record, "id = ?", result.ID).Error; err != nil {
		t.Fatal(err)
	}
	stored, err := os.ReadFile(record.Path)
	if err != nil || !bytes.Equal(stored, content) {
		t.Fatalf("saved content mismatch: %v", err)
	}
	if filepath.Ext(record.StoredName) != ".pdf" {
		t.Fatalf("extension not normalized: %s", record.StoredName)
	}
	metadata, err := s.GetMetadata(result.ID)
	if err != nil || metadata.Path != "" {
		t.Fatalf("metadata leaks path: %#v, %v", metadata, err)
	}
}

func TestUploadRemovesFileWhenDatabaseWriteFails(t *testing.T) {
	s, _, dir := uploadService(t, false)
	_, err := s.Upload("owner", uploadHeader(t, "notes.pdf", []byte("%PDF-1.7\nreading notes")))
	if err == nil {
		t.Fatal("expected database error")
	}
	_ = filepath.WalkDir(dir, func(path string, entry os.DirEntry, walkErr error) error {
		if walkErr != nil {
			t.Fatal(walkErr)
		}
		if !entry.IsDir() {
			t.Errorf("orphan file: %s", path)
		}
		return nil
	})
}

func TestUploadRejectsOversizeHeader(t *testing.T) {
	s, _, _ := uploadService(t, true)
	header := uploadHeader(t, "notes.txt", []byte("notes"))
	header.Size = 50*1024*1024 + 1
	_, err := s.Upload("owner", header)
	if err == nil || apperrors.As(err).Status != 413 {
		t.Fatalf("expected 413, got %v", err)
	}
}

func TestUploadRejectsValidNonPDFFiles(t *testing.T) {
	var content bytes.Buffer
	w := zip.NewWriter(&content)
	part, _ := w.Create("word/document.xml")
	_, _ = part.Write([]byte("<w:document/>"))
	_ = w.Close()
	for name, data := range map[string][]byte{"notes.docx": content.Bytes(), "notes.doc": {0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1}, "notes.md": []byte("# notes\n\n- reading"), "notes.txt": []byte("学习笔记"), "cover.png": {0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a}} {
		t.Run(strings.ReplaceAll(name, ".", "_"), func(t *testing.T) {
			s, _, _ := uploadService(t, true)
			if _, err := s.Upload("owner", uploadHeader(t, name, data)); err == nil || apperrors.As(err).Status != 400 {
				t.Fatalf("non-PDF upload accepted: %v", err)
			}
		})
	}
}
