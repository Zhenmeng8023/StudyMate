package handler_test

import (
	"encoding/json"
	"net/http"
	materialmodel "studymate/backend/internal/modules/material/model"
	"testing"
)

func TestOfficialVersionHTTPPublicAndManagementBoundaries(t *testing.T) {
	router, db := libraryRouter(t)
	rootID := "version-root"
	db.Create(&materialmodel.Material{ID: rootID, OwnerUserID: "admin", LibraryScope: "official", Status: "approved", Title: "Published"})
	db.Create(&materialmodel.Material{ID: "version-archived", PreviousVersionID: &rootID, OwnerUserID: "admin", LibraryScope: "official", Status: "archived", Title: "Archived", ChangeSummary: "Private change"})
	db.Create(&materialmodel.Material{ID: "personal", OwnerUserID: "admin", LibraryScope: "personal", Status: "private", Title: "Private"})
	for _, tc := range []struct {
		path, user string
		status     int
	}{
		{"/official-materials/version-root/versions", "", 200},
		{"/official-materials/version-archived/versions", "", 404},
		{"/official-materials/manage/version-root/versions", "", 401},
		{"/official-materials/manage/version-root/versions", "alice", 403},
		{"/official-materials/manage/version-root/versions", "admin", 200},
		{"/official-materials/manage/version-archived", "", 401},
		{"/official-materials/manage/version-archived", "alice", 403},
		{"/official-materials/manage/version-archived", "admin", 200},
		{"/official-materials/manage/personal", "admin", 404},
		{"/official-materials/personal/versions", "", 404},
	} {
		got := request(t, router, http.MethodGet, tc.path, tc.user, nil)
		if got.Code != tc.status {
			t.Fatalf("%s %s: %d %s", tc.user, tc.path, got.Code, got.Body.String())
		}
	}
	got := request(t, router, http.MethodGet, "/official-materials/version-root/versions", "", nil)
	var envelope struct {
		Data struct {
			Items             []map[string]any
			LatestPublishedID string
		}
	}
	if err := json.Unmarshal(got.Body.Bytes(), &envelope); err != nil || len(envelope.Data.Items) != 1 || envelope.Data.LatestPublishedID != rootID {
		t.Fatalf("public chain %s %v", got.Body.String(), err)
	}
	body := map[string]any{"title": "Valid title", "description": "Valid description", "category": "book", "attachmentFileId": "new-file", "changeSummary": "New version"}
	got = request(t, router, http.MethodPost, "/official-materials/version-root/versions", "alice", body)
	if got.Code != 403 {
		t.Fatalf("non admin version create %d %s", got.Code, got.Body.String())
	}
}
