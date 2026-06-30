package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"sort"
	"strings"

	aidto "studymate/backend/internal/modules/ai/dto"
	carddto "studymate/backend/internal/modules/card/dto"
	graphdto "studymate/backend/internal/modules/graph/dto"
)

var (
	markdownHeadingPattern = regexp.MustCompile(`^(#{1,6})\s+(.+)$`)
	mermaidNodePattern     = regexp.MustCompile(`([A-Za-z0-9_]+)(\[[^\]]+\]|\([^)]+\)|\{[^}]+\}|>[^>]+])?`)
)

func BuildDocumentFromMarkdownOutline(graphID string, version int64, source string) graphdto.GraphDocumentPayload {
	lines := strings.Split(source, "\n")
	nodes := make([]graphdto.GraphNodePayload, 0, len(lines))
	edges := make([]graphdto.GraphEdgePayload, 0, len(lines))
	levelStack := make(map[int]string)
	levelOrder := make([]int, 0, 6)
	levelCounts := make(map[int]int)

	for _, rawLine := range lines {
		line := strings.TrimSpace(rawLine)
		if line == "" {
			continue
		}

		matches := markdownHeadingPattern.FindStringSubmatch(line)
		if len(matches) != 3 {
			continue
		}

		level := len(matches[1])
		title := strings.TrimSpace(matches[2])
		if title == "" {
			continue
		}

		levelCounts[level]++
		nodeID := fmt.Sprintf("md-%d-%d", level, levelCounts[level])
		node := graphdto.GraphNodePayload{
			ID:     nodeID,
			Type:   "text",
			Title:  title,
			X:      float64((level - 1) * 280),
			Y:      float64((len(nodes)) * 150),
			Width:  240,
			Height: 120,
			Metadata: map[string]any{
				"origin": "markdown",
				"level":  level,
			},
		}
		nodes = append(nodes, node)

		var parentID string
		for _, existingLevel := range levelOrder {
			if existingLevel < level {
				parentID = levelStack[existingLevel]
			}
		}
		if parentID != "" {
			edges = append(edges, graphdto.GraphEdgePayload{
				ID:           fmt.Sprintf("md-edge-%d", len(edges)+1),
				Kind:         "straight",
				SourceNodeID: parentID,
				TargetNodeID: nodeID,
				Label:        "包含",
			})
		}

		levelStack[level] = nodeID
		nextOrder := make([]int, 0, len(levelOrder)+1)
		inserted := false
		for _, existingLevel := range levelOrder {
			if existingLevel < level {
				nextOrder = append(nextOrder, existingLevel)
				continue
			}
			if !inserted {
				nextOrder = append(nextOrder, level)
				inserted = true
			}
		}
		if !inserted {
			nextOrder = append(nextOrder, level)
		}
		levelOrder = nextOrder
		for existingLevel := range levelStack {
			if existingLevel > level {
				delete(levelStack, existingLevel)
			}
		}
	}

	return graphdto.GraphDocumentPayload{
		GraphID:       graphID,
		Version:       version,
		SchemaVersion: 1,
		Viewport: graphdto.GraphViewportPayload{
			X:    120,
			Y:    90,
			Zoom: 1,
		},
		Nodes:    nodes,
		Edges:    edges,
		Groups:   []graphdto.GraphGroupPayload{},
		Theme:    map[string]any{},
		Metadata: map[string]any{"importType": "markdown"},
	}
}

