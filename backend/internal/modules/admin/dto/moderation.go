package dto

type ModerationItem struct {
	ID         string `json:"id"`
	Type       string `json:"type"`
	Title      string `json:"title"`
	Summary    string `json:"summary"`
	AuthorName string `json:"authorName"`
	Status     string `json:"status"`
	CreatedAt  string `json:"createdAt"`
	UpdatedAt  string `json:"updatedAt"`
}

type ModerationActionRequest struct {
	Reason string `json:"reason"`
}
