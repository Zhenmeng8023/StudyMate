package service

import (
	"net/http"
	"testing"
	"time"

	aidto "studymate/backend/internal/modules/ai/dto"
	carddto "studymate/backend/internal/modules/card/dto"
	graphdto "studymate/backend/internal/modules/graph/dto"
	graphmodel "studymate/backend/internal/modules/graph/model"
	"studymate/backend/internal/pkg/apperrors"
)

type fakeGraphRepository struct {
	graph             *graphmodel.Graph
	createdGraph      *graphmodel.Graph
	savedGraph        *graphmodel.Graph
	createdVersion    *graphmodel.GraphVersion
	replacedRelations []graphmodel.GraphRelation
}

func (f *fakeGraphRepository) Create(graph *graphmodel.Graph) error {
	if graph.ID == "" {
		graph.ID = "graph-created"
	}
	now := time.Date(2026, 7, 1, 15, 0, 0, 0, time.UTC)
	graph.CreatedAt = now
	graph.UpdatedAt = now
	f.createdGraph = cloneGraphModel(graph)
	f.graph = cloneGraphModel(graph)
	return nil
}

func (f *fakeGraphRepository) Save(graph *graphmodel.Graph) error {
	graph.UpdatedAt = time.Date(2026, 7, 1, 15, 5, 0, 0, time.UTC)
	f.savedGraph = cloneGraphModel(graph)
	f.graph = cloneGraphModel(graph)
	return nil
}

func (f *fakeGraphRepository) Delete(_ *graphmodel.Graph) error {
	return nil
}

func (f *fakeGraphRepository) FindByID(_ string) (*graphmodel.Graph, error) {
	return cloneGraphModel(f.graph), nil
}

func (f *fakeGraphRepository) ListByOwner(_ string) ([]graphdto.GraphSummaryPayload, error) {
	return nil, nil
}

func (f *fakeGraphRepository) CreateVersion(version *graphmodel.GraphVersion) error {
	copy := *version
	f.createdVersion = &copy
	return nil
}

func (f *fakeGraphRepository) ListVersions(_ string, _ int) ([]graphdto.GraphSnapshotPayload, error) {
	return nil, nil
}

func (f *fakeGraphRepository) DeleteVersions(_ string) error {
	return nil
}

func (f *fakeGraphRepository) DeleteRelations(_ string) error {
	return nil
}

func (f *fakeGraphRepository) ReplaceSourceRelations(_ string, relations []graphmodel.GraphRelation) error {
	f.replacedRelations = append([]graphmodel.GraphRelation{}, relations...)
	return nil
}

type fakeGraphDocuments struct {
	currentDocument        *graphdto.GraphDocumentPayload
	snapshotDocument       *graphdto.GraphDocumentPayload
	upsertedCurrent        *graphdto.GraphDocumentPayload
	createdSnapshot        *graphdto.GraphDocumentPayload
	deleteGraphArtifactsID string
}

func (f *fakeGraphDocuments) UpsertCurrent(_ *graphmodel.Graph, document graphdto.GraphDocumentPayload) error {
	copy := document
	f.upsertedCurrent = &copy
	f.currentDocument = &copy
	return nil
}

func (f *fakeGraphDocuments) FindCurrent(_ string) (*graphdto.GraphDocumentPayload, error) {
	return cloneGraphDocument(f.currentDocument), nil
}

func (f *fakeGraphDocuments) CreateSnapshot(_ *graphmodel.Graph, document graphdto.GraphDocumentPayload) (string, error) {
	copy := document
	f.createdSnapshot = &copy
	return "snapshot:test", nil
}

func (f *fakeGraphDocuments) FindSnapshot(_ string, _ int64) (*graphdto.GraphDocumentPayload, error) {
	return cloneGraphDocument(f.snapshotDocument), nil
}

func (f *fakeGraphDocuments) DeleteGraphArtifacts(graphID string) error {
	f.deleteGraphArtifactsID = graphID
	return nil
}

type fakeGraphAuditLogs struct {
	lastAction string
	lastTarget string
	lastMeta   map[string]any
}

func (f *fakeGraphAuditLogs) Create(_ string, action string, target string, metadata map[string]any) error {
	f.lastAction = action
	f.lastTarget = target
	f.lastMeta = metadata
	return nil
}

type fakeGraphCards struct{}

func (f *fakeGraphCards) BulkCreateCards(_ string, _ string, _ []carddto.CreateCardRequest) ([]carddto.CardPayload, error) {
	return nil, nil
}