func BuildDocumentFromMermaid(graphID string, version int64, source string) (graphdto.GraphDocumentPayload, error) {
	lines := strings.Split(source, "\n")
	nodesByID := make(map[string]graphdto.GraphNodePayload)
	nodeOrder := make([]string, 0, len(lines))
	edges := make([]graphdto.GraphEdgePayload, 0, len(lines))

	for _, rawLine := range lines {
		line := strings.TrimSpace(rawLine)
		if line == "" || strings.HasPrefix(line, "flowchart") || strings.HasPrefix(line, "graph") {
			continue
		}

		parts := strings.Split(line, "-->")
		if len(parts) != 2 {
			continue
		}

		leftID, leftTitle := parseMermaidNode(parts[0])
		rightID, rightTitle := parseMermaidNode(parts[1])
		if leftID == "" || rightID == "" {
			continue
		}

		if _, exists := nodesByID[leftID]; !exists {
			nodeOrder = append(nodeOrder, leftID)
			nodesByID[leftID] = buildMermaidNode(leftID, leftTitle, len(nodeOrder)-1)
		}
		if _, exists := nodesByID[rightID]; !exists {
			nodeOrder = append(nodeOrder, rightID)
			nodesByID[rightID] = buildMermaidNode(rightID, rightTitle, len(nodeOrder)-1)
		}

		edges = append(edges, graphdto.GraphEdgePayload{
			ID:           fmt.Sprintf("mm-edge-%d", len(edges)+1),
			Kind:         "straight",
			SourceNodeID: leftID,
			TargetNodeID: rightID,
			Label:        "flow",
		})
	}

	if len(nodesByID) == 0 {
		return graphdto.GraphDocumentPayload{}, fmt.Errorf("no mermaid flow edges found")
	}

	nodes := make([]graphdto.GraphNodePayload, 0, len(nodeOrder))
	for _, nodeID := range nodeOrder {
		nodes = append(nodes, nodesByID[nodeID])
	}

	return graphdto.GraphDocumentPayload{
		GraphID:       graphID,
		Version:       version,
		SchemaVersion: 1,
		Viewport:      graphdto.GraphViewportPayload{X: 120, Y: 90, Zoom: 1},
		Nodes:         nodes,
		Edges:         edges,
		Groups:        []graphdto.GraphGroupPayload{},
		Theme:         map[string]any{},
		Metadata:      map[string]any{"importType": "mermaid"},
	}, nil
}

func ValidateDocument(document graphdto.GraphDocumentPayload) []graphdto.GraphValidationIssuePayload {
	issues := make([]graphdto.GraphValidationIssuePayload, 0)
	nodeMap := make(map[string]graphdto.GraphNodePayload, len(document.Nodes))
	titleMap := make(map[string][]string)
	connectedNodeIDs := make(map[string]struct{})
	for _, node := range document.Nodes {
		nodeID := strings.TrimSpace(node.ID)
		if nodeID == "" {
			issues = append(issues, graphdto.GraphValidationIssuePayload{
				RuleType: "missing_node_id",
				Message:  "节点 ID 不能为空",
				Severity: "error",
			})
			continue
		}
		if _, exists := nodeMap[nodeID]; exists {
			issues = append(issues, graphdto.GraphValidationIssuePayload{
				RuleType: "duplicate_node_id",
				Message:  "节点 ID 重复",
				TargetID: nodeID,
				Severity: "error",
			})
		}
		nodeMap[nodeID] = node
		if strings.TrimSpace(node.Title) == "" {
			issues = append(issues, graphdto.GraphValidationIssuePayload{
				RuleType: "empty_node_title",
				Message:  "节点标题不能为空",
				TargetID: nodeID,
				Severity: "warning",
			})
		} else {
			titleKey := strings.ToLower(strings.TrimSpace(node.Title))
			titleMap[titleKey] = append(titleMap[titleKey], nodeID)
		}
		if node.Width < 80 || node.Height < 48 || node.Width > 1200 || node.Height > 900 {
			issues = append(issues, graphdto.GraphValidationIssuePayload{
				RuleType: "invalid_node_size",
				Message:  "节点尺寸不在允许范围内",
				TargetID: nodeID,
				Severity: "error",
			})
		}
		if node.Source == nil || strings.TrimSpace(node.Source.ID) == "" {
			issues = append(issues, graphdto.GraphValidationIssuePayload{
				RuleType: "missing_source",
				Message:  "节点缺少可追溯来源",
				TargetID: nodeID,
				Severity: "warning",
			})
		}
		if node.Source != nil {
			sourceType := strings.TrimSpace(node.Source.Type)
			sourceID := strings.TrimSpace(node.Source.ID)
			if (sourceType == "" && sourceID != "") || (sourceType != "" && sourceID == "") {
				issues = append(issues, graphdto.GraphValidationIssuePayload{
					RuleType: "invalid_source_target",
					Message:  "来源类型和来源 ID 必须同时存在",
					TargetID: nodeID,
					Severity: "error",
				})
			}
		}
	}

	for _, nodeIDs := range titleMap {
		if len(nodeIDs) <= 1 {
			continue
		}
		for _, nodeID := range nodeIDs {
			issues = append(issues, graphdto.GraphValidationIssuePayload{
				RuleType: "duplicate_title",
				Message:  "存在重复标题节点",
				TargetID: nodeID,
				Severity: "warning",
			})
		}
	}

	for _, edge := range document.Edges {
		if _, ok := nodeMap[edge.SourceNodeID]; !ok {
			issues = append(issues, graphdto.GraphValidationIssuePayload{
				RuleType: "dangling_edge",
				Message:  "连线起点不存在",
				TargetID: edge.ID,
				Severity: "error",
			})
		} else {
			connectedNodeIDs[edge.SourceNodeID] = struct{}{}
		}
		if _, ok := nodeMap[edge.TargetNodeID]; !ok {
			issues = append(issues, graphdto.GraphValidationIssuePayload{
				RuleType: "dangling_edge",
				Message:  "连线终点不存在",
				TargetID: edge.ID,
				Severity: "error",
			})
		} else {
			connectedNodeIDs[edge.TargetNodeID] = struct{}{}
		}
		for _, targetID := range readMultiTargetNodeIDs(edge.Metadata) {
			if _, exists := nodeMap[strings.TrimSpace(targetID)]; !exists {
				issues = append(issues, graphdto.GraphValidationIssuePayload{
					RuleType: "dangling_edge",
					Message:  "多目标连线包含不存在的目标节点",
					TargetID: edge.ID,
					Severity: "error",
				})
			}
		}
	}

	collapsedGroupByNodeID := make(map[string]string)
	for _, group := range document.Groups {
		if len(group.NodeIDs) == 0 {
			issues = append(issues, graphdto.GraphValidationIssuePayload{
				RuleType: "empty_group",
				Message:  "分组内没有节点",
				TargetID: group.ID,
				Severity: "warning",
			})
		}
		for _, nodeID := range group.NodeIDs {
			if _, exists := nodeMap[nodeID]; !exists {
				issues = append(issues, graphdto.GraphValidationIssuePayload{
					RuleType: "invalid_group_node",
					Message:  "分组引用了不存在的节点",
					TargetID: group.ID,
					Severity: "error",
				})
			}
			if group.Collapsed {
				collapsedGroupByNodeID[nodeID] = group.ID
			}
		}
	}

	for _, edge := range document.Edges {
		sourceGroup := collapsedGroupByNodeID[edge.SourceNodeID]
		targetGroup := collapsedGroupByNodeID[edge.TargetNodeID]
		if (sourceGroup != "" || targetGroup != "") && sourceGroup != targetGroup {
			issues = append(issues, graphdto.GraphValidationIssuePayload{
				RuleType: "cross_collapsed_group_edge",
				Message:  "连线跨过折叠分组边界",
				TargetID: edge.ID,
				Severity: "warning",
			})
		}
	}

	for _, node := range document.Nodes {
		if _, connected := connectedNodeIDs[node.ID]; !connected {
			issues = append(issues, graphdto.GraphValidationIssuePayload{
				RuleType: "isolated_node",
				Message:  "节点没有任何连线",
				TargetID: node.ID,
				Severity: "info",
			})
		}
	}

	sort.SliceStable(issues, func(left, right int) bool {
		leftRank := validationSeverityRank(issues[left].Severity)
		rightRank := validationSeverityRank(issues[right].Severity)
		if leftRank != rightRank {
			return leftRank < rightRank
		}
		if issues[left].RuleType != issues[right].RuleType {
			return issues[left].RuleType < issues[right].RuleType
		}
		return issues[left].TargetID < issues[right].TargetID
	})

	return issues
}

