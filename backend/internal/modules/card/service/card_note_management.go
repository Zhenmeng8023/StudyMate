package service

import (
	"net/http"
	"strings"

	carddto "studymate/backend/internal/modules/card/dto"
	cardmodel "studymate/backend/internal/modules/card/model"
	cardrepo "studymate/backend/internal/modules/card/repository"
	"studymate/backend/internal/pkg/apperrors"
)

func (s *Service) GetCardNote(ownerUserID, cardNoteID string) (*carddto.ManagedCardNotePayload, error) {
	note, err := s.requireOwnerCardNote(ownerUserID, cardNoteID)
	if err != nil {
		return nil, err
	}
	return s.buildManagedCardNotePayload(ownerUserID, *note)
}

func (s *Service) UpdateCardNote(ownerID, noteID string, request carddto.UpdateCardNoteRequest) (*carddto.ManagedCardNotePayload, error) {
	if err := validateCardNoteInput(request.Fields, request.PrimarySourceLink, request.SourceLinks); err != nil {
		return nil, err
	}
	if len(request.Tags) > 100 {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_card_tags", "标签不能超过 100 个")
	}
	for _, tag := range request.Tags {
		if len([]rune(tag)) > 100 {
			return nil, apperrors.New(http.StatusBadRequest, "invalid_card_tags", "每个标签不能超过 100 字")
		}
	}
	if _, err := s.requireOwnerCardNote(ownerID, noteID); err != nil {
		return nil, err
	}
	stats := &carddto.CardNoteRegenerationPayload{}
	var updatedNote cardmodel.CardNote
	err := s.repository.InTransaction(func(repository *cardrepo.Repository) error {
		note, err := repository.FindCardNoteForUpdate(noteID)
		if err != nil {
			return err
		}
		if note.OwnerUserID != ownerID {
			return apperrors.New(http.StatusForbidden, "card_note_forbidden", "无权访问该 CardNote")
		}
		current := cardrepo.BuildCardNotePayload(*note)
		fields := current.Fields
		if request.Fields != nil {
			fields = normalizeNoteFields(request.Fields)
		}
		links := current.SourceLinks
		if request.PrimarySourceLink != nil || request.SourceLinks != nil {
			links = normalizeSourceLinks(request.PrimarySourceLink, request.SourceLinks)
		}
		var primary *carddto.SourceLinkPayload
		if len(links) > 0 {
			primary = &links[0]
		}
		sourceType, sourceID, sourceMetadata := cardrepo.BuildLegacySourceFieldsFromLinks(primary, links)
		noteType, err := repository.FindNoteTypeByCode(note.NoteTypeCode)
		if err != nil {
			return err
		}
		templates, err := repository.ListActiveCardTemplatesByNoteType(noteType.ID, nil)
		if err != nil {
			return err
		}
		cards, err := repository.ListCardsByCardNoteID(ownerID, noteID)
		if err != nil {
			return err
		}
		if note.NoteTypeCode != "cloze" && len(cards) > 0 {
			templates = selectedExistingTemplates(templates, cards)
		}
		drafts, err := GenerateCardsFromNote(carddto.CardNotePayload{NoteTypeCode: note.NoteTypeCode, Fields: fields}, buildNoteTypePayload(*noteType), buildCardTemplatePayloads(templates))
		if err != nil {
			return apperrors.New(http.StatusBadRequest, "invalid_card_note_fields", err.Error())
		}
		cards = legacyClozeOrdinals(cards, current, *noteType, templates)
		if hasAmbiguousClozeOrdinals(note.NoteTypeCode, cards) {
			return apperrors.New(http.StatusConflict, "ambiguous_legacy_cloze", "旧 Cloze 卡片编号无法安全识别，请保留现有卡片并创建新的 CardNote")
		}
		stats, err = s.regenerateManagedCards(repository, ownerID, *note, cards, drafts, request.Tags, sourceType, sourceID, sourceMetadata)
		if err != nil {
			return err
		}
		note.FieldsJSON = cardrepo.MarshalStringMap(fields)
		note.SourceLinksJSON = cardrepo.MarshalSourceLinks(links)
		note.PrimarySourceType, note.PrimarySourceID = sourceType, sourceID
		note.GeneratedCardCount = len(cards) + stats.CreatedCount - stats.RemovedCount
		note.UpdatedAt = s.now().UTC()
		if err := repository.SaveCardNote(note); err != nil {
			return err
		}
		if err := repository.AdjustDeckCardCount(ownerID, note.DeckID, int64(stats.CreatedCount-stats.RemovedCount)); err != nil {
			return err
		}
		updatedNote = *note
		return nil
	})
	if err != nil {
		if _, ok := err.(*apperrors.Error); ok {
			return nil, err
		}
		return nil, apperrors.Internal("更新 CardNote 失败")
	}
	_ = s.auditLogs.Create(ownerID, "card.note.update", "card_note", map[string]any{"cardNoteId": noteID, "regeneration": stats})
	payload, err := s.buildManagedCardNotePayload(ownerID, updatedNote)
	if payload != nil {
		payload.Regeneration = stats
	}
	return payload, err
}

