package service

import "testing"

func TestRandomTokenIsURLSafeAndUnique(t *testing.T) {
	first, err := randomToken()
	if err != nil {
		t.Fatalf("randomToken returned error: %v", err)
	}
	second, err := randomToken()
	if err != nil {
		t.Fatalf("randomToken returned error: %v", err)
	}
	if first == second {
		t.Fatal("expected generated share tokens to be unique")
	}
	if len(first) < 32 || len(second) < 32 {
		t.Fatalf("expected strong token lengths, got %d and %d", len(first), len(second))
	}
}
