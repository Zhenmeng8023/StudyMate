package dto

type CreateDeckRequest struct {
	Title       string `json:"title" binding:"required,max=200"`
	Description string `json:"description"`
	Visibility  string `json:"visibility"`
}

type CreateCardRequest struct {
	CardType       string         `json:"cardType"`
	DraftID        string         `json:"draftId,omitempty"`
	Front          string         `json:"front" binding:"required"`
	Back           string         `json:"back" binding:"required"`
	Tags           []string       `json:"tags,omitempty"`
	SourceType     string         `json:"sourceType"`
	SourceID       string         `json:"sourceId"`
	SourceMetadata map[string]any `json:"sourceMetadata,omitempty"`
}

type ListCardsQuery struct {
	Query      string `form:"q"`
	Status     string `form:"status"`
	QueueState string `form:"queueState"`
	SourceType string `form:"sourceType"`
	SourceID   string `form:"sourceId"`
	DueBucket  string `form:"dueBucket"`
	Tag        string `form:"tag"`
}

type ExportDeckQuery struct {
	Format string `form:"format"`
}

type BulkCreateCardsRequest struct {
	Cards []CreateCardRequest `json:"cards" binding:"required,min=1,max=20,dive"`
}

type CreateCardNoteRequest struct {
	NoteTypeCode      string              `json:"noteTypeCode" binding:"required"`
	PrimarySourceLink *SourceLinkPayload  `json:"primarySourceLink,omitempty"`
	SourceLinks       []SourceLinkPayload `json:"sourceLinks,omitempty"`
	Fields            map[string]string   `json:"fields" binding:"required"`
	TemplateKeys      []string            `json:"templateKeys,omitempty"`
}

type UpdateCardNoteRequest struct {
	Fields            map[string]string   `json:"fields"`
	PrimarySourceLink *SourceLinkPayload  `json:"primarySourceLink,omitempty"`
	SourceLinks       []SourceLinkPayload `json:"sourceLinks,omitempty"`
	Tags              []string            `json:"tags,omitempty"`
}

type ImportDeckRequest struct {
	Filename    string `json:"filename" binding:"required"`
	Content     string `json:"content" binding:"required"`
	PreviewOnly bool   `json:"previewOnly"`
}

type ReviewCardRequest struct {
	Rating    string `json:"rating" binding:"required"`
	ElapsedMs int64  `json:"elapsedMs"`
}

type UpdateCardStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

type UpdateCardTagsRequest struct {
	Tags []string `json:"tags"`
}

type UndoReviewRequest struct {
	ReviewID         string              `json:"reviewId" binding:"required"`
	PreviousSchedule CardSchedulePayload `json:"previousSchedule" binding:"required"`
}

type CardDraftPayload struct {
	ID             string         `json:"id"`
	DraftID        string         `json:"draftId,omitempty"`
	SourceType     string         `json:"sourceType,omitempty"`
	SourceID       string         `json:"sourceId,omitempty"`
	SourceLabel    string         `json:"sourceLabel,omitempty"`
	SourceMetadata map[string]any `json:"sourceMetadata,omitempty"`
	Front          string         `json:"front"`
	Back           string         `json:"back"`
	Explanation    string         `json:"explanation,omitempty"`
}

type SourceLinkPayload struct {
	SourceType string         `json:"sourceType"`
	SourceID   string         `json:"sourceId"`
	Title      string         `json:"title,omitempty"`
	Excerpt    string         `json:"excerpt,omitempty"`
	Locator    map[string]any `json:"locator,omitempty"`
	Metadata   map[string]any `json:"metadata,omitempty"`
}

type NoteTypeFieldSchemaPayload struct {
	Name     string `json:"name"`
	Label    string `json:"label,omitempty"`
	Kind     string `json:"kind,omitempty"`
	Required bool   `json:"required,omitempty"`
}

