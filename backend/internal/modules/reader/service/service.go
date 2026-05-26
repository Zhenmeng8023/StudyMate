package service

import (
	"net/http"
	"strings"
	"time"

	adminrepo "studymate/backend/internal/modules/admin/repository"
	materialrepo "studymate/backend/internal/modules/material/repository"
	readerdto "studymate/backend/internal/modules/reader/dto"
	readermodel "studymate/backend/internal/modules/reader/model"
	readerrepo "studymate/backend/internal/modules/reader/repository"
	"studymate/backend/internal/pkg/apperrors"
)

type Service struct {
	repository *readerrepo.Repository
	materials  *materialrepo.Repository
	auditLogs  *adminrepo.AuditLogRepository
}

func NewService(repository *readerrepo.Repository, materials *materialrepo.Repository, auditLogs *adminrepo.AuditLogRepository) *Service {
	return &Service{
		repository: repository,
		materials:  materials,
		auditLogs:  auditLogs,
	}
}

func (s *Service) GetState(userID string, materialID string) (*readerdto.ReaderStateResponse, error) {
	if err := s.ensureReadable(materialID); err != nil {
		return nil, err
	}

	progress, err := s.repository.GetProgress(userID, materialID)
	if err != nil && !readerrepo.IsNotFound(err) {
		return nil, apperrors.Internal("读取阅读进度失败")
	}
	if readerrepo.IsNotFound(err) {
		progress = nil
	}

	annotations, err := s.repository.ListAnnotations(userID, materialID)
	if err != nil {
		return nil, apperrors.Internal("读取阅读批注失败")
	}

	state := readerrepo.BuildReaderState(progress, annotations)
	if state.MaterialID == "" {
		state.MaterialID = materialID
	}

	return &state, nil
}

func (s *Service) UpdateProgress(userID string, materialID string, request readerdto.UpdateProgressRequest) (*readerdto.ReaderStateResponse, error) {
	if err := s.ensureReadable(materialID); err != nil {
		return nil, err
	}

	progress, err := s.repository.GetProgress(userID, materialID)
	if err != nil && !readerrepo.IsNotFound(err) {
		return nil, apperrors.Internal("读取阅读进度失败")
	}

	if readerrepo.IsNotFound(err) {
		progress = &readermodel.ReadingProgress{
			UserID:     userID,
			MaterialID: materialID,
		}
	}

	progress.CurrentPage = request.CurrentPage
	progress.TotalPages = request.TotalPages
	progress.ProgressPercent = request.ProgressPercent
	progress.Bookmarks = readerrepo.EncodeBookmarks(request.Bookmarks)
	progress.LastReadAt = time.Now()

	if progress.ID == "" {
		if err := s.repository.CreateProgress(progress); err != nil {
			return nil, apperrors.Internal("保存阅读进度失败")
		}
	} else {
		if err := s.repository.SaveProgress(progress); err != nil {
			return nil, apperrors.Internal("保存阅读进度失败")
		}
	}

	annotations, err := s.repository.ListAnnotations(userID, materialID)
	if err != nil {
		return nil, apperrors.Internal("读取阅读批注失败")
	}

	state := readerrepo.BuildReaderState(progress, annotations)
	return &state, nil
}

func (s *Service) CreateAnnotation(userID string, materialID string, request readerdto.CreateAnnotationRequest) (*readerdto.AnnotationSummary, error) {
	if err := s.ensureReadable(materialID); err != nil {
		return nil, err
	}

	if strings.TrimSpace(request.Quote) == "" && strings.TrimSpace(request.Comment) == "" {
		return nil, apperrors.New(http.StatusBadRequest, "annotation_empty", "�������ݺ���ע����ͬʱΪ��")
	}

	annotation := &readermodel.PDFAnnotation{
		UserID:     userID,
		MaterialID: materialID,
		Page:       request.Page,
		Quote:      request.Quote,
		Comment:    request.Comment,
		Color:      request.Color,
	}

	if annotation.Color == "" {
		annotation.Color = "#f0d080"
	}

	if err := s.repository.CreateAnnotation(annotation); err != nil {
		return nil, apperrors.Internal("保存阅读批注失败")
	}

	_ = s.auditLogs.Create(userID, "reader.annotation.create", "annotation", map[string]any{
		"annotationId": annotation.ID,
		"materialId":   materialID,
		"page":         annotation.Page,
	})

	result := readerrepo.BuildAnnotationSummary(*annotation)
	return &result, nil
}

func (s *Service) DeleteAnnotation(userID string, materialID string, annotationID string) error {
	if err := s.ensureReadable(materialID); err != nil {
		return err
	}

	annotation, err := s.repository.FindAnnotation(userID, materialID, annotationID)
	if err != nil {
		if readerrepo.IsNotFound(err) {
			return apperrors.New(http.StatusNotFound, "annotation_not_found", "��ע������")
		}
		return apperrors.Internal("读取阅读批注失败")
	}

	if err := s.repository.DeleteAnnotation(annotation); err != nil {
		return apperrors.Internal("删除阅读批注失败")
	}

	return nil
}

func (s *Service) ensureReadable(materialID string) error {
	material, err := s.materials.FindByID(materialID)
	if err != nil {
		if readerrepo.IsNotFound(err) {
			return apperrors.New(http.StatusNotFound, "material_not_found", "资料不存�?")
		}
		return apperrors.Internal("读取资料失败")
	}

	if material.Status != "approved" {
		return apperrors.New(http.StatusForbidden, "material_not_visible", "当前资料还不可阅�?")
	}

	return nil
}

