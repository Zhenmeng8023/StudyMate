package main

import (
	"log"

	"studymate/backend/internal/app"
	"studymate/backend/internal/config"
)

func main() {
	cfg := config.Load()

	server, err := app.NewServer(cfg)
	if err != nil {
		log.Fatalf("failed to bootstrap server: %v", err)
	}

	if err := server.Run(); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}
