package service

import (
	"fmt"
	"sort"
	"strings"

	searchdto "studymate/backend/internal/modules/search/dto"
	"studymate/backend/internal/pkg/apperrors"

	"gorm.io/gorm"
)

type SearchIndexer interface {
	Search(itemType string, keyword string, limit int, offset int, userID string) (*SearchBatch, error)
}

type SearchBatch struct {
	TotalCount int
	Results    []searchdto.Result
}

type mysqlFallbackIndexer struct {
	db *gorm.DB
}

type searchRow struct {
	ID      string
	Title   string
	Summary string
	URL     string
	Source  string
}

type searchQuerySpec struct {
	table     string
	selectSQL string
	whereSQL  string
	whereArgs []any
	orderSQL  string
	limit     int
}

func NewMySQLFallbackIndexer(db *gorm.DB) SearchIndexer {
	if db == nil {
		return nil
	}
	return &mysqlFallbackIndexer{db: db}
}

func (i *mysqlFallbackIndexer) Search(itemType string, keyword string, limit int, offset int, userID string) (*SearchBatch, error) {
	query, shortCircuit, err := buildSearchQuery(i.db, itemType, keyword, limit, offset, userID)
	if err != nil {
		return nil, err
	}
	if shortCircuit {
		return &SearchBatch{}, nil
	}

	totalCount, err := countSearchMatches(i.db, itemType, keyword, limit, offset, userID)
	if err != nil {
		return nil, err
	}

	var rows []searchRow
	if err := query.Scan(&rows).Error; err != nil {
		return nil, apperrors.Internal("鎼滅储澶辫触")
	}

	rows = rankAndLimitSearchRows(rows, keyword, offset, limit)
	results := make([]searchdto.Result, 0, len(rows))
	for _, row := range rows {
		results = append(results, searchdto.Result{
			Type:    itemType,
			ID:      row.ID,
			Title:   row.Title,
			Summary: normalizeSearchSummary(row.Summary),
			URL:     buildSearchResultURL(itemType, row.ID),
			Source:  buildSearchResultSource(itemType),
		})
	}
	return &SearchBatch{
		TotalCount: totalCount,
		Results:    results,
	}, nil
}

func buildSearchQuery(db *gorm.DB, itemType string, keyword string, limit int, offset int, userID string) (*gorm.DB, bool, error) {
	if db == nil {
		return nil, false, apperrors.Internal("鎼滅储绱㈠紩鏈厤缃?")
	}

	spec, shortCircuit, err := buildSearchQuerySpec(itemType, keyword, limit, offset, userID)
	if err != nil || shortCircuit {
		return nil, shortCircuit, err
	}

	return db.Table(spec.table).
		Select(spec.selectSQL).
		Where(spec.whereSQL, spec.whereArgs...).
		Order(spec.orderSQL).
		Limit(spec.limit), false, nil
}

func countSearchMatches(db *gorm.DB, itemType string, keyword string, limit int, offset int, userID string) (int, error) {
	if db == nil {
		return 0, apperrors.Internal("閹兼粎鍌ㄧ槐銏犵穿閺堫亪鍘ょ純?")
	}

	spec, shortCircuit, err := buildSearchQuerySpec(itemType, keyword, limit, offset, userID)
	if err != nil || shortCircuit {
		return 0, err
	}

	var totalCount int64
	if err := db.Table(spec.table).
		Where(spec.whereSQL, spec.whereArgs...).
		Count(&totalCount).Error; err != nil {
		return 0, apperrors.Internal("閹兼粎鍌ㄦ径杈Е")
	}

	return int(totalCount), nil
}

