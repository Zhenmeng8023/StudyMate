package service

import (
	"strings"

	adminrepo "studymate/backend/internal/modules/admin/repository"
	aidto "studymate/backend/internal/modules/ai/dto"
	aimodel "studymate/backend/internal/modules/ai/model"
	airepo "studymate/backend/internal/modules/ai/repository"
	carddto "studymate/backend/internal/modules/card/dto"
	graphdto "studymate/backend/internal/modules/graph/dto"
	"studymate/backend/internal/pkg/apperrors"
)

type RecordTaskInput struct {
	UserID        string
	TaskType      string
	SourceType    string
	SourceID      string
	Status        string
	Model         string
	InputTokens   int64
	OutputTokens  int64
	CostUnits     float64
	ResultRefType string
	ResultRefID   string
	ErrorMessage  string
}

type Service struct {
	repository *airepo.Repository
	documents  *airepo.DocumentRepository
	auditLogs  *adminrepo.AuditLogRepository
}

func NewService(repository *airepo.Repository, documents *airepo.DocumentRepository, auditLogs *adminrepo.AuditLogRepository) *Service {
	return &Service{
		repository: repository,
		documents:  documents,
		auditLogs:  auditLogs,
	}
}

func (s *Service) ListTasks(userID string) ([]aidto.TaskPayload, error) {
	result, err := s.repository.ListTasksByUser(userID, 30)
	if err != nil {
		return nil, apperrors.Internal("读取 AI 任务列表失败")
	}

	return result, nil
}

func (s *Service) UsageSummary(userID string) (*aidto.UsageSummaryPayload, error) {
	result, err := s.repository.UsageSummaryByUser(userID)
	if err != nil {
		return nil, apperrors.Internal("读取 AI 用量统计失败")
	}

	return result, nil
}

func (s *Service) ListDrafts(userID string) ([]aidto.DraftPayload, error) {
	if s.documents == nil {
		return nil, nil
	}

	result, err := s.documents.ListDraftsByUser(userID, 24)
	if err != nil {
		return nil, apperrors.Internal("读取 AI 草稿列表失败")
	}

	return result, nil
}

func (s *Service) RecordTask(input RecordTaskInput) error {
	_, err := s.createTaskRecord(input)
	return err
}

func (s *Service) RecordNoteCardDrafts(userID string, noteID string, drafts []carddto.CardDraftPayload) ([]carddto.CardDraftPayload, error) {
	taskID, err := s.createTaskRecord(RecordTaskInput{
		UserID:        userID,
		TaskType:      "note.generate_cards",
		SourceType:    "note",
		SourceID:      noteID,
		Status:        "completed",
		Model:         "local-draft-engine",
		OutputTokens:  int64(len(drafts)),
		ResultRefType: "note",
		ResultRefID:   noteID,
	})
	if err != nil || s.documents == nil || len(drafts) == 0 {
		return drafts, err
	}

	inputs := make([]aidto.DraftPayload, 0, len(drafts))
	for _, draft := range drafts {
		inputs = append(inputs, aidto.DraftPayload{
			DraftType:   "card_draft",
			TargetType:  "note",
			TargetID:    noteID,
			SourceType:  draft.SourceType,
			SourceID:    draft.SourceID,
			SourceLabel: draft.SourceLabel,
			Metadata:    draft.SourceMetadata,
			Front:       draft.Front,
			Back:        draft.Back,
			Explanation: draft.Explanation,
		})
	}

	saved, err := s.documents.CreateDrafts(userID, taskID, inputs)
	if err != nil {
		return nil, apperrors.Internal("保存 AI 草稿失败")
	}

	result := make([]carddto.CardDraftPayload, 0, len(saved))
	for index, draft := range drafts {
		result = append(result, carddto.CardDraftPayload{
			ID:             draft.ID,
			DraftID:        saved[index].ID,
			SourceType:     draft.SourceType,
			SourceID:       draft.SourceID,
			SourceLabel:    draft.SourceLabel,
			SourceMetadata: draft.SourceMetadata,
			Front:          draft.Front,
			Back:           draft.Back,
			Explanation:    draft.Explanation,
		})
	}

	return result, nil
}

