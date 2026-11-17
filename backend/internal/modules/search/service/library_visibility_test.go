package service

import (
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	materialmodel "studymate/backend/internal/modules/material/model"
)

func TestMaterialSearchRespectsLibraryVisibility(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&materialmodel.Material{}); err != nil {
		t.Fatal(err)
	}
	for _, record := range []materialmodel.Material{
		{ID: "community", OwnerUserID: "user-b", LibraryScope: "community", Status: "approved", Title: "algebra community"},
		{ID: "official", OwnerUserID: "admin", LibraryScope: "official", Status: "approved", Title: "algebra official"},
		{ID: "mine", OwnerUserID: "user-a", LibraryScope: "personal", Status: "private", Title: "algebra mine"},
		{ID: "other", OwnerUserID: "user-b", LibraryScope: "personal", Status: "private", Title: "algebra other"},
		{ID: "misclassified", OwnerUserID: "user-a", LibraryScope: "personal", Status: "approved", Title: "algebra secret"},
		{ID: "archived", OwnerUserID: "user-a", LibraryScope: "personal", Status: "archived", Title: "algebra archived"},
		{ID: "hidden", OwnerUserID: "admin", LibraryScope: "official", Status: "hidden", Title: "algebra hidden"},
	} {
		if err := db.Create(&record).Error; err != nil {
			t.Fatal(err)
		}
	}
	for _, tc := range []struct {
		userID   string
		expected map[string]string
	}{
		{"", map[string]string{"community": "/materials?selected=community", "official": "/official-materials?selected=official"}},
		{"user-a", map[string]string{"community": "/materials?selected=community", "official": "/official-materials?selected=official", "mine": "/library?selected=mine"}},
		{"user-b", map[string]string{"community": "/materials?selected=community", "official": "/official-materials?selected=official", "other": "/library?selected=other"}},
	} {
		t.Run("actor="+tc.userID, func(t *testing.T) {
			batch, err := NewMySQLFallbackIndexer(db).Search("material", "algebra", 20, 0, tc.userID)
			if err != nil {
				t.Fatal(err)
			}
			if batch.TotalCount != len(tc.expected) || len(batch.Results) != len(tc.expected) {
				t.Fatalf("unexpected visible results: %#v", batch)
			}
			for _, result := range batch.Results {
				if expected, ok := tc.expected[result.ID]; !ok || result.URL != expected {
					t.Fatalf("unexpected result: %#v", result)
				}
			}
		})
	}
}
