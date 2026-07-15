package service

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	carddto "studymate/backend/internal/modules/card/dto"
	"studymate/backend/internal/pkg/apperrors"
)

type portableDeckCard struct {
	Front          string         `json:"front"`
	Back           string         `json:"back"`
	CardType       string         `json:"cardType"`
	Tags           []string       `json:"tags,omitempty"`
	SourceType     string         `json:"sourceType,omitempty"`
	SourceID       string         `json:"sourceId,omitempty"`
	SourceMetadata map[string]any `json:"sourceMetadata,omitempty"`
}

type portableDeckDocument struct {
	App        string             `json:"app"`
	Version    int                `json:"version"`
	Kind       string             `json:"kind"`
	ExportedAt string             `json:"exportedAt"`
	Deck       portableDeckMeta   `json:"deck"`
	Cards      []portableDeckCard `json:"cards"`
}

type portableDeckMeta struct {
	Title     string `json:"title"`
	CardCount int    `json:"cardCount"`
}

type portableImportRow struct {
	RowNumber int
	Raw       any
}

type deckImportCandidate struct {
	Request     carddto.CreateCardRequest
	RowNumber   int
	Front       string
	Signature   string
}

type deckImportAnalysis struct {
	TotalCount       int
	ReadyCards       []carddto.CreateCardRequest
	DuplicateSamples []carddto.DeckImportIssuePayload
	FailureSamples   []carddto.DeckImportIssuePayload
}

func buildDeckExportArtifact(deckTitle string, cards []carddto.CardPayload, format string, exportedAt time.Time) (*carddto.DeckExportPayload, error) {
	portableCards := make([]portableDeckCard, 0, len(cards))
	for _, card := range cards {
		portableCards = append(portableCards, portableDeckCard{
			Front:          card.Front,
			Back:           card.Back,
			CardType:       defaultPortableCardType(card.CardType),
			Tags:           normalizeCardTags(card.Tags),
			SourceType:     strings.TrimSpace(card.SourceType),
			SourceID:       strings.TrimSpace(card.SourceID),
			SourceMetadata: card.SourceMetadata,
		})
	}

	filenameBase := sanitizeDeckExportFilename(deckTitle) + "-cards"
	if format == "csv" {
		return &carddto.DeckExportPayload{
			Format:     "csv",
			Filename:   filenameBase + ".csv",
			MimeType:   "text/csv;charset=utf-8",
			Content:    buildDeckCSVContent(portableCards),
			CardCount:  len(portableCards),
			ExportedAt: exportedAt.Format(time.RFC3339),
		}, nil
	}

	raw, err := json.MarshalIndent(portableDeckDocument{
		App:        "StudyMate",
		Version:    1,
		Kind:       "deck-cards",
		ExportedAt: exportedAt.Format(time.RFC3339),
		Deck: portableDeckMeta{
			Title:     deckTitle,
			CardCount: len(portableCards),
		},
		Cards: portableCards,
	}, "", "  ")
	if err != nil {
		return nil, apperrors.Internal("构建卡组导出内容失败")
	}

	return &carddto.DeckExportPayload{
		Format:     "json",
		Filename:   filenameBase + ".json",
		MimeType:   "application/json;charset=utf-8",
		Content:    string(raw),
		CardCount:  len(portableCards),
		ExportedAt: exportedAt.Format(time.RFC3339),
	}, nil
}

