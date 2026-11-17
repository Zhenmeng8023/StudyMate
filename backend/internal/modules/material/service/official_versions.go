package service

import (
	"errors"
	"gorm.io/gorm"
	"strings"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialmodel "studymate/backend/internal/modules/material/model"
	materialrepo "studymate/backend/internal/modules/material/repository"
	"studymate/backend/internal/pkg/apperrors"
	"time"
	"unicode/utf8"
)

func (s *Service) CreateOfficialVersion(userID, role, previousID string, request materialdto.CreateOfficialVersionRequest) (*materialdto.MaterialSummary, error) {
	if role != "admin" {
		return nil, apperrors.New(403, "admin_required", "仅管理员可以发布官方资料新版")
	}
	summary := strings.TrimSpace(request.ChangeSummary)
	if summary == "" || utf8.RuneCountInString(summary) > 500 || request.AttachmentFileID == "" {
		return nil, apperrors.New(400, "invalid_official_version", "新版需要 PDF 附件和最多500字的变更说明")
	}
	if err := s.validatePDFAttachment(userID, request.AttachmentFileID); err != nil {
		return nil, err
	}
	if err := s.validateFileOwner(userID, request.CoverFileID); err != nil {
		return nil, err
	}
	metadata, err := normalizeOfficialMetadata(request.OfficialMetadata)
	if err != nil {
		return nil, err
	}
	chain, err := s.repository.OfficialVersionChain(previousID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(404, "material_not_found", "官方资料不存在")
		}
		return nil, apperrors.Internal("读取官方资料版本记录失败")
	}
	if len(chain) >= 200 {
		return nil, apperrors.New(409, "official_version_limit", "版本记录已达到200项上限")
	}
	var next *materialmodel.Material
	err = s.repository.LibraryTransaction(func(repo *materialrepo.Repository, audit *adminrepo.AuditLogRepository) error {
		previous, err := repo.LockOfficial(previousID)
		if err != nil {
			return apperrors.New(404, "material_not_found", "官方资料不存在")
		}
		if previous.AttachmentFileID == request.AttachmentFileID {
			return apperrors.New(400, "different_attachment_required", "新版必须使用独立的新 PDF 附件")
		}
		if _, err := repo.FindOfficialSuccessor(previousID); err == nil {
			return apperrors.New(409, "official_version_exists", "该资料已有新版，请从最新版本继续发布")
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		item := &materialmodel.Material{PreviousVersionID: &previousID, ChangeSummary: summary, OwnerUserID: userID, LibraryScope: "official", Status: "approved", Title: request.Title, Description: request.Description, Category: request.Category, Tags: materialrepo.EncodeTags(request.Tags), AttachmentFileID: request.AttachmentFileID, CoverFileID: request.CoverFileID}
		applyOfficialMetadata(item, metadata)
		if err := repo.Create(item); err != nil {
			return err
		}
		if err := audit.Create(userID, "material.official.version", "material", map[string]any{"materialId": item.ID, "previousVersionId": previousID, "changeSummary": summary}); err != nil {
			return err
		}
		next = item
		return nil
	})
	if err != nil {
		if apperrors.As(err).Status < 500 {
			return nil, err
		}
		return nil, apperrors.Internal("发布官方资料新版失败")
	}
	return s.repository.BuildSummary(next)
}

func (s *Service) ListOfficialVersions(role, id string, management bool) (*materialdto.OfficialVersionsResponse, error) {
	if management && role != "admin" {
		return nil, apperrors.New(403, "admin_required", "仅管理员可以查看管理版本记录")
	}
	chain, err := s.repository.OfficialVersionChain(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(404, "material_not_found", "官方资料不存在")
		}
		return nil, apperrors.Internal("读取官方资料版本记录失败")
	}
	currentPublic := false
	for _, item := range chain {
		if item.ID == id && item.Status == "approved" {
			currentPublic = true
		}
	}
	if !management && !currentPublic {
		return nil, apperrors.New(404, "material_not_found", "官方资料不存在或不可公开访问")
	}
	result := &materialdto.OfficialVersionsResponse{CurrentMaterialID: id, Items: make([]materialdto.OfficialVersionItem, 0)}
	for _, item := range chain {
		if result.LatestPublishedID == "" && item.Status == "approved" {
			result.LatestPublishedID = item.ID
		}
		if !management && item.Status != "approved" {
			continue
		}
		result.Items = append(result.Items, materialdto.OfficialVersionItem{ID: item.ID, Title: item.Title, Edition: item.Edition, Status: item.Status, ChangeSummary: item.ChangeSummary, CreatedAt: item.CreatedAt.Format(time.RFC3339)})
	}
	return result, nil
}

func (s *Service) GetManagedOfficialMaterial(role, id string) (*materialdto.MaterialSummary, error) {
	if role != "admin" {
		return nil, apperrors.New(403, "admin_required", "仅管理员可以管理官方资料")
	}
	item, err := s.repository.FindByID(id)
	if err != nil || item.LibraryScope != "official" {
		return nil, apperrors.New(404, "material_not_found", "官方资料不存在")
	}
	return s.repository.BuildSummary(item)
}