func (f *fakeGraphCards) ReviewFeedback(_ string) (*carddto.ReviewFeedbackPayload, error) {
	return nil, nil
}

type fakeGraphCardsWithFeedback struct {
	reviewFeedback *carddto.ReviewFeedbackPayload
}

func (f *fakeGraphCardsWithFeedback) BulkCreateCards(_ string, _ string, _ []carddto.CreateCardRequest) ([]carddto.CardPayload, error) {
	return nil, nil
}

func (f *fakeGraphCardsWithFeedback) ReviewFeedback(_ string) (*carddto.ReviewFeedbackPayload, error) {
	return f.reviewFeedback, nil
}

type fakeGraphAITasks struct{}

func (f *fakeGraphAITasks) RecordGraphCardDrafts(_ string, _ string, drafts []graphdto.GraphCardDraftPayload) ([]graphdto.GraphCardDraftPayload, error) {
	return drafts, nil
}

func (f *fakeGraphAITasks) GetDraftsByIDs(_ string, _ []string) ([]aidto.DraftPayload, error) {
	return nil, nil
}

func (f *fakeGraphAITasks) ResolveGraphChangeDrafts(_ string, _ []string, _ map[string]map[string]any) error {
	return nil
}

func TestCreateGraphInitializesLifecycleWithVersionOne(t *testing.T) {
	repo := &fakeGraphRepository{}
	documents := &fakeGraphDocuments{}
	audit := &fakeGraphAuditLogs{}
	service := NewService(repo, documents, audit, &fakeGraphCards{}, &fakeGraphAITasks{})

	result, err := service.CreateGraph("user-1", graphdto.CreateGraphRequest{
		Title:       "Graph lifecycle",
		Description: "first version",
		Visibility:  "private",
	})
	if err != nil {
		t.Fatalf("CreateGraph returned error: %v", err)
	}

	if result.CurrentVersion != 1 || result.Document.Version != 1 {
		t.Fatalf("expected version 1 detail, got summary=%d document=%d", result.CurrentVersion, result.Document.Version)
	}
	if documents.upsertedCurrent == nil || documents.createdSnapshot == nil {
		t.Fatalf("expected create graph to persist current document and snapshot")
	}
	if repo.createdVersion == nil || repo.createdVersion.VersionNumber != 1 {
		t.Fatalf("expected graph version row for v1, got %#v", repo.createdVersion)
	}
	if audit.lastAction != "graph.create" {
		t.Fatalf("expected graph.create audit, got %q", audit.lastAction)
	}
}

func TestBatchSaveIncrementsVersionAndPersistsLifecycleArtifacts(t *testing.T) {
	repo := &fakeGraphRepository{
		graph: &graphmodel.Graph{
			ID:             "graph-1",
			OwnerUserID:    "user-1",
			Title:          "Before save",
			Visibility:     "private",
			Status:         "active",
			GraphType:      "knowledge",
			Mode:           "free",
			CurrentVersion: 1,
		},
	}
	documents := &fakeGraphDocuments{}
	service := NewService(repo, documents, &fakeGraphAuditLogs{}, &fakeGraphCards{}, &fakeGraphAITasks{})

	result, err := service.BatchSave("user-1", "graph-1", graphdto.GraphBatchSaveRequest{
		Title:       "After save",
		Description: "saved",
		Summary:     "手动保存节点编辑",
		Document: graphdto.GraphDocumentPayload{
			GraphID:       "graph-1",
			Version:       1,
			SchemaVersion: 1,
			Nodes: []graphdto.GraphNodePayload{
				{ID: "node-1", Type: "concept", Title: "Node", Width: 240, Height: 120, Source: &graphdto.GraphNodeSourcePayload{Type: "note", ID: "note-1"}},
			},
			Edges:    []graphdto.GraphEdgePayload{},
			Groups:   []graphdto.GraphGroupPayload{},
			Viewport: graphdto.GraphViewportPayload{X: 0, Y: 0, Zoom: 1},
		},
	})
	if err != nil {
		t.Fatalf("BatchSave returned error: %v", err)
	}

	if result.CurrentVersion != 2 || result.Document.Version != 2 {
		t.Fatalf("expected version 2 detail, got summary=%d document=%d", result.CurrentVersion, result.Document.Version)
	}
	if repo.savedGraph == nil || repo.savedGraph.CurrentVersion != 2 {
		t.Fatalf("expected graph current version 2, got %#v", repo.savedGraph)
	}
	if repo.createdVersion == nil || repo.createdVersion.VersionNumber != 2 || repo.createdVersion.Summary != "手动保存节点编辑" {
		t.Fatalf("expected persisted version 2 summary, got %#v", repo.createdVersion)
	}
	if documents.upsertedCurrent == nil || documents.upsertedCurrent.Version != 2 {
		t.Fatalf("expected current document v2, got %#v", documents.upsertedCurrent)
	}
	if len(repo.replacedRelations) != 1 || repo.replacedRelations[0].TargetID != "note-1" {
		t.Fatalf("expected source relation sync, got %#v", repo.replacedRelations)
	}
}

