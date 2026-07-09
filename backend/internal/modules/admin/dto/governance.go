package dto

type AdminUserPayload struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	DisplayName string `json:"displayName"`
	Role        string `json:"role"`
	Status      string `json:"status"`
	CreatedAt   string `json:"createdAt"`
}

type AdminReportPayload struct {
	ID             string `json:"id"`
	ReporterUserID string `json:"reporterUserId"`
	TargetType     string `json:"targetType"`
	TargetID       string `json:"targetId"`
	Reason         string `json:"reason"`
	Description    string `json:"description"`
	Status         string `json:"status"`
	HandledBy      string `json:"handledBy"`
	HandledAt      string `json:"handledAt"`
	CreatedAt      string `json:"createdAt"`
}

type AdminMaterialPayload struct {
	ID             string `json:"id"`
	OwnerUserID    string `json:"ownerUserId"`
	OwnerName      string `json:"ownerName"`
	Title          string `json:"title"`
	Description    string `json:"description"`
	Category       string `json:"category"`
	AttachmentName string `json:"attachmentName"`
	Status         string `json:"status"`
	CreatedAt      string `json:"createdAt"`
	UpdatedAt      string `json:"updatedAt"`
}

type AdminTagPayload struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	UsageCount int64  `json:"usageCount"`
	Source     string `json:"source"`
}

type AdminAITaskPayload struct {
	ID           string  `json:"id"`
	UserID       string  `json:"userId"`
	TaskType     string  `json:"taskType"`
	SourceType   string  `json:"sourceType"`
	SourceID     string  `json:"sourceId"`
	Status       string  `json:"status"`
	Model        string  `json:"model"`
	InputTokens  int64   `json:"inputTokens"`
	OutputTokens int64   `json:"outputTokens"`
	CostUnits    float64 `json:"costUnits"`
	ErrorMessage string  `json:"errorMessage"`
	CreatedAt    string  `json:"createdAt"`
	UpdatedAt    string  `json:"updatedAt"`
}

type AdminAIUsagePayload struct {
	TotalTasks        int64   `json:"totalTasks"`
	CompletedTasks    int64   `json:"completedTasks"`
	FailedTasks       int64   `json:"failedTasks"`
	TotalInputTokens  int64   `json:"totalInputTokens"`
	TotalOutputTokens int64   `json:"totalOutputTokens"`
	TotalCostUnits    float64 `json:"totalCostUnits"`
}

type AdminAuditLogPayload struct {
	ID        string `json:"id"`
	ActorID   string `json:"actorId"`
	Action    string `json:"action"`
	Target    string `json:"target"`
	Metadata  string `json:"metadata"`
	CreatedAt string `json:"createdAt"`
}

type AdminFilePayload struct {
	ID           string `json:"id"`
	OwnerUserID  string `json:"ownerUserId"`
	OriginalName string `json:"originalName"`
	MimeType     string `json:"mimeType"`
	Size         int64  `json:"size"`
	Visibility   string `json:"visibility"`
	ScanStatus   string `json:"scanStatus"`
	CreatedAt    string `json:"createdAt"`
}
