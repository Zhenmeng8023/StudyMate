package repository

import (
	"time"

	"gorm.io/gorm"
	carddto "studymate/backend/internal/modules/card/dto"
	cardmodel "studymate/backend/internal/modules/card/model"
)

type Repository struct {
	db *gorm.DB
}

type DueCardRow struct {
	Card     cardmodel.Card
	Deck     cardmodel.Deck
	Schedule cardmodel.CardSchedule
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateDeck(deck *cardmodel.Deck) error {
	return r.db.Create(deck).Error
}

func (r *Repository) SaveDeck(deck *cardmodel.Deck) error {
	return r.db.Save(deck).Error
}

func (r *Repository) FindDeckByID(deckID string) (*cardmodel.Deck, error) {
	var deck cardmodel.Deck
	if err := r.db.First(&deck, "id = ?", deckID).Error; err != nil {
		return nil, err
	}

	return &deck, nil
}

func (r *Repository) ListDecksByOwner(ownerUserID string) ([]carddto.DeckPayload, error) {
	var decks []cardmodel.Deck
	if err := r.db.Where("owner_user_id = ?", ownerUserID).Order("updated_at desc").Find(&decks).Error; err != nil {
		return nil, err
	}

	result := make([]carddto.DeckPayload, 0, len(decks))
	for _, deck := range decks {
		result = append(result, BuildDeckPayload(deck))
	}

	return result, nil
}

func (r *Repository) CreateCard(card *cardmodel.Card) error {
	return r.db.Create(card).Error
}

func (r *Repository) FindCardByID(cardID string) (*cardmodel.Card, error) {
	var card cardmodel.Card
	if err := r.db.First(&card, "id = ?", cardID).Error; err != nil {
		return nil, err
	}

	return &card, nil
}

func (r *Repository) ListCardsByDeck(deckID string) ([]carddto.CardPayload, error) {
	var cards []cardmodel.Card
	if err := r.db.Where("deck_id = ?", deckID).Order("updated_at desc").Find(&cards).Error; err != nil {
		return nil, err
	}

	result := make([]carddto.CardPayload, 0, len(cards))
	for _, card := range cards {
		result = append(result, BuildCardPayload(card))
	}

	return result, nil
}

func (r *Repository) SaveSchedule(schedule *cardmodel.CardSchedule) error {
	return r.db.Save(schedule).Error
}

func (r *Repository) FindSchedule(cardID string, userID string) (*cardmodel.CardSchedule, error) {
	var schedule cardmodel.CardSchedule
	if err := r.db.First(&schedule, "card_id = ? AND user_id = ?", cardID, userID).Error; err != nil {
		return nil, err
	}

	return &schedule, nil
}

func (r *Repository) CreateReview(review *cardmodel.CardReview) error {
	return r.db.Create(review).Error
}

func (r *Repository) CountDueCards(userID string, dueBefore time.Time) (int64, error) {
	var count int64
	err := r.db.Table("card_schedules").
		Joins("JOIN cards ON cards.id = card_schedules.card_id").
		Where("card_schedules.user_id = ? AND card_schedules.due_at <= ? AND cards.status = ?", userID, dueBefore, "active").
		Count(&count).Error
	return count, err
}

func (r *Repository) ListDueCards(userID string, dueBefore time.Time, limit int) ([]DueCardRow, error) {
	type dueCardJoin struct {
		CardID          string
		DeckID          string
		DeckTitle       string
		OwnerUserID     string
		CardType        string
		Front           string
		Back            string
		SourceType      string
		SourceID        string
		Status          string
		CardCreatedAt   time.Time
		CardUpdatedAt   time.Time
		DueAt           time.Time
		IntervalDays    int
		EaseFactor      float64
		RepetitionCount int
		LapseCount      int
		State           string
		ScheduleUpdated time.Time
	}

	query := r.db.Table("card_schedules").
		Select(`
			card_schedules.card_id,
			card_schedules.user_id as owner_user_id,
			card_schedules.due_at,
			card_schedules.interval_days,
			card_schedules.ease_factor,
			card_schedules.repetition_count,
			card_schedules.lapse_count,
			card_schedules.state,
			card_schedules.updated_at as schedule_updated,
			cards.deck_id,
			cards.owner_user_id,
			cards.card_type,
			cards.front,
			cards.back,
			cards.source_type,
			cards.source_id,
			cards.status,
			cards.created_at as card_created_at,
			cards.updated_at as card_updated_at,
			decks.title as deck_title
		`).
		Joins("JOIN cards ON cards.id = card_schedules.card_id").
		Joins("JOIN decks ON decks.id = cards.deck_id").
		Where("card_schedules.user_id = ? AND card_schedules.due_at <= ? AND cards.status = ?", userID, dueBefore, "active").
		Order("card_schedules.due_at asc")
	if limit > 0 {
		query = query.Limit(limit)
	}

	var rows []dueCardJoin
	if err := query.Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]DueCardRow, 0, len(rows))
	for _, row := range rows {
		result = append(result, DueCardRow{
			Card: cardmodel.Card{
				ID:          row.CardID,
				DeckID:      row.DeckID,
				OwnerUserID: row.OwnerUserID,
				CardType:    row.CardType,
				Front:       row.Front,
				Back:        row.Back,
				SourceType:  row.SourceType,
				SourceID:    row.SourceID,
				Status:      row.Status,
				CreatedAt:   row.CardCreatedAt,
				UpdatedAt:   row.CardUpdatedAt,
			},
			Deck: cardmodel.Deck{
				ID:    row.DeckID,
				Title: row.DeckTitle,
			},
			Schedule: cardmodel.CardSchedule{
				CardID:          row.CardID,
				UserID:          row.OwnerUserID,
				DueAt:           row.DueAt,
				IntervalDays:    row.IntervalDays,
				EaseFactor:      row.EaseFactor,
				RepetitionCount: row.RepetitionCount,
				LapseCount:      row.LapseCount,
				State:           row.State,
				UpdatedAt:       row.ScheduleUpdated,
			},
		})
	}

	return result, nil
}

