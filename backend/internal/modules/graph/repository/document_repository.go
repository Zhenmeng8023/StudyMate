package repository

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	graphdto "studymate/backend/internal/modules/graph/dto"
	graphmodel "studymate/backend/internal/modules/graph/model"
)

const (
	graphDocumentTimeout = 5 * time.Second
)

type DocumentRepository struct {
	documents *mongo.Collection
	snapshots *mongo.Collection
}

type graphDocumentRecord struct {
	ID            string                        `bson:"_id"`
	GraphID       string                        `bson:"graph_id"`
	OwnerUserID   string                        `bson:"owner_user_id"`
	Version       int64                         `bson:"version"`
	SchemaVersion int                           `bson:"schema_version"`
	Viewport      graphdto.GraphViewportPayload `bson:"viewport"`
	Nodes         []graphdto.GraphNodePayload   `bson:"nodes"`
	Edges         []graphdto.GraphEdgePayload   `bson:"edges"`
	Groups        []graphdto.GraphGroupPayload  `bson:"groups"`
	Theme         map[string]any                `bson:"theme,omitempty"`
	Metadata      map[string]any                `bson:"metadata,omitempty"`
	UpdatedAt     time.Time                     `bson:"updated_at"`
}

func NewDocumentRepository(database *mongo.Database) *DocumentRepository {
	if database == nil {
		return nil
	}

	return &DocumentRepository{
		documents: database.Collection("graph_documents"),
		snapshots: database.Collection("graph_snapshots"),
	}
}

func (r *DocumentRepository) UpsertCurrent(graph *graphmodel.Graph, document graphdto.GraphDocumentPayload) error {
	if r == nil || graph == nil {
		return nil
	}

	current := BuildGraphDocument(graph, document)

	ctx, cancel := context.WithTimeout(context.Background(), graphDocumentTimeout)
	defer cancel()

	_, err := r.documents.UpdateOne(
		ctx,
		bson.M{"graph_id": graph.ID},
		bson.M{"$set": current},
		options.Update().SetUpsert(true),
	)
	if err != nil {
		return fmt.Errorf("upsert graph document: %w", err)
	}

	return nil
}

func (r *DocumentRepository) FindCurrent(graphID string) (*graphdto.GraphDocumentPayload, error) {
	if r == nil || graphID == "" {
		return nil, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), graphDocumentTimeout)
	defer cancel()

	var record graphDocumentRecord
	if err := r.documents.FindOne(ctx, bson.M{"graph_id": graphID}).Decode(&record); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, fmt.Errorf("find graph document: %w", err)
	}

	document := graphdto.NormalizeDocumentPayload(graphID, record.Version, graphdto.GraphDocumentPayload{
		GraphID:       record.GraphID,
		Version:       record.Version,
		SchemaVersion: record.SchemaVersion,
		Viewport:      record.Viewport,
		Nodes:         record.Nodes,
		Edges:         record.Edges,
		Groups:        record.Groups,
		Theme:         record.Theme,
		Metadata:      record.Metadata,
		UpdatedAt:     record.UpdatedAt.Format(time.RFC3339),
	})

	return &document, nil
}

func (r *DocumentRepository) CreateSnapshot(graph *graphmodel.Graph, document graphdto.GraphDocumentPayload) (string, error) {
	if r == nil || graph == nil {
		return "", nil
	}

	snapshotID := fmt.Sprintf("%s:%d", graph.ID, document.Version)
	snapshot := BuildGraphSnapshot(graph, document, snapshotID)

	ctx, cancel := context.WithTimeout(context.Background(), graphDocumentTimeout)
	defer cancel()

	_, err := r.snapshots.UpdateOne(
		ctx,
		bson.M{
			"graph_id": graph.ID,
			"version":  document.Version,
		},
		bson.M{"$set": snapshot},
		options.Update().SetUpsert(true),
	)
	if err != nil {
		return "", fmt.Errorf("upsert graph snapshot: %w", err)
	}

	return snapshotID, nil
}

