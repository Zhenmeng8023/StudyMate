package service

import (
	"testing"

	readerdto "studymate/backend/internal/modules/reader/dto"
)

func TestBuildCardDraftsFromAnnotations(t *testing.T) {
	drafts := BuildCardDraftsFromAnnotations("算法导论", []readerdto.AnnotationSummary{
		{
			ID:         "annotation-1",
			MaterialID: "material-1",
			Page:       12,
			Quote:      "Binary search reduces the search space by half.",
			Comment:    "二分查找的关键是每一步都把区间缩小一半。",
		},
	})

	if len(drafts) != 1 {
		t.Fatalf("expected 1 draft, got %d", len(drafts))
	}
	if drafts[0].SourceType != "annotation" || drafts[0].SourceID != "annotation-1" {
		t.Fatalf("unexpected source info: %#v", drafts[0])
	}
	if drafts[0].SourceMetadata == nil {
		t.Fatalf("expected source metadata to be populated")
	}
	if drafts[0].SourceMetadata["materialId"] != "material-1" || drafts[0].SourceMetadata["annotationId"] != "annotation-1" {
		t.Fatalf("expected source metadata to include material and annotation ids, got %#v", drafts[0].SourceMetadata)
	}
	if page, ok := drafts[0].SourceMetadata["page"].(int); !ok || page != 12 {
		t.Fatalf("expected source metadata to include page 12, got %#v", drafts[0].SourceMetadata["page"])
	}
}
