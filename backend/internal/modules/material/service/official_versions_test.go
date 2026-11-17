package service

import (
	"fmt"
	"os"
	"path/filepath"
	filemodel "studymate/backend/internal/modules/file/model"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialmodel "studymate/backend/internal/modules/material/model"
	readermodel "studymate/backend/internal/modules/reader/model"
	"studymate/backend/internal/pkg/apperrors"
	"testing"
)

func versionFile(t *testing.T, s *Service, id string) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), id+".pdf")
	if err := os.WriteFile(path, []byte("%PDF-version"), 0600); err != nil {
		t.Fatal(err)
	}
	return path
}

func TestOfficialVersionsPreservePriorLearningAndPreventBranches(t *testing.T) {
	s, db := libraryService(t)
	for _, id := range []string{"old-file", "new-file", "third-file"} {
		if err := db.Create(&filemodel.FileRecord{ID: id, OwnerUserID: "admin", OriginalName: id + ".pdf", MimeType: "application/pdf", Path: versionFile(t, s, id)}).Error; err != nil {
			t.Fatal(err)
		}
	}
	input := libraryRequest()
	input.AttachmentFileID = "old-file"
	input.Edition = "v1"
	old, err := s.CreateOfficial("admin", "admin", input)
	if err != nil {
		t.Fatal(err)
	}
	if err := s.SetCollection("alice", old.ID, true); err != nil {
		t.Fatal(err)
	}
	if err := db.Create(&readermodel.ReadingProgress{UserID: "alice", MaterialID: old.ID, CurrentPage: 5, TotalPages: 10, ProgressPercent: 50}).Error; err != nil {
		t.Fatal(err)
	}
	input.AttachmentFileID = "new-file"
	input.Edition = "v2"
	next, err := s.CreateOfficialVersion("admin", "admin", old.ID, materialdto.CreateOfficialVersionRequest{CreateMaterialRequest: input, ChangeSummary: "Corrected examples"})
	if err != nil {
		t.Fatal(err)
	}
	if next.ID == old.ID || next.PreviousVersionID == nil || *next.PreviousVersionID != old.ID {
		t.Fatalf("bad version %#v", next)
	}
	versions, err := s.ListOfficialVersions("", old.ID, false)
	if err != nil || len(versions.Items) != 2 || versions.LatestPublishedID != next.ID {
		t.Fatalf("versions %#v %v", versions, err)
	}
	library, err := s.ListLibrary("alice")
	if err != nil || len(library) != 1 || library[0].ID != old.ID || library[0].ReadingProgress.CurrentPage != 5 {
		t.Fatalf("learning changed %#v %v", library, err)
	}
	input.AttachmentFileID = "third-file"
	if _, err := s.CreateOfficialVersion("admin", "admin", old.ID, materialdto.CreateOfficialVersionRequest{CreateMaterialRequest: input, ChangeSummary: "Fork"}); err == nil || apperrors.As(err).Status != 409 {
		t.Fatalf("branch accepted %v", err)
	}
	if _, err := s.ChangeOfficialStatus("admin", "admin", next.ID, materialdto.OfficialStatusRequest{Status: "archived", Reason: "Correction"}); err != nil {
		t.Fatal(err)
	}
	versions, err = s.ListOfficialVersions("", old.ID, false)
	if err != nil || len(versions.Items) != 1 || versions.LatestPublishedID != old.ID {
		t.Fatalf("private version leaked %#v %v", versions, err)
	}
	if _, err = s.ListOfficialVersions("", next.ID, false); err == nil || apperrors.As(err).Status != 404 {
		t.Fatalf("archived public base readable %v", err)
	}
	versions, err = s.ListOfficialVersions("admin", next.ID, true)
	if err != nil || len(versions.Items) != 2 {
		t.Fatalf("manage history %#v %v", versions, err)
	}
}

