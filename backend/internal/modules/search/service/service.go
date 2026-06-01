package service

import (
	"fmt"
	"strings"

	searchdto "studymate/backend/internal/modules/search/dto"
	"studymate/backend/internal/pkg/apperrors"

	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

type row struct {
	ID      string
	Title   string
	Summary string
	URL     string
	Source  string
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) Search(query string, types []string, limit int, userID string) (*searchdto.Response, error) {
	keyword := strings.TrimSpace(query)
	if keyword == "" {
		return &searchdto.Response{Query: "", Groups: []searchdto.Group{}}, nil
	}
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	allowed := normalizeTypes(types)
	groups := make([]searchdto.Group, 0, len(allowed))
	total := 0
	for _, itemType := range allowed {
		results, err := s.searchType(itemType, keyword, limit, userID)
		if err != nil {
			return nil, err
		}
		total += len(results)
		groups = append(groups, searchdto.Group{
			Type:    itemType,
			Count:   len(results),
			Results: results,
		})
	}

	return &searchdto.Response{
		Query:  keyword,
		Total:  total,
		Groups: groups,
	}, nil
}

func (s *Service) searchType(itemType string, keyword string, limit int, userID string) ([]searchdto.Result, error) {
	like := "%" + keyword + "%"
	var rows []row
	var err error

	switch itemType {
	case "material":
		err = s.db.Table("materials").
			Select("id, title, description AS summary, CONCAT('/materials?selected=', id) AS url, 'material' AS source").
			Where("status = ? AND (title LIKE ? OR description LIKE ? OR category LIKE ? OR tags LIKE ?)", "approved", like, like, like, like).
			Order("updated_at DESC").
			Limit(limit).
			Scan(&rows).Error
	case "post":
		err = s.db.Table("posts").
			Select("id, title, body AS summary, CONCAT('/community?selected=', id) AS url, 'community' AS source").
			Where("status = ? AND visibility = ? AND (title LIKE ? OR body LIKE ?)", "approved", "public", like, like).
			Order("updated_at DESC").
			Limit(limit).
			Scan(&rows).Error
	case "note":
		if userID == "" {
			return []searchdto.Result{}, nil
		}
		err = s.db.Table("notes").
			Select("id, title, summary, CONCAT('/notes?selected=', id) AS url, 'note' AS source").
			Where("owner_user_id = ? AND (title LIKE ? OR summary LIKE ? OR content LIKE ? OR folder_name LIKE ?)", userID, like, like, like, like).
			Order("updated_at DESC").
			Limit(limit).
			Scan(&rows).Error
	case "graph":
		if userID == "" {
			return []searchdto.Result{}, nil
		}
		err = s.db.Table("graphs").
			Select("id, title, description AS summary, CONCAT('/graph?graphId=', id) AS url, 'graph' AS source").
			Where("(owner_user_id = ? OR visibility = ?) AND (title LIKE ? OR description LIKE ?)", userID, "public", like, like).
			Order("updated_at DESC").
			Limit(limit).
			Scan(&rows).Error
	case "card":
		if userID == "" {
			return []searchdto.Result{}, nil
		}
		err = s.db.Table("cards").
			Select("id, front AS title, back AS summary, '/review' AS url, 'card' AS source").
			Where("owner_user_id = ? AND status = ? AND (front LIKE ? OR back LIKE ?)", userID, "active", like, like).
			Order("updated_at DESC").
			Limit(limit).
			Scan(&rows).Error
	default:
		return nil, apperrors.New(400, "invalid_search_type", fmt.Sprintf("unsupported search type: %s", itemType))
	}
	if err != nil {
		return nil, apperrors.Internal("搜索失败")
	}

	results := make([]searchdto.Result, 0, len(rows))
	for _, row := range rows {
		results = append(results, searchdto.Result{
			Type:    itemType,
			ID:      row.ID,
			Title:   row.Title,
			Summary: row.Summary,
			URL:     row.URL,
			Source:  row.Source,
		})
	}
	return results, nil
}

func normalizeTypes(raw []string) []string {
	if len(raw) == 0 {
		return []string{"material", "post", "note", "graph", "card"}
	}

	seen := map[string]bool{}
	result := []string{}
	for _, value := range raw {
		item := strings.TrimSpace(strings.ToLower(value))
		if item == "" || seen[item] {
			continue
		}
		seen[item] = true
		result = append(result, item)
	}
	return result
}
