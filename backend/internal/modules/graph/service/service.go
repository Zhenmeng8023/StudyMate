package service

import (
	"errors"
	"log"
	"net/http"
	"strings"

	"gorm.io/gorm"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	aiservice "studymate/backend/internal/modules/ai/service"
	carddto "studymate/backend/internal/modules/card/dto"
	cardservice "studymate/backend/internal/modules/card/service"
	graphdto "studymate/backend/internal/modules/graph/dto"
	graphmodel "studymate/backend/internal/modules/graph/model"
	graphrepo "studymate/backend/internal/modules/graph/repository"
	"studymate/backend/internal/pkg/apperrors"
)

type Service struct {
	repository *graphrepo.Repository
	documents  *graphrepo.DocumentRepository
	auditLogs  *adminrepo.AuditLogRepository
	cards      *cardservice.Service
	aiTasks    *aiservice.Service
}

func NewService(
	repository *graphrepo.Repository,
	documents *graphrepo.DocumentRepository,
	auditLogs *adminrepo.AuditLogRepository,
	cards *cardservice.Service,
	aiTasks *aiservice.Service,
) *Service {
	return &Service{
		repository: repository,
		documents:  documents,
		auditLogs:  auditLogs,
		cards:      cards,
		aiTasks:    aiTasks,
	}
}

func (s *Service) ListGraphs(ownerUserID string) ([]graphdto.GraphSummaryPayload, error) {
	graphs, err := s.repository.ListByOwner(ownerUserID)
	if err != nil {
		return nil, apperrors.Internal("读取图谱列表失败")
	}

	return graphs, nil
}

func (s *Service) CreateGraph(ownerUserID string, request graphdto.CreateGraphRequest) (*graphdto.GraphDetailPayload, error) {
	graph := &graphmodel.Graph{
		OwnerUserID:    ownerUserID,
		Title:          request.Title,
		Description:    request.Description,
		Visibility:     normalizeVisibility(request.Visibility),
		Status:         "active",
		GraphType:      "knowledge",
		Mode:           "free",
		CurrentVersion: 1,
	}

	if err := s.repository.Create(graph); err != nil {
		return nil, apperrors.Internal("创建图谱失败")
	}

	document := defaultDocument(graph.ID, graph.CurrentVersion)
	s.persistDocument(ownerUserID, graph, document, "初始图谱")

	_ = s.auditLogs.Create(ownerUserID, "graph.create", "graph", map[string]any{
		"graphId": graph.ID,
	})

	return s.buildDetail(graph, document), nil
}

func (s *Service) GetGraph(ownerUserID string, graphID string) (*graphdto.GraphDetailPayload, error) {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return nil, err
	}

	document, err := s.documents.FindCurrent(graph.ID)
	if err != nil {
		return nil, apperrors.Internal("读取图谱文档失败")
	}
	if document == nil {
		defaultDoc := defaultDocument(graph.ID, graph.CurrentVersion)
		document = &defaultDoc
	}

	return s.buildDetail(graph, *document), nil
}

func (s *Service) UpdateGraph(ownerUserID string, graphID string, request graphdto.UpdateGraphRequest) (*graphdto.GraphSummaryPayload, error) {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return nil, err
	}

	graph.Title = request.Title
	graph.Description = request.Description
	graph.Visibility = normalizeVisibility(request.Visibility)

	if err := s.repository.Save(graph); err != nil {
		return nil, apperrors.Internal("更新图谱信息失败")
	}

	summary := graphrepo.BuildSummary(*graph)
	return &summary, nil
}

func (s *Service) DeleteGraph(ownerUserID string, graphID string) error {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return err
	}

	if err := s.repository.DeleteRelations(graph.ID); err != nil {
		return apperrors.Internal("删除图谱关联失败")
	}
	if err := s.repository.DeleteVersions(graph.ID); err != nil {
		return apperrors.Internal("删除图谱版本失败")
	}
	if err := s.repository.Delete(graph); err != nil {
		return apperrors.Internal("删除图谱失败")
	}

	if s.documents != nil {
		if err := s.documents.DeleteGraphArtifacts(graph.ID); err != nil {
			log.Printf("graph mongo delete artifacts failed: graph=%s err=%v", graph.ID, err)
		}
	}

	return nil
}

