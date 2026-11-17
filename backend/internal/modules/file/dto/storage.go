package dto

type StorageFile struct {
	ID           string `json:"id"`
	OriginalName string `json:"originalName"`
	Size         int64  `json:"size"`
	CreatedAt    string `json:"createdAt"`
}

type StorageResponse struct {
	UsedBytes         int64         `json:"usedBytes"`
	QuotaBytes        int64         `json:"quotaBytes"`
	RemainingBytes    int64         `json:"remainingBytes"`
	FileCount         int64         `json:"fileCount"`
	UnlinkedFileCount int64         `json:"unlinkedFileCount"`
	UnlinkedBytes     int64         `json:"unlinkedBytes"`
	UnlinkedFiles     []StorageFile `json:"unlinkedFiles"`
}
