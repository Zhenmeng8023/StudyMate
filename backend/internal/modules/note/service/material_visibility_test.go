package service

import (
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	materialmodel "studymate/backend/internal/modules/material/model"
	materialrepo "studymate/backend/internal/modules/material/repository"
)

func TestNoteMaterialAssociationRespectsPersonalLibrary(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&materialmodel.Material{}); err != nil {
		t.Fatal(err)
	}
	for _, record := range []materialmodel.Material{
		{ID: "mine", OwnerUserID: "user-a", LibraryScope: "personal", Status: "private"},
		{ID: "other", OwnerUserID: "user-b", LibraryScope: "personal", Status: "private"},
		{ID: "archived", OwnerUserID: "user-a", LibraryScope: "personal", Status: "archived"},
		{ID: "invalid", OwnerUserID: "user-b", LibraryScope: "personal", Status: "approved"},
		{ID: "official", OwnerUserID: "admin", LibraryScope: "official", Status: "approved"},
		{ID: "legacy-pending", OwnerUserID: "user-a", LibraryScope: "community", Status: "pending"},
	} {
		if err := db.Create(&record).Error; err != nil {
			t.Fatal(err)
		}
	}
	s := &Service{materials: materialrepo.NewRepository(db)}
	for _, tc := range []struct {
		id      string
		allowed bool
	}{
		{"mine", true}, {"other", false}, {"archived", false}, {"invalid", false}, {"official", true}, {"legacy-pending", true},
	} {
		t.Run(tc.id, func(t *testing.T) {
			err := s.ensureMaterialReadable("user-a", tc.id)
			if (err == nil) != tc.allowed {
				t.Fatalf("allowed=%v, err=%v", tc.allowed, err)
			}
		})
	}
}
