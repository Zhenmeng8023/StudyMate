package repository

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	filemodel "studymate/backend/internal/modules/file/model"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialmodel "studymate/backend/internal/modules/material/model"
)

// LibraryTransaction binds material mutations and their audit records to one SQL transaction.
func (r *Repository) LibraryTransaction(work func(*Repository, *adminrepo.AuditLogRepository) error) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		return work(&Repository{db: tx}, adminrepo.NewAuditLogRepository(tx))
	})
}

func (r *Repository) FindFile(id string) (*filemodel.FileRecord, error) {
	var file filemodel.FileRecord
	err := r.db.First(&file, "id = ?", id).Error
	return &file, err
}

// UpdateLibraryMetadata deliberately omits status, ownership, scope and attachment.
// A stale editor snapshot must never restore a concurrently archived resource.
func (r *Repository) UpdateLibraryMetadata(material *materialmodel.Material) error {
	values := map[string]any{
		"title":         material.Title,
		"description":   material.Description,
		"category":      material.Category,
		"folder_name":   material.FolderName,
		"tags":          material.Tags,
		"cover_file_id": material.CoverFileID,
	}
	return r.db.Model(&materialmodel.Material{}).Where("id = ?", material.ID).Updates(values).Error
}

// ArchiveLibraryMaterial changes only lifecycle state, retaining concurrent metadata edits.
func (r *Repository) ArchiveLibraryMaterial(id string) error {
	return r.db.Model(&materialmodel.Material{}).Where("id = ?", id).Update("status", "archived").Error
}

func (r *Repository) ListLibrary(userID string) ([]materialdto.MaterialSummary, error) {
	var materials []materialmodel.Material
	err := r.db.Where("(library_scope = ? AND owner_user_id = ? AND status = ?) OR (library_scope = ? AND status = ? AND id IN (?))", "personal", userID, "private", "official", "approved", r.db.Model(&materialmodel.MaterialFavorite{}).Select("material_id").Where("user_id = ?", userID)).Order("updated_at DESC, id DESC").Find(&materials).Error
	if err != nil {
		return nil, err
	}
	items, err := r.summarize(materials, userID)
	if err != nil {
		return nil, err
	}
	return r.WithReadingProgress(userID, items)
}

func (r *Repository) ListOfficial() ([]materialdto.MaterialSummary, error) {
	var materials []materialmodel.Material
	if err := r.db.Where("library_scope = ? AND status = ?", "official", "approved").Order("updated_at DESC, id DESC").Find(&materials).Error; err != nil {
		return nil, err
	}
	return r.summarize(materials, "")
}

func (r *Repository) summarize(materials []materialmodel.Material, userID string) ([]materialdto.MaterialSummary, error) {
	result := make([]materialdto.MaterialSummary, 0, len(materials))
	for _, material := range materials {
		summary, err := r.BuildSummary(&material)
		if err != nil {
			return nil, err
		}
		if userID != "" {
			summary.IsCollected, err = r.IsCollected(userID, material.ID)
			if err != nil {
				return nil, err
			}
		}
		result = append(result, *summary)
	}
	return result, nil
}

func (r *Repository) IsCollected(userID, materialID string) (bool, error) {
	var count int64
	err := r.db.Model(&materialmodel.MaterialFavorite{}).Where("user_id = ? AND material_id = ?", userID, materialID).Count(&count).Error
	return count > 0, err
}

func (r *Repository) SetCollection(userID, materialID string, active bool) error {
	if !active {
		return r.db.Where("user_id = ? AND material_id = ?", userID, materialID).Delete(&materialmodel.MaterialFavorite{}).Error
	}
	return r.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&materialmodel.MaterialFavorite{UserID: userID, MaterialID: materialID}).Error
}
