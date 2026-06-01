package service

import (
	"time"

	admindto "studymate/backend/internal/modules/admin/dto"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	communityrepo "studymate/backend/internal/modules/community/repository"
	graphrepo "studymate/backend/internal/modules/graph/repository"
	materialrepo "studymate/backend/internal/modules/material/repository"
	userrepo "studymate/backend/internal/modules/user/repository"
	"studymate/backend/internal/pkg/apperrors"

	"gorm.io/gorm"
)

type Service struct {
	db        *gorm.DB
	auditLogs *adminrepo.AuditLogRepository
	community *communityrepo.Repository
	materials *materialrepo.Repository
	graphs    *graphrepo.Repository
	users     *userrepo.Repository
}

func NewService(
	db *gorm.DB,
	auditLogs *adminrepo.AuditLogRepository,
	community *communityrepo.Repository,
	materials *materialrepo.Repository,
	graphs *graphrepo.Repository,
	users *userrepo.Repository,
) *Service {
	return &Service{
		db:        db,
		auditLogs: auditLogs,
		community: community,
		materials: materials,
		graphs:    graphs,
		users:     users,
	}
}

func (s *Service) ListModerationItems() ([]admindto.ModerationItem, error) {
	postItems, err := s.community.ListPostsForModerationItems()
	if err != nil {
		return nil, apperrors.Internal("读取待审核帖子失败")
	}

	materialItems, err := s.materials.ListModerationItems()
	if err != nil {
		return nil, apperrors.Internal("读取待审核资料失败")
	}

	items := append(postItems, materialItems...)

	return items, nil
}

func (s *Service) ModeratePost(actorID string, postID string, status string, reason string) error {
	post, err := s.community.FindPostByID(postID)
	if err != nil {
		return apperrors.New(404, "post_not_found", "帖子不存在")
	}
	post.Status = status
	if err := s.community.SavePost(post); err != nil {
		return apperrors.Internal("更新帖子审核状态失败")
	}

	_ = s.auditLogs.Create(actorID, "admin.moderate.post", "post", map[string]any{
		"postId": postID,
		"status": status,
		"reason": reason,
	})
	return nil
}

func (s *Service) ModerateMaterial(actorID string, materialID string, status string, reason string) error {
	material, err := s.materials.FindByID(materialID)
	if err != nil {
		return apperrors.New(404, "material_not_found", "资料不存在")
	}
	material.Status = status
	if err := s.materials.Save(material); err != nil {
		return apperrors.Internal("更新资料审核状态失败")
	}

	_ = s.auditLogs.Create(actorID, "admin.moderate.material", "material", map[string]any{
		"materialId": materialID,
		"status":     status,
		"reason":     reason,
	})
	return nil
}

func (s *Service) Overview() (*admindto.OverviewPayload, error) {
	userCount, err := s.users.CountAll()
	if err != nil {
		return nil, apperrors.Internal("读取用户概览失败")
	}

	postCount, err := s.community.CountAllPosts()
	if err != nil {
		return nil, apperrors.Internal("读取帖子概览失败")
	}

	materialCount, err := s.materials.CountAllMaterials()
	if err != nil {
		return nil, apperrors.Internal("读取资料概览失败")
	}

	graphCount, err := s.graphs.CountAllGraphs()
	if err != nil {
		return nil, apperrors.Internal("读取图谱概览失败")
	}

	pendingPosts, err := s.community.CountPendingPosts()
	if err != nil {
		return nil, apperrors.Internal("读取待审核帖子数量失败")
	}

	pendingMaterials, err := s.materials.CountPendingMaterials()
	if err != nil {
		return nil, apperrors.Internal("读取待审核资料数量失败")
	}

	return &admindto.OverviewPayload{
		UserCount:              userCount,
		PostCount:              postCount,
		MaterialCount:          materialCount,
		GraphCount:             graphCount,
		PendingModerationCount: pendingPosts + pendingMaterials,
	}, nil
}

func (s *Service) ListUsers(limit int) ([]admindto.AdminUserPayload, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	type row struct {
		ID          string
		Username    string
		Email       string
		DisplayName string
		Role        string
		Status      string
		CreatedAt   time.Time
	}

	var rows []row
	err := s.db.Table("users").
		Select("id, username, email, display_name, role, COALESCE(status, 'active') AS status, created_at").
		Order("created_at DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, apperrors.Internal("list admin users failed")
	}

	result := make([]admindto.AdminUserPayload, 0, len(rows))
	for _, row := range rows {
		result = append(result, admindto.AdminUserPayload{
			ID:          row.ID,
			Username:    row.Username,
			Email:       row.Email,
			DisplayName: row.DisplayName,
			Role:        row.Role,
			Status:      row.Status,
			CreatedAt:   row.CreatedAt.UTC().Format(time.RFC3339),
		})
	}
	return result, nil
}

func (s *Service) ListReports(limit int) ([]admindto.AdminReportPayload, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	type row struct {
		ID             string
		ReporterUserID string
		TargetType     string
		TargetID       string
		Reason         string
		Description    string
		Status         string
		CreatedAt      time.Time
	}

	var rows []row
	err := s.db.Table("reports").
		Select("id, reporter_user_id, target_type, target_id, reason, COALESCE(description, '') AS description, status, created_at").
		Order("created_at DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, apperrors.Internal("list admin reports failed")
	}

	result := make([]admindto.AdminReportPayload, 0, len(rows))
	for _, row := range rows {
		result = append(result, admindto.AdminReportPayload{
			ID:             row.ID,
			ReporterUserID: row.ReporterUserID,
			TargetType:     row.TargetType,
			TargetID:       row.TargetID,
			Reason:         row.Reason,
			Description:    row.Description,
			Status:         row.Status,
			CreatedAt:      row.CreatedAt.UTC().Format(time.RFC3339),
		})
	}
	return result, nil
}

