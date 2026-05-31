package service

import (
	"fmt"
	"strings"

	carddto "studymate/backend/internal/modules/card/dto"
	notedto "studymate/backend/internal/modules/note/dto"
	noterepo "studymate/backend/internal/modules/note/repository"
)

func BuildCardDraftsFromNote(note notedto.NoteSummary) []carddto.CardDraftPayload {
	plainText := strings.TrimSpace(noterepo.ExtractPlainText(note.Content))
	if plainText == "" {
		plainText = strings.TrimSpace(note.Summary)
	}
	if plainText == "" {
		plainText = strings.TrimSpace(note.Title)
	}

	title := strings.TrimSpace(note.Title)
	if title == "" {
		title = "这条笔记"
	}

	drafts := []carddto.CardDraftPayload{
		{
			ID:          "note-core",
			SourceType:  "note",
			SourceID:    note.ID,
			SourceLabel: title,
			Front:       fmt.Sprintf("%s 的核心内容是什么？", title),
			Back:        truncateDraftText(note.Summary, plainText, 220),
			Explanation: "根据笔记标题与摘要整理出的复习卡片草稿。",
		},
	}

	keyPoint := firstSentenceCandidate(plainText)
	if keyPoint != "" && !strings.EqualFold(keyPoint, drafts[0].Back) {
		drafts = append(drafts, carddto.CardDraftPayload{
			ID:          "note-keypoint",
			SourceType:  "note",
			SourceID:    note.ID,
			SourceLabel: title,
			Front:       fmt.Sprintf("在 %s 中，最值得记住的一点是什么？", title),
			Back:        keyPoint,
			Explanation: "从笔记正文中提取出的首个关键句，确认后可继续修改。",
		})
	}

	return drafts
}

func truncateDraftText(preferred string, fallback string, maxLen int) string {
	base := strings.TrimSpace(preferred)
	if base == "" {
		base = strings.TrimSpace(fallback)
	}
	if len(base) <= maxLen {
		return base
	}

	return strings.TrimSpace(base[:maxLen]) + "..."
}

func firstSentenceCandidate(value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return ""
	}

	separators := []string{"。", "！", "？", ".", "!", "?", "\n"}
	for _, separator := range separators {
		if index := strings.Index(trimmed, separator); index > 0 {
			return strings.TrimSpace(trimmed[:index+len(separator)])
		}
	}

	return truncateDraftText("", trimmed, 180)
}
