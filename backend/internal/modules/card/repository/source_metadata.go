package repository

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"strconv"
	"strings"
	"time"

	carddto "studymate/backend/internal/modules/card/dto"
)

type SourceLinkReadModel struct {
	SourceType        string
	SourceID          string
	SourceMetadata    map[string]any
	PrimarySourceLink *carddto.SourceLinkPayload
	SourceLinks       []carddto.SourceLinkPayload
}

type SourceLinkRelationReadModel struct {
	ID               string
	OwnerUserID      string
	LinkedObjectType string
	LinkedObjectID   string
	SourceType       string
	SourceID         string
	LocatorJSON      map[string]any
	Title            string
	Excerpt          string
	MetadataJSON     map[string]any
	IsPrimary        bool
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

func MarshalSourceMetadata(metadata map[string]any) string {
	if len(metadata) == 0 {
		return ""
	}

	raw, err := json.Marshal(metadata)
	if err != nil {
		return ""
	}

	return string(raw)
}

func parseSourceMetadata(raw string) map[string]any {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return nil
	}

	var metadata map[string]any
	if err := json.Unmarshal([]byte(trimmed), &metadata); err != nil {
		return nil
	}
	if len(metadata) == 0 {
		return nil
	}

	return metadata
}

func BuildPrimarySourceLinkPayload(sourceType string, sourceID string, sourceMetadata map[string]any) *carddto.SourceLinkPayload {
	normalizedType := normalizeSourceType(sourceType)
	trimmedID := strings.TrimSpace(sourceID)
	if normalizedType == "" || trimmedID == "" {
		return nil
	}

	locator, metadata := splitSourceMetadata(normalizedType, trimmedID, sourceMetadata)
	link := &carddto.SourceLinkPayload{
		SourceType: normalizedType,
		SourceID:   trimmedID,
		Title:      popString(metadata, "title"),
		Excerpt:    popString(metadata, "excerpt"),
		Locator:    emptyMapAsNil(locator),
		Metadata:   emptyMapAsNil(metadata),
	}
	return link
}

func BuildSourceLinksPayload(sourceType string, sourceID string, sourceMetadata map[string]any) []carddto.SourceLinkPayload {
	primary := BuildPrimarySourceLinkPayload(sourceType, sourceID, sourceMetadata)
	if primary == nil {
		return nil
	}

	return []carddto.SourceLinkPayload{*primary}
}

func BuildSourceLinkReadModels(primary *carddto.SourceLinkPayload, links []carddto.SourceLinkPayload, legacyType string, legacyID string, legacyMetadata map[string]any) []SourceLinkReadModel {
	result := make([]SourceLinkReadModel, 0, len(links)+1)
	seen := map[string]struct{}{}
	appendLink := func(candidate *carddto.SourceLinkPayload) {
		normalized := normalizeSourceLinkPayload(candidate)
		if normalized == nil {
			return
		}
		key := sourceLinkReadModelKey(*normalized)
		if _, exists := seen[key]; exists {
			return
		}
		seen[key] = struct{}{}
		_, _, sourceMetadata := BuildLegacySourceFieldsFromLinks(normalized, nil)
		result = append(result, SourceLinkReadModel{
			SourceType:        normalized.SourceType,
			SourceID:          normalized.SourceID,
			SourceMetadata:    sourceMetadata,
			PrimarySourceLink: normalized,
			SourceLinks:       []carddto.SourceLinkPayload{*normalized},
		})
	}

	appendLink(primary)
	for index := range links {
		appendLink(&links[index])
	}
	if len(result) > 0 {
		return result
	}

	legacyPrimary := BuildPrimarySourceLinkPayload(legacyType, legacyID, legacyMetadata)
	if legacyPrimary == nil {
		return nil
	}
	return []SourceLinkReadModel{{
		SourceType:        legacyPrimary.SourceType,
		SourceID:          legacyPrimary.SourceID,
		SourceMetadata:    cloneMap(legacyMetadata),
		PrimarySourceLink: legacyPrimary,
		SourceLinks:       []carddto.SourceLinkPayload{*legacyPrimary},
	}}
}

func BuildSourceLinkRelationReadModels(ownerUserID string, linkedObjectType string, linkedObjectID string, primary *carddto.SourceLinkPayload, links []carddto.SourceLinkPayload, legacyType string, legacyID string, legacyMetadata map[string]any) []SourceLinkRelationReadModel {
	trimmedOwnerID := strings.TrimSpace(ownerUserID)
	normalizedObjectType := normalizeLinkedObjectType(linkedObjectType)
	trimmedObjectID := strings.TrimSpace(linkedObjectID)
	if trimmedOwnerID == "" || normalizedObjectType == "" || trimmedObjectID == "" {
		return nil
	}

	readModels := BuildSourceLinkReadModels(primary, links, legacyType, legacyID, legacyMetadata)
	if len(readModels) == 0 {
		return nil
	}

	result := make([]SourceLinkRelationReadModel, 0, len(readModels))
	for index, readModel := range readModels {
		if readModel.PrimarySourceLink == nil {
			continue
		}
		link := readModel.PrimarySourceLink
		relation := SourceLinkRelationReadModel{
			ID:               sourceLinkRelationID(trimmedOwnerID, normalizedObjectType, trimmedObjectID, link.SourceType, link.SourceID, index),
			OwnerUserID:      trimmedOwnerID,
			LinkedObjectType: normalizedObjectType,
			LinkedObjectID:   trimmedObjectID,
			SourceType:       link.SourceType,
			SourceID:         link.SourceID,
			LocatorJSON:      cloneMap(link.Locator),
			Title:            link.Title,
			Excerpt:          link.Excerpt,
			MetadataJSON:     cloneMap(link.Metadata),
			IsPrimary:        index == 0,
		}
		result = append(result, relation)
	}

	return result
}

