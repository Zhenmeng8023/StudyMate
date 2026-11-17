package repository

import (
	"math"
	"time"

	materialdto "studymate/backend/internal/modules/material/dto"
)

type materialProgressRow struct {
	MaterialID      string
	CurrentPage     int
	TotalPages      int
	ProgressPercent float64
	LastReadAt      time.Time
}

// WithReadingProgress enriches only the already-authorized resources with the requester's data.
// All progress rows are read in one query, regardless of the number of books.
func (r *Repository) WithReadingProgress(userID string, items []materialdto.MaterialSummary) ([]materialdto.MaterialSummary, error) {
	if userID == "" || len(items) == 0 {
		return items, nil
	}
	ids := make([]string, 0, len(items))
	for _, item := range items {
		ids = append(ids, item.ID)
	}
	var rows []materialProgressRow
	if err := r.db.Table("reading_progresses").
		Select("material_id, current_page, total_pages, progress_percent, last_read_at").
		Where("user_id = ? AND material_id IN ?", userID, ids).
		Find(&rows).Error; err != nil {
		return nil, err
	}
	byMaterial := make(map[string]materialdto.MaterialReadingProgress, len(rows))
	for _, row := range rows {
		byMaterial[row.MaterialID] = normalizeMaterialProgress(row)
	}
	result := make([]materialdto.MaterialSummary, len(items))
	for index, item := range items {
		result[index] = item
		if progress, exists := byMaterial[item.ID]; exists {
			result[index].ReadingProgress = &progress
		}
	}
	return result, nil
}

func normalizeMaterialProgress(row materialProgressRow) materialdto.MaterialReadingProgress {
	percent := row.ProgressPercent
	if math.IsNaN(percent) || math.IsInf(percent, 0) {
		percent = 0
	}
	lastReadAt := ""
	if !row.LastReadAt.IsZero() {
		lastReadAt = row.LastReadAt.Format(time.RFC3339)
	}
	return materialdto.MaterialReadingProgress{
		CurrentPage: max(0, row.CurrentPage), TotalPages: max(0, row.TotalPages),
		ProgressPercent: min(100, max(0, percent)), LastReadAt: lastReadAt,
	}
}
