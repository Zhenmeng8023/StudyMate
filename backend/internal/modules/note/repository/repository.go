package repository

import (
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
	notedto "studymate/backend/internal/modules/note/dto"
	notemodel "studymate/backend/internal/modules/note/model"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(note *notemodel.Note) error {
	return r.db.Create(note).Error
}

func (r *Repository) Save(note *notemodel.Note) error {
	return r.db.Save(note).Error
}

func (r *Repository) Delete(note *notemodel.Note) error {
	return r.db.Delete(note).Error
}

func (r *Repository) FindByID(noteID string) (*notemodel.Note, error) {
	var note notemodel.Note
	if err := r.db.First(&note, "id = ?", noteID).Error; err != nil {
		return nil, err
	}

	return &note, nil
}

func (r *Repository) ListByOwner(ownerUserID string, materialID string) ([]notedto.NoteSummary, error) {
	query := r.db.Where("owner_user_id = ?", ownerUserID)
	if materialID != "" {
		query = query.Where("material_id = ?", materialID)
	}

	var notes []notemodel.Note
	if err := query.Order("updated_at desc").Find(&notes).Error; err != nil {
		return nil, err
	}

	result := make([]notedto.NoteSummary, 0, len(notes))
	for _, note := range notes {
		result = append(result, BuildSummary(note))
	}

	return result, nil
}

func (r *Repository) CreateVersion(version *notemodel.NoteVersion) error {
	return r.db.Create(version).Error
}

func (r *Repository) ListVersions(noteID string) ([]notedto.NoteVersionSummary, error) {
	var versions []notemodel.NoteVersion
	if err := r.db.Where("note_id = ?", noteID).Order("version_number desc").Find(&versions).Error; err != nil {
		return nil, err
	}

	result := make([]notedto.NoteVersionSummary, 0, len(versions))
	for _, version := range versions {
		result = append(result, BuildVersionSummary(version))
	}

	return result, nil
}

func (r *Repository) FindVersion(noteID string, versionID string) (*notemodel.NoteVersion, error) {
	var version notemodel.NoteVersion
	if err := r.db.First(&version, "id = ? AND note_id = ?", versionID, noteID).Error; err != nil {
		return nil, err
	}

	return &version, nil
}

func (r *Repository) CreateRelation(relation *notemodel.NoteRelation) error {
	return r.db.Create(relation).Error
}

func (r *Repository) EnsureMaterialRelation(noteID string, materialID string) error {
	if materialID == "" {
		return nil
	}

	var relation notemodel.NoteRelation
	err := r.db.First(&relation, "note_id = ? AND target_type = ? AND target_id = ?", noteID, "material", materialID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return r.db.Create(&notemodel.NoteRelation{
			NoteID:     noteID,
			TargetType: "material",
			TargetID:   materialID,
		}).Error
	}

	return err
}

func EncodeTags(tags []string) string {
	if len(tags) == 0 {
		return "[]"
	}

	raw, err := json.Marshal(tags)
	if err != nil {
		return "[]"
	}

	return string(raw)
}

func DecodeTags(raw string) []string {
	if raw == "" {
		return []string{}
	}

	var tags []string
	if err := json.Unmarshal([]byte(raw), &tags); err != nil {
		return []string{}
	}

	return tags
}

func BuildSummary(note notemodel.Note) notedto.NoteSummary {
	return notedto.NoteSummary{
		ID:            note.ID,
		OwnerUserID:   note.OwnerUserID,
		Title:         note.Title,
		Summary:       note.Summary,
		Content:       note.Content,
		MaterialID:    note.MaterialID,
		FolderName:    note.FolderName,
		Tags:          DecodeTags(note.Tags),
		VersionNumber: note.VersionNumber,
		CreatedAt:     note.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     note.UpdatedAt.Format(time.RFC3339),
	}
}

func BuildVersionSummary(version notemodel.NoteVersion) notedto.NoteVersionSummary {
	return notedto.NoteVersionSummary{
		ID:            version.ID,
		NoteID:        version.NoteID,
		VersionNumber: version.VersionNumber,
		Title:         version.Title,
		Summary:       version.Summary,
		Content:       version.Content,
		CreatedAt:     version.CreatedAt.Format(time.RFC3339),
	}
}