func (s *Service) BatchSave(ownerUserID string, graphID string, request graphdto.GraphBatchSaveRequest) (*graphdto.GraphDetailPayload, error) {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return nil, err
	}

	if HasBlockingValidationIssues(ValidateDocument(request.Document)) {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_graph_document", "图谱包含重复 ID、悬挂连线或非法尺寸等结构错误")
	}

	graph.CurrentVersion++
	graph.Title = request.Title
	graph.Description = request.Description
	graph.NodeCount = int64(len(request.Document.Nodes))
	graph.EdgeCount = int64(len(request.Document.Edges))

	if err := s.repository.Save(graph); err != nil {
		return nil, apperrors.Internal("保存图谱失败")
	}

	document := request.Document
	document.GraphID = graph.ID
	document.Version = graph.CurrentVersion
	if document.SchemaVersion == 0 {
		document.SchemaVersion = 1
	}

	s.persistDocument(ownerUserID, graph, document, request.Summary)

	_ = s.auditLogs.Create(ownerUserID, "graph.batch_save", "graph", map[string]any{
		"graphId": graph.ID,
		"nodes":   graph.NodeCount,
		"edges":   graph.EdgeCount,
	})

	return s.buildDetail(graph, document), nil
}

func (s *Service) ListSnapshots(ownerUserID string, graphID string) ([]graphdto.GraphSnapshotPayload, error) {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return nil, err
	}

	snapshots, err := s.repository.ListVersions(graph.ID, 20)
	if err != nil {
		return nil, apperrors.Internal("读取图谱快照失败")
	}

	return snapshots, nil
}

func (s *Service) RestoreSnapshot(ownerUserID string, graphID string, request graphdto.RestoreGraphRequest) (*graphdto.GraphDetailPayload, error) {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return nil, err
	}

	if s.documents == nil {
		return nil, apperrors.Internal("当前环境不支持图谱快照恢复")
	}

	document, err := s.documents.FindSnapshot(graph.ID, request.VersionNumber)
	if err != nil {
		return nil, apperrors.Internal("读取图谱快照失败")
	}
	if document == nil {
		return nil, apperrors.New(http.StatusNotFound, "graph_snapshot_not_found", "指定版本的图谱快照不存在")
	}

	graph.CurrentVersion++
	graph.NodeCount = int64(len(document.Nodes))
	graph.EdgeCount = int64(len(document.Edges))
	if err := s.repository.Save(graph); err != nil {
		return nil, apperrors.Internal("恢复图谱快照失败")
	}

	document.GraphID = graph.ID
	document.Version = graph.CurrentVersion
	s.persistDocument(ownerUserID, graph, *document, "恢复历史快照")

	return s.buildDetail(graph, *document), nil
}

func (s *Service) ImportMarkdown(ownerUserID string, graphID string, request graphdto.ImportGraphRequest) (*graphdto.GraphDetailPayload, error) {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return nil, err
	}

	document := BuildDocumentFromMarkdownOutline(graph.ID, graph.CurrentVersion+1, request.Source)
	return s.saveImportedDocument(ownerUserID, graph, document, "导入 Markdown 大纲")
}

func (s *Service) ImportMermaid(ownerUserID string, graphID string, request graphdto.ImportGraphRequest) (*graphdto.GraphDetailPayload, error) {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return nil, err
	}

	document, parseErr := BuildDocumentFromMermaid(graph.ID, graph.CurrentVersion+1, request.Source)
	if parseErr != nil {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_mermaid_source", "Mermaid 内容无法解析为图谱草稿")
	}

	return s.saveImportedDocument(ownerUserID, graph, document, "导入 Mermaid 草稿")
}

func (s *Service) ValidateGraph(ownerUserID string, graphID string) (*graphdto.GraphValidationResponse, error) {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return nil, err
	}

	var document *graphdto.GraphDocumentPayload
	if s.documents != nil {
		document, err = s.documents.FindCurrent(graph.ID)
		if err != nil {
			return nil, apperrors.Internal("读取图谱文档失败")
		}
	}
	if document == nil {
		defaultDoc := defaultDocument(graph.ID, graph.CurrentVersion)
		document = &defaultDoc
	}

	return &graphdto.GraphValidationResponse{
		Issues: ValidateDocument(*document),
	}, nil
}

func (s *Service) GenerateCardDrafts(ownerUserID string, graphID string, request graphdto.GraphCardDraftRequest) ([]graphdto.GraphCardDraftPayload, error) {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return nil, err
	}

	var document *graphdto.GraphDocumentPayload
	if s.documents != nil {
		document, err = s.documents.FindCurrent(graph.ID)
		if err != nil {
			return nil, apperrors.Internal("读取图谱文档失败")
		}
	}
	if document == nil {
		defaultDoc := defaultDocument(graph.ID, graph.CurrentVersion)
		document = &defaultDoc
	}

	drafts := BuildCardDrafts(*document, request.NodeIDs)
	if s.aiTasks == nil {
		return drafts, nil
	}

	persisted, err := s.aiTasks.RecordGraphCardDrafts(ownerUserID, graph.ID, drafts)
	if err != nil {
		return nil, err
	}

	return persisted, nil
}