func analyzeDeckImportRequest(request carddto.ImportDeckRequest, existingCards []carddto.CardPayload) (*deckImportAnalysis, error) {
	filename := strings.TrimSpace(request.Filename)
	content := request.Content
	if filename == "" {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_deck_import_filename", "导入文件名不能为空")
	}
	if strings.TrimSpace(content) == "" {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_deck_import_content", "导入文件内容不能为空")
	}

	var rows []portableImportRow
	switch detectDeckImportKind(filename, content) {
	case "json":
		parsedRows, err := parseDeckJSONRows(content)
		if err != nil {
			return nil, err
		}
		rows = parsedRows
	case "csv":
		parsedRows, err := parseDeckCSVRows(content)
		if err != nil {
			return nil, err
		}
		rows = parsedRows
	default:
		return nil, apperrors.New(http.StatusBadRequest, "invalid_deck_import_kind", "只支持 JSON 或 CSV 卡片文件")
	}

	analysis := &deckImportAnalysis{
		TotalCount: rowsToImportCount(rows),
		ReadyCards: make([]carddto.CreateCardRequest, 0, len(rows)),
	}
	if len(rows) == 0 {
		return analysis, nil
	}

	existingSignatures := make(map[string]struct{}, len(existingCards))
	for _, card := range existingCards {
		existingSignatures[buildDeckImportSignature(carddto.CreateCardRequest{
			CardType:   card.CardType,
			Front:      card.Front,
			Back:       card.Back,
			SourceType: card.SourceType,
			SourceID:   card.SourceID,
		})] = struct{}{}
	}

	seenImportSignatures := make(map[string]struct{}, len(rows))
	for _, row := range rows {
		card, err := normalizePortableImportCard(row.Raw)
		if err != nil {
			analysis.FailureSamples = append(analysis.FailureSamples, carddto.DeckImportIssuePayload{
				RowNumber: row.RowNumber,
				Front:     extractPortableFrontPreview(row.Raw),
				Message:   err.Error(),
			})
			continue
		}

		signature := buildDeckImportSignature(card)
		candidate := deckImportCandidate{
			Request:   card,
			RowNumber: row.RowNumber,
			Front:     summarizePortableImportFront(card.Front),
			Signature: signature,
		}
		if _, exists := existingSignatures[candidate.Signature]; exists {
			analysis.DuplicateSamples = append(analysis.DuplicateSamples, carddto.DeckImportIssuePayload{
				RowNumber: candidate.RowNumber,
				Front:     candidate.Front,
				Message:   "与当前卡组中的现有卡片重复",
			})
			continue
		}
		if _, exists := seenImportSignatures[candidate.Signature]; exists {
			analysis.DuplicateSamples = append(analysis.DuplicateSamples, carddto.DeckImportIssuePayload{
				RowNumber: candidate.RowNumber,
				Front:     candidate.Front,
				Message:   "与本次导入文件中的前序卡片重复",
			})
			continue
		}

		seenImportSignatures[candidate.Signature] = struct{}{}
		analysis.ReadyCards = append(analysis.ReadyCards, candidate.Request)
	}

	return analysis, nil
}

func sanitizeDeckExportFilename(title string) string {
	replacer := strings.NewReplacer("\\", "-", "/", "-", ":", "-", "*", "-", "?", "-", "\"", "-", "<", "-", ">", "-", "|", "-")
	cleaned := replacer.Replace(strings.TrimSpace(title))
	cleaned = strings.Join(strings.Fields(cleaned), "-")
	if cleaned == "" {
		return "deck"
	}
	return cleaned
}

func buildDeckCSVContent(cards []portableDeckCard) string {
	var builder strings.Builder
	builder.WriteString("front,back,cardType,tags,sourceType,sourceId")
	for _, card := range cards {
		builder.WriteByte('\n')
		builder.WriteString(strings.Join([]string{
			encodeCSVField(card.Front),
			encodeCSVField(card.Back),
			encodeCSVField(defaultPortableCardType(card.CardType)),
			encodeCSVField(strings.Join(card.Tags, "|")),
			encodeCSVField(card.SourceType),
			encodeCSVField(card.SourceID),
		}, ","))
	}
	return builder.String()
}

func encodeCSVField(value string) string {
	if !strings.ContainsAny(value, "\",\n\r") {
		return value
	}
	return `"` + strings.ReplaceAll(value, `"`, `""`) + `"`
}

func detectDeckImportKind(filename string, content string) string {
	lowerFilename := strings.ToLower(strings.TrimSpace(filename))
	if strings.HasSuffix(lowerFilename, ".json") {
		return "json"
	}
	if strings.HasSuffix(lowerFilename, ".csv") {
		return "csv"
	}

	trimmed := strings.TrimSpace(content)
	if strings.HasPrefix(trimmed, "{") || strings.HasPrefix(trimmed, "[") {
		return "json"
	}
	return "csv"
}

func parseDeckJSONRows(content string) ([]portableImportRow, error) {
	var parsed any
	if err := json.Unmarshal([]byte(content), &parsed); err != nil {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_deck_import_json", "JSON 卡片文件格式无效")
	}

	var rawCards []any
	switch typed := parsed.(type) {
	case []any:
		rawCards = typed
	case map[string]any:
		if cards, ok := typed["cards"].([]any); ok {
			rawCards = cards
		}
	}

	result := make([]portableImportRow, 0, len(rawCards))
	for index, raw := range rawCards {
		result = append(result, portableImportRow{
			RowNumber: index + 1,
			Raw:       raw,
		})
	}
	return result, nil
}

