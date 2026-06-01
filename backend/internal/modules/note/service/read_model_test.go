package service

import "testing"

func TestResolveNoteReadModel(t *testing.T) {
	t.Parallel()

	if got := ResolveNoteReadModel("mongo_primary"); got != NoteReadModelMongoPrimary {
		t.Fatalf("expected mongo_primary, got %s", got)
	}

	if got := ResolveNoteReadModel(""); got != NoteReadModelMySQLPrimary {
		t.Fatalf("expected mysql_primary fallback, got %s", got)
	}

	if got := ResolveNoteReadModel("unknown"); got != NoteReadModelMySQLPrimary {
		t.Fatalf("expected mysql_primary for unknown value, got %s", got)
	}
}