func (s *Service) RecordReaderCardDrafts(userID string, materialID string, drafts []carddto.CardDraftPayload) ([]carddto.CardDraftPayload, error) {
	taskID, err := s.createTaskRecord(RecordTaskInput{
		UserID:        userID,
		TaskType:      "reader.generate_cards",
		SourceType:    "material",
		SourceID:      materialID,
		Status:        "completed",
		Model:         "local-draft-engine",
		OutputTokens:  int64(len(drafts)),
		ResultRefType: "material",
		ResultRefID:   materialID,
	})
	if err != nil || s.documents == nil || len(drafts) == 0 {
		return drafts, err
	}

	inputs := make([]aidto.DraftPayload, 0, len(drafts))
	for _, draft := range drafts {
		inputs = append(inputs, aidto.DraftPayload{
			DraftType:   "card_draft",
			TargetType:  "material",
			TargetID:    materialID,
			SourceType:  draft.SourceType,
			SourceID:    draft.SourceID,
			SourceLabel: draft.SourceLabel,
			Metadata:    draft.SourceMetadata,
			Front:       draft.Front,
			Back:        draft.Back,
			Explanation: draft.Explanation,
		})
	}

	saved, err := s.documents.CreateDrafts(userID, taskID, inputs)
	if err != nil {
		return nil, apperrors.Internal("保存 AI 草稿失败")
	}

	result := make([]carddto.CardDraftPayload, 0, len(saved))
	for index, draft := range drafts {
		result = append(result, carddto.CardDraftPayload{
			ID:             draft.ID,
			DraftID:        saved[index].ID,
			SourceType:     draft.SourceType,
			SourceID:       draft.SourceID,
			SourceLabel:    draft.SourceLabel,
			SourceMetadata: draft.SourceMetadata,
			Front:          draft.Front,
			Back:           draft.Back,
			Explanation:    draft.Explanation,
		})
	}

	return result, nil
}

func (s *Service) RecordGraphCardDrafts(userID string, graphID string, drafts []graphdto.GraphCardDraftPayload) ([]graphdto.GraphCardDraftPayload, error) {
	taskID, err := s.createTaskRecord(RecordTaskInput{
		UserID:        userID,
		TaskType:      "graph.generate_cards",
		SourceType:    "graph",
		SourceID:      graphID,
		Status:        "completed",
		Model:         "local-draft-engine",
		OutputTokens:  int64(len(drafts)),
		ResultRefType: "graph",
		ResultRefID:   graphID,
	})
	if err != nil || s.documents == nil || len(drafts) == 0 {
		return drafts, err
	}

	inputs := make([]aidto.DraftPayload, 0, len(drafts))
	for _, draft := range drafts {
		inputs = append(inputs, aidto.DraftPayload{
			DraftType:   "card_draft",
			TargetType:  "graph",
			TargetID:    graphID,
			SourceLabel: draft.SourceNodeID,
			Front:       draft.Front,
			Back:        draft.Back,
			Explanation: draft.Explanation,
		})
	}

	saved, err := s.documents.CreateDrafts(userID, taskID, inputs)
	if err != nil {
		return nil, apperrors.Internal("保存 AI 草稿失败")
	}

	result := make([]graphdto.GraphCardDraftPayload, 0, len(saved))
	for index, draft := range drafts {
		result = append(result, graphdto.GraphCardDraftPayload{
			ID:           draft.ID,
			DraftID:      saved[index].ID,
			SourceNodeID: draft.SourceNodeID,
			Front:        draft.Front,
			Back:         draft.Back,
			Explanation:  draft.Explanation,
		})
	}

	return result, nil
}

func (s *Service) ConfirmDrafts(userID string, draftIDs []string) error {
	if s.documents == nil || len(draftIDs) == 0 {
		return nil
	}

	if err := s.documents.ConfirmDrafts(userID, draftIDs); err != nil {
		return apperrors.Internal("确认 AI 草稿状态失败")
	}

	return nil
}

func (s *Service) GetDraftsByIDs(userID string, draftIDs []string) ([]aidto.DraftPayload, error) {
	if s.documents == nil || len(draftIDs) == 0 {
		return nil, nil
	}

	result, err := s.documents.ListDraftsByIDs(userID, draftIDs)
	if err != nil {
		return nil, apperrors.Internal("读取 AI 草稿失败")
	}

	return result, nil
}

func (s *Service) RecordNoteGraphDrafts(userID string, noteID string, drafts []aidto.DraftPayload) ([]aidto.DraftPayload, error) {
	return s.recordStructuredDrafts(userID, "note.generate_graph_changes", "note", noteID, drafts)
}