func parseDeckCSVRows(content string) ([]portableImportRow, error) {
	rows := parseCSVRows(content)
	if len(rows) == 0 {
		return nil, nil
	}

	header := make([]string, 0, len(rows[0]))
	for _, value := range rows[0] {
		header = append(header, strings.ToLower(strings.TrimSpace(value)))
	}

	frontIndex := indexOfCSVHeader(header, "front")
	backIndex := indexOfCSVHeader(header, "back")
	cardTypeIndex := indexOfCSVHeader(header, "cardtype")
	tagsIndex := indexOfCSVHeader(header, "tags")
	sourceTypeIndex := indexOfCSVHeader(header, "sourcetype")
	sourceIDIndex := indexOfCSVHeader(header, "sourceid")
	if frontIndex == -1 || backIndex == -1 {
		return nil, apperrors.New(http.StatusBadRequest, "invalid_deck_import_csv", "CSV 必须包含 front 和 back 列")
	}

	result := make([]portableImportRow, 0, len(rows)-1)
	for index, row := range rows[1:] {
		if isEmptyCSVRow(row) {
			continue
		}
		result = append(result, portableImportRow{
			RowNumber: index + 2,
			Raw: map[string]any{
				"front":      csvValueAt(row, frontIndex),
				"back":       csvValueAt(row, backIndex),
				"cardType":   csvValueAt(row, cardTypeIndex),
				"tags":       splitPortableTags(csvValueAt(row, tagsIndex)),
				"sourceType": csvValueAt(row, sourceTypeIndex),
				"sourceId":   csvValueAt(row, sourceIDIndex),
			},
		})
	}
	return result, nil
}

func normalizePortableImportCard(raw any) (carddto.CreateCardRequest, error) {
	record, _ := raw.(map[string]any)
	front := strings.TrimSpace(stringValue(record["front"]))
	back := strings.TrimSpace(stringValue(record["back"]))
	if front == "" || back == "" {
		return carddto.CreateCardRequest{}, apperrors.New(http.StatusBadRequest, "invalid_deck_import_card", "缺少 front 或 back")
	}

	cardType := defaultPortableCardType(stringValue(record["cardType"]))
	var tags []string
	switch typed := record["tags"].(type) {
	case []any:
		values := make([]string, 0, len(typed))
		for _, value := range typed {
			values = append(values, stringValue(value))
		}
		tags = normalizeCardTags(values)
	case []string:
		tags = normalizeCardTags(typed)
	default:
		tags = normalizeCardTags(splitPortableTags(stringValue(record["tags"])))
	}

	sourceMetadata, _ := record["sourceMetadata"].(map[string]any)
	return carddto.CreateCardRequest{
		CardType:       cardType,
		Front:          front,
		Back:           back,
		Tags:           tags,
		SourceType:     strings.TrimSpace(stringValue(record["sourceType"])),
		SourceID:       strings.TrimSpace(stringValue(record["sourceId"])),
		SourceMetadata: sourceMetadata,
	}, nil
}

func rowsToImportCount(rows []portableImportRow) int {
	count := 0
	for _, row := range rows {
		if row.RowNumber > 0 {
			count++
		}
	}
	return count
}

func buildDeckImportSignature(card carddto.CreateCardRequest) string {
	return strings.Join([]string{
		normalizeCardType(card.CardType),
		strings.TrimSpace(card.Front),
		strings.TrimSpace(card.Back),
		strings.TrimSpace(card.SourceType),
		strings.TrimSpace(card.SourceID),
	}, "\x1f")
}

func summarizePortableImportFront(value string) string {
	trimmed := strings.TrimSpace(value)
	if len(trimmed) <= 40 {
		return trimmed
	}
	return trimmed[:40] + "..."
}

func extractPortableFrontPreview(raw any) string {
	record, _ := raw.(map[string]any)
	return summarizePortableImportFront(stringValue(record["front"]))
}

