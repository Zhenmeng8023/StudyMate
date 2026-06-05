package service

import (
	"strings"

	searchdto "studymate/backend/internal/modules/search/dto"
	"studymate/backend/internal/pkg/apperrors"

	"gorm.io/gorm"
)

type Service struct {
	indexer SearchIndexer
}

func NewService(db *gorm.DB) *Service {
	return NewServiceWithIndexer(NewMySQLFallbackIndexer(db))
}

func NewServiceWithIndexer(indexer SearchIndexer) *Service {
	return &Service{indexer: indexer}
}

func (s *Service) Search(query string, types []string, limit int, userID string) (*searchdto.Response, error) {
	keyword := strings.TrimSpace(query)
	if keyword == "" {
		return &searchdto.Response{Query: "", Groups: []searchdto.Group{}}, nil
	}
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	if s.indexer == nil {
		return nil, apperrors.Internal("鎼滅储绱㈠紩鏈厤缃?")
	}

	allowed := normalizeTypes(types)
	groups := make([]searchdto.Group, 0, len(allowed))
	total := 0
	for _, itemType := range allowed {
		results, err := s.indexer.Search(itemType, keyword, limit, userID)
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
