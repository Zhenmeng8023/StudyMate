package service

import (
	"fmt"

	searchdto "studymate/backend/internal/modules/search/dto"
	"studymate/backend/internal/pkg/apperrors"

	"gorm.io/gorm"
)

type SearchIndexer interface {
	Search(itemType string, keyword string, limit int, userID string) ([]searchdto.Result, error)
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

func NewMySQLFallbackIndexer(db *gorm.DB) SearchIndexer {
	if db == nil {
		return nil
	}
	return &mysqlFallbackIndexer{db: db}
}

func (i *mysqlFallbackIndexer) Search(itemType string, keyword string, limit int, userID string) ([]searchdto.Result, error) {
	like := "%" + keyword + "%"
	var rows []searchRow
	var err error

	switch itemType {
	case "material":
		err = i.db.Table("materials").
			Select("id, title, description AS summary, CONCAT('/materials?selected=', id) AS url, 'material' AS source").
			Where("status = ? AND (title LIKE ? OR description LIKE ? OR category LIKE ? OR tags LIKE ?)", "approved", like, like, like, like).
			Order("updated_at DESC").
			Limit(limit).
			Scan(&rows).Error
	case "post":
		err = i.db.Table("posts").
			Select("id, title, body AS summary, CONCAT('/community?selected=', id) AS url, 'community' AS source").
			Where("status = ? AND visibility = ? AND (title LIKE ? OR body LIKE ?)", "approved", "public", like, like).
			Order("updated_at DESC").
			Limit(limit).
			Scan(&rows).Error
	case "note":
		if userID == "" {
			return []searchdto.Result{}, nil
		}
		err = i.db.Table("notes").
			Select("id, title, summary, CONCAT('/notes?selected=', id) AS url, 'note' AS source").
			Where("owner_user_id = ? AND (title LIKE ? OR summary LIKE ? OR content LIKE ? OR folder_name LIKE ?)", userID, like, like, like, like).
			Order("updated_at DESC").
			Limit(limit).
			Scan(&rows).Error
	case "graph":
		if userID == "" {
			return []searchdto.Result{}, nil
		}
		err = i.db.Table("graphs").
			Select("id, title, description AS summary, CONCAT('/graph?graphId=', id) AS url, 'graph' AS source").
			Where("(owner_user_id = ? OR visibility = ?) AND (title LIKE ? OR description LIKE ?)", userID, "public", like, like).
			Order("updated_at DESC").
			Limit(limit).
			Scan(&rows).Error
	case "card":
		if userID == "" {
			return []searchdto.Result{}, nil
		}
		err = i.db.Table("cards").
			Select("id, front AS title, back AS summary, '/review' AS url, 'card' AS source").
			Where("owner_user_id = ? AND status = ? AND (front LIKE ? OR back LIKE ?)", userID, "active", like, like).
			Order("updated_at DESC").
			Limit(limit).
			Scan(&rows).Error
	default:
		return nil, apperrors.New(400, "invalid_search_type", fmt.Sprintf("unsupported search type: %s", itemType))
	}
	if err != nil {
		return nil, apperrors.Internal("鎼滅储澶辫触")
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
