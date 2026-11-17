package service

import (
	"fmt"
	"net/http"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
	carddto "studymate/backend/internal/modules/card/dto"
	cardmodel "studymate/backend/internal/modules/card/model"
	cardrepo "studymate/backend/internal/modules/card/repository"
	"studymate/backend/internal/pkg/apperrors"
)

type GeneratedCardDraft struct {
	TemplateID      string
	TemplateOrdinal int
	CardType        string
	Front           string
	Back            string
}

var clozePattern = regexp.MustCompile(`\{\{c(\d+)::(.*?)(?:::(.*?))?\}\}`)

func GenerateCardsForNoteType(request carddto.CreateCardNoteRequest) ([]GeneratedCardDraft, error) {
	noteTypeCode := strings.ToLower(strings.TrimSpace(request.NoteTypeCode))
	noteType := carddto.NoteTypePayload{
		ID:        "builtin-" + noteTypeCode,
		Code:      noteTypeCode,
		Name:      noteTypeCode,
		Kind:      noteTypeCode,
		IsBuiltin: true,
		Status:    "active",
		CreatedAt: "",
		UpdatedAt: "",
	}
	templates := defaultTemplatesForNoteTypeCode(noteTypeCode)
	return GenerateCardsFromNote(carddto.CardNotePayload{
		NoteTypeCode: noteTypeCode,
		Fields:       request.Fields,
	}, noteType, templates)
}

func GenerateCardsFromNote(note carddto.CardNotePayload, noteType carddto.NoteTypePayload, templates []carddto.CardTemplatePayload) ([]GeneratedCardDraft, error) {
	noteTypeCode := strings.ToLower(strings.TrimSpace(firstNonEmpty(note.NoteTypeCode, noteType.Code)))
	fields := normalizeNoteFields(note.Fields)
	templatePayloads := normalizeTemplatePayloads(templates)
	if len(templatePayloads) == 0 {
		return nil, fmt.Errorf("%s note type requires at least one active template", noteTypeCode)
	}

	switch noteTypeCode {
	case "basic":
		front := strings.TrimSpace(fields["front"])
		back := strings.TrimSpace(fields["back"])
		if front == "" || back == "" {
			return nil, fmt.Errorf("basic note type requires front and back")
		}
		return renderStandardTemplateCards(fields, templatePayloads)
	case "basic_reverse":
		front := strings.TrimSpace(fields["front"])
		back := strings.TrimSpace(fields["back"])
		if front == "" || back == "" {
			return nil, fmt.Errorf("basic_reverse note type requires front and back")
		}
		return renderStandardTemplateCards(fields, templatePayloads)
	case "cloze":
		text := strings.TrimSpace(fields["text"])
		extra := strings.TrimSpace(fields["extra"])
		if text == "" {
			return nil, fmt.Errorf("cloze note type requires text")
		}
		matches := clozePattern.FindAllStringSubmatch(text, -1)
		if len(matches) == 0 {
			return nil, fmt.Errorf("cloze note type requires at least one {{cN::...}} marker")
		}
		if len(matches) > 1000 {
			return nil, fmt.Errorf("cloze note supports at most 1000 marker occurrences")
		}
		template := templatePayloads[0]
		ordinals := map[string]struct{}{}
		generated := make([]GeneratedCardDraft, 0, len(matches))
		for _, match := range matches {
			if len(match) < 3 {
				continue
			}
			number, parseErr := strconv.Atoi(match[1])
			if parseErr != nil || number < 1 || number > 1000000 || strings.TrimSpace(match[2]) == "" {
				return nil, fmt.Errorf("cloze marker must use c1..c1000000 and a non-empty answer")
			}
			ordinal := strconv.Itoa(number)
			if _, exists := ordinals[ordinal]; exists {
				continue
			}
			ordinals[ordinal] = struct{}{}
			if len(ordinals) > 100 {
				return nil, fmt.Errorf("cloze note supports at most 100 generated cards")
			}
			front := text
			back := text
			for _, other := range matches {
				if len(other) < 3 {
					continue
				}
				replacement := other[2]
				otherNumber, _ := strconv.Atoi(other[1])
				if otherNumber == number {
					replacement = "[...]"
				}
				front = strings.ReplaceAll(front, other[0], replacement)
				back = strings.ReplaceAll(back, other[0], other[2])
			}
			if extra != "" {
				back = back + "\n\n" + extra
			}
			generated = append(generated, GeneratedCardDraft{
				TemplateID:      template.ID,
				TemplateOrdinal: number - 1,
				CardType:        template.TemplateKind,
				Front:           strings.TrimSpace(front),
				Back:            strings.TrimSpace(back),
			})
		}
		return generated, nil
	default:
		return nil, fmt.Errorf("unsupported note type code %q", noteTypeCode)
	}
}

