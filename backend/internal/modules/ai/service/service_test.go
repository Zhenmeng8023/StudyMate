package service

import "testing"

func TestNormalizeTaskStatus(t *testing.T) {
	if got := normalizeTaskStatus("completed"); got != "completed" {
		t.Fatalf("expected completed, got %s", got)
	}
	if got := normalizeTaskStatus("FAILED"); got != "failed" {
		t.Fatalf("expected failed, got %s", got)
	}
	if got := normalizeTaskStatus("unknown"); got != "pending" {
		t.Fatalf("expected pending fallback, got %s", got)
	}
}

func TestMaxHelpers(t *testing.T) {
	if got := maxInt64(-3, 0); got != 0 {
		t.Fatalf("expected int clamp to 0, got %d", got)
	}
	if got := maxFloat64(-1.25, 0); got != 0 {
		t.Fatalf("expected float clamp to 0, got %f", got)
	}
}
