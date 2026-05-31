package service

import (
	"fmt"
	"strings"

	aidto "studymate/backend/internal/modules/ai/dto"
	graphdto "studymate/backend/internal/modules/graph/dto"
	notedto "studymate/backend/internal/modules/note/dto"
	noterepo "studymate/backend/internal/modules/note/repository"
)

func BuildGraphDraftFromNote(note notedto.NoteSummary) aidto.DraftPayload {
	title := strings.TrimSpace(note.Title)
	if title == "" {
		title = "未命名笔记"
	}

	summary := strings.TrimSpace(note.Summary)
	plainText := strings.TrimSpace(noterepo.ExtractPlainText(note.Content))
	if summary == "" {
		summary = firstSentenceCandidate(plainText)
	}
	if summary == "" {
		summary = title
	}

	sourceNodeID := "proposal-note-source"
	conceptNodeID := "proposal-note-concept"
	nodes := []graphdto.GraphNodePayload{
		{
			ID:     sourceNodeID,
			Type:   "rich-note",
			Title:  title,
			X:      0,
			Y:      0,
			Width:  260,
			Height: 140,
			Source: &graphdto.GraphNodeSourcePayload{
				Type:    "note",
				ID:      note.ID,
				Label:   title,
				Excerpt: truncateDraftText(summary, plainText, 180),
			},
			Metadata: map[string]any{
				"detail": truncateDraftText(summary, plainText, 180),
				"origin": "note",
			},
		},
		{
			ID:     conceptNodeID,
			Type:   "text",
			Title:  title + " 要点",
			X:      320,
			Y:      0,
			Width:  240,
			Height: 120,
			Source: &graphdto.GraphNodeSourcePayload{
				Type:    "note",
				ID:      note.ID,
				Label:   title,
				Excerpt: truncateDraftText(summary, plainText, 180),
			},
			Metadata: map[string]any{
				"detail": truncateDraftText(summary, plainText, 180),
				"origin": "ai_draft",
			},
		},
	}

	edges := []graphdto.GraphEdgePayload{
		{
			ID:           "proposal-note-edge-1",
			Kind:         "straight",
			SourceNodeID: sourceNodeID,
			TargetNodeID: conceptNodeID,
			Label:        "提炼",
		},
	}

	return aidto.DraftPayload{
		DraftType:   "graph_change",
		TargetType:  "graph",
		TargetID:    "",
		Status:      "pending",
		SourceType:  "note",
		SourceID:    note.ID,
		SourceLabel: title,
		Front:       fmt.Sprintf("将《%s》补入知识图谱", title),
		Back:        truncateDraftText(summary, plainText, 220),
		Explanation: "该草稿会把当前笔记提炼成图谱节点与连线，确认后写入你选择的知识图谱。",
		Metadata: map[string]any{
			"summary": summary,
			"nodes":   nodes,
			"edges":   edges,
		},
	}
}
