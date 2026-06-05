package service

import (
	"errors"
	"testing"

	searchdto "studymate/backend/internal/modules/search/dto"
)

type fakeIndexer struct {
	calls []struct {
		itemType string
		keyword  string
		limit    int
		userID   string
	}
	results map[string][]searchdto.Result
	err     error
}

func (f *fakeIndexer) Search(itemType string, keyword string, limit int, userID string) ([]searchdto.Result, error) {
	f.calls = append(f.calls, struct {
		itemType string
		keyword  string
		limit    int
		userID   string
	}{
		itemType: itemType,
		keyword:  keyword,
		limit:    limit,
		userID:   userID,
	})
	if f.err != nil {
		return nil, f.err
	}
	return f.results[itemType], nil
}

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

func TestSearchUsesIndexerAcrossRequestedGroups(t *testing.T) {
	indexer := &fakeIndexer{
		results: map[string][]searchdto.Result{
			"note": {{
				Type:    "note",
				ID:      "note-1",
				Title:   "Graph note",
				Summary: "summary",
				URL:     "/notes?selected=note-1",
				Source:  "note",
			}},
			"graph": {{
				Type:    "graph",
				ID:      "graph-1",
				Title:   "Knowledge graph",
				Summary: "summary",
				URL:     "/graph?graphId=graph-1",
				Source:  "graph",
			}},
		},
	}

	payload, err := NewServiceWithIndexer(indexer).Search("  graph  ", []string{"note", "graph"}, 0, "user-7")
	if err != nil {
		t.Fatalf("expected grouped search to succeed, got error %v", err)
	}

	if payload.Query != "graph" || payload.Total != 2 || len(payload.Groups) != 2 {
		t.Fatalf("unexpected grouped search payload: %#v", payload)
	}

	if len(indexer.calls) != 2 {
		t.Fatalf("expected indexer to be called twice, got %#v", indexer.calls)
	}

	if indexer.calls[0].itemType != "note" || indexer.calls[0].limit != 20 || indexer.calls[0].userID != "user-7" {
		t.Fatalf("unexpected first indexer call: %#v", indexer.calls[0])
	}

	if indexer.calls[1].itemType != "graph" || indexer.calls[1].keyword != "graph" {
		t.Fatalf("unexpected second indexer call: %#v", indexer.calls[1])
	}
}

func TestSearchReturnsIndexerErrors(t *testing.T) {
	expected := errors.New("boom")

	_, err := NewServiceWithIndexer(&fakeIndexer{err: expected}).Search("graph", []string{"graph"}, 10, "user-1")
	if !errors.Is(err, expected) {
		t.Fatalf("expected indexer error to bubble up, got %v", err)
	}
}