func readMultiTargetNodeIDs(metadata map[string]any) []string {
	rawTargets := metadata["targetNodeIds"]
	switch targets := rawTargets.(type) {
	case []string:
		return targets
	case []any:
		result := make([]string, 0, len(targets))
		for _, rawTarget := range targets {
			targetID, ok := rawTarget.(string)
			if !ok {
				targetID = ""
			}
			result = append(result, targetID)
		}
		return result
	default:
		return []string{}
	}
}

func HasBlockingValidationIssues(issues []graphdto.GraphValidationIssuePayload) bool {
	for _, issue := range issues {
		if issue.Severity == "error" {
			return true
		}
	}

	return false
}

func BuildCardDrafts(document graphdto.GraphDocumentPayload, nodeIDs []string) []graphdto.GraphCardDraftPayload {
	nodeMap := make(map[string]graphdto.GraphNodePayload, len(document.Nodes))
	for _, node := range document.Nodes {
		nodeMap[node.ID] = node
	}

	drafts := make([]graphdto.GraphCardDraftPayload, 0, len(nodeIDs))
	for index, nodeID := range nodeIDs {
		node, ok := nodeMap[nodeID]
		if !ok {
			continue
		}

		back := node.Title + " 是一个需要复习的知识点。"
		if detail, ok := node.Metadata["detail"].(string); ok && strings.TrimSpace(detail) != "" {
			back = strings.TrimSpace(detail)
		} else if node.Source != nil && strings.TrimSpace(node.Source.Excerpt) != "" {
			back = strings.TrimSpace(node.Source.Excerpt)
		}

		drafts = append(drafts, graphdto.GraphCardDraftPayload{
			ID:           fmt.Sprintf("draft-%d", index+1),
			SourceNodeID: node.ID,
			Front:        "什么是 " + node.Title + "？",
			Back:         back,
			Explanation:  BuildCardDraftExplanation(node),
		})
	}

	return drafts
}

