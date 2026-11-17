package repository

import (
	"errors"
	"gorm.io/gorm"
	materialmodel "studymate/backend/internal/modules/material/model"
)

var ErrInvalidVersionChain = errors.New("invalid material version chain")

const maxVersionChain = 200

func (r *Repository) FindOfficialSuccessor(id string) (*materialmodel.Material, error) {
	var item materialmodel.Material
	err := r.db.Where("previous_version_id = ?", id).First(&item).Error
	return &item, err
}

// Read the whole chain in one snapshot; malformed or mixed-scope chains are never exposed.
func (r *Repository) OfficialVersionChain(id string) ([]materialmodel.Material, error) {
	var result []materialmodel.Material
	err := r.db.Transaction(func(tx *gorm.DB) error {
		repo := NewRepository(tx)
		current, err := repo.FindByID(id)
		if err != nil {
			return err
		}
		if current.LibraryScope != "official" {
			return gorm.ErrRecordNotFound
		}
		seen := make(map[string]bool)
		for {
			if current.LibraryScope != "official" || seen[current.ID] || len(seen) >= maxVersionChain {
				return ErrInvalidVersionChain
			}
			seen[current.ID] = true
			if current.PreviousVersionID == nil {
				break
			}
			current, err = repo.FindByID(*current.PreviousVersionID)
			if err != nil {
				return ErrInvalidVersionChain
			}
		}
		seen = make(map[string]bool)
		for {
			if current.LibraryScope != "official" || seen[current.ID] || len(result) >= maxVersionChain {
				return ErrInvalidVersionChain
			}
			seen[current.ID] = true
			result = append(result, *current)
			current, err = repo.FindOfficialSuccessor(current.ID)
			if errors.Is(err, gorm.ErrRecordNotFound) {
				break
			}
			if err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	for left, right := 0, len(result)-1; left < right; left, right = left+1, right-1 {
		result[left], result[right] = result[right], result[left]
	}
	return result, nil
}
