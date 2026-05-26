package dto

type FileResponse struct {
	ID           string `json:"id"`
	OwnerUserID  string `json:"ownerUserId"`
	OriginalName string `json:"originalName"`
	MimeType     string `json:"mimeType"`
	Size         int64  `json:"size"`
	Path         string `json:"path"`
	CreatedAt    string `json:"createdAt"`
}