type NoteTypePayload struct {
	ID            string                       `json:"id"`
	Code          string                       `json:"code"`
	Name          string                       `json:"name"`
	Kind          string                       `json:"kind"`
	IsBuiltin     bool                         `json:"isBuiltin"`
	Status        string                       `json:"status"`
	FieldSchema   []NoteTypeFieldSchemaPayload `json:"fieldSchema,omitempty"`
	TemplateCount int                          `json:"templateCount"`
	CreatedAt     string                       `json:"createdAt,omitempty"`
	UpdatedAt     string                       `json:"updatedAt,omitempty"`
}

type CardTemplatePayload struct {
	ID           string `json:"id"`
	NoteTypeID   string `json:"noteTypeId"`
	Name         string `json:"name"`
	TemplateKind string `json:"templateKind"`
	Ordinal      int    `json:"ordinal"`
	IsActive     bool   `json:"isActive"`
	FrontFormat  string `json:"frontFormat,omitempty"`
	BackFormat   string `json:"backFormat,omitempty"`
	ClozeRule    string `json:"clozeRule,omitempty"`
	CreatedAt    string `json:"createdAt,omitempty"`
	UpdatedAt    string `json:"updatedAt,omitempty"`
}

type CardNotePayload struct {
	ID                 string              `json:"id"`
	DeckID             string              `json:"deckId"`
	OwnerUserID        string              `json:"ownerUserId"`
	NoteTypeID         string              `json:"noteTypeId"`
	NoteTypeCode       string              `json:"noteTypeCode,omitempty"`
	PrimarySourceLink  *SourceLinkPayload  `json:"primarySourceLink,omitempty"`
	SourceLinks        []SourceLinkPayload `json:"sourceLinks,omitempty"`
	Fields             map[string]string   `json:"fields,omitempty"`
	GeneratedCardCount int                 `json:"generatedCardCount"`
	Status             string              `json:"status"`
	CreatedAt          string              `json:"createdAt,omitempty"`
	UpdatedAt          string              `json:"updatedAt,omitempty"`
}

type CreateCardNoteResultPayload struct {
	CardNote       CardNotePayload        `json:"cardNote"`
	GeneratedCards []GeneratedCardPayload `json:"generatedCards"`
}

type ManagedCardNotePayload struct {
	CardNote       CardNotePayload              `json:"cardNote"`
	GeneratedCards []GeneratedCardPayload       `json:"generatedCards"`
	QueueStates    map[string]int               `json:"queueStates"`
	Tags           []string                     `json:"tags,omitempty"`
	Regeneration   *CardNoteRegenerationPayload `json:"regeneration,omitempty"`
}

