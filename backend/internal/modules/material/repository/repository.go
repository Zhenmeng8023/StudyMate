package repository

import (
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
	admindto "studymate/backend/internal/modules/admin/dto"
	filemodel "studymate/backend/internal/modules/file/model"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialmodel "studymate/backend/internal/modules/material/model"
)

type Repository struct {
	db *gorm.DB
}

type MaterialAttachment struct {
	Material materialmodel.Material
	File     filemodel.FileRecord
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(material *materialmodel.Material) error {
	return r.db.Create(material).Error
}

func (r *Repository) Save(material *materialmodel.Material) error {
	return r.db.Save(material).Error
}

func (r *Repository) Delete(material *materialmodel.Material) error {
	return r.db.Delete(material).Error
}

func (r *Repository) FindByID(materialID string) (*materialmodel.Material, error) {
	var material materialmodel.Material
	if err := r.db.First(&material, "id = ?", materialID).Error; err != nil {
		return nil, err
	}
	return &material, nil
}

func (r *Repository) ListApproved() ([]materialdto.MaterialSummary, error) {
	type materialRow struct {
		ID               string    `gorm:"column:id"`
		OwnerUserID      string    `gorm:"column:owner_user_id"`
		OwnerName        string    `gorm:"column:owner_name"`
		Title            string    `gorm:"column:title"`
		Description      string    `gorm:"column:description"`
		Category         string    `gorm:"column:category"`
		Tags             string    `gorm:"column:tags"`
		CoverFileID      string    `gorm:"column:cover_file_id"`
		AttachmentFileID string    `gorm:"column:attachment_file_id"`
		AttachmentName   string    `gorm:"column:attachment_name"`
		AttachmentMime   string    `gorm:"column:attachment_mime"`
		Status           string    `gorm:"column:status"`
		CreatedAt        time.Time `gorm:"column:created_at"`
		UpdatedAt        time.Time `gorm:"column:updated_at"`
	}

	var rows []materialRow
	err := r.db.Table("materials").
		Select(`
			materials.id,
			materials.owner_user_id,
			users.display_name as owner_name,
			materials.title,
			materials.description,
			materials.category,
			materials.tags,
			materials.cover_file_id,
			materials.attachment_file_id,
			files.original_name as attachment_name,
			files.mime_type as attachment_mime,
			materials.status,
			materials.created_at,
			materials.updated_at
		`).
		Joins("left join users on users.id = materials.owner_user_id").
		Joins("left join file_records as files on files.id = materials.attachment_file_id").
		Where("materials.status = ?", "approved").
		Order("materials.created_at desc").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	summaries := make([]materialdto.MaterialSummary, 0, len(rows))
	for _, row := range rows {
		avg, _ := r.getAverageRating(row.ID)
		summaries = append(summaries, materialdto.MaterialSummary{
			ID:               row.ID,
			OwnerUserID:      row.OwnerUserID,
			OwnerName:        row.OwnerName,
			Title:            row.Title,
			Description:      row.Description,
			Category:         row.Category,
			Tags:             decodeTags(row.Tags),
			CoverFileID:      row.CoverFileID,
			AttachmentFileID: row.AttachmentFileID,
			AttachmentName:   row.AttachmentName,
			AttachmentMime:   row.AttachmentMime,
			Status:           row.Status,
			FavoritesCount:   r.countFavorites(row.ID),
			AverageRating:    avg,
			CreatedAt:        row.CreatedAt.Format(time.RFC3339),
			UpdatedAt:        row.UpdatedAt.Format(time.RFC3339),
		})
	}

	return summaries, nil
}

func (r *Repository) BuildSummary(material *materialmodel.Material) (*materialdto.MaterialSummary, error) {
	type materialRow struct {
		ID               string    `gorm:"column:id"`
		OwnerUserID      string    `gorm:"column:owner_user_id"`
		OwnerName        string    `gorm:"column:owner_name"`
		Title            string    `gorm:"column:title"`
		Description      string    `gorm:"column:description"`
		Category         string    `gorm:"column:category"`
		Tags             string    `gorm:"column:tags"`
		CoverFileID      string    `gorm:"column:cover_file_id"`
		AttachmentFileID string    `gorm:"column:attachment_file_id"`
		AttachmentName   string    `gorm:"column:attachment_name"`
		AttachmentMime   string    `gorm:"column:attachment_mime"`
		Status           string    `gorm:"column:status"`
		CreatedAt        time.Time `gorm:"column:created_at"`
		UpdatedAt        time.Time `gorm:"column:updated_at"`
	}

	var row materialRow
	if err := r.db.Table("materials").
		Select(`
			materials.id,
			materials.owner_user_id,
			users.display_name as owner_name,
			materials.title,
			materials.description,
			materials.category,
			materials.tags,
			materials.cover_file_id,
			materials.attachment_file_id,
			files.original_name as attachment_name,
			files.mime_type as attachment_mime,
			materials.status,
			materials.created_at,
			materials.updated_at
		`).
		Joins("left join users on users.id = materials.owner_user_id").
		Joins("left join file_records as files on files.id = materials.attachment_file_id").
		Where("materials.id = ?", material.ID).
		First(&row).Error; err != nil {
		return nil, err
	}

	avg, _ := r.getAverageRating(row.ID)
	return &materialdto.MaterialSummary{
		ID:               row.ID,
		OwnerUserID:      row.OwnerUserID,
		OwnerName:        row.OwnerName,
		Title:            row.Title,
		Description:      row.Description,
		Category:         row.Category,
		Tags:             decodeTags(row.Tags),
		CoverFileID:      row.CoverFileID,
		AttachmentFileID: row.AttachmentFileID,
		AttachmentName:   row.AttachmentName,
		AttachmentMime:   row.AttachmentMime,
		Status:           row.Status,
		FavoritesCount:   r.countFavorites(row.ID),
		AverageRating:    avg,
		CreatedAt:        row.CreatedAt.Format(time.RFC3339),
		UpdatedAt:        row.UpdatedAt.Format(time.RFC3339),
	}, nil
}

func (r *Repository) ToggleFavorite(materialID string, userID string) (bool, int64, error) {
	var existing materialmodel.MaterialFavorite
	err := r.db.First(&existing, "material_id = ? AND user_id = ?", materialID, userID).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, 0, err
	}

	active := false
	if errors.Is(err, gorm.ErrRecordNotFound) {
		if err := r.db.Create(&materialmodel.MaterialFavorite{MaterialID: materialID, UserID: userID}).Error; err != nil {
			return false, 0, err
		}
		active = true
	} else {
		if err := r.db.Delete(&existing).Error; err != nil {
			return false, 0, err
		}
	}

	return active, r.countFavorites(materialID), nil
}

