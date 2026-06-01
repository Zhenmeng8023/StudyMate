package service

import "testing"

func TestNormalizeTypesDeduplicatesAndDefaults(t *testing.T) {
	defaults := normalizeTypes(nil)
	if len(defaults) != 5 || defaults[0] != "material" || defaults[4] != "card" {
		t.Fatalf("unexpected default search types: %#v", defaults)
	}

	got := normalizeTypes([]string{" note ", "graph", "note", "", "CARD"})
	want := []string{"note", "graph", "card"}
	if len(got) != len(want) {
		t.Fatalf("expected %d types, got %#v", len(want), got)
	}
	for index := range want {
		if got[index] != want[index] {
			t.Fatalf("expected %#v, got %#v", want, got)
		}
	}
}

func TestSearchReturnsEmptyPayloadForBlankQuery(t *testing.T) {
	payload, err := NewService(nil).Search("  ", []string{"note"}, 20, "user-1")
	if err != nil {
		t.Fatalf("expected blank query to skip database, got error %v", err)
	}
	if payload.Query != "" || payload.Total != 0 || len(payload.Groups) != 0 {
		t.Fatalf("unexpected empty search payload: %#v", payload)
	}
}
