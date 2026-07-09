package service

import (
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	admindto "studymate/backend/internal/modules/admin/dto"
	adminmodel "studymate/backend/internal/modules/admin/model"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	communityrepo "studymate/backend/internal/modules/community/repository"
	graphdto "studymate/backend/internal/modules/graph/dto"
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

func (s *Service) HandleUser(actorID string, userID string, action string) error {
	if action != "disable" && action != "activate" {
		return apperrors.New(400, "invalid_user_action", "unsupported user action")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		type row struct {
			ID     string
			Role   string
			Status string
		}

		var user row
		if err := tx.Table("users").
			Select("id, role, COALESCE(status, 'active') AS status").
			Take(&user, "id = ?", userID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return apperrors.New(404, "user_not_found", "user not found")
			}
			return apperrors.Internal("handle admin user failed")
		}

		if user.Role == "admin" {
			return apperrors.New(409, "protected_admin_account", "admin accounts cannot be disabled here")
		}

		nextStatus := ""
		switch action {
		case "disable":
			if user.Status != "active" {
				return apperrors.New(409, "invalid_user_transition", "only active users can be disabled")
			}
			nextStatus = "disabled"
		case "activate":
			if user.Status != "disabled" {
				return apperrors.New(409, "invalid_user_transition", "only disabled users can be activated")
			}
			nextStatus = "active"
		}

		if err := tx.Table("users").
			Where("id = ?", userID).
			Updates(map[string]any{
				"status":     nextStatus,
				"updated_at": time.Now().UTC(),
			}).Error; err != nil {
			return apperrors.Internal("handle admin user failed")
		}

		if action == "disable" {
			revokedAt := time.Now().UTC()
			if err := tx.Table("refresh_tokens").
				Where("user_id = ? AND revoked_at IS NULL", userID).
				Updates(map[string]any{
					"revoked_at": revokedAt,
					"updated_at": revokedAt,
				}).Error; err != nil {
				return apperrors.Internal("revoke disabled user sessions failed")
			}
		}

		metadata, err := json.Marshal(map[string]any{
			"userId":         userID,
			"action":         action,
			"previousStatus": user.Status,
			"status":         nextStatus,
		})
		if err != nil {
			return apperrors.Internal("create admin user audit log failed")
		}

		if err := tx.Create(&adminmodel.AuditLog{
			ActorID:  actorID,
			Action:   "admin.handle.user",
			Target:   "user",
			Metadata: string(metadata),
		}).Error; err != nil {
			return apperrors.Internal("create admin user audit log failed")
		}

		return nil
	})
}