func (s *Service) RecordReaderGraphDrafts(userID string, materialID string, drafts []aidto.DraftPayload) ([]aidto.DraftPayload, error) {
	return s.recordStructuredDrafts(userID, "reader.generate_graph_changes", "material", materialID, drafts)
}

func (s *Service) recordStructuredDrafts(userID string, taskType string, sourceType string, sourceID string, drafts []aidto.DraftPayload) ([]aidto.DraftPayload, error) {
	taskID, err := s.createTaskRecord(RecordTaskInput{
		UserID:        userID,
		TaskType:      taskType,
		SourceType:    sourceType,
		SourceID:      sourceID,
		Status:        "completed",
		Model:         "local-draft-engine",
		OutputTokens:  int64(len(drafts)),
		ResultRefType: sourceType,
		ResultRefID:   sourceID,
	})
	if err != nil || s.documents == nil || len(drafts) == 0 {
		return drafts, err
	}

	saved, err := s.documents.CreateDrafts(userID, taskID, drafts)
	if err != nil {
		return nil, apperrors.Internal("保存 AI 草稿失败")
	}

	return saved, nil
}

func (s *Service) ResolveGraphChangeDrafts(userID string, draftIDs []string, remainders map[string]map[string]any) error {
	if s.documents == nil || len(draftIDs) == 0 {
		return nil
	}

	confirmed := make([]string, 0, len(draftIDs))
	for _, draftID := range draftIDs {
		if metadata, ok := remainders[draftID]; ok {
			if err := s.documents.UpdateDraftMetadata(userID, draftID, metadata); err != nil {
				return apperrors.Internal("更新图谱草稿剩余节点失败")
			}
			continue
		}
		confirmed = append(confirmed, draftID)
	}

	if len(confirmed) == 0 {
		return nil
	}

	if err := s.documents.ConfirmDrafts(userID, confirmed); err != nil {
		return apperrors.Internal("确认图谱草稿状态失败")
	}

	return nil
}

func (s *Service) createTaskRecord(input RecordTaskInput) (string, error) {
	if s == nil || s.repository == nil {
		return "", nil
	}
	if strings.TrimSpace(input.UserID) == "" || strings.TrimSpace(input.TaskType) == "" {
		return "", nil
	}

	modelName := strings.TrimSpace(input.Model)
	if modelName == "" {
		modelName = "local-draft-engine"
	}

	task := &aimodel.AITask{
		UserID:        input.UserID,
		TaskType:      strings.TrimSpace(input.TaskType),
		SourceType:    strings.TrimSpace(input.SourceType),
		SourceID:      strings.TrimSpace(input.SourceID),
		Status:        normalizeTaskStatus(input.Status),
		Model:         modelName,
		InputTokens:   maxInt64(input.InputTokens, 0),
		OutputTokens:  maxInt64(input.OutputTokens, 0),
		ResultRefType: strings.TrimSpace(input.ResultRefType),
		ResultRefID:   strings.TrimSpace(input.ResultRefID),
		ErrorMessage:  strings.TrimSpace(input.ErrorMessage),
	}
	if err := s.repository.CreateTask(task); err != nil {
		return "", err
	}

	usageLog := &aimodel.AIUsageLog{
		UserID:       input.UserID,
		TaskID:       task.ID,
		Model:        modelName,
		InputTokens:  maxInt64(input.InputTokens, 0),
		OutputTokens: maxInt64(input.OutputTokens, 0),
		CostUnits:    maxFloat64(input.CostUnits, 0),
	}
	if err := s.repository.CreateUsageLog(usageLog); err != nil {
		return "", err
	}

	_ = s.auditLogs.Create(input.UserID, "ai.task.record", "ai_task", map[string]any{
		"taskId":     task.ID,
		"taskType":   task.TaskType,
		"status":     task.Status,
		"sourceType": task.SourceType,
		"sourceId":   task.SourceID,
	})

	return task.ID, nil
}

func normalizeTaskStatus(status string) string {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case "completed":
		return "completed"
	case "failed":
		return "failed"
	default:
		return "pending"
	}
}

func maxInt64(value int64, minimum int64) int64 {
	if value < minimum {
		return minimum
	}

	return value
}

func maxFloat64(value float64, minimum float64) float64 {
	if value < minimum {
		return minimum
	}

	return value
}
