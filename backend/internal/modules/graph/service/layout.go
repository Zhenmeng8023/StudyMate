package service

import (
	"fmt"
	"math"
	"sort"
	"strings"

	graphdto "studymate/backend/internal/modules/graph/dto"
)

const (
	graphLayoutStageWidth       = 2400.0
	graphLayoutStageHeight      = 1600.0
	graphLayoutLaneGap          = 72.0
	graphLayoutItemGap          = 24.0
	graphLayoutPaddingX         = 28.0
	graphLayoutPaddingY         = 26.0
	graphLayoutLaneHeaderHeight = 42.0
)

type GraphLayoutPreviewResult struct {
	Document        graphdto.GraphDocumentPayload
	SelectedNodeIDs []string
	StatusMessage   string
	LaneCount       int
}

type sourceSwimlaneLane struct {
	Key   string
	Title string
	Order int
	Nodes []graphdto.GraphNodePayload
}

var sourceSwimlaneOrder = map[string]int{
	"material":   10,
	"annotation": 20,
	"note":       30,
	"card":       40,
	"ai":         50,
	"free":       90,
}

var sourceSwimlaneTitles = map[string]string{
	"material":   "资料来源泳道",
	"annotation": "批注来源泳道",
	"note":       "笔记来源泳道",
	"card":       "卡片来源泳道",
	"ai":         "AI 草稿泳道",
	"free":       "自由节点泳道",
}

func BuildSourceSwimlanePreview(document graphdto.GraphDocumentPayload, selectedNodeIDs []string) (GraphLayoutPreviewResult, bool) {
	selectedSet := make(map[string]struct{}, len(selectedNodeIDs))
	selectedNodes := make([]graphdto.GraphNodePayload, 0, len(selectedNodeIDs))
	for _, nodeID := range selectedNodeIDs {
		selectedSet[strings.TrimSpace(nodeID)] = struct{}{}
	}
	for _, node := range document.Nodes {
		if _, ok := selectedSet[node.ID]; ok {
			selectedNodes = append(selectedNodes, cloneLayoutNode(node))
		}
	}
	if len(selectedNodes) < 2 {
		return GraphLayoutPreviewResult{}, false
	}

	anchorX := selectedNodes[0].X
	anchorY := selectedNodes[0].Y
	for _, node := range selectedNodes[1:] {
		if node.X < anchorX {
			anchorX = node.X
		}
		if node.Y < anchorY {
			anchorY = node.Y
		}
	}

	layoutNodes, layoutGroups := buildSourceSwimlaneLayout(selectedNodes, anchorX, anchorY)
	layoutNodeMap := make(map[string]graphdto.GraphNodePayload, len(layoutNodes))
	resultNodeIDs := make([]string, 0, len(layoutNodes))
	for _, node := range layoutNodes {
		layoutNodeMap[node.ID] = node
		resultNodeIDs = append(resultNodeIDs, node.ID)
	}

	nextNodes := make([]graphdto.GraphNodePayload, 0, len(document.Nodes))
	for _, node := range document.Nodes {
		if nextNode, ok := layoutNodeMap[node.ID]; ok {
			nextNodes = append(nextNodes, nextNode)
			continue
		}
		nextNodes = append(nextNodes, cloneLayoutNode(node))
	}

	nextGroups := make([]graphdto.GraphGroupPayload, 0, len(document.Groups)+len(layoutGroups))
	for _, group := range document.Groups {
		if isGeneratedSourceSwimlaneGroup(group) && groupOverlapsSelectedNodes(group, selectedSet) {
			continue
		}
		nextGroups = append(nextGroups, cloneLayoutGroup(group))
	}
	nextGroups = append(nextGroups, layoutGroups...)

	nextDocument := cloneLayoutDocument(document)
	nextDocument.Nodes = nextNodes
	nextDocument.Groups = nextGroups

	return GraphLayoutPreviewResult{
		Document:        nextDocument,
		SelectedNodeIDs: resultNodeIDs,
		StatusMessage:   fmt.Sprintf("已生成 %d 条来源泳道", len(layoutGroups)),
		LaneCount:       len(layoutGroups),
	}, true
}