func (s *Service) ListMaterials(limit int) ([]admindto.AdminMaterialPayload, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	type row struct {
		ID             string
		OwnerUserID    string
		OwnerName      string
		Title          string
		Description    string
		Category       string
		AttachmentName string
		Status         string
		CreatedAt      time.Time
		UpdatedAt      time.Time
	}

	var rows []row
	err := s.db.Table("materials").
		Select(`
			materials.id,
			materials.owner_user_id,
			users.display_name AS owner_name,
			materials.title,
			materials.description,
			materials.category,
			files.original_name AS attachment_name,
			materials.status,
			materials.created_at,
			materials.updated_at
		`).
		Joins("left join users on users.id = materials.owner_user_id").
		Joins("left join file_records as files on files.id = materials.attachment_file_id").
		Order("materials.created_at DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, apperrors.Internal("list admin materials failed")
	}

	result := make([]admindto.AdminMaterialPayload, 0, len(rows))
	for _, row := range rows {
		result = append(result, admindto.AdminMaterialPayload{
			ID:             row.ID,
			OwnerUserID:    row.OwnerUserID,
			OwnerName:      row.OwnerName,
			Title:          row.Title,
			Description:    row.Description,
			Category:       row.Category,
			AttachmentName: row.AttachmentName,
			Status:         row.Status,
			CreatedAt:      row.CreatedAt.UTC().Format(time.RFC3339),
			UpdatedAt:      row.UpdatedAt.UTC().Format(time.RFC3339),
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
		HandledBy      string
		HandledAt      sql.NullTime
		CreatedAt      time.Time
	}

	var rows []row
	err := s.db.Table("reports").
		Select(`
			id,
			reporter_user_id,
			target_type,
			target_id,
			reason,
			COALESCE(description, '') AS description,
			status,
			COALESCE(handled_by, '') AS handled_by,
			handled_at,
			created_at
		`).
		Order("created_at DESC").
		Limit(limit).
		Scan(&rows).Error
	if err != nil {
		return nil, apperrors.Internal("list admin reports failed")
	}

	result := make([]admindto.AdminReportPayload, 0, len(rows))
	for _, row := range rows {
		handledAt := ""
		if row.HandledAt.Valid {
			handledAt = row.HandledAt.Time.UTC().Format(time.RFC3339)
		}

		result = append(result, admindto.AdminReportPayload{
			ID:             row.ID,
			ReporterUserID: row.ReporterUserID,
			TargetType:     row.TargetType,
			TargetID:       row.TargetID,
			Reason:         row.Reason,
			Description:    row.Description,
			Status:         row.Status,
			HandledBy:      row.HandledBy,
			HandledAt:      handledAt,
			CreatedAt:      row.CreatedAt.UTC().Format(time.RFC3339),
		})
	}
	return result, nil
}

func (s *Service) HandleReport(actorID string, reportID string, status string) error {
	if status != "resolved" && status != "dismissed" {
		return apperrors.New(400, "invalid_report_status", "unsupported report status")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		type row struct {
			ID     string
			Status string
		}

		var report row
		if err := tx.Table("reports").
			Select("id, status").
			Where("id = ?", reportID).
			Take(&report).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return apperrors.New(404, "report_not_found", "report not found")
			}

			return apperrors.Internal("handle admin report failed")
		}

		if err := tx.Table("reports").
			Where("id = ?", reportID).
			Updates(map[string]any{
				"status":     status,
				"handled_by": actorID,
				"handled_at": time.Now().UTC(),
			}).Error; err != nil {
			return apperrors.Internal("handle admin report failed")
		}

		if err := adminrepo.NewAuditLogRepository(tx).Create(actorID, "admin.handle.report", "report", map[string]any{
			"reportId":       reportID,
			"previousStatus": report.Status,
			"status":         status,
		}); err != nil {
			return apperrors.Internal("create admin report audit log failed")
		}

		return nil
	})
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

func (s *Service) ListDiagramTemplates(limit int) ([]admindto.AdminDiagramTemplatePayload, error) {
	catalog := graphdto.DefaultDiagramTemplateCatalog()
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if len(catalog) > limit {
		catalog = catalog[:limit]
	}

	rows := make([]admindto.AdminDiagramTemplatePayload, 0, len(catalog))
	if s.graphs == nil {
		for _, entry := range catalog {
			rows = append(rows, admindto.AdminDiagramTemplatePayload{
				ID:          entry.ID,
				Name:        entry.Name,
				Category:    entry.Category,
				Description: entry.Description,
				Mode:        entry.Mode,
				SourceType:  entry.SourceType,
				Status:      "published",
			})
		}
		return rows, nil
	}

	templateIDs := make([]string, 0, len(catalog))
	for _, entry := range catalog {
		templateIDs = append(templateIDs, entry.ID)
	}

	states, err := s.graphs.ListDiagramTemplateStates(templateIDs)
	if err != nil {
		return nil, apperrors.Internal("list admin diagram templates failed")
	}

	for _, entry := range catalog {
		row := admindto.AdminDiagramTemplatePayload{
			ID:          entry.ID,
			Name:        entry.Name,
			Category:    entry.Category,
			Description: entry.Description,
			Mode:        entry.Mode,
			SourceType:  entry.SourceType,
			Status:      "published",
		}

		if state, ok := states[entry.ID]; ok {
			row.Status = graphdto.NormalizeDiagramTemplateStatus(state.Status)
			if state.SourceType != "" {
				row.SourceType = state.SourceType
			}
			row.CreatedBy = state.CreatedBy
			if !state.CreatedAt.IsZero() {
				row.CreatedAt = state.CreatedAt.UTC().Format(time.RFC3339)
			}
			if !state.UpdatedAt.IsZero() {
				row.UpdatedAt = state.UpdatedAt.UTC().Format(time.RFC3339)
			}
		}

		rows = append(rows, row)
	}

	return rows, nil
}

