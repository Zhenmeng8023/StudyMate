package repository

import (
	"errors"
	"time"

	"gorm.io/gorm"
	admindto "studymate/backend/internal/modules/admin/dto"
	communitydto "studymate/backend/internal/modules/community/dto"
	communitymodel "studymate/backend/internal/modules/community/model"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreatePost(post *communitymodel.Post) error {
	return r.db.Create(post).Error
}

func (r *Repository) CreateComment(comment *communitymodel.Comment) error {
	return r.db.Create(comment).Error
}

func (r *Repository) FindPostByID(postID string) (*communitymodel.Post, error) {
	var post communitymodel.Post
	if err := r.db.First(&post, "id = ?", postID).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *Repository) SavePost(post *communitymodel.Post) error {
	return r.db.Save(post).Error
}

func (r *Repository) ListApprovedPosts() ([]communitydto.PostSummary, error) {
	type postRow struct {
		communitydto.PostSummary
	}

	var rows []postRow
	err := r.db.Table("posts").
		Select(`
			posts.id,
			posts.title,
			posts.body,
			posts.kind,
			posts.status,
			posts.author_user_id,
			users.display_name as author_name,
			posts.created_at,
			posts.updated_at
		`).
		Joins("left join users on users.id = posts.author_user_id").
		Where("posts.status = ?", "approved").
		Order("posts.created_at desc").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	summaries := make([]communitydto.PostSummary, 0, len(rows))
	for _, row := range rows {
		summary := row.PostSummary
		summary.LikesCount = r.countLikes(summary.ID)
		summary.FavoritesCount = r.countFavorites(summary.ID)
		summary.CommentsCount = r.countComments(summary.ID)
		summaries = append(summaries, summary)
	}

	return summaries, nil
}

func (r *Repository) BuildPostDetail(post *communitymodel.Post) (*communitydto.PostDetail, error) {
	type postRow struct {
		ID           string    `gorm:"column:id"`
		Title        string    `gorm:"column:title"`
		Body         string    `gorm:"column:body"`
		Kind         string    `gorm:"column:kind"`
		Status       string    `gorm:"column:status"`
		AuthorUserID string    `gorm:"column:author_user_id"`
		AuthorName   string    `gorm:"column:author_name"`
		CreatedAt    time.Time `gorm:"column:created_at"`
		UpdatedAt    time.Time `gorm:"column:updated_at"`
	}

	var row postRow
	if err := r.db.Table("posts").
		Select(`
			posts.id,
			posts.title,
			posts.body,
			posts.kind,
			posts.status,
			posts.author_user_id,
			users.display_name as author_name,
			posts.created_at,
			posts.updated_at
		`).
		Joins("left join users on users.id = posts.author_user_id").
		Where("posts.id = ?", post.ID).
		First(&row).Error; err != nil {
		return nil, err
	}

	comments, err := r.ListApprovedComments(post.ID)
	if err != nil {
		return nil, err
	}

	return &communitydto.PostDetail{
		PostSummary: communitydto.PostSummary{
			ID:             row.ID,
			Title:          row.Title,
			Body:           row.Body,
			Kind:           row.Kind,
			Status:         row.Status,
			AuthorUserID:   row.AuthorUserID,
			AuthorName:     row.AuthorName,
			LikesCount:     r.countLikes(row.ID),
			FavoritesCount: r.countFavorites(row.ID),
			CommentsCount:  int64(len(comments)),
			CreatedAt:      row.CreatedAt.Format(time.RFC3339),
			UpdatedAt:      row.UpdatedAt.Format(time.RFC3339),
		},
		Comments: comments,
	}, nil
}

func (r *Repository) ListApprovedComments(postID string) ([]communitydto.CommentResponse, error) {
	type commentRow struct {
		ID           string    `gorm:"column:id"`
		PostID       string    `gorm:"column:post_id"`
		AuthorUserID string    `gorm:"column:author_user_id"`
		AuthorName   string    `gorm:"column:author_name"`
		Body         string    `gorm:"column:body"`
		Status       string    `gorm:"column:status"`
		CreatedAt    time.Time `gorm:"column:created_at"`
	}

	var rows []commentRow
	err := r.db.Table("comments").
		Select(`
			comments.id,
			comments.post_id,
			comments.author_user_id,
			users.display_name as author_name,
			comments.body,
			comments.status,
			comments.created_at
		`).
		Joins("left join users on users.id = comments.author_user_id").
		Where("comments.post_id = ? AND comments.status = ?", postID, "approved").
		Order("comments.created_at asc").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	comments := make([]communitydto.CommentResponse, 0, len(rows))
	for _, row := range rows {
		comments = append(comments, communitydto.CommentResponse{
			ID:           row.ID,
			PostID:       row.PostID,
			AuthorUserID: row.AuthorUserID,
			AuthorName:   row.AuthorName,
			Body:         row.Body,
			Status:       row.Status,
			CreatedAt:    row.CreatedAt.Format(time.RFC3339),
		})
	}
	return comments, nil
}

func (r *Repository) ToggleLike(postID string, userID string) (bool, int64, error) {
	var existing communitymodel.PostLike
	err := r.db.First(&existing, "post_id = ? AND user_id = ?", postID, userID).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, 0, err
	}

	active := false
	if errors.Is(err, gorm.ErrRecordNotFound) {
		if err := r.db.Create(&communitymodel.PostLike{PostID: postID, UserID: userID}).Error; err != nil {
			return false, 0, err
		}
		active = true
	} else {
		if err := r.db.Delete(&existing).Error; err != nil {
			return false, 0, err
		}
	}

	return active, r.countLikes(postID), nil
}

