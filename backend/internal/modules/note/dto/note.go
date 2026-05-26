package dto

type CreateNoteRequest struct {
	Title      string   `json:"title" binding:"required,min=2,max=200"`
	Summary    string   `json:"summary" binding:"max=500"`
	Content    string   `json:"content" binding:"required"`
	MaterialID string   `json:"materialId"`
	FolderName string   `json:"folderName" binding:"max=120"`
	Tags       []string `json:"tags"`
}

type UpdateNoteRequest struct {
	Title      string   `json:"title" binding:"required,min=2,max=200"`
	Summary    string   `json:"summary" binding:"max=500"`
	Content    string   `json:"content" binding:"required"`
	FolderName string   `json:"folderName" binding:"max=120"`
	Tags       []string `json:"tags"`
}

type NoteSummary struct {
	ID            string   `json:"id"`
	OwnerUserID   string   `json:"ownerUserId"`
	Title         string   `json:"title"`
	Summary       string   `json:"summary"`
	Content       string   `json:"content"`
	MaterialID    string   `json:"materialId"`
	FolderName    string   `json:"folderName"`
	Tags          []string `json:"tags"`
	VersionNumber int      `json:"versionNumber"`
	CreatedAt     string   `json:"createdAt"`
	UpdatedAt     string   `json:"updatedAt"`
}

type NoteVersionSummary struct {
	ID            string `json:"id"`
	NoteID        string `json:"noteId"`
	VersionNumber int    `json:"versionNumber"`
	Title         string `json:"title"`
	Summary       string `json:"summary"`
	Content       string `json:"content"`
	CreatedAt     string `json:"createdAt"`
}