func TestBatchSaveRejectsStaleDocumentVersionInsteadOfSilentlyOverwriting(t *testing.T) {
	repo := &fakeGraphRepository{
		graph: &graphmodel.Graph{
			ID:             "graph-1",
			OwnerUserID:    "user-1",
			Title:          "Current graph",
			Visibility:     "private",
			Status:         "active",
			GraphType:      "knowledge",
			Mode:           "free",
			CurrentVersion: 5,
		},
	}
	documents := &fakeGraphDocuments{}
	service := NewService(repo, documents, &fakeGraphAuditLogs{}, &fakeGraphCards{}, &fakeGraphAITasks{})

	result, err := service.BatchSave("user-1", "graph-1", graphdto.GraphBatchSaveRequest{
		Title:       "Stale save",
		Description: "should fail",
		Summary:     "自动保存",
		Document: graphdto.GraphDocumentPayload{
			GraphID:       "graph-1",
			Version:       4,
			SchemaVersion: 1,
			Viewport:      graphdto.GraphViewportPayload{X: 0, Y: 0, Zoom: 1},
			Nodes: []graphdto.GraphNodePayload{
				{ID: "node-1", Type: "concept", Title: "Node", Width: 240, Height: 120},
			},
			Edges:  []graphdto.GraphEdgePayload{},
			Groups: []graphdto.GraphGroupPayload{},
		},
	})
	if err == nil {
		t.Fatalf("expected stale save to fail, got result %#v", result)
	}
	appErr := apperrors.As(err)
	if appErr.Status != http.StatusConflict || appErr.Code != "graph_version_conflict" {
		t.Fatalf("expected graph_version_conflict 409, got %#v", appErr)
	}
	if repo.savedGraph != nil || repo.createdVersion != nil || documents.upsertedCurrent != nil {
		t.Fatalf("stale save must not persist graph lifecycle artifacts: saved=%#v version=%#v current=%#v", repo.savedGraph, repo.createdVersion, documents.upsertedCurrent)
	}
}

func TestGetGraphEnrichesSourceNodeMetadataWithReviewFeedback(t *testing.T) {
	repo := &fakeGraphRepository{
		graph: &graphmodel.Graph{
			ID:             "graph-1",
			OwnerUserID:    "user-1",
			Title:          "Mastery graph",
			Visibility:     "private",
			Status:         "active",
			GraphType:      "knowledge",
			Mode:           "free",
			CurrentVersion: 3,
		},
	}
	documents := &fakeGraphDocuments{
		currentDocument: &graphdto.GraphDocumentPayload{
			GraphID:       "graph-1",
			Version:       3,
			SchemaVersion: 1,
			Viewport:      graphdto.GraphViewportPayload{X: 0, Y: 0, Zoom: 1},
			Nodes: []graphdto.GraphNodePayload{
				{
					ID:     "node-1",
					Type:   "material",
					Title:  "Source node",
					Width:  240,
					Height: 120,
					Source: &graphdto.GraphNodeSourcePayload{Type: "material", ID: "material-1"},
					Metadata: map[string]any{
						"detail": "preserved",
					},
				},
				{
					ID:       "node-2",
					Type:     "concept",
					Title:    "Free node",
					Width:    220,
					Height:   120,
					Metadata: map[string]any{"detail": "free"},
				},
			},
			Edges:  []graphdto.GraphEdgePayload{},
			Groups: []graphdto.GraphGroupPayload{},
		},
	}
	cards := &fakeGraphCardsWithFeedback{
		reviewFeedback: &carddto.ReviewFeedbackPayload{
			SourceSummaries: []carddto.ReviewFeedbackSourcePayload{
				{
					SourceType:        "material",
					SourceID:          "material-1",
					TotalCardCount:    3,
					ReviewCardCount:   2,
					MasteredCardCount: 1,
					MasteryLevel:      "building",
					MasteryScore:      33,
					WeakCardCount:     2,
					DueCount:          1,
					LearningCount:     2,
					MaxLapseCount:     3,
					SampleCardFronts:  []string{"Card A"},
				},
			},
		},
	}
	service := NewService(repo, documents, &fakeGraphAuditLogs{}, cards, &fakeGraphAITasks{})

	result, err := service.GetGraph("user-1", "graph-1")
	if err != nil {
		t.Fatalf("GetGraph returned error: %v", err)
	}

	sourceNode := result.Document.Nodes[0]
	if sourceNode.Metadata["detail"] != "preserved" {
		t.Fatalf("expected existing metadata to survive enrichment, got %#v", sourceNode.Metadata)
	}
	reviewFeedback, ok := sourceNode.Metadata["reviewFeedback"].(carddto.ReviewFeedbackSourcePayload)
	if !ok {
		t.Fatalf("expected reviewFeedback summary on source node, got %#v", sourceNode.Metadata["reviewFeedback"])
	}
	if reviewFeedback.MasteryScore != 33 || reviewFeedback.WeakCardCount != 2 {
		t.Fatalf("unexpected review feedback summary: %#v", reviewFeedback)
	}
	if _, exists := result.Document.Nodes[1].Metadata["reviewFeedback"]; exists {
		t.Fatalf("expected free node to remain unenriched, got %#v", result.Document.Nodes[1].Metadata)
	}
}

