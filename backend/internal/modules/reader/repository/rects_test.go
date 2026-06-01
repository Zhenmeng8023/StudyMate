package repository

import (
	"testing"

	readerdto "studymate/backend/internal/modules/reader/dto"
)

func TestEncodeDecodePDFRects(t *testing.T) {
	t.Parallel()

	raw := EncodePDFRects([]readerdto.PDFRect{
		{Page: 2, X: -0.2, Y: 0.25, Width: 1.2, Height: 0.1},
		{Page: 0, X: 0.1, Y: 0.1, Width: 0.2, Height: 0.2},
	})

	rects := DecodePDFRects(raw)
	if len(rects) != 1 {
		t.Fatalf("expected one normalized rect, got %d", len(rects))
	}
	if rects[0].Page != 2 || rects[0].X != 0 || rects[0].Width != 1 {
		t.Fatalf("expected rect to be clamped and preserved, got %#v", rects[0])
	}
}

func TestDecodePDFRectsHandlesInvalidPayload(t *testing.T) {
	t.Parallel()

	if rects := DecodePDFRects("not-json"); len(rects) != 0 {
		t.Fatalf("expected invalid payload to decode as empty, got %#v", rects)
	}
}
