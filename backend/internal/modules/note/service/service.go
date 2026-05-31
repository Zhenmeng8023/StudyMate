package service

import (
	"errors"
	"log"
	"net/http"

	"gorm.io/gorm"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	aidto "studymate/backend/internal/modules/ai/dto"
	aiservice "studymate/backend/internal/modules/ai/service"
	carddto "studymate/backend/internal/modules/card/dto"
	materialrepo "studymate/backend/internal/modules/material/repository"
	notedto "studymate/backend/internal/modules/note/dto"
	notemodel "studymate/backend/internal/modules/note/model"
	noterepo "studymate/backend/internal/modules/note/repository"
	"studymate/backend/internal/pkg/apperrors"
)

type Service struct {
	repository *noterepo.Repository
	documents  *noterepo.DocumentRepository
	materials  *materialrepo.Repository
	auditLogs  *adminrepo.AuditLogRepository
	aiTasks    *aiservice.Service
}

func NewService(
	repository *noterepo.Repository,
	documents *noterepo.DocumentRepository,
	materials *materialrepo.Repository,
	auditLogs *adminrepo.AuditLogRepository,
	aiTasks *aiservice.Service,
) *Service {
	return &Service{
		repository: repository,
		documents:  documents,
		materials:  materials,
		auditLogs:  auditLogs,
		aiTasks:    aiTasks,
	}
}

func (s *Service) ListNotes(ownerUserID string, materialID string) ([]notedto.NoteSummary, error) {
	notes, err := s.repository.ListByOwner(ownerUserID, materialID)
	if err != nil {
		return nil, apperrors.Internal("读取笔记列表失败")
	}

	return notes, nil
}

func (s *Service) CreateNote(ownerUserID string, request notedto.CreateNoteRequest) (*notedto.NoteSummary, error) {
	if err := s.ensureMaterialReadable(ownerUserID, request.MaterialID); err != nil {
		return nil, err
	}

	note := &notemodel.Note{
		OwnerUserID:   ownerUserID,
		Title:         request.Title,
		Summary:       request.Summary,
		Content:       request.Content,
		MaterialID:    request.MaterialID,
		FolderName:    request.FolderName,
		Tags:          noterepo.EncodeTags(request.Tags),
		VersionNumber: 1,
	}

	if err := s.repository.Create(note); err != nil {
		return nil, apperrors.Internal("创建笔记失败")
	}

	version := &notemodel.NoteVersion{
		NoteID:        note.ID,
		EditorUserID:  ownerUserID,
		VersionNumber: note.VersionNumber,
		Title:         note.Title,
		Summary:       note.Summary,
		Content:       note.Content,
	}
	if err := s.repository.CreateVersion(version); err != nil {
		return nil, apperrors.Internal("保存笔记版本失败")
	}

	if err := s.repository.EnsureMaterialRelation(note.ID, note.MaterialID); err != nil {
		return nil, apperrors.Internal("保存笔记关联失败")
	}

	s.syncMongoContent(note, version)

	_ = s.auditLogs.Create(ownerUserID, "note.create", "note", map[string]any{
		"noteId":     note.ID,
		"materialId": note.MaterialID,
	})

	result := noterepo.BuildSummary(*note)
	return &result, nil
}

func (s *Service) GetNote(ownerUserID string, noteID string) (*notedto.NoteSummary, error) {
	note, err := s.requireOwnerNote(ownerUserID, noteID)
	if err != nil {
		return nil, err
	}

	result := noterepo.BuildSummary(*note)
	return &result, nil
}

func (s *Service) UpdateNote(ownerUserID string, noteID string, request notedto.UpdateNoteRequest) (*notedto.NoteSummary, error) {
	note, err := s.requireOwnerNote(ownerUserID, noteID)
	if err != nil {
		return nil, err
	}

	note.VersionNumber++
	note.Title = request.Title
	note.Summary = request.Summary
	note.Content = request.Content
	note.FolderName = request.FolderName
	note.Tags = noterepo.EncodeTags(request.Tags)

	if err := s.repository.Save(note); err != nil {
		return nil, apperrors.Internal("更新笔记失败")
	}

	version := &notemodel.NoteVersion{
		NoteID:        note.ID,
		EditorUserID:  ownerUserID,
		VersionNumber: note.VersionNumber,
		Title:         note.Title,
		Summary:       note.Summary,
		Content:       note.Content,
	}
	if err := s.repository.CreateVersion(version); err != nil {
		return nil, apperrors.Internal("保存笔记版本失败")
	}

	s.syncMongoContent(note, version)

	result := noterepo.BuildSummary(*note)
	return &result, nil
}

func (s *Service) DeleteNote(ownerUserID string, noteID string) error {
	note, err := s.requireOwnerNote(ownerUserID, noteID)
	if err != nil {
		return err
	}

	if err := s.repository.Delete(note); err != nil {
		return apperrors.Internal("删除笔记失败")
	}

	if err := s.repository.DeleteVersions(note.ID); err != nil {
		return apperrors.Internal("删除笔记版本失败")
	}

	if err := s.repository.DeleteRelations(note.ID); err != nil {
		return apperrors.Internal("删除笔记关联失败")
	}

	s.deleteMongoContent(note.ID)

	return nil
}

