package service

import (
	"encoding/json"
	"strings"
	"testing"
	"time"

	"gorm.io/gorm"
	materialmodel "studymate/backend/internal/modules/material/model"
	readermodel "studymate/backend/internal/modules/reader/model"
)

func TestLibraryReadingProgressIsRequesterScopedAndBatched(t *testing.T) {
	s, db := libraryService(t)
	if err := db.AutoMigrate(&readermodel.ReadingProgress{}); err != nil {
		t.Fatal(err)
	}
	for _, record := range []materialmodel.Material{
		{ID: "official", OwnerUserID: "admin", LibraryScope: "official", Status: "approved", Title: "Shared resource"},
		{ID: "private", OwnerUserID: "alice", LibraryScope: "personal", Status: "private", Title: "Alice resource"},
		{ID: "unread", OwnerUserID: "alice", LibraryScope: "personal", Status: "private", Title: "Unread resource"},
	} {
		if err := db.Create(&record).Error; err != nil {
			t.Fatal(err)
		}
	}
	for _, user := range []string{"alice", "bob"} {
		if err := s.SetCollection(user, "official", true); err != nil {
			t.Fatal(err)
		}
	}
	now := time.Date(2026, 11, 17, 7, 30, 0, 0, time.UTC)
	for _, row := range []readermodel.ReadingProgress{
		{UserID: "alice", MaterialID: "official", CurrentPage: 3, TotalPages: 10, ProgressPercent: 30, LastReadAt: now, Bookmarks: "[2]"},
		{UserID: "bob", MaterialID: "official", CurrentPage: 8, TotalPages: 10, ProgressPercent: 80, LastReadAt: now.Add(time.Hour)},
		{UserID: "alice", MaterialID: "private", CurrentPage: 2, TotalPages: 4, ProgressPercent: 50, LastReadAt: now},
	} {
		if err := db.Create(&row).Error; err != nil {
			t.Fatal(err)
		}
	}
	progressQueries := 0
	if err := db.Callback().Query().After("gorm:query").Register("test:count_reading_queries", func(tx *gorm.DB) {
		if tx.Statement.Table == "reading_progresses" {
			progressQueries++
		}
	}); err != nil {
		t.Fatal(err)
	}
	items, err := s.ListLibrary("alice")
	if err != nil {
		t.Fatal(err)
	}
	if progressQueries != 1 {
		t.Fatalf("expected one batched progress query, got %d", progressQueries)
	}
	if len(items) != 3 {
		t.Fatalf("expected all owned and collected resources, got %#v", items)
	}
	for _, item := range items {
		if item.ID == "unread" {
			if item.ReadingProgress != nil {
				t.Fatalf("unread should omit progress: %#v", item)
			}
			continue
		}
		if item.ReadingProgress == nil {
			t.Fatalf("missing progress: %#v", item)
		}
		if item.ID == "official" && (item.ReadingProgress.CurrentPage != 3 || item.ReadingProgress.ProgressPercent != 30 || item.ReadingProgress.LastReadAt != now.Format(time.RFC3339)) {
			t.Fatalf("unexpected requester progress: %#v", item.ReadingProgress)
		}
	}
	bob, err := s.ListLibrary("bob")
	if err != nil || len(bob) != 1 || bob[0].ReadingProgress == nil || bob[0].ReadingProgress.CurrentPage != 8 {
		t.Fatalf("bob private boundary: %#v %v", bob, err)
	}
	detail, err := s.GetLibraryMaterial("alice", "official")
	if err != nil || detail.ReadingProgress == nil || detail.ReadingProgress.CurrentPage != 3 {
		t.Fatalf("detail scope: %#v %v", detail, err)
	}
	if _, err := s.GetLibraryMaterial("bob", "private"); err == nil {
		t.Fatal("foreign private detail exposed")
	}
	public, err := s.ListOfficial()
	if err != nil {
		t.Fatal(err)
	}
	raw, err := json.Marshal(public)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(raw), "readingProgress") || strings.Contains(string(raw), "bookmarks") {
		t.Fatalf("public progress exposure: %s", raw)
	}
	publicDetail, err := s.GetMaterial("official")
	if err != nil || publicDetail.ReadingProgress != nil {
		t.Fatalf("public detail progress exposed: %#v %v", publicDetail, err)
	}
}

func TestLibraryReadingProgressNormalizesLegacyValues(t *testing.T) {
	s, db := libraryService(t)
	if err := db.AutoMigrate(&readermodel.ReadingProgress{}); err != nil {
		t.Fatal(err)
	}
	item, err := s.CreatePersonal("alice", libraryRequest())
	if err != nil {
		t.Fatal(err)
	}
	if item.ReadingProgress != nil {
		t.Fatal("create response must not include reading data")
	}
	for _, tc := range []struct {
		page, total                 int
		percent                     float64
		expectedPage, expectedTotal int
		expectedPercent             float64
	}{
		{-5, -2, -1, 0, 0, 0}, {2, 10, 140, 2, 10, 100},
	} {
		if err := db.Where("user_id = ? AND material_id = ?", "alice", item.ID).Delete(&readermodel.ReadingProgress{}).Error; err != nil {
			t.Fatal(err)
		}
		if err := db.Create(&readermodel.ReadingProgress{UserID: "alice", MaterialID: item.ID, CurrentPage: tc.page, TotalPages: tc.total, ProgressPercent: tc.percent}).Error; err != nil {
			t.Fatal(err)
		}
		got, err := s.GetLibraryMaterial("alice", item.ID)
		if err != nil {
			t.Fatal(err)
		}
		p := got.ReadingProgress
		if p == nil || p.CurrentPage != tc.expectedPage || p.TotalPages != tc.expectedTotal || p.ProgressPercent != tc.expectedPercent || p.LastReadAt != "" {
			t.Fatalf("invalid normalization: %#v", p)
		}
	}
}