func buildSourceSwimlaneLayout(nodes []graphdto.GraphNodePayload, anchorX float64, anchorY float64) ([]graphdto.GraphNodePayload, []graphdto.GraphGroupPayload) {
	lanes := buildSourceSwimlaneLanes(nodes)
	placedNodes := make([]graphdto.GraphNodePayload, 0, len(nodes))
	groups := make([]graphdto.GraphGroupPayload, 0, len(lanes))
	nextLaneX := clampLayoutNumber(anchorX, 0, graphLayoutStageWidth)

	for laneIndex, lane := range lanes {
		laneNodeWidth := 160.0
		for _, node := range lane.Nodes {
			if node.Width > laneNodeWidth {
				laneNodeWidth = node.Width
			}
		}
		laneWidth := math.Min(graphLayoutStageWidth, laneNodeWidth+graphLayoutPaddingX*2)
		laneContentHeight := 0.0
		for nodeIndex, node := range lane.Nodes {
			laneContentHeight += node.Height
			if nodeIndex > 0 {
				laneContentHeight += graphLayoutItemGap
			}
		}
		laneHeight := math.Min(graphLayoutStageHeight, graphLayoutLaneHeaderHeight+graphLayoutPaddingY*2+laneContentHeight)
		groupX := clampLayoutNumber(nextLaneX, 0, math.Max(0, graphLayoutStageWidth-laneWidth))
		groupY := clampLayoutNumber(anchorY, 0, math.Max(0, graphLayoutStageHeight-laneHeight))
		nextNodeY := groupY + graphLayoutLaneHeaderHeight + graphLayoutPaddingY

		groupNodeIDs := make([]string, 0, len(lane.Nodes))
		for _, node := range lane.Nodes {
			nextNode := cloneLayoutNode(node)
			nextNode.X = roundLayoutNumber(clampLayoutNumber(groupX+graphLayoutPaddingX, 0, math.Max(0, graphLayoutStageWidth-node.Width)))
			nextNode.Y = roundLayoutNumber(clampLayoutNumber(nextNodeY, 0, math.Max(0, graphLayoutStageHeight-node.Height)))
			nextNodeY += node.Height + graphLayoutItemGap
			placedNodes = append(placedNodes, nextNode)
			groupNodeIDs = append(groupNodeIDs, nextNode.ID)
		}

		groups = append(groups, graphdto.GraphGroupPayload{
			ID:        fmt.Sprintf("source-swimlane-%d-%s", laneIndex+1, lane.Key),
			Title:     lane.Title,
			NodeIDs:   groupNodeIDs,
			X:         roundLayoutNumber(groupX),
			Y:         roundLayoutNumber(groupY),
			Width:     roundLayoutNumber(laneWidth),
			Height:    roundLayoutNumber(laneHeight),
			Collapsed: false,
			Metadata: map[string]any{
				"layoutKind": "source-swimlane",
				"sourceKey":  lane.Key,
			},
		})

		nextLaneX = groupX + laneWidth + graphLayoutLaneGap
	}

	return placedNodes, groups
}

