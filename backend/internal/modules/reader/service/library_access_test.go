package service

import (
	"net/http"
	"testing"

	materialmodel "studymate/backend/internal/modules/material/model"
	readerdto "studymate/backend/internal/modules/reader/dto"
	"studymate/backend/internal/pkg/apperrors"
)

func TestReaderPersonalLibraryAccess(t *testing.T) {
	for _, tc := range []struct {
		name, userID, owner, scope, status string
		allowed                            bool
	}{
		{"owner private", "alice", "alice", "personal", "private", true},
		{"foreign private", "bob", "alice", "personal", "private", false},
		{"anonymous private", "", "alice", "personal", "private", false},
		{"misapproved private", "bob", "alice", "personal", "approved", false},
		{"archived owner", "alice", "alice", "personal", "archived", false},
		{"published official", "alice", "admin", "official", "approved", true},
		{"hidden official", "alice", "admin", "official", "hidden", false},
		{"legacy approved", "alice", "bob", "", "approved", true},
	} {
		t.Run(tc.name, func(t *testing.T) {
			s := NewService(&fakeReaderRepository{}, &fakeMaterialRepository{material: &materialmodel.Material{ID: "material-1", OwnerUserID: tc.owner, LibraryScope: tc.scope, Status: tc.status}}, &fakeAuditLogRepository{}, nil)
			_, err := s.GetState(tc.userID, "material-1")
			if tc.allowed && err != nil {
				t.Fatalf("read denied: %v", err)
			}
			if !tc.allowed && (err == nil || apperrors.As(err).Status != http.StatusForbidden) {
				t.Fatalf("read allowed: %v", err)
			}
			_, err = s.CreateAnnotation(tc.userID, "material-1", readerdto.CreateAnnotationRequest{Page: 1, Quote: "selection"})
			if tc.allowed && err != nil {
				t.Fatalf("annotation denied: %v", err)
			}
			if !tc.allowed && err == nil {
				t.Fatal("foreign annotation accepted")
			}
		})
	}
}
