package service

import (
	"errors"
	"log"
	"net/http"
	"strings"

	"gorm.io/gorm"
	aidto "studymate/backend/internal/modules/ai/dto"
	carddto "studymate/backend/internal/modules/card/dto"
	graphdto "studymate/backend/internal/modules/graph/dto"
	graphmodel "studymate/backend/internal/modules/graph/model"
	graphrepo "studymate/backend/internal/modules/graph/repository"
	"studymate/backend/internal/pkg/apperrors"
)

type graphRepository interface {
	Create(graph *graphmodel.Graph) error
	Save(graph *graphmodel.Graph) error
	Delete(graph *graphmodel.Graph) error
	FindByID(graphID string) (*graphmodel.Graph, error)
	ListByOwner(ownerUserID string) ([]graphdto.GraphSummaryPayload, error)
	CreateVersion(version *graphmodel.GraphVersion) error
	ListVersions(graphID string, limit int) ([]graphdto.GraphSnapshotPayload, error)
	DeleteVersions(graphID string) error
	DeleteRelations(graphID string) error
	ReplaceSourceRelations(graphID string, relations []graphmodel.GraphRelation) error
}

type graphDocumentStore interface {
	UpsertCurrent(graph *graphmodel.Graph, document graphdto.GraphDocumentPayload) error
	FindCurrent(graphID string) (*graphdto.GraphDocumentPayload, error)
	CreateSnapshot(graph *graphmodel.Graph, document graphdto.GraphDocumentPayload) (string, error)
	FindSnapshot(graphID string, version int64) (*graphdto.GraphDocumentPayload, error)
	DeleteGraphArtifacts(graphID string) error
}

type auditLogRecorder interface {
	Create(actorUserID string, action string, targetType string, metadata map[string]any) error
}

type graphCardService interface {
	BulkCreateCards(ownerUserID string, deckID string, requests []carddto.CreateCardRequest) ([]carddto.CardPayload, error)
}

type graphAITaskService interface {
	RecordGraphCardDrafts(ownerUserID string, graphID string, drafts []graphdto.GraphCardDraftPayload) ([]graphdto.GraphCardDraftPayload, error)
	GetDraftsByIDs(ownerUserID string, draftIDs []string) ([]aidto.DraftPayload, error)
	ResolveGraphChangeDrafts(ownerUserID string, draftIDs []string, remainders map[string]map[string]any) error
}

type Service struct {
	repository graphRepository
	documents  graphDocumentStore
	auditLogs  auditLogRecorder
	cards      graphCardService
	aiTasks    graphAITaskService
}

func NewService(
	repository graphRepository,
	documents graphDocumentStore,
	auditLogs auditLogRecorder,
	cards graphCardService,
	aiTasks graphAITaskService,
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
	if request.Document.Version != graph.CurrentVersion {
		return nil, apperrors.New(
			http.StatusConflict,
			"graph_version_conflict",
			"图谱已被其他窗口更新，请刷新当前图谱后再保存。",
		)
	}

	nextVersion := graph.CurrentVersion + 1
	document := graphdto.NormalizeDocumentPayload(graph.ID, nextVersion, request.Document)

	if HasBlockingValidationIssues(ValidateDocument(document)) {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_graph_document", "图谱包含重复 ID、悬挂连线或非法尺寸等结构错误")
	}

	graph.CurrentVersion = nextVersion
	graph.Title = request.Title
	graph.Description = request.Description
	graph.NodeCount = int64(len(document.Nodes))
	graph.EdgeCount = int64(len(document.Edges))

	if err := s.repository.Save(graph); err != nil {
		return nil, apperrors.Internal("保存图谱失败")
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
	graph.Mode = normalizeGraphMode(*document)
	if err := s.repository.Save(graph); err != nil {
		return nil, apperrors.Internal("恢复图谱快照失败")
	}

	normalized := graphdto.NormalizeDocumentPayload(graph.ID, graph.CurrentVersion, *document)
	s.persistDocument(ownerUserID, graph, normalized, "恢复历史快照")

	return s.buildDetail(graph, normalized), nil
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

func (s *Service) PreviewLayout(ownerUserID string, graphID string, request graphdto.PreviewGraphLayoutRequest) (*graphdto.GraphLayoutPreviewPayload, error) {
	graph, err := s.requireOwnerGraph(ownerUserID, graphID)
	if err != nil {
		return nil, err
	}

	document := graphdto.NormalizeDocumentPayload(graph.ID, graph.CurrentVersion, request.Document)

	switch request.Mode {
	case "source-swimlane":
		preview, ok := BuildSourceSwimlanePreview(document, request.NodeIDs)
		if !ok {
			return nil, apperrors.New(http.StatusBadRequest, "invalid_graph_layout_request", "至少选择两个现有节点生成来源泳道")
		}
		return &graphdto.GraphLayoutPreviewPayload{
			Mode:            request.Mode,
			StatusMessage:   preview.StatusMessage,
			Document:        preview.Document,
			SelectedNodeIDs: preview.SelectedNodeIDs,
			LaneCount:       preview.LaneCount,
		}, nil
	default:
		return nil, apperrors.New(http.StatusBadRequest, "invalid_graph_layout_request", "不支持的图谱布局模式")
	}
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
		{
			ID:          "uml-class-diagram",
			Name:        "UML 类图",
			Category:    "uml",
			Description: "梳理类、接口、属性、方法和依赖关系，适合软件设计课程复盘。",
			Mode:        "diagram",
			SampleLines: []string{"领域模型", "核心类", "接口契约", "依赖关系"},
		},
		{
			ID:          "erd-schema-diagram",
			Name:        "ERD 数据模型",
			Category:    "erd",
			Description: "从实体、字段、主键和关系整理数据库结构，后续可承接 SQL DDL 导入草稿。",
			Mode:        "diagram",
			SampleLines: []string{"业务实体", "关键字段", "主键约束", "实体关系"},
		},
		{
			ID:          "c4-context-diagram",
			Name:        "C4 上下文图",
			Category:    "c4",
			Description: "表达系统、用户、外部依赖和边界，适合架构学习和项目复盘。",
			Mode:        "diagram",
			SampleLines: []string{"目标系统", "使用者", "外部系统", "系统边界"},
		},
		{
			ID:          "flowchart-process",
			Name:        "流程图",
			Category:    "flowchart",
			Description: "把步骤、判断、输入输出和异常路径整理成可复习的流程图。",
			Mode:        "diagram",
			SampleLines: []string{"开始", "关键步骤", "判断分支", "结束/回滚"},
		},
	}
}

func (s *Service) saveImportedDocument(ownerUserID string, graph *graphmodel.Graph, document graphdto.GraphDocumentPayload, summary string) (*graphdto.GraphDetailPayload, error) {
	nextVersion := graph.CurrentVersion + 1
	normalized := graphdto.NormalizeDocumentPayload(graph.ID, nextVersion, document)

	if HasBlockingValidationIssues(ValidateDocument(normalized)) {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_graph_document", "图谱包含重复 ID、悬挂连线或非法尺寸等结构错误")
	}

	graph.CurrentVersion = nextVersion
	graph.NodeCount = int64(len(normalized.Nodes))
	graph.EdgeCount = int64(len(normalized.Edges))
	graph.Mode = normalizeGraphMode(normalized)
	if err := s.repository.Save(graph); err != nil {
		return nil, apperrors.Internal("保存导入图谱失败")
	}

	s.persistDocument(ownerUserID, graph, normalized, summary)
	return s.buildDetail(graph, normalized), nil
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
	return graphdto.NewEmptyDocumentPayload(graphID, version)
}