func (r *Repository) UpsertRating(materialID string, userID string, score int) (float64, error) {
	var rating materialmodel.MaterialRating
	err := r.db.First(&rating, "material_id = ? AND user_id = ?", materialID, userID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		rating = materialmodel.MaterialRating{
			MaterialID: materialID,
			UserID:     userID,
			Score:      score,
		}
		if err := r.db.Create(&rating).Error; err != nil {
			return 0, err
		}
	} else if err != nil {
		return 0, err
	} else {
		rating.Score = score
		if err := r.db.Save(&rating).Error; err != nil {
			return 0, err
		}
	}

	avg, err := r.getAverageRating(materialID)
	if err != nil {
		return 0, err
	}

	return avg, nil
}

func (r *Repository) ListForModeration() ([]materialmodel.Material, error) {
	var materials []materialmodel.Material
	err := r.db.Where("status <> ?", "approved").Order("created_at desc").Find(&materials).Error
	return materials, err
}

func (r *Repository) CountAllMaterials() (int64, error) {
	var count int64
	err := r.db.Model(&materialmodel.Material{}).Count(&count).Error
	return count, err
}

func (r *Repository) CountPendingMaterials() (int64, error) {
	var count int64
	err := r.db.Model(&materialmodel.Material{}).Where("status <> ?", "approved").Count(&count).Error
	return count, err
}

func (r *Repository) ListModerationItems() ([]admindto.ModerationItem, error) {
	type row struct {
		ID         string    `gorm:"column:id"`
		Title      string    `gorm:"column:title"`
		Summary    string    `gorm:"column:summary"`
		AuthorName string    `gorm:"column:author_name"`
		Status     string    `gorm:"column:status"`
		CreatedAt  time.Time `gorm:"column:created_at"`
		UpdatedAt  time.Time `gorm:"column:updated_at"`
	}

	var rows []row
	err := r.db.Table("materials").
		Select(`
			materials.id,
			materials.title,
			materials.description as summary,
			users.display_name as author_name,
			materials.status,
			materials.created_at,
			materials.updated_at
		`).
		Joins("left join users on users.id = materials.owner_user_id").
		Where("materials.status <> ?", "approved").
		Order("materials.created_at desc").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	items := make([]admindto.ModerationItem, 0, len(rows))
	for _, row := range rows {
		items = append(items, admindto.ModerationItem{
			ID:         row.ID,
			Type:       "material",
			Title:      row.Title,
			Summary:    row.Summary,
			AuthorName: row.AuthorName,
			Status:     row.Status,
			CreatedAt:  row.CreatedAt.Format(time.RFC3339),
			UpdatedAt:  row.UpdatedAt.Format(time.RFC3339),
		})
	}

	return items, nil
}

func (r *Repository) FindApprovedAttachment(materialID string) (*MaterialAttachment, error) {
	var material materialmodel.Material
	if err := r.db.First(&material, "id = ? AND status = ?", materialID, "approved").Error; err != nil {
		return nil, err
	}

	if material.AttachmentFileID == "" {
		return nil, gorm.ErrRecordNotFound
	}

	var file filemodel.FileRecord
	if err := r.db.First(&file, "id = ?", material.AttachmentFileID).Error; err != nil {
		return nil, err
	}

	return &MaterialAttachment{
		Material: material,
		File:     file,
	}, nil
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

func decodeTags(raw string) []string {
	if raw == "" {
		return []string{}
	}

	var tags []string
	if err := json.Unmarshal([]byte(raw), &tags); err != nil {
		return []string{}
	}
	return tags
}

func (r *Repository) countFavorites(materialID string) int64 {
	var count int64
	_ = r.db.Model(&materialmodel.MaterialFavorite{}).Where("material_id = ?", materialID).Count(&count).Error
	return count
}

func (r *Repository) getAverageRating(materialID string) (float64, error) {
	type averageRow struct {
		Average float64 `gorm:"column:average"`
	}

	var row averageRow
	err := r.db.Table("material_ratings").
		Select("coalesce(avg(score), 0) as average").
		Where("material_id = ?", materialID).
		Scan(&row).Error
	if err != nil {
		return 0, err
	}

	return row.Average, nil
}