func TestRestoreSnapshotPromotesSnapshotToNewCurrentVersionAndRecomputesMode(t *testing.T) {
	repo := &fakeGraphRepository{
		graph: &graphmodel.Graph{
			ID:             "graph-1",
			OwnerUserID:    "user-1",
			Title:          "Mixed graph",
			Visibility:     "private",
			Status:         "active",
			GraphType:      "knowledge",
			Mode:           "free",
			CurrentVersion: 4,
		},
	}
	documents := &fakeGraphDocuments{
		snapshotDocument: &graphdto.GraphDocumentPayload{
			GraphID:       "graph-1",
			Version:       2,
			SchemaVersion: 1,
			Viewport:      graphdto.GraphViewportPayload{X: 120, Y: 90, Zoom: 1},
			Nodes: []graphdto.GraphNodePayload{
				{ID: "node-1", Type: "diagram", Title: "Class", Width: 240, Height: 120, Source: &graphdto.GraphNodeSourcePayload{Type: "material", ID: "material-1"}},
				{ID: "node-2", Type: "diagram", Title: "Interface", Width: 240, Height: 120, Source: &graphdto.GraphNodeSourcePayload{Type: "material", ID: "material-2"}},
			},
			Edges: []graphdto.GraphEdgePayload{
				{ID: "edge-1", SourceNodeID: "node-1", TargetNodeID: "node-2"},
			},
			Groups:   []graphdto.GraphGroupPayload{},
			Theme:    map[string]any{},
			Metadata: map[string]any{"importType": "mermaid"},
		},
	}
	service := NewService(repo, documents, &fakeGraphAuditLogs{}, &fakeGraphCards{}, &fakeGraphAITasks{})

	result, err := service.RestoreSnapshot("user-1", "graph-1", graphdto.RestoreGraphRequest{VersionNumber: 2})
	if err != nil {
		t.Fatalf("RestoreSnapshot returned error: %v", err)
	}

	if result.CurrentVersion != 5 || result.Document.Version != 5 {
		t.Fatalf("expected restored current version 5, got summary=%d document=%d", result.CurrentVersion, result.Document.Version)
	}
	if repo.savedGraph == nil || repo.savedGraph.Mode != "diagram" {
		t.Fatalf("expected restored graph mode diagram, got %#v", repo.savedGraph)
	}
	if repo.createdVersion == nil || repo.createdVersion.VersionNumber != 5 || repo.createdVersion.Summary != "恢复历史快照" {
		t.Fatalf("expected restored version row, got %#v", repo.createdVersion)
	}
	if documents.upsertedCurrent == nil || documents.upsertedCurrent.Version != 5 {
		t.Fatalf("expected current document rewritten to version 5, got %#v", documents.upsertedCurrent)
	}
}

