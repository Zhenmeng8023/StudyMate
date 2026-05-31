package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/net/html"

	notemodel "studymate/backend/internal/modules/note/model"
)

const (
	noteSchemaVersion   = 1
	noteDocumentTimeout = 5 * time.Second
	rootHTMLBlockType   = "html"
	rootHTMLBlockID     = "root-html"
	mongoContentSource  = "mysql_html_dual_write"
)

type DocumentRepository struct {
	documents *mongo.Collection
	snapshots *mongo.Collection
}

type NoteContentBlock struct {
	ID       string         `bson:"id"`
	Type     string         `bson:"type"`
	Text     string         `bson:"text,omitempty"`
	HTML     string         `bson:"html,omitempty"`
	Attrs    map[string]any `bson:"attrs,omitempty"`
	Children []any          `bson:"children,omitempty"`
}

type NoteDocument struct {
	NoteID        string             `bson:"note_id"`
	OwnerUserID   string             `bson:"owner_user_id"`
	MaterialID    string             `bson:"material_id,omitempty"`
	FolderName    string             `bson:"folder_name,omitempty"`
	Tags          []string           `bson:"tags,omitempty"`
	Version       int                `bson:"version"`
	SchemaVersion int                `bson:"schema_version"`
	Blocks        []NoteContentBlock `bson:"blocks"`
	HTML          string             `bson:"html"`
	Markdown      string             `bson:"markdown"`
	PlainText     string             `bson:"plain_text"`
	UpdatedAt     time.Time          `bson:"updated_at"`
}

type NoteSnapshot struct {
	NoteID        string             `bson:"note_id"`
	OwnerUserID   string             `bson:"owner_user_id"`
	Version       int                `bson:"version"`
	Title         string             `bson:"title"`
	Summary       string             `bson:"summary,omitempty"`
	MaterialID    string             `bson:"material_id,omitempty"`
	FolderName    string             `bson:"folder_name,omitempty"`
	Tags          []string           `bson:"tags,omitempty"`
	SchemaVersion int                `bson:"schema_version"`
	Blocks        []NoteContentBlock `bson:"blocks"`
	HTML          string             `bson:"html"`
	Markdown      string             `bson:"markdown"`
	PlainText     string             `bson:"plain_text"`
	CreatedAt     time.Time          `bson:"created_at"`
}

func NewDocumentRepository(database *mongo.Database) *DocumentRepository {
	if database == nil {
		return nil
	}

	return &DocumentRepository{
		documents: database.Collection("note_documents"),
		snapshots: database.Collection("note_snapshots"),
	}
}

func (r *DocumentRepository) UpsertCurrent(note *notemodel.Note) error {
	if r == nil || note == nil {
		return nil
	}

	document := BuildNoteDocument(note)

	ctx, cancel := context.WithTimeout(context.Background(), noteDocumentTimeout)
	defer cancel()

	_, err := r.documents.UpdateOne(
		ctx,
		bson.M{"note_id": note.ID},
		bson.M{"$set": document},
		options.Update().SetUpsert(true),
	)
	if err != nil {
		return fmt.Errorf("upsert note document: %w", err)
	}

	return nil
}

func (r *DocumentRepository) CreateSnapshot(note *notemodel.Note, version *notemodel.NoteVersion) error {
	if r == nil || note == nil || version == nil {
		return nil
	}

	snapshot := BuildNoteSnapshot(note, version)

	ctx, cancel := context.WithTimeout(context.Background(), noteDocumentTimeout)
	defer cancel()

	_, err := r.snapshots.UpdateOne(
		ctx,
		bson.M{
			"note_id": version.NoteID,
			"version": version.VersionNumber,
		},
		bson.M{"$set": snapshot},
		options.Update().SetUpsert(true),
	)
	if err != nil {
		return fmt.Errorf("upsert note snapshot: %w", err)
	}

	return nil
}

func (r *DocumentRepository) DeleteNoteArtifacts(noteID string) error {
	if r == nil || noteID == "" {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), noteDocumentTimeout)
	defer cancel()

	if _, err := r.documents.DeleteOne(ctx, bson.M{"note_id": noteID}); err != nil {
		return fmt.Errorf("delete note document: %w", err)
	}

	if _, err := r.snapshots.DeleteMany(ctx, bson.M{"note_id": noteID}); err != nil {
		return fmt.Errorf("delete note snapshots: %w", err)
	}

	return nil
}