func TestOfficialVersionsRejectInvalidInputAndRollbackAudit(t *testing.T) {
	s, db := libraryService(t)
	path := versionFile(t, s, "valid")
	for _, id := range []string{"one", "two"} {
		db.Create(&filemodel.FileRecord{ID: id, OwnerUserID: "admin", OriginalName: id + ".pdf", MimeType: "application/pdf", Path: path})
	}
	input := libraryRequest()
	input.AttachmentFileID = "one"
	old, err := s.CreateOfficial("admin", "admin", input)
	if err != nil {
		t.Fatal(err)
	}
	input.AttachmentFileID = "two"
	request := materialdto.CreateOfficialVersionRequest{CreateMaterialRequest: input, ChangeSummary: "Update"}
	if _, err = s.CreateOfficialVersion("alice", "student", old.ID, request); err == nil || apperrors.As(err).Status != 403 {
		t.Fatalf("unauthorized %v", err)
	}
	if _, err = s.ListOfficialVersions("student", old.ID, true); err == nil || apperrors.As(err).Status != 403 {
		t.Fatalf("management leaked %v", err)
	}
	empty := request
	empty.ChangeSummary = " "
	if _, err = s.CreateOfficialVersion("admin", "admin", old.ID, empty); err == nil {
		t.Fatal("empty change accepted")
	}
	same := request
	same.AttachmentFileID = "one"
	if _, err = s.CreateOfficialVersion("admin", "admin", old.ID, same); err == nil {
		t.Fatal("same file accepted")
	}
	db.Create(&materialmodel.Material{ID: "personal", OwnerUserID: "admin", LibraryScope: "personal", Status: "private", Title: "Personal"})
	if _, err = s.CreateOfficialVersion("admin", "admin", "personal", request); err == nil {
		t.Fatal("personal base accepted")
	}
	db.Exec("DROP TABLE audit_logs")
	if _, err = s.CreateOfficialVersion("admin", "admin", old.ID, request); err == nil {
		t.Fatal("audit failure accepted")
	}
	var count int64
	db.Model(&materialmodel.Material{}).Where("previous_version_id = ?", old.ID).Count(&count)
	if count != 0 {
		t.Fatal("failed audit retained version")
	}
}

func TestOfficialVersionChainHidesIntermediateVersionsAndRejectsMalformedChains(t *testing.T) {
	s, db := libraryService(t)
	rootID, middleID := "root", "middle"
	for _, item := range []materialmodel.Material{
		{ID: rootID, LibraryScope: "official", Status: "approved", Title: "Root"},
		{ID: middleID, PreviousVersionID: &rootID, LibraryScope: "official", Status: "hidden", Title: "Secret draft", ChangeSummary: "Secret revision"},
		{ID: "latest", PreviousVersionID: &middleID, LibraryScope: "official", Status: "approved", Title: "Published successor"},
	} {
		if err := db.Create(&item).Error; err != nil {
			t.Fatal(err)
		}
	}
	result, err := s.ListOfficialVersions("", rootID, false)
	if err != nil || len(result.Items) != 2 || result.Items[0].ID != "latest" || result.Items[1].ID != rootID {
		t.Fatalf("hidden intermediate exposed %#v %v", result, err)
	}
	db.Model(&materialmodel.Material{}).Where("id = ?", middleID).Update("library_scope", "personal")
	if _, err := s.ListOfficialVersions("", rootID, false); err == nil {
		t.Fatal("mixed scope chain exposed")
	}
	db.Model(&materialmodel.Material{}).Where("id = ?", middleID).Update("library_scope", "official")
	db.Model(&materialmodel.Material{}).Where("id = ?", rootID).Update("previous_version_id", "latest")
	if _, err := s.ListOfficialVersions("", rootID, false); err == nil {
		t.Fatal("cycle exposed")
	}
}

func TestOfficialVersionChainLimitPreservesReadableHistory(t *testing.T) {
	s, db := libraryService(t)
	for index := 0; index < 200; index++ {
		id := fmt.Sprintf("version-%03d", index)
		item := materialmodel.Material{ID: id, OwnerUserID: "admin", LibraryScope: "official", Status: "approved", Title: id}
		if index > 0 {
			previous := fmt.Sprintf("version-%03d", index-1)
			item.PreviousVersionID = &previous
		}
		if err := db.Create(&item).Error; err != nil {
			t.Fatal(err)
		}
	}
	db.Create(&filemodel.FileRecord{ID: "fresh", OwnerUserID: "admin", OriginalName: "fresh.pdf", MimeType: "application/pdf", Path: versionFile(t, s, "fresh")})
	input := libraryRequest()
	input.AttachmentFileID = "fresh"
	_, err := s.CreateOfficialVersion("admin", "admin", "version-199", materialdto.CreateOfficialVersionRequest{CreateMaterialRequest: input, ChangeSummary: "Overflow"})
	if err == nil || apperrors.As(err).Status != 409 {
		t.Fatalf("oversized chain accepted %v", err)
	}
	result, err := s.ListOfficialVersions("", "version-199", false)
	if err != nil || len(result.Items) != 200 {
		t.Fatalf("history became unreadable len=%v err=%v", result, err)
	}
}
