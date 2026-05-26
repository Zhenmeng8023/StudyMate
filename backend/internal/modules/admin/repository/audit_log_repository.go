package repository

import (
	"encoding/json"

	"gorm.io/gorm"
	"studymate/backend/internal/modules/admin/model"
)

type AuditLogRepository struct {
	db *gorm.DB
}

func NewAuditLogRepository(db *gorm.DB) *AuditLogRepository {
	return &AuditLogRepository{db: db}
}

func (r *AuditLogRepository) Create(actorID string, action string, target string, metadata map[string]any) error {
	var payload string
	if metadata != nil {
		raw, err := json.Marshal(metadata)
		if err != nil {
			return err
		}
		payload = string(raw)
	}

	entry := &model.AuditLog{
		ActorID:  actorID,
		Action:   action,
		Target:   target,
		Metadata: payload,
	}

	return r.db.Create(entry).Error
}
