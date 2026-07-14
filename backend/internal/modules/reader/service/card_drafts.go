package service

import (
	"fmt"
	"strings"

	carddto "studymate/backend/internal/modules/card/dto"
	readerdto "studymate/backend/internal/modules/reader/dto"
)

func BuildCardDraftsFromAnnotations(materialTitle string, annotations []readerdto.AnnotationSummary) []carddto.CardDraftPayload {
	drafts := make([]carddto.CardDraftPayload, 0, len(annotations))
	for index, annotation := range annotations {
		back := strings.TrimSpace(annotation.Comment)
		if back == "" {
			back = strings.TrimSpace(annotation.Quote)
		}
		if back == "" {
			continue
		}

		front := fmt.Sprintf("在《%s》第 %d 页，这条批注提醒了什么？", materialTitle, annotation.Page)
		if quote := strings.TrimSpace(annotation.Quote); quote != "" {
			front = fmt.Sprintf("这段引文想强调什么：%s", truncateReaderText(quote, 90))
		}

		drafts = append(drafts, carddto.CardDraftPayload{
			ID:          fmt.Sprintf("annotation-%d", index+1),
			SourceType:  "annotation",
			SourceID:    annotation.ID,
			SourceLabel: materialTitle,
			SourceMetadata: map[string]any{
				"materialId":   annotation.MaterialID,
				"annotationId": annotation.ID,
				"page":         annotation.Page,
			},
			Front:       front,
			Back:        truncateReaderText(back, 220),
			Explanation: "根据阅读批注生成的复习卡片草稿，确认后会写入所选 deck。",
		})
	}

	return drafts
}

func truncateReaderText(value string, maxLen int) string {
	trimmed := strings.TrimSpace(value)
	if len(trimmed) <= maxLen {
		return trimmed
	}

	return strings.TrimSpace(trimmed[:maxLen]) + "..."
}
