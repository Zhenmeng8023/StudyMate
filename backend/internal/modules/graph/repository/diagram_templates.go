package repository

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type DiagramTemplateState struct {
	ID          string
	Name        string
	Category    string
	Description string
	GraphID     string
	SourceType  string
	Status      string
	CreatedBy   string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (r *Repository) FindDiagramTemplateState(templateID string) (*DiagramTemplateState, error) {
	var row DiagramTemplateState
	err := r.db.Table("diagram_templates").
		Select("id, name, category, COALESCE(description, '') AS description, COALESCE(graph_id, '') AS graph_id, COALESCE(source_type, '') AS source_type, status, COALESCE(created_by, '') AS created_by, created_at, updated_at").
		Take(&row, "id = ?", templateID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &row, nil
}

func (r *Repository) ListDiagramTemplateStates(templateIDs []string) (map[string]DiagramTemplateState, error) {
	if len(templateIDs) == 0 {
		return map[string]DiagramTemplateState{}, nil
	}

	var rows []DiagramTemplateState
	err := r.db.Table("diagram_templates").
		Select("id, name, category, COALESCE(description, '') AS description, COALESCE(graph_id, '') AS graph_id, COALESCE(source_type, '') AS source_type, status, COALESCE(created_by, '') AS created_by, created_at, updated_at").
		Where("id IN ?", templateIDs).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	result := make(map[string]DiagramTemplateState, len(rows))
	for _, row := range rows {
		result[row.ID] = row
	}

	return result, nil
}

func (r *Repository) SaveDiagramTemplateState(state DiagramTemplateState) error {
	existing, err := r.FindDiagramTemplateState(state.ID)
	if err != nil {
		return err
	}

	if existing == nil {
		return r.db.Table("diagram_templates").Create(map[string]any{
			"id":          state.ID,
			"name":        state.Name,
			"category":    state.Category,
			"description": state.Description,
			"graph_id":    state.GraphID,
			"source_type": state.SourceType,
			"status":      state.Status,
			"created_by":  state.CreatedBy,
			"created_at":  state.CreatedAt,
			"updated_at":  state.UpdatedAt,
		}).Error
	}

	return r.db.Table("diagram_templates").
		Where("id = ?", state.ID).
		Updates(map[string]any{
			"name":        state.Name,
			"category":    state.Category,
			"description": state.Description,
			"graph_id":    state.GraphID,
			"source_type": state.SourceType,
			"status":      state.Status,
			"updated_at":  state.UpdatedAt,
		}).Error
}
