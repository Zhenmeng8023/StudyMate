package mysqlmigrations

import (
	"embed"
	"fmt"
	"io/fs"
	"sort"
	"strings"

	"gorm.io/gorm"
)

//go:embed *.sql
var migrationFiles embed.FS

func Apply(db *gorm.DB) error {
	names, err := fs.Glob(migrationFiles, "*.sql")
	if err != nil {
		return fmt.Errorf("list mysql migrations: %w", err)
	}

	names = filterUpMigrations(names)
	sort.Strings(names)

	for _, name := range names {
		if err := applyFile(db, name); err != nil {
			return err
		}
	}

	return nil
}

func filterUpMigrations(names []string) []string {
	filtered := make([]string, 0, len(names))
	for _, name := range names {
		if strings.HasSuffix(name, ".down.sql") {
			continue
		}
		filtered = append(filtered, name)
	}

	return filtered
}

func applyFile(db *gorm.DB, name string) error {
	content, err := migrationFiles.ReadFile(name)
	if err != nil {
		return fmt.Errorf("read mysql migration %s: %w", name, err)
	}

	statements, err := splitStatements(string(content))
	if err != nil {
		return fmt.Errorf("parse mysql migration %s: %w", name, err)
	}

	for index, statement := range statements {
		normalized := strings.TrimSpace(statement)
		if normalized == "" {
			continue
		}

		upper := strings.ToUpper(normalized)
		if strings.HasPrefix(upper, "USE ") {
			continue
		}

		if err := db.Exec(normalized).Error; err != nil {
			return fmt.Errorf("execute mysql migration %s statement %d: %w", name, index+1, err)
		}
	}

	return nil
}

func splitStatements(script string) ([]string, error) {
	var statements []string
	var current strings.Builder

	inSingleQuote := false
	inDoubleQuote := false
	inBacktick := false
	inLineComment := false
	inBlockComment := false

	for index := 0; index < len(script); index++ {
		character := script[index]
		next := byte(0)
		if index+1 < len(script) {
			next = script[index+1]
		}

		if inLineComment {
			if character == '\n' {
				inLineComment = false
				current.WriteByte('\n')
			}
			continue
		}

		if inBlockComment {
			if character == '*' && next == '/' {
				inBlockComment = false
				index++
			}
			continue
		}

		if !inSingleQuote && !inDoubleQuote && !inBacktick {
			if character == '-' && next == '-' {
				inLineComment = true
				index++
				continue
			}

			if character == '/' && next == '*' {
				inBlockComment = true
				index++
				continue
			}
		}

		switch character {
		case '\'':
			if !inDoubleQuote && !inBacktick && !isEscaped(script, index) {
				inSingleQuote = !inSingleQuote
			}
		case '"':
			if !inSingleQuote && !inBacktick && !isEscaped(script, index) {
				inDoubleQuote = !inDoubleQuote
			}
		case '`':
			if !inSingleQuote && !inDoubleQuote {
				inBacktick = !inBacktick
			}
		case ';':
			if !inSingleQuote && !inDoubleQuote && !inBacktick {
				statement := strings.TrimSpace(current.String())
				if statement != "" {
					statements = append(statements, statement)
				}
				current.Reset()
				continue
			}
		}

		current.WriteByte(character)
	}

	if inSingleQuote || inDoubleQuote || inBacktick || inBlockComment {
		return nil, fmt.Errorf("unterminated SQL statement")
	}

	statement := strings.TrimSpace(current.String())
	if statement != "" {
		statements = append(statements, statement)
	}

	return statements, nil
}

func isEscaped(script string, index int) bool {
	backslashes := 0
	for position := index - 1; position >= 0; position-- {
		if script[position] != '\\' {
			break
		}
		backslashes++
	}

	return backslashes%2 == 1
}
