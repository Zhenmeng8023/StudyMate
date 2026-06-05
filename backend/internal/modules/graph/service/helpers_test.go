package service

import (
	"testing"

	aidto "studymate/backend/internal/modules/ai/dto"
	graphdto "studymate/backend/internal/modules/graph/dto"
)

func TestBuildDocumentFromMarkdownOutline(t *testing.T) {
	document := BuildDocumentFromMarkdownOutline("graph-1", 2, "# Data Structures\n## Trees\n## Graphs")

	if len(document.Nodes) != 3 {
		t.Fatalf("expected 3 nodes, got %d", len(document.Nodes))
	}

	if len(document.Edges) != 2 {
		t.Fatalf("expected 2 edges, got %d", len(document.Edges))
	}

	if document.Nodes[0].Title != "Data Structures" {
		t.Fatalf("expected root title %q, got %q", "Data Structures", document.Nodes[0].Title)
	}
}

func TestBuildDocumentFromMermaidFlowchart(t *testing.T) {
	document, err := BuildDocumentFromMermaid("graph-2", 1, "flowchart TD\nA[Input] --> B{Validate}\nB --> C[Result]")
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}

	if len(document.Nodes) != 3 {
		t.Fatalf("expected 3 nodes, got %d", len(document.Nodes))
	}

	if len(document.Edges) != 2 {
		t.Fatalf("expected 2 edges, got %d", len(document.Edges))
	}

	if document.Nodes[1].Title != "Validate" {
		t.Fatalf("expected second node title %q, got %q", "Validate", document.Nodes[1].Title)
	}
}

func TestValidateDocumentFindsDanglingEdges(t *testing.T) {
	issues := ValidateDocument(graphdto.GraphDocumentPayload{
		Nodes: []graphdto.GraphNodePayload{
			{ID: "node-1", Title: "Node 1", Type: "text", Width: 200, Height: 120},
		},
		Edges: []graphdto.GraphEdgePayload{
			{ID: "edge-1", SourceNodeID: "node-1", TargetNodeID: "missing-node", Label: "broken"},
		},
	})

	if len(issues) == 0 {
		t.Fatal("expected validation issues, got none")
	}

	if issues[0].RuleType != "dangling_edge" {
		t.Fatalf("expected first issue rule %q, got %q", "dangling_edge", issues[0].RuleType)
	}
}

func TestValidateDocumentFindsProductizationIssues(t *testing.T) {
	issues := ValidateDocument(graphdto.GraphDocumentPayload{
		Nodes: []graphdto.GraphNodePayload{
			{
				ID:     "node-1",
				Type:   "concept",
				Title:  "重复标题",
				Width:  240,
				Height: 120,
				Source: &graphdto.GraphNodeSourcePayload{Type: "note", ID: "note-1"},
			},
			{
				ID:     "node-2",
				Type:   "concept",
				Title:  "重复标题",
				Width:  24,
				Height: 12,
				Source: &graphdto.GraphNodeSourcePayload{Type: "material"},
			},
			{ID: "node-3", Type: "concept", Title: "孤立节点", Width: 240, Height: 120},
		},
		Edges: []graphdto.GraphEdgePayload{
			{ID: "edge-1", SourceNodeID: "node-1", TargetNodeID: "missing-node"},
			{ID: "edge-2", SourceNodeID: "node-1", TargetNodeID: "node-2"},
		},
		Groups: []graphdto.GraphGroupPayload{
			{ID: "group-empty", Title: "空分组", NodeIDs: []string{}, Width: 200, Height: 100},
			{ID: "group-collapsed", Title: "折叠分组", NodeIDs: []string{"node-1"}, Width: 200, Height: 100, Collapsed: true},
		},
	})

	seen := map[string]bool{}
	for _, issue := range issues {
		seen[issue.RuleType] = true
	}
	for _, rule := range []string{
		"duplicate_title",
		"invalid_node_size",
		"invalid_source_target",
		"missing_source",
		"isolated_node",
		"dangling_edge",
		"empty_group",
		"cross_collapsed_group_edge",
	} {
		if !seen[rule] {
			t.Fatalf("expected rule %s in issues, got %#v", rule, issues)
		}
	}
}

func TestListLearningDiagramTemplates(t *testing.T) {
	templates := NewService(nil, nil, nil, nil, nil).ListDiagramTemplates()
	if len(templates) != 4 {
		t.Fatalf("expected 4 learning templates, got %d", len(templates))
	}
	expected := []string{"learning-material-map", "book-notes-map", "concept-network", "review-card-prep"}
	for index, template := range templates {
		if template.ID != expected[index] {
			t.Fatalf("expected template %s at index %d, got %s", expected[index], index, template.ID)
		}
		if template.Mode != "learning" {
			t.Fatalf("expected learning mode, got %s", template.Mode)
		}
		if len(template.SampleLines) < 3 {
			t.Fatalf("expected sample lines for template %s", template.ID)
		}
	}
}

func TestBuildCardDraftsFromSelection(t *testing.T) {
	document := graphdto.GraphDocumentPayload{
		Nodes: []graphdto.GraphNodePayload{
			{
				ID:    "node-1",
				Type:  "text",
				Title: "Binary Tree",
				Metadata: map[string]any{
					"detail": "A tree where each node has at most two children.",
				},
			},
			{
				ID:    "node-2",
				Type:  "text",
				Title: "Heap",
			},
		},
	}

	drafts := BuildCardDrafts(document, []string{"node-1"})
	if len(drafts) != 1 {
		t.Fatalf("expected 1 draft, got %d", len(drafts))
	}

	if drafts[0].Front == "" || drafts[0].Back == "" {
		t.Fatalf("expected non-empty card draft, got %#v", drafts[0])
	}
}

