package dto

type CreateOfficialVersionRequest struct {
	CreateMaterialRequest
	ChangeSummary string `json:"changeSummary" binding:"required,max=500"`
}
type OfficialVersionItem struct {
	ID            string `json:"id"`
	Title         string `json:"title"`
	Edition       string `json:"edition"`
	Status        string `json:"status"`
	ChangeSummary string `json:"changeSummary"`
	CreatedAt     string `json:"createdAt"`
}
type OfficialVersionsResponse struct {
	Items             []OfficialVersionItem `json:"items"`
	CurrentMaterialID string                `json:"currentMaterialId"`
	LatestPublishedID string                `json:"latestPublishedId"`
}
