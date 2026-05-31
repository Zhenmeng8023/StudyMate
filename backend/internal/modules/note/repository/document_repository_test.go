package repository

import (
	"strings"
	"testing"
	"time"

	notemodel "studymate/backend/internal/modules/note/model"
)

func TestExtractPlainText(t *testing.T) {
	raw := "<h1>标题</h1><p>Hello <strong>world</strong></p><ul><li>one</li><li>two</li></ul>"
	plain := ExtractPlainText(raw)

	expected := "标题 Hello world one two"
	if plain != expected {
		t.Fatalf("expected %q, got %q", expected, plain)
	}
}

func TestBuildNoteDocument(t *testing.T) {
	now := time.Date(2026, 5, 27, 13, 40, 0, 0, time.UTC)
	note := &notemodel.Note{
		ID:            "note-1",
		OwnerUserID:   "user-1",
		Title:         "标题",
		Summary:       "摘要",
		Content:       "<p>正文</p>",
		MaterialID:    "material-1",
		FolderName:    "默认",
		Tags:          `["学习","图谱"]`,
		VersionNumber: 3,
		UpdatedAt:     now,
	}

	document := BuildNoteDocument(note)

	if document["note_id"] != "note-1" {
		t.Fatalf("expected note_id note-1, got %#v", document["note_id"])
	}

	if document["version"] != 3 {
		t.Fatalf("expected version 3, got %#v", document["version"])
	}

	if document["plain_text"] != "正文" {
		t.Fatalf("expected plain_text 正文, got %#v", document["plain_text"])
	}

	blocks, ok := document["blocks"].([]NoteContentBlock)
	if !ok || len(blocks) != 1 {
		t.Fatalf("expected 1 block, got %#v", document["blocks"])
	}

	if !strings.Contains(blocks[0].ID, rootHTMLBlockID) {
		t.Fatalf("expected block id to contain %q, got %q", rootHTMLBlockID, blocks[0].ID)
	}
}
