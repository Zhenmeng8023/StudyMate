package service

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"gorm.io/gorm"
	adminrepo "studymate/backend/internal/modules/admin/repository"
	aiservice "studymate/backend/internal/modules/ai/service"
	carddto "studymate/backend/internal/modules/card/dto"
	cardmodel "studymate/backend/internal/modules/card/model"
	cardrepo "studymate/backend/internal/modules/card/repository"
	"studymate/backend/internal/pkg/apperrors"
)

const (
	defaultDailyNewLimit    = 20
	defaultDailyReviewLimit = 200
	todayQueuePreviewLimit  = 40
)

type Service struct {
	repository *cardrepo.Repository
	auditLogs  *adminrepo.AuditLogRepository
	aiTasks    *aiservice.Service
	now        func() time.Time
	scheduler  Scheduler
}

func NewService(repository *cardrepo.Repository, auditLogs *adminrepo.AuditLogRepository, aiTasks *aiservice.Service) *Service {
	return &Service{
		repository: repository,
		auditLogs:  auditLogs,
		aiTasks:    aiTasks,
		now:        time.Now,
		scheduler:  SM2Scheduler{},
	}
}

func (s *Service) ListDecks(ownerUserID string) ([]carddto.DeckPayload, error) {
	decks, err := s.repository.ListDecksByOwner(ownerUserID)
	if err != nil {
		return nil, apperrors.Internal("读取卡组列表失败")
	}

	return decks, nil
}

func (s *Service) CreateDeck(ownerUserID string, request carddto.CreateDeckRequest) (*carddto.DeckPayload, error) {
	title := strings.TrimSpace(request.Title)
	if title == "" {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_deck_title", "卡组标题不能为空")
	}

	deck := &cardmodel.Deck{
		OwnerUserID: ownerUserID,
		Title:       title,
		Description: strings.TrimSpace(request.Description),
		Visibility:  normalizeDeckVisibility(request.Visibility),
		CardCount:   0,
	}

	if err := s.repository.CreateDeck(deck); err != nil {
		return nil, apperrors.Internal("创建卡组失败")
	}

	_ = s.auditLogs.Create(ownerUserID, "card.deck.create", "deck", map[string]any{
		"deckId": deck.ID,
	})

	payload := cardrepo.BuildDeckPayload(*deck)
	return &payload, nil
}

func (s *Service) ListCards(ownerUserID string, deckID string, request carddto.ListCardsQuery) ([]carddto.CardPayload, error) {
	deck, err := s.requireOwnerDeck(ownerUserID, deckID)
	if err != nil {
		return nil, err
	}

	status, ok := normalizeCardListStatus(request.Status)
	if !ok {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_card_list_status", "卡片列表状态筛选必须是 all、active、suspended 或 buried")
	}
	dueBucket, ok := normalizeCardListDueBucket(request.DueBucket)
	if !ok {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_card_due_bucket", "到期时间筛选必须是 all、due 或 upcoming")
	}
	queueState, ok := normalizeCardQueueState(request.QueueState)
	if !ok {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_card_queue_state", "????????????????? all??ew??earning??eview??elearning??uspended ??buried")
	}

	cards, err := s.repository.ListCardsByDeck(deck.ID, ownerUserID, cardrepo.ListCardsFilter{
		Query:      strings.TrimSpace(request.Query),
		Status:     status,
		QueueState: queueState,
		SourceType: strings.TrimSpace(request.SourceType),
		SourceID:   strings.TrimSpace(request.SourceID),
		DueBucket:  dueBucket,
		Tag:        strings.TrimSpace(request.Tag),
		Now:        s.now().UTC(),
	})
	if err != nil {
		return nil, apperrors.Internal("读取卡片列表失败")
	}

	return cards, nil
}

func (s *Service) CreateCard(ownerUserID string, deckID string, request carddto.CreateCardRequest) (*carddto.CardPayload, error) {
	deck, err := s.requireOwnerDeck(ownerUserID, deckID)
	if err != nil {
		return nil, err
	}

	cards, err := s.createCardsForDeck(ownerUserID, deck, []carddto.CreateCardRequest{request})
	if err != nil {
		return nil, err
	}

	_ = s.auditLogs.Create(ownerUserID, "card.create", "card", map[string]any{
		"cardId": cards[0].ID,
		"deckId": deck.ID,
	})

	return &cards[0], nil
}

