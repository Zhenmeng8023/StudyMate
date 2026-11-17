package handler_test

import (
	"encoding/json"
	"net/http"
	materialmodel "studymate/backend/internal/modules/material/model"
	"testing"
)

func TestOfficialCatalogHTTPCompatibilityAndManagerScope(t *testing.T) {
	router, db := libraryRouter(t)
	db.Create(&materialmodel.Material{ID: "published", OwnerUserID: "admin", LibraryScope: "official", Status: "approved", Title: "Public official", Author: "Researcher", MaterialType: "paper", Category: "research"})
	db.Create(&materialmodel.Material{ID: "archived", OwnerUserID: "admin", LibraryScope: "official", Status: "archived", Title: "Archived official"})
	db.Create(&materialmodel.Material{ID: "private", OwnerUserID: "alice", LibraryScope: "personal", Status: "private", Title: "Private official"})
	for _, tc := range []struct {
		path, user string
		status     int
	}{
		{"/official-materials/manage", "", 401}, {"/official-materials/manage", "alice", 403},
		{"/official-materials/manage?page=1&pageSize=20", "admin", 200},
		{"/official-materials?page=0", "", 400}, {"/official-materials?page=1&pageSize=51", "", 400},
		{"/official-materials?page=NaN", "", 400}, {"/official-materials?page=1&sort=unsafe", "", 400},
		{"/official-materials?page=1&materialType=invalid", "", 400},
	} {
		got := request(t, router, http.MethodGet, tc.path, tc.user, nil)
		if got.Code != tc.status {
			t.Fatalf("%s %s: %d %s", tc.user, tc.path, got.Code, got.Body.String())
		}
	}
	old := request(t, router, http.MethodGet, "/official-materials", "", nil)
	var legacy struct{ Data []map[string]any }
	if err := json.Unmarshal(old.Body.Bytes(), &legacy); err != nil || len(legacy.Data) != 1 {
		t.Fatalf("legacy:%s %v", old.Body.String(), err)
	}
	filtered := request(t, router, http.MethodGet, "/official-materials?page=1&pageSize=1&q=Researcher&materialType=paper&category=research", "", nil)
	var page struct {
		Data struct {
			Total      int
			Items      []map[string]any
			Categories []string
		}
	}
	if err := json.Unmarshal(filtered.Body.Bytes(), &page); err != nil || page.Data.Total != 1 || len(page.Data.Items) != 1 || page.Data.Items[0]["author"] != "Researcher" {
		t.Fatalf("filtered:%s %v", filtered.Body.String(), err)
	}
	management := request(t, router, http.MethodGet, "/official-materials/manage?page=1&pageSize=20", "admin", nil)
	if err := json.Unmarshal(management.Body.Bytes(), &page); err != nil || page.Data.Total != 2 {
		t.Fatalf("management:%s %v", management.Body.String(), err)
	}
	denied := request(t, router, http.MethodPut, "/official-materials/published/status", "alice", map[string]string{"status": "archived", "reason": "reason"})
	if denied.Code != 403 {
		t.Fatal(denied.Body.String())
	}
}