func (s *Service) CreateCardNote(ownerUserID string, deckID string, request carddto.CreateCardNoteRequest) (*carddto.CreateCardNoteResultPayload, error) {
	if err := validateCardNoteInput(request.Fields, request.PrimarySourceLink, request.SourceLinks); err != nil {
		return nil, err
	}
	deck, err := s.requireOwnerDeck(ownerUserID, deckID)
	if err != nil {
		return nil, err
	}

	noteTypeCode := strings.ToLower(strings.TrimSpace(request.NoteTypeCode))
	if noteTypeCode == "" {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_note_type_code", "创建 CardNote 时必须提供 noteTypeCode")
	}
	noteType, err := s.repository.FindNoteTypeByCode(noteTypeCode)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, apperrors.New(http.StatusBadRequest, "invalid_note_type_code", "未知的 noteTypeCode，当前仅支持 basic、basic_reverse、cloze")
		}
		return nil, apperrors.Internal("读取 NoteType 失败")
	}
	templateKeys := normalizeTemplateKeys(request.TemplateKeys)
	templates, err := s.repository.ListActiveCardTemplatesByNoteType(noteType.ID, templateKeys)
	if err != nil {
		return nil, apperrors.Internal("读取 CardTemplate 失败")
	}
	if len(templates) == 0 {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_template_keys", "当前 CardNote 没有匹配到可用模板")
	}

	sourceLinks := normalizeSourceLinks(request.PrimarySourceLink, request.SourceLinks)
	generatedDrafts, err := GenerateCardsFromNote(
		carddto.CardNotePayload{
			NoteTypeID:   noteType.ID,
			NoteTypeCode: noteTypeCode,
			Fields:       request.Fields,
		},
		buildNoteTypePayload(*noteType),
		buildCardTemplatePayloads(templates),
	)
	if err != nil {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_card_note_fields", err.Error())
	}

	primarySourceLink := request.PrimarySourceLink
	if primarySourceLink == nil && len(sourceLinks) > 0 {
		primarySourceLink = &sourceLinks[0]
	}
	legacySourceType, legacySourceID, legacySourceMetadata := cardrepo.BuildLegacySourceFieldsFromLinks(primarySourceLink, sourceLinks)

	now := s.now().UTC()
	cardNote := &cardmodel.CardNote{
		DeckID:             deck.ID,
		OwnerUserID:        ownerUserID,
		NoteTypeID:         noteType.ID,
		NoteTypeCode:       noteTypeCode,
		PrimarySourceType:  legacySourceType,
		PrimarySourceID:    legacySourceID,
		FieldsJSON:         cardrepo.MarshalStringMap(normalizeNoteFields(request.Fields)),
		SourceLinksJSON:    cardrepo.MarshalSourceLinks(sourceLinks),
		Status:             "active",
		GeneratedCardCount: len(generatedDrafts),
		CreatedAt:          now,
		UpdatedAt:          now,
	}

	createdCards := make([]carddto.GeneratedCardPayload, 0, len(generatedDrafts))
	if err := s.repository.InTransaction(func(repository *cardrepo.Repository) error {
		if err := repository.CreateCardNote(cardNote); err != nil {
			return err
		}

		for _, generated := range generatedDrafts {
			card := &cardmodel.Card{
				DeckID:          deck.ID,
				OwnerUserID:     ownerUserID,
				CardNoteID:      cardNote.ID,
				TemplateID:      generated.TemplateID,
				TemplateOrdinal: generated.TemplateOrdinal,
				CardType:        generated.CardType,
				Front:           generated.Front,
				Back:            generated.Back,
				SourceType:      legacySourceType,
				SourceID:        legacySourceID,
				SourceMetadata:  cardrepo.MarshalSourceMetadata(legacySourceMetadata),
				Status:          "active",
				CreatedAt:       now,
				UpdatedAt:       now,
			}
			if err := repository.CreateCard(card); err != nil {
				return err
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
			if err := repository.SaveSchedule(schedule); err != nil {
				return err
			}

			payload := cardrepo.BuildCardPayload(*card)
			payload.Schedule = &carddto.CardSchedulePayload{
				CardID:          card.ID,
				UserID:          ownerUserID,
				DueAt:           now.Format(time.RFC3339),
				LearningStep:    0,
				IntervalDays:    0,
				EaseFactor:      2.5,
				RepetitionCount: 0,
				LapseCount:      0,
				State:           "new",
				UpdatedAt:       now.Format(time.RFC3339),
			}
			createdCards = append(createdCards, payload)
		}

		if err := repository.AdjustDeckCardCount(ownerUserID, deck.ID, int64(len(createdCards))); err != nil {
			return err
		}

		return nil
	}); err != nil {
		return nil, apperrors.Internal("创建 CardNote 失败")
	}

	_ = s.auditLogs.Create(ownerUserID, "card.note.create", "card_note", map[string]any{
		"cardNoteId": cardNote.ID,
		"deckId":     deck.ID,
		"count":      len(createdCards),
		"noteType":   noteTypeCode,
	})

	return &carddto.CreateCardNoteResultPayload{
		CardNote:       cardrepo.BuildCardNotePayload(*cardNote),
		GeneratedCards: createdCards,
	}, nil
}

