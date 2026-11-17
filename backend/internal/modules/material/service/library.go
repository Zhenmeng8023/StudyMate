package service

import (
	"bytes"
	"errors"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"gorm.io/gorm"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialmodel "studymate/backend/internal/modules/material/model"
	materialrepo "studymate/backend/internal/modules/material/repository"
	"studymate/backend/internal/pkg/apperrors"
)

func (s *Service) ListLibrary(userID string) ([]materialdto.MaterialSummary, error) {
	items, err := s.repository.ListLibrary(userID)
	if err != nil {
		return nil, apperrors.Internal("读取个人知识库失败")
	}
	return items, nil
}

func (s *Service) ListOfficial() ([]materialdto.MaterialSummary, error) {
	items, err := s.repository.ListOfficial()
	if err != nil {
		return nil, apperrors.Internal("读取官方资料库失败")
	}
	return items, nil
}

func (s *Service) GetLibraryMaterial(userID, id string) (*materialdto.MaterialSummary, error) {
	material, err := s.requireReadable(userID, id)
	if err != nil {
		return nil, err
	}
	item, err := s.repository.BuildSummary(material)
	if err != nil {
		return nil, apperrors.Internal("读取资料失败")
	}
	item.IsCollected, err = s.repository.IsCollected(userID, id)
	if err != nil {
		return nil, apperrors.Internal("读取收藏状态失败")
	}
	items, err := s.repository.WithReadingProgress(userID, []materialdto.MaterialSummary{*item})
	if err != nil {
		return nil, apperrors.Internal("读取阅读进度失败")
	}
	return &items[0], nil
}

func (s *Service) requireReadable(userID, id string) (*materialmodel.Material, error) {
	material, err := s.repository.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "material_not_found", "资料不存在或不可访问")
		}
		return nil, apperrors.Internal("读取资料失败")
	}
	if !material.CanRead(userID) {
		return nil, apperrors.New(http.StatusNotFound, "material_not_found", "资料不存在或不可访问")
	}
	return material, nil
}

func (s *Service) CreatePersonal(userID string, request materialdto.CreateMaterialRequest) (*materialdto.MaterialSummary, error) {
	return s.createLibraryMaterial(userID, "personal", "private", request)
}

func (s *Service) CreateOfficial(userID, role string, request materialdto.CreateMaterialRequest) (*materialdto.MaterialSummary, error) {
	if role != "admin" {
		return nil, apperrors.New(http.StatusForbidden, "admin_required", "仅管理员可以维护官方资料")
	}
	return s.createLibraryMaterial(userID, "official", "approved", request)
}

func (s *Service) createLibraryMaterial(userID, scope, status string, request materialdto.CreateMaterialRequest) (*materialdto.MaterialSummary, error) {
	metadata, metadataErr := normalizeOfficialMetadata(request.OfficialMetadata)
	if scope == "official" && metadataErr != nil {
		return nil, metadataErr
	}
	if err := s.validatePDFAttachment(userID, request.AttachmentFileID); err != nil {
		return nil, err
	}
	if err := s.validateFileOwner(userID, request.CoverFileID); err != nil {
		return nil, err
	}
	material := &materialmodel.Material{OwnerUserID: userID, LibraryScope: scope, Status: status, FolderName: strings.TrimSpace(request.FolderName), Title: request.Title, Description: request.Description, Category: request.Category, Tags: materialrepo.EncodeTags(request.Tags), CoverFileID: request.CoverFileID, AttachmentFileID: request.AttachmentFileID}
	if scope == "official" {
		applyOfficialMetadata(material, metadata)
	}
	if err := s.repository.LibraryTransaction(func(repository *materialrepo.Repository, auditLogs *adminrepo.AuditLogRepository) error {
		if err := repository.Create(material); err != nil {
			return err
		}
		return auditLogs.Create(userID, "material."+scope+".create", "material", map[string]any{"materialId": material.ID})
	}); err != nil {
		return nil, apperrors.Internal("保存资料及审计记录失败")
	}
	return s.repository.BuildSummary(material)
}

func (s *Service) validateFileOwner(userID, fileID string) error {
	if fileID == "" {
		return nil
	}
	file, err := s.repository.FindFile(fileID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperrors.New(http.StatusBadRequest, "invalid_attachment", "关联文件不存在")
		}
		return apperrors.Internal("读取文件失败")
	}
	if file.OwnerUserID != userID {
		return apperrors.New(http.StatusForbidden, "file_owner_required", "只能关联自己上传的文件")
	}
	return nil
}

