package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	aidto "studymate/backend/internal/modules/ai/dto"
)

const aiDraftTimeout = 5 * time.Second

type DocumentRepository struct {
	drafts *mongo.Collection
}

type draftRecord struct {
	DraftID     string    `bson:"draft_id"`
	TaskID      string    `bson:"task_id"`
	UserID      string    `bson:"user_id"`
	DraftType   string    `bson:"draft_type"`
	TargetType  string    `bson:"target_type"`
	TargetID    string    `bson:"target_id"`
	Status      string    `bson:"status"`
	SourceType  string    `bson:"source_type,omitempty"`
	SourceID    string    `bson:"source_id,omitempty"`
	SourceLabel string    `bson:"source_label,omitempty"`
	Front       string    `bson:"front"`
	Back        string    `bson:"back"`
	Explanation string    `bson:"explanation,omitempty"`
	Metadata    bson.M    `bson:"metadata,omitempty"`
	CreatedAt   time.Time `bson:"created_at"`
	UpdatedAt   time.Time `bson:"updated_at"`
}

func NewDocumentRepository(database *mongo.Database) *DocumentRepository {
	if database == nil {
		return nil
	}

	return &DocumentRepository{
		drafts: database.Collection("ai_drafts"),
	}
}

func (r *DocumentRepository) CreateDrafts(userID string, taskID string, drafts []aidto.DraftPayload) ([]aidto.DraftPayload, error) {
	if r == nil || len(drafts) == 0 {
		return drafts, nil
	}

	now := time.Now().UTC()
	documents := make([]any, 0, len(drafts))
	result := make([]aidto.DraftPayload, 0, len(drafts))

	for _, draft := range drafts {
		draftID := uuid.NewString()
		record := draftRecord{
			DraftID:     draftID,
			TaskID:      taskID,
			UserID:      userID,
			DraftType:   draft.DraftType,
			TargetType:  draft.TargetType,
			TargetID:    draft.TargetID,
			Status:      "pending",
			SourceType:  draft.SourceType,
			SourceID:    draft.SourceID,
			SourceLabel: draft.SourceLabel,
			Front:       draft.Front,
			Back:        draft.Back,
			Explanation: draft.Explanation,
			Metadata:    toBSONMap(draft.Metadata),
			CreatedAt:   now,
			UpdatedAt:   now,
		}
		documents = append(documents, bson.M{
			"draft_id":     record.DraftID,
			"task_id":      record.TaskID,
			"user_id":      record.UserID,
			"draft_type":   record.DraftType,
			"target_type":  record.TargetType,
			"target_id":    record.TargetID,
			"status":       record.Status,
			"source_type":  record.SourceType,
			"source_id":    record.SourceID,
			"source_label": record.SourceLabel,
			"front":        record.Front,
			"back":         record.Back,
			"explanation":  record.Explanation,
			"metadata":     record.Metadata,
			"created_at":   record.CreatedAt,
			"updated_at":   record.UpdatedAt,
		})
		result = append(result, aidto.DraftPayload{
			ID:          draftID,
			TaskID:      taskID,
			DraftType:   record.DraftType,
			TargetType:  record.TargetType,
			TargetID:    record.TargetID,
			Status:      record.Status,
			SourceType:  record.SourceType,
			SourceID:    record.SourceID,
			SourceLabel: record.SourceLabel,
			Front:       record.Front,
			Back:        record.Back,
			Explanation: record.Explanation,
			Metadata:    toAnyMap(record.Metadata),
			CreatedAt:   record.CreatedAt.Format(time.RFC3339),
			UpdatedAt:   record.UpdatedAt.Format(time.RFC3339),
		})
	}

	ctx, cancel := context.WithTimeout(context.Background(), aiDraftTimeout)
	defer cancel()

	if _, err := r.drafts.InsertMany(ctx, documents); err != nil {
		return nil, fmt.Errorf("insert ai drafts: %w", err)
	}

	return result, nil
}

