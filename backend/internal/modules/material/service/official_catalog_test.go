package service

import (
	"net/http"
	"os"
	"path/filepath"
	filemodel "studymate/backend/internal/modules/file/model"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialmodel "studymate/backend/internal/modules/material/model"
	"studymate/backend/internal/pkg/apperrors"
	"testing"
)

func TestOfficialRestoreRetainsIdentityAndAuditFailureRollsBack(t *testing.T) {
	s, db := libraryService(t)
	path := filepath.Join(t.TempDir(), "official.pdf")
	if err := os.WriteFile(path, []byte("%PDF-test"), 0600); err != nil {
		t.Fatal(err)
	}
	db.Create(&filemodel.FileRecord{ID: "official-file", OwnerUserID: "admin", OriginalName: "paper.pdf", MimeType: "application/pdf", Path: path})
	request := libraryRequest()
	request.AttachmentFileID = "official-file"
	item, err := s.CreateOfficial("admin", "admin", request)
	if err != nil {
		t.Fatal(err)
	}
	if err := s.SetCollection("alice", item.ID, true); err != nil {
		t.Fatal(err)
	}
	if _, err := s.ChangeOfficialStatus("admin", "admin", item.ID, materialdto.OfficialStatusRequest{Status: "archived", Reason: "Correction"}); err != nil {
		t.Fatal(err)
	}
	restored, err := s.ChangeOfficialStatus("admin", "admin", item.ID, materialdto.OfficialStatusRequest{Status: "approved"})
	if err != nil || restored.ID != item.ID || restored.ArchiveReason != "" {
		t.Fatalf("restore:%#v %v", restored, err)
	}
	collection, err := s.ListLibrary("alice")
	if err != nil || len(collection) != 1 || collection[0].ID != item.ID {
		t.Fatalf("collection:%#v %v", collection, err)
	}
	db.Exec("DROP TABLE audit_logs")
	if _, err := s.ChangeOfficialStatus("admin", "admin", item.ID, materialdto.OfficialStatusRequest{Status: "archived", Reason: "Failure"}); err == nil {
		t.Fatal("audit failure accepted")
	}
	var persisted materialmodel.Material
	db.First(&persisted, "id = ?", item.ID)
	if persisted.Status != "approved" {
		t.Fatal("failed transaction changed state")
	}
}

func TestOfficialCatalogMetadataValidationAndPagination(t *testing.T) {
	s, db := libraryService(t)
	request := libraryRequest()
	request.Author = "Test Author"
	request.MaterialType = "paper"
	request.SourceURL = "https://example.test/paper"
	request.LicenseStatus = "open_license"
	item, err := s.CreateOfficial("admin", "admin", request)
	if err != nil || item.Author != request.Author {
		t.Fatalf("metadata: %#v %v", item, err)
	}
	db.Create(&materialmodel.Material{ID: "archived", OwnerUserID: "admin", LibraryScope: "official", Status: "archived", Title: "Archived"})
	page, err := s.ListOfficialCatalog("", materialdto.OfficialCatalogQuery{Page: 1, PageSize: 1, Q: "Test Author"}, false)
	if err != nil || page.Total != 1 || len(page.Items) != 1 {
		t.Fatalf("page: %#v %v", page, err)
	}
	if _, err := s.ListOfficialCatalog("student", materialdto.OfficialCatalogQuery{Page: 1, PageSize: 20}, true); err == nil || apperrors.As(err).Status != http.StatusForbidden {
		t.Fatalf("manager: %v", err)
	}
	request.SourceURL = "javascript:alert(1)"
	if _, err := s.CreateOfficial("admin", "admin", request); err == nil {
		t.Fatal("unsafe source accepted")
	}
	request.SourceURL = "https://example.test/paper"
	request.MaterialType = "book|paper"
	if _, err := s.CreateOfficial("admin", "admin", request); err == nil {
		t.Fatal("combined enum accepted")
	}
	request.MaterialType = "book"
	request.LicenseStatus = "self_owned|authorized"
	if _, err := s.CreateOfficial("admin", "admin", request); err == nil {
		t.Fatal("combined license accepted")
	}
	if _, err := s.ListOfficialCatalog("", materialdto.OfficialCatalogQuery{Page: 1, PageSize: 20, MaterialType: "book|paper"}, false); err == nil {
		t.Fatal("combined query enum accepted")
	}
}

func TestPersonalIgnoresOfficialMetadataAndArchivedOfficialIsNotPending(t *testing.T) {
	s, db := libraryService(t)
	input := libraryRequest()
	input.Author = "Not personal"
	input.MaterialType = "paper"
	input.LicenseStatus = "authorized"
	item, err := s.CreatePersonal("alice", input)
	if err != nil {
		t.Fatal(err)
	}
	if item.Author != "" || item.MaterialType == "paper" {
		t.Fatal("personal polluted by official fields")
	}
	db.Create(&materialmodel.Material{ID: "archived-official", OwnerUserID: "admin", LibraryScope: "official", Status: "archived", Title: "Archived official"})
	db.Create(&materialmodel.Material{ID: "pending-community", OwnerUserID: "alice", LibraryScope: "community", Status: "pending", Title: "Pending community"})
	count, err := s.repository.CountPendingMaterials()
	if err != nil || count != 1 {
		t.Fatalf("pending count %d %v", count, err)
	}
	queue, err := s.repository.ListModerationItems()
	if err != nil || len(queue) != 1 || queue[0].ID != "pending-community" {
		t.Fatalf("queue %#v %v", queue, err)
	}
}

func TestOfficialStatusRequiresReasonAndScope(t *testing.T) {
	s, _ := libraryService(t)
	item, err := s.CreateOfficial("admin", "admin", libraryRequest())
	if err != nil {
		t.Fatal(err)
	}
	if _, err := s.ChangeOfficialStatus("admin", "admin", item.ID, materialdto.OfficialStatusRequest{Status: "archived"}); err == nil {
		t.Fatal("missing reason accepted")
	}
	result, err := s.ChangeOfficialStatus("admin", "admin", item.ID, materialdto.OfficialStatusRequest{Status: "archived", Reason: "Needs correction"})
	if err != nil || result.Status != "archived" || result.ArchiveReason != "Needs correction" {
		t.Fatalf("archive: %#v %v", result, err)
	}
	public, _ := s.ListOfficial()
	if len(public) != 0 {
		t.Fatal("archive leaked")
	}
}
