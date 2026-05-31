package mysqlmigrations

import (
	"strings"
	"testing"
)

func TestSplitStatementsHandlesCommentsAndQuotedSemicolons(t *testing.T) {
	script := `
-- comment line
CREATE TABLE demo (
  id varchar(36) NOT NULL,
  note text NULL
);

INSERT INTO demo (id, note)
VALUES ('1', 'hello;world');

/* block comment */
INSERT INTO demo (id, note)
VALUES ('2', 'done');
`

	statements, err := splitStatements(script)
	if err != nil {
		t.Fatalf("splitStatements returned error: %v", err)
	}

	if len(statements) != 3 {
		t.Fatalf("expected 3 statements, got %d", len(statements))
	}

	if !strings.Contains(statements[1], "'hello;world'") {
		t.Fatalf("expected quoted semicolon to stay inside statement, got %q", statements[1])
	}
}

func TestEmbeddedInitSchemaIsDiscoverable(t *testing.T) {
	statements, err := splitStatements(mustReadEmbeddedMigration(t, "001_init_schema.sql"))
	if err != nil {
		t.Fatalf("split embedded migration: %v", err)
	}

	if len(statements) == 0 {
		t.Fatal("expected embedded migration statements")
	}

	last := statements[len(statements)-1]
	if !strings.Contains(last, "schema_migrations") {
		t.Fatalf("expected migration marker statement, got %q", last)
	}
}

func TestFilterUpMigrationsSkipsDownFiles(t *testing.T) {
	names := []string{
		"001_init_schema.sql",
		"001_init_schema.down.sql",
		"002_seed_baseline.sql",
		"003_align_current_tables.down.sql",
	}

	filtered := filterUpMigrations(names)
	if len(filtered) != 2 {
		t.Fatalf("expected 2 up migrations, got %d", len(filtered))
	}

	if filtered[0] != "001_init_schema.sql" || filtered[1] != "002_seed_baseline.sql" {
		t.Fatalf("unexpected filtered migrations: %#v", filtered)
	}
}

func mustReadEmbeddedMigration(t *testing.T, name string) string {
	t.Helper()

	content, err := migrationFiles.ReadFile(name)
	if err != nil {
		t.Fatalf("read embedded migration %s: %v", name, err)
	}

	return string(content)
}