func (s *Service) validatePDFAttachment(userID, fileID string) error {
	if err := s.validateFileOwner(userID, fileID); err != nil {
		return err
	}
	if fileID == "" {
		return nil
	}
	record, err := s.repository.FindFile(fileID)
	if err != nil {
		return apperrors.Internal("读取附件失败")
	}
	if !strings.EqualFold(filepath.Ext(record.OriginalName), ".pdf") || record.MimeType != "application/pdf" {
		return apperrors.New(http.StatusBadRequest, "pdf_attachment_required", "资料仅支持 PDF 附件")
	}
	file, err := os.Open(record.Path)
	if err != nil {
		return apperrors.New(http.StatusBadRequest, "invalid_attachment", "附件文件不可读取，请重新上传 PDF")
	}
	defer file.Close()
	var prefix [5]byte
	if _, err := io.ReadFull(file, prefix[:]); err != nil || !bytes.Equal(prefix[:], []byte("%PDF-")) {
		return apperrors.New(http.StatusBadRequest, "pdf_attachment_required", "资料仅支持有效的 PDF 附件")
	}
	return nil
}

func (s *Service) UpdateLibraryMaterial(userID, role, id, scope string, request materialdto.UpdateMaterialRequest) (*materialdto.MaterialSummary, error) {
	material, err := s.requireManager(userID, role, id, scope)
	if err != nil {
		return nil, err
	}
	// Replacing a file would invalidate existing page anchors. Create a new resource instead.
	if material.AttachmentFileID != request.AttachmentFileID {
		return nil, apperrors.New(http.StatusConflict, "attachment_immutable", "请新建资料上传新版本，避免已有批注错位")
	}
	if material.CoverFileID != request.CoverFileID {
		if err := s.validateFileOwner(userID, request.CoverFileID); err != nil {
			return nil, err
		}
	}
	updated := *material
	if scope == "official" && request.OfficialMetadata != (materialdto.OfficialMetadata{}) {
		metadata, err := normalizeOfficialMetadata(request.OfficialMetadata)
		if err != nil {
			return nil, err
		}
		applyOfficialMetadata(&updated, metadata)
	}
	updated.Title, updated.Description, updated.Category = request.Title, request.Description, request.Category
	updated.FolderName, updated.Tags, updated.CoverFileID = strings.TrimSpace(request.FolderName), materialrepo.EncodeTags(request.Tags), request.CoverFileID
	if err := s.repository.LibraryTransaction(func(repository *materialrepo.Repository, auditLogs *adminrepo.AuditLogRepository) error {
		if err := repository.UpdateLibraryMetadata(&updated); err != nil {
			return err
		}
		return auditLogs.Create(userID, "material."+scope+".update", "material", map[string]any{"materialId": id})
	}); err != nil {
		return nil, apperrors.Internal("更新资料及审计记录失败")
	}
	return s.repository.BuildSummary(&updated)
}

func (s *Service) requireManager(userID, role, id, scope string) (*materialmodel.Material, error) {
	if scope == "official" && role != "admin" {
		return nil, apperrors.New(http.StatusForbidden, "admin_required", "仅管理员可以维护官方资料")
	}
	material, err := s.repository.FindByID(id)
	if err != nil {
		return nil, apperrors.New(http.StatusNotFound, "material_not_found", "资料不存在")
	}
	if material.LibraryScope != scope || (scope == "personal" && material.OwnerUserID != userID) {
		return nil, apperrors.New(http.StatusNotFound, "material_not_found", "资料不存在或不可管理")
	}
	return material, nil
}

func (s *Service) DeleteLibraryMaterial(userID, role, id, scope string) error {
	if scope == "official" {
		_, err := s.ChangeOfficialStatus(userID, role, id, materialdto.OfficialStatusRequest{Status: "archived", Reason: "Archived by administrator"})
		return err
	}

	material, err := s.requireManager(userID, role, id, scope)
	if err != nil {
		return err
	}
	// Keep the resource and original file so notes and annotations retain their source identity.
	if err := s.repository.LibraryTransaction(func(repository *materialrepo.Repository, auditLogs *adminrepo.AuditLogRepository) error {
		if err := repository.ArchiveLibraryMaterial(material.ID); err != nil {
			return err
		}
		return auditLogs.Create(userID, "material."+scope+".archive", "material", map[string]any{"materialId": id})
	}); err != nil {
		return apperrors.Internal("归档资料及审计记录失败")
	}
	return nil
}

func (s *Service) SetCollection(userID, id string, active bool) error {
	if active {
		material, err := s.requireReadable(userID, id)
		if err != nil {
			return err
		}
		if material.LibraryScope != "official" {
			return apperrors.New(http.StatusBadRequest, "official_required", "此入口仅收藏官方资料")
		}
	}
	if err := s.repository.SetCollection(userID, id, active); err != nil {
		return apperrors.Internal("更新收藏失败")
	}
	return nil
}

func (s *Service) GetLibraryAttachment(userID, id string) (*materialrepo.MaterialAttachment, error) {
	material, err := s.requireReadable(userID, id)
	if err != nil {
		return nil, err
	}
	file, err := s.repository.FindFile(material.AttachmentFileID)
	if err != nil {
		return nil, apperrors.New(http.StatusNotFound, "material_attachment_not_found", "资料附件不存在")
	}
	if _, err := os.Stat(file.Path); err != nil {
		return nil, apperrors.New(http.StatusNotFound, "material_attachment_missing", "资料附件文件不存在")
	}
	return &materialrepo.MaterialAttachment{Material: *material, File: *file}, nil
}
