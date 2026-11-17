package handler_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"studymate/backend/internal/middleware"
	adminmodel "studymate/backend/internal/modules/admin/model"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	filemodel "studymate/backend/internal/modules/file/model"
	materialhandler "studymate/backend/internal/modules/material/handler"
	materialmodel "studymate/backend/internal/modules/material/model"
	materialrepo "studymate/backend/internal/modules/material/repository"
	materialrouter "studymate/backend/internal/modules/material/router"
	materialservice "studymate/backend/internal/modules/material/service"
	readermodel "studymate/backend/internal/modules/reader/model"
)

func libraryRouter(t *testing.T) (*gin.Engine, *gorm.DB) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&materialmodel.Material{}, &materialmodel.MaterialFavorite{}, &materialmodel.MaterialRating{}, &filemodel.FileRecord{}, &adminmodel.AuditLog{}, &readermodel.ReadingProgress{}); err != nil {
		t.Fatal(err)
	}
	db.Exec("CREATE TABLE users (id TEXT PRIMARY KEY, display_name TEXT)")
	db.Exec("INSERT INTO users VALUES ('alice', 'Alice'), ('bob', 'Bob'), ('admin', 'Admin')")
	handler := materialhandler.NewHandler(materialservice.NewService(materialrepo.NewRepository(db), adminrepo.NewAuditLogRepository(db)))
	router := gin.New()
	api := router.Group("/api/v1")
	materialrouter.RegisterPublicRoutes(api, handler)
	authenticated := api.Group("")
	authenticated.Use(func(ctx *gin.Context) {
		user := ctx.GetHeader("X-Test-User")
		if user == "" {
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		ctx.Set(middleware.ContextUserIDKey, user)
		role := "student"
		if user == "admin" {
			role = "admin"
		}
		ctx.Set(middleware.ContextRoleKey, role)
	})
	materialrouter.RegisterProtectedRoutes(authenticated, handler)
	return router, db
}

func TestLibraryHTTPReadingProgressNeverAppearsInPublicResponses(t *testing.T) {
	router, db := libraryRouter(t)
	if err := db.Create(&materialmodel.Material{ID: "official-progress", OwnerUserID: "admin", Title: "Official reading", LibraryScope: "official", Status: "approved"}).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Create(&materialmodel.MaterialFavorite{MaterialID: "official-progress", UserID: "alice"}).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Create(&readermodel.ReadingProgress{MaterialID: "official-progress", UserID: "alice", CurrentPage: 4, TotalPages: 20, ProgressPercent: 20, LastReadAt: time.Date(2026, 11, 17, 8, 0, 0, 0, time.UTC), Bookmarks: "[4]"}).Error; err != nil {
		t.Fatal(err)
	}
	for _, path := range []string{"/library/materials", "/library/materials/official-progress"} {
		got := request(t, router, http.MethodGet, path, "alice", nil)
		if got.Code != http.StatusOK || !bytes.Contains(got.Body.Bytes(), []byte(`"readingProgress":{"currentPage":4,"totalPages":20,"progressPercent":20,"lastReadAt":"2026-11-17T08:00:00Z"}`)) {
			t.Fatalf("missing private read model: %d %s", got.Code, got.Body.String())
		}
		if bytes.Contains(got.Body.Bytes(), []byte("bookmarks")) {
			t.Fatalf("private bookmarks in bookshelf DTO: %s", got.Body.String())
		}
	}
	for _, path := range []string{"/official-materials", "/materials", "/materials/official-progress"} {
		got := request(t, router, http.MethodGet, path, "", nil)
		if got.Code != http.StatusOK || bytes.Contains(got.Body.Bytes(), []byte("readingProgress")) {
			t.Fatalf("public reading data exposure: %d %s", got.Code, got.Body.String())
		}
	}
	bob := request(t, router, http.MethodGet, "/library/materials/official-progress", "bob", nil)
	if bob.Code != http.StatusOK || bytes.Contains(bob.Body.Bytes(), []byte("readingProgress")) {
		t.Fatalf("unread user received Alice progress: %d %s", bob.Code, bob.Body.String())
	}
}

func request(t *testing.T, router *gin.Engine, method, path, user string, body any) *httptest.ResponseRecorder {
	t.Helper()
	raw, err := json.Marshal(body)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(method, "/api/v1"+path, bytes.NewReader(raw))
	req.Header.Set("Content-Type", "application/json")
	if user != "" {
		req.Header.Set("X-Test-User", user)
	}
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	return recorder
}

func TestLibraryHTTPAccessBoundariesAndAttachmentDownload(t *testing.T) {
	router, db := libraryRouter(t)
	path := filepath.Join(t.TempDir(), "private.pdf")
	if err := os.WriteFile(path, []byte("%PDF-private"), 0600); err != nil {
		t.Fatal(err)
	}
	db.Create(&filemodel.FileRecord{ID: "private-file", OwnerUserID: "alice", OriginalName: "中文讲义.pdf", StoredName: "private.pdf", Path: path, MimeType: "application/pdf"})
	db.Create(&materialmodel.Material{ID: "private-item", OwnerUserID: "alice", LibraryScope: "personal", Status: "private", Title: "private", AttachmentFileID: "private-file"})
	for _, tc := range []struct {
		path, user string
		status     int
	}{
		{"/library/materials", "", 401},
		{"/library/materials/private-item", "alice", 200},
		{"/library/materials/private-item", "bob", 404},
		{"/library/materials/private-item/attachment", "bob", 404},
		{"/materials/private-item", "", 404},
		{"/materials/private-item/attachment", "", 404},
	} {
		res := request(t, router, "GET", tc.path, tc.user, nil)
		if res.Code != tc.status {
			t.Fatalf("%s user=%s: %d %s", tc.path, tc.user, res.Code, res.Body.String())
		}
	}
	res := request(t, router, "GET", "/library/materials/private-item/attachment?download=1", "alice", nil)
	if res.Code != 200 || res.Body.String() != "%PDF-private" || res.Header().Get("Cache-Control") != "private, no-store" {
		t.Fatalf("download: %d %s", res.Code, res.Body.String())
	}
	if res.Header().Get("Content-Disposition") == "" {
		t.Fatal("missing content disposition")
	}
}

func TestLibraryHTTPPublicationAndPrivateScopeCannotBeForged(t *testing.T) {
	router, _ := libraryRouter(t)
	body := map[string]any{"title": "My resource", "description": "A detailed reading resource", "category": "book", "libraryScope": "official", "status": "approved"}
	res := request(t, router, "POST", "/official-materials", "alice", body)
	if res.Code != 403 {
		t.Fatalf("student published: %d %s", res.Code, res.Body.String())
	}
	res = request(t, router, "POST", "/library/materials", "alice", body)
	if res.Code != 201 {
		t.Fatalf("private upload: %d %s", res.Code, res.Body.String())
	}
	var result struct {
		Data struct{ LibraryScope, Status string }
	}
	if err := json.Unmarshal(res.Body.Bytes(), &result); err != nil {
		t.Fatal(err)
	}
	if result.Data.LibraryScope != "personal" || result.Data.Status != "private" {
		t.Fatalf("scope forged: %s", res.Body.String())
	}
	res = request(t, router, "POST", "/official-materials", "admin", body)
	if res.Code != 201 {
		t.Fatalf("admin publication: %d %s", res.Code, res.Body.String())
	}
	res = request(t, router, "GET", "/official-materials", "", nil)
	if res.Code != 200 || bytes.Contains(res.Body.Bytes(), []byte(`"libraryScope":"personal"`)) {
		t.Fatalf("official listing leak: %s", res.Body.String())
	}
}
