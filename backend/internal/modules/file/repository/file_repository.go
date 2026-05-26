package repository

import (
	"gorm.io/gorm"
	"studymate/backend/internal/modules/file/model"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(file *model.FileRecord) error {
	return r.db.Create(file).Error
}

func (r *Repository) FindByID(id string) (*model.FileRecord, error) {
	var file model.FileRecord
	err := r.db.First(&file, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	return &file, nil
}
