package dto

const SupportedGraphSchemaVersion = 1

func NormalizeDocumentPayload(graphID string, version int64, document GraphDocumentPayload) GraphDocumentPayload {
	document.GraphID = graphID
	document.Version = version
	if document.SchemaVersion == 0 {
		document.SchemaVersion = SupportedGraphSchemaVersion
	}
	if document.Viewport.Zoom == 0 {
		document.Viewport.Zoom = 1
	}
	if document.Nodes == nil {
		document.Nodes = []GraphNodePayload{}
	}
	if document.Edges == nil {
		document.Edges = []GraphEdgePayload{}
	}
	if document.Groups == nil {
		document.Groups = []GraphGroupPayload{}
	}
	if document.Theme == nil {
		document.Theme = map[string]any{}
	}
	if document.Metadata == nil {
		document.Metadata = map[string]any{}
	}

	return document
}

func NewEmptyDocumentPayload(graphID string, version int64) GraphDocumentPayload {
	return NormalizeDocumentPayload(graphID, version, GraphDocumentPayload{
		GraphID:       graphID,
		Version:       version,
		SchemaVersion: SupportedGraphSchemaVersion,
		Viewport: GraphViewportPayload{
			X:    0,
			Y:    0,
			Zoom: 1,
		},
		Nodes:    []GraphNodePayload{},
		Edges:    []GraphEdgePayload{},
		Groups:   []GraphGroupPayload{},
		Theme:    map[string]any{},
		Metadata: map[string]any{},
	})
}