type DeckPayload struct {
	ID          string `json:"id"`
	OwnerUserID string `json:"ownerUserId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Visibility  string `json:"visibility"`
	CardCount   int64  `json:"cardCount"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

type CardPayload struct {
	ID                string               `json:"id"`
	DeckID            string               `json:"deckId"`
	OwnerUserID       string               `json:"ownerUserId"`
	CardNoteID        string               `json:"cardNoteId,omitempty"`
	TemplateID        string               `json:"templateId,omitempty"`
	TemplateOrdinal   int                  `json:"templateOrdinal,omitempty"`
	CardType          string               `json:"cardType"`
	Front             string               `json:"front"`
	Back              string               `json:"back"`
	Tags              []string             `json:"tags"`
	SourceType        string               `json:"sourceType,omitempty"`
	SourceID          string               `json:"sourceId,omitempty"`
	SourceMetadata    map[string]any       `json:"sourceMetadata,omitempty"`
	PrimarySourceLink *SourceLinkPayload   `json:"primarySourceLink,omitempty"`
	SourceLinks       []SourceLinkPayload  `json:"sourceLinks,omitempty"`
	Status            string               `json:"status"`
	Schedule          *CardSchedulePayload `json:"schedule,omitempty"`
	CreatedAt         string               `json:"createdAt"`
	UpdatedAt         string               `json:"updatedAt"`
}

type GeneratedCardPayload = CardPayload

type CardSchedulePayload struct {
	CardID          string  `json:"cardId"`
	UserID          string  `json:"userId"`
	DueAt           string  `json:"dueAt"`
	LearningStep    int     `json:"learningStep"`
	IntervalDays    int     `json:"intervalDays"`
	EaseFactor      float64 `json:"easeFactor"`
	RepetitionCount int     `json:"repetitionCount"`
	LapseCount      int     `json:"lapseCount"`
	State           string  `json:"state"`
	UpdatedAt       string  `json:"updatedAt"`
}

type ReviewQueueItemPayload struct {
	DeckTitle string              `json:"deckTitle"`
	Card      CardPayload         `json:"card"`
	Schedule  CardSchedulePayload `json:"schedule"`
}

type ReviewQueuePayload struct {
	DueCount        int64                    `json:"dueCount"`
	NewCount        int64                    `json:"newCount"`
	LearningCount   int64                    `json:"learningCount"`
	ReviewCount     int64                    `json:"reviewCount"`
	RelearningCount int64                    `json:"relearningCount"`
	NewLimit        int                      `json:"newLimit"`
	ReviewLimit     int                      `json:"reviewLimit"`
	Items           []ReviewQueueItemPayload `json:"items"`
}

type ReviewFeedbackCardPayload struct {
	CardID            string              `json:"cardId"`
	DeckID            string              `json:"deckId"`
	DeckTitle         string              `json:"deckTitle"`
	Front             string              `json:"front"`
	SourceType        string              `json:"sourceType,omitempty"`
	SourceID          string              `json:"sourceId,omitempty"`
	SourceMetadata    map[string]any      `json:"sourceMetadata,omitempty"`
	PrimarySourceLink *SourceLinkPayload  `json:"primarySourceLink,omitempty"`
	SourceLinks       []SourceLinkPayload `json:"sourceLinks,omitempty"`
	DueAt             string              `json:"dueAt"`
	LapseCount        int                 `json:"lapseCount"`
	RepetitionCount   int                 `json:"repetitionCount"`
	State             string              `json:"state"`
}

type ReviewFeedbackSourcePayload struct {
	SourceType        string              `json:"sourceType,omitempty"`
	SourceID          string              `json:"sourceId,omitempty"`
	SourceMetadata    map[string]any      `json:"sourceMetadata,omitempty"`
	PrimarySourceLink *SourceLinkPayload  `json:"primarySourceLink,omitempty"`
	SourceLinks       []SourceLinkPayload `json:"sourceLinks,omitempty"`
	TotalCardCount    int                 `json:"totalCardCount"`
	ReviewCardCount   int                 `json:"reviewCardCount"`
	MasteredCardCount int                 `json:"masteredCardCount"`
	MasteryLevel      string              `json:"masteryLevel,omitempty"`
	MasteryScore      int                 `json:"masteryScore"`
	WeakCardCount     int                 `json:"weakCardCount"`
	DueCount          int                 `json:"dueCount"`
	LearningCount     int                 `json:"learningCount"`
	MaxLapseCount     int                 `json:"maxLapseCount"`
	SampleCardFronts  []string            `json:"sampleCardFronts,omitempty"`
	LastReviewedAt    string              `json:"lastReviewedAt,omitempty"`
}

type ReviewFeedbackPayload struct {
	DueCount        int64                         `json:"dueCount"`
	LearningCount   int64                         `json:"learningCount"`
	WeakCardCount   int64                         `json:"weakCardCount"`
	WeakCards       []ReviewFeedbackCardPayload   `json:"weakCards"`
	SourceSummaries []ReviewFeedbackSourcePayload `json:"sourceSummaries,omitempty"`
	WeakSources     []ReviewFeedbackSourcePayload `json:"weakSources,omitempty"`
}

type ReviewInsightDailyPayload struct {
	Date           string         `json:"date"`
	ReviewCount    int            `json:"reviewCount"`
	RatingCounts   map[string]int `json:"ratingCounts"`
	WeakNewCount   int            `json:"weakNewCount"`
	WeakCarryCount int            `json:"weakCarryCount"`
}

type ReviewInsightSourceTrendPayload struct {
	Date         string `json:"date"`
	SourceType   string `json:"sourceType,omitempty"`
	SourceID     string `json:"sourceId,omitempty"`
	MasteryScore int    `json:"masteryScore"`
}

type ReviewInsightsPayload struct {
	Days         []ReviewInsightDailyPayload       `json:"days"`
	SourceTrends []ReviewInsightSourceTrendPayload `json:"sourceTrends,omitempty"`
	Sources      []ReviewFeedbackSourcePayload     `json:"sources,omitempty"`
}

type SourceProfileQuery struct {
	SourceType string `form:"sourceType" binding:"required"`
	SourceID   string `form:"sourceId" binding:"required"`
}

type SourceProfileReviewPayload struct {
	ReviewID   string `json:"reviewId"`
	CardID     string `json:"cardId"`
	Rating     string `json:"rating"`
	ReviewedAt string `json:"reviewedAt"`
}

type SourceProfilePayload struct {
	SourceType        string                       `json:"sourceType"`
	SourceID          string                       `json:"sourceId"`
	Title             string                       `json:"title,omitempty"`
	Excerpt           string                       `json:"excerpt,omitempty"`
	Locator           map[string]any               `json:"locator,omitempty"`
	Target            string                       `json:"target,omitempty"`
	CardNotes         []ManagedCardNotePayload     `json:"cardNotes,omitempty"`
	GeneratedCards    []GeneratedCardPayload       `json:"generatedCards,omitempty"`
	QueueStates       map[string]int               `json:"queueStates"`
	MasteryScore      int                          `json:"masteryScore"`
	MasteryLevel      string                       `json:"masteryLevel,omitempty"`
	DueCount          int                          `json:"dueCount"`
	LearningCount     int                          `json:"learningCount"`
	WeakCardCount     int                          `json:"weakCardCount"`
	LastReviewedAt    string                       `json:"lastReviewedAt,omitempty"`
	RecentReviews     []SourceProfileReviewPayload `json:"recentReviews,omitempty"`
	PrimarySourceLink *SourceLinkPayload           `json:"primarySourceLink,omitempty"`
	SourceLinks       []SourceLinkPayload          `json:"sourceLinks,omitempty"`
}

type DeckExportPayload struct {
	Format     string `json:"format"`
	Filename   string `json:"filename"`
	MimeType   string `json:"mimeType"`
	Content    string `json:"content"`
	CardCount  int    `json:"cardCount"`
	ExportedAt string `json:"exportedAt"`
}

type DeckImportIssuePayload struct {
	RowNumber int    `json:"rowNumber"`
	Front     string `json:"front,omitempty"`
	Message   string `json:"message"`
}

type DeckImportPayload struct {
	Preview          bool                     `json:"preview"`
	TotalCount       int                      `json:"totalCount"`
	ReadyCount       int                      `json:"readyCount"`
	ImportedCount    int                      `json:"importedCount"`
	DuplicateCount   int                      `json:"duplicateCount"`
	FailedCount      int                      `json:"failedCount"`
	DuplicateSamples []DeckImportIssuePayload `json:"duplicateSamples,omitempty"`
	FailureSamples   []DeckImportIssuePayload `json:"failureSamples,omitempty"`
	StatusMessage    string                   `json:"statusMessage"`
}

type ReviewResultPayload struct {
	ReviewID string              `json:"reviewId"`
	Schedule CardSchedulePayload `json:"schedule"`
}

type UndoReviewResultPayload struct {
	Schedule CardSchedulePayload `json:"schedule"`
}