func TestPreviewLayoutBuildsSourceSwimlanesWithoutPersistingGraphLifecycle(t *testing.T) {
	repo := &fakeGraphRepository{
		graph: &graphmodel.Graph{
			ID:              "graph-1",
			OwnerUserID:     "user-1",
			Title:           "Layout graph",
			Visibility:      "private",
			Status:          "active",
			GraphType:       "knowledge",
			Mode:            "free",
			CurrentVersion:  4,
			ThumbnailFileID: "file-thumb-1",
		},
	}
	documents := &fakeGraphDocuments{}
	service := NewService(repo, documents, &fakeGraphAuditLogs{}, &fakeGraphCards{}, &fakeGraphAITasks{})

	result, err := service.PreviewLayout("user-1", "graph-1", graphdto.PreviewGraphLayoutRequest{
		Mode:    "source-swimlane",
		NodeIDs: []string{"material-1", "note-1"},
		Document: graphdto.GraphDocumentPayload{
			GraphID:       "graph-1",
			Version:       4,
			SchemaVersion: 1,
			Viewport:      graphdto.GraphViewportPayload{X: 0, Y: 0, Zoom: 1},
			Nodes: []graphdto.GraphNodePayload{
				{ID: "material-1", Type: "material", Title: "资料 A", X: 240, Y: 180, Width: 120, Height: 80, Source: &graphdto.GraphNodeSourcePayload{Type: "material", ID: "m1", Label: "资料 A"}},
				{ID: "note-1", Type: "rich-note", Title: "笔记 A", X: 80, Y: 120, Width: 140, Height: 80, Source: &graphdto.GraphNodeSourcePayload{Type: "note", ID: "n1", Label: "笔记 A"}},
				{ID: "free-1", Type: "concept", Title: "自由节点", X: 760, Y: 400, Width: 120, Height: 80},
			},
			Edges: []graphdto.GraphEdgePayload{},
			Groups: []graphdto.GraphGroupPayload{
				{ID: "existing-swimlane", Title: "旧资料泳道", NodeIDs: []string{"material-1"}, X: 0, Y: 0, Width: 200, Height: 120, Metadata: map[string]any{"layoutKind": "source-swimlane"}},
				{ID: "manual-group", Title: "手动分组", NodeIDs: []string{"material-1", "note-1"}, X: 40, Y: 40, Width: 200, Height: 120},
			},
			Theme:    map[string]any{},
			Metadata: map[string]any{},
		},
	})
	if err != nil {
		t.Fatalf("PreviewLayout returned error: %v", err)
	}

	if result.Mode != "source-swimlane" || result.LaneCount != 2 {
		t.Fatalf("expected source-swimlane with two lanes, got %#v", result)
	}
	if result.StatusMessage != "已生成 2 条来源泳道" {
		t.Fatalf("unexpected status message: %q", result.StatusMessage)
	}
	if result.Document.Version != 4 {
		t.Fatalf("expected preview to keep current version 4, got %d", result.Document.Version)
	}
	if len(result.SelectedNodeIDs) != 2 || result.SelectedNodeIDs[0] != "material-1" || result.SelectedNodeIDs[1] != "note-1" {
		t.Fatalf("unexpected selected node ids: %#v", result.SelectedNodeIDs)
	}
	if len(result.Document.Groups) != 3 || result.Document.Groups[0].ID != "manual-group" {
		t.Fatalf("expected manual group plus regenerated swimlanes, got %#v", result.Document.Groups)
	}
	if result.Document.Groups[1].Metadata["layoutKind"] != "source-swimlane" || result.Document.Groups[2].Metadata["layoutKind"] != "source-swimlane" {
		t.Fatalf("expected generated swimlane metadata, got %#v", result.Document.Groups)
	}
	if repo.savedGraph != nil || repo.createdVersion != nil || documents.upsertedCurrent != nil {
		t.Fatalf("layout preview must not persist lifecycle state: saved=%#v version=%#v current=%#v", repo.savedGraph, repo.createdVersion, documents.upsertedCurrent)
	}
}

func cloneGraphModel(graph *graphmodel.Graph) *graphmodel.Graph {
	if graph == nil {
		return nil
	}
	copy := *graph
	return &copy
}

func cloneGraphDocument(document *graphdto.GraphDocumentPayload) *graphdto.GraphDocumentPayload {
	if document == nil {
		return nil
	}
	copy := *document
	copy.Nodes = append([]graphdto.GraphNodePayload{}, document.Nodes...)
	copy.Edges = append([]graphdto.GraphEdgePayload{}, document.Edges...)
	copy.Groups = append([]graphdto.GraphGroupPayload{}, document.Groups...)
	return &copy
}