func (s *Service) BulkCreateCards(ownerUserID string, deckID string, requests []carddto.CreateCardRequest) ([]carddto.CardPayload, error) {
	if len(requests) == 0 {
		return nil, apperrors.New(http.StatusBadRequest, "empty_card_requests", "至少要确认一张卡片草稿")
	}

	deck, err := s.requireOwnerDeck(ownerUserID, deckID)
	if err != nil {
		return nil, err
	}

	cards, err := s.createCardsForDeck(ownerUserID, deck, requests)
	if err != nil {
		return nil, err
	}

	_ = s.auditLogs.Create(ownerUserID, "card.bulk_create", "deck", map[string]any{
		"deckId": deck.ID,
		"count":  len(cards),
	})

	return cards, nil
}

func (s *Service) ExportDeck(ownerUserID string, deckID string, format string) (*carddto.DeckExportPayload, error) {
	deck, err := s.requireOwnerDeck(ownerUserID, deckID)
	if err != nil {
		return nil, err
	}

	normalizedFormat, ok := normalizeDeckExportFormat(format)
	if !ok {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_deck_export_format", "导出格式必须是 json 或 csv")
	}

	cards, err := s.repository.ListCardsByDeck(deck.ID, ownerUserID, cardrepo.ListCardsFilter{})
	if err != nil {
		return nil, apperrors.Internal("读取卡组卡片失败")
	}

	artifact, err := buildDeckExportArtifact(deck.Title, cards, normalizedFormat, s.now().UTC())
	if err != nil {
		return nil, err
	}

	_ = s.auditLogs.Create(ownerUserID, "card.deck.export", "deck", map[string]any{
		"deckId": deck.ID,
		"format": normalizedFormat,
		"count":  len(cards),
	})

	return artifact, nil
}

func (s *Service) ImportDeck(ownerUserID string, deckID string, request carddto.ImportDeckRequest) (*carddto.DeckImportPayload, error) {
	deck, err := s.requireOwnerDeck(ownerUserID, deckID)
	if err != nil {
		return nil, err
	}

	existingCards, err := s.repository.ListCardsByDeck(deck.ID, ownerUserID, cardrepo.ListCardsFilter{})
	if err != nil {
		return nil, apperrors.Internal("读取卡组卡片失败")
	}
	analysis, err := analyzeDeckImportRequest(request, existingCards)
	if err != nil {
		return nil, err
	}
	if analysis.TotalCount == 0 {
		return nil, apperrors.New(http.StatusBadRequest, "empty_deck_import", "导入文件中没有可用卡片")
	}
	if analysis.TotalCount > 200 {
		return nil, apperrors.New(http.StatusBadRequest, "deck_import_too_large", "单次最多导入 200 张卡片")
	}
	if request.PreviewOnly {
		return buildDeckImportPayload(true, analysis, 0), nil
	}
	if len(analysis.ReadyCards) == 0 {
		return buildDeckImportPayload(false, analysis, 0), nil
	}

	created, err := s.createCardsForDeck(ownerUserID, deck, analysis.ReadyCards)
	if err != nil {
		return nil, err
	}

	_ = s.auditLogs.Create(ownerUserID, "card.deck.import", "deck", map[string]any{
		"deckId":         deck.ID,
		"count":          len(created),
		"duplicateCount": len(analysis.DuplicateSamples),
		"failedCount":    len(analysis.FailureSamples),
	})

	return buildDeckImportPayload(false, analysis, len(created)), nil
}

