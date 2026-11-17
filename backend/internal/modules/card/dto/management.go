package dto

type ListCardNotesQuery struct {
	SourceType string `form:"sourceType"`
	SourceID   string `form:"sourceId"`
}

type CardNoteRegenerationPayload struct {
	CreatedCount   int `json:"createdCount"`
	UpdatedCount   int `json:"updatedCount"`
	RemovedCount   int `json:"removedCount"`
	PreservedCount int `json:"preservedCount"`
}

type DeleteCardRequest struct {
	ConfirmDeleteHistory bool `json:"confirmDeleteHistory"`
}

type DeleteCardResultPayload struct {
	CardID             string `json:"cardId"`
	DeckID             string `json:"deckId"`
	DeletedReviewCount int64  `json:"deletedReviewCount"`
}