func BuildCardDraftExplanation(node graphdto.GraphNodePayload) string {
	base := "该草稿由图谱节点生成，确认后再进入正式复习卡片。"
	refs := buildCardDraftMetadataRefs(node.Metadata)
	if len(refs) == 0 {
		return base
	}

	return base + " 来源线索：" + strings.Join(refs, "；") + "。"
}

func buildCardDraftMetadataRefs(metadata map[string]any) []string {
	fields := []struct {
		key   string
		label string
	}{
		{key: "materialId", label: "资料 ID"},
		{key: "materialUrl", label: "资料 URL"},
		{key: "noteId", label: "笔记 ID"},
		{key: "cardId", label: "卡片 ID"},
		{key: "deckId", label: "卡组 ID"},
		{key: "aiDraftId", label: "AI 草稿 ID"},
		{key: "aiTaskId", label: "AI 任务 ID"},
		{key: "diagramKind", label: "工程图类型"},
		{key: "diagramShape", label: "图形类型"},
		{key: "diagramSourceId", label: "导入来源 ID"},
	}
	refs := make([]string, 0, len(fields))
	for _, field := range fields {
		if value := readMetadataContentString(metadata, field.key); value != "" {
			refs = append(refs, field.label+" "+value)
		}
	}
	return refs
}

func readMetadataContentString(metadata map[string]any, key string) string {
	content, ok := metadata["content"].(map[string]any)
	if !ok {
		return ""
	}

	value, ok := content[key].(string)
	if !ok {
		return ""
	}

	return strings.TrimSpace(value)
}

func BuildCardCreateRequests(document graphdto.GraphDocumentPayload, drafts []graphdto.GraphCardDraftPayload) ([]carddto.CreateCardRequest, error) {
	nodeMap := make(map[string]graphdto.GraphNodePayload, len(document.Nodes))
	for _, node := range document.Nodes {
		nodeMap[node.ID] = node
	}

	requests := make([]carddto.CreateCardRequest, 0, len(drafts))
	for _, draft := range drafts {
		node, ok := nodeMap[draft.SourceNodeID]
		if !ok {
			return nil, fmt.Errorf("source node %s not found", draft.SourceNodeID)
		}

		front := strings.TrimSpace(draft.Front)
		back := strings.TrimSpace(draft.Back)
		if front == "" || back == "" {
			return nil, errors.New("draft front and back cannot be empty")
		}

		request := carddto.CreateCardRequest{
			CardType: "basic",
			DraftID:  strings.TrimSpace(draft.DraftID),
			Front:    front,
			Back:     back,
		}
		if node.Source != nil {
			request.SourceType = strings.TrimSpace(node.Source.Type)
			request.SourceID = strings.TrimSpace(node.Source.ID)
		}
		requests = append(requests, request)
	}

	return requests, nil
}

