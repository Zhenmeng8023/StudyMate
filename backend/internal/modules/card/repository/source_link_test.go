package repository

import (
	"testing"
	"time"

	carddto "studymate/backend/internal/modules/card/dto"
	cardmodel "studymate/backend/internal/modules/card/model"
)

func TestBuildCardPayloadBuildsAnnotationSourceLinksFromLegacyFields(t *testing.T) {
	payload := BuildCardPayload(cardmodel.Card{
		ID:          "card-1",
		DeckID:      "deck-1",
		OwnerUserID: "user-1",
		CardType:    "basic",
		Front:       "Front",
		Back:        "Back",
		SourceType:  "annotation",
		SourceID:    "annotation-1",
		SourceMetadata: `{
			"materialId":"material-1",
			"annotationId":"annotation-1",
			"page":12,
			"excerpt":"Important sentence",
			"title":"Proof note",
			"color":"yellow"
		}`,
		Status:    "active",
		CreatedAt: time.Date(2026, 7, 16, 9, 0, 0, 0, time.UTC),
		UpdatedAt: time.Date(2026, 7, 16, 9, 0, 0, 0, time.UTC),
	})

	if payload.PrimarySourceLink == nil {
		t.Fatalf("expected primary source link")
	}
	if payload.PrimarySourceLink.SourceType != "annotation" || payload.PrimarySourceLink.SourceID != "annotation-1" {
		t.Fatalf("unexpected primary source link: %#v", payload.PrimarySourceLink)
	}
	if payload.PrimarySourceLink.Title != "Proof note" || payload.PrimarySourceLink.Excerpt != "Important sentence" {
		t.Fatalf("expected title/excerpt to be promoted, got %#v", payload.PrimarySourceLink)
	}
	if payload.PrimarySourceLink.Locator["materialId"] != "material-1" || payload.PrimarySourceLink.Locator["annotationId"] != "annotation-1" {
		t.Fatalf("expected locator to preserve reader identifiers, got %#v", payload.PrimarySourceLink.Locator)
	}
	page, ok := payload.PrimarySourceLink.Locator["page"].(float64)
	if !ok || page != 12 {
		t.Fatalf("expected page locator, got %#v", payload.PrimarySourceLink.Locator["page"])
	}
	if payload.PrimarySourceLink.Metadata["color"] != "yellow" {
		t.Fatalf("expected extra metadata to remain in metadata bucket, got %#v", payload.PrimarySourceLink.Metadata)
	}
	if len(payload.SourceLinks) != 1 {
		t.Fatalf("expected one compatible source link, got %#v", payload.SourceLinks)
	}
}

func TestBuildPrimarySourceLinkPayloadNormalizesGraphAndAiLocators(t *testing.T) {
	graphLink := BuildPrimarySourceLinkPayload("graph", "node-1", map[string]any{
		"graphId":     "graph-1",
		"focusX":      420,
		"focusY":      320,
		"focusWidth":  220,
		"focusHeight": 120,
		"focusLabel":  "Binary Tree",
	})
	if graphLink == nil {
		t.Fatalf("expected graph link")
	}
	if graphLink.Locator["graphId"] != "graph-1" || graphLink.Locator["focusLabel"] != "Binary Tree" {
		t.Fatalf("expected graph locator fields, got %#v", graphLink.Locator)
	}

	aiLink := BuildPrimarySourceLinkPayload("ai_draft", "draft-1", map[string]any{
		"taskId":  "task-1",
		"draftId": "draft-1",
		"reason":  "from ai",
	})
	if aiLink == nil {
		t.Fatalf("expected ai link")
	}
	if aiLink.SourceType != "ai-draft" {
		t.Fatalf("expected normalized ai-draft type, got %#v", aiLink.SourceType)
	}
	if aiLink.Locator["taskId"] != "task-1" || aiLink.Locator["draftId"] != "draft-1" {
		t.Fatalf("expected ai locator fields, got %#v", aiLink.Locator)
	}
	if aiLink.Metadata["reason"] != "from ai" {
		t.Fatalf("expected remaining ai metadata, got %#v", aiLink.Metadata)
	}
}

func TestBuildSourceLinkReadModelsPrefersExplicitLinksOverLegacyFields(t *testing.T) {
	readModels := BuildSourceLinkReadModels(&carddto.SourceLinkPayload{
		SourceType: "graph_node",
		SourceID:   "node-1",
		Title:      "Graph node",
		Locator:    map[string]any{"graphId": "graph-1", "nodeId": "node-1"},
	}, nil, "material", "material-legacy", map[string]any{"title": "Legacy material"})

	if len(readModels) != 1 {
		t.Fatalf("expected one explicit read model, got %#v", readModels)
	}
	if readModels[0].SourceType != "graph-node" || readModels[0].SourceID != "node-1" {
		t.Fatalf("expected explicit graph-node source to win, got %#v", readModels[0])
	}
	if readModels[0].PrimarySourceLink == nil || readModels[0].PrimarySourceLink.Title != "Graph node" {
		t.Fatalf("expected explicit source link payload, got %#v", readModels[0].PrimarySourceLink)
	}
}

