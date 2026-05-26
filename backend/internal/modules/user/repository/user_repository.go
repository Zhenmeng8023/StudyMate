package repository

import (
	"errors"

	"gorm.io/gorm"
	"studymate/backend/internal/modules/user/model"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *Repository) Save(user *model.User) error {
	return r.db.Save(user).Error
}

func (r *Repository) FindByID(id string) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, "id = ?", id).Error
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) FindByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, "email = ?", email).Error
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) FindByUsername(username string) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, "username = ?", username).Error
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) FindByLogin(login string) (*model.User, error) {
	var user model.User
	err := r.db.Where("email = ? OR username = ?", login, login).First(&user).Error
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *Repository) ExistsByEmail(email string) (bool, error) {
	var count int64
	err := r.db.Model(&model.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}

func (r *Repository) ExistsByUsername(username string) (bool, error) {
	var count int64
	err := r.db.Model(&model.User{}).Where("username = ?", username).Count(&count).Error
	return count > 0, err
}

func (r *Repository) ExistsByEmailExcludingUser(email string, userID string) (bool, error) {
	var count int64
	err := r.db.Model(&model.User{}).Where("email = ? AND id <> ?", email, userID).Count(&count).Error
	return count > 0, err
}

func (r *Repository) IsNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