func (s *Service) CommitCardDrafts(ownerUserID string, graphID string, request graphdto.CommitGraphCardDraftsRequest) ([]carddto.CardPayload, error) {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return nil, err
	}
	if s.cards == nil {
		return nil, apperrors.Internal("当前环境暂不支持写入复习卡片")
	}

	var document *graphdto.GraphDocumentPayload
	if s.documents != nil {
		document, err = s.documents.FindCurrent(graph.ID)
		if err != nil {
			return nil, apperrors.Internal("读取图谱文档失败")
		}
	}
	if document == nil {
		defaultDoc := defaultDocument(graph.ID, graph.CurrentVersion)
		document = &defaultDoc
	}

	cardRequests, err := BuildCardCreateRequests(*document, request.Drafts)
	if err != nil {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_card_drafts", "卡片草稿中包含无效节点或空白内容")
	}

	cards, err := s.cards.BulkCreateCards(ownerUserID, request.DeckID, cardRequests)
	if err != nil {
		return nil, err
	}

	_ = s.auditLogs.Create(ownerUserID, "graph.card_drafts.commit", "graph", map[string]any{
		"graphId": graph.ID,
		"deckId":  request.DeckID,
		"count":   len(cards),
	})

	return cards, nil
}

func (s *Service) CommitGraphChangeDrafts(ownerUserID string, graphID string, request graphdto.CommitGraphChangeDraftsRequest) (*graphdto.GraphDetailPayload, error) {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return nil, err
	}
	if s.aiTasks == nil {
		return nil, apperrors.Internal("当前环境暂不支持确认 AI 图谱草稿")
	}

	var document *graphdto.GraphDocumentPayload
	if s.documents != nil {
		document, err = s.documents.FindCurrent(graph.ID)
		if err != nil {
			return nil, apperrors.Internal("读取图谱文档失败")
		}
	}
	if document == nil {
		defaultDoc := defaultDocument(graph.ID, graph.CurrentVersion)
		document = &defaultDoc
	}

	drafts, err := s.aiTasks.GetDraftsByIDs(ownerUserID, request.DraftIDs)
	if err != nil {
		return nil, err
	}
	if len(drafts) == 0 {
		return nil, apperrors.New(http.StatusNotFound, "ai_draft_not_found", "未找到待确认的图谱草稿")
	}
	for _, draft := range drafts {
		if strings.TrimSpace(draft.DraftType) != "graph_change" {
			return nil, apperrors.New(http.StatusBadRequest, "invalid_graph_draft", "所选草稿里包含非图谱变更类型")
		}
		if strings.TrimSpace(draft.Status) != "pending" {
			return nil, apperrors.New(http.StatusBadRequest, "graph_draft_already_processed", "所选草稿已经被处理过")
		}
	}

	nodeSelections := make(map[string][]string, len(request.NodeSelections))
	for _, selection := range request.NodeSelections {
		nodeSelections[strings.TrimSpace(selection.DraftID)] = selection.NodeIDs
	}

	updatedDocument, remainders, err := ApplyGraphChangeDrafts(*document, drafts, nodeSelections)
	if err != nil {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_graph_draft", "图谱变更草稿内容无效")
	}

	result, err := s.saveImportedDocument(ownerUserID, graph, updatedDocument, "应用 AI 图谱变更草稿")
	if err != nil {
		return nil, err
	}
	if err := s.aiTasks.ResolveGraphChangeDrafts(ownerUserID, request.DraftIDs, remainders); err != nil {
		return nil, err
	}

	_ = s.auditLogs.Create(ownerUserID, "graph.change_drafts.commit", "graph", map[string]any{
		"graphId": graph.ID,
		"count":   len(drafts),
	})

	return result, nil
}

func (s *Service) ListDiagramTemplates() []graphdto.DiagramTemplatePayload {
	return []graphdto.DiagramTemplatePayload{
		{
			ID:          "learning-material-map",
			Name:        "学习资料梳理",
			Category:    "learning-material",
			Description: "把资料、批注、笔记和待理解概念组织成一条可追溯学习链。",
			Mode:        "learning",
			SampleLines: []string{"资料主线", "关键批注", "沉淀笔记", "待理解概念"},
		},
		{
			ID:          "book-notes-map",
			Name:        "读书笔记",
			Category:    "book-notes",
			Description: "围绕书籍章节、章节摘要、核心观点和问题反思沉淀长期笔记。",
			Mode:        "learning",
			SampleLines: []string{"书籍/章节", "章节摘要", "核心观点", "问题与反思"},
		},
		{
			ID:          "concept-network",
			Name:        "概念网络",
			Category:    "concept-network",
			Description: "把核心概念、前置概念、相关概念和 AI 解释草稿连接起来。",
			Mode:        "learning",
			SampleLines: []string{"核心概念", "前置概念", "相关概念", "AI 解释草稿"},
		},
		{
			ID:          "review-card-prep",
			Name:        "复习卡片准备",
			Category:    "review-card",
			Description: "从复习来源笔记整理可提问知识点、卡片草稿和易混淆点。",
			Mode:        "learning",
			SampleLines: []string{"复习来源笔记", "可提问知识点", "卡片草稿", "易混淆点"},
		},
	}
}