func (s *Service) ListCardNotes(ownerUserID string, queries ...carddto.ListCardNotesQuery) ([]carddto.ManagedCardNotePayload, error) {
	query := carddto.ListCardNotesQuery{}
	if len(queries) > 0 {
		query = queries[0]
	}
	if err := validateCardNoteQuery(query); err != nil {
		return nil, err
	}
	cardNotes, err := s.repository.ListCardNotesByOwner(ownerUserID)
	if err != nil {
		return nil, apperrors.Internal("读取 CardNote 列表失败")
	}

	result := make([]carddto.ManagedCardNotePayload, 0, len(cardNotes))
	for _, cardNote := range cardNotes {
		if query.SourceType != "" && !cardNoteMatchesQuery(cardrepo.BuildCardNotePayload(cardNote), query) {
			continue
		}
		payload, err := s.buildManagedCardNotePayload(ownerUserID, cardNote)
		if err != nil {
			return nil, err
		}
		result = append(result, *payload)
	}
	return result, nil
}

func (s *Service) requireOwnerCardNote(ownerUserID string, cardNoteID string) (*cardmodel.CardNote, error) {
	cardNote, err := s.repository.FindCardNoteByID(cardNoteID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, apperrors.New(http.StatusNotFound, "card_note_not_found", "CardNote 不存在")
		}
		return nil, apperrors.Internal("读取 CardNote 失败")
	}
	if cardNote.OwnerUserID != ownerUserID {
		return nil, apperrors.New(http.StatusForbidden, "card_note_forbidden", "无权访问该 CardNote")
	}
	return cardNote, nil
}

