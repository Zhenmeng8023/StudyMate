package dto

type CreateMaterialRequest struct {
	OfficialMetadata
	FolderName       string   `json:"folderName" binding:"max=120"`
	Title            string   `json:"title" binding:"required,min=4,max=200"`
	Description      string   `json:"description" binding:"required,min=10"`
	Category         string   `json:"category" binding:"required,min=2,max=64"`
	Tags             []string `json:"tags"`
	CoverFileID      string   `json:"coverFileId"`
	AttachmentFileID string   `json:"attachmentFileId"`
}

type UpdateMaterialRequest struct {
	OfficialMetadata
	FolderName       string   `json:"folderName" binding:"max=120"`
	Title            string   `json:"title" binding:"required,min=4,max=200"`
	Description      string   `json:"description" binding:"required,min=10"`
	Category         string   `json:"category" binding:"required,min=2,max=64"`
	Tags             []string `json:"tags"`
	CoverFileID      string   `json:"coverFileId"`
	AttachmentFileID string   `json:"attachmentFileId"`
}

type RateMaterialRequest struct {
	Score int `json:"score" binding:"required,min=1,max=5"`
}

type MaterialSummary struct {
	PreviousVersionID *string `json:"previousVersionId,omitempty"`
	ChangeSummary     string  `json:"changeSummary,omitempty"`
	OfficialMetadata
	ArchiveReason    string                   `json:"archiveReason"`
	ReadingProgress  *MaterialReadingProgress `json:"readingProgress,omitempty"`
	LibraryScope     string                   `json:"libraryScope"`
	FolderName       string                   `json:"folderName"`
	IsCollected      bool                     `json:"isCollected"`
	ID               string                   `json:"id"`
	OwnerUserID      string                   `json:"ownerUserId"`
	OwnerName        string                   `json:"ownerName"`
	Title            string                   `json:"title"`
	Description      string                   `json:"description"`
	Category         string                   `json:"category"`
	Tags             []string                 `json:"tags"`
	CoverFileID      string                   `json:"coverFileId"`
	AttachmentFileID string                   `json:"attachmentFileId"`
	AttachmentName   string                   `json:"attachmentName"`
	AttachmentMime   string                   `json:"attachmentMime"`
	Status           string                   `json:"status"`
	FavoritesCount   int64                    `json:"favoritesCount"`
	AverageRating    float64                  `json:"averageRating"`
	CreatedAt        string                   `json:"createdAt"`
	UpdatedAt        string                   `json:"updatedAt"`
}

// MaterialReadingProgress is a requester-scoped bookshelf read model, without private annotations or bookmarks.
type MaterialReadingProgress struct {
	CurrentPage     int     `json:"currentPage"`
	TotalPages      int     `json:"totalPages"`
	ProgressPercent float64 `json:"progressPercent"`
	LastReadAt      string  `json:"lastReadAt"`
}

type MaterialFavoriteResponse struct {
	Active bool  `json:"active"`
	Count  int64 `json:"count"`
}

type MaterialRatingResponse struct {
	AverageRating float64 `json:"averageRating"`
	UserScore     int     `json:"userScore"`
}

// OfficialMetadata stays optional for historical callers and personal resources.
type OfficialMetadata struct {
	MaterialType    string `json:"materialType"`
	Author          string `json:"author"`
	SourceURL       string `json:"sourceUrl"`
	PublicationYear int    `json:"publicationYear"`
	Edition         string `json:"edition"`
	LicenseStatus   string `json:"licenseStatus"`
}
type OfficialCatalogQuery struct {
	Page         int
	PageSize     int
	Q            string
	Category     string
	MaterialType string
	Sort         string
	Status       string
}
type OfficialCatalogPage struct {
	Items      []MaterialSummary `json:"items"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"pageSize"`
	Categories []string          `json:"categories"`
}
type OfficialStatusRequest struct {
	Status string `json:"status"`
	Reason string `json:"reason"`
}
