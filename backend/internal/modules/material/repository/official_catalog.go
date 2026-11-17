package repository

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"strings"
	materialdto "studymate/backend/internal/modules/material/dto"
	materialmodel "studymate/backend/internal/modules/material/model"
	"time"
)

func (r *Repository) LockOfficial(id string) (*materialmodel.Material, error) {
	var item materialmodel.Material
	err := r.db.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ? AND library_scope = ?", id, "official").First(&item).Error
	return &item, err
}
func (r *Repository) UpdateOfficialStatus(item *materialmodel.Material) error {
	return r.db.Model(&materialmodel.Material{}).Where("id = ? AND library_scope = ?", item.ID, "official").Updates(map[string]any{"status": item.Status, "archive_reason": item.ArchiveReason}).Error
}
func catalogBase(db *gorm.DB, query materialdto.OfficialCatalogQuery) *gorm.DB {
	db = db.Model(&materialmodel.Material{}).Where("materials.library_scope = ?", "official")
	if query.Status != "all" {
		db = db.Where("materials.status = ?", query.Status)
	}
	return db
}
func (r *Repository) ListOfficialCatalog(query materialdto.OfficialCatalogQuery) (*materialdto.OfficialCatalogPage, error) {
	result := &materialdto.OfficialCatalogPage{Items: make([]materialdto.MaterialSummary, 0), Page: query.Page, PageSize: query.PageSize, Categories: make([]string, 0)}
	if err := catalogBase(r.db, query).Where("category <> ?", "").Distinct("category").Order("category ASC").Pluck("category", &result.Categories).Error; err != nil {
		return nil, err
	}
	db := catalogBase(r.db, query).Joins("LEFT JOIN file_records AS catalog_files ON catalog_files.id = materials.attachment_file_id")
	if query.Category != "" {
		db = db.Where("materials.category = ?", query.Category)
	}
	if query.MaterialType != "" {
		db = db.Where("materials.material_type = ?", query.MaterialType)
	}
	if query.Q != "" {
		escaped := strings.NewReplacer("!", "!!", "%", "!%", "_", "!_").Replace(strings.TrimSpace(query.Q))
		term := "%" + escaped + "%"
		db = db.Where("(materials.title LIKE ? ESCAPE '!' OR materials.author LIKE ? ESCAPE '!' OR materials.description LIKE ? ESCAPE '!' OR materials.tags LIKE ? ESCAPE '!' OR catalog_files.original_name LIKE ? ESCAPE '!')", term, term, term, term, term)
	}
	if err := db.Count(&result.Total).Error; err != nil {
		return nil, err
	}
	order := "materials.updated_at DESC, materials.id DESC"
	if query.Sort == "title" {
		order = "materials.title ASC, materials.id ASC"
	}
	var materials []materialmodel.Material
	if err := db.Select("materials.*").Order(order).Offset((query.Page - 1) * query.PageSize).Limit(query.PageSize).Find(&materials).Error; err != nil {
		return nil, err
	}
	items, err := r.summarizeCatalog(materials)
	if err != nil {
		return nil, err
	}
	result.Items = items
	return result, nil
}

func (r *Repository) summarizeCatalog(materials []materialmodel.Material) ([]materialdto.MaterialSummary, error) {
	result := make([]materialdto.MaterialSummary, 0, len(materials))
	if len(materials) == 0 {
		return result, nil
	}
	ids := make([]string, 0, len(materials))
	for _, item := range materials {
		ids = append(ids, item.ID)
	}
	type catalogRow struct {
		materialmodel.Material
		OwnerName      string
		AttachmentName string
		AttachmentMime string
		FavoritesCount int64
		AverageRating  float64
	}
	var rows []catalogRow
	err := r.db.Table("materials").Select("materials.*, users.display_name AS owner_name, files.original_name AS attachment_name, files.mime_type AS attachment_mime, COALESCE(favorites.n, 0) AS favorites_count, COALESCE(ratings.average_rating, 0) AS average_rating").
		Joins("LEFT JOIN users ON users.id = materials.owner_user_id").Joins("LEFT JOIN file_records files ON files.id = materials.attachment_file_id").
		Joins("LEFT JOIN (SELECT material_id, COUNT(*) AS n FROM material_favorites GROUP BY material_id) favorites ON favorites.material_id = materials.id").
		Joins("LEFT JOIN (SELECT material_id, AVG(score) AS average_rating FROM material_ratings GROUP BY material_id) ratings ON ratings.material_id = materials.id").Where("materials.id IN ?", ids).Find(&rows).Error
	if err != nil {
		return nil, err
	}
	byID := make(map[string]catalogRow, len(rows))
	for _, row := range rows {
		byID[row.ID] = row
	}
	for _, material := range materials {
		row := byID[material.ID]
		result = append(result, materialdto.MaterialSummary{
			OfficialMetadata: materialdto.OfficialMetadata{MaterialType: material.MaterialType, Author: material.Author, SourceURL: material.SourceURL, PublicationYear: material.PublicationYear, Edition: material.Edition, LicenseStatus: material.LicenseStatus},
			ArchiveReason:    material.ArchiveReason, LibraryScope: material.LibraryScope, FolderName: material.FolderName, ID: material.ID, OwnerUserID: material.OwnerUserID, OwnerName: row.OwnerName, Title: material.Title, Description: material.Description, Category: material.Category, Tags: decodeTags(material.Tags), CoverFileID: material.CoverFileID, AttachmentFileID: material.AttachmentFileID, AttachmentName: row.AttachmentName, AttachmentMime: row.AttachmentMime, Status: material.Status, FavoritesCount: row.FavoritesCount, AverageRating: row.AverageRating, CreatedAt: material.CreatedAt.Format(time.RFC3339), UpdatedAt: material.UpdatedAt.Format(time.RFC3339),
		})
	}
	return result, nil
}