func (s *Service) buildManagedCardNotePayload(ownerUserID string, cardNote cardmodel.CardNote) (*carddto.ManagedCardNotePayload, error) {
	cards, err := s.repository.ListCardsByCardNoteID(ownerUserID, cardNote.ID)
	if err != nil {
		return nil, apperrors.Internal("读取 CardNote 生成卡片失败")
	}
	generatedCards := make([]carddto.GeneratedCardPayload, 0, len(cards))
	queueStates := map[string]int{}
	tagSet := map[string]struct{}{}
	for _, card := range cards {
		payload := cardrepo.BuildCardPayload(card)
		schedule, scheduleErr := s.repository.FindSchedule(card.ID, ownerUserID)
		if scheduleErr != nil && scheduleErr != gorm.ErrRecordNotFound {
			return nil, apperrors.Internal("读取 CardNote 复习计划失败")
		}
		queueState := "new"
		if scheduleErr == nil {
			schedulePayload := cardrepo.BuildSchedulePayload(*schedule)
			payload.Schedule = &schedulePayload
			queueState = schedule.State
		}
		if card.Status == "suspended" || card.Status == "buried" {
			queueState = card.Status
		}
		queueStates[queueState]++
		for _, tag := range payload.Tags {
			tagSet[tag] = struct{}{}
		}
		generatedCards = append(generatedCards, payload)
	}
	tags := make([]string, 0, len(tagSet))
	for tag := range tagSet {
		tags = append(tags, tag)
	}
	sort.Strings(tags)
	return &carddto.ManagedCardNotePayload{
		CardNote:       cardrepo.BuildCardNotePayload(cardNote),
		GeneratedCards: generatedCards,
		QueueStates:    queueStates,
		Tags:           tags,
	}, nil
}

func isUnreviewedGeneratedCard(schedule *cardmodel.CardSchedule) bool {
	if schedule == nil {
		return true
	}
	return schedule.State == "new" && schedule.RepetitionCount == 0 && schedule.LapseCount == 0 && schedule.LearningStep == 0
}

func normalizeNoteFields(fields map[string]string) map[string]string {
	if len(fields) == 0 {
		return map[string]string{}
	}
	normalized := make(map[string]string, len(fields))
	for key, value := range fields {
		trimmedKey := strings.TrimSpace(strings.ToLower(key))
		if trimmedKey == "" {
			continue
		}
		normalized[trimmedKey] = strings.TrimSpace(value)
	}
	return normalized
}

func defaultTemplatesForNoteTypeCode(noteTypeCode string) []carddto.CardTemplatePayload {
	switch noteTypeCode {
	case "basic":
		return []carddto.CardTemplatePayload{{
			ID:           "builtin-basic-0",
			NoteTypeID:   "builtin-basic",
			Name:         "Card 1",
			TemplateKind: "basic",
			Ordinal:      0,
			IsActive:     true,
			FrontFormat:  "{{front}}",
			BackFormat:   "{{back}}",
		}}
	case "basic_reverse":
		return []carddto.CardTemplatePayload{
			{
				ID:           "builtin-basic-reverse-0",
				NoteTypeID:   "builtin-basic-reverse",
				Name:         "Forward",
				TemplateKind: "basic",
				Ordinal:      0,
				IsActive:     true,
				FrontFormat:  "{{front}}",
				BackFormat:   "{{back}}",
			},
			{
				ID:           "builtin-basic-reverse-1",
				NoteTypeID:   "builtin-basic-reverse",
				Name:         "Reverse",
				TemplateKind: "basic",
				Ordinal:      1,
				IsActive:     true,
				FrontFormat:  "{{back}}",
				BackFormat:   "{{front}}",
			},
		}
	case "cloze":
		return []carddto.CardTemplatePayload{{
			ID:           "builtin-cloze-0",
			NoteTypeID:   "builtin-cloze",
			Name:         "Cloze",
			TemplateKind: "cloze",
			Ordinal:      0,
			IsActive:     true,
			FrontFormat:  "{{cloze:text}}",
			BackFormat:   "{{text}}\n\n{{extra}}",
			ClozeRule:    "{{cN::...}}",
		}}
	default:
		return nil
	}
}

func normalizeTemplatePayloads(templates []carddto.CardTemplatePayload) []carddto.CardTemplatePayload {
	normalized := append([]carddto.CardTemplatePayload{}, templates...)
	sort.SliceStable(normalized, func(i, j int) bool {
		if normalized[i].Ordinal == normalized[j].Ordinal {
			return normalized[i].ID < normalized[j].ID
		}
		return normalized[i].Ordinal < normalized[j].Ordinal
	})
	return normalized
}