func (s *Service) saveImportedDocument(ownerUserID string, graph *graphmodel.Graph, document graphdto.GraphDocumentPayload, summary string) (*graphdto.GraphDetailPayload, error) {
	if HasBlockingValidationIssues(ValidateDocument(document)) {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_graph_document", "图谱包含重复 ID、悬挂连线或非法尺寸等结构错误")
	}

	graph.CurrentVersion++
	graph.NodeCount = int64(len(document.Nodes))
	graph.EdgeCount = int64(len(document.Edges))
	graph.Mode = normalizeGraphMode(document)
	if err := s.repository.Save(graph); err != nil {
		return nil, apperrors.Internal("保存导入图谱失败")
	}

	document.GraphID = graph.ID
	document.Version = graph.CurrentVersion
	s.persistDocument(ownerUserID, graph, document, summary)
	return s.buildDetail(graph, document), nil
}

func (s *Service) persistDocument(ownerUserID string, graph *graphmodel.Graph, document graphdto.GraphDocumentPayload, summary string) {
	if s.documents != nil {
		if err := s.documents.UpsertCurrent(graph, document); err != nil {
			log.Printf("graph mongo sync current failed: graph=%s err=%v", graph.ID, err)
		}

		snapshotID, err := s.documents.CreateSnapshot(graph, document)
		if err != nil {
			log.Printf("graph mongo sync snapshot failed: graph=%s version=%d err=%v", graph.ID, document.Version, err)
		} else {
			version := &graphmodel.GraphVersion{
				GraphID:         graph.ID,
				VersionNumber:   document.Version,
				EditorUserID:    ownerUserID,
				MongoSnapshotID: snapshotID,
				Summary:         summary,
			}
			if err := s.repository.CreateVersion(version); err != nil {
				log.Printf("graph version create failed: graph=%s version=%d err=%v", graph.ID, document.Version, err)
			}
		}
	}

	relations := graphrepo.ExtractSourceRelations(document)
	for index := range relations {
		relations[index].GraphID = graph.ID
	}
	if err := s.repository.ReplaceSourceRelations(graph.ID, relations); err != nil {
		log.Printf("graph source relation sync failed: graph=%s err=%v", graph.ID, err)
	}
}

func (s *Service) buildDetail(graph *graphmodel.Graph, document graphdto.GraphDocumentPayload) *graphdto.GraphDetailPayload {
	return &graphdto.GraphDetailPayload{
		GraphSummaryPayload: graphrepo.BuildSummary(*graph),
		Document:            document,
	}
}

func (s *Service) requireOwnerGraph(ownerUserID string, graphID string) (*graphmodel.Graph, error) {
	graph, err := s.repository.FindByID(graphID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "graph_not_found", "图谱不存在")
		}
		return nil, apperrors.Internal("读取图谱失败")
	}

	if graph.OwnerUserID != ownerUserID {
		return nil, apperrors.New(http.StatusForbidden, "forbidden", "只能访问自己的图谱")
	}

	return graph, nil
}

func normalizeVisibility(value string) string {
	if value == "public" {
		return value
	}

	return "private"
}

func normalizeGraphMode(document graphdto.GraphDocumentPayload) string {
	if importType, ok := document.Metadata["importType"].(string); ok {
		if strings.EqualFold(importType, "mermaid") {
			return "diagram"
		}
	}

	return "free"
}

func defaultDocument(graphID string, version int64) graphdto.GraphDocumentPayload {
	return graphdto.GraphDocumentPayload{
		GraphID:       graphID,
		Version:       version,
		SchemaVersion: 1,
		Viewport: graphdto.GraphViewportPayload{
			X:    0,
			Y:    0,
			Zoom: 1,
		},
		Nodes:    []graphdto.GraphNodePayload{},
		Edges:    []graphdto.GraphEdgePayload{},
		Groups:   []graphdto.GraphGroupPayload{},
		Theme:    map[string]any{},
		Metadata: map[string]any{},
	}
}
