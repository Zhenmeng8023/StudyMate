package service

import (
	"net/http"
	"strings"
	"time"

	adminrepo "studymate/backend/internal/modules/admin/repository"
	aidto "studymate/backend/internal/modules/ai/dto"
	aiservice "studymate/backend/internal/modules/ai/service"
	carddto "studymate/backend/internal/modules/card/dto"
	materialmodel "studymate/backend/internal/modules/material/model"
	materialrepo "studymate/backend/internal/modules/material/repository"
	readerdto "studymate/backend/internal/modules/reader/dto"
	readermodel "studymate/backend/internal/modules/reader/model"
	readerrepo "studymate/backend/internal/modules/reader/repository"
	"studymate/backend/internal/pkg/apperrors"
)

type readerRepository interface {
	GetProgress(userID string, materialID string) (*readermodel.ReadingProgress, error)
	SaveProgress(progress *readermodel.ReadingProgress) error
	CreateProgress(progress *readermodel.ReadingProgress) error
	ListAnnotations(userID string, materialID string) ([]readerdto.AnnotationSummary, error)
	CreateAnnotation(annotation *readermodel.PDFAnnotation) error
	FindAnnotation(userID string, materialID string, annotationID string) (*readermodel.PDFAnnotation, error)
	DeleteAnnotation(annotation *readermodel.PDFAnnotation) error
}

type materialLookup interface {
	FindByID(materialID string) (*materialmodel.Material, error)
}

type auditLogWriter interface {
	Create(actorID string, action string, target string, metadata map[string]any) error
}

type aiDraftRecorder interface {
	RecordReaderCardDrafts(userID string, materialID string, drafts []carddto.CardDraftPayload) ([]carddto.CardDraftPayload, error)
	RecordReaderGraphDrafts(userID string, materialID string, drafts []aidto.DraftPayload) ([]aidto.DraftPayload, error)
}

type Service struct {
	repository readerRepository
	materials  materialLookup
	auditLogs  auditLogWriter
	aiTasks    aiDraftRecorder
}

func NewService(repository readerRepository, materials materialLookup, auditLogs auditLogWriter, aiTasks aiDraftRecorder) *Service {
	return &Service{
		repository: repository,
		materials:  materials,
		auditLogs:  auditLogs,
		aiTasks:    aiTasks,
	}
}

var _ readerRepository = (*readerrepo.Repository)(nil)
var _ materialLookup = (*materialrepo.Repository)(nil)
var _ auditLogWriter = (*adminrepo.AuditLogRepository)(nil)
var _ aiDraftRecorder = (*aiservice.Service)(nil)

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
		Rects:      readerrepo.EncodePDFRects(request.Rects),
	}

	if annotation.Color == "" {
		annotation.Color = "#f0d080"
	}

	if err := s.repository.CreateAnnotation(annotation); err != nil {
		return nil, apperrors.Internal("保存阅读批注失败")
	}

	if s.auditLogs != nil {
		_ = s.auditLogs.Create(userID, "reader.annotation.create", "annotation", map[string]any{
			"annotationId": annotation.ID,
			"materialId":   materialID,
			"page":         annotation.Page,
		})
	}

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

func (s *Service) GenerateCardDrafts(userID string, materialID string, annotationIDs []string) ([]carddto.CardDraftPayload, error) {
	if err := s.ensureReadable(materialID); err != nil {
		return nil, err
	}

	allAnnotations, err := s.repository.ListAnnotations(userID, materialID)
	if err != nil {
		return nil, apperrors.Internal("读取阅读批注失败")
	}

	indexByID := make(map[string]readerdto.AnnotationSummary, len(allAnnotations))
	for _, annotation := range allAnnotations {
		indexByID[annotation.ID] = annotation
	}

	selected := make([]readerdto.AnnotationSummary, 0, len(annotationIDs))
	for _, annotationID := range annotationIDs {
		annotation, ok := indexByID[annotationID]
		if !ok {
			return nil, apperrors.New(http.StatusNotFound, "annotation_not_found", "选中的批注不存在")
		}
		selected = append(selected, annotation)
	}

	material, err := s.materials.FindByID(materialID)
	if err != nil {
		return nil, apperrors.Internal("读取资料失败")
	}

	drafts := BuildCardDraftsFromAnnotations(material.Title, selected)
	if s.aiTasks == nil {
		return drafts, nil
	}

	persisted, err := s.aiTasks.RecordReaderCardDrafts(userID, materialID, drafts)
	if err != nil {
		return nil, err
	}

	return persisted, nil
}

func (s *Service) GenerateGraphDrafts(userID string, materialID string, annotationIDs []string) ([]aidto.DraftPayload, error) {
	if err := s.ensureReadable(materialID); err != nil {
		return nil, err
	}

	allAnnotations, err := s.repository.ListAnnotations(userID, materialID)
	if err != nil {
		return nil, apperrors.Internal("读取阅读批注失败")
	}

	indexByID := make(map[string]readerdto.AnnotationSummary, len(allAnnotations))
	for _, annotation := range allAnnotations {
		indexByID[annotation.ID] = annotation
	}

	selected := make([]readerdto.AnnotationSummary, 0, len(annotationIDs))
	for _, annotationID := range annotationIDs {
		annotation, ok := indexByID[annotationID]
		if !ok {
			return nil, apperrors.New(http.StatusNotFound, "annotation_not_found", "选中的批注不存在")
		}
		selected = append(selected, annotation)
	}

	material, err := s.materials.FindByID(materialID)
	if err != nil {
		return nil, apperrors.Internal("读取资料失败")
	}

	draft := BuildGraphDraftFromAnnotations(material.Title, materialID, selected)
	drafts := []aidto.DraftPayload{draft}
	if s.aiTasks == nil {
		return drafts, nil
	}

	persisted, err := s.aiTasks.RecordReaderGraphDrafts(userID, materialID, drafts)
	if err != nil {
		return nil, err
	}

	return persisted, nil
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