func (r *DocumentRepository) FindSnapshot(graphID string, version int64) (*graphdto.GraphDocumentPayload, error) {
	if r == nil || graphID == "" || version <= 0 {
		return nil, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), graphDocumentTimeout)
	defer cancel()

	var record graphDocumentRecord
	if err := r.snapshots.FindOne(ctx, bson.M{"graph_id": graphID, "version": version}).Decode(&record); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, fmt.Errorf("find graph snapshot: %w", err)
	}

	document := graphdto.NormalizeDocumentPayload(graphID, record.Version, graphdto.GraphDocumentPayload{
		GraphID:       record.GraphID,
		Version:       record.Version,
		SchemaVersion: record.SchemaVersion,
		Viewport:      record.Viewport,
		Nodes:         record.Nodes,
		Edges:         record.Edges,
		Groups:        record.Groups,
		Theme:         record.Theme,
		Metadata:      record.Metadata,
		UpdatedAt:     record.UpdatedAt.Format(time.RFC3339),
	})

	return &document, nil
}

func (r *DocumentRepository) DeleteGraphArtifacts(graphID string) error {
	if r == nil || graphID == "" {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), graphDocumentTimeout)
	defer cancel()

	if _, err := r.documents.DeleteOne(ctx, bson.M{"graph_id": graphID}); err != nil {
		return fmt.Errorf("delete graph document: %w", err)
	}

	if _, err := r.snapshots.DeleteMany(ctx, bson.M{"graph_id": graphID}); err != nil {
		return fmt.Errorf("delete graph snapshots: %w", err)
	}

	return nil
}

func BuildGraphDocument(graph *graphmodel.Graph, document graphdto.GraphDocumentPayload) bson.M {
	now := graph.UpdatedAt
	if now.IsZero() {
		now = time.Now()
	}

	normalized := graphdto.NormalizeDocumentPayload(graph.ID, graph.CurrentVersion, document)

	return bson.M{
		"_id":            graph.ID,
		"graph_id":       graph.ID,
		"owner_user_id":  graph.OwnerUserID,
		"version":        normalized.Version,
		"schema_version": normalized.SchemaVersion,
		"viewport":       normalized.Viewport,
		"nodes":          normalized.Nodes,
		"edges":          normalized.Edges,
		"groups":         normalized.Groups,
		"theme":          normalized.Theme,
		"metadata":       normalized.Metadata,
		"updated_at":     now,
	}
}

func BuildGraphSnapshot(graph *graphmodel.Graph, document graphdto.GraphDocumentPayload, snapshotID string) bson.M {
	now := graph.UpdatedAt
	if now.IsZero() {
		now = time.Now()
	}

	normalized := graphdto.NormalizeDocumentPayload(graph.ID, graph.CurrentVersion, document)

	return bson.M{
		"_id":            snapshotID,
		"graph_id":       graph.ID,
		"owner_user_id":  graph.OwnerUserID,
		"version":        normalized.Version,
		"schema_version": normalized.SchemaVersion,
		"viewport":       normalized.Viewport,
		"nodes":          normalized.Nodes,
		"edges":          normalized.Edges,
		"groups":         normalized.Groups,
		"theme":          normalized.Theme,
		"metadata":       normalized.Metadata,
		"created_at":     now,
	}
}

func ExtractSourceRelations(document graphdto.GraphDocumentPayload) []graphmodel.GraphRelation {
	if len(document.Nodes) == 0 {
		return nil
	}

	seen := make(map[string]struct{})
	relations := make([]graphmodel.GraphRelation, 0, len(document.Nodes))

	for _, node := range document.Nodes {
		if node.Source == nil || node.Source.Type == "" || node.Source.ID == "" {
			continue
		}

		key := node.Source.Type + ":" + node.Source.ID
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}

		relations = append(relations, graphmodel.GraphRelation{
			TargetType:   node.Source.Type,
			TargetID:     node.Source.ID,
			RelationType: graphSourceRelationType,
		})
	}

	return relations
}