func renderStandardTemplateCards(fields map[string]string, templates []carddto.CardTemplatePayload) ([]GeneratedCardDraft, error) {
	generated := make([]GeneratedCardDraft, 0, len(templates))
	for _, template := range templates {
		front := strings.TrimSpace(renderTemplateFormat(template.FrontFormat, fields))
		back := strings.TrimSpace(renderTemplateFormat(template.BackFormat, fields))
		if front == "" || back == "" {
			return nil, fmt.Errorf("template %q rendered an empty front or back", template.Name)
		}
		generated = append(generated, GeneratedCardDraft{
			TemplateID:      template.ID,
			TemplateOrdinal: template.Ordinal,
			CardType:        firstNonEmpty(strings.TrimSpace(template.TemplateKind), "basic"),
			Front:           front,
			Back:            back,
		})
	}
	return generated, nil
}

func renderTemplateFormat(format string, fields map[string]string) string {
	rendered := format
	for key, value := range fields {
		rendered = strings.ReplaceAll(rendered, "{{"+key+"}}", value)
	}
	return rendered
}

func buildNoteTypePayload(noteType cardmodel.NoteType) carddto.NoteTypePayload {
	return carddto.NoteTypePayload{
		ID:            noteType.ID,
		Code:          noteType.Code,
		Name:          noteType.Name,
		Kind:          noteType.Kind,
		IsBuiltin:     noteType.IsBuiltin,
		Status:        noteType.Status,
		TemplateCount: noteType.TemplateCount,
		CreatedAt:     noteType.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     noteType.UpdatedAt.Format(time.RFC3339),
	}
}

func buildCardTemplatePayloads(templates []cardmodel.CardTemplate) []carddto.CardTemplatePayload {
	result := make([]carddto.CardTemplatePayload, 0, len(templates))
	for _, template := range templates {
		result = append(result, carddto.CardTemplatePayload{
			ID:           template.ID,
			NoteTypeID:   template.NoteTypeID,
			Name:         template.Name,
			TemplateKind: template.TemplateKind,
			Ordinal:      template.Ordinal,
			IsActive:     template.IsActive,
			FrontFormat:  template.FrontFormat,
			BackFormat:   template.BackFormat,
			ClozeRule:    template.ClozeRule,
			CreatedAt:    template.CreatedAt.Format(time.RFC3339),
			UpdatedAt:    template.UpdatedAt.Format(time.RFC3339),
		})
	}
	return result
}

func normalizeTemplateKeys(templateKeys []string) []string {
	if len(templateKeys) == 0 {
		return nil
	}
	seen := make(map[string]struct{}, len(templateKeys))
	normalized := make([]string, 0, len(templateKeys))
	for _, value := range templateKeys {
		key := strings.ToLower(strings.TrimSpace(value))
		if key == "" {
			continue
		}
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		normalized = append(normalized, key)
	}
	return normalized
}

func firstNonEmpty(value string, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func normalizeSourceLinks(primary *carddto.SourceLinkPayload, links []carddto.SourceLinkPayload) []carddto.SourceLinkPayload {
	normalized := make([]carddto.SourceLinkPayload, 0, len(links)+1)
	appendIfValid := func(candidate *carddto.SourceLinkPayload) {
		if candidate == nil {
			return
		}
		sourceType := strings.TrimSpace(candidate.SourceType)
		sourceID := strings.TrimSpace(candidate.SourceID)
		if sourceType == "" || sourceID == "" {
			return
		}
		normalized = append(normalized, carddto.SourceLinkPayload{
			SourceType: sourceType,
			SourceID:   sourceID,
			Title:      strings.TrimSpace(candidate.Title),
			Excerpt:    strings.TrimSpace(candidate.Excerpt),
			Locator:    candidate.Locator,
			Metadata:   candidate.Metadata,
		})
	}

	appendIfValid(primary)
	for index := range links {
		candidate := links[index]
		appendIfValid(&candidate)
	}
	return normalized
}
