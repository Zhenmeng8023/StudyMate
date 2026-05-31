package repository

import (
	"testing"
	"time"

	graphdto "studymate/backend/internal/modules/graph/dto"
	graphmodel "studymate/backend/internal/modules/graph/model"
)

func TestBuildGraphDocument(t *testing.T) {
	now := time.Date(2026, 5, 27, 16, 0, 0, 0, time.UTC)
	graph := &graphmodel.Graph{
		ID:             "graph-1",
		OwnerUserID:    "user-1",
		CurrentVersion: 3,
		UpdatedAt:      now,
	}

	document := graphdto.GraphDocumentPayload{
		GraphID: "graph-1",
		Version: 3,
		Viewport: graphdto.GraphViewportPayload{
			X:    120,
			Y:    80,
			Zoom: 1.25,
		},
		Nodes: []graphdto.GraphNodePayload{
			{
				ID:     "node-1",
				Type:   "note",
				Title:  "Binary tree",
				X:      32,
				Y:      48,
				Width:  240,
				Height: 120,
				Source: &graphdto.GraphNodeSourcePayload{
					Type:  "note",
					ID:    "note-1",
					Label: "Chapter 1 note",
				},
				Metadata: map[string]any{
					"detail": "A balanced tree node note",
					"appearance": map[string]any{
						"tone":      "sage",
						"emphasis": "strong",
					},
				},
			},
		},
		Edges: []graphdto.GraphEdgePayload{
			{
				ID:           "edge-1",
				SourceNodeID: "node-1",
				TargetNodeID: "node-2",
				Label:        "explains",
			},
		},
		Theme: map[string]any{
			"canvas": "paper",
		},
		Metadata: map[string]any{
			"importType": "manual",
		},
	}

	result := BuildGraphDocument(graph, document)

	if result["graph_id"] != "graph-1" {
		t.Fatalf("expected graph_id graph-1, got %#v", result["graph_id"])
	}

	if result["version"] != int64(3) {
		t.Fatalf("expected version 3, got %#v", result["version"])
	}

	if result["owner_user_id"] != "user-1" {
		t.Fatalf("expected owner_user_id user-1, got %#v", result["owner_user_id"])
	}

	nodes, ok := result["nodes"].([]graphdto.GraphNodePayload)
	if !ok || len(nodes) != 1 {
		t.Fatalf("expected a single node payload, got %#v", result["nodes"])
	}

	if nodes[0].Metadata["detail"] != "A balanced tree node note" {
		t.Fatalf("expected node metadata detail to survive, got %#v", nodes[0].Metadata)
	}

	if result["theme"].(map[string]any)["canvas"] != "paper" {
		t.Fatalf("expected theme metadata to survive, got %#v", result["theme"])
	}

	if result["metadata"].(map[string]any)["importType"] != "manual" {
		t.Fatalf("expected graph metadata to survive, got %#v", result["metadata"])
	}
}

func TestExtractSourceRelationsDeduplicatesByTarget(t *testing.T) {
	document := graphdto.GraphDocumentPayload{
		Nodes: []graphdto.GraphNodePayload{
			{
				ID:    "node-1",
				Type:  "note",
				Title: "Binary tree",
				Source: &graphdto.GraphNodeSourcePayload{
					Type:  "note",
					ID:    "note-1",
					Label: "Chapter 1 note",
				},
			},
			{
				ID:    "node-2",
				Type:  "note",
				Title: "Binary tree copy",
				Source: &graphdto.GraphNodeSourcePayload{
					Type:  "note",
					ID:    "note-1",
					Label: "Chapter 1 note",
				},
			},
			{
				ID:    "node-3",
				Type:  "material",
				Title: "Algorithms PDF",
				Source: &graphdto.GraphNodeSourcePayload{
					Type:  "material",
					ID:    "material-1",
					Label: "Algorithms PDF",
				},
			},
		},
	}

	relations := ExtractSourceRelations(document)
	if len(relations) != 2 {
		t.Fatalf("expected 2 unique relations, got %d", len(relations))
	}

	if relations[0].RelationType != graphSourceRelationType {
		t.Fatalf("expected relation type %q, got %q", graphSourceRelationType, relations[0].RelationType)
	}
}
