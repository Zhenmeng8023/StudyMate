package service

import (
	"strings"
	"testing"
	"unicode/utf8"
)

func TestRankAndLimitSearchRowsPrioritizesTitleMatches(t *testing.T) {
	rows := []searchRow{
		{
			ID:      "post-1",
			Title:   "学习周报",
			Summary: "这篇正文里提到了图谱搜索",
			URL:     "/community?selected=post-1",
			Source:  "community",
		},
		{
			ID:      "note-1",
			Title:   "图谱笔记",
			Summary: "标题直接命中",
			URL:     "/notes?selected=note-1",
			Source:  "note",
		},
		{
			ID:      "graph-1",
			Title:   "图谱工作区",
			Summary: "另一个标题命中",
			URL:     "/graph?graphId=graph-1",
			Source:  "graph",
		},
	}

	ranked := rankAndLimitSearchRows(rows, " 图谱 ", 2)
	if len(ranked) != 2 {
		t.Fatalf("expected limit 2, got %#v", ranked)
	}
	if ranked[0].ID != "note-1" || ranked[1].ID != "graph-1" {
		t.Fatalf("expected title matches first in original order, got %#v", ranked)
	}
}

func TestNormalizeSearchSummaryCollapsesWhitespaceAndTruncates(t *testing.T) {
	raw := "  第一段\n\n第二段\t" + strings.Repeat("图谱", 120)
	got := normalizeSearchSummary(raw)

	if strings.Contains(got, "\n") || strings.Contains(got, "\t") {
		t.Fatalf("expected whitespace to be collapsed, got %q", got)
	}
	if utf8.RuneCountInString(got) > 160 {
		t.Fatalf("expected summary to be truncated to 160 chars or fewer, got length %d", utf8.RuneCountInString(got))
	}
	if !strings.HasSuffix(got, "...") {
		t.Fatalf("expected truncated summary to end with ellipsis, got %q", got)
	}
}

func TestBuildSearchQueryShortCircuitsRestrictedTypesWithoutUser(t *testing.T) {
	for _, itemType := range []string{"note", "graph", "card"} {
		spec, shortCircuit, err := buildSearchQuerySpec(itemType, "图谱", 20, "")
		if err != nil {
			t.Fatalf("expected %s to short circuit without error, got %v", itemType, err)
		}
		if !shortCircuit {
			t.Fatalf("expected %s to short circuit for anonymous user", itemType)
		}
		if spec != nil {
			t.Fatalf("expected %s to return no query spec when short circuited", itemType)
		}
	}
}

func TestBuildSearchQueryUsesPublicFiltersForMaterialsAndPosts(t *testing.T) {
	materialSpec := mustBuildSearchSpec(t, "material", "图谱", 20, "")
	if materialSpec.table != "materials" || !strings.Contains(materialSpec.whereSQL, "status = ?") {
		t.Fatalf("expected material search to filter by approved status, got %#v", materialSpec)
	}

	postSpec := mustBuildSearchSpec(t, "post", "图谱", 20, "")
	if !strings.Contains(postSpec.whereSQL, "visibility = ?") || !strings.Contains(postSpec.whereSQL, "status = ?") {
		t.Fatalf("expected post search to require public approved posts, got %#v", postSpec)
	}
}

func TestBuildSearchQueryScopesPrivateUserContent(t *testing.T) {
	noteSpec := mustBuildSearchSpec(t, "note", "图谱", 20, "user-1")
	if !strings.Contains(noteSpec.whereSQL, "owner_user_id = ?") {
		t.Fatalf("expected note search to stay within owner scope, got %#v", noteSpec)
	}

	graphSpec := mustBuildSearchSpec(t, "graph", "图谱", 20, "user-1")
	if !strings.Contains(graphSpec.whereSQL, "owner_user_id = ? OR visibility = ?") {
		t.Fatalf("expected graph search to allow owner or public visibility, got %#v", graphSpec)
	}
	if !strings.Contains(graphSpec.whereSQL, "status = ?") {
		t.Fatalf("expected graph search to filter active records, got %#v", graphSpec)
	}

	cardSpec := mustBuildSearchSpec(t, "card", "图谱", 20, "user-1")
	if !strings.Contains(cardSpec.whereSQL, "owner_user_id = ? AND status = ?") {
		t.Fatalf("expected card search to stay within owner active cards, got %#v", cardSpec)
	}
}

func mustBuildSearchSpec(t *testing.T, itemType string, keyword string, limit int, userID string) *searchQuerySpec {
	t.Helper()

	spec, shortCircuit, err := buildSearchQuerySpec(itemType, keyword, limit, userID)
	if err != nil {
		t.Fatalf("build search query spec: %v", err)
	}
	if shortCircuit || spec == nil {
		t.Fatalf("expected %s search to build a query spec", itemType)
	}
	return spec
}
