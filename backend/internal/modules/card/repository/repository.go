package repository

import (
	"encoding/json"
	"strings"
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

type ReviewFeedbackRow struct {
	Card     cardmodel.Card
	Deck     cardmodel.Deck
	Schedule cardmodel.CardSchedule
}

type ReviewEventRow struct {
	Review   cardmodel.CardReview
	Card     cardmodel.Card
	Deck     cardmodel.Deck
	Schedule *cardmodel.CardSchedule
}

type ListCardsFilter struct {
	Query      string
	Status     string
	QueueState string
	SourceType string
	SourceID   string
	DueBucket  string
	Tag        string
	Now        time.Time
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

func (r *Repository) CreateCardNote(cardNote *cardmodel.CardNote) error {
	return r.db.Create(cardNote).Error
}

func (r *Repository) SaveCardNote(cardNote *cardmodel.CardNote) error {
	return r.db.Save(cardNote).Error
}

func (r *Repository) FindCardNoteByID(cardNoteID string) (*cardmodel.CardNote, error) {
	var cardNote cardmodel.CardNote
	if err := r.db.First(&cardNote, "id = ?", cardNoteID).Error; err != nil {
		return nil, err
	}
	return &cardNote, nil
}

func (r *Repository) ListCardNotesByOwner(ownerUserID string) ([]cardmodel.CardNote, error) {
	var cardNotes []cardmodel.CardNote
	if err := r.db.Where("owner_user_id = ?", ownerUserID).Order("updated_at desc").Find(&cardNotes).Error; err != nil {
		return nil, err
	}
	return cardNotes, nil
}

func (r *Repository) CreateNoteType(noteType *cardmodel.NoteType) error {
	return r.db.Create(noteType).Error
}

func (r *Repository) FindNoteTypeByCode(code string) (*cardmodel.NoteType, error) {
	var noteType cardmodel.NoteType
	if err := r.db.Where("code = ?", code).First(&noteType).Error; err != nil {
		return nil, err
	}
	return &noteType, nil
}

func (r *Repository) CreateCardTemplate(template *cardmodel.CardTemplate) error {
	return r.db.Create(template).Error
}

func (r *Repository) ListActiveCardTemplatesByNoteType(noteTypeID string, templateKeys []string) ([]cardmodel.CardTemplate, error) {
	query := r.db.Where("note_type_id = ? AND is_active = ?", noteTypeID, true)
	if len(templateKeys) > 0 {
		query = query.Where("template_key IN ?", templateKeys)
	}

	var templates []cardmodel.CardTemplate
	if err := query.Order("ordinal asc, created_at asc").Find(&templates).Error; err != nil {
		return nil, err
	}
	return templates, nil
}

func (r *Repository) SaveCard(card *cardmodel.Card) error {
	return r.db.Save(card).Error
}

func (r *Repository) ListCardsByCardNoteID(ownerUserID string, cardNoteID string) ([]cardmodel.Card, error) {
	var cards []cardmodel.Card
	if err := r.db.Where("owner_user_id = ? AND card_note_id = ?", ownerUserID, cardNoteID).Order("template_ordinal asc, created_at asc").Find(&cards).Error; err != nil {
		return nil, err
	}
	return cards, nil
}

func (r *Repository) FindCardByID(cardID string) (*cardmodel.Card, error) {
	var card cardmodel.Card
	if err := r.db.First(&card, "id = ?", cardID).Error; err != nil {
		return nil, err
	}

	return &card, nil
}

func (r *Repository) ListCardsByDeck(deckID string, ownerUserID string, filter ListCardsFilter) ([]carddto.CardPayload, error) {
	type cardWithScheduleJoin struct {
		ID              string
		DeckID          string
		OwnerUserID     string
		CardNoteID      string
		TemplateID      string
		TemplateOrdinal int
		CardType        string
		Front           string
		Back            string
		Tags            string
		SourceType      string
		SourceID        string
		SourceMetadata  string
		Status          string
		CardCreatedAt   time.Time
		CardUpdatedAt   time.Time
		ScheduleCardID  string
		ScheduleUserID  string
		DueAt           *time.Time
		IntervalDays    *int
		EaseFactor      *float64
		RepetitionCount *int
		LapseCount      *int
		LearningStep    *int
		ScheduleState   string
		ScheduleUpdated *time.Time
	}

	query := r.db.Table("cards").
		Select(`
			cards.id,
			cards.deck_id,
			cards.owner_user_id,
			cards.card_note_id,
			cards.template_id,
			cards.template_ordinal,
			cards.card_type,
			cards.front,
			cards.back,
			cards.tags,
			cards.source_type,
			cards.source_id,
			cards.source_metadata,
			cards.status,
			cards.created_at as card_created_at,
			cards.updated_at as card_updated_at,
			card_schedules.card_id as schedule_card_id,
			card_schedules.user_id as schedule_user_id,
			card_schedules.due_at,
			card_schedules.interval_days,
			card_schedules.ease_factor,
			card_schedules.repetition_count,
			card_schedules.lapse_count,
			card_schedules.learning_step,
			card_schedules.state as schedule_state,
			card_schedules.updated_at as schedule_updated
		`).
		Joins("LEFT JOIN card_schedules ON card_schedules.card_id = cards.id AND card_schedules.user_id = ?", ownerUserID).
		Where("cards.deck_id = ?", deckID)

	if filter.Query != "" {
		like := "%" + filter.Query + "%"
		query = query.Where("(cards.front LIKE ? OR cards.back LIKE ? OR cards.tags LIKE ? OR cards.source_type LIKE ? OR cards.source_id LIKE ?)", like, like, like, like, like)
	}
	if filter.Status != "" && filter.Status != "all" {
		query = query.Where("cards.status = ?", filter.Status)
	}
	if filter.QueueState != "" && filter.QueueState != "all" {
		switch filter.QueueState {
		case "suspended", "buried":
			query = query.Where("cards.status = ?", filter.QueueState)
		default:
			query = query.Where("cards.status = ? AND card_schedules.state = ?", "active", filter.QueueState)
		}
	}
	if filter.SourceType != "" && filter.SourceType != "all" {
		if filter.SourceType == "none" {
			query = query.Where("(cards.source_type = '' OR cards.source_type IS NULL)")
		} else {
			query = query.Where("cards.source_type = ?", filter.SourceType)
		}
	}
	if filter.SourceID != "" {
		query = query.Where("cards.source_id = ?", filter.SourceID)
	}
	if filter.DueBucket == "due" {
		query = query.Where("card_schedules.due_at <= ?", filter.Now)
	}
	if filter.DueBucket == "upcoming" {
		query = query.Where("card_schedules.due_at > ?", filter.Now)
	}
	if filter.Tag != "" {
		query = query.Where("cards.tags LIKE ?", buildTagSearchPattern(filter.Tag))
	}

	query = query.Order("cards.updated_at desc")

	var cards []cardWithScheduleJoin
	if err := query.Scan(&cards).Error; err != nil {
		return nil, err
	}

	result := make([]carddto.CardPayload, 0, len(cards))
	for _, card := range cards {
		payload := BuildCardPayload(cardmodel.Card{
			ID:              card.ID,
			DeckID:          card.DeckID,
			OwnerUserID:     card.OwnerUserID,
			CardNoteID:      card.CardNoteID,
			TemplateID:      card.TemplateID,
			TemplateOrdinal: card.TemplateOrdinal,
			CardType:        card.CardType,
			Front:           card.Front,
			Back:            card.Back,
			Tags:            card.Tags,
			SourceType:      card.SourceType,
			SourceID:        card.SourceID,
			SourceMetadata:  card.SourceMetadata,
			Status:          card.Status,
			CreatedAt:       card.CardCreatedAt,
			UpdatedAt:       card.CardUpdatedAt,
		})
		if card.DueAt != nil && card.IntervalDays != nil && card.EaseFactor != nil && card.RepetitionCount != nil && card.LapseCount != nil && card.LearningStep != nil && card.ScheduleUpdated != nil {
			schedule := BuildSchedulePayload(cardmodel.CardSchedule{
				CardID:          card.ScheduleCardID,
				UserID:          card.ScheduleUserID,
				DueAt:           *card.DueAt,
				LearningStep:    *card.LearningStep,
				IntervalDays:    *card.IntervalDays,
				EaseFactor:      *card.EaseFactor,
				RepetitionCount: *card.RepetitionCount,
				LapseCount:      *card.LapseCount,
				State:           card.ScheduleState,
				UpdatedAt:       *card.ScheduleUpdated,
			})
			payload.Schedule = &schedule
		}
		result = append(result, payload)
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

func (r *Repository) FindLatestReview(cardID string, userID string) (*cardmodel.CardReview, error) {
	var review cardmodel.CardReview
	if err := r.db.
		Where("card_id = ? AND user_id = ?", cardID, userID).
		Order("reviewed_at desc, id desc").
		First(&review).Error; err != nil {
		return nil, err
	}

	return &review, nil
}

func (r *Repository) DeleteReviewByID(reviewID string) error {
	return r.db.Delete(&cardmodel.CardReview{}, "id = ?", reviewID).Error
}

func (r *Repository) InTransaction(fn func(repository *Repository) error) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		return fn(&Repository{db: tx})
	})
}

func (r *Repository) CountDueCards(userID string, dueBefore time.Time) (int64, error) {
	var count int64
	err := r.db.Table("card_schedules").
		Joins("JOIN cards ON cards.id = card_schedules.card_id").
		Where("card_schedules.user_id = ? AND card_schedules.due_at <= ? AND cards.status = ?", userID, dueBefore, "active").
		Count(&count).Error
	return count, err
}

func (r *Repository) CountDueCardsByStates(userID string, dueBefore time.Time, states []string) (int64, error) {
	var count int64
	query := r.db.Table("card_schedules").
		Joins("JOIN cards ON cards.id = card_schedules.card_id").
		Where("card_schedules.user_id = ? AND card_schedules.due_at <= ? AND cards.status = ?", userID, dueBefore, "active")
	if len(states) > 0 {
		query = query.Where("card_schedules.state IN ?", states)
	}
	err := query.Count(&count).Error
	return count, err
}

func (r *Repository) CountLearningCards(userID string) (int64, error) {
	var count int64
	err := r.db.Table("card_schedules").
		Joins("JOIN cards ON cards.id = card_schedules.card_id").
		Where("card_schedules.user_id = ? AND cards.status = ? AND card_schedules.state IN ?", userID, "active", []string{"learning", "relearning"}).
		Count(&count).Error
	return count, err
}

func (r *Repository) CountWeakCards(userID string) (int64, error) {
	var count int64
	err := r.db.Table("card_schedules").
		Joins("JOIN cards ON cards.id = card_schedules.card_id").
		Where("card_schedules.user_id = ? AND cards.status = ? AND (card_schedules.state IN ? OR card_schedules.lapse_count > 0)", userID, "active", []string{"learning", "relearning"}).
		Count(&count).Error
	return count, err
}

func (r *Repository) ListDueCards(userID string, dueBefore time.Time, limit int) ([]DueCardRow, error) {
	type dueCardJoin struct {
		CardID          string
		DeckID          string
		DeckTitle       string
		OwnerUserID     string
		CardNoteID      string
		TemplateID      string
		TemplateOrdinal int
		CardType        string
		Front           string
		Back            string
		Tags            string
		SourceType      string
		SourceID        string
		SourceMetadata  string
		Status          string
		CardCreatedAt   time.Time
		CardUpdatedAt   time.Time
		DueAt           time.Time
		IntervalDays    int
		EaseFactor      float64
		RepetitionCount int
		LapseCount      int
		LearningStep    int
		State           string
		ScheduleUpdated time.Time
	}

	query := r.db.Table("card_schedules").
		Select(`
			card_schedules.card_id,
			card_schedules.user_id as owner_user_id,
			card_schedules.due_at,
			card_schedules.learning_step,
			card_schedules.interval_days,
			card_schedules.ease_factor,
			card_schedules.repetition_count,
			card_schedules.lapse_count,
			card_schedules.state,
			card_schedules.updated_at as schedule_updated,
			cards.deck_id,
			cards.owner_user_id,
			cards.card_note_id,
			cards.template_id,
			cards.template_ordinal,
			cards.card_type,
			cards.front,
			cards.back,
			cards.tags,
			cards.source_type,
			cards.source_id,
			cards.source_metadata,
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
				ID:              row.CardID,
				DeckID:          row.DeckID,
				OwnerUserID:     row.OwnerUserID,
				CardNoteID:      row.CardNoteID,
				TemplateID:      row.TemplateID,
				TemplateOrdinal: row.TemplateOrdinal,
				CardType:        row.CardType,
				Front:           row.Front,
				Back:            row.Back,
				Tags:            row.Tags,
				SourceType:      row.SourceType,
				SourceID:        row.SourceID,
				SourceMetadata:  row.SourceMetadata,
				Status:          row.Status,
				CreatedAt:       row.CardCreatedAt,
				UpdatedAt:       row.CardUpdatedAt,
			},
			Deck: cardmodel.Deck{
				ID:    row.DeckID,
				Title: row.DeckTitle,
			},
			Schedule: cardmodel.CardSchedule{
				CardID:          row.CardID,
				UserID:          row.OwnerUserID,
				DueAt:           row.DueAt,
				LearningStep:    row.LearningStep,
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

func (r *Repository) ListDueCardsByStates(userID string, dueBefore time.Time, states []string, limit int) ([]DueCardRow, error) {
	type dueCardJoin struct {
		CardID          string
		DeckID          string
		DeckTitle       string
		OwnerUserID     string
		CardNoteID      string
		TemplateID      string
		TemplateOrdinal int
		CardType        string
		Front           string
		Back            string
		Tags            string
		SourceType      string
		SourceID        string
		SourceMetadata  string
		Status          string
		CardCreatedAt   time.Time
		CardUpdatedAt   time.Time
		DueAt           time.Time
		LearningStep    int
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
			card_schedules.learning_step,
			card_schedules.interval_days,
			card_schedules.ease_factor,
			card_schedules.repetition_count,
			card_schedules.lapse_count,
			card_schedules.state,
			card_schedules.updated_at as schedule_updated,
			cards.deck_id,
			cards.owner_user_id,
			cards.card_note_id,
			cards.template_id,
			cards.template_ordinal,
			cards.card_type,
			cards.front,
			cards.back,
			cards.tags,
			cards.source_type,
			cards.source_id,
			cards.source_metadata,
			cards.status,
			cards.created_at as card_created_at,
			cards.updated_at as card_updated_at,
			decks.title as deck_title
		`).
		Joins("JOIN cards ON cards.id = card_schedules.card_id").
		Joins("JOIN decks ON decks.id = cards.deck_id").
		Where("card_schedules.user_id = ? AND card_schedules.due_at <= ? AND cards.status = ?", userID, dueBefore, "active")
	if len(states) > 0 {
		query = query.Where("card_schedules.state IN ?", states)
	}
	query = query.Order("card_schedules.due_at asc, cards.updated_at desc")
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
				ID:              row.CardID,
				DeckID:          row.DeckID,
				OwnerUserID:     row.OwnerUserID,
				CardNoteID:      row.CardNoteID,
				TemplateID:      row.TemplateID,
				TemplateOrdinal: row.TemplateOrdinal,
				CardType:        row.CardType,
				Front:           row.Front,
				Back:            row.Back,
				Tags:            row.Tags,
				SourceType:      row.SourceType,
				SourceID:        row.SourceID,
				SourceMetadata:  row.SourceMetadata,
				Status:          row.Status,
				CreatedAt:       row.CardCreatedAt,
				UpdatedAt:       row.CardUpdatedAt,
			},
			Deck: cardmodel.Deck{
				ID:    row.DeckID,
				Title: row.DeckTitle,
			},
			Schedule: cardmodel.CardSchedule{
				CardID:          row.CardID,
				UserID:          row.OwnerUserID,
				DueAt:           row.DueAt,
				LearningStep:    row.LearningStep,
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

func (r *Repository) ListWeakCards(userID string, limit int) ([]ReviewFeedbackRow, error) {
	type reviewFeedbackJoin struct {
		CardID          string
		DeckID          string
		DeckTitle       string
		OwnerUserID     string
		CardNoteID      string
		TemplateID      string
		TemplateOrdinal int
		CardType        string
		Front           string
		Back            string
		Tags            string
		SourceType      string
		SourceID        string
		SourceMetadata  string
		Status          string
		CardCreatedAt   time.Time
		CardUpdatedAt   time.Time
		DueAt           time.Time
		LearningStep    int
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
			card_schedules.learning_step,
			card_schedules.interval_days,
			card_schedules.ease_factor,
			card_schedules.repetition_count,
			card_schedules.lapse_count,
			card_schedules.state,
			card_schedules.updated_at as schedule_updated,
			cards.deck_id,
			cards.owner_user_id,
			cards.card_note_id,
			cards.template_id,
			cards.template_ordinal,
			cards.card_type,
			cards.front,
			cards.back,
			cards.tags,
			cards.source_type,
			cards.source_id,
			cards.source_metadata,
			cards.status,
			cards.created_at as card_created_at,
			cards.updated_at as card_updated_at,
			decks.title as deck_title
		`).
		Joins("JOIN cards ON cards.id = card_schedules.card_id").
		Joins("JOIN decks ON decks.id = cards.deck_id").
		Where("card_schedules.user_id = ? AND cards.status = ? AND (card_schedules.state IN ? OR card_schedules.lapse_count > 0)", userID, "active", []string{"learning", "relearning"}).
		Order("card_schedules.lapse_count desc, card_schedules.due_at asc, card_schedules.updated_at desc")
	if limit > 0 {
		query = query.Limit(limit)
	}

	var rows []reviewFeedbackJoin
	if err := query.Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]ReviewFeedbackRow, 0, len(rows))
	for _, row := range rows {
		result = append(result, ReviewFeedbackRow{
			Card: cardmodel.Card{
				ID:              row.CardID,
				DeckID:          row.DeckID,
				OwnerUserID:     row.OwnerUserID,
				CardNoteID:      row.CardNoteID,
				TemplateID:      row.TemplateID,
				TemplateOrdinal: row.TemplateOrdinal,
				CardType:        row.CardType,
				Front:           row.Front,
				Back:            row.Back,
				Tags:            row.Tags,
				SourceType:      row.SourceType,
				SourceID:        row.SourceID,
				SourceMetadata:  row.SourceMetadata,
				Status:          row.Status,
				CreatedAt:       row.CardCreatedAt,
				UpdatedAt:       row.CardUpdatedAt,
			},
			Deck: cardmodel.Deck{
				ID:    row.DeckID,
				Title: row.DeckTitle,
			},
			Schedule: cardmodel.CardSchedule{
				CardID:          row.CardID,
				UserID:          row.OwnerUserID,
				DueAt:           row.DueAt,
				LearningStep:    row.LearningStep,
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

func (r *Repository) ListSourceCards(userID string) ([]ReviewFeedbackRow, error) {
	type sourceFeedbackJoin struct {
		CardID          string
		DeckID          string
		DeckTitle       string
		OwnerUserID     string
		CardNoteID      string
		TemplateID      string
		TemplateOrdinal int
		CardType        string
		Front           string
		Back            string
		Tags            string
		SourceType      string
		SourceID        string
		SourceMetadata  string
		Status          string
		CardCreatedAt   time.Time
		CardUpdatedAt   time.Time
		DueAt           time.Time
		LearningStep    int
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
			card_schedules.learning_step,
			card_schedules.interval_days,
			card_schedules.ease_factor,
			card_schedules.repetition_count,
			card_schedules.lapse_count,
			card_schedules.state,
			card_schedules.updated_at as schedule_updated,
			cards.deck_id,
			cards.owner_user_id,
			cards.card_note_id,
			cards.template_id,
			cards.template_ordinal,
			cards.card_type,
			cards.front,
			cards.back,
			cards.tags,
			cards.source_type,
			cards.source_id,
			cards.source_metadata,
			cards.status,
			cards.created_at as card_created_at,
			cards.updated_at as card_updated_at,
			decks.title as deck_title
		`).
		Joins("JOIN cards ON cards.id = card_schedules.card_id").
		Joins("JOIN decks ON decks.id = cards.deck_id").
		Where("card_schedules.user_id = ? AND cards.status = ? AND cards.source_type <> '' AND cards.source_id <> ''", userID, "active").
		Order("cards.updated_at desc, card_schedules.updated_at desc")

	var rows []sourceFeedbackJoin
	if err := query.Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]ReviewFeedbackRow, 0, len(rows))
	for _, row := range rows {
		result = append(result, ReviewFeedbackRow{
			Card: cardmodel.Card{
				ID:              row.CardID,
				DeckID:          row.DeckID,
				OwnerUserID:     row.OwnerUserID,
				CardNoteID:      row.CardNoteID,
				TemplateID:      row.TemplateID,
				TemplateOrdinal: row.TemplateOrdinal,
				CardType:        row.CardType,
				Front:           row.Front,
				Back:            row.Back,
				Tags:            row.Tags,
				SourceType:      row.SourceType,
				SourceID:        row.SourceID,
				SourceMetadata:  row.SourceMetadata,
				Status:          row.Status,
				CreatedAt:       row.CardCreatedAt,
				UpdatedAt:       row.CardUpdatedAt,
			},
			Deck: cardmodel.Deck{
				ID:    row.DeckID,
				Title: row.DeckTitle,
			},
			Schedule: cardmodel.CardSchedule{
				CardID:          row.CardID,
				UserID:          row.OwnerUserID,
				DueAt:           row.DueAt,
				LearningStep:    row.LearningStep,
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

func (r *Repository) ListSourceCardsBySource(userID string, sourceType string, sourceID string) ([]ReviewFeedbackRow, error) {
	rows, err := r.ListSourceCards(userID)
	if err != nil {
		return nil, err
	}

	normalizedType := normalizeSourceTypeForMatch(sourceType)
	result := make([]ReviewFeedbackRow, 0, len(rows))
	for _, row := range rows {
		readModel := BuildPrimarySourceLinkReadModel(row.Card.SourceType, row.Card.SourceID, ParseSourceMetadata(row.Card.SourceMetadata))
		if readModel != nil && SourceLinkReadModelMatches(*readModel, normalizedType, sourceID) {
			result = append(result, row)
		}
	}

	return result, nil
}

func (r *Repository) ListReviewEventsSince(userID string, since time.Time) ([]ReviewEventRow, error) {
	return r.listReviewEvents(userID, "", "", since, 0)
}

func (r *Repository) ListReviewEventsBySource(userID string, sourceType string, sourceID string, limit int) ([]ReviewEventRow, error) {
	rows, err := r.listReviewEvents(userID, "", "", time.Time{}, 0)
	if err != nil {
		return nil, err
	}
	normalizedType := normalizeSourceTypeForMatch(sourceType)
	result := make([]ReviewEventRow, 0, len(rows))
	for _, row := range rows {
		readModel := BuildPrimarySourceLinkReadModel(row.Card.SourceType, row.Card.SourceID, ParseSourceMetadata(row.Card.SourceMetadata))
		if readModel == nil || !SourceLinkReadModelMatches(*readModel, normalizedType, sourceID) {
			continue
		}
		result = append(result, row)
		if limit > 0 && len(result) >= limit {
			break
		}
	}
	return result, nil
}

func (r *Repository) listReviewEvents(userID string, sourceType string, sourceID string, since time.Time, limit int) ([]ReviewEventRow, error) {
	type reviewEventJoin struct {
		ReviewID        string
		CardID          string
		UserID          string
		Rating          string
		ElapsedMs       int64
		ReviewedAt      time.Time
		DeckID          string
		DeckTitle       string
		OwnerUserID     string
		CardNoteID      string
		TemplateID      string
		TemplateOrdinal int
		CardType        string
		Front           string
		Back            string
		Tags            string
		SourceType      string
		SourceID        string
		SourceMetadata  string
		Status          string
		CardCreatedAt   time.Time
		CardUpdatedAt   time.Time
		DueAt           *time.Time
		LearningStep    *int
		IntervalDays    *int
		EaseFactor      *float64
		RepetitionCount *int
		LapseCount      *int
		State           *string
		ScheduleUpdated *time.Time
	}

	query := r.db.Table("card_reviews").
		Select(`
			card_reviews.id as review_id,
			card_reviews.card_id,
			card_reviews.user_id,
			card_reviews.rating,
			card_reviews.elapsed_ms,
			card_reviews.reviewed_at,
			cards.deck_id,
			cards.owner_user_id,
			cards.card_note_id,
			cards.template_id,
			cards.template_ordinal,
			cards.card_type,
			cards.front,
			cards.back,
			cards.tags,
			cards.source_type,
			cards.source_id,
			cards.source_metadata,
			cards.status,
			cards.created_at as card_created_at,
			cards.updated_at as card_updated_at,
			decks.title as deck_title,
			card_schedules.due_at,
			card_schedules.learning_step,
			card_schedules.interval_days,
			card_schedules.ease_factor,
			card_schedules.repetition_count,
			card_schedules.lapse_count,
			card_schedules.state,
			card_schedules.updated_at as schedule_updated
		`).
		Joins("JOIN cards ON cards.id = card_reviews.card_id").
		Joins("JOIN decks ON decks.id = cards.deck_id").
		Joins("LEFT JOIN card_schedules ON card_schedules.card_id = cards.id AND card_schedules.user_id = card_reviews.user_id").
		Where("card_reviews.user_id = ? AND cards.owner_user_id = ?", userID, userID).
		Order("card_reviews.reviewed_at desc")
	if !since.IsZero() {
		query = query.Where("card_reviews.reviewed_at >= ?", since)
	}
	if sourceType != "" || sourceID != "" {
		query = query.Where("cards.source_type = ? AND cards.source_id = ?", sourceType, sourceID)
	}
	if limit > 0 {
		query = query.Limit(limit)
	}

	var rows []reviewEventJoin
	if err := query.Scan(&rows).Error; err != nil {
		return nil, err
	}

	result := make([]ReviewEventRow, 0, len(rows))
	for _, row := range rows {
		event := ReviewEventRow{
			Review: cardmodel.CardReview{
				ID:         row.ReviewID,
				CardID:     row.CardID,
				UserID:     row.UserID,
				Rating:     row.Rating,
				ElapsedMs:  row.ElapsedMs,
				ReviewedAt: row.ReviewedAt,
			},
			Card: cardmodel.Card{
				ID:              row.CardID,
				DeckID:          row.DeckID,
				OwnerUserID:     row.OwnerUserID,
				CardNoteID:      row.CardNoteID,
				TemplateID:      row.TemplateID,
				TemplateOrdinal: row.TemplateOrdinal,
				CardType:        row.CardType,
				Front:           row.Front,
				Back:            row.Back,
				Tags:            row.Tags,
				SourceType:      row.SourceType,
				SourceID:        row.SourceID,
				SourceMetadata:  row.SourceMetadata,
				Status:          row.Status,
				CreatedAt:       row.CardCreatedAt,
				UpdatedAt:       row.CardUpdatedAt,
			},
			Deck: cardmodel.Deck{
				ID:    row.DeckID,
				Title: row.DeckTitle,
			},
		}
		if row.DueAt != nil {
			learningStep := valueOrZero(row.LearningStep)
			intervalDays := valueOrZero(row.IntervalDays)
			easeFactor := valueOrZeroFloat(row.EaseFactor)
			repetitionCount := valueOrZero(row.RepetitionCount)
			lapseCount := valueOrZero(row.LapseCount)
			state := valueOrEmpty(row.State)
			updatedAt := row.ReviewedAt
			if row.ScheduleUpdated != nil {
				updatedAt = *row.ScheduleUpdated
			}
			event.Schedule = &cardmodel.CardSchedule{
				CardID:          row.CardID,
				UserID:          row.UserID,
				DueAt:           *row.DueAt,
				LearningStep:    learningStep,
				IntervalDays:    intervalDays,
				EaseFactor:      easeFactor,
				RepetitionCount: repetitionCount,
				LapseCount:      lapseCount,
				State:           state,
				UpdatedAt:       updatedAt,
			}
		}
		result = append(result, event)
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
	sourceMetadata := parseSourceMetadata(card.SourceMetadata)
	return carddto.CardPayload{
		ID:                card.ID,
		DeckID:            card.DeckID,
		OwnerUserID:       card.OwnerUserID,
		CardNoteID:        card.CardNoteID,
		TemplateID:        card.TemplateID,
		TemplateOrdinal:   card.TemplateOrdinal,
		CardType:          card.CardType,
		Front:             card.Front,
		Back:              card.Back,
		Tags:              DecodeTags(card.Tags),
		SourceType:        card.SourceType,
		SourceID:          card.SourceID,
		SourceMetadata:    sourceMetadata,
		PrimarySourceLink: BuildPrimarySourceLinkPayload(card.SourceType, card.SourceID, sourceMetadata),
		SourceLinks:       BuildSourceLinksPayload(card.SourceType, card.SourceID, sourceMetadata),
		Status:            card.Status,
		CreatedAt:         card.CreatedAt.Format(time.RFC3339),
		UpdatedAt:         card.UpdatedAt.Format(time.RFC3339),
	}
}

func BuildCardNotePayload(cardNote cardmodel.CardNote) carddto.CardNotePayload {
	fields := parseStringMap(cardNote.FieldsJSON)
	sourceLinks := parseSourceLinks(cardNote.SourceLinksJSON)
	primarySourceLink := firstSourceLink(sourceLinks)
	if primarySourceLink == nil && cardNote.PrimarySourceType != "" && cardNote.PrimarySourceID != "" {
		primarySourceLink = &carddto.SourceLinkPayload{
			SourceType: cardNote.PrimarySourceType,
			SourceID:   cardNote.PrimarySourceID,
		}
	}
	return carddto.CardNotePayload{
		ID:                 cardNote.ID,
		DeckID:             cardNote.DeckID,
		OwnerUserID:        cardNote.OwnerUserID,
		NoteTypeID:         cardNote.NoteTypeID,
		NoteTypeCode:       cardNote.NoteTypeCode,
		PrimarySourceLink:  primarySourceLink,
		SourceLinks:        sourceLinks,
		Fields:             fields,
		GeneratedCardCount: cardNote.GeneratedCardCount,
		Status:             cardNote.Status,
		CreatedAt:          cardNote.CreatedAt.Format(time.RFC3339),
		UpdatedAt:          cardNote.UpdatedAt.Format(time.RFC3339),
	}
}

func ParseSourceMetadata(raw string) map[string]any {
	return parseSourceMetadata(raw)
}

func BuildSchedulePayload(schedule cardmodel.CardSchedule) carddto.CardSchedulePayload {
	return carddto.CardSchedulePayload{
		CardID:          schedule.CardID,
		UserID:          schedule.UserID,
		DueAt:           schedule.DueAt.Format(time.RFC3339),
		LearningStep:    schedule.LearningStep,
		IntervalDays:    schedule.IntervalDays,
		EaseFactor:      schedule.EaseFactor,
		RepetitionCount: schedule.RepetitionCount,
		LapseCount:      schedule.LapseCount,
		State:           schedule.State,
		UpdatedAt:       schedule.UpdatedAt.Format(time.RFC3339),
	}
}

func EncodeTags(tags []string) string {
	if len(tags) == 0 {
		return "[]"
	}

	raw, err := json.Marshal(tags)
	if err != nil {
		return "[]"
	}

	return string(raw)
}

func DecodeTags(raw string) []string {
	if raw == "" {
		return []string{}
	}

	var tags []string
	if err := json.Unmarshal([]byte(raw), &tags); err != nil {
		return []string{}
	}

	return tags
}

func normalizeSourceTypeForMatch(sourceType string) string {
	return strings.ToLower(strings.TrimSpace(strings.ReplaceAll(sourceType, "_", "-")))
}

func valueOrZero(value *int) int {
	if value == nil {
		return 0
	}
	return *value
}

func valueOrZeroFloat(value *float64) float64 {
	if value == nil {
		return 0
	}
	return *value
}

func valueOrEmpty(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func MarshalStringMap(values map[string]string) string {
	if len(values) == 0 {
		return ""
	}
	raw, err := json.Marshal(values)
	if err != nil {
		return ""
	}
	return string(raw)
}

func MarshalSourceLinks(values []carddto.SourceLinkPayload) string {
	if len(values) == 0 {
		return ""
	}
	raw, err := json.Marshal(values)
	if err != nil {
		return ""
	}
	return string(raw)
}

func parseStringMap(raw string) map[string]string {
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	var values map[string]string
	if err := json.Unmarshal([]byte(raw), &values); err != nil {
		return nil
	}
	if len(values) == 0 {
		return nil
	}
	return values
}

func parseSourceLinks(raw string) []carddto.SourceLinkPayload {
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	var values []carddto.SourceLinkPayload
	if err := json.Unmarshal([]byte(raw), &values); err != nil {
		return nil
	}
	if len(values) == 0 {
		return nil
	}
	return values
}

func firstSourceLink(values []carddto.SourceLinkPayload) *carddto.SourceLinkPayload {
	if len(values) == 0 {
		return nil
	}
	first := values[0]
	return &first
}

func buildTagSearchPattern(tag string) string {
	escaped := strings.ReplaceAll(tag, "\\", "\\\\")
	escaped = strings.ReplaceAll(escaped, "\"", "\\\"")
	return "%\"" + escaped + "\"%"
}