func buildSearchQuerySpec(itemType string, keyword string, limit int, offset int, userID string) (*searchQuerySpec, bool, error) {
	like := "%" + keyword + "%"
	candidateLimit := (offset + limit) * 4
	if candidateLimit < offset+limit {
		candidateLimit = offset + limit
	}
	if candidateLimit > 200 {
		candidateLimit = 200
	}

	switch itemType {
	case "material":
		return &searchQuerySpec{
			table:     "materials",
			selectSQL: "id, title, description AS summary",
			whereSQL:  "status = ? AND (title LIKE ? OR description LIKE ? OR category LIKE ? OR tags LIKE ?)",
			whereArgs: []any{"approved", like, like, like, like},
			orderSQL:  "updated_at DESC",
			limit:     candidateLimit,
		}, false, nil
	case "post":
		return &searchQuerySpec{
			table:     "posts",
			selectSQL: "id, title, body AS summary",
			whereSQL:  "status = ? AND visibility = ? AND (title LIKE ? OR body LIKE ?)",
			whereArgs: []any{"approved", "public", like, like},
			orderSQL:  "updated_at DESC",
			limit:     candidateLimit,
		}, false, nil
	case "note":
		if userID == "" {
			return nil, true, nil
		}
		return &searchQuerySpec{
			table:     "notes",
			selectSQL: "id, title, summary",
			whereSQL:  "owner_user_id = ? AND (title LIKE ? OR summary LIKE ? OR content LIKE ? OR folder_name LIKE ?)",
			whereArgs: []any{userID, like, like, like, like},
			orderSQL:  "updated_at DESC",
			limit:     candidateLimit,
		}, false, nil
	case "graph":
		if userID == "" {
			return nil, true, nil
		}
		return &searchQuerySpec{
			table:     "graphs",
			selectSQL: "id, title, description AS summary",
			whereSQL:  "status = ? AND (owner_user_id = ? OR visibility = ?) AND (title LIKE ? OR description LIKE ?)",
			whereArgs: []any{"active", userID, "public", like, like},
			orderSQL:  "updated_at DESC",
			limit:     candidateLimit,
		}, false, nil
	case "card":
		if userID == "" {
			return nil, true, nil
		}
		return &searchQuerySpec{
			table:     "cards",
			selectSQL: "id, front AS title, back AS summary",
			whereSQL:  "owner_user_id = ? AND status = ? AND (front LIKE ? OR back LIKE ?)",
			whereArgs: []any{userID, "active", like, like},
			orderSQL:  "updated_at DESC",
			limit:     candidateLimit,
		}, false, nil
	default:
		return nil, false, apperrors.New(400, "invalid_search_type", fmt.Sprintf("unsupported search type: %s", itemType))
	}
}

func rankAndLimitSearchRows(rows []searchRow, keyword string, offset int, limit int) []searchRow {
	ranked := append([]searchRow(nil), rows...)
	sort.SliceStable(ranked, func(left int, right int) bool {
		return searchRowMatchRank(ranked[left], keyword) < searchRowMatchRank(ranked[right], keyword)
	})
	if offset < 0 {
		offset = 0
	}
	if offset >= len(ranked) {
		return []searchRow{}
	}
	if limit <= 0 {
		return ranked[offset:]
	}
	end := offset + limit
	if end > len(ranked) {
		end = len(ranked)
	}
	return ranked[offset:end]
}

func searchRowMatchRank(row searchRow, keyword string) int {
	normalizedKeyword := strings.ToLower(strings.TrimSpace(keyword))
	if normalizedKeyword == "" {
		return 2
	}
	title := strings.ToLower(strings.TrimSpace(row.Title))
	summary := strings.ToLower(strings.TrimSpace(row.Summary))
	switch {
	case strings.Contains(title, normalizedKeyword):
		return 0
	case strings.Contains(summary, normalizedKeyword):
		return 1
	default:
		return 2
	}
}

func normalizeSearchSummary(summary string) string {
	normalized := strings.Join(strings.Fields(summary), " ")
	if normalized == "" {
		return ""
	}
	runes := []rune(normalized)
	if len(runes) <= 160 {
		return normalized
	}
	return string(runes[:157]) + "..."
}

func buildSearchResultURL(itemType string, id string) string {
	switch itemType {
	case "material":
		return "/materials?selected=" + id
	case "post":
		return "/community?selected=" + id
	case "note":
		return "/notes?selected=" + id
	case "graph":
		return "/graph?graphId=" + id
	case "card":
		return "/review"
	default:
		return ""
	}
}

func buildSearchResultSource(itemType string) string {
	if itemType == "post" {
		return "community"
	}
	return itemType
}
