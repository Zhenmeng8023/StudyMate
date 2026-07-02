package dto

import "testing"

func TestNormalizeDocumentPayloadFillsCompatibilityDefaults(t *testing.T) {
	document := NormalizeDocumentPayload("graph-1", 4, GraphDocumentPayload{})

	if document.GraphID != "graph-1" {
		t.Fatalf("expected graph id graph-1, got %q", document.GraphID)
	}

	if document.Version != 4 {
		t.Fatalf("expected version 4, got %d", document.Version)
	}

	if document.SchemaVersion != SupportedGraphSchemaVersion {
		t.Fatalf("expected schema version %d, got %d", SupportedGraphSchemaVersion, document.SchemaVersion)
	}

	if document.Viewport.Zoom != 1 {
		t.Fatalf("expected zoom 1, got %v", document.Viewport.Zoom)
	}

	if document.Nodes == nil || len(document.Nodes) != 0 {
		t.Fatalf("expected empty nodes slice, got %#v", document.Nodes)
	}

	if document.Edges == nil || len(document.Edges) != 0 {
		t.Fatalf("expected empty edges slice, got %#v", document.Edges)
	}

	if document.Groups == nil || len(document.Groups) != 0 {
		t.Fatalf("expected empty groups slice, got %#v", document.Groups)
	}

	if document.Theme == nil {
		t.Fatal("expected theme map to be initialized")
	}

	if document.Metadata == nil {
		t.Fatal("expected metadata map to be initialized")
	}
}

func TestNormalizeDocumentPayloadUsesAuthoritativeGraphIdentityAndVersion(t *testing.T) {
	document := NormalizeDocumentPayload("graph-1", 4, GraphDocumentPayload{
		GraphID:       "stale-graph",
		Version:       2,
		SchemaVersion: SupportedGraphSchemaVersion,
		Viewport:      GraphViewportPayload{X: 8, Y: 9, Zoom: 1.2},
	})

	if document.GraphID != "graph-1" {
		t.Fatalf("expected authoritative graph id graph-1, got %q", document.GraphID)
	}

	if document.Version != 4 {
		t.Fatalf("expected authoritative version 4, got %d", document.Version)
	}

	if document.Viewport.Zoom != 1.2 {
		t.Fatalf("expected viewport zoom to survive, got %v", document.Viewport.Zoom)
	}
}

func TestNewEmptyDocumentPayloadUsesSupportedSchemaVersion(t *testing.T) {
	document := NewEmptyDocumentPayload("graph-2", 9)

	if document.GraphID != "graph-2" {
		t.Fatalf("expected graph id graph-2, got %q", document.GraphID)
	}

	if document.Version != 9 {
		t.Fatalf("expected version 9, got %d", document.Version)
	}

	if document.SchemaVersion != SupportedGraphSchemaVersion {
		t.Fatalf("expected schema version %d, got %d", SupportedGraphSchemaVersion, document.SchemaVersion)
	}

	if document.Viewport.Zoom != 1 {
		t.Fatalf("expected zoom 1, got %v", document.Viewport.Zoom)
	}
}
