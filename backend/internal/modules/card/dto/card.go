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
	SourceType string `form:"sourceType"`
	DueBucket  string `form:"dueBucket"`
	Tag        string `form:"tag"`
}

type BulkCreateCardsRequest struct {
	Cards []CreateCardRequest `json:"cards" binding:"required,min=1,max=20,dive"`
}

type ReviewCardRequest struct {
	Rating    string `json:"rating" binding:"required"`
	ElapsedMs int64  `json:"elapsedMs"`
}

type UpdateCardStatusRequest struct {
	Status string `json:"status" binding:"required"`
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
	ID             string               `json:"id"`
	DeckID         string               `json:"deckId"`
	OwnerUserID    string               `json:"ownerUserId"`
	CardType       string               `json:"cardType"`
	Front          string               `json:"front"`
	Back           string               `json:"back"`
	Tags           []string             `json:"tags"`
	SourceType     string               `json:"sourceType,omitempty"`
	SourceID       string               `json:"sourceId,omitempty"`
	SourceMetadata map[string]any       `json:"sourceMetadata,omitempty"`
	Status         string               `json:"status"`
	Schedule       *CardSchedulePayload `json:"schedule,omitempty"`
	CreatedAt      string               `json:"createdAt"`
	UpdatedAt      string               `json:"updatedAt"`
}

type CardSchedulePayload struct {
	CardID          string  `json:"cardId"`
	UserID          string  `json:"userId"`
	DueAt           string  `json:"dueAt"`
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
	DueCount int64                    `json:"dueCount"`
	Items    []ReviewQueueItemPayload `json:"items"`
}

type ReviewFeedbackCardPayload struct {
	CardID          string         `json:"cardId"`
	DeckID          string         `json:"deckId"`
	DeckTitle       string         `json:"deckTitle"`
	Front           string         `json:"front"`
	SourceType      string         `json:"sourceType,omitempty"`
	SourceID        string         `json:"sourceId,omitempty"`
	SourceMetadata  map[string]any `json:"sourceMetadata,omitempty"`
	DueAt           string         `json:"dueAt"`
	LapseCount      int            `json:"lapseCount"`
	RepetitionCount int            `json:"repetitionCount"`
	State           string         `json:"state"`
}

type ReviewFeedbackPayload struct {
	DueCount      int64                       `json:"dueCount"`
	LearningCount int64                       `json:"learningCount"`
	WeakCardCount int64                       `json:"weakCardCount"`
	WeakCards     []ReviewFeedbackCardPayload `json:"weakCards"`
}

type ReviewResultPayload struct {
	ReviewID string              `json:"reviewId"`
	Schedule CardSchedulePayload `json:"schedule"`
}

type UndoReviewResultPayload struct {
	Schedule CardSchedulePayload `json:"schedule"`
}
