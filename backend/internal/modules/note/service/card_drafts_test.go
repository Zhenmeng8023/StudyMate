package service

import (
	"testing"

	notedto "studymate/backend/internal/modules/note/dto"
)

func TestBuildCardDraftsFromNote(t *testing.T) {
	drafts := BuildCardDraftsFromNote(notedto.NoteSummary{
		ID:      "note-1",
		Title:   "二叉树",
		Summary: "二叉树是一种每个节点最多包含两个子节点的树形结构。",
		Content: "<p>二叉树是一种每个节点最多包含两个子节点的树形结构。</p><p>它常用于搜索和表达层级关系。</p>",
	})

	if len(drafts) == 0 {
		t.Fatal("expected note drafts")
	}
	if drafts[0].SourceType != "note" || drafts[0].SourceID != "note-1" {
		t.Fatalf("unexpected source info: %#v", drafts[0])
	}
	if drafts[0].Front == "" || drafts[0].Back == "" {
		t.Fatalf("expected non-empty draft content: %#v", drafts[0])
	}
}
