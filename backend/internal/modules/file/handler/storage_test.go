package handler

import (
	"encoding/json"
	"net/http/httptest"
	"testing"

	"studymate/backend/internal/modules/file/dto"
	filemodel "studymate/backend/internal/modules/file/model"
)

func TestStorageOnlyReturnsAuthenticatedOwnerTotals(t *testing.T) {
	router, db := fileTestRouter(t)
	for _, sql := range []string{"CREATE TABLE materials (attachment_file_id TEXT, cover_file_id TEXT)", "CREATE TABLE graphs (thumbnail_file_id TEXT)", "CREATE TABLE diagram_templates (preview_file_id TEXT)"} {
		db.Exec(sql)
	}
	db.Create(&filemodel.FileRecord{ID: "mine", OwnerUserID: "owner", OriginalName: "mine.pdf", Path: "/private/server/mine.pdf", Size: 12})
	db.Create(&filemodel.FileRecord{ID: "foreign", OwnerUserID: "admin", OriginalName: "foreign.pdf", Path: "/private/server/foreign.pdf", Size: 900})
	for _, identity := range []string{"", "owner", "admin"} {
		req := httptest.NewRequest("GET", "/files/storage?userId=admin", nil)
		req.Header.Set("X-Test-Identity", identity)
		recorder := httptest.NewRecorder()
		router.ServeHTTP(recorder, req)
		if identity == "" {
			if recorder.Code != 401 {
				t.Fatalf("anonymous=%d", recorder.Code)
			}
			continue
		}
		if recorder.Code != 200 {
			t.Fatalf("overview=%d %s", recorder.Code, recorder.Body.String())
		}
		var envelope struct {
			Data dto.StorageResponse `json:"data"`
		}
		if err := json.Unmarshal(recorder.Body.Bytes(), &envelope); err != nil {
			t.Fatal(err)
		}
		expected := int64(12)
		if identity == "admin" {
			expected = 900
		}
		if envelope.Data.UsedBytes != expected || len(envelope.Data.UnlinkedFiles) != 1 {
			t.Fatalf("owner overview=%+v", envelope.Data)
		}
		if recorder.Header().Get("Cache-Control") != "private, no-store" {
			t.Fatal("storage response should not be shared-cached")
		}
		var raw map[string]any
		json.Unmarshal(recorder.Body.Bytes(), &raw)
		item := raw["data"].(map[string]any)["unlinkedFiles"].([]any)[0].(map[string]any)
		if _, ok := item["path"]; ok {
			t.Fatal("storage leaked internal path")
		}
	}
}
