package dto

type CreatePostRequest struct {
	Title string `json:"title" binding:"required,min=4,max=200"`
	Body  string `json:"body" binding:"required,min=10"`
	Kind  string `json:"kind" binding:"required,oneof=text article material"`
}

type CreateCommentRequest struct {
	Body string `json:"body" binding:"required,min=2,max=1000"`
}

type PostSummary struct {
	ID             string `json:"id"`
	Title          string `json:"title"`
	Body           string `json:"body"`
	Kind           string `json:"kind"`
	Status         string `json:"status"`
	AuthorUserID   string `json:"authorUserId"`
	AuthorName     string `json:"authorName"`
	LikesCount     int64  `json:"likesCount"`
	FavoritesCount int64  `json:"favoritesCount"`
	CommentsCount  int64  `json:"commentsCount"`
	CreatedAt      string `json:"createdAt"`
	UpdatedAt      string `json:"updatedAt"`
}

type CommentResponse struct {
	ID           string `json:"id"`
	PostID       string `json:"postId"`
	AuthorUserID string `json:"authorUserId"`
	AuthorName   string `json:"authorName"`
	Body         string `json:"body"`
	Status       string `json:"status"`
	CreatedAt    string `json:"createdAt"`
}

type PostDetail struct {
	PostSummary
	Comments []CommentResponse `json:"comments"`
}

type ToggleResponse struct {
	Active bool  `json:"active"`
	Count  int64 `json:"count"`
}