func (s *Service) ListTags(limit int) ([]admindto.AdminTagPayload, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	var rows []admindto.AdminTagPayload
	err := s.db.Raw(`
		SELECT id, name, usage_count, 'material_tag' AS source
		FROM material_tags
		ORDER BY usage_count DESC, name ASC
		LIMIT ?
	`, limit).Scan(&rows).Error
	if err != nil {
		return nil, apperrors.Internal("list admin tags failed")
	}
	return rows, nil
}

func (s *Service) ListAITasks(limit int) ([]admindto.AdminAITaskPayload, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	type row struct {
		ID           string
		UserID       string
		TaskType     string
		SourceType   string
		SourceID     string
		Status       string
		Model        string
		InputTokens  int64
		OutputTokens int64
		CostUnits    float64
		CreatedAt    time.Time
	}

	var rows []row
	err := s.db.Table("ai_tasks").
		Select(`
			id,
			user_id,
			task_type,
			COALESCE(source_type, '') AS source_type,
			COALESCE(source_id, '') AS source_id,
			status,
			COALESCE(model, '') AS model,
			COALESCE(input_tokens, 0) AS input_tokens,
			COALESCE(output_tokens, 0) AS output_tokens,
			0 AS cost_units,
			created_at
		`).
		Order("created_at DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, apperrors.Internal("list admin ai tasks failed")
	}

	result := make([]admindto.AdminAITaskPayload, 0, len(rows))
	for _, row := range rows {
		result = append(result, admindto.AdminAITaskPayload{
			ID:           row.ID,
			UserID:       row.UserID,
			TaskType:     row.TaskType,
			SourceType:   row.SourceType,
			SourceID:     row.SourceID,
			Status:       row.Status,
			Model:        row.Model,
			InputTokens:  row.InputTokens,
			OutputTokens: row.OutputTokens,
			CostUnits:    row.CostUnits,
			CreatedAt:    row.CreatedAt.UTC().Format(time.RFC3339),
		})
	}
	return result, nil
}

func (s *Service) AIUsage() (*admindto.AdminAIUsagePayload, error) {
	payload := &admindto.AdminAIUsagePayload{}
	if err := s.db.Table("ai_tasks").Count(&payload.TotalTasks).Error; err != nil {
		return nil, apperrors.Internal("load admin ai usage failed")
	}
	if err := s.db.Table("ai_tasks").Where("status = ?", "completed").Count(&payload.CompletedTasks).Error; err != nil {
		return nil, apperrors.Internal("load admin ai usage failed")
	}
	if err := s.db.Table("ai_tasks").Where("status = ?", "failed").Count(&payload.FailedTasks).Error; err != nil {
		return nil, apperrors.Internal("load admin ai usage failed")
	}
	err := s.db.Table("ai_usage_logs").
		Select(`
			COALESCE(SUM(input_tokens), 0) AS total_input_tokens,
			COALESCE(SUM(output_tokens), 0) AS total_output_tokens,
			COALESCE(SUM(cost_units), 0) AS total_cost_units
		`).
		Scan(payload).Error
	if err != nil {
		return nil, apperrors.Internal("load admin ai usage failed")
	}
	return payload, nil
}

func (s *Service) ListAuditLogs(limit int) ([]admindto.AdminAuditLogPayload, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	type row struct {
		ID        string
		ActorID   string
		Action    string
		Target    string
		Metadata  string
		CreatedAt time.Time
	}

	var rows []row
	err := s.db.Table("audit_logs").
		Select("id, COALESCE(actor_id, '') AS actor_id, action, target, COALESCE(metadata, '') AS metadata, created_at").
		Order("created_at DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, apperrors.Internal("list admin audit logs failed")
	}

	result := make([]admindto.AdminAuditLogPayload, 0, len(rows))
	for _, row := range rows {
		result = append(result, admindto.AdminAuditLogPayload{
			ID:        row.ID,
			ActorID:   row.ActorID,
			Action:    row.Action,
			Target:    row.Target,
			Metadata:  row.Metadata,
			CreatedAt: row.CreatedAt.UTC().Format(time.RFC3339),
		})
	}
	return result, nil
}

func (s *Service) ListFiles(limit int) ([]admindto.AdminFilePayload, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	type row struct {
		ID           string
		OwnerUserID  string
		OriginalName string
		MimeType     string
		Size         int64
		Visibility   string
		ScanStatus   string
		CreatedAt    time.Time
	}

	var rows []row
	err := s.db.Table("file_records").
		Select("id, owner_user_id, original_name, mime_type, size, COALESCE(visibility, 'private') AS visibility, COALESCE(scan_status, 'pending') AS scan_status, created_at").
		Order("created_at DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, apperrors.Internal("list admin files failed")
	}

	result := make([]admindto.AdminFilePayload, 0, len(rows))
	for _, row := range rows {
		result = append(result, admindto.AdminFilePayload{
			ID:           row.ID,
			OwnerUserID:  row.OwnerUserID,
			OriginalName: row.OriginalName,
			MimeType:     row.MimeType,
			Size:         row.Size,
			Visibility:   row.Visibility,
			ScanStatus:   row.ScanStatus,
			CreatedAt:    row.CreatedAt.UTC().Format(time.RFC3339),
		})
	}
	return result, nil
}