func (s *Service) TodayQueue(ownerUserID string) (*carddto.ReviewQueuePayload, error) {
	now := s.now().UTC()
	learningCount, err := s.repository.CountDueCardsByStates(ownerUserID, now, []string{"learning"})
	if err != nil {
		return nil, apperrors.Internal("???????????????")
	}
	relearningCount, err := s.repository.CountDueCardsByStates(ownerUserID, now, []string{"relearning"})
	if err != nil {
		return nil, apperrors.Internal("???????????????")
	}
	reviewCount, err := s.repository.CountDueCardsByStates(ownerUserID, now, []string{"review"})
	if err != nil {
		return nil, apperrors.Internal("???????????????")
	}
	newCount, err := s.repository.CountDueCardsByStates(ownerUserID, now, []string{"new"})
	if err != nil {
		return nil, apperrors.Internal("???????????????")
	}

	queuedRows := make([]cardrepo.DueCardRow, 0, todayQueuePreviewLimit)
	appendStateRows := func(states []string, limit int) error {
		if len(queuedRows) >= todayQueuePreviewLimit || limit == 0 {
			return nil
		}
		if len(queuedRows)+limit > todayQueuePreviewLimit {
			limit = todayQueuePreviewLimit - len(queuedRows)
		}
		rows, err := s.repository.ListDueCardsByStates(ownerUserID, now, states, limit)
		if err != nil {
			return err
		}
		queuedRows = append(queuedRows, rows...)
		return nil
	}

	if err := appendStateRows([]string{"learning"}, todayQueuePreviewLimit); err != nil {
		return nil, apperrors.Internal("???????????????")
	}
	if err := appendStateRows([]string{"relearning"}, todayQueuePreviewLimit); err != nil {
		return nil, apperrors.Internal("???????????????")
	}
	if err := appendStateRows([]string{"review"}, defaultDailyReviewLimit); err != nil {
		return nil, apperrors.Internal("???????????????")
	}
	if err := appendStateRows([]string{"new"}, defaultDailyNewLimit); err != nil {
		return nil, apperrors.Internal("???????????????")
	}

	items := make([]carddto.ReviewQueueItemPayload, 0, len(queuedRows))
	for _, row := range queuedRows {
		items = append(items, carddto.ReviewQueueItemPayload{
			DeckTitle: row.Deck.Title,
			Card:      cardrepo.BuildCardPayload(row.Card),
			Schedule:  cardrepo.BuildSchedulePayload(row.Schedule),
		})
	}

	dueCount := learningCount + relearningCount
	if reviewCount > defaultDailyReviewLimit {
		dueCount += int64(defaultDailyReviewLimit)
	} else {
		dueCount += reviewCount
	}
	if newCount > defaultDailyNewLimit {
		dueCount += int64(defaultDailyNewLimit)
	} else {
		dueCount += newCount
	}

	return &carddto.ReviewQueuePayload{
		DueCount:        dueCount,
		NewCount:        newCount,
		LearningCount:   learningCount,
		ReviewCount:     reviewCount,
		RelearningCount: relearningCount,
		NewLimit:        defaultDailyNewLimit,
		ReviewLimit:     defaultDailyReviewLimit,
		Items:           items,
	}, nil
}

