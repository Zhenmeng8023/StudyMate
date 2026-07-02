package config

import (
	"github.com/joho/godotenv"
	"log"
	"os"
	"strconv"
	"strings"
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
	Content   ContentConfig
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

type ContentConfig struct {
	NoteReadModel string
}

func Load() Config {

	// 尝试加载项目根目录的 .env 文件（从 backend 目录向上一级）
	if err := godotenv.Load("../.env"); err != nil {
		log.Printf("warning: failed to load .env file: %v", err)
	}

	return Config{
		App: AppConfig{
			Env:  getEnv("APP_ENV", "development"),
			Name: getEnv("APP_NAME", "学伴图谱"),
			Port: getEnv("APP_PORT", "8023"),
		},
		Auth: AuthConfig{
			JWTSecret:       getEnv("JWT_SECRET", ""),
			AccessTokenTTL:  getDurationEnv("JWT_ACCESS_TTL", 2*time.Hour),
			RefreshTokenTTL: getDurationEnv("JWT_REFRESH_TTL", 7*24*time.Hour),
		},
		Database: DatabaseConfig{
			Driver:   getEnv("DB_DRIVER", "mysql"),
			MySQLDSN: getEnv("MYSQL_DSN", ""),
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
		Content: ContentConfig{
			NoteReadModel: getEnv("NOTE_READ_MODEL", "mysql_primary"),
		},
	}
}

type ValidationError struct {
	issues []string
}

func (e *ValidationError) Error() string {
	return "invalid configuration: " + strings.Join(e.issues, "; ")
}

func ValidateMySQLConfig(cfg Config) error {
	issues := make([]string, 0, 2)

	driver := strings.TrimSpace(cfg.Database.Driver)
	if driver == "" {
		issues = append(issues, "DB_DRIVER is required")
	} else if driver != "mysql" {
		issues = append(issues, "DB_DRIVER must be mysql")
	}

	if strings.TrimSpace(cfg.Database.MySQLDSN) == "" {
		issues = append(issues, "MYSQL_DSN is required")
	}

	return buildValidationError(issues)
}

func ValidateServerConfig(cfg Config) error {
	issues := make([]string, 0, 5)

	if err := ValidateMySQLConfig(cfg); err != nil {
		if validationErr, ok := err.(*ValidationError); ok {
			issues = append(issues, validationErr.issues...)
		} else {
			issues = append(issues, err.Error())
		}
	}

	secret := strings.TrimSpace(cfg.Auth.JWTSecret)
	if secret == "" {
		issues = append(issues, "JWT_SECRET is required")
	} else if isPlaceholderValue(secret) {
		issues = append(issues, "JWT_SECRET must be replaced with a non-placeholder secret")
	}

	bootstrapValues := []string{
		strings.TrimSpace(cfg.Bootstrap.AdminUsername),
		strings.TrimSpace(cfg.Bootstrap.AdminEmail),
		strings.TrimSpace(cfg.Bootstrap.AdminPassword),
	}

	hasBootstrapValue := false
	hasBlankBootstrapValue := false
	for _, value := range bootstrapValues {
		if value != "" {
			hasBootstrapValue = true
		} else {
			hasBlankBootstrapValue = true
		}
	}

	if hasBootstrapValue && hasBlankBootstrapValue {
		issues = append(issues, "set all ADMIN_BOOTSTRAP_* values or leave all of them empty")
	}

	if bootstrapValues[2] != "" && isPlaceholderValue(bootstrapValues[2]) {
		issues = append(issues, "ADMIN_BOOTSTRAP_PASSWORD must be replaced before bootstrap is enabled")
	}

	return buildValidationError(issues)
}

func buildValidationError(issues []string) error {
	if len(issues) == 0 {
		return nil
	}

	return &ValidationError{issues: issues}
}

func isPlaceholderValue(value string) bool {
	normalized := strings.ToLower(strings.TrimSpace(value))
	if normalized == "" {
		return false
	}

	return strings.Contains(normalized, "change-me") || strings.Contains(normalized, "example") || strings.Contains(normalized, "replace-me")
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