func buildSourceSwimlaneLanes(nodes []graphdto.GraphNodePayload) []sourceSwimlaneLane {
	lanesByKey := make(map[string]sourceSwimlaneLane)
	for _, node := range nodes {
		key := normalizeSourceSwimlaneKey(node.Source)
		lane, ok := lanesByKey[key]
		if !ok {
			lane = sourceSwimlaneLane{
				Key:   key,
				Title: sourceSwimlaneTitles[key],
				Order: sourceSwimlaneOrder[key],
				Nodes: []graphdto.GraphNodePayload{},
			}
			if lane.Title == "" {
				lane.Title = "其他来源泳道"
			}
			if lane.Order == 0 {
				lane.Order = 80
			}
		}
		lane.Nodes = append(lane.Nodes, cloneLayoutNode(node))
		lanesByKey[key] = lane
	}

	lanes := make([]sourceSwimlaneLane, 0, len(lanesByKey))
	for _, lane := range lanesByKey {
		sort.SliceStable(lane.Nodes, func(left, right int) bool {
			leftLabel := strings.TrimSpace(lane.Nodes[left].Title)
			rightLabel := strings.TrimSpace(lane.Nodes[right].Title)
			if lane.Nodes[left].Source != nil && strings.TrimSpace(lane.Nodes[left].Source.Label) != "" {
				leftLabel = strings.TrimSpace(lane.Nodes[left].Source.Label)
			}
			if lane.Nodes[right].Source != nil && strings.TrimSpace(lane.Nodes[right].Source.Label) != "" {
				rightLabel = strings.TrimSpace(lane.Nodes[right].Source.Label)
			}
			sourceDiff := strings.Compare(leftLabel, rightLabel)
			if sourceDiff != 0 {
				return sourceDiff < 0
			}
			return strings.Compare(strings.TrimSpace(lane.Nodes[left].Title), strings.TrimSpace(lane.Nodes[right].Title)) < 0
		})
		lanes = append(lanes, lane)
	}

	sort.SliceStable(lanes, func(left, right int) bool {
		if lanes[left].Order != lanes[right].Order {
			return lanes[left].Order < lanes[right].Order
		}
		return strings.Compare(lanes[left].Title, lanes[right].Title) < 0
	})

	return lanes
}

func normalizeSourceSwimlaneKey(source *graphdto.GraphNodeSourcePayload) string {
	if source == nil {
		return "free"
	}

	key := strings.TrimSpace(strings.ToLower(source.Type))
	switch key {
	case "", "free":
		return "free"
	case "rich-note":
		return "note"
	default:
		return key
	}
}

func isGeneratedSourceSwimlaneGroup(group graphdto.GraphGroupPayload) bool {
	if group.Metadata == nil {
		return false
	}
	value, ok := group.Metadata["layoutKind"].(string)
	return ok && strings.EqualFold(strings.TrimSpace(value), "source-swimlane")
}

func groupOverlapsSelectedNodes(group graphdto.GraphGroupPayload, selectedSet map[string]struct{}) bool {
	for _, nodeID := range group.NodeIDs {
		if _, ok := selectedSet[nodeID]; ok {
			return true
		}
	}
	return false
}

func cloneLayoutDocument(document graphdto.GraphDocumentPayload) graphdto.GraphDocumentPayload {
	copy := document
	copy.Nodes = append([]graphdto.GraphNodePayload{}, document.Nodes...)
	copy.Edges = append([]graphdto.GraphEdgePayload{}, document.Edges...)
	copy.Groups = append([]graphdto.GraphGroupPayload{}, document.Groups...)
	if document.Theme != nil {
		copy.Theme = cloneLayoutMap(document.Theme)
	}
	if document.Metadata != nil {
		copy.Metadata = cloneLayoutMap(document.Metadata)
	}
	return copy
}

func cloneLayoutNode(node graphdto.GraphNodePayload) graphdto.GraphNodePayload {
	copy := node
	if node.Source != nil {
		sourceCopy := *node.Source
		copy.Source = &sourceCopy
	}
	if node.Metadata != nil {
		copy.Metadata = cloneLayoutMap(node.Metadata)
	}
	return copy
}

func cloneLayoutGroup(group graphdto.GraphGroupPayload) graphdto.GraphGroupPayload {
	copy := group
	copy.NodeIDs = append([]string{}, group.NodeIDs...)
	if group.Metadata != nil {
		copy.Metadata = cloneLayoutMap(group.Metadata)
	}
	return copy
}

func cloneLayoutMap(input map[string]any) map[string]any {
	copy := make(map[string]any, len(input))
	for key, value := range input {
		copy[key] = value
	}
	return copy
}

func clampLayoutNumber(value float64, min float64, max float64) float64 {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

func roundLayoutNumber(value float64) float64 {
	return math.Round(value*10) / 10
}
