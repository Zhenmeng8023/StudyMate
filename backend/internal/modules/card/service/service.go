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

	cards, err := s.repository.ListCardsByDeck(deck.ID, ownerUserID, cardrepo.ListCardsFilter{
		Query:      strings.TrimSpace(request.Query),
		Status:     status,
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
	dueCount, err := s.repository.CountDueCards(ownerUserID, now)
	if err != nil {
		return nil, apperrors.Internal("读取今日复习统计失败")
	}

	rows, err := s.repository.ListDueCards(ownerUserID, now, 40)
	if err != nil {
		return nil, apperrors.Internal("读取今日复习队列失败")
	}

	items := make([]carddto.ReviewQueueItemPayload, 0, len(rows))
	for _, row := range rows {
		items = append(items, carddto.ReviewQueueItemPayload{
			DeckTitle: row.Deck.Title,
			Card:      cardrepo.BuildCardPayload(row.Card),
			Schedule:  cardrepo.BuildSchedulePayload(row.Schedule),
		})
	}

	return &carddto.ReviewQueuePayload{
		DueCount: dueCount,
		Items:    items,
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
		weakCards = append(weakCards, carddto.ReviewFeedbackCardPayload{
			CardID:          row.Card.ID,
			DeckID:          row.Deck.ID,
			DeckTitle:       row.Deck.Title,
			Front:           row.Card.Front,
			SourceType:      row.Card.SourceType,
			SourceID:        row.Card.SourceID,
			SourceMetadata:  cardrepo.ParseSourceMetadata(row.Card.SourceMetadata),
			DueAt:           row.Schedule.DueAt.Format(time.RFC3339),
			LapseCount:      row.Schedule.LapseCount,
			RepetitionCount: row.Schedule.RepetitionCount,
			State:           row.Schedule.State,
		})
	}

	sourceSummaries := buildSourceSummaries(sourceRows, now)

	return &carddto.ReviewFeedbackPayload{
		DueCount:        dueCount,
		LearningCount:   learningCount,
		WeakCardCount:   weakCardCount,
		WeakCards:       weakCards,
		SourceSummaries: sourceSummaries,
		WeakSources:     buildWeakSourceSummaries(sourceSummaries),
	}, nil
}

func (s *Service) ReviewCard(ownerUserID string, cardID string, request carddto.ReviewCardRequest) (*carddto.ReviewResultPayload, error) {
	card, err := s.requireOwnerCard(ownerUserID, cardID)
	if err != nil {
		return nil, err
	}

	schedule, err := s.repository.FindSchedule(card.ID, ownerUserID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "schedule_not_found", "当前卡片还没有复习计划")
		}
		return nil, apperrors.Internal("读取复习计划失败")
	}

	now := s.now().UTC()
	nextSchedule, ok := s.scheduler.Apply(*schedule, request.Rating, now)
	if !ok {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_review_rating", "评分必须是 again、hard、good 或 easy")
	}

	review := &cardmodel.CardReview{
		CardID:     card.ID,
		UserID:     ownerUserID,
		Rating:     NormalizeReviewRating(request.Rating),
		ElapsedMs:  maxElapsed(request.ElapsedMs),
		ReviewedAt: now,
	}
	if err := s.repository.CreateReview(review); err != nil {
		return nil, apperrors.Internal("记录复习结果失败")
	}

	if err := s.repository.SaveSchedule(&nextSchedule); err != nil {
		return nil, apperrors.Internal("更新复习计划失败")
	}

	_ = s.auditLogs.Create(ownerUserID, "card.review", "card", map[string]any{
		"cardId": card.ID,
		"rating": review.Rating,
	})

	return &carddto.ReviewResultPayload{
		ReviewID: review.ID,
		Schedule: cardrepo.BuildSchedulePayload(nextSchedule),
	}, nil
}

func (s *Service) UpdateCardStatus(ownerUserID string, cardID string, request carddto.UpdateCardStatusRequest) (*carddto.CardPayload, error) {
	card, err := s.requireOwnerCard(ownerUserID, cardID)
	if err != nil {
		return nil, err
	}

	status, ok := normalizeCardStatus(request.Status)
	if !ok {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_card_status", "卡片状态必须是 active、suspended 或 buried")
	}
	if card.Status == status {
		payload := cardrepo.BuildCardPayload(*card)
		return &payload, nil
	}

	card.Status = status
	if err := s.repository.SaveCard(card); err != nil {
		return nil, apperrors.Internal("更新卡片状态失败")
	}

	_ = s.auditLogs.Create(ownerUserID, "card.status.update", "card", map[string]any{
		"cardId": card.ID,
		"status": status,
	})

	payload := cardrepo.BuildCardPayload(*card)
	return &payload, nil
}

func (s *Service) UpdateCardTags(ownerUserID string, cardID string, request carddto.UpdateCardTagsRequest) (*carddto.CardPayload, error) {
	card, err := s.requireOwnerCard(ownerUserID, cardID)
	if err != nil {
		return nil, err
	}

	tags := normalizeCardTags(request.Tags)
	if sameNormalizedTags(cardrepo.DecodeTags(card.Tags), tags) {
		payload := cardrepo.BuildCardPayload(*card)
		return &payload, nil
	}

	card.Tags = cardrepo.EncodeTags(tags)
	if err := s.repository.SaveCard(card); err != nil {
		return nil, apperrors.Internal("更新卡片标签失败")
	}

	_ = s.auditLogs.Create(ownerUserID, "card.tags.update", "card", map[string]any{
		"cardId": card.ID,
		"tags":   tags,
		"count":  len(tags),
	})

	payload := cardrepo.BuildCardPayload(*card)
	return &payload, nil
}

func (s *Service) UndoReview(ownerUserID string, cardID string, request carddto.UndoReviewRequest) (*carddto.UndoReviewResultPayload, error) {
	card, err := s.requireOwnerCard(ownerUserID, cardID)
	if err != nil {
		return nil, err
	}

	reviewID := strings.TrimSpace(request.ReviewID)
	if reviewID == "" {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_review_id", "撤销评分时必须提供 reviewId")
	}

	schedule, err := s.repository.FindSchedule(card.ID, ownerUserID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "schedule_not_found", "当前卡片还没有复习计划")
		}
		return nil, apperrors.Internal("读取复习计划失败")
	}

	latestReview, err := s.repository.FindLatestReview(card.ID, ownerUserID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, apperrors.New(http.StatusNotFound, "review_not_found", "没有找到可撤销的评分记录")
		}
		return nil, apperrors.Internal("读取评分记录失败")
	}
	if latestReview.ID != reviewID {
		return nil, apperrors.New(http.StatusConflict, "review_undo_conflict", "当前只能撤销这张卡片最新的一次评分")
	}

	restoredSchedule, err := buildRestoredSchedule(*schedule, card.ID, ownerUserID, request.PreviousSchedule)
	if err != nil {
		return nil, err
	}

	if err := s.repository.InTransaction(func(repository *cardrepo.Repository) error {
		if err := repository.SaveSchedule(&restoredSchedule); err != nil {
			return err
		}
		if err := repository.DeleteReviewByID(latestReview.ID); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return nil, apperrors.Internal("撤销上一条评分失败")
	}

	_ = s.auditLogs.Create(ownerUserID, "card.review.undo", "card", map[string]any{
		"cardId":   card.ID,
		"reviewId": latestReview.ID,
	})

	return &carddto.UndoReviewResultPayload{
		Schedule: cardrepo.BuildSchedulePayload(restoredSchedule),
	}, nil
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

	deck.CardCount += int64(len(created))
	if err := s.repository.SaveDeck(deck); err != nil {
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