func TestSourceLinkReadModelMatchesGraphNodeLocatorID(t *testing.T) {
	readModels := BuildSourceLinkReadModels(&carddto.SourceLinkPayload{
		SourceType: "graph-node",
		SourceID:   "graph-1",
		Locator:    map[string]any{"graphId": "graph-1", "nodeId": "node-1"},
	}, nil, "", "", nil)

	if len(readModels) != 1 {
		t.Fatalf("expected one read model, got %#v", readModels)
	}
	if !SourceLinkReadModelMatches(readModels[0], "graph-node", "node-1") {
		t.Fatalf("expected graph-node lookup to match nodeId locator")
	}
	if SourceLinkReadModelMatches(readModels[0], "material", "node-1") {
		t.Fatalf("expected graph-node read model not to match material lookup")
	}
}

func TestBuildSourceLinkReadModelsFallsBackToLegacyAnnotationMetadata(t *testing.T) {
	readModels := BuildSourceLinkReadModels(nil, nil, "annotation", "annotation-1", map[string]any{
		"materialId":   "material-1",
		"annotationId": "annotation-1",
		"title":        "Legacy annotation",
	})

	if len(readModels) != 1 {
		t.Fatalf("expected legacy fallback read model, got %#v", readModels)
	}
	if readModels[0].SourceType != "annotation" || readModels[0].SourceID != "annotation-1" {
		t.Fatalf("expected legacy source fields, got %#v", readModels[0])
	}
	if readModels[0].PrimarySourceLink == nil || readModels[0].PrimarySourceLink.Locator["materialId"] != "material-1" {
		t.Fatalf("expected legacy metadata to become locator, got %#v", readModels[0].PrimarySourceLink)
	}
}

func TestBuildSourceLinkRelationReadModelsKeepsObjectBoundaryAndPrimaryOrder(t *testing.T) {
	relations := BuildSourceLinkRelationReadModels("user-1", "CardNote", "note-1", &carddto.SourceLinkPayload{
		SourceType: "graph-node",
		SourceID:   "node-1",
		Title:      "Red-black tree",
		Excerpt:    "rotation invariant",
		Locator:    map[string]any{"graphId": "graph-1", "nodeId": "node-1"},
		Metadata:   map[string]any{"color": "red"},
	}, []carddto.SourceLinkPayload{{
		SourceType: "material",
		SourceID:   "material-1",
		Title:      "Chapter 2",
		Locator:    map[string]any{"page": 12},
	}}, "annotation", "legacy-annotation", map[string]any{"title": "Legacy should not win"})

	if len(relations) != 2 {
		t.Fatalf("expected primary and secondary relations, got %#v", relations)
	}
	if relations[0].OwnerUserID != "user-1" || relations[0].LinkedObjectType != "card-note" || relations[0].LinkedObjectID != "note-1" {
		t.Fatalf("expected object boundary fields, got %#v", relations[0])
	}
	if relations[0].ID == "" || relations[1].ID == relations[0].ID {
		t.Fatalf("expected stable non-empty relation ids, got %#v", relations)
	}
	if !relations[0].IsPrimary || relations[0].SourceType != "graph-node" || relations[0].SourceID != "node-1" {
		t.Fatalf("expected first relation to be primary graph-node, got %#v", relations[0])
	}
	if relations[0].LocatorJSON["nodeId"] != "node-1" || relations[0].MetadataJSON["color"] != "red" {
		t.Fatalf("expected locator and metadata buckets, got %#v / %#v", relations[0].LocatorJSON, relations[0].MetadataJSON)
	}
	if relations[1].IsPrimary || relations[1].SourceType != "material" || relations[1].SourceID != "material-1" {
		t.Fatalf("expected secondary material relation, got %#v", relations[1])
	}
}

func TestBuildSourceLinkRelationReadModelsUsesLegacyOnlyWithoutExplicitLinks(t *testing.T) {
	relations := BuildSourceLinkRelationReadModels("user-1", "GeneratedCard", "card-1", nil, nil, "annotation", "annotation-1", map[string]any{
		"materialId": "material-1",
		"title":      "Legacy annotation",
	})

	if len(relations) != 1 {
		t.Fatalf("expected one legacy relation, got %#v", relations)
	}
	if relations[0].LinkedObjectType != "generated-card" || !relations[0].IsPrimary {
		t.Fatalf("expected generated-card primary relation, got %#v", relations[0])
	}
	if relations[0].Title != "Legacy annotation" || relations[0].LocatorJSON["materialId"] != "material-1" {
		t.Fatalf("expected legacy metadata fallback, got %#v", relations[0])
	}
}
