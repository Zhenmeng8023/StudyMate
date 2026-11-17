package repository

import (
	"errors"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"studymate/backend/internal/modules/file/model"
)

var ErrStorageQuotaExceeded = errors.New("storage quota exceeded")

type StorageUsage struct {
	UsedBytes         int64
	FileCount         int64
	UnlinkedBytes     int64
	UnlinkedFileCount int64
}

const unlinkedCondition = `NOT EXISTS (SELECT 1 FROM materials WHERE materials.attachment_file_id = file_records.id OR materials.cover_file_id = file_records.id)
 AND NOT EXISTS (SELECT 1 FROM graphs WHERE graphs.thumbnail_file_id = file_records.id)
 AND NOT EXISTS (SELECT 1 FROM diagram_templates WHERE diagram_templates.preview_file_id = file_records.id)`

func usedBytes(db *gorm.DB, ownerID string) (int64, error) {
	var used int64
	err := db.Model(&model.FileRecord{}).Where("owner_user_id = ?", ownerID).
		Select("COALESCE(SUM(CASE WHEN size > 0 THEN size ELSE 0 END), 0)").Scan(&used).Error
	return used, err
}

func (r *Repository) UsedBytes(ownerID string) (int64, error) { return usedBytes(r.db, ownerID) }

// Lock the stable owner row before the first consistent read, so independent server instances
// serialize their final quota check and record creation without a new counter table.
func (r *Repository) CreateWithinQuota(file *model.FileRecord, quota int64) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var owner struct{ ID string }
		if err := tx.Table("users").Select("id").Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ?", file.OwnerUserID).Take(&owner).Error; err != nil {
			return err
		}
		used, err := usedBytes(tx, file.OwnerUserID)
		if err != nil {
			return err
		}
		if quota <= 0 || used > quota || file.Size > quota-used {
			return ErrStorageQuotaExceeded
		}
		return tx.Create(file).Error
	})
}

func (r *Repository) Storage(ownerID string) (*StorageUsage, []model.FileRecord, error) {
	var usage *StorageUsage
	var files []model.FileRecord
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var err error
		usage, files, err = storageSnapshot(tx, ownerID)
		return err
	})
	return usage, files, err
}

func storageSnapshot(db *gorm.DB, ownerID string) (*StorageUsage, []model.FileRecord, error) {
	var usage StorageUsage
	selectSQL := `COUNT(*) AS file_count,
 COALESCE(SUM(CASE WHEN size > 0 THEN size ELSE 0 END), 0) AS used_bytes,
 COALESCE(SUM(CASE WHEN ` + unlinkedCondition + ` THEN 1 ELSE 0 END), 0) AS unlinked_file_count,
 COALESCE(SUM(CASE WHEN ` + unlinkedCondition + ` AND size > 0 THEN size ELSE 0 END), 0) AS unlinked_bytes`
	if err := db.Model(&model.FileRecord{}).Where("owner_user_id = ?", ownerID).Select(selectSQL).Scan(&usage).Error; err != nil {
		return nil, nil, err
	}
	var files []model.FileRecord
	err := db.Model(&model.FileRecord{}).Select("id, original_name, size, created_at").Where("owner_user_id = ?", ownerID).
		Where(unlinkedCondition).Order("created_at DESC, id ASC").Limit(20).Find(&files).Error
	if err != nil {
		return nil, nil, err
	}
	return &usage, files, nil
}
