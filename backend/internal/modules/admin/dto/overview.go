package dto

type OverviewPayload struct {
	UserCount              int64 `json:"userCount"`
	PostCount              int64 `json:"postCount"`
	MaterialCount          int64 `json:"materialCount"`
	GraphCount             int64 `json:"graphCount"`
	PendingModerationCount int64 `json:"pendingModerationCount"`
}
