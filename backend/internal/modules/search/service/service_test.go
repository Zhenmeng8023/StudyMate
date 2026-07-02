package service

import (
	"errors"
	"testing"

	searchdto "studymate/backend/internal/modules/search/dto"
	"studymate/backend/internal/pkg/apperrors"
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
	defaults, err := normalizeTypes(nil)
	if err != nil {
		t.Fatalf("expected nil types to use defaults, got error %v", err)
	}
	if len(defaults) != 5 || defaults[0] != "material" || defaults[4] != "card" {
		t.Fatalf("unexpected default search types: %#v", defaults)
	}

	blankDefaults, err := normalizeTypes([]string{""})
	if err != nil {
		t.Fatalf("expected blank types to use defaults, got error %v", err)
	}
	if len(blankDefaults) != len(defaults) {
		t.Fatalf("expected blank types to match defaults, got %#v", blankDefaults)
	}

	got, err := normalizeTypes([]string{" note ", "graph", "note", "", "CARD"})
	if err != nil {
		t.Fatalf("expected valid types to normalize, got error %v", err)
	}
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

func TestNormalizeTypesRejectsUnsupportedValues(t *testing.T) {
	_, err := normalizeTypes([]string{"note", "bad"})
	appErr, ok := err.(*apperrors.Error)
	if !ok {
		t.Fatalf("expected AppError, got %T", err)
	}
	if appErr.Code != "invalid_search_type" {
		t.Fatalf("expected invalid_search_type, got %#v", appErr)
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

func TestSearchClampsLimitToMaximumPageSize(t *testing.T) {
	indexer := &fakeIndexer{results: map[string][]searchdto.Result{}}

	_, err := NewServiceWithIndexer(indexer).Search("graph", []string{"graph"}, 999, "user-7")
	if err != nil {
		t.Fatalf("expected oversized limit to be clamped, got error %v", err)
	}
	if len(indexer.calls) != 1 {
		t.Fatalf("expected one indexer call, got %#v", indexer.calls)
	}
	if indexer.calls[0].limit != 50 {
		t.Fatalf("expected limit to clamp to 50, got %#v", indexer.calls[0])
	}
}

func TestSearchDefaultsToAllGroupsWhenTypesFilterMissing(t *testing.T) {
	indexer := &fakeIndexer{results: map[string][]searchdto.Result{}}

	payload, err := NewServiceWithIndexer(indexer).Search("graph", []string{""}, 8, "user-7")
	if err != nil {
		t.Fatalf("expected default grouped search to succeed, got error %v", err)
	}

	if payload.Total != 0 || len(payload.Groups) != 5 {
		t.Fatalf("expected five default groups, got %#v", payload)
	}
	if len(indexer.calls) != 5 {
		t.Fatalf("expected five default indexer calls, got %#v", indexer.calls)
	}
	if indexer.calls[0].itemType != "material" || indexer.calls[4].itemType != "card" {
		t.Fatalf("expected default type order, got %#v", indexer.calls)
	}
}

func TestSearchRejectsUnsupportedTypesBeforeIndexer(t *testing.T) {
	indexer := &fakeIndexer{}

	_, err := NewServiceWithIndexer(indexer).Search("graph", []string{"note", "bad"}, 8, "user-7")
	appErr, ok := err.(*apperrors.Error)
	if !ok {
		t.Fatalf("expected AppError, got %T", err)
	}
	if appErr.Code != "invalid_search_type" {
		t.Fatalf("expected invalid_search_type, got %#v", appErr)
	}
	if len(indexer.calls) != 0 {
		t.Fatalf("expected invalid types to fail before hitting indexer, got %#v", indexer.calls)
	}
}

func TestSearchReturnsIndexerErrors(t *testing.T) {
	expected := errors.New("boom")

	_, err := NewServiceWithIndexer(&fakeIndexer{err: expected}).Search("graph", []string{"graph"}, 10, "user-1")
	if !errors.Is(err, expected) {
		t.Fatalf("expected indexer error to bubble up, got %v", err)
	}
}