func (r *Repository) ToggleFavorite(postID string, userID string) (bool, int64, error) {
	var existing communitymodel.PostFavorite
	err := r.db.First(&existing, "post_id = ? AND user_id = ?", postID, userID).Error
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return false, 0, err
	}

	active := false
	if errors.Is(err, gorm.ErrRecordNotFound) {
		if err := r.db.Create(&communitymodel.PostFavorite{PostID: postID, UserID: userID}).Error; err != nil {
			return false, 0, err
		}
		active = true
	} else {
		if err := r.db.Delete(&existing).Error; err != nil {
			return false, 0, err
		}
	}

	return active, r.countFavorites(postID), nil
}

func (r *Repository) ListPostsForModeration() ([]communitymodel.Post, error) {
	var posts []communitymodel.Post
	err := r.db.Where("status <> ?", "approved").Order("created_at desc").Find(&posts).Error
	return posts, err
}

func (r *Repository) CountAllPosts() (int64, error) {
	var count int64
	err := r.db.Model(&communitymodel.Post{}).Count(&count).Error
	return count, err
}

func (r *Repository) CountPendingPosts() (int64, error) {
	var count int64
	err := r.db.Model(&communitymodel.Post{}).Where("status <> ?", "approved").Count(&count).Error
	return count, err
}

func (r *Repository) ListPostsForModerationItems() ([]admindto.ModerationItem, error) {
	type row struct {
		ID         string    `gorm:"column:id"`
		Title      string    `gorm:"column:title"`
		Summary    string    `gorm:"column:summary"`
		AuthorName string    `gorm:"column:author_name"`
		Status     string    `gorm:"column:status"`
		CreatedAt  time.Time `gorm:"column:created_at"`
		UpdatedAt  time.Time `gorm:"column:updated_at"`
	}

	var rows []row
	err := r.db.Table("posts").
		Select(`
			posts.id,
			posts.title,
			posts.body as summary,
			users.display_name as author_name,
			posts.status,
			posts.created_at,
			posts.updated_at
		`).
		Joins("left join users on users.id = posts.author_user_id").
		Where("posts.status <> ?", "approved").
		Order("posts.created_at desc").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	items := make([]admindto.ModerationItem, 0, len(rows))
	for _, row := range rows {
		items = append(items, admindto.ModerationItem{
			ID:         row.ID,
			Type:       "post",
			Title:      row.Title,
			Summary:    row.Summary,
			AuthorName: row.AuthorName,
			Status:     row.Status,
			CreatedAt:  row.CreatedAt.Format(time.RFC3339),
			UpdatedAt:  row.UpdatedAt.Format(time.RFC3339),
		})
	}

	return items, nil
}

func (r *Repository) countLikes(postID string) int64 {
	var count int64
	_ = r.db.Model(&communitymodel.PostLike{}).Where("post_id = ?", postID).Count(&count).Error
	return count
}

func (r *Repository) countFavorites(postID string) int64 {
	var count int64
	_ = r.db.Model(&communitymodel.PostFavorite{}).Where("post_id = ?", postID).Count(&count).Error
	return count
}

func (r *Repository) countComments(postID string) int64 {
	var count int64
	_ = r.db.Model(&communitymodel.Comment{}).Where("post_id = ? AND status = ?", postID, "approved").Count(&count).Error
	return count
}