func ApplyGraphChangeDrafts(
	document graphdto.GraphDocumentPayload,
	drafts []aidto.DraftPayload,
	nodeSelections map[string][]string,
) (graphdto.GraphDocumentPayload, map[string]map[string]any, error) {
	updated := document
	updated.Nodes = append([]graphdto.GraphNodePayload{}, document.Nodes...)
	updated.Edges = append([]graphdto.GraphEdgePayload{}, document.Edges...)
	remainders := make(map[string]map[string]any)

	nextY := 0.0
	for _, node := range updated.Nodes {
		if candidate := node.Y + node.Height; candidate > nextY {
			nextY = candidate
		}
	}
	if nextY > 0 {
		nextY += 80
	}

	for draftIndex, draft := range drafts {
		if strings.TrimSpace(draft.DraftType) != "graph_change" {
			return graphdto.GraphDocumentPayload{}, nil, fmt.Errorf("draft %s is not graph_change", draft.ID)
		}

		var payload struct {
			Nodes []graphdto.GraphNodePayload `json:"nodes"`
			Edges []graphdto.GraphEdgePayload `json:"edges"`
		}
		if err := decodeDraftMetadata(draft.Metadata, &payload); err != nil {
			return graphdto.GraphDocumentPayload{}, nil, err
		}
		if len(payload.Nodes) == 0 {
			return graphdto.GraphDocumentPayload{}, nil, fmt.Errorf("draft %s has no nodes", draft.ID)
		}

		selectedNodeIDs := make(map[string]struct{})
		if selected := nodeSelections[draft.ID]; len(selected) > 0 {
			for _, nodeID := range selected {
				selectedNodeIDs[strings.TrimSpace(nodeID)] = struct{}{}
			}
		}

		idMap := make(map[string]string, len(payload.Nodes))
		for nodeIndex, node := range payload.Nodes {
			originalID := strings.TrimSpace(node.ID)
			if originalID == "" {
				return graphdto.GraphDocumentPayload{}, nil, fmt.Errorf("draft %s contains node without id", draft.ID)
			}
			if len(selectedNodeIDs) > 0 {
				if _, ok := selectedNodeIDs[originalID]; !ok {
					continue
				}
			}
			node.ID = fmt.Sprintf("ai-%d-%d-%s", draftIndex+1, nodeIndex+1, originalID)
			node.Y = nextY + node.Y
			if node.Width == 0 {
				node.Width = 240
			}
			if node.Height == 0 {
				node.Height = 120
			}
			idMap[originalID] = node.ID
			updated.Nodes = append(updated.Nodes, node)
		}
		if len(idMap) == 0 {
			return graphdto.GraphDocumentPayload{}, nil, fmt.Errorf("draft %s has no selected nodes", draft.ID)
		}

		for edgeIndex, edge := range payload.Edges {
			sourceID, ok := idMap[strings.TrimSpace(edge.SourceNodeID)]
			if !ok {
				continue
			}
			targetID, ok := idMap[strings.TrimSpace(edge.TargetNodeID)]
			if !ok {
				continue
			}
			edge.ID = fmt.Sprintf("ai-edge-%d-%d", draftIndex+1, edgeIndex+1)
			edge.SourceNodeID = sourceID
			edge.TargetNodeID = targetID
			updated.Edges = append(updated.Edges, edge)
		}

		if len(selectedNodeIDs) > 0 && len(selectedNodeIDs) < len(payload.Nodes) {
			remainingNodeSet := make(map[string]struct{})
			remainingNodes := make([]graphdto.GraphNodePayload, 0, len(payload.Nodes)-len(selectedNodeIDs))
			for _, node := range payload.Nodes {
				if _, ok := selectedNodeIDs[strings.TrimSpace(node.ID)]; ok {
					continue
				}
				remainingNodeSet[strings.TrimSpace(node.ID)] = struct{}{}
				remainingNodes = append(remainingNodes, node)
			}
			remainingEdges := make([]graphdto.GraphEdgePayload, 0, len(payload.Edges))
			for _, edge := range payload.Edges {
				_, sourceOk := remainingNodeSet[strings.TrimSpace(edge.SourceNodeID)]
				_, targetOk := remainingNodeSet[strings.TrimSpace(edge.TargetNodeID)]
				if sourceOk && targetOk {
					remainingEdges = append(remainingEdges, edge)
				}
			}
			remainders[draft.ID] = map[string]any{
				"summary": draft.Metadata["summary"],
				"nodes":   remainingNodes,
				"edges":   remainingEdges,
			}
		}

		nextY += 240
	}

	return updated, remainders, nil
}

func decodeDraftMetadata(metadata map[string]any, target any) error {
	if len(metadata) == 0 {
		return errors.New("draft metadata is empty")
	}

	buffer, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("marshal draft metadata: %w", err)
	}
	if err := json.Unmarshal(buffer, target); err != nil {
		return fmt.Errorf("decode draft metadata: %w", err)
	}
	return nil
}

func validationSeverityRank(severity string) int {
	switch severity {
	case "error":
		return 0
	case "warning":
		return 1
	case "info":
		return 2
	default:
		return 3
	}
}

func parseMermaidNode(raw string) (string, string) {
	text := strings.TrimSpace(strings.Trim(raw, ";"))
	matches := mermaidNodePattern.FindStringSubmatch(text)
	if len(matches) < 2 {
		return "", ""
	}

	nodeID := strings.TrimSpace(matches[1])
	title := nodeID
	if len(matches) >= 3 && matches[2] != "" {
		title = strings.TrimSpace(matches[2])
		title = strings.Trim(title, "[](){}")
		title = strings.TrimPrefix(title, ">")
	}

	return nodeID, title
}

func buildMermaidNode(nodeID string, title string, index int) graphdto.GraphNodePayload {
	return graphdto.GraphNodePayload{
		ID:     nodeID,
		Type:   "text",
		Title:  title,
		X:      float64(index%3) * 280,
		Y:      float64(index/3) * 170,
		Width:  240,
		Height: 120,
		Metadata: map[string]any{
			"origin": "mermaid",
		},
	}
}
