package handler

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"studymate/backend/internal/middleware"
	adminmodel "studymate/backend/internal/modules/admin/model"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	filemodel "studymate/backend/internal/modules/file/model"
	filerepo "studymate/backend/internal/modules/file/repository"
	fileservice "studymate/backend/internal/modules/file/service"
	usermodel "studymate/backend/internal/modules/user/model"
)

func fileTestRouter(t *testing.T) (*gin.Engine, *gorm.DB) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&filemodel.FileRecord{}, &adminmodel.AuditLog{}, &usermodel.User{}); err != nil {
		t.Fatal(err)
	}
	for _, id := range []string{"owner", "admin"} {
		if err := db.Create(&usermodel.User{ID: id, Username: id, Email: id + "@test.invalid"}).Error; err != nil {
			t.Fatal(err)
		}
	}
	h := NewHandler(fileservice.NewService(filerepo.NewRepository(db), adminrepo.NewAuditLogRepository(db), t.TempDir()))
	router := gin.New()
	// Authentication itself is covered by middleware tests; this fixture supplies identities.
	router.Use(func(ctx *gin.Context) {
		identity := ctx.GetHeader("X-Test-Identity")
		if identity == "" {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		ctx.Set(middleware.ContextUserIDKey, identity)
		if identity == "admin" {
			ctx.Set(middleware.ContextRoleKey, "admin")
		}
	})
	router.POST("/files", h.Upload)
	router.GET("/files/storage", h.Storage)
	router.GET("/files/:id", h.GetMetadata)
	router.GET("/files/:id/download", h.Download)
	return router, db
}

func TestUploadMetadataAndDownloadOwnership(t *testing.T) {
	router, _ := fileTestRouter(t)
	var body bytes.Buffer
	w := multipart.NewWriter(&body)
	part, _ := w.CreateFormFile("file", "reading.pdf")
	_, _ = part.Write([]byte("%PDF-1.7\nprivate reading material"))
	_ = w.Close()
	req := httptest.NewRequest(http.MethodPost, "/files", &body)
	req.Header.Set("Content-Type", w.FormDataContentType())
	req.Header.Set("X-Test-Identity", "owner")
	response := httptest.NewRecorder()
	router.ServeHTTP(response, req)
	if response.Code != http.StatusCreated {
		t.Fatalf("upload: %d %s", response.Code, response.Body.String())
	}
	var envelope struct {
		Data struct {
			ID       string `json:"id"`
			Path     string `json:"path"`
			MimeType string `json:"mimeType"`
		} `json:"data"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &envelope); err != nil {
		t.Fatal(err)
	}
	if envelope.Data.ID == "" || envelope.Data.Path != "" || envelope.Data.MimeType != "application/pdf" {
		t.Fatalf("unexpected metadata: %#v", envelope)
	}
	for _, path := range []string{"/files/" + envelope.Data.ID, "/files/" + envelope.Data.ID + "/download"} {
		for identity, expected := range map[string]int{"": 401, "other": 403, "owner": 200, "admin": 200} {
			req := httptest.NewRequest(http.MethodGet, path, nil)
			req.Header.Set("X-Test-Identity", identity)
			response := httptest.NewRecorder()
			router.ServeHTTP(response, req)
			if response.Code != expected {
				t.Fatalf("%s as %s: expected %d, got %d %s", path, identity, expected, response.Code, response.Body.String())
			}
			if expected == 200 && strings.HasSuffix(path, "/download") {
				if response.Body.String() != "%PDF-1.7\nprivate reading material" {
					t.Fatal("download content differs")
				}
				if response.Header().Get("Cache-Control") != "private, no-store" || response.Header().Get("X-Content-Type-Options") != "nosniff" {
					t.Fatal("missing private response headers")
				}
				if !strings.Contains(response.Header().Get("Content-Disposition"), "attachment") {
					t.Fatal("not an attachment")
				}
			}
		}
	}
}

func TestUploadRejectsWordAndDisguisedPDFWithoutSaving(t *testing.T) {
	for _, tc := range []struct {
		name    string
		content []byte
	}{
		{"reading.doc", []byte{0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1}},
		{"reading.docx", []byte("PK\x03\x04old-word")},
		{"fake.pdf", []byte("Word data with a renamed extension")},
		{"reading.txt", []byte("%PDF-1.7\nmisnamed")},
	} {
		t.Run(tc.name, func(t *testing.T) {
			router, db := fileTestRouter(t)
			var body bytes.Buffer
			writer := multipart.NewWriter(&body)
			part, _ := writer.CreateFormFile("file", tc.name)
			_, _ = part.Write(tc.content)
			_ = writer.Close()
			request := httptest.NewRequest(http.MethodPost, "/files", &body)
			request.Header.Set("Content-Type", writer.FormDataContentType())
			request.Header.Set("X-Test-Identity", "owner")
			response := httptest.NewRecorder()
			router.ServeHTTP(response, request)
			if response.Code != http.StatusBadRequest || !strings.Contains(response.Body.String(), "PDF") {
				t.Fatalf("non-PDF accepted: %d %s", response.Code, response.Body.String())
			}
			var count int64
			if err := db.Model(&filemodel.FileRecord{}).Count(&count).Error; err != nil || count != 0 {
				t.Fatalf("rejected file persisted: %d %v", count, err)
			}
		})
	}
}

func TestFileHandlersReportInvalidAndMissingFiles(t *testing.T) {
	router, db := fileTestRouter(t)
	missingPath := t.TempDir() + "/removed.pdf"
	if err := os.WriteFile(missingPath, []byte("%PDF-1.7"), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := db.Create(&filemodel.FileRecord{ID: "missing-body", OwnerUserID: "owner", OriginalName: "removed.pdf", StoredName: "removed.pdf", MimeType: "application/pdf", Path: missingPath}).Error; err != nil {
		t.Fatal(err)
	}
	if err := os.Remove(missingPath); err != nil {
		t.Fatal(err)
	}
	for _, path := range []string{"/files/no-record", "/files/no-record/download", "/files/missing-body/download"} {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		req.Header.Set("X-Test-Identity", "owner")
		response := httptest.NewRecorder()
		router.ServeHTTP(response, req)
		if response.Code != 404 {
			t.Fatalf("expected 404 at %s, got %d", path, response.Code)
		}
	}
	for _, invalidFile := range []bool{false, true} {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		if invalidFile {
			part, _ := w.CreateFormFile("file", "payload.html")
			_, _ = part.Write([]byte("<html>active</html>"))
		}
		_ = w.Close()
		req := httptest.NewRequest(http.MethodPost, "/files", &body)
		req.Header.Set("Content-Type", w.FormDataContentType())
		req.Header.Set("X-Test-Identity", "owner")
		response := httptest.NewRecorder()
		router.ServeHTTP(response, req)
		if response.Code != 400 {
			t.Fatalf("expected 400 for invalid upload, got %d %s", response.Code, response.Body.String())
		}
	}
}
