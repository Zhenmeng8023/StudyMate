package dto

type CreateGraphRequest struct {
	Title       string `json:"title" binding:"required,min=2,max=200"`
	Description string `json:"description" binding:"max=1000"`
	Visibility  string `json:"visibility" binding:"omitempty,oneof=private public"`
}

type UpdateGraphRequest struct {
	Title       string `json:"title" binding:"required,min=2,max=200"`
	Description string `json:"description" binding:"max=1000"`
	Visibility  string `json:"visibility" binding:"omitempty,oneof=private public"`
}

type GraphNodeSourcePayload struct {
	Type    string `json:"type" bson:"type"`
	ID      string `json:"id" bson:"id"`
	Label   string `json:"label,omitempty" bson:"label,omitempty"`
	Excerpt string `json:"excerpt,omitempty" bson:"excerpt,omitempty"`
}

type GraphNodePayload struct {
	ID       string                  `json:"id" bson:"id"`
	Type     string                  `json:"type" bson:"type"`
	Title    string                  `json:"title" bson:"title"`
	X        float64                 `json:"x" bson:"x"`
	Y        float64                 `json:"y" bson:"y"`
	Width    float64                 `json:"width" bson:"width"`
	Height   float64                 `json:"height" bson:"height"`
	Source   *GraphNodeSourcePayload `json:"source,omitempty" bson:"source,omitempty"`
	Metadata map[string]any          `json:"metadata,omitempty" bson:"metadata,omitempty"`
}

type GraphEdgePayload struct {
	ID           string         `json:"id" bson:"id"`
	Kind         string         `json:"kind,omitempty" bson:"kind,omitempty"`
	SourceNodeID string         `json:"sourceNodeId" bson:"source_node_id"`
	TargetNodeID string         `json:"targetNodeId" bson:"target_node_id"`
	Label        string         `json:"label,omitempty" bson:"label,omitempty"`
	Metadata     map[string]any `json:"metadata,omitempty" bson:"metadata,omitempty"`
}

type GraphGroupPayload struct {
	ID        string         `json:"id" bson:"id"`
	Title     string         `json:"title" bson:"title"`
	NodeIDs   []string       `json:"nodeIds" bson:"node_ids"`
	X         float64        `json:"x" bson:"x"`
	Y         float64        `json:"y" bson:"y"`
	Width     float64        `json:"width" bson:"width"`
	Height    float64        `json:"height" bson:"height"`
	Collapsed bool           `json:"collapsed" bson:"collapsed"`
	Metadata  map[string]any `json:"metadata,omitempty" bson:"metadata,omitempty"`
}

type GraphViewportPayload struct {
	X    float64 `json:"x" bson:"x"`
	Y    float64 `json:"y" bson:"y"`
	Zoom float64 `json:"zoom" bson:"zoom"`
}

type GraphDocumentPayload struct {
	GraphID       string               `json:"graphId" bson:"graph_id"`
	Version       int64                `json:"version" bson:"version"`
	SchemaVersion int                  `json:"schemaVersion" bson:"schema_version"`
	Viewport      GraphViewportPayload `json:"viewport" bson:"viewport"`
	Nodes         []GraphNodePayload   `json:"nodes" bson:"nodes"`
	Edges         []GraphEdgePayload   `json:"edges" bson:"edges"`
	Groups        []GraphGroupPayload  `json:"groups" bson:"groups"`
	Theme         map[string]any       `json:"theme,omitempty" bson:"theme,omitempty"`
	Metadata      map[string]any       `json:"metadata,omitempty" bson:"metadata,omitempty"`
	UpdatedAt     string               `json:"updatedAt,omitempty" bson:"-"`
}

type GraphSummaryPayload struct {
	ID             string `json:"id"`
	OwnerUserID    string `json:"ownerUserId"`
	Title          string `json:"title"`
	Description    string `json:"description"`
	Visibility     string `json:"visibility"`
	Status         string `json:"status"`
	GraphType      string `json:"graphType"`
	Mode           string `json:"mode"`
	CurrentVersion int64  `json:"currentVersion"`
	NodeCount      int64  `json:"nodeCount"`
	EdgeCount      int64  `json:"edgeCount"`
	CreatedAt      string `json:"createdAt"`
	UpdatedAt      string `json:"updatedAt"`
}

type GraphDetailPayload struct {
	GraphSummaryPayload
	Document GraphDocumentPayload `json:"document"`
}

type GraphBatchSaveRequest struct {
	Title       string               `json:"title" binding:"required,min=2,max=200"`
	Description string               `json:"description" binding:"max=1000"`
	Document    GraphDocumentPayload `json:"document" binding:"required"`
	Summary     string               `json:"summary" binding:"max=500"`
}

type GraphSnapshotPayload struct {
	ID            string `json:"id"`
	GraphID       string `json:"graphId"`
	VersionNumber int64  `json:"versionNumber"`
	Summary       string `json:"summary"`
	CreatedAt     string `json:"createdAt"`
}

type RestoreGraphRequest struct {
	VersionNumber int64 `json:"versionNumber" binding:"required,min=1"`
}

type ImportGraphRequest struct {
	Source string `json:"source" binding:"required,min=1,max=20000"`
}

type GraphValidationIssuePayload struct {
	RuleType string `json:"ruleType"`
	Message  string `json:"message"`
	TargetID string `json:"targetId,omitempty"`
	Severity string `json:"severity"`
}

type GraphValidationResponse struct {
	Issues []GraphValidationIssuePayload `json:"issues"`
}

type GraphCardDraftPayload struct {
	ID           string `json:"id"`
	DraftID      string `json:"draftId,omitempty"`
	SourceNodeID string `json:"sourceNodeId"`
	Front        string `json:"front"`
	Back         string `json:"back"`
	Explanation  string `json:"explanation,omitempty"`
}

type GraphCardDraftRequest struct {
	NodeIDs []string `json:"nodeIds" binding:"required,min=1,max=20,dive,min=1"`
}

type CommitGraphCardDraftsRequest struct {
	DeckID string                  `json:"deckId" binding:"required,min=1,max=36"`
	Drafts []GraphCardDraftPayload `json:"drafts" binding:"required,min=1,max=20,dive"`
}

type CommitGraphChangeDraftsRequest struct {
	DraftIDs        []string                        `json:"draftIds" binding:"required,min=1,max=20,dive,min=1"`
	NodeSelections  []GraphDraftNodeSelectionInput `json:"nodeSelections"`
}

type GraphDraftNodeSelectionInput struct {
	DraftID  string   `json:"draftId" binding:"required,min=1,max=36"`
	NodeIDs  []string `json:"nodeIds" binding:"required,min=1,max=50,dive,min=1"`
}

type DiagramTemplatePayload struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Category    string   `json:"category"`
	Description string   `json:"description"`
	Mode        string   `json:"mode"`
	SampleLines []string `json:"sampleLines"`
}