func (s *Service) ListVersions(ownerUserID string, noteID string) ([]notedto.NoteVersionSummary, error) {
	if _, err := s.requireOwnerNote(ownerUserID, noteID); err != nil {
		return nil, err
	}

	versions, err := s.repository.ListVersions(noteID)
	if err != nil {
		return nil, apperrors.Internal("读取笔记版本失败")
	}

	return versions, nil
}

func (s *Service) RestoreVersion(ownerUserID string, noteID string, versionID string) (*notedto.NoteSummary, error) {
	note, err := s.requireOwnerNote(ownerUserID, noteID)
	if err != nil {
		return nil, err
	}

	version, err := s.repository.FindVersion(note.ID, versionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "note_version_not_found", "笔记版本不存�?")
		}
		return nil, apperrors.Internal("读取笔记版本失败")
	}

	note.VersionNumber++
	note.Title = version.Title
	note.Summary = version.Summary
	note.Content = version.Content

	if err := s.repository.Save(note); err != nil {
		return nil, apperrors.Internal("恢复笔记版本失败")
	}

	restoredVersion := &notemodel.NoteVersion{
		NoteID:        note.ID,
		EditorUserID:  ownerUserID,
		VersionNumber: note.VersionNumber,
		Title:         note.Title,
		Summary:       note.Summary,
		Content:       note.Content,
	}
	if err := s.repository.CreateVersion(restoredVersion); err != nil {
		return nil, apperrors.Internal("保存恢复后的笔记版本失败")
	}

	s.syncMongoContent(note, restoredVersion)

	result := noterepo.BuildSummary(*note)
	return &result, nil
}

func (s *Service) GenerateCardDrafts(ownerUserID string, noteID string) ([]carddto.CardDraftPayload, error) {
	note, err := s.requireOwnerNote(ownerUserID, noteID)
	if err != nil {
		return nil, err
	}

	summary := noterepo.BuildSummary(*note)
	drafts := BuildCardDraftsFromNote(summary)
	if s.aiTasks == nil {
		return drafts, nil
	}

	persisted, err := s.aiTasks.RecordNoteCardDrafts(ownerUserID, note.ID, drafts)
	if err != nil {
		return nil, err
	}

	return persisted, nil
}

func (s *Service) GenerateGraphDrafts(ownerUserID string, noteID string) ([]aidto.DraftPayload, error) {
	note, err := s.requireOwnerNote(ownerUserID, noteID)
	if err != nil {
		return nil, err
	}

	draft := BuildGraphDraftFromNote(noterepo.BuildSummary(*note))
	drafts := []aidto.DraftPayload{draft}
	if s.aiTasks == nil {
		return drafts, nil
	}

	persisted, err := s.aiTasks.RecordNoteGraphDrafts(ownerUserID, note.ID, drafts)
	if err != nil {
		return nil, err
	}

	return persisted, nil
}

func (s *Service) syncMongoContent(note *notemodel.Note, version *notemodel.NoteVersion) {
	if s.documents == nil {
		return
	}

	if err := s.documents.UpsertCurrent(note); err != nil {
		log.Printf("note mongo sync current failed: note=%s err=%v", note.ID, err)
	}

	if err := s.documents.CreateSnapshot(note, version); err != nil {
		log.Printf("note mongo sync snapshot failed: note=%s version=%d err=%v", note.ID, version.VersionNumber, err)
	}
}

func (s *Service) deleteMongoContent(noteID string) {
	if s.documents == nil {
		return
	}

	if err := s.documents.DeleteNoteArtifacts(noteID); err != nil {
		log.Printf("note mongo delete artifacts failed: note=%s err=%v", noteID, err)
	}
}

func (s *Service) requireOwnerNote(ownerUserID string, noteID string) (*notemodel.Note, error) {
	note, err := s.repository.FindByID(noteID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "note_not_found", "笔记不存�?")
		}
		return nil, apperrors.Internal("读取笔记失败")
	}

	if note.OwnerUserID != ownerUserID {
		return nil, apperrors.New(http.StatusForbidden, "forbidden", "只能访问自己的笔�?")
	}

	return note, nil
}

func (s *Service) ensureMaterialReadable(ownerUserID string, materialID string) error {
	if materialID == "" {
		return nil
	}

	material, err := s.materials.FindByID(materialID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperrors.New(http.StatusNotFound, "material_not_found", "资料不存�?")
		}
		return apperrors.Internal("读取资料失败")
	}

	if material.Status != "approved" && material.OwnerUserID != ownerUserID {
		return apperrors.New(http.StatusForbidden, "forbidden", "当前不能关联未公弢�的资�?")
	}

	return nil
}