func BuildNoteDocument(note *notemodel.Note) bson.M {
	tags := DecodeTags(note.Tags)
	plainText := ExtractPlainText(note.Content)
	now := note.UpdatedAt
	if now.IsZero() {
		now = time.Now()
	}

	document := NoteDocument{
		NoteID:        note.ID,
		OwnerUserID:   note.OwnerUserID,
		MaterialID:    note.MaterialID,
		FolderName:    note.FolderName,
		Tags:          tags,
		Version:       note.VersionNumber,
		SchemaVersion: noteSchemaVersion,
		Blocks:        buildNoteBlocks(note.Content, plainText),
		HTML:          note.Content,
		Markdown:      plainText,
		PlainText:     plainText,
		UpdatedAt:     now,
	}

	return bson.M{
		"note_id":        document.NoteID,
		"owner_user_id":  document.OwnerUserID,
		"material_id":    document.MaterialID,
		"folder_name":    document.FolderName,
		"tags":           document.Tags,
		"version":        document.Version,
		"schema_version": document.SchemaVersion,
		"blocks":         document.Blocks,
		"html":           document.HTML,
		"markdown":       document.Markdown,
		"plain_text":     document.PlainText,
		"updated_at":     document.UpdatedAt,
	}
}

func BuildNoteSnapshot(note *notemodel.Note, version *notemodel.NoteVersion) bson.M {
	tags := DecodeTags(note.Tags)
	plainText := ExtractPlainText(version.Content)
	createdAt := version.CreatedAt
	if createdAt.IsZero() {
		createdAt = time.Now()
	}

	snapshot := NoteSnapshot{
		NoteID:        version.NoteID,
		OwnerUserID:   note.OwnerUserID,
		Version:       version.VersionNumber,
		Title:         version.Title,
		Summary:       version.Summary,
		MaterialID:    note.MaterialID,
		FolderName:    note.FolderName,
		Tags:          tags,
		SchemaVersion: noteSchemaVersion,
		Blocks:        buildNoteBlocks(version.Content, plainText),
		HTML:          version.Content,
		Markdown:      plainText,
		PlainText:     plainText,
		CreatedAt:     createdAt,
	}

	return bson.M{
		"note_id":        snapshot.NoteID,
		"owner_user_id":  snapshot.OwnerUserID,
		"version":        snapshot.Version,
		"title":          snapshot.Title,
		"summary":        snapshot.Summary,
		"material_id":    snapshot.MaterialID,
		"folder_name":    snapshot.FolderName,
		"tags":           snapshot.Tags,
		"schema_version": snapshot.SchemaVersion,
		"blocks":         snapshot.Blocks,
		"html":           snapshot.HTML,
		"markdown":       snapshot.Markdown,
		"plain_text":     snapshot.PlainText,
		"created_at":     snapshot.CreatedAt,
	}
}

func ExtractPlainText(rawHTML string) string {
	trimmed := strings.TrimSpace(rawHTML)
	if trimmed == "" {
		return ""
	}

	node, err := html.Parse(strings.NewReader(trimmed))
	if err != nil {
		return normalizeWhitespace(trimmed)
	}

	var builder strings.Builder
	collectText(node, &builder)

	return normalizeWhitespace(builder.String())
}

func collectText(node *html.Node, builder *strings.Builder) {
	if node == nil {
		return
	}

	if node.Type == html.TextNode {
		text := strings.TrimSpace(node.Data)
		if text != "" {
			if builder.Len() > 0 {
				builder.WriteByte(' ')
			}
			builder.WriteString(text)
		}
	}

	for child := node.FirstChild; child != nil; child = child.NextSibling {
		collectText(child, builder)
	}
}

func normalizeWhitespace(raw string) string {
	return strings.Join(strings.Fields(raw), " ")
}

func buildNoteBlocks(rawHTML string, plainText string) []NoteContentBlock {
	return []NoteContentBlock{
		{
			ID:   rootHTMLBlockID + "-" + uuid.NewString(),
			Type: rootHTMLBlockType,
			Text: plainText,
			HTML: rawHTML,
			Attrs: map[string]any{
				"source": mongoContentSource,
			},
			Children: []any{},
		},
	}
}
