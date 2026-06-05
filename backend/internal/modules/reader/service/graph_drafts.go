package service

import (
	"fmt"
	"strings"

	aidto "studymate/backend/internal/modules/ai/dto"
	graphdto "studymate/backend/internal/modules/graph/dto"
	readerdto "studymate/backend/internal/modules/reader/dto"
)

func BuildGraphDraftFromAnnotations(materialTitle string, materialID string, annotations []readerdto.AnnotationSummary) aidto.DraftPayload {
	title := strings.TrimSpace(materialTitle)
	if title == "" {
		title = "未命名资料"
	}

	nodes := make([]graphdto.GraphNodePayload, 0, len(annotations)+1)
	edges := make([]graphdto.GraphEdgePayload, 0, len(annotations))
	sourceNodeID := "proposal-material-source"
	nodes = append(nodes, graphdto.GraphNodePayload{
		ID:     sourceNodeID,
		Type:   "material",
		Title:  title,
		X:      0,
		Y:      0,
		Width:  260,
		Height: 140,
		Source: &graphdto.GraphNodeSourcePayload{
			Type:  "material",
			ID:    materialID,
			Label: title,
		},
		Metadata: map[string]any{
			"origin": "material",
		},
	})

	summaries := make([]string, 0, len(annotations))
	for index, annotation := range annotations {
		core := strings.TrimSpace(annotation.Comment)
		if core == "" {
			core = strings.TrimSpace(annotation.Quote)
		}
		if core == "" {
			continue
		}

		nodeID := fmt.Sprintf("proposal-annotation-%d", index+1)
		nodes = append(nodes, graphdto.GraphNodePayload{
			ID:     nodeID,
			Type:   "text",
			Title:  fmt.Sprintf("第 %d 页批注", annotation.Page),
			X:      320,
			Y:      float64(index) * 160,
			Width:  240,
			Height: 120,
			Source: &graphdto.GraphNodeSourcePayload{
				Type:    "annotation",
				ID:      annotation.ID,
				Label:   title,
				Excerpt: truncateReaderText(core, 160),
			},
			Metadata: map[string]any{
				"annotationId": annotation.ID,
				"detail":       truncateReaderText(core, 160),
				"materialId":   materialID,
				"origin":       "reader_annotation",
				"page":         annotation.Page,
			},
		})
		edges = append(edges, graphdto.GraphEdgePayload{
			ID:           fmt.Sprintf("proposal-annotation-edge-%d", index+1),
			Kind:         "straight",
			SourceNodeID: sourceNodeID,
			TargetNodeID: nodeID,
			Label:        "摘录",
		})
		summaries = append(summaries, truncateReaderText(core, 60))
	}

	summary := title
	if len(summaries) > 0 {
		summary = strings.Join(summaries, "；")
	}

	return aidto.DraftPayload{
		DraftType:   "graph_change",
		TargetType:  "graph",
		TargetID:    "",
		Status:      "pending",
		SourceType:  "material",
		SourceID:    materialID,
		SourceLabel: title,
		Front:       fmt.Sprintf("将《%s》的批注补入知识图谱", title),
		Back:        truncateReaderText(summary, 220),
		Explanation: "该草稿会把当前资料的批注整理成候选图谱节点，确认后写入你选择的知识图谱。",
		Metadata: map[string]any{
			"summary": summary,
			"nodes":   nodes,
			"edges":   edges,
		},
	}
}
