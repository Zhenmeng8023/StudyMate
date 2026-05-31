package dto

type TaskPayload struct {
	ID            string  `json:"id"`
	UserID        string  `json:"userId"`
	TaskType      string  `json:"taskType"`
	SourceType    string  `json:"sourceType,omitempty"`
	SourceID      string  `json:"sourceId,omitempty"`
	Status        string  `json:"status"`
	Model         string  `json:"model"`
	InputTokens   int64   `json:"inputTokens"`
	OutputTokens  int64   `json:"outputTokens"`
	CostUnits     float64 `json:"costUnits"`
	ResultRefType string  `json:"resultRefType,omitempty"`
	ResultRefID   string  `json:"resultRefId,omitempty"`
	ErrorMessage  string  `json:"errorMessage,omitempty"`
	CreatedAt     string  `json:"createdAt"`
	UpdatedAt     string  `json:"updatedAt"`
}

type UsageSummaryPayload struct {
	TotalTasks        int64   `json:"totalTasks"`
	CompletedTasks    int64   `json:"completedTasks"`
	FailedTasks       int64   `json:"failedTasks"`
	TotalInputTokens  int64   `json:"totalInputTokens"`
	TotalOutputTokens int64   `json:"totalOutputTokens"`
	TotalCostUnits    float64 `json:"totalCostUnits"`
	LastTaskAt        string  `json:"lastTaskAt,omitempty"`
}

type DraftPayload struct {
	ID          string `json:"id"`
	TaskID      string `json:"taskId"`
	DraftType   string `json:"draftType"`
	TargetType  string `json:"targetType"`
	TargetID    string `json:"targetId"`
	Status      string `json:"status"`
	SourceType  string `json:"sourceType,omitempty"`
	SourceID    string `json:"sourceId,omitempty"`
	SourceLabel string `json:"sourceLabel,omitempty"`
	Front       string `json:"front"`
	Back        string `json:"back"`
	Explanation string `json:"explanation,omitempty"`
	Metadata    map[string]any `json:"metadata,omitempty"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}