func (s *Service) ReviewFeedback(ownerUserID string) (*carddto.ReviewFeedbackPayload, error) {
	now := s.now().UTC()
	dueCount, err := s.repository.CountDueCards(ownerUserID, now)
	if err != nil {
		return nil, apperrors.Internal("读取复习反馈统计失败")
	}

	learningCount, err := s.repository.CountLearningCards(ownerUserID)
	if err != nil {
		return nil, apperrors.Internal("读取复习反馈统计失败")
	}

	weakCardCount, err := s.repository.CountWeakCards(ownerUserID)
	if err != nil {
		return nil, apperrors.Internal("读取复习反馈统计失败")
	}

	rows, err := s.repository.ListWeakCards(ownerUserID, 5)
	if err != nil {
		return nil, apperrors.Internal("读取复习反馈卡片失败")
	}
	sourceRows, err := s.repository.ListSourceCards(ownerUserID)
	if err != nil {
		return nil, apperrors.Internal("读取复习反馈来源摘要失败")
	}

	weakCards := make([]carddto.ReviewFeedbackCardPayload, 0, len(rows))
	for _, row := range rows {
		sourceMetadata := cardrepo.ParseSourceMetadata(row.Card.SourceMetadata)
		readModel := cardrepo.BuildPrimarySourceLinkReadModel(row.Card.SourceType, row.Card.SourceID, sourceMetadata)
		sourceType := strings.TrimSpace(row.Card.SourceType)
		sourceID := strings.TrimSpace(row.Card.SourceID)
		primarySourceLink := cardrepo.BuildPrimarySourceLinkPayload(row.Card.SourceType, row.Card.SourceID, sourceMetadata)
		sourceLinks := cardrepo.BuildSourceLinksPayload(row.Card.SourceType, row.Card.SourceID, sourceMetadata)
		if readModel != nil {
			sourceType = readModel.SourceType
			sourceID = readModel.SourceID
			sourceMetadata = readModel.SourceMetadata
			primarySourceLink = readModel.PrimarySourceLink
			sourceLinks = readModel.SourceLinks
		}
		weakCards = append(weakCards, carddto.ReviewFeedbackCardPayload{
			CardID:            row.Card.ID,
			DeckID:            row.Deck.ID,
			DeckTitle:         row.Deck.Title,
			Front:             row.Card.Front,
			SourceType:        sourceType,
			SourceID:          sourceID,
			SourceMetadata:    sourceMetadata,
			PrimarySourceLink: primarySourceLink,
			SourceLinks:       sourceLinks,
			DueAt:             row.Schedule.DueAt.Format(time.RFC3339),
			LapseCount:        row.Schedule.LapseCount,
			RepetitionCount:   row.Schedule.RepetitionCount,
			State:             row.Schedule.State,
		})
	}

	sourceSummaries, err := s.sourceSummariesWithReviewTimes(ownerUserID, sourceRows, now)
	if err != nil {
		return nil, apperrors.Internal("读取最近复习时间失败")
	}

	return &carddto.ReviewFeedbackPayload{
		DueCount:        dueCount,
		LearningCount:   learningCount,
		WeakCardCount:   weakCardCount,
		WeakCards:       weakCards,
		SourceSummaries: sourceSummaries,
		WeakSources:     buildWeakSourceSummaries(sourceSummaries),
	}, nil
}

func (s *Service) ReviewInsights(ownerUserID string) (*carddto.ReviewInsightsPayload, error) {
	now := s.now().UTC()
	start := beginningOfUTCDay(now).AddDate(0, 0, -6)
	events, err := s.repository.ListReviewEventsSince(ownerUserID, start)
	if err != nil {
		return nil, apperrors.Internal("读取学习趋势失败")
	}
	sourceRows, err := s.repository.ListSourceCards(ownerUserID)
	if err != nil {
		return nil, apperrors.Internal("读取学习趋势来源失败")
	}
	sources, err := s.sourceSummariesWithReviewTimes(ownerUserID, sourceRows, now)
	if err != nil {
		return nil, apperrors.Internal("读取最近复习时间失败")
	}
	days := buildReviewInsightDays(events, start)
	trends := buildReviewInsightSourceTrends(events, sources, start)

	return &carddto.ReviewInsightsPayload{
		Days:         days,
		SourceTrends: trends,
		Sources:      sources,
	}, nil
}

