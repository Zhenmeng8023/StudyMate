package service

import (
	"testing"

	graphdto "studymate/backend/internal/modules/graph/dto"
	notedto "studymate/backend/internal/modules/note/dto"
)

func TestBuildGraphDraftFromNote(t *testing.T) {
	draft := BuildGraphDraftFromNote(notedto.NoteSummary{
		ID:      "note-1",
		Title:   "二叉树遍历",
		Summary: "前序、中序、后序遍历分别适合不同的推导任务。",
		Content: "<p>前序遍历适合序列化，中序遍历常用于二叉搜索树。</p>",
	})

	if draft.DraftType != "graph_change" {
		t.Fatalf("expected graph_change draft type, got %s", draft.DraftType)
	}
	if draft.SourceType != "note" || draft.SourceID != "note-1" {
		t.Fatalf("expected note source, got %#v", draft)
	}
	if draft.Metadata == nil {
		t.Fatal("expected graph draft metadata")
	}

	nodes, ok := draft.Metadata["nodes"].([]graphdto.GraphNodePayload)
	if !ok || len(nodes) == 0 {
		t.Fatalf("expected metadata nodes, got %#v", draft.Metadata["nodes"])
	}
}
