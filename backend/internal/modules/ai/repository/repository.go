package repository

import (
	"time"

	"gorm.io/gorm"
	aidto "studymate/backend/internal/modules/ai/dto"
	aimodel "studymate/backend/internal/modules/ai/model"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateTask(task *aimodel.AITask) error {
	return r.db.Create(task).Error
}

func (r *Repository) CreateUsageLog(log *aimodel.AIUsageLog) error {
	return r.db.Create(log).Error
}

func (r *Repository) ListTasksByUser(userID string, limit int) ([]aidto.TaskPayload, error) {
	if limit <= 0 {
		limit = 20
	}

	usageSubquery := r.db.Table("ai_usage_logs").
		Select("task_id, SUM(input_tokens) AS input_tokens, SUM(output_tokens) AS output_tokens, SUM(cost_units) AS cost_units").
		Group("task_id")

	type taskRow struct {
		ID             string
		UserID         string
		TaskType       string
		SourceType     string
		SourceID       string
		SourceMetadata string
		Status         string
		Model          string
		InputTokens    int64
		OutputTokens   int64
		CostUnits      float64
		ResultRefType  string
		ResultRefID    string
		ErrorMessage   string
		CreatedAt      time.Time
		UpdatedAt      time.Time
	}

	var rows []taskRow
	err := r.db.Table("ai_tasks").
		Select(`
			ai_tasks.id,
			ai_tasks.user_id,
			ai_tasks.task_type,
			ai_tasks.source_type,
			ai_tasks.source_id,
			ai_tasks.source_metadata,
			ai_tasks.status,
			ai_tasks.model,
			COALESCE(ai_usage.input_tokens, ai_tasks.input_tokens, 0) AS input_tokens,
			COALESCE(ai_usage.output_tokens, ai_tasks.output_tokens, 0) AS output_tokens,
			COALESCE(ai_usage.cost_units, 0) AS cost_units,
			ai_tasks.result_ref_type,
			ai_tasks.result_ref_id,
			ai_tasks.error_message,
			ai_tasks.created_at,
			ai_tasks.updated_at
		`).
		Joins("LEFT JOIN (?) AS ai_usage ON ai_usage.task_id = ai_tasks.id", usageSubquery).
		Where("ai_tasks.user_id = ?", userID).
		Order("ai_tasks.created_at DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	result := make([]aidto.TaskPayload, 0, len(rows))
	for _, row := range rows {
		result = append(result, aidto.TaskPayload{
			ID:             row.ID,
			UserID:         row.UserID,
			TaskType:       row.TaskType,
			SourceType:     row.SourceType,
			SourceID:       row.SourceID,
			SourceMetadata: parseSourceMetadata(row.SourceMetadata),
			Status:         row.Status,
			Model:          row.Model,
			InputTokens:    row.InputTokens,
			OutputTokens:   row.OutputTokens,
			CostUnits:      row.CostUnits,
			ResultRefType:  row.ResultRefType,
			ResultRefID:    row.ResultRefID,
			ErrorMessage:   row.ErrorMessage,
			CreatedAt:      row.CreatedAt.UTC().Format(time.RFC3339),
			UpdatedAt:      row.UpdatedAt.UTC().Format(time.RFC3339),
		})
	}

	return result, nil
}

func (r *Repository) UsageSummaryByUser(userID string) (*aidto.UsageSummaryPayload, error) {
	var totalTasks int64
	if err := r.db.Model(&aimodel.AITask{}).Where("user_id = ?", userID).Count(&totalTasks).Error; err != nil {
		return nil, err
	}

	var completedTasks int64
	if err := r.db.Model(&aimodel.AITask{}).Where("user_id = ? AND status = ?", userID, "completed").Count(&completedTasks).Error; err != nil {
		return nil, err
	}

	var failedTasks int64
	if err := r.db.Model(&aimodel.AITask{}).Where("user_id = ? AND status = ?", userID, "failed").Count(&failedTasks).Error; err != nil {
		return nil, err
	}

	type usageAggregate struct {
		TotalInputTokens  int64
		TotalOutputTokens int64
		TotalCostUnits    float64
	}

	var usage usageAggregate
	if err := r.db.Model(&aimodel.AIUsageLog{}).
		Select(`
			COALESCE(SUM(input_tokens), 0) AS total_input_tokens,
			COALESCE(SUM(output_tokens), 0) AS total_output_tokens,
			COALESCE(SUM(cost_units), 0) AS total_cost_units
		`).
		Where("user_id = ?", userID).
		Scan(&usage).Error; err != nil {
		return nil, err
	}

	type lastTaskRow struct {
		LastTaskAt *time.Time
	}

	var lastTask lastTaskRow
	if err := r.db.Model(&aimodel.AITask{}).
		Select("MAX(created_at) AS last_task_at").
		Where("user_id = ?", userID).
		Scan(&lastTask).Error; err != nil {
		return nil, err
	}

	payload := &aidto.UsageSummaryPayload{
		TotalTasks:        totalTasks,
		CompletedTasks:    completedTasks,
		FailedTasks:       failedTasks,
		TotalInputTokens:  usage.TotalInputTokens,
		TotalOutputTokens: usage.TotalOutputTokens,
		TotalCostUnits:    usage.TotalCostUnits,
	}
	if lastTask.LastTaskAt != nil {
		payload.LastTaskAt = lastTask.LastTaskAt.UTC().Format(time.RFC3339)
	}

	return payload, nil
}
