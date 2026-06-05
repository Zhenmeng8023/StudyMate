package service

import (
	"testing"

	graphdto "studymate/backend/internal/modules/graph/dto"
	readerdto "studymate/backend/internal/modules/reader/dto"
)

func TestBuildGraphDraftFromAnnotations(t *testing.T) {
	draft := BuildGraphDraftFromAnnotations("算法导论", "material-1", []readerdto.AnnotationSummary{
		{
			ID:      "annotation-1",
			Page:    12,
			Quote:   "堆是一种完全二叉树。",
			Comment: "这里强调了结构约束。",
		},
		{
			ID:      "annotation-2",
			Page:    18,
			Quote:   "堆排序依赖向下调整。",
			Comment: "可以作为操作步骤节点。",
		},
	})

	if draft.DraftType != "graph_change" {
		t.Fatalf("expected graph_change draft type, got %s", draft.DraftType)
	}
	if draft.SourceType != "material" || draft.SourceID != "material-1" {
		t.Fatalf("expected material source, got %#v", draft)
	}
	if draft.Metadata == nil {
		t.Fatal("expected graph draft metadata")
	}

	nodes, ok := draft.Metadata["nodes"].([]graphdto.GraphNodePayload)
	if !ok || len(nodes) < 2 {
		t.Fatalf("expected at least 2 nodes, got %#v", draft.Metadata["nodes"])
	}
	annotationNode := nodes[1]
	if annotationNode.Source == nil || annotationNode.Source.Type != "annotation" || annotationNode.Source.ID != "annotation-1" {
		t.Fatalf("expected annotation source on first annotation node, got %#v", annotationNode.Source)
	}
	if annotationNode.Metadata["materialId"] != "material-1" || annotationNode.Metadata["annotationId"] != "annotation-1" {
		t.Fatalf("expected material and annotation ids in metadata, got %#v", annotationNode.Metadata)
	}
	if page, ok := annotationNode.Metadata["page"].(int); !ok || page != 12 {
		t.Fatalf("expected page 12 in metadata, got %#v", annotationNode.Metadata["page"])
	}
}