func BuildDeckPayload(deck cardmodel.Deck) carddto.DeckPayload {
	return carddto.DeckPayload{
		ID:          deck.ID,
		OwnerUserID: deck.OwnerUserID,
		Title:       deck.Title,
		Description: deck.Description,
		Visibility:  deck.Visibility,
		CardCount:   deck.CardCount,
		CreatedAt:   deck.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   deck.UpdatedAt.Format(time.RFC3339),
	}
}

func BuildCardPayload(card cardmodel.Card) carddto.CardPayload {
	return carddto.CardPayload{
		ID:          card.ID,
		DeckID:      card.DeckID,
		OwnerUserID: card.OwnerUserID,
		CardType:    card.CardType,
		Front:       card.Front,
		Back:        card.Back,
		SourceType:  card.SourceType,
		SourceID:    card.SourceID,
		Status:      card.Status,
		CreatedAt:   card.CreatedAt.Format(time.RFC3339),
		UpdatedAt:   card.UpdatedAt.Format(time.RFC3339),
	}
}

func BuildSchedulePayload(schedule cardmodel.CardSchedule) carddto.CardSchedulePayload {
	return carddto.CardSchedulePayload{
		CardID:          schedule.CardID,
		UserID:          schedule.UserID,
		DueAt:           schedule.DueAt.Format(time.RFC3339),
		IntervalDays:    schedule.IntervalDays,
		EaseFactor:      schedule.EaseFactor,
		RepetitionCount: schedule.RepetitionCount,
		LapseCount:      schedule.LapseCount,
		State:           schedule.State,
		UpdatedAt:       schedule.UpdatedAt.Format(time.RFC3339),
	}
}
