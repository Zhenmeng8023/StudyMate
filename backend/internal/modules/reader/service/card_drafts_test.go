package service

import (
	"testing"

	readerdto "studymate/backend/internal/modules/reader/dto"
)

func TestBuildCardDraftsFromAnnotations(t *testing.T) {
	drafts := BuildCardDraftsFromAnnotations("算法导论", []readerdto.AnnotationSummary{
		{
			ID:      "annotation-1",
			Page:    12,
			Quote:   "Binary search reduces the search space by half.",
			Comment: "二分查找的关键是每一步都把区间缩小一半。",
		},
	})

	if len(drafts) != 1 {
		t.Fatalf("expected 1 draft, got %d", len(drafts))
	}
	if drafts[0].SourceType != "annotation" || drafts[0].SourceID != "annotation-1" {
		t.Fatalf("unexpected source info: %#v", drafts[0])
	}
}
