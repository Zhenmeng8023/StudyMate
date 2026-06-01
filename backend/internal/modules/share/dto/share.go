package dto

type CreateLinkRequest struct {
	TargetType string `json:"targetType" binding:"required"`
	TargetID   string `json:"targetId" binding:"required"`
	Mode       string `json:"mode" binding:"required"`
	ExpiresAt  string `json:"expiresAt"`
}

type LinkPayload struct {
	ID          string `json:"id"`
	OwnerUserID string `json:"ownerUserId"`
	TargetType  string `json:"targetType"`
	TargetID    string `json:"targetId"`
	Mode        string `json:"mode"`
	Token       string `json:"token"`
	Status      string `json:"status"`
	URL         string `json:"url"`
	ExpiresAt   string `json:"expiresAt,omitempty"`
	CreatedAt   string `json:"createdAt"`
	RevokedAt   string `json:"revokedAt,omitempty"`
}

type PublicResolvePayload struct {
	Token      string         `json:"token"`
	Mode       string         `json:"mode"`
	TargetType string         `json:"targetType"`
	TargetID   string         `json:"targetId"`
	Title      string         `json:"title"`
	Summary    string         `json:"summary"`
	URL        string         `json:"url"`
	ReadOnly   bool           `json:"readOnly"`
	Metadata   map[string]any `json:"metadata"`
}