func (s *Service) SourceProfile(ownerUserID string, query carddto.SourceProfileQuery) (*carddto.SourceProfilePayload, error) {
	sourceType := normalizeFeedbackSourceType(query.SourceType)
	sourceID := strings.TrimSpace(query.SourceID)
	if sourceType == "" || sourceID == "" {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_source_profile_query", "来源类型和来源 ID 不能为空")
	}

	sourceRows, err := s.repository.ListSourceCardsBySource(ownerUserID, sourceType, sourceID)
	if err != nil {
		return nil, apperrors.Internal("读取来源档案失败")
	}
	allCardNotes, err := s.repository.ListCardNotesByOwner(ownerUserID)
	if err != nil {
		return nil, apperrors.Internal("读取来源 CardNote 失败")
	}
	reviews, err := s.repository.ListReviewEventsBySource(ownerUserID, sourceType, sourceID, 8)
	if err != nil {
		return nil, apperrors.Internal("读取来源复习记录失败")
	}

	now := s.now().UTC()
	summaries := buildSourceSummaries(sourceRows, now)
	var summary carddto.ReviewFeedbackSourcePayload
	if len(summaries) > 0 {
		summary = summaries[0]
	} else {
		summary = carddto.ReviewFeedbackSourcePayload{
			SourceType:     sourceType,
			SourceID:       sourceID,
			MasteryLevel:   "building",
			MasteryScore:   0,
			TotalCardCount: 0,
		}
	}

	generatedCards := make([]carddto.GeneratedCardPayload, 0, len(sourceRows))
	queueStates := map[string]int{
		"new":        0,
		"learning":   0,
		"review":     0,
		"relearning": 0,
		"suspended":  0,
		"buried":     0,
	}
	for _, row := range sourceRows {
		card := cardrepo.BuildCardPayload(row.Card)
		schedule := cardrepo.BuildSchedulePayload(row.Schedule)
		card.Schedule = &schedule
		generatedCards = append(generatedCards, card)
		if row.Card.Status == "suspended" || row.Card.Status == "buried" {
			queueStates[row.Card.Status]++
			continue
		}
		state := strings.TrimSpace(row.Schedule.State)
		if state == "" {
			state = "new"
		}
		queueStates[state]++
	}

	cardNotes := make([]carddto.ManagedCardNotePayload, 0)
	for _, cardNote := range allCardNotes {
		if !cardNoteMatchesSource(cardrepo.BuildCardNotePayload(cardNote), sourceType, sourceID) {
			continue
		}
		managed, err := s.buildManagedCardNotePayload(ownerUserID, cardNote)
		if err != nil {
			return nil, err
		}
		cardNotes = append(cardNotes, *managed)
	}

	recentReviews := make([]carddto.SourceProfileReviewPayload, 0, len(reviews))
	lastReviewedAt := ""
	for index, row := range reviews {
		if index == 0 {
			lastReviewedAt = row.Review.ReviewedAt.Format(time.RFC3339)
		}
		recentReviews = append(recentReviews, carddto.SourceProfileReviewPayload{
			ReviewID:   row.Review.ID,
			CardID:     row.Review.CardID,
			Rating:     row.Review.Rating,
			ReviewedAt: row.Review.ReviewedAt.Format(time.RFC3339),
		})
	}

	primarySourceLink := summary.PrimarySourceLink
	sourceLinks := summary.SourceLinks
	if primarySourceLink == nil {
		primarySourceLink, sourceLinks = sourceLinksFromMatchedCardNotes(cardNotes, sourceType, sourceID)
	}
	title, excerpt, locator := sourceProfileSummary(primarySourceLink, sourceLinks, generatedCards, cardNotes)

	return &carddto.SourceProfilePayload{
		SourceType:        sourceType,
		SourceID:          sourceID,
		Title:             title,
		Excerpt:           excerpt,
		Locator:           locator,
		Target:            "",
		CardNotes:         cardNotes,
		GeneratedCards:    generatedCards,
		QueueStates:       queueStates,
		MasteryScore:      summary.MasteryScore,
		MasteryLevel:      summary.MasteryLevel,
		DueCount:          summary.DueCount,
		LearningCount:     summary.LearningCount,
		WeakCardCount:     summary.WeakCardCount,
		LastReviewedAt:    lastReviewedAt,
		RecentReviews:     recentReviews,
		PrimarySourceLink: primarySourceLink,
		SourceLinks:       sourceLinks,
	}, nil
}

func sourceLinksFromMatchedCardNotes(cardNotes []carddto.ManagedCardNotePayload, sourceType string, sourceID string) (*carddto.SourceLinkPayload, []carddto.SourceLinkPayload) {
	for _, cardNote := range cardNotes {
		for _, readModel := range cardrepo.BuildSourceLinkReadModels(cardNote.CardNote.PrimarySourceLink, cardNote.CardNote.SourceLinks, "", "", nil) {
			if cardrepo.SourceLinkReadModelMatches(readModel, sourceType, sourceID) {
				return readModel.PrimarySourceLink, readModel.SourceLinks
			}
		}
	}
	return nil, nil
}