func buildDeckImportPayload(preview bool, analysis *deckImportAnalysis, importedCount int) *carddto.DeckImportPayload {
	return &carddto.DeckImportPayload{
		Preview:          preview,
		TotalCount:       analysis.TotalCount,
		ReadyCount:       len(analysis.ReadyCards),
		ImportedCount:    importedCount,
		DuplicateCount:   len(analysis.DuplicateSamples),
		FailedCount:      len(analysis.FailureSamples),
		DuplicateSamples: analysis.DuplicateSamples,
		FailureSamples:   analysis.FailureSamples,
		StatusMessage:    buildDeckImportStatusMessage(preview, len(analysis.ReadyCards), importedCount, len(analysis.DuplicateSamples), len(analysis.FailureSamples)),
	}
}

func buildDeckImportStatusMessage(preview bool, readyCount int, importedCount int, duplicateCount int, failedCount int) string {
	if preview {
		if readyCount == 0 {
			if duplicateCount == 0 && failedCount == 0 {
				return "预检完成：导入文件中没有可用卡片。"
			}
			return "预检完成：没有可导入卡片，" + buildDeckImportSkipSummary(duplicateCount, failedCount) + "。"
		}
		if duplicateCount == 0 && failedCount == 0 {
			return "预检完成：可导入 " + strconv.Itoa(readyCount) + " 张卡片。"
		}
		return "预检完成：可导入 " + strconv.Itoa(readyCount) + " 张，已发现 " + buildDeckImportSkipSummary(duplicateCount, failedCount) + "。"
	}

	if importedCount == 0 {
		if duplicateCount == 0 && failedCount == 0 {
			return "没有导入新卡片。"
		}
		return "没有导入新卡片，已跳过 " + buildDeckImportSkipSummary(duplicateCount, failedCount) + "。"
	}
	if duplicateCount == 0 && failedCount == 0 {
		return "已导入 " + strconv.Itoa(importedCount) + " 张卡片到当前卡组。"
	}
	return "已导入 " + strconv.Itoa(importedCount) + " 张卡片到当前卡组，已跳过 " + buildDeckImportSkipSummary(duplicateCount, failedCount) + "。"
}

func buildDeckImportSkipSummary(duplicateCount int, failedCount int) string {
	parts := make([]string, 0, 2)
	if duplicateCount > 0 {
		parts = append(parts, strconv.Itoa(duplicateCount)+" 张重复卡片")
	}
	if failedCount > 0 {
		parts = append(parts, strconv.Itoa(failedCount)+" 行无效内容")
	}
	return strings.Join(parts, "和")
}

func defaultPortableCardType(value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return "basic"
	}
	return trimmed
}

func parseCSVRows(content string) [][]string {
	rows := make([][]string, 0)
	row := make([]string, 0)
	var field strings.Builder
	inQuotes := false

	for index := 0; index < len(content); index++ {
		char := content[index]
		var next byte
		if index+1 < len(content) {
			next = content[index+1]
		}

		if char == '"' {
			if inQuotes && next == '"' {
				field.WriteByte('"')
				index++
			} else {
				inQuotes = !inQuotes
			}
			continue
		}

		if char == ',' && !inQuotes {
			row = append(row, field.String())
			field.Reset()
			continue
		}

		if (char == '\n' || char == '\r') && !inQuotes {
			if char == '\r' && next == '\n' {
				index++
			}
			row = append(row, field.String())
			rows = append(rows, row)
			row = make([]string, 0)
			field.Reset()
			continue
		}

		field.WriteByte(char)
	}

	if field.Len() > 0 || len(row) > 0 {
		row = append(row, field.String())
		rows = append(rows, row)
	}

	filtered := make([][]string, 0, len(rows))
	for _, currentRow := range rows {
		if len(currentRow) == 1 && strings.TrimSpace(currentRow[0]) == "" {
			continue
		}
		filtered = append(filtered, currentRow)
	}
	return filtered
}

func indexOfCSVHeader(header []string, want string) int {
	for index, value := range header {
		if value == want {
			return index
		}
	}
	return -1
}

func csvValueAt(row []string, index int) string {
	if index < 0 || index >= len(row) {
		return ""
	}
	return row[index]
}

func isEmptyCSVRow(row []string) bool {
	for _, value := range row {
		if strings.TrimSpace(value) != "" {
			return false
		}
	}
	return true
}

func splitPortableTags(value string) []string {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	parts := strings.Split(value, "|")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}

func stringValue(value any) string {
	if typed, ok := value.(string); ok {
		return typed
	}
	return ""
}
