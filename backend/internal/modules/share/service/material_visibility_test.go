package service

import (
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	materialmodel "studymate/backend/internal/modules/material/model"
	sharemodel "studymate/backend/internal/modules/share/model"
	sharerepo "studymate/backend/internal/modules/share/repository"
)

func TestMaterialShareCannotExposePersonalFilesOrUnpublishedOfficialFiles(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&materialmodel.Material{}, &sharemodel.ShareLink{}); err != nil {
		t.Fatal(err)
	}
	s := NewService(sharerepo.NewRepository(db), db, nil)
	for _, tc := range []struct {
		id, scope, status string
		readable          bool
	}{
		{"personal", "personal", "private", false}, {"invalid", "personal", "approved", false}, {"official", "official", "approved", true}, {"hidden", "official", "hidden", false}, {"legacy", "community", "approved", true},
	} {
		t.Run(tc.id, func(t *testing.T) {
			record := materialmodel.Material{ID: tc.id, OwnerUserID: "owner", LibraryScope: tc.scope, Status: tc.status, Title: "Private title", Description: "Private summary"}
			if err := db.Create(&record).Error; err != nil {
				t.Fatal(err)
			}
			allowed, err := s.ownerCanShare("owner", "material", tc.id)
			if err != nil {
				t.Fatal(err)
			}
			if tc.scope == "personal" && allowed {
				t.Fatal("personal file was shareable")
			}
			link := sharemodel.ShareLink{ID: "link-" + tc.id, OwnerUserID: "owner", TargetType: "material", TargetID: tc.id, Mode: "token", Token: "token-" + tc.id, Status: "active"}
			if err := db.Create(&link).Error; err != nil {
				t.Fatal(err)
			}
			payload, err := s.Resolve(link.Token)
			if (err == nil) != tc.readable {
				t.Fatalf("expected readable=%v, payload=%#v,err=%v", tc.readable, payload, err)
			}
			if !tc.readable && payload != nil {
				t.Fatalf("leaked target: %#v", payload)
			}
		})
	}
}