func BuildPrimarySourceLinkReadModel(sourceType string, sourceID string, sourceMetadata map[string]any) *SourceLinkReadModel {
	readModels := BuildSourceLinkReadModels(nil, nil, sourceType, sourceID, sourceMetadata)
	if len(readModels) == 0 {
		return nil
	}
	return &readModels[0]
}

func SourceLinkReadModelMatches(readModel SourceLinkReadModel, sourceType string, sourceID string) bool {
	normalizedType := normalizeSourceType(sourceType)
	trimmedID := strings.TrimSpace(sourceID)
	if normalizedType == "" || trimmedID == "" || normalizeSourceType(readModel.SourceType) != normalizedType {
		return false
	}
	if strings.TrimSpace(readModel.SourceID) == trimmedID {
		return true
	}
	if readModel.PrimarySourceLink == nil {
		return false
	}
	return sourceLinkLocatorMatches(normalizedType, trimmedID, readModel.PrimarySourceLink.Locator) ||
		sourceLinkLocatorMatches(normalizedType, trimmedID, readModel.PrimarySourceLink.Metadata)
}

func BuildLegacySourceFieldsFromLinks(primary *carddto.SourceLinkPayload, links []carddto.SourceLinkPayload) (string, string, map[string]any) {
	link := primary
	if link == nil && len(links) > 0 {
		link = &links[0]
	}
	if link == nil {
		return "", "", nil
	}

	sourceType := normalizeSourceType(link.SourceType)
	sourceID := strings.TrimSpace(link.SourceID)
	if sourceType == "" || sourceID == "" {
		return "", "", nil
	}

	metadata := cloneMap(link.Locator)
	if metadata == nil {
		metadata = map[string]any{}
	}
	for key, value := range cloneMap(link.Metadata) {
		metadata[key] = value
	}
	if title := strings.TrimSpace(link.Title); title != "" {
		metadata["title"] = title
	}
	if excerpt := strings.TrimSpace(link.Excerpt); excerpt != "" {
		metadata["excerpt"] = excerpt
	}

	return sourceType, sourceID, emptyMapAsNil(metadata)
}

func normalizeSourceLinkPayload(link *carddto.SourceLinkPayload) *carddto.SourceLinkPayload {
	if link == nil {
		return nil
	}
	sourceType := normalizeSourceType(link.SourceType)
	sourceID := strings.TrimSpace(link.SourceID)
	if sourceType == "" || sourceID == "" {
		return nil
	}
	return &carddto.SourceLinkPayload{
		SourceType: sourceType,
		SourceID:   sourceID,
		Title:      strings.TrimSpace(link.Title),
		Excerpt:    strings.TrimSpace(link.Excerpt),
		Locator:    cloneMap(link.Locator),
		Metadata:   cloneMap(link.Metadata),
	}
}

func sourceLinkReadModelKey(link carddto.SourceLinkPayload) string {
	parts := []string{
		link.SourceType,
		link.SourceID,
		stringValue(link.Locator["graphId"]),
		stringValue(link.Locator["nodeId"]),
		stringValue(link.Locator["noteId"]),
		stringValue(link.Locator["blockId"]),
		stringValue(link.Locator["materialId"]),
		stringValue(link.Locator["annotationId"]),
		stringValue(link.Locator["anchorId"]),
	}
	return strings.Join(parts, "\x00")
}

func sourceLinkLocatorMatches(sourceType string, sourceID string, values map[string]any) bool {
	if len(values) == 0 {
		return false
	}
	keys := sourceLinkLocatorMatchKeys(sourceType)
	for _, key := range keys {
		if stringValue(values[key]) == sourceID {
			return true
		}
	}
	return false
}

func sourceLinkLocatorMatchKeys(sourceType string) []string {
	switch sourceType {
	case "material":
		return []string{"materialId", "sourceMaterialId"}
	case "annotation":
		return []string{"annotationId"}
	case "pdf-anchor":
		return []string{"anchorId"}
	case "note":
		return []string{"noteId"}
	case "note-block":
		return []string{"blockId"}
	case "graph":
		return []string{"graphId"}
	case "graph-node":
		return []string{"nodeId"}
	case "ai-draft":
		return []string{"draftId"}
	case "ai-task", "ai":
		return []string{"taskId"}
	case "card":
		return []string{"cardId"}
	default:
		return nil
	}
}

