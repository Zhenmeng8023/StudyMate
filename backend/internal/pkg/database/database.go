package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/go-redis/redis/v8"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"studymate/backend/internal/config"
)

type DependencyStatus struct {
	SQL   string `json:"sql"`
	Redis string `json:"redis"`
	Mongo string `json:"mongo"`
	Mode  string `json:"mode"`
}

type Dependencies struct {
	SQL    *gorm.DB
	Redis  *redis.Client
	Mongo  *mongo.Database
	Status DependencyStatus
}

func Connect(cfg config.Config) (*Dependencies, error) {
	if err := ensureDir(cfg.Storage.UploadDir); err != nil {
		return nil, err
	}

	sqlDB, mode, err := openSQL(cfg.Database)
	if err != nil {
		return nil, err
	}

	deps := &Dependencies{
		SQL: sqlDB,
		Status: DependencyStatus{
			SQL:   "up",
			Redis: "down",
			Mongo: "down",
			Mode:  mode,
		},
	}

	redisClient, err := connectRedis(cfg.Redis)
	if err != nil {
		log.Printf("redis unavailable: %v", err)
	} else {
		deps.Redis = redisClient
		deps.Status.Redis = "up"
	}

	mongoDB, err := connectMongo(cfg.Mongo)
	if err != nil {
		log.Printf("mongo unavailable: %v", err)
	} else {
		deps.Mongo = mongoDB
		deps.Status.Mongo = "up"
	}

	return deps, nil
}

func openSQL(cfg config.DatabaseConfig) (*gorm.DB, string, error) {
	if cfg.Driver != "mysql" {
		return nil, "", fmt.Errorf("unsupported DB_DRIVER: %s; StudyMate uses mysql", cfg.Driver)
	}

	if cfg.MySQLDSN == "" {
		return nil, "", fmt.Errorf("mysql driver selected but MYSQL_DSN is empty")
	}

	db, err := gorm.Open(mysql.Open(cfg.MySQLDSN), &gorm.Config{})
	if err != nil {
		return nil, "", fmt.Errorf("connect mysql failed: %w", err)
	}

	return db, "mysql", nil
}

func connectRedis(cfg config.RedisConfig) (*redis.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), cfg.ConnectTimeout)
	defer cancel()

	client := redis.NewClient(&redis.Options{
		Addr:     cfg.Addr,
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	return client, nil
}

func connectMongo(cfg config.MongoConfig) (*mongo.Database, error) {
	ctx, cancel := context.WithTimeout(context.Background(), cfg.ConnectTimeout)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.URI))
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	return client.Database(cfg.Database), nil
}

func ensureDir(path string) error {
	if path == "" || path == "." {
		return nil
	}

	return os.MkdirAll(path, 0o755)
}
