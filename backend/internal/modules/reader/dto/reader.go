package dto

type UpdateProgressRequest struct {
	CurrentPage     int     `json:"currentPage" binding:"min=0"`
	TotalPages      int     `json:"totalPages" binding:"min=0"`
	ProgressPercent float64 `json:"progressPercent" binding:"min=0,max=100"`
	Bookmarks       []int   `json:"bookmarks"`
}

type CreateAnnotationRequest struct {
	Page    int       `json:"page" binding:"required,min=1"`
	Quote   string    `json:"quote" binding:"max=1000"`
	Comment string    `json:"comment" binding:"max=2000"`
	Color   string    `json:"color" binding:"max=32"`
	Rects   []PDFRect `json:"rects" binding:"max=20,dive"`
}

type GenerateAnnotationCardDraftsRequest struct {
	AnnotationIDs []string `json:"annotationIds" binding:"required,min=1,max=20,dive,min=1"`
}

type PDFRect struct {
	Page   int     `json:"page" binding:"min=1"`
	X      float64 `json:"x" binding:"min=0,max=1"`
	Y      float64 `json:"y" binding:"min=0,max=1"`
	Width  float64 `json:"width" binding:"min=0,max=1"`
	Height float64 `json:"height" binding:"min=0,max=1"`
}

type AnnotationSummary struct {
	ID         string    `json:"id"`
	MaterialID string    `json:"materialId"`
	Page       int       `json:"page"`
	Quote      string    `json:"quote"`
	Comment    string    `json:"comment"`
	Color      string    `json:"color"`
	Rects      []PDFRect `json:"rects"`
	CreatedAt  string    `json:"createdAt"`
	UpdatedAt  string    `json:"updatedAt"`
}

type ReaderStateResponse struct {
	MaterialID      string              `json:"materialId"`
	CurrentPage     int                 `json:"currentPage"`
	TotalPages      int                 `json:"totalPages"`
	ProgressPercent float64             `json:"progressPercent"`
	Bookmarks       []int               `json:"bookmarks"`
	LastReadAt      string              `json:"lastReadAt"`
	Annotations     []AnnotationSummary `json:"annotations"`
}
