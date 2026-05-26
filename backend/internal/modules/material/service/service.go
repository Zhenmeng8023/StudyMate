package service

import (
	"errors"
	"net/http"
	"os"

	"gorm.io/gorm"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialmodel "studymate/backend/internal/modules/material/model"
	materialrepo "studymate/backend/internal/modules/material/repository"
	"studymate/backend/internal/pkg/apperrors"
)

type Service struct {
	repository *materialrepo.Repository
	auditLogs  *adminrepo.AuditLogRepository
}

func NewService(repository *materialrepo.Repository, auditLogs *adminrepo.AuditLogRepository) *Service {
	return &Service{
		repository: repository,
		auditLogs:  auditLogs,
	}
}

func (s *Service) ListMaterials() ([]materialdto.MaterialSummary, error) {
	materials, err := s.repository.ListApproved()
	if err != nil {
		return nil, apperrors.Internal("读取资料列表失败")
	}
	return materials, nil
}

func (s *Service) CreateMaterial(ownerUserID string, request materialdto.CreateMaterialRequest) (*materialdto.MaterialSummary, error) {
	material := &materialmodel.Material{
		OwnerUserID:      ownerUserID,
		Title:            request.Title,
		Description:      request.Description,
		Category:         request.Category,
		Tags:             materialrepo.EncodeTags(request.Tags),
		CoverFileID:      request.CoverFileID,
		AttachmentFileID: request.AttachmentFileID,
		Status:           "pending",
	}

	if err := s.repository.Create(material); err != nil {
		return nil, apperrors.Internal("创建资料失败")
	}

	_ = s.auditLogs.Create(ownerUserID, "material.create", "material", map[string]any{
		"materialId": material.ID,
	})

	return s.repository.BuildSummary(material)
}

func (s *Service) GetMaterial(materialID string) (*materialdto.MaterialSummary, error) {
	material, err := s.repository.FindByID(materialID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "material_not_found", "资料不存在")
		}
		return nil, apperrors.Internal("读取资料失败")
	}
	if material.Status != "approved" {
		return nil, apperrors.New(http.StatusNotFound, "material_not_visible", "资料暂未公开")
	}
	return s.repository.BuildSummary(material)
}

func (s *Service) UpdateMaterial(actorUserID string, materialID string, request materialdto.UpdateMaterialRequest) (*materialdto.MaterialSummary, error) {
	material, err := s.repository.FindByID(materialID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "material_not_found", "资料不存在")
		}
		return nil, apperrors.Internal("读取资料失败")
	}
	if material.OwnerUserID != actorUserID {
		return nil, apperrors.New(http.StatusForbidden, "forbidden", "只能编辑自己创建的资料")
	}

	material.Title = request.Title
	material.Description = request.Description
	material.Category = request.Category
	material.Tags = materialrepo.EncodeTags(request.Tags)
	material.CoverFileID = request.CoverFileID
	material.AttachmentFileID = request.AttachmentFileID
	material.Status = "pending"
	if err := s.repository.Save(material); err != nil {
		return nil, apperrors.Internal("更新资料失败")
	}

	return s.repository.BuildSummary(material)
}

func (s *Service) DeleteMaterial(actorUserID string, materialID string) error {
	material, err := s.repository.FindByID(materialID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return apperrors.New(http.StatusNotFound, "material_not_found", "资料不存在")
		}
		return apperrors.Internal("读取资料失败")
	}
	if material.OwnerUserID != actorUserID {
		return apperrors.New(http.StatusForbidden, "forbidden", "只能删除自己创建的资料")
	}

	if err := s.repository.Delete(material); err != nil {
		return apperrors.Internal("删除资料失败")
	}
	return nil
}

func (s *Service) ToggleFavorite(userID string, materialID string) (*materialdto.MaterialFavoriteResponse, error) {
	material, err := s.repository.FindByID(materialID)
	if err != nil || material.Status != "approved" {
		return nil, apperrors.New(http.StatusNotFound, "material_not_found", "资料不存在")
	}

	active, count, err := s.repository.ToggleFavorite(materialID, userID)
	if err != nil {
		return nil, apperrors.Internal("更新资料收藏失败")
	}
	return &materialdto.MaterialFavoriteResponse{Active: active, Count: count}, nil
}

func (s *Service) RateMaterial(userID string, materialID string, score int) (*materialdto.MaterialRatingResponse, error) {
	material, err := s.repository.FindByID(materialID)
	if err != nil || material.Status != "approved" {
		return nil, apperrors.New(http.StatusNotFound, "material_not_found", "资料不存在")
	}

	average, err := s.repository.UpsertRating(materialID, userID, score)
	if err != nil {
		return nil, apperrors.Internal("保存资料评分失败")
	}
	return &materialdto.MaterialRatingResponse{AverageRating: average, UserScore: score}, nil
}

func (s *Service) GetApprovedAttachment(materialID string) (*materialrepo.MaterialAttachment, error) {
	attachment, err := s.repository.FindApprovedAttachment(materialID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "material_attachment_not_found", "资料附件不存在")
		}
		return nil, apperrors.Internal("读取资料附件失败")
	}

	if _, err := os.Stat(attachment.File.Path); err != nil {
		return nil, apperrors.New(http.StatusNotFound, "material_attachment_missing", "资料附件文件不存在")
	}

	return attachment, nil
}
