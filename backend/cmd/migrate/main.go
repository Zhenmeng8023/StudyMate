package main

import (
	"log"

	"studymate/backend/internal/config"
	mysqlmigrations "studymate/backend/internal/migrations/mysql"
	"studymate/backend/internal/pkg/database"
)

func main() {
	cfg := config.Load()
	if err := config.ValidateMySQLConfig(cfg); err != nil {
		log.Fatal(err)
	}

	sqlDB, _, err := database.ConnectPrimarySQL(cfg.Database)
	if err != nil {
		log.Fatalf("failed to connect mysql: %v", err)
	}

	if err := mysqlmigrations.Apply(sqlDB); err != nil {
		log.Fatalf("failed to apply mysql migrations: %v", err)
	}

	log.Println("mysql migrations applied successfully")
}
