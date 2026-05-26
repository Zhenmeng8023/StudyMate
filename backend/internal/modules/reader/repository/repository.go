package repository

import (
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
	readerdto "studymate/backend/internal/modules/reader/dto"
	readermodel "studymate/backend/internal/modules/reader/model"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetProgress(userID string, materialID string) (*readermodel.ReadingProgress, error) {
	var progress readermodel.ReadingProgress
	if err := r.db.First(&progress, "user_id = ? AND material_id = ?", userID, materialID).Error; err != nil {
		return nil, err
	}

	return &progress, nil
}

func (r *Repository) SaveProgress(progress *readermodel.ReadingProgress) error {
	return r.db.Save(progress).Error
}

func (r *Repository) CreateProgress(progress *readermodel.ReadingProgress) error {
	return r.db.Create(progress).Error
}

func (r *Repository) ListAnnotations(userID string, materialID string) ([]readerdto.AnnotationSummary, error) {
	var annotations []readermodel.PDFAnnotation
	if err := r.db.Where("user_id = ? AND material_id = ?", userID, materialID).Order("updated_at desc").Find(&annotations).Error; err != nil {
		return nil, err
	}

	result := make([]readerdto.AnnotationSummary, 0, len(annotations))
	for _, annotation := range annotations {
		result = append(result, BuildAnnotationSummary(annotation))
	}

	return result, nil
}

func (r *Repository) CreateAnnotation(annotation *readermodel.PDFAnnotation) error {
	return r.db.Create(annotation).Error
}

func (r *Repository) FindAnnotation(userID string, materialID string, annotationID string) (*readermodel.PDFAnnotation, error) {
	var annotation readermodel.PDFAnnotation
	if err := r.db.First(&annotation, "id = ? AND user_id = ? AND material_id = ?", annotationID, userID, materialID).Error; err != nil {
		return nil, err
	}

	return &annotation, nil
}

func (r *Repository) DeleteAnnotation(annotation *readermodel.PDFAnnotation) error {
	return r.db.Delete(annotation).Error
}

func EncodeBookmarks(bookmarks []int) string {
	if len(bookmarks) == 0 {
		return "[]"
	}

	raw, err := json.Marshal(bookmarks)
	if err != nil {
		return "[]"
	}

	return string(raw)
}

func DecodeBookmarks(raw string) []int {
	if raw == "" {
		return []int{}
	}

	var bookmarks []int
	if err := json.Unmarshal([]byte(raw), &bookmarks); err != nil {
		return []int{}
	}

	return bookmarks
}

func BuildReaderState(progress *readermodel.ReadingProgress, annotations []readerdto.AnnotationSummary) readerdto.ReaderStateResponse {
	response := readerdto.ReaderStateResponse{
		Annotations: annotations,
	}
	if progress != nil {
		response.MaterialID = progress.MaterialID
		response.CurrentPage = progress.CurrentPage
		response.TotalPages = progress.TotalPages
		response.ProgressPercent = progress.ProgressPercent
		response.Bookmarks = DecodeBookmarks(progress.Bookmarks)
		response.LastReadAt = progress.LastReadAt.Format(time.RFC3339)
	}

	return response
}

func BuildAnnotationSummary(annotation readermodel.PDFAnnotation) readerdto.AnnotationSummary {
	return readerdto.AnnotationSummary{
		ID:         annotation.ID,
		MaterialID: annotation.MaterialID,
		Page:       annotation.Page,
		Quote:      annotation.Quote,
		Comment:    annotation.Comment,
		Color:      annotation.Color,
		CreatedAt:  annotation.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  annotation.UpdatedAt.Format(time.RFC3339),
	}
}

func IsNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
