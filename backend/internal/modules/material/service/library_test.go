package service

import (
	"net/http"
	"os"
	"path/filepath"
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	adminmodel "studymate/backend/internal/modules/admin/model"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	filemodel "studymate/backend/internal/modules/file/model"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialmodel "studymate/backend/internal/modules/material/model"
	materialrepo "studymate/backend/internal/modules/material/repository"
	readermodel "studymate/backend/internal/modules/reader/model"
	"studymate/backend/internal/pkg/apperrors"
)

func libraryService(t *testing.T) (*Service, *gorm.DB) {
	t.Helper()
	db, err := gorm.Open(sqlite.Open("file:"+t.Name()+"?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&materialmodel.Material{}, &materialmodel.MaterialFavorite{}, &materialmodel.MaterialRating{}, &filemodel.FileRecord{}, &adminmodel.AuditLog{}, &readermodel.ReadingProgress{}); err != nil {
		t.Fatal(err)
	}
	if err := db.Exec("CREATE TABLE users (id TEXT PRIMARY KEY, display_name TEXT)").Error; err != nil {
		t.Fatal(err)
	}
	db.Exec("INSERT INTO users VALUES ('alice', 'Alice'), ('bob', 'Bob'), ('admin', 'Admin')")
	return NewService(materialrepo.NewRepository(db), adminrepo.NewAuditLogRepository(db)), db
}

func libraryRequest() materialdto.CreateMaterialRequest {
	return materialdto.CreateMaterialRequest{Title: "Private book", Description: "My reading resource", Category: "book", FolderName: "Reading"}
}

func TestNewMaterialsRejectExistingNonPDFAttachments(t *testing.T) {
	for _, scope := range []string{"personal", "official", "community"} {
		t.Run(scope, func(t *testing.T) {
			s, db := libraryService(t)
			path := filepath.Join(t.TempDir(), "fake.pdf")
			if err := os.WriteFile(path, []byte("not a PDF even though the database MIME says PDF"), 0600); err != nil {
				t.Fatal(err)
			}
			if err := db.Create(&filemodel.FileRecord{ID: "legacy-word", OwnerUserID: "alice", OriginalName: "fake.pdf", StoredName: "fake.pdf", Path: path, MimeType: "application/pdf"}).Error; err != nil {
				t.Fatal(err)
			}
			request := libraryRequest()
			request.AttachmentFileID = "legacy-word"
			var err error
			switch scope {
			case "personal":
				_, err = s.CreatePersonal("alice", request)
			case "official":
				_, err = s.CreateOfficial("alice", "admin", request)
			default:
				_, err = s.CreateMaterial("alice", request)
			}
			if err == nil || apperrors.As(err).Status != http.StatusBadRequest {
				t.Fatalf("non-PDF attachment accepted: %v", err)
			}
		})
	}
}

func TestHistoricalWordMetadataCanStillBeEdited(t *testing.T) {
	s, db := libraryService(t)
	material := materialmodel.Material{ID: "old-word", OwnerUserID: "alice", LibraryScope: "personal", Status: "private", Title: "Historical Word", AttachmentFileID: "old-word-file"}
	if err := db.Create(&material).Error; err != nil {
		t.Fatal(err)
	}
	_, err := s.UpdateLibraryMaterial("alice", "student", material.ID, "personal", materialdto.UpdateMaterialRequest{Title: "Renamed historical Word", Description: "Keep existing historical document", Category: "book", AttachmentFileID: "old-word-file"})
	if err != nil {
		t.Fatalf("unchanged historical attachment blocks metadata edit: %v", err)
	}
}

func TestNewPDFAttachmentValidatesContentsButRetainsHistoricalCover(t *testing.T) {
	s, db := libraryService(t)
	path := filepath.Join(t.TempDir(), "reading.pdf")
	if err := os.WriteFile(path, []byte("%PDF-1.7\nreading contents"), 0600); err != nil {
		t.Fatal(err)
	}
	for _, record := range []filemodel.FileRecord{
		{ID: "pdf", OwnerUserID: "alice", OriginalName: "READING.PDF", StoredName: "reading.pdf", Path: path, MimeType: "application/pdf"},
		{ID: "cover", OwnerUserID: "alice", OriginalName: "cover.jpg", StoredName: "cover.jpg", Path: "historical-cover.jpg", MimeType: "image/jpeg"},
	} {
		if err := db.Create(&record).Error; err != nil {
			t.Fatal(err)
		}
	}
	request := libraryRequest()
	request.AttachmentFileID, request.CoverFileID = "pdf", "cover"
	if _, err := s.CreatePersonal("alice", request); err != nil {
		t.Fatalf("valid PDF with historical cover rejected: %v", err)
	}
	if err := db.Model(&filemodel.FileRecord{}).Where("id = ?", "pdf").Update("original_name", "reading.docx").Error; err != nil {
		t.Fatal(err)
	}
	if _, err := s.CreatePersonal("alice", request); err == nil {
		t.Fatal("non-PDF filename accepted with PDF bytes")
	}
	if err := db.Model(&filemodel.FileRecord{}).Where("id = ?", "pdf").Updates(map[string]any{"original_name": "reading.pdf", "mime_type": "application/msword"}).Error; err != nil {
		t.Fatal(err)
	}
	if _, err := s.CreatePersonal("alice", request); err == nil {
		t.Fatal("non-PDF MIME accepted")
	}
}

func TestPersonalLibraryIsPrivateAndNeverEntersModeration(t *testing.T) {
	s, db := libraryService(t)
	created, err := s.CreatePersonal("alice", libraryRequest())
	if err != nil {
		t.Fatal(err)
	}
	if created.LibraryScope != "personal" || created.Status != "private" || created.FolderName != "Reading" {
		t.Fatalf("unexpected personal item: %#v", created)
	}
	if _, err := s.GetLibraryMaterial("bob", created.ID); apperrors.As(err).Status != http.StatusNotFound {
		t.Fatalf("other user got private item: %v", err)
	}
	if _, err := s.GetMaterial(created.ID); apperrors.As(err).Status != http.StatusNotFound {
		t.Fatalf("public route got private item: %v", err)
	}
	public, err := s.ListMaterials()
	if err != nil || len(public) != 0 {
		t.Fatalf("public items: %#v %v", public, err)
	}
	personal, err := s.ListLibrary("alice")
	if err != nil || len(personal) != 1 {
		t.Fatalf("personal items: %#v %v", personal, err)
	}
	bob, err := s.ListLibrary("bob")
	if err != nil || len(bob) != 0 {
		t.Fatalf("bob items: %#v %v", bob, err)
	}
	pending, err := materialrepo.NewRepository(db).CountPendingMaterials()
	if err != nil || pending != 0 {
		t.Fatalf("private entered moderation: %d %v", pending, err)
	}
}

func TestOfficialRequiresAdminAndCollectionIsIdempotent(t *testing.T) {
	s, db := libraryService(t)
	if _, err := s.CreateOfficial("alice", "student", libraryRequest()); apperrors.As(err).Status != http.StatusForbidden {
		t.Fatalf("non-admin publication: %v", err)
	}
	official, err := s.CreateOfficial("admin", "admin", libraryRequest())
	if err != nil {
		t.Fatal(err)
	}
	if official.LibraryScope != "official" || official.Status != "approved" {
		t.Fatalf("official item: %#v", official)
	}
	for range 2 {
		if err := s.SetCollection("alice", official.ID, true); err != nil {
			t.Fatal(err)
		}
	}
	var count int64
	db.Model(&materialmodel.MaterialFavorite{}).Count(&count)
	if count != 1 {
		t.Fatalf("duplicate collection: %d", count)
	}
	items, err := s.ListLibrary("alice")
	if err != nil || len(items) != 1 || !items[0].IsCollected {
		t.Fatalf("collection list: %#v %v", items, err)
	}
	for range 2 {
		if err := s.SetCollection("alice", official.ID, false); err != nil {
			t.Fatal(err)
		}
	}
	items, err = s.ListLibrary("alice")
	if err != nil || len(items) != 0 {
		t.Fatalf("uncollect: %#v %v", items, err)
	}
}

func TestPersonalAttachmentMustBelongToUploader(t *testing.T) {
	s, db := libraryService(t)
	db.Create(&filemodel.FileRecord{ID: "bob-file", OwnerUserID: "bob", OriginalName: "bob.pdf", StoredName: "bob.pdf", Path: "bob.pdf", MimeType: "application/pdf"})
	request := libraryRequest()
	request.AttachmentFileID = "bob-file"
	if _, err := s.CreatePersonal("alice", request); apperrors.As(err).Status != http.StatusForbidden {
		t.Fatalf("foreign file accepted: %v", err)
	}
	request.AttachmentFileID = "missing"
	if _, err := s.CreatePersonal("alice", request); apperrors.As(err).Status != http.StatusBadRequest {
		t.Fatalf("missing file accepted: %v", err)
	}
}

func TestLegacyCannotMutateLibraryScopes(t *testing.T) {
	s, _ := libraryService(t)
	item, err := s.CreatePersonal("alice", libraryRequest())
	if err != nil {
		t.Fatal(err)
	}
	if _, err := s.UpdateMaterial("alice", item.ID, materialdto.UpdateMaterialRequest{Title: "Changed", Description: "changed content", Category: "book"}); apperrors.As(err).Status != http.StatusForbidden {
		t.Fatalf("legacy route mutated personal: %v", err)
	}
	if err := s.DeleteMaterial("alice", item.ID); apperrors.As(err).Status != http.StatusForbidden {
		t.Fatalf("legacy route deleted personal: %v", err)
	}
}

func TestLibraryUpdatesKeepFileAnchorsAndArchiveRemovesVisibility(t *testing.T) {
	s, _ := libraryService(t)
	item, err := s.CreatePersonal("alice", libraryRequest())
	if err != nil {
		t.Fatal(err)
	}
	update := materialdto.UpdateMaterialRequest{Title: "Updated book", Description: "An updated description", Category: "book", FolderName: "New folder", Tags: []string{"math"}}
	changed, err := s.UpdateLibraryMaterial("alice", "student", item.ID, "personal", update)
	if err != nil || changed.FolderName != "New folder" || len(changed.Tags) != 1 {
		t.Fatalf("update failed: %#v %v", changed, err)
	}
	update.AttachmentFileID = "new-file"
	if _, err := s.UpdateLibraryMaterial("alice", "student", item.ID, "personal", update); apperrors.As(err).Status != http.StatusConflict {
		t.Fatalf("file anchors replaced: %v", err)
	}
	if err := s.DeleteLibraryMaterial("bob", "admin", item.ID, "personal"); apperrors.As(err).Status != http.StatusNotFound {
		t.Fatalf("admin deleted private item through user API: %v", err)
	}
	if err := s.DeleteLibraryMaterial("alice", "student", item.ID, "personal"); err != nil {
		t.Fatal(err)
	}
	items, err := s.ListLibrary("alice")
	if err != nil || len(items) != 0 {
		t.Fatalf("archived still listed: %#v %v", items, err)
	}
	if _, err := s.GetLibraryMaterial("alice", item.ID); apperrors.As(err).Status != http.StatusNotFound {
		t.Fatalf("archived still readable: %v", err)
	}
}

func TestOfficialListsDoNotRelabelLegacyAndDownlistingRemovesCollections(t *testing.T) {
	s, _ := libraryService(t)
	legacy, err := s.CreateMaterial("alice", libraryRequest())
	if err != nil {
		t.Fatal(err)
	}
	if legacy.LibraryScope != "community" || legacy.Status != "pending" {
		t.Fatalf("legacy changed: %#v", legacy)
	}
	official, err := s.CreateOfficial("admin", "admin", libraryRequest())
	if err != nil {
		t.Fatal(err)
	}
	listed, err := s.ListOfficial()
	if err != nil || len(listed) != 1 || listed[0].ID != official.ID {
		t.Fatalf("official list: %#v %v", listed, err)
	}
	if err := s.SetCollection("alice", official.ID, true); err != nil {
		t.Fatal(err)
	}
	if err := s.DeleteLibraryMaterial("admin", "student", official.ID, "official"); apperrors.As(err).Status != http.StatusForbidden {
		t.Fatalf("unprivileged downlisting: %v", err)
	}
	if err := s.DeleteLibraryMaterial("admin", "admin", official.ID, "official"); err != nil {
		t.Fatal(err)
	}
	listed, err = s.ListOfficial()
	if err != nil || len(listed) != 0 {
		t.Fatalf("official downlisting: %#v %v", listed, err)
	}
	collected, err := s.ListLibrary("alice")
	if err != nil || len(collected) != 0 {
		t.Fatalf("hidden collection readable: %#v %v", collected, err)
	}
	if err := s.SetCollection("alice", official.ID, false); err != nil {
		t.Fatal(err)
	}
}

func TestMetadataEditCannotRestoreConcurrentArchive(t *testing.T) {
	for _, scope := range []string{"personal", "official"} {
		t.Run(scope, func(t *testing.T) {
			s, db := libraryService(t)
			user, role := "alice", "student"
			var item *materialdto.MaterialSummary
			var err error
			if scope == "official" {
				user, role = "admin", "admin"
				item, err = s.CreateOfficial(user, role, libraryRequest())
			} else {
				item, err = s.CreatePersonal(user, libraryRequest())
			}
			if err != nil {
				t.Fatal(err)
			}
			// Deterministically place the archive after the service read and before its write.
			if err := db.Callback().Update().Before("gorm:update").Register("test:concurrent_archive", func(tx *gorm.DB) {
				if err := tx.Exec("UPDATE materials SET status = 'archived' WHERE id = ?", item.ID).Error; err != nil {
					tx.AddError(err)
				}
			}); err != nil {
				t.Fatal(err)
			}
			_, err = s.UpdateLibraryMaterial(user, role, item.ID, scope, materialdto.UpdateMaterialRequest{Title: "Edited title", Description: "Edited description", Category: "book"})
			if err != nil {
				t.Fatal(err)
			}
			var stored materialmodel.Material
			if err := db.First(&stored, "id = ?", item.ID).Error; err != nil {
				t.Fatal(err)
			}
			if stored.Status != "archived" {
				t.Fatalf("metadata edit restored archived resource: status=%s", stored.Status)
			}
			if _, err := s.GetLibraryMaterial(user, item.ID); apperrors.As(err).Status != http.StatusNotFound {
				t.Fatalf("archived resource became readable: %v", err)
			}
		})
	}
}

func TestArchiveDoesNotOverwriteConcurrentMetadataEdit(t *testing.T) {
	s, db := libraryService(t)
	item, err := s.CreatePersonal("alice", libraryRequest())
	if err != nil {
		t.Fatal(err)
	}
	if err := db.Callback().Update().Before("gorm:update").Register("test:concurrent_metadata", func(tx *gorm.DB) {
		if err := tx.Exec("UPDATE materials SET title = 'Newer title' WHERE id = ?", item.ID).Error; err != nil {
			tx.AddError(err)
		}
	}); err != nil {
		t.Fatal(err)
	}
	if err := s.DeleteLibraryMaterial("alice", "student", item.ID, "personal"); err != nil {
		t.Fatal(err)
	}
	var stored materialmodel.Material
	if err := db.First(&stored, "id = ?", item.ID).Error; err != nil {
		t.Fatal(err)
	}
	if stored.Status != "archived" || stored.Title != "Newer title" {
		t.Fatalf("archive overwrote concurrent edit: %#v", stored)
	}
}

func TestLibraryPublicationRollsBackWhenAuditCannotBeWritten(t *testing.T) {
	s, db := libraryService(t)
	if err := db.Migrator().DropTable(&adminmodel.AuditLog{}); err != nil {
		t.Fatal(err)
	}
	if _, err := s.CreateOfficial("admin", "admin", libraryRequest()); err == nil {
		t.Fatal("official publication succeeded without an audit record")
	}
	var count int64
	if err := db.Model(&materialmodel.Material{}).Count(&count).Error; err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Fatalf("unaudited publication persisted: %d", count)
	}
}

func TestLibraryUpdateAndArchiveRollBackWhenAuditCannotBeWritten(t *testing.T) {
	for _, action := range []string{"update", "archive"} {
		t.Run(action, func(t *testing.T) {
			s, db := libraryService(t)
			item, err := s.CreateOfficial("admin", "admin", libraryRequest())
			if err != nil {
				t.Fatal(err)
			}
			if err := db.Migrator().DropTable(&adminmodel.AuditLog{}); err != nil {
				t.Fatal(err)
			}
			if action == "update" {
				_, err = s.UpdateLibraryMaterial("admin", "admin", item.ID, "official", materialdto.UpdateMaterialRequest{Title: "Unaudited change", Description: "Changed content", Category: "book"})
			} else {
				err = s.DeleteLibraryMaterial("admin", "admin", item.ID, "official")
			}
			if err == nil {
				t.Fatalf("%s succeeded without an audit record", action)
			}
			var stored materialmodel.Material
			if err := db.First(&stored, "id = ?", item.ID).Error; err != nil {
				t.Fatal(err)
			}
			if stored.Title != item.Title || stored.Status != "approved" {
				t.Fatalf("unaudited mutation persisted: %#v", stored)
			}
		})
	}
}