func stringValue(value any) string {
	switch typed := value.(type) {
	case string:
		return strings.TrimSpace(typed)
	default:
		return ""
	}
}

func normalizeSourceType(sourceType string) string {
	return strings.ToLower(strings.TrimSpace(strings.ReplaceAll(sourceType, "_", "-")))
}

func normalizeLinkedObjectType(objectType string) string {
	normalized := normalizeSourceType(objectType)
	switch normalized {
	case "cardnote":
		return "card-note"
	case "generatedcard":
		return "generated-card"
	case "reviewlog":
		return "review-log"
	case "reviewevent":
		return "review-event"
	case "graphnode":
		return "graph-node"
	default:
		return normalized
	}
}

func sourceLinkRelationID(ownerUserID string, linkedObjectType string, linkedObjectID string, sourceType string, sourceID string, ordinal int) string {
	hash := sha1.Sum([]byte(strings.Join([]string{
		ownerUserID,
		linkedObjectType,
		linkedObjectID,
		sourceType,
		sourceID,
		strconv.Itoa(ordinal),
	}, "\x00")))
	return "src-rel-" + hex.EncodeToString(hash[:])[:20]
}

func splitSourceMetadata(sourceType string, sourceID string, sourceMetadata map[string]any) (map[string]any, map[string]any) {
	metadata := cloneMap(sourceMetadata)
	locator := make(map[string]any)

	switch sourceType {
	case "material":
		copyKey(metadata, locator, "materialId", "materialId")
		copyKey(metadata, locator, "sourceMaterialId", "materialId")
		copyKey(metadata, locator, "page", "page")
		copyKey(metadata, locator, "pdfPage", "page")
		copyKey(metadata, locator, "annotationId", "annotationId")
		copyKey(metadata, locator, "anchorId", "anchorId")
	case "annotation":
		locator["annotationId"] = sourceID
		copyKey(metadata, locator, "materialId", "materialId")
		copyKey(metadata, locator, "sourceMaterialId", "materialId")
		copyKey(metadata, locator, "annotationId", "annotationId")
		copyKey(metadata, locator, "page", "page")
		copyKey(metadata, locator, "pdfPage", "page")
	case "pdf-anchor":
		locator["anchorId"] = sourceID
		copyKey(metadata, locator, "materialId", "materialId")
		copyKey(metadata, locator, "sourceMaterialId", "materialId")
		copyKey(metadata, locator, "anchorId", "anchorId")
		copyKey(metadata, locator, "page", "page")
		copyKey(metadata, locator, "pdfPage", "page")
	case "note":
		locator["noteId"] = sourceID
		copyKey(metadata, locator, "noteId", "noteId")
	case "note-block":
		copyKey(metadata, locator, "noteId", "noteId")
		copyKey(metadata, locator, "blockId", "blockId")
	case "graph":
		copyKey(metadata, locator, "graphId", "graphId")
		copyKey(metadata, locator, "focusX", "focusX")
		copyKey(metadata, locator, "focusY", "focusY")
		copyKey(metadata, locator, "focusWidth", "focusWidth")
		copyKey(metadata, locator, "focusHeight", "focusHeight")
		copyKey(metadata, locator, "focusLabel", "focusLabel")
	case "graph-node":
		copyKey(metadata, locator, "graphId", "graphId")
		copyKey(metadata, locator, "nodeId", "nodeId")
		copyKey(metadata, locator, "focusX", "focusX")
		copyKey(metadata, locator, "focusY", "focusY")
		copyKey(metadata, locator, "focusWidth", "focusWidth")
		copyKey(metadata, locator, "focusHeight", "focusHeight")
		copyKey(metadata, locator, "focusLabel", "focusLabel")
	case "ai-draft":
		locator["draftId"] = sourceID
		copyKey(metadata, locator, "draftId", "draftId")
		copyKey(metadata, locator, "taskId", "taskId")
	case "ai-task", "ai":
		locator["taskId"] = sourceID
		copyKey(metadata, locator, "taskId", "taskId")
	case "card":
		locator["cardId"] = sourceID
		copyKey(metadata, locator, "cardId", "cardId")
	}

	return locator, metadata
}

func cloneMap(source map[string]any) map[string]any {
	if len(source) == 0 {
		return nil
	}
	cloned := make(map[string]any, len(source))
	for key, value := range source {
		cloned[key] = value
	}
	return cloned
}

func copyKey(source map[string]any, target map[string]any, sourceKey string, targetKey string) {
	if len(source) == 0 {
		return
	}
	value, ok := source[sourceKey]
	if !ok || value == nil {
		return
	}
	target[targetKey] = value
	delete(source, sourceKey)
}

func popString(values map[string]any, key string) string {
	if len(values) == 0 {
		return ""
	}
	value, ok := values[key]
	if !ok {
		return ""
	}
	delete(values, key)
	trimmed, ok := value.(string)
	if !ok {
		return ""
	}
	return strings.TrimSpace(trimmed)
}

func emptyMapAsNil(values map[string]any) map[string]any {
	if len(values) == 0 {
		return nil
	}
	return values
}
