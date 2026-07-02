package main

import (
	"flag"
	"fmt"
	"log"

	"studymate/backend/internal/config"
	mysqlmigrations "studymate/backend/internal/migrations/mysql"
	noterepo "studymate/backend/internal/modules/note/repository"
	"studymate/backend/internal/pkg/database"
)

func main() {
	limit := flag.Int("limit", 0, "maximum notes to backfill; 0 means all")
	flag.Parse()

	cfg := config.Load()
	if err := config.ValidateMySQLConfig(cfg); err != nil {
		log.Fatal(err)
	}
	deps, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("connect dependencies: %v", err)
	}
	if deps.Mongo == nil {
		log.Fatal("mongo is required for note document backfill")
	}
	if err := mysqlmigrations.Apply(deps.SQL); err != nil {
		log.Fatalf("apply mysql migrations: %v", err)
	}

	notes, err := noterepo.NewRepository(deps.SQL).ListAllForBackfill(*limit)
	if err != nil {
		log.Fatalf("list notes: %v", err)
	}

	documents := noterepo.NewDocumentRepository(deps.Mongo)
	for _, note := range notes {
		current := note
		if err := documents.UpsertCurrent(&current); err != nil {
			log.Fatalf("backfill note %s: %v", note.ID, err)
		}
	}

	fmt.Printf("backfilled %d note_documents\n", len(notes))
}