func (s *Service) requireOwnerDeck(ownerUserID string, deckID string) (*cardmodel.Deck, error) {
	deck, err := s.repository.FindDeckByID(deckID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "deck_not_found", "卡组不存在")
		}
		return nil, apperrors.Internal("读取卡组失败")
	}
	if deck.OwnerUserID != ownerUserID {
		return nil, apperrors.New(http.StatusForbidden, "deck_forbidden", "你没有权限访问这个卡组")
	}

	return deck, nil
}

func (s *Service) requireOwnerCard(ownerUserID string, cardID string) (*cardmodel.Card, error) {
	card, err := s.repository.FindCardByID(cardID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "card_not_found", "卡片不存在")
		}
		return nil, apperrors.Internal("读取卡片失败")
	}
	if card.OwnerUserID != ownerUserID {
		return nil, apperrors.New(http.StatusForbidden, "card_forbidden", "你没有权限访问这张卡片")
	}

	return card, nil
}

func normalizeDeckVisibility(value string) string {
	if strings.EqualFold(strings.TrimSpace(value), "public") {
		return "public"
	}

	return "private"
}

func normalizeCardType(value string) string {
	trimmed := strings.ToLower(strings.TrimSpace(value))
	if trimmed == "" {
		return "basic"
	}

	return trimmed
}

func normalizeCardStatus(value string) (string, bool) {
	trimmed := strings.ToLower(strings.TrimSpace(value))
	switch trimmed {
	case "active", "suspended", "buried":
		return trimmed, true
	default:
		return "", false
	}
}

func normalizeCardListStatus(value string) (string, bool) {
	trimmed := strings.ToLower(strings.TrimSpace(value))
	switch trimmed {
	case "", "all":
		return "all", true
	case "active", "suspended", "buried":
		return trimmed, true
	default:
		return "", false
	}
}

func normalizeCardListDueBucket(value string) (string, bool) {
	trimmed := strings.ToLower(strings.TrimSpace(value))
	switch trimmed {
	case "", "all":
		return "all", true
	case "due", "upcoming":
		return trimmed, true
	default:
		return "", false
	}
}

func normalizeCardQueueState(value string) (string, bool) {
	trimmed := strings.ToLower(strings.TrimSpace(value))
	switch trimmed {
	case "", "all":
		return "all", true
	case "new", "learning", "review", "relearning", "suspended", "buried":
		return trimmed, true
	default:
		return "", false
	}
}

func normalizeDeckExportFormat(value string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "", "json":
		return "json", true
	case "csv":
		return "csv", true
	default:
		return "", false
	}
}

func maxElapsed(value int64) int64 {
	if value < 0 {
		return 0
	}

	return value
}

func buildRestoredSchedule(current cardmodel.CardSchedule, cardID string, userID string, payload carddto.CardSchedulePayload) (cardmodel.CardSchedule, error) {
	if cardRef := strings.TrimSpace(payload.CardID); cardRef != "" && cardRef != cardID {
		return current, apperrors.New(http.StatusBadRequest, "invalid_previous_schedule", "上一条评分快照与当前卡片不匹配")
	}
	if userRef := strings.TrimSpace(payload.UserID); userRef != "" && userRef != userID {
		return current, apperrors.New(http.StatusBadRequest, "invalid_previous_schedule", "上一条评分快照与当前用户不匹配")
	}

	dueAt, err := parseScheduleTimestamp(payload.DueAt)
	if err != nil {
		return current, err
	}
	updatedAt, err := parseScheduleTimestamp(payload.UpdatedAt)
	if err != nil {
		return current, err
	}

	state, ok := normalizeScheduleState(payload.State)
	if !ok {
		return current, apperrors.New(http.StatusBadRequest, "invalid_previous_schedule", "上一条评分快照包含未知的复习状态")
	}

	current.CardID = cardID
	current.UserID = userID
	current.DueAt = dueAt
	current.LearningStep = payload.LearningStep
	current.IntervalDays = payload.IntervalDays
	current.EaseFactor = payload.EaseFactor
	current.RepetitionCount = payload.RepetitionCount
	current.LapseCount = payload.LapseCount
	current.State = state
	current.UpdatedAt = updatedAt

	return current, nil
}

