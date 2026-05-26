package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	App       AppConfig
	Auth      AuthConfig
	Database  DatabaseConfig
	Mongo     MongoConfig
	Redis     RedisConfig
	Storage   StorageConfig
	Bootstrap BootstrapConfig
}

type AppConfig struct {
	Env  string
	Name string
	Port string
}

type AuthConfig struct {
	JWTSecret       string
	AccessTokenTTL  time.Duration
	RefreshTokenTTL time.Duration
}

type DatabaseConfig struct {
	Driver   string
	MySQLDSN string
}

type MongoConfig struct {
	URI            string
	Database       string
	ConnectTimeout time.Duration
}

type RedisConfig struct {
	Addr           string
	Password       string
	DB             int
	ConnectTimeout time.Duration
}

type StorageConfig struct {
	UploadDir string
}

type BootstrapConfig struct {
	AdminUsername string
	AdminEmail    string
	AdminPassword string
}

func Load() Config {
	return Config{
		App: AppConfig{
			Env:  getEnv("APP_ENV", "development"),
			Name: getEnv("APP_NAME", "学伴图谱"),
			Port: getEnv("APP_PORT", "8023"),
		},
		Auth: AuthConfig{
			JWTSecret:       getEnv("JWT_SECRET", "change-me-in-local-env"),
			AccessTokenTTL:  getDurationEnv("JWT_ACCESS_TTL", 2*time.Hour),
			RefreshTokenTTL: getDurationEnv("JWT_REFRESH_TTL", 7*24*time.Hour),
		},
		Database: DatabaseConfig{
			Driver:   getEnv("DB_DRIVER", "mysql"),
			MySQLDSN: getEnv("MYSQL_DSN", "root:123456@tcp(127.0.0.1:3306)/studymate?charset=utf8mb4&parseTime=True&loc=Local"),
		},
		Mongo: MongoConfig{
			URI:            getEnv("MONGO_URI", "mongodb://127.0.0.1:27017"),
			Database:       getEnv("MONGO_DATABASE", "studymate_content"),
			ConnectTimeout: getDurationEnv("MONGO_TIMEOUT", 3*time.Second),
		},
		Redis: RedisConfig{
			Addr:           getEnv("REDIS_ADDR", "127.0.0.1:6379"),
			Password:       getEnv("REDIS_PASSWORD", ""),
			DB:             getIntEnv("REDIS_DB", 0),
			ConnectTimeout: getDurationEnv("REDIS_TIMEOUT", 2*time.Second),
		},
		Storage: StorageConfig{
			UploadDir: getEnv("UPLOAD_DIR", "../storage/uploads"),
		},
		Bootstrap: BootstrapConfig{
			AdminUsername: getEnv("ADMIN_BOOTSTRAP_USERNAME", ""),
			AdminEmail:    getEnv("ADMIN_BOOTSTRAP_EMAIL", ""),
			AdminPassword: getEnv("ADMIN_BOOTSTRAP_PASSWORD", ""),
		},
	}
}

func getEnv(key string, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}

func getIntEnv(key string, fallback int) int {
	value := getEnv(key, "")
	if value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}

	return parsed
}

func getDurationEnv(key string, fallback time.Duration) time.Duration {
	value := getEnv(key, "")
	if value == "" {
		return fallback
	}

	parsed, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}

	return parsed
}
