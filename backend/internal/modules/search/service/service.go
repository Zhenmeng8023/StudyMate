package service

import (
	"fmt"
	"net/http"
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
	if limit <= 0 {
		limit = 20
	} else if limit > 50 {
		limit = 50
	}
	if s.indexer == nil {
		return nil, apperrors.Internal("鎼滅储绱㈠紩鏈厤缃?")
	}

	allowed, err := normalizeTypes(types)
	if err != nil {
		return nil, err
	}
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

var defaultSearchTypes = []string{"material", "post", "note", "graph", "card"}

func normalizeTypes(raw []string) ([]string, error) {
	if len(raw) == 0 {
		return append([]string{}, defaultSearchTypes...), nil
	}

	allowed := map[string]bool{}
	for _, itemType := range defaultSearchTypes {
		allowed[itemType] = true
	}
	seen := map[string]bool{}
	result := []string{}
	for _, value := range raw {
		item := strings.TrimSpace(strings.ToLower(value))
		if item == "" {
			continue
		}
		if !allowed[item] {
			return nil, apperrors.New(http.StatusBadRequest, "invalid_search_type", fmt.Sprintf("unsupported search type: %s", item))
		}
		if seen[item] {
			continue
		}
		seen[item] = true
		result = append(result, item)
	}
	if len(result) == 0 {
		return append([]string{}, defaultSearchTypes...), nil
	}
	return result, nil
}