func (r *DocumentRepository) ListDraftsByUser(userID string, limit int) ([]aidto.DraftPayload, error) {
	if r == nil || userID == "" {
		return nil, nil
	}
	if limit <= 0 {
		limit = 20
	}

	ctx, cancel := context.WithTimeout(context.Background(), aiDraftTimeout)
	defer cancel()

	options := options.Find().
		SetSort(bson.D{{Key: "updated_at", Value: -1}}).
		SetLimit(int64(limit))

	cursor, err := r.drafts.Find(ctx, bson.M{"user_id": userID}, options)
	if err != nil {
		return nil, fmt.Errorf("find ai drafts: %w", err)
	}
	defer cursor.Close(ctx)

	var records []draftRecord
	if err := cursor.All(ctx, &records); err != nil {
		return nil, fmt.Errorf("decode ai drafts: %w", err)
	}

	result := make([]aidto.DraftPayload, 0, len(records))
	for _, record := range records {
		result = append(result, aidto.DraftPayload{
			ID:          record.DraftID,
			TaskID:      record.TaskID,
			DraftType:   record.DraftType,
			TargetType:  record.TargetType,
			TargetID:    record.TargetID,
			Status:      record.Status,
			SourceType:  record.SourceType,
			SourceID:    record.SourceID,
			SourceLabel: record.SourceLabel,
			Front:       record.Front,
			Back:        record.Back,
			Explanation: record.Explanation,
			Metadata:    toAnyMap(record.Metadata),
			CreatedAt:   record.CreatedAt.Format(time.RFC3339),
			UpdatedAt:   record.UpdatedAt.Format(time.RFC3339),
		})
	}

	return result, nil
}

func (r *DocumentRepository) ListDraftsByIDs(userID string, draftIDs []string) ([]aidto.DraftPayload, error) {
	if r == nil || userID == "" || len(draftIDs) == 0 {
		return nil, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), aiDraftTimeout)
	defer cancel()

	cursor, err := r.drafts.Find(ctx, bson.M{
		"user_id":  userID,
		"draft_id": bson.M{"$in": draftIDs},
	}, options.Find().SetSort(bson.D{{Key: "created_at", Value: 1}}))
	if err != nil {
		return nil, fmt.Errorf("find ai drafts by ids: %w", err)
	}
	defer cursor.Close(ctx)

	var records []draftRecord
	if err := cursor.All(ctx, &records); err != nil {
		return nil, fmt.Errorf("decode ai drafts by ids: %w", err)
	}

	result := make([]aidto.DraftPayload, 0, len(records))
	for _, record := range records {
		result = append(result, aidto.DraftPayload{
			ID:          record.DraftID,
			TaskID:      record.TaskID,
			DraftType:   record.DraftType,
			TargetType:  record.TargetType,
			TargetID:    record.TargetID,
			Status:      record.Status,
			SourceType:  record.SourceType,
			SourceID:    record.SourceID,
			SourceLabel: record.SourceLabel,
			Front:       record.Front,
			Back:        record.Back,
			Explanation: record.Explanation,
			Metadata:    toAnyMap(record.Metadata),
			CreatedAt:   record.CreatedAt.Format(time.RFC3339),
			UpdatedAt:   record.UpdatedAt.Format(time.RFC3339),
		})
	}

	return result, nil
}

func (r *DocumentRepository) ConfirmDrafts(userID string, draftIDs []string) error {
	if r == nil || userID == "" || len(draftIDs) == 0 {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), aiDraftTimeout)
	defer cancel()

	_, err := r.drafts.UpdateMany(
		ctx,
		bson.M{
			"user_id":  userID,
			"draft_id": bson.M{"$in": draftIDs},
		},
		bson.M{
			"$set": bson.M{
				"status":     "confirmed",
				"updated_at": time.Now().UTC(),
			},
		},
	)
	if err != nil {
		return fmt.Errorf("confirm ai drafts: %w", err)
	}

	return nil
}

func (r *DocumentRepository) UpdateDraftMetadata(userID string, draftID string, metadata map[string]any) error {
	if r == nil || userID == "" || draftID == "" {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), aiDraftTimeout)
	defer cancel()

	_, err := r.drafts.UpdateOne(
		ctx,
		bson.M{
			"user_id":  userID,
			"draft_id": draftID,
		},
		bson.M{
			"$set": bson.M{
				"metadata":   toBSONMap(metadata),
				"updated_at": time.Now().UTC(),
			},
		},
	)
	if err != nil {
		return fmt.Errorf("update ai draft metadata: %w", err)
	}

	return nil
}

func toBSONMap(input map[string]any) bson.M {
	if len(input) == 0 {
		return nil
	}

	result := make(bson.M, len(input))
	for key, value := range input {
		result[key] = value
	}
	return result
}

func toAnyMap(input bson.M) map[string]any {
	if len(input) == 0 {
		return nil
	}

	result := make(map[string]any, len(input))
	for key, value := range input {
		result[key] = value
	}
	return result
}