func (s *Service) HandleDiagramTemplate(actorID string, templateID string, action string) error {
	if action != "publish" && action != "unpublish" {
		return apperrors.New(400, "invalid_diagram_template_action", "unsupported diagram template action")
	}

	entry, ok := graphdto.FindDiagramTemplateCatalogEntry(templateID)
	if !ok {
		return apperrors.New(404, "diagram_template_not_found", "diagram template not found")
	}
	if s.graphs == nil {
		return apperrors.Internal("handle admin diagram template failed")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		repository := graphrepo.NewRepository(tx)
		existing, err := repository.FindDiagramTemplateState(templateID)
		if err != nil {
			return apperrors.Internal("handle admin diagram template failed")
		}

		previousStatus := "published"
		createdBy := actorID
		createdAt := time.Now().UTC()
		if existing != nil {
			previousStatus = graphdto.NormalizeDiagramTemplateStatus(existing.Status)
			if existing.CreatedBy != "" {
				createdBy = existing.CreatedBy
			}
			if !existing.CreatedAt.IsZero() {
				createdAt = existing.CreatedAt.UTC()
			}
		}

		nextStatus := "published"
		if action == "unpublish" {
			nextStatus = "unpublished"
		}
		if previousStatus == nextStatus {
			return apperrors.New(409, "invalid_diagram_template_transition", "diagram template already in target status")
		}

		now := time.Now().UTC()
		if err := repository.SaveDiagramTemplateState(graphrepo.DiagramTemplateState{
			ID:          entry.ID,
			Name:        entry.Name,
			Category:    entry.Category,
			Description: entry.Description,
			SourceType:  entry.SourceType,
			Status:      nextStatus,
			CreatedBy:   createdBy,
			CreatedAt:   createdAt,
			UpdatedAt:   now,
		}); err != nil {
			return apperrors.Internal("handle admin diagram template failed")
		}

		if err := adminrepo.NewAuditLogRepository(tx).Create(actorID, "admin.handle.diagram_template", "diagram_template", map[string]any{
			"templateId":       entry.ID,
			"action":           action,
			"previousStatus":   previousStatus,
			"status":           nextStatus,
			"templateMode":     entry.Mode,
			"templateCategory": entry.Category,
		}); err != nil {
			return apperrors.Internal("create admin diagram template audit log failed")
		}

		return nil
	})
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
		ErrorMessage string
		CreatedAt    time.Time
		UpdatedAt    time.Time
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
			COALESCE(error_message, '') AS error_message,
			created_at,
			updated_at
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
			ErrorMessage: row.ErrorMessage,
			CreatedAt:    row.CreatedAt.UTC().Format(time.RFC3339),
			UpdatedAt:    row.UpdatedAt.UTC().Format(time.RFC3339),
		})
	}
	return result, nil
}

func (s *Service) HandleAITask(actorID string, taskID string, action string) error {
	if action != "retry" && action != "cancel" {
		return apperrors.New(400, "invalid_ai_task_action", "unsupported ai task action")
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		type row struct {
			ID     string
			Status string
		}

		var task row
		if err := tx.Table("ai_tasks").
			Select("id, status").
			Take(&task, "id = ?", taskID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return apperrors.New(404, "ai_task_not_found", "AI task not found")
			}
			return apperrors.Internal("handle admin ai task failed")
		}

		nextStatus := ""
		updates := map[string]any{}
		switch action {
		case "retry":
			if task.Status != "failed" {
				return apperrors.New(409, "invalid_ai_task_transition", "only failed tasks can be retried")
			}
			nextStatus = "pending"
			updates["status"] = nextStatus
			updates["error_message"] = ""
		case "cancel":
			if task.Status != "pending" {
				return apperrors.New(409, "invalid_ai_task_transition", "only pending tasks can be cancelled")
			}
			nextStatus = "cancelled"
			updates["status"] = nextStatus
		}

		if err := tx.Table("ai_tasks").Where("id = ?", taskID).Updates(updates).Error; err != nil {
			return apperrors.Internal("handle admin ai task failed")
		}

		metadata, err := json.Marshal(map[string]any{
			"taskId":         taskID,
			"action":         action,
			"previousStatus": task.Status,
			"status":         nextStatus,
		})
		if err != nil {
			return apperrors.Internal("create admin ai task audit log failed")
		}

		if err := tx.Create(&adminmodel.AuditLog{
			ActorID:  actorID,
			Action:   "admin.handle.ai_task",
			Target:   "ai_task",
			Metadata: string(metadata),
		}).Error; err != nil {
			return apperrors.Internal("create admin ai task audit log failed")
		}

		return nil
	})
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
