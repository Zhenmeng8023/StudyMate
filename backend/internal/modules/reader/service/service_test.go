package service

import (
	"errors"
	"net/http"
	"testing"
	"time"

	adminrepo "studymate/backend/internal/modules/admin/repository"
	materialmodel "studymate/backend/internal/modules/material/model"
	readerdto "studymate/backend/internal/modules/reader/dto"
	readermodel "studymate/backend/internal/modules/reader/model"
	"studymate/backend/internal/pkg/apperrors"
)

type fakeReaderRepository struct {
	progress          *readermodel.ReadingProgress
	progressErr       error
	annotations       []readerdto.AnnotationSummary
	annotationsErr    error
	createdAnnotation *readermodel.PDFAnnotation
	createErr         error
}

func (r *fakeReaderRepository) GetProgress(userID string, materialID string) (*readermodel.ReadingProgress, error) {
	return r.progress, r.progressErr
}

func (r *fakeReaderRepository) SaveProgress(progress *readermodel.ReadingProgress) error {
	r.progress = progress
	return nil
}

func (r *fakeReaderRepository) CreateProgress(progress *readermodel.ReadingProgress) error {
	r.progress = progress
	return nil
}

func (r *fakeReaderRepository) ListAnnotations(userID string, materialID string) ([]readerdto.AnnotationSummary, error) {
	return r.annotations, r.annotationsErr
}

func (r *fakeReaderRepository) CreateAnnotation(annotation *readermodel.PDFAnnotation) error {
	if r.createErr != nil {
		return r.createErr
	}

	r.createdAnnotation = annotation
	if annotation.ID == "" {
		annotation.ID = "annotation-1"
	}
	if annotation.CreatedAt.IsZero() {
		annotation.CreatedAt = time.Date(2026, 6, 2, 12, 0, 0, 0, time.UTC)
	}
	if annotation.UpdatedAt.IsZero() {
		annotation.UpdatedAt = annotation.CreatedAt
	}
	return nil
}

func (r *fakeReaderRepository) FindAnnotation(userID string, materialID string, annotationID string) (*readermodel.PDFAnnotation, error) {
	return nil, errors.New("not implemented")
}

func (r *fakeReaderRepository) DeleteAnnotation(annotation *readermodel.PDFAnnotation) error {
	return errors.New("not implemented")
}

type fakeMaterialRepository struct {
	material   *materialmodel.Material
	err        error
	lookupIDs  []string
	lookupCall int
}

func (r *fakeMaterialRepository) FindByID(materialID string) (*materialmodel.Material, error) {
	r.lookupIDs = append(r.lookupIDs, materialID)
	r.lookupCall++
	return r.material, r.err
}

type fakeAuditLogRepository struct {
	actorID  string
	action   string
	target   string
	metadata map[string]any
	calls    int
}

func (r *fakeAuditLogRepository) Create(actorID string, action string, target string, metadata map[string]any) error {
	r.actorID = actorID
	r.action = action
	r.target = target
	r.metadata = metadata
	r.calls++
	return nil
}

func approvedMaterial() *materialmodel.Material {
	return &materialmodel.Material{
		ID:     "material-1",
		Title:  "算法导论",
		Status: "approved",
	}
}

func TestCreateAnnotationRejectsEmptyQuoteAndComment(t *testing.T) {
	service := NewService(
		&fakeReaderRepository{},
		&fakeMaterialRepository{material: approvedMaterial()},
		&fakeAuditLogRepository{},
		nil,
	)

	_, err := service.CreateAnnotation("user-1", "material-1", readerdto.CreateAnnotationRequest{
		Page:    3,
		Quote:   "   ",
		Comment: "\n\t",
	})
	if err == nil {
		t.Fatalf("expected validation error, got nil")
	}

	appErr := apperrors.As(err)
	if appErr.Status != http.StatusBadRequest || appErr.Code != "annotation_empty" {
		t.Fatalf("expected annotation_empty 400, got status=%d code=%q", appErr.Status, appErr.Code)
	}
}

func TestCreateAnnotationDefaultsColorAndWritesAuditLog(t *testing.T) {
	repository := &fakeReaderRepository{}
	auditLogs := &fakeAuditLogRepository{}
	service := NewService(
		repository,
		&fakeMaterialRepository{material: approvedMaterial()},
		auditLogs,
		nil,
	)

	result, err := service.CreateAnnotation("user-1", "material-1", readerdto.CreateAnnotationRequest{
		Page:    3,
		Quote:   "Highlighted quote",
		Comment: "Useful note",
		Rects: []readerdto.PDFRect{
			{Page: 3, X: 0, Y: 0, Width: 1, Height: 0.08},
		},
	})
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}

	if repository.createdAnnotation == nil {
		t.Fatalf("expected annotation to be persisted")
	}
	if repository.createdAnnotation.Color != "#f0d080" {
		t.Fatalf("expected default color, got %q", repository.createdAnnotation.Color)
	}
	if result.ID != "annotation-1" || result.Color != "#f0d080" || len(result.Rects) != 1 {
		t.Fatalf("unexpected annotation summary: %#v", result)
	}
	if auditLogs.calls != 1 || auditLogs.actorID != "user-1" || auditLogs.action != "reader.annotation.create" {
		t.Fatalf("unexpected audit log call: %#v", auditLogs)
	}
	if auditLogs.metadata["materialId"] != "material-1" {
		t.Fatalf("expected audit metadata to include material id, got %#v", auditLogs.metadata)
	}
}

func TestGenerateGraphDraftsReturnsNotFoundWhenAnnotationMissing(t *testing.T) {
	materials := &fakeMaterialRepository{material: approvedMaterial()}
	service := NewService(
		&fakeReaderRepository{
			annotations: []readerdto.AnnotationSummary{
				{ID: "annotation-1", MaterialID: "material-1", Page: 3, Quote: "Known annotation"},
			},
		},
		materials,
		&fakeAuditLogRepository{},
		nil,
	)

	_, err := service.GenerateGraphDrafts("user-1", "material-1", []string{"annotation-1", "annotation-missing"})
	if err == nil {
		t.Fatalf("expected missing annotation error, got nil")
	}

	appErr := apperrors.As(err)
	if appErr.Status != http.StatusNotFound || appErr.Code != "annotation_not_found" {
		t.Fatalf("expected annotation_not_found 404, got status=%d code=%q", appErr.Status, appErr.Code)
	}
	if materials.lookupCall != 1 {
		t.Fatalf("expected only the readability check lookup before annotation validation, got %d", materials.lookupCall)
	}
}

func TestGetStateRejectsUnapprovedMaterial(t *testing.T) {
	service := NewService(
		&fakeReaderRepository{},
		&fakeMaterialRepository{material: &materialmodel.Material{ID: "material-1", Status: "pending"}},
		&fakeAuditLogRepository{},
		nil,
	)

	_, err := service.GetState("user-1", "material-1")
	if err == nil {
		t.Fatalf("expected forbidden error, got nil")
	}

	appErr := apperrors.As(err)
	if appErr.Status != http.StatusForbidden || appErr.Code != "material_not_visible" {
		t.Fatalf("expected material_not_visible 403, got status=%d code=%q", appErr.Status, appErr.Code)
	}
}

var _ readerRepository = (*fakeReaderRepository)(nil)
var _ materialLookup = (*fakeMaterialRepository)(nil)
var _ auditLogWriter = (*fakeAuditLogRepository)(nil)
var _ = adminrepo.NewAuditLogRepository
