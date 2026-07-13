package service

import (
	"fmt"
	"net/http"
	"strings"
	"time"

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

func (s *Service) Search(query string, types []string, limit int, offset int, userID string) (*searchdto.Response, error) {
	startedAt := time.Now()
	keyword := strings.TrimSpace(query)
	normalizedLimit := limit
	if normalizedLimit <= 0 {
		normalizedLimit = 20
	} else if normalizedLimit > 50 {
		normalizedLimit = 50
	}
	normalizedOffset := offset
	if normalizedOffset < 0 {
		normalizedOffset = 0
	}
	if keyword == "" {
		return &searchdto.Response{
			Query:     "",
			Limit:     normalizedLimit,
			ElapsedMs: 0,
			Groups:    []searchdto.Group{},
		}, nil
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
		batch, err := s.indexer.Search(itemType, keyword, normalizedLimit, normalizedOffset, userID)
		if err != nil {
			return nil, err
		}
		if batch == nil {
			batch = &SearchBatch{}
		}
		var nextOffset *int
		if batch.TotalCount > normalizedOffset+len(batch.Results) {
			value := normalizedOffset + len(batch.Results)
			nextOffset = &value
		}
		total += batch.TotalCount
		groups = append(groups, searchdto.Group{
			Type:          itemType,
			Count:         batch.TotalCount,
			ReturnedCount: len(batch.Results),
			NextOffset:    nextOffset,
			Results:       batch.Results,
		})
	}

	return &searchdto.Response{
		Query:     keyword,
		Limit:     normalizedLimit,
		ElapsedMs: time.Since(startedAt).Milliseconds(),
		Total:     total,
		Groups:    groups,
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