func TestBuildCardCreateRequestsFromDraftsPreservesSource(t *testing.T) {
	document := graphdto.GraphDocumentPayload{
		Nodes: []graphdto.GraphNodePayload{
			{
				ID:    "node-1",
				Type:  "note",
				Title: "Binary Tree",
				Source: &graphdto.GraphNodeSourcePayload{
					Type: "note",
					ID:   "note-1",
				},
			},
		},
	}

	requests, err := BuildCardCreateRequests(document, []graphdto.GraphCardDraftPayload{
		{
			ID:           "draft-1",
			SourceNodeID: "node-1",
			Front:        "什么是 Binary Tree？",
			Back:         "一种每个节点最多有两个子节点的树。",
		},
	})
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if len(requests) != 1 {
		t.Fatalf("expected 1 request, got %d", len(requests))
	}
	if requests[0].SourceType != "note" || requests[0].SourceID != "note-1" {
		t.Fatalf("expected source note/note-1, got %#v", requests[0])
	}
}

func TestBuildCardCreateRequestsRejectsMissingNode(t *testing.T) {
	document := graphdto.GraphDocumentPayload{
		Nodes: []graphdto.GraphNodePayload{{ID: "node-1", Type: "text", Title: "Binary Tree"}},
	}

	_, err := BuildCardCreateRequests(document, []graphdto.GraphCardDraftPayload{
		{
			ID:           "draft-1",
			SourceNodeID: "missing-node",
			Front:        "Q",
			Back:         "A",
		},
	})
	if err == nil {
		t.Fatal("expected error for missing node")
	}
}

func TestBuildCardCreateRequestsRejectsBlankContent(t *testing.T) {
	document := graphdto.GraphDocumentPayload{
		Nodes: []graphdto.GraphNodePayload{{ID: "node-1", Type: "text", Title: "Binary Tree"}},
	}

	_, err := BuildCardCreateRequests(document, []graphdto.GraphCardDraftPayload{
		{
			ID:           "draft-1",
			SourceNodeID: "node-1",
			Front:        "  ",
			Back:         "A",
		},
	})
	if err == nil {
		t.Fatal("expected error for blank content")
	}
}

func TestApplyGraphChangeDraftsAppendsNodesAndEdges(t *testing.T) {
	document := graphdto.GraphDocumentPayload{
		GraphID: "graph-1",
		Nodes: []graphdto.GraphNodePayload{
			{ID: "node-1", Type: "text", Title: "Existing"},
		},
	}

	updated, remainders, err := ApplyGraphChangeDrafts(document, []aidto.DraftPayload{
		{
			ID:        "draft-1",
			DraftType: "graph_change",
			Metadata: map[string]any{
				"nodes": []any{
					map[string]any{
						"id":    "proposal-1",
						"type":  "text",
						"title": "New Concept",
						"source": map[string]any{
							"type": "note",
							"id":   "note-1",
						},
					},
				},
				"edges": []any{
					map[string]any{
						"id":           "edge-1",
						"sourceNodeId": "proposal-1",
						"targetNodeId": "proposal-1",
						"label":        "refines",
					},
				},
			},
		},
	}, nil)
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if len(remainders) != 0 {
		t.Fatalf("expected no remainders, got %#v", remainders)
	}
	if len(updated.Nodes) != 2 {
		t.Fatalf("expected 2 nodes after apply, got %d", len(updated.Nodes))
	}
	if len(updated.Edges) != 1 {
		t.Fatalf("expected 1 edge after apply, got %d", len(updated.Edges))
	}
	if updated.Nodes[1].ID == "proposal-1" {
		t.Fatalf("expected node id to be remapped, got %s", updated.Nodes[1].ID)
	}
}

func TestApplyGraphChangeDraftsRespectsNodeSelection(t *testing.T) {
	document := graphdto.GraphDocumentPayload{GraphID: "graph-1"}

	updated, remainders, err := ApplyGraphChangeDrafts(document, []aidto.DraftPayload{
		{
			ID:        "draft-1",
			DraftType: "graph_change",
			Metadata: map[string]any{
				"nodes": []any{
					map[string]any{"id": "proposal-1", "type": "text", "title": "Alpha"},
					map[string]any{"id": "proposal-2", "type": "text", "title": "Beta"},
				},
				"edges": []any{
					map[string]any{"id": "edge-1", "sourceNodeId": "proposal-1", "targetNodeId": "proposal-2", "label": "links"},
				},
			},
		},
	}, map[string][]string{"draft-1": {"proposal-1"}})
	if err != nil {
		t.Fatalf("expected nil error, got %v", err)
	}
	if len(updated.Nodes) != 1 {
		t.Fatalf("expected 1 selected node, got %d", len(updated.Nodes))
	}
	if len(updated.Edges) != 0 {
		t.Fatalf("expected 0 edges after filtering, got %d", len(updated.Edges))
	}
	if len(remainders["draft-1"]) == 0 {
		t.Fatalf("expected remainder metadata for partially accepted draft")
	}
}