func parseScheduleTimestamp(value string) (time.Time, error) {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return time.Time{}, apperrors.New(http.StatusBadRequest, "invalid_previous_schedule", "上一条评分快照缺少时间字段")
	}

	parsed, err := time.Parse(time.RFC3339, trimmed)
	if err != nil {
		return time.Time{}, apperrors.New(http.StatusBadRequest, "invalid_previous_schedule", "上一条评分快照包含无效的时间格式")
	}

	return parsed.UTC(), nil
}

func normalizeScheduleState(value string) (string, bool) {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "new", "learning", "review", "relearning":
		return strings.ToLower(strings.TrimSpace(value)), true
	default:
		return "", false
	}
}

func (s *Service) createCardsForDeck(ownerUserID string, deck *cardmodel.Deck, requests []carddto.CreateCardRequest) ([]carddto.CardPayload, error) {
	now := s.now().UTC()
	created := make([]carddto.CardPayload, 0, len(requests))
	draftIDs := make([]string, 0, len(requests))

	for _, request := range requests {
		front := strings.TrimSpace(request.Front)
		back := strings.TrimSpace(request.Back)
		if front == "" || back == "" {
			return nil, apperrors.New(http.StatusBadRequest, "invalid_card_content", "卡片正反面都需要内容")
		}

		card := &cardmodel.Card{
			DeckID:         deck.ID,
			OwnerUserID:    ownerUserID,
			CardType:       normalizeCardType(request.CardType),
			Front:          front,
			Back:           back,
			Tags:           cardrepo.EncodeTags(normalizeCardTags(request.Tags)),
			SourceType:     strings.TrimSpace(request.SourceType),
			SourceID:       strings.TrimSpace(request.SourceID),
			SourceMetadata: cardrepo.MarshalSourceMetadata(request.SourceMetadata),
			Status:         "active",
		}
		if err := s.repository.CreateCard(card); err != nil {
			return nil, apperrors.Internal("创建卡片失败")
		}

		schedule := &cardmodel.CardSchedule{
			CardID:          card.ID,
			UserID:          ownerUserID,
			DueAt:           now,
			LearningStep:    0,
			IntervalDays:    0,
			EaseFactor:      2.5,
			RepetitionCount: 0,
			LapseCount:      0,
			State:           "new",
			UpdatedAt:       now,
		}
		if err := s.repository.SaveSchedule(schedule); err != nil {
			return nil, apperrors.Internal("初始化复习计划失败")
		}
		if strings.TrimSpace(request.DraftID) != "" {
			draftIDs = append(draftIDs, strings.TrimSpace(request.DraftID))
		}

		created = append(created, cardrepo.BuildCardPayload(*card))
	}

	if err := s.repository.AdjustDeckCardCount(ownerUserID, deck.ID, int64(len(created))); err != nil {
		return nil, apperrors.Internal("更新卡组统计失败")
	}
	if s.aiTasks != nil && len(draftIDs) > 0 {
		_ = s.aiTasks.ConfirmDrafts(ownerUserID, draftIDs)
	}

	return created, nil
}

func normalizeCardTags(values []string) []string {
	if len(values) == 0 {
		return nil
	}

	seen := make(map[string]struct{}, len(values))
	normalized := make([]string, 0, len(values))
	for _, value := range values {
		tag := strings.TrimSpace(value)
		if tag == "" {
			continue
		}
		if _, exists := seen[tag]; exists {
			continue
		}
		seen[tag] = struct{}{}
		normalized = append(normalized, tag)
	}

	if len(normalized) == 0 {
		return nil
	}

	return normalized
}

func sameNormalizedTags(left []string, right []string) bool {
	if len(left) != len(right) {
		return false
	}
	for index := range left {
		if left[index] != right[index] {
			return false
		}
	}
	return true
}