func selectedExistingTemplates(templates []cardmodel.CardTemplate, cards []cardmodel.Card) []cardmodel.CardTemplate {
	selected := make([]cardmodel.CardTemplate, 0, len(templates))
	for _, template := range templates {
		for _, card := range cards {
			if card.TemplateID == template.ID {
				selected = append(selected, template)
				break
			}
		}
	}
	return selected
}

func legacyClozeOrdinals(cards []cardmodel.Card, previous carddto.CardNotePayload, noteType cardmodel.NoteType, templates []cardmodel.CardTemplate) []cardmodel.Card {
	if previous.NoteTypeCode != "cloze" || len(cards) == 0 {
		return cards
	}
	for _, card := range cards {
		if card.TemplateOrdinal != 0 {
			return cards
		}
	}
	oldDrafts, err := GenerateCardsFromNote(previous, buildNoteTypePayload(noteType), buildCardTemplatePayloads(templates))
	if err != nil {
		return cards
	}
	result := append([]cardmodel.Card(nil), cards...)
	used := map[int]bool{}
	oldHasFirstMarker := false
	for _, draft := range oldDrafts {
		if draft.TemplateOrdinal == 0 {
			oldHasFirstMarker = true
		}
	}
	for index, card := range result {
		matched := false
		for _, draft := range oldDrafts {
			if !used[draft.TemplateOrdinal] && draft.Front == card.Front && draft.Back == card.Back {
				result[index].TemplateOrdinal = draft.TemplateOrdinal
				used[draft.TemplateOrdinal] = true
				matched = true
				break
			}
		}
		if !matched && (len(cards) > 1 || !oldHasFirstMarker) {
			result[index].TemplateOrdinal = -1
		}
	}
	return result
}

func validateCardNoteInput(fields map[string]string, primary *carddto.SourceLinkPayload, links []carddto.SourceLinkPayload) error {
	if len(fields) > 32 || len(links) > 20 {
		return apperrors.New(http.StatusBadRequest, "invalid_card_note_fields", "字段或来源数量超出限制")
	}
	for key, value := range fields {
		if len(key) > 100 || len(value) > 200000 {
			return apperrors.New(http.StatusBadRequest, "invalid_card_note_fields", "卡片字段过长")
		}
	}
	all := append([]carddto.SourceLinkPayload(nil), links...)
	if primary != nil {
		all = append(all, *primary)
	}
	for _, link := range all {
		if !validSourceType(link.SourceType) || strings.TrimSpace(link.SourceID) == "" || len(link.SourceID) > 200 || len([]rune(link.Title)) > 500 || len([]rune(link.Excerpt)) > 10000 {
			return apperrors.New(http.StatusBadRequest, "invalid_source_link", "来源类型、标识或说明不合法")
		}
	}
	return nil
}

func validSourceType(value string) bool {
	switch strings.TrimSpace(value) {
	case "material", "annotation", "pdf-anchor", "note", "note-block", "graph", "graph-node", "ai-draft", "ai-task", "card":
		return true
	}
	return false
}

func validateCardNoteQuery(query carddto.ListCardNotesQuery) error {
	if (query.SourceID != "" && query.SourceType == "") || (query.SourceType != "" && !validSourceType(query.SourceType)) || len(query.SourceID) > 200 {
		return apperrors.New(http.StatusBadRequest, "invalid_source_query", "请提供合法的来源类型与来源标识")
	}
	return nil
}

func cardNoteMatchesQuery(note carddto.CardNotePayload, query carddto.ListCardNotesQuery) bool {
	links := cardrepo.BuildSourceLinkReadModels(note.PrimarySourceLink, note.SourceLinks, "", "", nil)
	for _, link := range links {
		if (query.SourceType == "graph" && link.SourceType == "graph-node") ||
			(query.SourceType == "material" && (link.SourceType == "annotation" || link.SourceType == "pdf-anchor")) ||
			(query.SourceType == "note" && link.SourceType == "note-block") {
			link.SourceType, link.SourceID = query.SourceType, ""
		}
		if query.SourceID != "" {
			if cardrepo.SourceLinkReadModelMatches(link, query.SourceType, query.SourceID) {
				return true
			}
		} else if link.SourceType == query.SourceType {
			return true
		}
	}
	return false
}

func hasAmbiguousClozeOrdinals(noteType string, cards []cardmodel.Card) bool {
	if noteType != "cloze" {
		return false
	}
	seen := map[int]bool{}
	for _, card := range cards {
		if card.TemplateOrdinal < 0 || seen[card.TemplateOrdinal] {
			return true
		}
		seen[card.TemplateOrdinal] = true
	}
	return false
}
